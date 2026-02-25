/**
 * Chat API Handler
 *
 * Express endpoint for AI SDK streaming chat with tool calling support.
 * Uses patched fetch to fix OpenAI-compatible proxy issues.
 */

import { streamText, stepCountIs } from "ai";
import { tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { Express } from "express";
import { z } from "zod/v4";
import { ENV } from "./env";
import { createPatchedFetch } from "./patchedFetch";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4096;

function createLLMProvider() {
  const baseURL = ENV.forgeApiUrl.endsWith("/v1")
    ? ENV.forgeApiUrl
    : `${ENV.forgeApiUrl}/v1`;

  return createOpenAI({
    baseURL,
    apiKey: ENV.forgeApiKey,
    fetch: createPatchedFetch(fetch),
  });
}

/**
 * Safe math evaluator that only supports basic arithmetic.
 * Does NOT use Function() or eval().
 */
function safeEvaluate(expr: string): number {
  const sanitized = expr.replace(/\s+/g, "");
  if (!/^[0-9+\-*/().%]+$/.test(sanitized)) {
    throw new Error("Invalid characters in expression");
  }
  if (sanitized.length > 200) {
    throw new Error("Expression too long");
  }
  return parseFloat(evaluateTokens(sanitized));
}

function evaluateTokens(expr: string): string {
  // Resolve parentheses first (innermost)
  while (expr.includes("(")) {
    expr = expr.replace(/\(([^()]+)\)/g, (_, inner) => evaluateTokens(inner));
  }
  // Split into tokens respecting negative numbers
  const tokens: string[] = [];
  let current = "";
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if ("+-*/%".includes(ch) && current.length > 0) {
      tokens.push(current, ch);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);

  // * / % first
  for (let i = 1; i < tokens.length; i += 2) {
    if ("*/%".includes(tokens[i])) {
      const left = parseFloat(tokens[i - 1]);
      const right = parseFloat(tokens[i + 1]);
      let result: number;
      if (tokens[i] === "*") result = left * right;
      else if (tokens[i] === "/") {
        if (right === 0) throw new Error("Division by zero");
        result = left / right;
      } else result = left % right;
      tokens.splice(i - 1, 3, String(result));
      i -= 2;
    }
  }
  // + - second
  let result = parseFloat(tokens[0]);
  for (let i = 1; i < tokens.length; i += 2) {
    const right = parseFloat(tokens[i + 1]);
    if (tokens[i] === "+") result += right;
    else result -= right;
  }
  return String(result);
}

const tools = {
  getWeather: tool({
    description: "Get the current weather for a location",
    inputSchema: z.object({
      location: z
        .string()
        .describe("The city and country, e.g. 'Tokyo, Japan'"),
      unit: z.enum(["celsius", "fahrenheit"]).optional().default("celsius"),
    }),
    execute: async ({ location, unit }) => {
      const temp = Math.floor(Math.random() * 30) + 5;
      const conditions = ["sunny", "cloudy", "rainy", "partly cloudy"][
        Math.floor(Math.random() * 4)
      ] as string;
      return {
        location,
        temperature: unit === "fahrenheit" ? Math.round(temp * 1.8 + 32) : temp,
        unit,
        conditions,
        humidity: Math.floor(Math.random() * 50) + 30,
      };
    },
  }),

  calculate: tool({
    description: "Perform a mathematical calculation",
    inputSchema: z.object({
      expression: z
        .string()
        .max(200)
        .describe("The math expression to evaluate, e.g. '2 + 2'"),
    }),
    execute: async ({ expression }) => {
      try {
        const result = safeEvaluate(expression);
        if (!isFinite(result)) return { expression, error: "Result is not finite" };
        return { expression, result };
      } catch {
        return { expression, error: "Invalid expression" };
      }
    },
  }),
};

export function registerChatRoutes(app: Express) {
  const openai = createLLMProvider();

  app.post("/api/chat", async (req, res) => {
    try {
      // Optional authentication: if the user has a session, verify it
      const cookies = req.headers.cookie
        ? new Map(Object.entries(parseCookieHeader(req.headers.cookie)))
        : new Map<string, string>();
      const sessionCookie = cookies.get(COOKIE_NAME);
      const session = await sdk.verifySession(sessionCookie);

      if (!session) {
        res.status(401).json({ error: "Authentication required for chat API" });
        return;
      }

      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "messages array is required" });
        return;
      }

      if (messages.length > MAX_MESSAGES) {
        res.status(400).json({ error: `Maximum ${MAX_MESSAGES} messages allowed` });
        return;
      }

      for (const msg of messages) {
        if (typeof msg.content === "string" && msg.content.length > MAX_MESSAGE_LENGTH) {
          res.status(400).json({ error: `Message content exceeds ${MAX_MESSAGE_LENGTH} character limit` });
          return;
        }
      }

      const result = streamText({
        model: openai.chat("gpt-4o"),
        system:
          "You are a helpful assistant. You have access to tools for getting weather and doing calculations. Use them when appropriate.",
        messages,
        tools,
        stopWhen: stepCountIs(5),
      });

      result.pipeUIMessageStreamToResponse(res);
    } catch (error) {
      console.error("[/api/chat] Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
}

export { tools };
