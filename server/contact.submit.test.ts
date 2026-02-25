import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  submitContactForm: vi.fn().mockResolvedValue(undefined),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("contact.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should accept valid contact form submission", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      platform: "telegram",
      accountName: "@testuser",
      exchangeUid: "12345678",
      exchangeUsername: "testtrader",
      message: "I want to configure rebates for Gate.io",
    });

    expect(result).toEqual({ success: true });
  });

  it("should accept minimal required fields only", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      platform: "wechat",
      accountName: "wxid_testuser",
    });

    expect(result).toEqual({ success: true });
  });

  it("should reject empty platform", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        platform: "",
        accountName: "@testuser",
      })
    ).rejects.toThrow();
  });

  it("should reject empty accountName", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.submit({
        platform: "telegram",
        accountName: "",
      })
    ).rejects.toThrow();
  });
});
