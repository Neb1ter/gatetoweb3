import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
