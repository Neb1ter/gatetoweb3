/**
 * Tests for exchange feature categories and support seed logic.
 * Verifies that DEFAULT_FEATURE_CATEGORIES and DEFAULT_FEATURE_SUPPORT
 * contain the expected data for the /exchange-guide page.
 */
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("exchangeGuide.categories (no-db fallback)", () => {
  it("returns 13 feature categories", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const categories = await caller.exchangeGuide.categories();
    expect(categories.length).toBe(14); // 新增 margin 杠杆交易章节
  });

  it("all categories have required fields", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const categories = await caller.exchangeGuide.categories();
    for (const cat of categories) {
      expect(cat.slug).toBeTruthy();
      expect(cat.nameZh).toBeTruthy();
      expect(cat.nameEn).toBeTruthy();
      expect(cat.icon).toBeTruthy();
      expect(cat.descZh).toBeTruthy();
      expect(cat.descEn).toBeTruthy();
      expect(["beginner", "intermediate", "advanced"]).toContain(cat.difficulty);
    }
  });

  it("includes key categories: spot, futures, copy_trading, earn, launchpad", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const categories = await caller.exchangeGuide.categories();
    const slugs = categories.map((c) => c.slug);
    expect(slugs).toContain("spot");
    expect(slugs).toContain("futures");
    expect(slugs).toContain("copy_trading");
    expect(slugs).toContain("earn");
    expect(slugs).toContain("launchpad");
  });
});

describe("exchangeGuide.featureSupport (no-db fallback)", () => {
  it("returns 5 exchange entries for 'spot' feature", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const supports = await caller.exchangeGuide.featureSupport({ featureSlug: "spot" });
    expect(supports.length).toBe(5);
  });

  it("all support entries have required fields", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const supports = await caller.exchangeGuide.featureSupport({ featureSlug: "futures" });
    for (const s of supports) {
      expect(s.exchangeSlug).toBeTruthy();
      expect(s.featureSlug).toBe("futures");
      expect(s.levelZh).toBeTruthy();
      expect(s.levelEn).toBeTruthy();
      expect(s.detailZh).toBeTruthy();
      expect(s.detailEn).toBeTruthy();
    }
  });

  it("copy_trading: Gate.io is marked as not supported", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const supports = await caller.exchangeGuide.featureSupport({ featureSlug: "copy_trading" });
    const gate = supports.find((s) => s.exchangeSlug === "gate");
    expect(gate).toBeDefined();
    expect(gate?.supported).toBe(0);
  });

  it("copy_trading: Bitget is marked as highlighted (industry #1)", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const supports = await caller.exchangeGuide.featureSupport({ featureSlug: "copy_trading" });
    const bitget = supports.find((s) => s.exchangeSlug === "bitget");
    expect(bitget).toBeDefined();
    expect(bitget?.highlight).toBe(1);
  });
});

describe("exchangeGuide.exchangeFeatures (no-db fallback)", () => {
  it("returns features for binance across multiple categories", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const features = await caller.exchangeGuide.exchangeFeatures({ exchangeSlug: "binance" });
    expect(features.length).toBeGreaterThan(5);
    const slugs = features.map((f) => f.featureSlug);
    expect(slugs).toContain("spot");
    expect(slugs).toContain("futures");
    expect(slugs).toContain("earn");
  });
});
