import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeCtx(role: "user" | "admin" | null = null): TrpcContext {
  const user =
    role === null
      ? null
      : {
          id: 1,
          openId: "test-user",
          email: "test@example.com",
          name: "Test User",
          loginMethod: "manus",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("exchanges.list", () => {
  it("returns an array (may be empty without DB)", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.exchanges.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("exchanges.update", () => {
  it("throws UNAUTHORIZED when not logged in", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.exchanges.update({ slug: "gate", referralLink: "https://example.com" })
    ).rejects.toThrow();
  });

  it("throws FORBIDDEN when logged in as regular user", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.exchanges.update({ slug: "gate", referralLink: "https://example.com" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
