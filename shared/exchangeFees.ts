/**
 * shared/exchangeFees.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * 全站统一手续费数据源（Single Source of Truth）
 *
 * 修改手续费时，只需更新此文件，所有引用此文件的页面会自动同步。
 * 引用方式：
 *   import { EXCHANGE_FEES, FEE_MATRIX } from "@shared/exchangeFees";
 *
 * 最后更新：2026-02
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type ExchangeSlug = "gate" | "okx" | "binance" | "bybit" | "bitget";

export interface ExchangeFeeData {
  /** 现货挂单（Maker）手续费 */
  spotMaker: string;
  /** 现货吃单（Taker）手续费 */
  spotTaker: string;
  /** 合约挂单（Maker）手续费 */
  futMaker: string;
  /** 合约吃单（Taker）手续费 */
  futTaker: string;
  /** 最高返佣比例 */
  rebateRate: string;
}

/**
 * 各交易所手续费数据
 * 顺序与全站展示顺序一致：gate → okx → binance → bybit → bitget
 */
export const EXCHANGE_FEES: Record<ExchangeSlug, ExchangeFeeData> = {
  gate: {
    spotMaker: "0.15%",
    spotTaker: "0.15%",
    futMaker:  "0.02%",
    futTaker:  "0.05%",
    rebateRate: "60%",
  },
  okx: {
    spotMaker: "0.08%",
    spotTaker: "0.10%",
    futMaker:  "0.02%",
    futTaker:  "0.05%",
    rebateRate: "20%",
  },
  binance: {
    spotMaker: "0.10%",
    spotTaker: "0.10%",
    futMaker:  "0.02%",
    futTaker:  "0.04%",
    rebateRate: "20%",
  },
  bybit: {
    spotMaker: "0.10%",
    spotTaker: "0.10%",
    futMaker:  "0.01%",
    futTaker:  "0.055%",
    rebateRate: "30%",
  },
  bitget: {
    spotMaker: "0.02%",
    spotTaker: "0.06%",
    futMaker:  "0.02%",
    futTaker:  "0.06%",
    rebateRate: "50%",
  },
};

/** 交易所顺序（全站统一，用于对比矩阵列顺序） */
export const EXCHANGE_ORDER: ExchangeSlug[] = ["gate", "okx", "binance", "bybit", "bitget"];

/**
 * 现货 Maker 费对比矩阵行数据（含最优标注）
 * 用于 Exchanges.tsx 和 ExchangeGuide.tsx 的对比表格
 */
export const SPOT_MAKER_ROW = EXCHANGE_ORDER.map((slug, i) => {
  const fee = EXCHANGE_FEES[slug].spotMaker;
  // Bitget 和 OKX 是最低现货 Maker 费
  const isBest = slug === "bitget" || slug === "okx";
  return isBest ? `${fee} ⭐` : fee;
});

/**
 * 合约 Maker 费对比矩阵行数据（含最优标注）
 */
export const FUT_MAKER_ROW = EXCHANGE_ORDER.map((slug) => {
  const fee = EXCHANGE_FEES[slug].futMaker;
  // Bybit 合约 Maker 费最低
  const isBest = slug === "bybit";
  return isBest ? `${fee} ⭐` : fee;
});

/**
 * 返佣比例对比矩阵行数据（含最优标注）
 */
export const REBATE_ROW = EXCHANGE_ORDER.map((slug) => {
  const rate = EXCHANGE_FEES[slug].rebateRate;
  const isBest = slug === "gate";
  return isBest ? `${rate} ⭐` : rate;
});

// ─────────────────────────────────────────────────────────────────────────────
// 邀请码 & 推荐链接（Single Source of Truth）
//
// 修改邀请码或推荐链接时，只需更新此处，全站自动同步。
// 变更历史：
//   2026-02: Bybit inviteCode MMANUS → MANUS（与其他交易所统一）
// ─────────────────────────────────────────────────────────────────────────────

export interface ExchangeInviteData {
  /** 邀请码（注册时手动填写） */
  inviteCode: string;
  /** 带邀请码的推荐注册链接 */
  referralLink: string;
  /** 返佣比例文字说明 */
  rebateRate: string;
}

export const INVITE_CODES: Record<ExchangeSlug, ExchangeInviteData> = {
  gate: {
    inviteCode: "FORMANUS",
    referralLink: "https://www.gateport.business/share/FORMANUS",
    rebateRate: "60%",
  },
  okx: {
    inviteCode: "MANUS",
    referralLink: "https://www.vmutkhamuut.com/join/MANUS",
    rebateRate: "20%",
  },
  binance: {
    inviteCode: "MANUS",
    referralLink: "https://www.gateport.company/share/GATEBITS",
    rebateRate: "20%",
  },
  bybit: {
    inviteCode: "MANUS",
    referralLink: "https://partner.bybit.com/b/MANUS",
    rebateRate: "30%",
  },
  bitget: {
    inviteCode: "MANUS",
    referralLink: "https://partner.hdmune.cn/bg/u9qqgq4u",
    rebateRate: "50%",
  },
};

/**
 * 快速获取邀请码（前端备用显示，当数据库查询失败时使用）
 * gate 使用独立邀请码 FORMANUS，其他交易所统一使用 MANUS
 */
export function getFallbackInviteCode(slug: string): string {
  return INVITE_CODES[slug as ExchangeSlug]?.inviteCode ?? "MANUS";
}

/**
 * 快速获取推荐链接（前端备用显示）
 */
export function getFallbackReferralLink(slug: string): string {
  return INVITE_CODES[slug as ExchangeSlug]?.referralLink ?? "#";
}
