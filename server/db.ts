import { eq, like, or, asc, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  contactSubmissions, InsertContactSubmission,
  exchangeLinks, InsertExchangeLink, ExchangeLink,
  faqs, InsertFaq, Faq,
  cryptoNews, InsertCryptoNews, CryptoNews,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function submitContactForm(
  data: Omit<InsertContactSubmission, "id" | "createdAt">
): Promise<void> {
  const db = await getDb();
  if (!db) { throw new Error("Database not available"); }
  try {
    await db.insert(contactSubmissions).values(data);
  } catch (error) {
    console.error("[Database] Failed to submit contact form:", error);
    throw error;
  }
}

// ─── Exchange Links ────────────────────────────────────────────────────────────

const DEFAULT_EXCHANGE_LINKS: InsertExchangeLink[] = [
  { slug: 'gate', name: 'Gate.io', referralLink: 'https://www.gateport.business/share/FORMANUS', inviteCode: 'FORMANUS', rebateRate: '60%', sortOrder: 1 },
  { slug: 'okx', name: 'OKX', referralLink: 'https://www.vmutkhamuut.com/join/MANUS', inviteCode: 'MANUS', rebateRate: '20%', sortOrder: 2 },
  { slug: 'binance', name: 'Binance', referralLink: 'https://www.gateport.company/share/GATEBITS', inviteCode: 'MANUS', rebateRate: '20%', sortOrder: 3 },
  { slug: 'bybit', name: 'Bybit', referralLink: 'https://partner.bybit.com/b/MMANUS', inviteCode: 'MMANUS', rebateRate: '30%', sortOrder: 4 },
  { slug: 'bitget', name: 'Bitget', referralLink: 'https://partner.hdmune.cn/bg/u9qqgq4u', inviteCode: 'MANUS', rebateRate: '50%', sortOrder: 5 },
];

export async function getExchangeLinks(): Promise<ExchangeLink[]> {
  const db = await getDb();
  if (!db) {
    return DEFAULT_EXCHANGE_LINKS.map((d, i) => ({ ...d, id: i + 1, sortOrder: d.sortOrder ?? i + 1, updatedAt: new Date() })) as ExchangeLink[];
  }
  const existing = await db.select().from(exchangeLinks);
  if (existing.length === 0) {
    console.log("[Database] Seeding exchange_links table with defaults…");
    await db.insert(exchangeLinks).values(DEFAULT_EXCHANGE_LINKS);
    return db.select().from(exchangeLinks).orderBy(exchangeLinks.sortOrder);
  }
  return db.select().from(exchangeLinks).orderBy(exchangeLinks.sortOrder);
}

export async function updateExchangeLink(
  slug: string,
  data: Partial<Pick<InsertExchangeLink, 'referralLink' | 'inviteCode' | 'rebateRate' | 'name'>>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(exchangeLinks).set(data).where(eq(exchangeLinks.slug, slug));
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────

const DEFAULT_FAQS: InsertFaq[] = [
  { question: "什么是加密货币？", answer: "加密货币是一种基于区块链技术的数字货币，不由任何国家或机构控制。比特币（BTC）是第一种加密货币，诞生于2009年。目前全球有超过2万种加密货币，总市值超过2万亿美元。", category: "basic", sortOrder: 1, isActive: true },
  { question: "区块链是什么？", answer: "区块链是一种分布式账本技术，所有交易记录被打包成「区块」，并按时间顺序链接成「链」。数据一旦写入就无法篡改，任何人都可以公开验证，无需信任中间机构。", category: "basic", sortOrder: 2, isActive: true },
  { question: "什么是钱包地址？", answer: "钱包地址是你在区块链上的「账号」，类似银行卡号。由一串字母和数字组成（如 0x1234...abcd），用于接收和发送加密货币。每个地址都有对应的私钥，私钥就是你的「密码」，千万不能泄露。", category: "basic", sortOrder: 3, isActive: true },
  { question: "什么是返佣？怎么获得？", answer: "返佣是交易所为了推广用户而设计的奖励机制。通过邀请链接注册后，你每次交易产生的手续费，有一部分会以返佣形式退还给你。使用我们的邀请链接注册，可享受最高60%的手续费返还，长期交易可节省大量成本。", category: "fees", sortOrder: 4, isActive: true },
  { question: "什么是现货交易？", answer: "现货交易是最基础的交易方式：用一种货币直接买入另一种货币。比如用100 USDT买入BTC，价格上涨后卖出获利。现货交易没有杠杆，最多亏损本金，适合新手入门。", category: "trading", sortOrder: 5, isActive: true },
  { question: "什么是合约交易（永续合约）？", answer: "合约交易允许你用「保证金」控制更大的仓位，通过杠杆放大收益（同时也放大风险）。永续合约没有到期日，可以做多（看涨）也可以做空（看跌）。例如：用100 USDT开10倍杠杆，相当于控制1000 USDT的仓位，价格涨10%你赚100%，但跌10%也会亏损100%。", category: "trading", sortOrder: 6, isActive: true },
  { question: "什么是杠杆？有什么风险？", answer: "杠杆是放大交易规模的工具。10倍杠杆意味着用1份本金控制10份资产。收益和亏损都被同比例放大。当亏损超过保证金时，交易所会「强制平仓」（强平），你会损失全部保证金。新手建议从低杠杆（2-3倍）开始，切勿满仓操作。", category: "trading", sortOrder: 7, isActive: true },
  { question: "如何保护我的账户安全？", answer: "① 开启双重验证（2FA/Google Authenticator）；② 使用强密码，不同平台不重复；③ 不在公共WiFi下操作；④ 不点击陌生链接，防止钓鱼攻击；⑤ 大额资产建议转入冷钱包（硬件钱包）；⑥ 私钥和助记词离线保存，不截图不上传云端。", category: "security", sortOrder: 8, isActive: true },
  { question: "什么是USDT？为什么大家都用它？", answer: "USDT（泰达币）是与美元1:1锚定的稳定币，1 USDT ≈ 1美元。它的价格不波动，是加密市场的「结算货币」。大多数交易对都以USDT计价，转账快速且手续费低，是进入币圈的第一步。", category: "basic", sortOrder: 9, isActive: true },
  { question: "交易所之间有什么区别？", answer: "主要区别在于：① 支持的币种数量（Gate.io > Binance > OKX）；② 手续费高低（通过邀请链接注册可大幅降低）；③ 安全性（大交易所储备金更透明）；④ 功能（Gate.io支持TradFi资产，OKX有强大的Web3钱包）。建议新手选择Binance或Gate.io入门。", category: "fees", sortOrder: 10, isActive: true },
  { question: "什么是DeFi（去中心化金融）？", answer: "DeFi是运行在区块链上的金融服务，无需银行或中间机构。包括去中心化交易所（DEX）、借贷协议、流动性挖矿等。资产完全由自己控制，但风险也更高，需要了解智能合约风险和流动性风险。", category: "basic", sortOrder: 11, isActive: true },
  { question: "如何从法币（人民币）买入加密货币？", answer: "主要方式：① P2P交易：在交易所的P2P市场找商家，用支付宝/微信/银行卡购买USDT；② C2C：与其他用户直接交易；③ 场外OTC：大额交易可联系专业OTC商。建议新手通过大型交易所（Binance、OKX）的P2P功能购买，安全有保障。", category: "basic", sortOrder: 12, isActive: true },
  { question: "什么是牛市和熊市？", answer: "牛市：市场整体上涨，价格持续走高，投资者情绪乐观。熊市：市场整体下跌，价格持续走低，恐慌情绪蔓延。加密市场波动远大于传统市场，日涨跌10-20%很常见。建议新手在熊市低价布局，牛市高点逐步获利了结。", category: "trading", sortOrder: 13, isActive: true },
  { question: "什么是Gas费？", answer: "Gas费是在以太坊等区块链上进行交易时支付给矿工/验证者的费用，用于激励他们处理你的交易。网络拥堵时Gas费会大幅上涨。Solana、BNB Chain等公链的Gas费通常更低，适合频繁小额交易。", category: "fees", sortOrder: 14, isActive: true },
  { question: "什么是NFT？", answer: "NFT（非同质化代币）是区块链上的唯一数字资产，每个NFT都是独一无二的，不可复制。可以代表数字艺术品、游戏道具、虚拟土地等。2021年NFT市场爆发，但目前市场已大幅降温，投资需谨慎。", category: "basic", sortOrder: 15, isActive: true },
  { question: "加密货币交易需要缴税吗？", answer: "各国政策不同。中国大陆目前没有明确的加密货币税收规定，但资金流动可能受到监管关注。美国、欧盟等地区将加密货币视为资产，买卖盈利需缴纳资本利得税。建议了解所在地区的法规，保留交易记录。", category: "other", sortOrder: 16, isActive: true },
  { question: "什么是做市商和吃单方？手续费有什么区别？", answer: "做市商（Maker）：挂单等待成交，为市场提供流动性，手续费通常更低甚至为0。吃单方（Taker）：直接与已有订单成交，消耗流动性，手续费略高。通过邀请链接注册后，两种手续费都会有折扣，长期下来节省相当可观。", category: "fees", sortOrder: 17, isActive: true },
  { question: "什么是空投（Airdrop）？", answer: "空投是项目方免费向用户分发代币的方式，通常用于推广项目。获取方式：① 持有特定代币；② 使用项目的产品（如DEX、借贷协议）；③ 完成特定任务（关注社交媒体、测试网交互）。知名空投案例：Uniswap（UNI）、Arbitrum（ARB）等，部分用户获得了价值数千美元的代币。", category: "basic", sortOrder: 18, isActive: true },
];

/** Seed faqs table if empty, then return active FAQs */
export async function getFaqs(search?: string): Promise<Faq[]> {
  const db = await getDb();
  if (!db) {
    // Return static fallback
    const all = DEFAULT_FAQS.map((d, i) => ({ ...d, id: i + 1, createdAt: new Date(), updatedAt: new Date() })) as Faq[];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }

  const existing = await db.select().from(faqs);
  if (existing.length === 0) {
    console.log("[Database] Seeding faqs table with defaults…");
    await db.insert(faqs).values(DEFAULT_FAQS);
  }

  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    return db.select().from(faqs)
      .where(or(like(faqs.question, q), like(faqs.answer, q)))
      .orderBy(asc(faqs.sortOrder));
  }

  return db.select().from(faqs)
    .where(eq(faqs.isActive, true))
    .orderBy(asc(faqs.sortOrder));
}

// ─── Crypto News ───────────────────────────────────────────────────────────────

const DEFAULT_NEWS: InsertCryptoNews[] = [
  {
    title: "比特币跌破6.5万美元，避险情绪升温推动金银走高",
    summary: "受地缘政治紧张及美国关税不确定性影响，加密市场再度下跌。过去1小时全网爆仓2.38亿美元，其中多单爆仓2.32亿美元。",
    source: "律动BlockBeats",
    url: "https://www.theblockbeats.info/flash",
    category: "market",
    isPinned: true,
    isActive: true,
    publishedAt: new Date("2026-02-23T09:16:00Z"),
  },
  {
    title: "加密恐慌指数降至5，市场「极度恐慌」情绪加深",
    summary: "CMC恐惧与贪婪指数跌至5，为近年来极低水平，显示市场情绪极度悲观。历史上极度恐慌往往是布局良机。",
    source: "律动BlockBeats",
    url: "https://www.theblockbeats.info/flash",
    category: "market",
    isPinned: false,
    isActive: true,
    publishedAt: new Date("2026-02-23T08:16:00Z"),
  },
  {
    title: "早期比特币布道者Erik Voorhees斥资2038万美元买入9911枚ETH",
    summary: "链上数据显示，比特币早期布道者Erik Voorhees近日大举买入以太坊，均价约2056美元，显示部分老牌投资者在下跌中逢低布局。",
    source: "律动BlockBeats",
    url: "https://www.theblockbeats.info/flash",
    category: "market",
    isPinned: false,
    isActive: true,
    publishedAt: new Date("2026-02-23T07:42:00Z"),
  },
  {
    title: "渣打银行：稳定币市值2028年底将达2万亿美元",
    summary: "渣打银行报告预测，稳定币市值将在2028年底达到2万亿美元，为美国国债带来0.8至1万亿美元的新需求，稳定币正成为全球金融体系的重要组成部分。",
    source: "律动BlockBeats",
    url: "https://www.theblockbeats.info/flash",
    category: "policy",
    isPinned: false,
    isActive: true,
    publishedAt: new Date("2026-02-23T06:39:00Z"),
  },
  {
    title: "Binance平台比特币余额升至676,834枚，创2024年11月以来新高",
    summary: "链上数据显示，Binance平台BTC余额持续增加，表明用户正将比特币转入交易所，可能预示着卖压增加或用户准备交易。",
    source: "律动BlockBeats",
    url: "https://www.theblockbeats.info/flash",
    category: "exchange",
    isPinned: false,
    isActive: true,
    publishedAt: new Date("2026-02-23T05:10:00Z"),
  },
  {
    title: "Arthur Hayes披露当前投资组合：持有BTC、ETH、ZEC、HYPE及实物黄金",
    summary: "BitMEX创始人Arthur Hayes公开当前仓位，加密资产包括BTC、ETH、ZEC、HYPE，同时布局贵金属与能源股，并持有实物黄金作为对冲。",
    source: "律动BlockBeats",
    url: "https://www.theblockbeats.info/flash",
    category: "market",
    isPinned: false,
    isActive: true,
    publishedAt: new Date("2026-02-23T04:33:00Z"),
  },
  {
    title: "彭博社：曾推动比特币ETF热潮的对冲基金正迅速撤离",
    summary: "彭博社报道，2025年Q4比特币ETF持仓环比下降28%，曾大力推动比特币ETF的对冲基金正在减仓，市场机构投资者情绪出现明显转变。",
    source: "律动BlockBeats",
    url: "https://www.theblockbeats.info/flash",
    category: "market",
    isPinned: false,
    isActive: true,
    publishedAt: new Date("2026-02-23T03:23:00Z"),
  },
  {
    title: "2025年全球加密货币持有者达7.41亿，同比增长12.4%",
    summary: "Crypto.com最新报告显示，全球加密货币持有者数量从2024年的6.59亿增至7.41亿，同比增长12.4%，加密货币普及率持续提升。",
    source: "深潮TechFlow",
    url: "https://www.techflowpost.com",
    category: "market",
    isPinned: false,
    isActive: true,
    publishedAt: new Date("2026-02-22T10:00:00Z"),
  },
  {
    title: "《经济学人》：在亚洲，稳定币正成为新的支付基础设施",
    summary: "Chainalysis数据显示，印度加密货币流入规模估计达3380亿美元（2024年中至2025年），稳定币在亚洲支付场景中的应用正在快速扩张。",
    source: "律动BlockBeats",
    url: "https://www.theblockbeats.info/flash",
    category: "policy",
    isPinned: false,
    isActive: true,
    publishedAt: new Date("2026-02-22T08:00:00Z"),
  },
  {
    title: "AI支付暗战：Google带60家盟友，Stripe自己建了整条路",
    summary: "Google联合60家合作伙伴推进AI支付生态，Stripe则申请国家银行信托牌照，并与Paradigm共同孵化专为支付设计的Tempo Chain，AI与加密支付的融合正在加速。",
    source: "律动BlockBeats",
    url: "https://www.theblockbeats.info/news/61305",
    category: "defi",
    isPinned: false,
    isActive: true,
    publishedAt: new Date("2026-02-22T06:00:00Z"),
  },
];

/** Seed crypto_news table if empty, then return active news sorted by publishedAt desc */
export async function getCryptoNews(limit = 20): Promise<CryptoNews[]> {
  const db = await getDb();
  if (!db) {
    return DEFAULT_NEWS.map((d, i) => ({ ...d, id: i + 1, createdAt: new Date() })) as CryptoNews[];
  }

  const existing = await db.select().from(cryptoNews);
  if (existing.length === 0) {
    console.log("[Database] Seeding crypto_news table with defaults…");
    await db.insert(cryptoNews).values(DEFAULT_NEWS);
  }

  return db.select().from(cryptoNews)
    .where(eq(cryptoNews.isActive, true))
    .orderBy(desc(cryptoNews.publishedAt))
    .limit(limit);
}
