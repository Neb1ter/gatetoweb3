import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("faq.list", () => {
  it("returns an array (no search)", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.faq.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns an array with search query", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.faq.list({ search: "杠杆" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("each faq item has required fields", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.faq.list({});
    if (result.length > 0) {
      const item = result[0];
      expect(item).toHaveProperty("question");
      expect(item).toHaveProperty("answer");
      expect(item).toHaveProperty("category");
    }
  });
});

describe("news.list", () => {
  it("returns an array of news items", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.news.list({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("respects limit parameter", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.news.list({ limit: 5 });
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it("each news item has required fields", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.news.list({ limit: 3 });
    if (result.length > 0) {
      const item = result[0];
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("source");
      expect(item).toHaveProperty("category");
      expect(item).toHaveProperty("publishedAt");
    }
  });
});
