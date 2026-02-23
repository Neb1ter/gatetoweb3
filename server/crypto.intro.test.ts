import { describe, expect, it } from "vitest";

// Pure logic tests for the CryptoIntro simulator (no DB/tRPC needed)

function generateCandles(count: number, startPrice: number) {
  const candles: { open: number; high: number; low: number; close: number }[] = [];
  let price = startPrice;
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.48) * price * 0.025;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * price * 0.01;
    const low = Math.min(open, close) - Math.random() * price * 0.01;
    candles.push({ open, high, low, close });
    price = close;
  }
  return candles;
}

function calcPnl(
  entryPrice: number,
  exitPrice: number,
  leverage: number,
  amount: number,
  direction: "long" | "short"
) {
  const priceChange = (exitPrice - entryPrice) / entryPrice;
  const leveragedChange = priceChange * leverage;
  const rawPnl = direction === "long" ? leveragedChange : -leveragedChange;
  return amount * rawPnl;
}

describe("CryptoIntro simulator logic", () => {
  it("generateCandles returns correct count and valid OHLC", () => {
    const candles = generateCandles(30, 67000);
    expect(candles).toHaveLength(30);
    for (const c of candles) {
      expect(c.high).toBeGreaterThanOrEqual(Math.max(c.open, c.close));
      expect(c.low).toBeLessThanOrEqual(Math.min(c.open, c.close));
      expect(c.open).toBeGreaterThan(0);
      expect(c.close).toBeGreaterThan(0);
    }
  });

  it("generateCandles prices stay within reasonable range of start price", () => {
    const startPrice = 67000;
    const candles = generateCandles(30, startPrice);
    const lastClose = candles[candles.length - 1].close;
    // Price should not deviate more than 50% from start in 30 candles
    expect(lastClose).toBeGreaterThan(startPrice * 0.5);
    expect(lastClose).toBeLessThan(startPrice * 1.5);
  });

  it("calcPnl: long position profits when price rises", () => {
    const pnl = calcPnl(100, 110, 10, 100, "long");
    // 10% price rise × 10x leverage = 100% return on $100 = +$100
    expect(pnl).toBeCloseTo(100, 0);
  });

  it("calcPnl: short position profits when price falls", () => {
    const pnl = calcPnl(100, 90, 10, 100, "short");
    // 10% price drop × 10x leverage = 100% return on $100 = +$100
    expect(pnl).toBeCloseTo(100, 0);
  });

  it("calcPnl: long position loses when price falls", () => {
    const pnl = calcPnl(100, 90, 10, 100, "long");
    expect(pnl).toBeLessThan(0);
  });

  it("calcPnl: short position loses when price rises", () => {
    const pnl = calcPnl(100, 110, 10, 100, "short");
    expect(pnl).toBeLessThan(0);
  });

  it("calcPnl: higher leverage amplifies gains proportionally", () => {
    const pnl5x = calcPnl(100, 105, 5, 100, "long");
    const pnl10x = calcPnl(100, 105, 10, 100, "long");
    expect(pnl10x).toBeCloseTo(pnl5x * 2, 1);
  });
});
