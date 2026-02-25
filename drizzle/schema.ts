import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, tinyint, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Contact form submissions from users seeking fee rebate configuration.
 */
export const contactSubmissions = mysqlTable("contact_submissions", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 64 }).notNull(),
  accountName: varchar("accountName", { length: 256 }).notNull(),
  exchangeUid: varchar("exchangeUid", { length: 128 }),
  exchangeUsername: varchar("exchangeUsername", { length: 256 }),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;

/**
 * Exchange referral links and invite codes — editable from the Dashboard Database panel.
 */
export const exchangeLinks = mysqlTable("exchange_links", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 64 }).notNull(),
  referralLink: text("referralLink").notNull(),
  inviteCode: varchar("inviteCode", { length: 64 }).notNull(),
  rebateRate: varchar("rebateRate", { length: 16 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExchangeLink = typeof exchangeLinks.$inferSelect;
export type InsertExchangeLink = typeof exchangeLinks.$inferInsert;

/**
 * FAQ (新手问答) — editable from the Dashboard Database panel.
 * Add, edit, or delete questions and answers without redeploying.
 * category: "basic" | "trading" | "security" | "fees" | "other"
 */
export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  /** Short question text */
  question: text("question").notNull(),
  /** Full answer text (supports simple markdown) */
  answer: text("answer").notNull(),
  /** Category tag for filtering */
  category: varchar("category", { length: 32 }).default("basic").notNull(),
  /** Display order (lower = first) */
  sortOrder: int("sortOrder").default(0).notNull(),
  /** Whether this FAQ is visible on the site */
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = typeof faqs.$inferInsert;

/**
 * Crypto news items — seeded from BlockBeats/OKX, editable from Dashboard.
 * Displayed on the /crypto-news timeline page.
 */
export const cryptoNews = mysqlTable("crypto_news", {
  id: int("id").autoincrement().primaryKey(),
  /** News headline */
  title: text("title").notNull(),
  /** Brief summary (1-2 sentences) */
  summary: text("summary"),
  /** Source name, e.g. "律动BlockBeats" */
  source: varchar("source", { length: 64 }).default("律动BlockBeats").notNull(),
  /** Original article URL */
  url: text("url"),
  /** Category: "market" | "policy" | "exchange" | "defi" | "nft" | "other" */
  category: varchar("category", { length: 32 }).default("market").notNull(),
  /** Whether pinned to top */
  isPinned: boolean("isPinned").default(false).notNull(),
  /** Whether visible on site */
  isActive: boolean("isActive").default(true).notNull(),
  /** Publication time (used for timeline ordering) */
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CryptoNews = typeof cryptoNews.$inferSelect;
export type InsertCryptoNews = typeof cryptoNews.$inferInsert;

/**
 * Exchange feature categories — the 13 functional areas of a CEX.
 * Editable from Dashboard Database panel.
 */
export const exchangeFeatureCategories = mysqlTable("exchange_feature_categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 32 }).notNull().unique(),
  nameZh: varchar("nameZh", { length: 64 }).notNull(),
  nameEn: varchar("nameEn", { length: 64 }).notNull(),
  icon: varchar("icon", { length: 8 }).notNull(),
  descZh: text("descZh").notNull(),
  descEn: text("descEn").notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export type ExchangeFeatureCategory = typeof exchangeFeatureCategories.$inferSelect;
export type InsertExchangeFeatureCategory = typeof exchangeFeatureCategories.$inferInsert;

/**
 * Exchange feature support details — per-exchange support level and details for each feature.
 * Editable from Dashboard Database panel or /admin/exchange-guide.
 */
export const exchangeFeatureSupport = mysqlTable("exchange_feature_support", {
  id: int("id").autoincrement().primaryKey(),
  exchangeSlug: varchar("exchangeSlug", { length: 32 }).notNull(),
  featureSlug: varchar("featureSlug", { length: 32 }).notNull(),
  supported: tinyint("supported").default(1).notNull(),
  levelZh: varchar("levelZh", { length: 32 }).notNull(),
  levelEn: varchar("levelEn", { length: 64 }).notNull(),
  detailZh: text("detailZh").notNull(),
  detailEn: text("detailEn").notNull(),
  maxLeverage: varchar("maxLeverage", { length: 16 }),
  feeInfo: varchar("feeInfo", { length: 256 }),
  highlight: tinyint("highlight").default(0).notNull(),
  /** KYC requirement level: none | basic | standard | enhanced */
  kycLevel: varchar("kycLevel", { length: 16 }).default("standard"),
  /** Comma-separated supported regions, e.g. "CN,HK,TW,SG" */
  supportedRegions: varchar("supportedRegions", { length: 256 }),
  /** Fee tier label, e.g. "低" / "中" / "高" */
  feeLevel: varchar("feeLevel", { length: 8 }),
  /** Extra notes shown in admin panel */
  notes: text("notes"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExchangeFeatureSupport = typeof exchangeFeatureSupport.$inferSelect;
export type InsertExchangeFeatureSupport = typeof exchangeFeatureSupport.$inferInsert;

/**
 * Simulated trading history — stores closed positions for each user.
 * simType: "spot" | "futures" | "margin"
 * direction: "long" | "short" | "buy" | "sell"
 * Data is tied to the user's account; reset only on explicit user request.
 */
export const simTradeHistory = mysqlTable("sim_trade_history", {
  id: int("id").autoincrement().primaryKey(),
  /** User who made the trade */
  userId: int("userId").notNull(),
  /** Type of simulation: spot, futures, margin */
  simType: mysqlEnum("simType", ["spot", "futures", "margin"]).notNull(),
  /** Trading pair, e.g. BTC/USDT */
  symbol: varchar("symbol", { length: 16 }).notNull(),
  /** Trade direction */
  direction: mysqlEnum("direction", ["long", "short", "buy", "sell"]).notNull(),
  /** Entry price */
  entryPrice: varchar("entryPrice", { length: 32 }).notNull(),
  /** Exit price */
  exitPrice: varchar("exitPrice", { length: 32 }).notNull(),
  /** Position size (e.g. BTC amount) */
  size: varchar("size", { length: 32 }).notNull(),
  /** Leverage multiplier (1 for spot) */
  leverage: int("leverage").default(1).notNull(),
  /** Realized PnL in USDT */
  pnl: varchar("pnl", { length: 32 }).notNull(),
  /** PnL percentage */
  pnlPct: varchar("pnlPct", { length: 16 }).notNull(),
  /** How position was closed: manual | tp | sl | liquidated | reversed */
  closeReason: varchar("closeReason", { length: 32 }).default("manual").notNull(),
  /** Margin mode for futures/margin: cross | isolated */
  marginMode: varchar("marginMode", { length: 16 }),
  /** When the position was opened */
  openedAt: timestamp("openedAt").notNull(),
  /** When the position was closed */
  closedAt: timestamp("closedAt").defaultNow().notNull(),
});

export type SimTradeHistory = typeof simTradeHistory.$inferSelect;
export type InsertSimTradeHistory = typeof simTradeHistory.$inferInsert;
