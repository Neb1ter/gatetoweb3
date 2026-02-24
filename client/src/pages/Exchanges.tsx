/**
 * 交易所中心 — /exchanges
 * 三个 Tab：💰 返佣对比 | 🔍 各交易所详情 | 📚 交易所科普
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useScrollMemory, goBack } from "@/hooks/useScrollMemory";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import {
  ArrowLeft, ExternalLink, Gift, Key, Shield, Star,
  Check, X, ChevronDown, ChevronUp, Users, TrendingUp,
  TrendingDown, Globe, Zap, Clock, BarChart2, Lock,
  RefreshCw, CheckCircle2, ChevronRight, MessageCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// 数据层
// ─────────────────────────────────────────────────────────────────────────────

const STATIC: Record<string, {
  emoji: string; color: string; accentCls: string; borderCls: string; bgGrad: string;
  spotMaker: string; spotTaker: string; futMaker: string; futTaker: string;
  rebateStars: string; founded: string; hq: string; coins: string;
  volume: string; reserve: string; leverage: string; token: string;
  badge: { zh: string; en: string }; badgeCls: string;
  tagline: { zh: string; en: string };
  desc: { zh: string; en: string };
  highlights: { icon: string; zh: string; en: string }[];
  pros: { zh: string[]; en: string[] };
  cons: { zh: string[]; en: string[] };
  bestFor: { zh: string; en: string };
}> = {
  gate: {
    emoji: "🟢", color: "#00B173", accentCls: "text-emerald-400",
    borderCls: "border-emerald-500/40", bgGrad: "from-emerald-950/60 to-gray-900",
    spotMaker: "0.15%", spotTaker: "0.15%", futMaker: "-0.015%", futTaker: "0.016%",
    rebateStars: "⭐⭐⭐⭐⭐", founded: "2013", hq: "开曼群岛", coins: "3,600+",
    volume: "$18.8亿", reserve: "125%", leverage: "100x", token: "GT",
    badge: { zh: "新币最多", en: "Most Altcoins" }, badgeCls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    tagline: { zh: "最多新币 · 最透明储备 · TradFi先锋", en: "Most Altcoins · Highest Transparency · TradFi Pioneer" },
    desc: {
      zh: "Gate.io 成立于 2013 年，是全球历史最悠久的主流交易所之一。全球首家承诺 100% 储备，与 Armanino LLP 合作审计，储备率高达 125%，支持 3,600+ 种加密货币。",
      en: "Gate.io (est. 2013) is one of the oldest mainstream exchanges. World's first 100% reserve commitment, audited by Armanino LLP with 125% reserve ratio, supporting 3,600+ cryptocurrencies.",
    },
    highlights: [
      { icon: "🪙", zh: "支持 3,600+ 种加密货币，远超其他主流交易所", en: "Supports 3,600+ cryptocurrencies, far more than other major exchanges" },
      { icon: "🔍", zh: "全球首家 100% 储备承诺，储备率高达 125%", en: "World's first 100% reserve commitment, reserve ratio up to 125%" },
      { icon: "🏦", zh: "支持黄金代币 (XAUt) 等传统金融资产，TradFi 友好", en: "Supports gold tokens (XAUt) and TradFi assets — unique among top exchanges" },
      { icon: "💰", zh: "返佣比例高达 60%，全行业最高", en: "Up to 60% rebate rate — highest in the industry" },
    ],
    pros: { zh: ["新币上线最快最多", "储备透明度全行业最高", "支持黄金等传统金融资产", "返佣比例高达 60%"], en: ["Fastest and most new coin listings", "Highest reserve transparency", "Supports gold and TradFi assets", "Up to 60% rebate rate"] },
    cons: { zh: ["界面相对复杂，新手需适应", "主流币流动性略低于 Binance/OKX"], en: ["Interface relatively complex for beginners", "Liquidity slightly lower than Binance/OKX"] },
    bestFor: { zh: "山寨币猎手 · TradFi 投资者 · 追求透明度的用户", en: "Altcoin hunters · TradFi investors · Transparency-focused users" },
  },
  okx: {
    emoji: "🔷", color: "#3B82F6", accentCls: "text-blue-400",
    borderCls: "border-blue-500/40", bgGrad: "from-blue-950/60 to-gray-900",
    spotMaker: "0.08%", spotTaker: "0.10%", futMaker: "-0.0025%", futTaker: "0.0075%",
    rebateStars: "⭐⭐⭐⭐⭐", founded: "2017", hq: "塞舌尔/巴哈马", coins: "350+",
    volume: "$16.5亿", reserve: "105%+", leverage: "125x", token: "OKB",
    badge: { zh: "Web3 最强", en: "Best Web3" }, badgeCls: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    tagline: { zh: "Web3 门户 · 最强 DEX · 自有 Layer2", en: "Web3 Gateway · Best DEX · Own Layer2" },
    desc: {
      zh: "OKX 是全球第二大加密交易所，以强大的 Web3 生态著称。Web3 钱包支持 100+ 公链，内置 DEX 聚合器，自有 X Layer 二层网络。2025 年已在德国、波兰获得正式监管牌照，CoinGlass 综合评分 88.77。",
      en: "OKX is the world's 2nd largest exchange, renowned for its Web3 ecosystem. Web3 wallet supports 100+ chains, built-in DEX aggregator, X Layer L2. Officially regulated in Germany & Poland in 2025. CoinGlass score 88.77.",
    },
    highlights: [
      { icon: "🌐", zh: "Web3 钱包支持 100+ 公链，最强多链钱包之一", en: "Web3 wallet supports 100+ chains — one of the strongest multi-chain wallets" },
      { icon: "⚡", zh: "内置 DEX 聚合器，一键访问全链最优价格", en: "Built-in DEX aggregator for best prices across all chains" },
      { icon: "🏛️", zh: "2025 年获德国、波兰正式监管牌照，合规领先", en: "Officially regulated in Germany and Poland in 2025 — compliance leader" },
      { icon: "📊", zh: "CoinGlass 综合评分 88.77，行业第二", en: "CoinGlass composite score 88.77, industry #2" },
    ],
    pros: { zh: ["Web3 生态最完整", "现货 Maker 费率 0.08% 行业最低之一", "德国/波兰持牌合规"], en: ["Most complete Web3 ecosystem", "Spot Maker fee 0.08% — one of lowest", "Licensed in Germany/Poland"] },
    cons: { zh: ["新币上线速度不及 Gate", "部分地区访问受限"], en: ["Slower new coin listings than Gate", "Access restricted in some regions"] },
    bestFor: { zh: "Web3 探索者 · 合约交易者 · 追求低费率的用户", en: "Web3 explorers · Contract traders · Low-fee seekers" },
  },
  binance: {
    emoji: "🟡", color: "#F0B90B", accentCls: "text-yellow-400",
    borderCls: "border-yellow-500/40", bgGrad: "from-yellow-950/60 to-gray-900",
    spotMaker: "0.10%", spotTaker: "0.10%", futMaker: "0.02%", futTaker: "0.04%",
    rebateStars: "⭐⭐⭐⭐", founded: "2017", hq: "开曼群岛", coins: "350+",
    volume: "$40-60亿", reserve: "100%+", leverage: "125x", token: "BNB",
    badge: { zh: "流动性最强", en: "Best Liquidity" }, badgeCls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    tagline: { zh: "全球最大 · 流动性最强 · 生态最全", en: "World Largest · Best Liquidity · Full Ecosystem" },
    desc: {
      zh: "币安是全球最大的加密交易所，日均交易量超 400 亿美元，注册用户超 2.5 亿，市场份额约 40%。CoinGlass 综合评分 94.33，行业第一。BNB Chain 是全球最活跃的公链之一。",
      en: "Binance is the world's largest exchange with $40B+ daily volume, 250M+ users, ~40% market share. CoinGlass score 94.33, industry #1. BNB Chain is one of the most active blockchains.",
    },
    highlights: [
      { icon: "🏆", zh: "CoinGlass 综合评分 94.33，全球第一", en: "CoinGlass composite score 94.33, global #1" },
      { icon: "👥", zh: "注册用户超 2.5 亿，全球最大用户基础", en: "250M+ registered users, world's largest user base" },
      { icon: "💧", zh: "日均交易量 400-600 亿美元，流动性无可匹敌", en: "$40-60B daily volume, unmatched liquidity" },
      { icon: "⛓️", zh: "BNB Chain 生态：数千个 DApp，最活跃公链之一", en: "BNB Chain ecosystem: thousands of DApps, most active chain" },
    ],
    pros: { zh: ["全球最大，流动性最强", "产品线最全面", "BNB 持有者享受手续费折扣"], en: ["World largest, best liquidity", "Most comprehensive product line", "BNB holders get fee discounts"] },
    cons: { zh: ["美国用户受限", "部分监管问题", "新手界面较复杂"], en: ["US users restricted", "Some regulatory issues", "Complex interface for beginners"] },
    bestFor: { zh: "主流币交易者 · 大额交易用户 · BNB 生态参与者", en: "Major coin traders · High-volume users · BNB ecosystem participants" },
  },
  bybit: {
    emoji: "🔵", color: "#2775CA", accentCls: "text-blue-300",
    borderCls: "border-blue-400/40", bgGrad: "from-blue-950/60 to-gray-900",
    spotMaker: "0.10%", spotTaker: "0.10%", futMaker: "0.01%", futTaker: "0.055%",
    rebateStars: "⭐⭐⭐⭐", founded: "2018", hq: "迪拜", coins: "1,000+",
    volume: "$10亿+", reserve: "100%+", leverage: "125x", token: "BIT",
    badge: { zh: "合约专家", en: "Derivatives Expert" }, badgeCls: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    tagline: { zh: "合约专家 · 每月储备审计 · 荷兰持牌", en: "Derivatives Expert · Monthly Reserve Audit · Netherlands Licensed" },
    desc: {
      zh: "Bybit 成立于 2018 年，专注衍生品交易，合约 Maker 费率仅 0.01%，全行业最低之一。与 Hacken 合作每月发布储备金证明，ETH 储备率 101%。已在荷兰获得正式监管牌照。",
      en: "Bybit (est. 2018) specializes in derivatives. Contract Maker fee only 0.01% — one of the lowest. Monthly Proof of Reserves with Hacken, ETH reserve ratio 101%. Officially licensed in the Netherlands.",
    },
    highlights: [
      { icon: "📋", zh: "Hacken 每月储备金证明审计，ETH 储备率 101%", en: "Monthly Hacken Proof of Reserves audit, ETH reserve ratio 101%" },
      { icon: "🏛️", zh: "荷兰正式监管牌照，欧洲合规运营", en: "Official Netherlands license, EU-compliant operations" },
      { icon: "💰", zh: "合约 Maker 费率 0.01%，全行业最低之一", en: "Contract Maker fee 0.01% — one of lowest in industry" },
      { icon: "📈", zh: "2025 年底市场份额 9.5%，衍生品行业第二", en: "9.5% market share end of 2025, derivatives industry #2" },
    ],
    pros: { zh: ["合约费率极低", "每月储备金证明", "荷兰持牌合规", "跟单功能完善"], en: ["Extremely low contract fees", "Monthly reserve proof", "Netherlands licensed", "Good copy trading"] },
    cons: { zh: ["现货品种少于 Gate/Binance", "2025 年 2 月遭受黑客攻击（已全额赔付）"], en: ["Fewer spot pairs than Gate/Binance", "Feb 2025 hack (fully compensated)"] },
    bestFor: { zh: "合约交易者 · 追求低费率的用户 · 欧洲用户", en: "Contract traders · Low-fee seekers · European users" },
  },
  bitget: {
    emoji: "🟣", color: "#00D4AA", accentCls: "text-teal-400",
    borderCls: "border-teal-500/40", bgGrad: "from-teal-950/60 to-gray-900",
    spotMaker: "0.02%", spotTaker: "0.06%", futMaker: "0.02%", futTaker: "0.06%",
    rebateStars: "⭐⭐⭐⭐", founded: "2018", hq: "塞舌尔", coins: "800+",
    volume: "$5-10亿", reserve: "150%+", leverage: "125x", token: "BGB",
    badge: { zh: "跟单第一", en: "Copy Trading #1" }, badgeCls: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    tagline: { zh: "跟单鼻祖 · 最大跟单平台 · 用户保护基金", en: "Copy Trading Pioneer · Largest Copy Platform · Protection Fund" },
    desc: {
      zh: "Bitget 成立于 2018 年，以跟单交易起家，目前已成为全球最大的跟单交易平台。800+ 专业交易员供用户跟随，一键复制。设立 $3 亿用户保护基金，储备率超过 150%，CoinGlass 评分 83.10。",
      en: "Bitget (est. 2018) started with copy trading and became the world's largest copy trading platform. 800+ pro traders to follow, one-click copy. $300M user protection fund, reserve ratio 150%+, CoinGlass score 83.10.",
    },
    highlights: [
      { icon: "🏆", zh: "全球最大跟单平台：800+ 专业交易员，一键跟单", en: "World's largest copy trading platform: 800+ pro traders, one-click copy" },
      { icon: "🛡️", zh: "$3 亿用户保护基金，行业最高保障之一", en: "$300M user protection fund, one of the highest in the industry" },
      { icon: "📊", zh: "储备率超过 150%，透明度高", en: "Reserve ratio over 150%, high transparency" },
      { icon: "🎯", zh: "CoinGlass 综合评分 83.10，行业第三", en: "CoinGlass composite score 83.10, industry #3" },
    ],
    pros: { zh: ["跟单功能全行业最强", "用户保护基金行业领先", "储备率超过 150%", "新手友好"], en: ["Best copy trading in industry", "Industry-leading protection fund", "Reserve ratio over 150%", "Beginner-friendly"] },
    cons: { zh: ["交易量和流动性不及头部交易所", "知名度相对较低"], en: ["Lower volume and liquidity than top exchanges", "Relatively lower brand recognition"] },
    bestFor: { zh: "跟单交易新手 · 风险厌恶者 · 寻求稳健收益的用户", en: "Copy trading beginners · Risk-averse users · Steady yield seekers" },
  },
};

const COMPARE_MATRIX = [
  { key: "coins",      zh: "支持币种",     en: "Coins",          vals: ["3,600+", "350+", "350+", "1,000+", "800+"],        star: 0 },
  { key: "volume",     zh: "日交易量",     en: "Daily Volume",   vals: ["$18.8亿", "$16.5亿", "$40-60亿", "$10亿+", "$5-10亿"], star: 2 },
  { key: "reserve",    zh: "储备率",       en: "Reserve Ratio",  vals: ["125% ⭐", "105%+", "100%+", "100%+", "150%+ ⭐"],    star: -1 },
  { key: "smFee",      zh: "现货Maker费",  en: "Spot Maker",     vals: ["0.15%", "0.08% ⭐", "0.10%", "0.10%", "0.02% ⭐"],  star: -1 },
  { key: "fmFee",      zh: "合约Maker费",  en: "Futures Maker",  vals: ["-0.015%", "-0.0025%", "0.02%", "0.01% ⭐", "0.02%"], star: -1 },
  { key: "leverage",   zh: "最高杠杆",     en: "Max Leverage",   vals: ["100x", "125x", "125x", "125x", "125x"],              star: -1 },
  { key: "copy",       zh: "跟单交易",     en: "Copy Trading",   vals: [false, true, true, true, "⭐最强"],                   star: 4 },
  { key: "web3",       zh: "Web3 钱包",    en: "Web3 Wallet",    vals: [true, "⭐最强", true, false, true],                   star: 1 },
  { key: "dex",        zh: "内置 DEX",     en: "Built-in DEX",   vals: [true, "⭐最强", false, false, false],                 star: 1 },
  { key: "tradfi",     zh: "TradFi 资产",  en: "TradFi Assets",  vals: ["⭐独有", false, false, false, false],                star: 0 },
  { key: "protect",    zh: "用户保护基金", en: "Protection Fund",vals: [true, true, true, true, "⭐$3亿"],                    star: 4 },
  { key: "rebate",     zh: "返佣比例",     en: "Rebate Rate",    vals: ["60% ⭐", "20%", "20%", "30%", "50%"],               star: 0 },
];

const TRUST_STATS = [
  { icon: "👥", val: "7亿+",    labelZh: "全球持币用户",    labelEn: "Global Crypto Users",    src: "Binance 2025年报" },
  { icon: "💹", val: "$86.2万亿", labelZh: "2025年全球交易量", labelEn: "2025 Global Volume",  src: "CoinGecko 年报" },
  { icon: "🏛️", val: "50+",    labelZh: "国家/地区持牌运营", labelEn: "Licensed Jurisdictions", src: "CryptoSlate 2025" },
  { icon: "🔒", val: "100%+",   labelZh: "五大交易所储备率",  labelEn: "Top 5 Reserve Ratios",  src: "Hacken / Armanino" },
];

// ─────────────────────────────────────────────────────────────────────────────
// K 线模拟器
// ─────────────────────────────────────────────────────────────────────────────
type Candle = { open: number; high: number; low: number; close: number };
type Dir = "long" | "short" | null;

function genCandles(n: number, start: number): Candle[] {
  const out: Candle[] = [];
  let p = start;
  for (let i = 0; i < n; i++) {
    const d = (Math.random() - 0.48) * p * 0.025;
    const o = p, c = p + d;
    out.push({ open: o, close: c, high: Math.max(o, c) + Math.random() * p * 0.01, low: Math.min(o, c) - Math.random() * p * 0.01 });
    p = c;
  }
  return out;
}

function KChart({ candles, highlightLast = false }: { candles: Candle[]; highlightLast?: boolean }) {
  if (!candles.length) return null;
  const W = 480, H = 160, pad = { t: 8, b: 18, l: 6, r: 6 };
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
  const prices = candles.flatMap(c => [c.high, c.low]);
  const minP = Math.min(...prices), maxP = Math.max(...prices), range = maxP - minP || 1;
  const toY = (p: number) => pad.t + cH - ((p - minP) / range) * cH;
  const gap = cW / candles.length, cw = Math.max(3, gap * 0.6);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
      {[0, 0.25, 0.5, 0.75, 1].map(t => <line key={t} x1={pad.l} x2={W - pad.r} y1={pad.t + cH * (1 - t)} y2={pad.t + cH * (1 - t)} stroke="#ffffff15" strokeWidth={0.5} />)}
      {candles.map((c, i) => {
        const x = pad.l + i * gap + gap / 2, green = c.close >= c.open, last = highlightLast && i === candles.length - 1;
        const col = last ? "#FFD700" : green ? "#22c55e" : "#ef4444";
        const bTop = toY(Math.max(c.open, c.close)), bBot = toY(Math.min(c.open, c.close)), bH = Math.max(1, bBot - bTop);
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={toY(c.high)} y2={toY(c.low)} stroke={col} strokeWidth={last ? 2 : 1} />
            <rect x={x - cw / 2} y={bTop} width={cw} height={bH} fill={col} opacity={last ? 1 : 0.85} rx={1} />
          </g>
        );
      })}
      <text x={W - pad.r + 2} y={pad.t + 4} fill="#ffffff50" fontSize={7}>{maxP.toFixed(0)}</text>
      <text x={W - pad.r + 2} y={H - pad.b + 4} fill="#ffffff50" fontSize={7}>{minP.toFixed(0)}</text>
    </svg>
  );
}

const SIM_COINS = [
  { slug: "btc", name: "BTC/USDT", price: 67000, emoji: "₿" },
  { slug: "eth", name: "ETH/USDT", price: 3500,  emoji: "Ξ" },
  { slug: "sol", name: "SOL/USDT", price: 180,   emoji: "◎" },
  { slug: "bnb", name: "BNB/USDT", price: 580,   emoji: "⬡" },
];
const LEVERAGES = [5, 10, 20, 50, 100];
const AMOUNTS   = [100, 500, 1000, 5000];

// ─────────────────────────────────────────────────────────────────────────────
// 主组件
// ─────────────────────────────────────────────────────────────────────────────
type Tab = "rebate" | "deep" | "intro";

export default function Exchanges() {
  const [, navigate] = useLocation();
  useScrollMemory();
  const { language, setLanguage } = useLanguage();
  const zh = language === "zh";

  const [tab, setTab] = useState<Tab>("rebate");
  const [expanded, setExpanded] = useState<string | null>(null);
  const deepRefs = useRef<Record<string, HTMLElement | null>>({});

  // DB data
  const { data: dbLinks } = trpc.exchanges.list.useQuery();
  const slugs = ["gate", "okx", "binance", "bybit", "bitget"];
  const getLink = (slug: string) => dbLinks?.find(l => l.slug === slug)?.referralLink ?? "#";
  const getCode = (slug: string) => dbLinks?.find(l => l.slug === slug)?.inviteCode ?? "";

  // Simulator state
  const [simStep, setSimStep] = useState<1 | 2 | 3 | 4>(1);
  const [coinIdx, setCoinIdx] = useState(0);
  const [leverage, setLeverage] = useState(10);
  const [amount, setAmount] = useState(100);
  const [dir, setDir] = useState<Dir>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [resultCandles, setResultCandles] = useState<Candle[]>([]);
  const [pnl, setPnl] = useState(0);
  const [pnlPct, setPnlPct] = useState(0);
  const [simRunning, setSimRunning] = useState(false);

  useEffect(() => { setCandles(genCandles(30, SIM_COINS[coinIdx].price)); }, [coinIdx]);

  const resetSim = useCallback(() => {
    setSimStep(1); setDir(null); setPnl(0); setPnlPct(0); setSimRunning(false);
    setCandles(genCandles(30, SIM_COINS[coinIdx].price)); setResultCandles([]);
  }, [coinIdx]);

  const runSim = useCallback((d: Dir) => {
    setDir(d); setSimRunning(true);
    const base = genCandles(30, SIM_COINS[coinIdx].price);
    setCandles(base);
    setTimeout(() => {
      const extra = genCandles(10, base[base.length - 1].close);
      setResultCandles([...base, ...extra]);
      const entry = base[base.length - 1].close, exit = extra[extra.length - 1].close;
      const chg = (exit - entry) / entry * leverage;
      const rawPnl = d === "long" ? chg : -chg;
      setPnl(amount * rawPnl); setPnlPct(rawPnl * 100); setSimRunning(false); setSimStep(4);
    }, 1200);
  }, [coinIdx, leverage, amount]);

  const coin = SIM_COINS[coinIdx];
  const gateLink = getLink("gate");

  // Tab config
  const TABS: { id: Tab; icon: string; labelZh: string; labelEn: string; descZh: string; descEn: string }[] = [
    { id: "rebate", icon: "💰", labelZh: "返佣对比", labelEn: "Rebate Compare", descZh: "手续费 · 邀请码 · 注册链接", descEn: "Fees · Invite Codes · Register" },
    { id: "deep",   icon: "🔍", labelZh: "各交易所详情", labelEn: "Exchange Details", descZh: "深度对比 · 功能矩阵 · 适合人群", descEn: "Deep Compare · Feature Matrix · Best For" },
    { id: "intro",  icon: "📚", labelZh: "交易所科普", labelEn: "Exchange 101", descZh: "币圈 vs 传统 · 模拟交易体验", descEn: "Crypto vs Traditional · Simulate a Trade" },
  ];

  const renderVal = (v: string | boolean) => {
    if (v === true)  return <Check size={13} className="text-green-400 mx-auto" />;
    if (v === false) return <X    size={13} className="text-red-400/50 mx-auto" />;
    if (typeof v === "string" && v.includes("⭐")) return <span className="text-yellow-400 font-semibold text-xs">{v}</span>;
    return <span className="text-xs text-gray-300">{v}</span>;
  };

  // ── Scroll to top when switching tabs ──
  const handleTabChange = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">

      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-40 bg-[#0A0F1E]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition shrink-0">
            <ArrowLeft size={15} />{zh ? "返回" : "Back"}
          </button>
          <span className="text-sm font-bold text-white/80 hidden sm:block">
            {zh ? "💰 交易所中心" : "💰 Exchange Hub"}
          </span>
          <div className="flex items-center gap-1 bg-white/5 rounded-full px-1 py-1 border border-white/10">
            <button onClick={() => setLanguage("zh")} className={`px-3 py-1 rounded-full text-xs font-medium transition ${language === "zh" ? "bg-yellow-400 text-black" : "text-white/50 hover:text-white"}`}>中文</button>
            <button onClick={() => setLanguage("en")} className={`px-3 py-1 rounded-full text-xs font-medium transition ${language === "en" ? "bg-yellow-400 text-black" : "text-white/50 hover:text-white"}`}>EN</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative py-14 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-400/8 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 text-xs font-bold px-4 py-1.5 rounded-full mb-5">
            <Star size={11} />{zh ? "全球 5 大主流交易所 · 一站式对比" : "Top 5 Global Exchanges · All-in-One"}
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            {zh ? "交易所中心" : "Exchange Hub"}
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            {zh ? "返佣对比、深度评测、新手科普，帮你找到最适合的平台，让每一笔交易都在省钱" : "Rebate comparison, deep reviews & beginner guides — find your perfect exchange"}
          </p>
        </div>
      </section>

      {/* ── Trust Stats ── */}
      <section className="py-6 px-4 border-y border-white/8 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
            {TRUST_STATS.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl font-black text-yellow-400">{s.val}</div>
                <div className="text-xs text-white font-semibold">{zh ? s.labelZh : s.labelEn}</div>
                <div className="text-xs text-white/40 mt-0.5">来源：{s.src}</div>
              </div>
            ))}
          </div>
          {/* Authority badges */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { icon: "🏅", t: zh ? "CoinGlass 权威评分" : "CoinGlass Ratings", s: "Binance 94.33 / OKX 88.77 / Bitget 83.10" },
              { icon: "🔐", t: zh ? "Hacken 每月储备审计" : "Hacken Monthly Audit", s: zh ? "Bybit ETH 储备率 101%" : "Bybit ETH reserve 101%" },
              { icon: "📋", t: zh ? "Armanino LLP 审计" : "Armanino LLP Audit", s: zh ? "Gate.io 储备率 125%" : "Gate.io reserve 125%" },
              { icon: "🌍", t: zh ? "多国持牌合规" : "Multi-Country Licensed", s: zh ? "OKX 德国/波兰 · Bybit 荷兰" : "OKX Germany/Poland · Bybit Netherlands" },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                <span className="text-base">{b.icon}</span>
                <div><div className="text-xs font-bold text-white">{b.t}</div><div className="text-xs text-white/40">{b.s}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tab Bar ── */}
      <div className="sticky top-14 z-30 bg-[#0A0F1E]/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {TABS.map(t => (
              <button key={t.id} onClick={() => handleTabChange(t.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-xl transition-all ${tab === t.id ? "bg-yellow-400/12 border border-yellow-400/35 text-yellow-400" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
                <span className="text-lg leading-none">{t.icon}</span>
                <span className={`text-xs font-bold leading-none ${tab === t.id ? "text-yellow-400" : ""}`}>{zh ? t.labelZh : t.labelEn}</span>
                <span className="text-xs text-white/30 leading-none hidden sm:block">{zh ? t.descZh : t.descEn}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1 — 返佣对比
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "rebate" && (
        <div className="py-10 px-4 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{zh ? "💰 手续费 & 返佣对比" : "💰 Fee & Rebate Comparison"}</h2>
            <p className="text-white/50 text-sm">{zh ? "通过下方邀请链接注册，系统自动绑定返佣，无需额外操作" : "Register via referral links below — rebates are automatically linked"}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {slugs.map(slug => {
              const s = STATIC[slug];
              const link = getLink(slug);
              const code = getCode(slug);
              return (
                <div key={slug} className={`bg-white/[0.04] border ${s.borderCls} rounded-2xl p-6 flex flex-col hover:bg-white/[0.07] transition-all`}>
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{s.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{slug.charAt(0).toUpperCase() + slug.slice(1) === "Gate" ? "Gate.io" : slug.charAt(0).toUpperCase() + slug.slice(1)}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.badgeCls}`}>{zh ? s.badge.zh : s.badge.en}</span>
                      </div>
                      <p className={`text-xs ${s.accentCls} mt-0.5`}>{zh ? s.tagline.zh : s.tagline.en}</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 mb-5 leading-relaxed">{zh ? s.desc.zh : s.desc.en}</p>

                  {/* Fees */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className={`text-xs font-semibold mb-1.5 ${s.accentCls}`}>{zh ? "现货手续费" : "Spot Fees"}</p>
                      <p className="text-xs text-white/50">Maker: <span className="text-white font-bold">{s.spotMaker}</span></p>
                      <p className="text-xs text-white/50">Taker: <span className="text-white font-bold">{s.spotTaker}</span></p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className={`text-xs font-semibold mb-1.5 ${s.accentCls}`}>{zh ? "合约手续费" : "Futures Fees"}</p>
                      <p className="text-xs text-white/50">Maker: <span className={`font-bold ${s.futMaker.startsWith("-") ? "text-green-400" : "text-white"}`}>{s.futMaker}</span></p>
                      <p className="text-xs text-white/50">Taker: <span className="text-white font-bold">{s.futTaker}</span></p>
                    </div>
                  </div>

                  {/* Rebate */}
                  <div className="mb-4 pb-4 border-b border-white/10">
                    <p className={`text-xs font-semibold mb-1 ${s.accentCls}`}>{zh ? "返佣友好度" : "Rebate Friendliness"}</p>
                    <p className="text-lg">{s.rebateStars}</p>
                  </div>

                  {/* Invite Code */}
                  <div className="mb-5 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Key size={11} className={s.accentCls} />
                      <p className={`text-xs font-semibold ${s.accentCls}`}>{zh ? "邀请码" : "Invite Code"}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
                      <code className="font-mono font-bold text-white tracking-widest text-sm">{code}</code>
                      <button onClick={() => navigator.clipboard.writeText(code)} className={`text-xs ${s.accentCls} hover:opacity-70 transition ml-2`}>{zh ? "复制" : "Copy"}</button>
                    </div>
                    <p className="text-xs text-white/30 mt-1">{zh ? "若链接无法跳转，注册时手动填入邀请码" : "If link fails, enter invite code manually"}</p>
                  </div>

                  {/* Buttons */}
                  <div className="mt-auto space-y-2">
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-xl py-3 font-bold text-sm text-black transition hover:opacity-90"
                      style={{ background: s.color }}>
                      <Gift size={14} />{zh ? "注册并自动获得返佣" : "Register & Get Rebates"}<ExternalLink size={12} />
                    </a>
                    <button onClick={() => navigate("/contact")}
                      className={`w-full border rounded-xl py-2.5 font-semibold text-xs transition hover:bg-white/5 ${s.borderCls} ${s.accentCls}`}>
                      {zh ? "联系我们配置返佣" : "Contact Us for Rebates"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 space-y-4">
            <div className="bg-yellow-400/10 border-2 border-yellow-400/40 rounded-2xl p-7 text-center">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">{zh ? "🎁 新用户直接注册即可获得返佣！" : "🎁 New users get rebates instantly upon registration!"}</h3>
              <p className="text-white/70">{zh ? "通过上方链接注册，系统自动绑定返佣，无需额外操作" : "Register via the links above — rebates are automatically linked"}</p>
            </div>
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-5">
              <p className="text-yellow-400/80 font-semibold mb-3 text-sm">{zh ? "⚠️ 若链接无法跳转，注册时请手动填写邀请码：" : "⚠️ If the link fails, enter the invite code manually:"}</p>
              <div className="space-y-2">
                {[["Gate.io", "FORMANUS"], [zh ? "其他交易所（OKX / Binance / Bybit / Bitget）" : "Others (OKX / Binance / Bybit / Bitget)", "MANUS"]].map(([label, code]) => (
                  <div key={code} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                    <span className="text-white/50 text-sm">{label}</span>
                    <code className="font-mono font-black text-yellow-400 text-lg tracking-widest">{code}</code>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-7 text-center">
              <MessageCircle className="text-yellow-400 mx-auto mb-3" size={32} />
              <h3 className="text-xl font-bold mb-2">{zh ? "有返佣疑问或任何问题？" : "Questions about rebates?"}</h3>
              <p className="text-white/50 mb-5">{zh ? "联系我们，专人为您解答并配置高额度返佣方案" : "Contact us — our team will set up a high-value rebate plan for you"}</p>
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8" onClick={() => navigate("/contact")}>
                <MessageCircle className="mr-2" size={16} />{zh ? "立即联系我们" : "Contact Us Now"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — 各交易所详情
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "deep" && (
        <div className="py-10 px-4 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-400/10 border border-blue-400/25 text-blue-400 text-xs px-4 py-1.5 rounded-full mb-4">
              <Star size={11} />{zh ? "数据来源：CoinMarketCap · CoinGecko · CoinGlass 官方数据" : "Data: CoinMarketCap · CoinGecko · CoinGlass"}
            </div>
            <h2 className="text-3xl font-bold mb-2">{zh ? "🔍 五大交易所深度对比" : "🔍 Deep Comparison: Top 5 Exchanges"}</h2>
            <p className="text-white/50">{zh ? "帮你找到最适合自己的平台，让返佣价值最大化" : "Find the best platform for you and maximize your rebate value"}</p>
          </div>

          {/* Quick jump */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {slugs.map(slug => (
              <button key={slug} onClick={() => setTimeout(() => deepRefs.current[slug]?.scrollIntoView({ behavior: "smooth", block: "start" }), 50)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-white/15 bg-white/5 hover:border-blue-400/50 text-white/60 hover:text-white transition">
                <span>{STATIC[slug].emoji}</span>
                <span>{slug === "gate" ? "Gate.io" : slug.charAt(0).toUpperCase() + slug.slice(1)}</span>
              </button>
            ))}
            <button onClick={() => document.getElementById("matrix")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-white/15 bg-white/5 hover:border-blue-400/50 text-white/60 hover:text-white transition">
              <TrendingUp size={13} />{zh ? "功能对比表" : "Feature Matrix"}
            </button>
          </div>

          {/* Exchange cards */}
          <div className="space-y-6">
            {slugs.map(slug => {
              const s = STATIC[slug];
              const name = slug === "gate" ? "Gate.io" : slug.charAt(0).toUpperCase() + slug.slice(1);
              const link = getLink(slug), code = getCode(slug);
              return (
                <section key={slug} ref={el => { deepRefs.current[slug] = el; }}
                  className={`rounded-2xl border ${s.borderCls} bg-gradient-to-br ${s.bgGrad} overflow-hidden scroll-mt-32`}>
                  {/* Header */}
                  <div className="px-5 sm:px-7 pt-6 pb-4 flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-5xl">{s.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-2xl font-black">{name}</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.badgeCls}`}>{zh ? s.badge.zh : s.badge.en}</span>
                        </div>
                        <p className={`text-sm font-medium ${s.accentCls}`}>{zh ? s.tagline.zh : s.tagline.en}</p>
                        <p className="text-xs text-white/50 mt-1 leading-relaxed">{zh ? s.desc.zh : s.desc.en}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end shrink-0">
                      <a href={link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-black hover:opacity-90 transition"
                        style={{ background: s.color }}>
                        <Gift size={13} />{zh ? "注册领返佣" : "Register & Rebate"}<ExternalLink size={11} />
                      </a>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: `${s.color}22`, color: s.color }}>{code}</code>
                        <button onClick={() => navigator.clipboard.writeText(code)} className="text-xs text-white/30 hover:text-white transition">{zh ? "复制" : "Copy"}</button>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="px-5 sm:px-7 pb-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      [zh ? "成立" : "Founded", s.founded],
                      [zh ? "币种" : "Coins", s.coins],
                      [zh ? "日交易量" : "Volume", s.volume],
                      [zh ? "储备率" : "Reserve", s.reserve],
                      [zh ? "最高杠杆" : "Max Lev", s.leverage],
                      [zh ? "平台币" : "Token", s.token],
                    ].map(([label, val]) => (
                      <div key={label} className="bg-black/20 rounded-lg p-2 text-center">
                        <p className="text-xs text-white/30 mb-0.5">{label}</p>
                        <p className={`text-sm font-bold ${s.accentCls}`}>{val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Highlights */}
                  <div className="px-5 sm:px-7 pb-4">
                    <h4 className="text-sm font-bold mb-3">{zh ? "核心亮点" : "Key Highlights"}</h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {s.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-black/20 rounded-lg p-3">
                          <span className="text-lg shrink-0">{h.icon}</span>
                          <p className="text-xs text-white/70 leading-relaxed">{zh ? h.zh : h.en}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pros / Cons / Best For */}
                  <div className="px-5 sm:px-7 pb-5 grid sm:grid-cols-3 gap-3">
                    <div className="bg-green-950/30 border border-green-500/20 rounded-xl p-4">
                      <h5 className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1"><Check size={11} />{zh ? "优势" : "Pros"}</h5>
                      <ul className="space-y-1.5">{(zh ? s.pros.zh : s.pros.en).map((p, i) => <li key={i} className="text-xs text-white/60 flex items-start gap-1.5"><span className="text-green-400 shrink-0">+</span>{p}</li>)}</ul>
                    </div>
                    <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4">
                      <h5 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1"><X size={11} />{zh ? "劣势" : "Cons"}</h5>
                      <ul className="space-y-1.5">{(zh ? s.cons.zh : s.cons.en).map((c, i) => <li key={i} className="text-xs text-white/60 flex items-start gap-1.5"><span className="text-red-400 shrink-0">−</span>{c}</li>)}</ul>
                    </div>
                    <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4">
                      <h5 className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-1"><Users size={11} />{zh ? "适合人群" : "Best For"}</h5>
                      <p className="text-xs text-white/60 leading-relaxed">{zh ? s.bestFor.zh : s.bestFor.en}</p>
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-white/30 mb-1">{zh ? "邀请码" : "Invite Code"}</p>
                        <code className="text-sm font-mono font-bold px-2 py-0.5 rounded" style={{ background: `${s.color}22`, color: s.color }}>{code}</code>
                      </div>
                    </div>
                  </div>

                  {/* Fee detail toggle */}
                  <div className="px-5 sm:px-7 pb-5">
                    <button onClick={() => setExpanded(expanded === slug ? null : slug)}
                      className="w-full flex items-center justify-between bg-black/20 hover:bg-black/30 rounded-xl px-4 py-3 transition">
                      <span className="text-sm font-medium text-white/60">{zh ? "查看详细费率" : "View Detailed Fees"}</span>
                      {expanded === slug ? <ChevronUp size={15} className="text-white/40" /> : <ChevronDown size={15} className="text-white/40" />}
                    </button>
                    {expanded === slug && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[[zh ? "现货 Maker" : "Spot Maker", s.spotMaker], [zh ? "现货 Taker" : "Spot Taker", s.spotTaker], [zh ? "最高杠杆" : "Max Leverage", s.leverage], [zh ? "平台币" : "Token", s.token]].map(([label, val]) => (
                          <div key={label} className="bg-black/20 rounded-lg p-3 text-center">
                            <p className="text-xs text-white/30 mb-1">{label}</p>
                            <p className={`text-base font-bold ${s.accentCls}`}>{val}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Feature Matrix */}
          <section id="matrix" className="mt-10 scroll-mt-32">
            <h3 className="text-2xl font-bold mb-6 text-center">{zh ? "📊 功能对比矩阵" : "📊 Feature Comparison Matrix"}</h3>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left px-4 py-3 text-white/40 font-semibold w-28 sticky left-0 bg-[#0A0F1E]">{zh ? "功能" : "Feature"}</th>
                    {slugs.map(slug => (
                      <th key={slug} className="px-3 py-3 text-center min-w-[90px]">
                        <div className="text-xl">{STATIC[slug].emoji}</div>
                        <div className="text-xs font-bold text-white">{slug === "gate" ? "Gate.io" : slug.charAt(0).toUpperCase() + slug.slice(1)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_MATRIX.map((row, fi) => (
                    <tr key={row.key} className={fi % 2 === 0 ? "bg-white/[0.02]" : ""}>
                      <td className="px-4 py-3 text-white/40 text-xs font-medium sticky left-0 bg-[#0A0F1E]">{zh ? row.zh : row.en}</td>
                      {row.vals.map((v, vi) => (
                        <td key={vi} className={`px-3 py-3 text-center ${row.star === vi ? "bg-yellow-400/8" : ""}`}>{renderVal(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CTA */}
          <div className="mt-10 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 text-center">
            <Gift className="text-blue-400 mx-auto mb-3" size={26} />
            <h4 className="text-lg font-bold mb-2">{zh ? "通过邀请链接注册，立享最高 60% 返佣" : "Register via referral link, enjoy up to 60% rebate"}</h4>
            <p className="text-white/50 text-sm mb-4">{zh ? "有任何返佣疑问，请联系我们，专人为您解答" : "For any rebate questions, contact us for dedicated support"}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => handleTabChange("rebate")} className="bg-blue-500 hover:bg-blue-400 text-white font-bold">
                <ExternalLink size={15} className="mr-2" />{zh ? "查看所有返佣链接" : "View All Referral Links"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/contact")} className="border-blue-400/40 text-blue-400 hover:bg-blue-400/10">
                <Shield size={15} className="mr-2" />{zh ? "联系我们获取帮助" : "Contact Us for Help"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3 — 交易所科普
      ══════════════════════════════════════════════════════════════════════ */}
      {tab === "intro" && (
        <div className="py-10 px-4 max-w-3xl mx-auto space-y-14">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 text-xs font-bold px-4 py-2 rounded-full">
              <span className="animate-pulse">●</span>{zh ? "完全免费 · 无需注册" : "100% Free · No Registration"}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">{zh ? "币圈交易 vs 传统交易" : "Crypto Trading vs Traditional Trading"}</h2>
            <p className="text-white/50 text-lg">{zh ? "3 分钟了解核心差异，再亲手模拟一笔永续合约" : "3 min to understand key differences, then simulate a perpetual contract trade"}</p>
          </div>

          {/* Part 1: Comparison */}
          <div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
              <span className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">1</span>
              {zh ? "核心差异对比" : "Key Differences"}
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-3 text-center text-xs font-bold uppercase tracking-wider text-white/30 px-1">
              <div>{zh ? "对比项" : "Category"}</div>
              <div className="text-yellow-400">{zh ? "🪙 币圈" : "🪙 Crypto"}</div>
              <div>{zh ? "📈 传统市场" : "📈 Traditional"}</div>
            </div>
            <div className="space-y-3">
              {[
                { icon: <Clock size={22} className="text-yellow-400" />, title: zh ? "交易时间" : "Trading Hours", crypto: zh ? "7×24 小时不间断，节假日照常" : "24/7 non-stop, including holidays", trad: zh ? "工作日 9:30–15:00，节假日休市" : "Weekdays 9:30–15:00, closed on holidays" },
                { icon: <Globe size={22} className="text-yellow-400" />, title: zh ? "全球准入" : "Global Access", crypto: zh ? "无国界，手机即可开户，5 分钟完成" : "Borderless, open account in 5 min on mobile", trad: zh ? "需要本地券商账户，开户流程繁琐" : "Requires local broker, complex onboarding" },
                { icon: <Zap size={22} className="text-yellow-400" />, title: zh ? "杠杆倍数" : "Leverage", crypto: zh ? "最高 125x 杠杆，小资金撬动大收益" : "Up to 125x leverage, small capital big gains", trad: zh ? "股票通常 1–2x，期货 5–10x" : "Stocks 1–2x, futures 5–10x" },
                { icon: <TrendingDown size={22} className="text-yellow-400" />, title: zh ? "做空机制" : "Short Selling", crypto: zh ? "随时做空任意币种，下跌也能盈利" : "Short any coin anytime, profit from drops", trad: zh ? "做空门槛高，需要融券，成本高" : "High barrier, requires margin lending" },
                { icon: <BarChart2 size={22} className="text-yellow-400" />, title: zh ? "波动幅度" : "Volatility", crypto: zh ? "日波动 5–20%，机会更多" : "5–20% daily swings, more opportunities", trad: zh ? "A 股涨跌停 ±10%，波动受限" : "A-shares ±10% limit, restricted movement" },
                { icon: <Shield size={22} className="text-yellow-400" />, title: zh ? "资产透明度" : "Transparency", crypto: zh ? "链上可查，储备率公开可验证" : "On-chain verifiable, public reserve ratios", trad: zh ? "依赖监管机构，信息不对称" : "Relies on regulators, information asymmetry" },
              ].map((item, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 bg-white/[0.04] border border-white/10 rounded-xl p-4 items-start hover:border-yellow-400/30 transition">
                  <div className="flex flex-col items-center gap-1 text-center">{item.icon}<span className="text-xs font-semibold">{item.title}</span></div>
                  <div className="bg-yellow-400/10 rounded-lg p-3 text-xs text-yellow-400 font-medium leading-relaxed flex items-start gap-1">
                    <CheckCircle2 size={11} className="shrink-0 mt-0.5" />{item.crypto}
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-xs text-white/40 leading-relaxed flex items-start gap-1">
                    <span className="text-yellow-600/60 mt-0.5 shrink-0">⚠</span>{item.trad}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 text-center">
              <p className="text-yellow-400 font-bold">{zh ? "💡 币圈独有优势：做多做空都能赚，24 小时随时交易" : "💡 Crypto exclusive: profit from both rises and falls, trade 24/7"}</p>
            </div>
          </div>

          {/* Part 2: Perpetual Contract */}
          <div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
              <span className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">2</span>
              {zh ? "什么是永续合约？" : "What is a Perpetual Contract?"}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: "🔄", t: zh ? "永不到期" : "Never Expires", d: zh ? "不像期货有到期日，永续合约可以无限期持有，随时开平仓" : "Unlike futures, perpetual contracts have no expiry date — hold as long as you want" },
                { icon: "⚡", t: zh ? "杠杆放大" : "Leverage Amplified", d: zh ? "用 100 USDT 开 10x 杠杆，等于控制 1000 USDT 的仓位，收益和亏损同步放大" : "With $100 and 10x leverage, you control $1,000 position — gains and losses are amplified" },
                { icon: "📉", t: zh ? "双向交易" : "Two-Way Trading", d: zh ? "做多（Long）= 看涨，价格上涨盈利；做空（Short）= 看跌，价格下跌盈利" : "Long = bullish, profit when price rises; Short = bearish, profit when price falls" },
                { icon: "🛡️", t: zh ? "强制平仓" : "Liquidation", d: zh ? "亏损超过保证金时触发强平，最多亏损本金，不会倒欠交易所" : "Forced close when losses exceed margin — you can only lose your initial capital" },
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.04] border border-white/10 rounded-xl p-5 flex gap-4 hover:border-yellow-400/30 transition">
                  <div className="text-3xl shrink-0">{item.icon}</div>
                  <div><h4 className="font-bold mb-1">{item.t}</h4><p className="text-white/50 text-sm leading-relaxed">{item.d}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Part 3: Simulator */}
          <div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
              <span className="bg-yellow-400 text-black rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">3</span>
              {zh ? "亲手模拟一笔交易" : "Simulate a Trade Yourself"}
            </h3>
            <p className="text-white/40 mb-6 text-sm">{zh ? "以下为模拟环境，数据随机生成，不代表真实市场" : "Simulated environment only — random data, not real market"}</p>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${simStep > s ? "bg-yellow-400 text-black" : simStep === s ? "bg-yellow-400 text-black ring-4 ring-yellow-400/25" : "bg-white/10 text-white/40"}`}>
                    {simStep > s ? <CheckCircle2 size={15} /> : s}
                  </div>
                  <div className={`text-xs font-medium ${simStep >= s ? "text-white" : "text-white/30"}`}>
                    {s === 1 ? (zh ? "选币种" : "Choose Coin") : s === 2 ? (zh ? "设置仓位" : "Set Position") : (zh ? "开仓方向" : "Direction")}
                  </div>
                  {s < 3 && <div className={`flex-1 h-0.5 ${simStep > s ? "bg-yellow-400" : "bg-white/10"}`} />}
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{coin.emoji}</span>
                  <div><div className="font-bold">{coin.name}</div><div className="text-xs text-white/40">{zh ? "参考价" : "Ref Price"}: ${coin.price.toLocaleString()}</div></div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setCandles(genCandles(30, coin.price)); setResultCandles([]); if (simStep === 4) setSimStep(3); }} className="text-white/40 hover:text-yellow-400 gap-1">
                  <RefreshCw size={13} />{zh ? "换一张" : "Refresh"}
                </Button>
              </div>
              <KChart candles={resultCandles.length > 0 ? resultCandles : candles} highlightLast={simStep === 4} />
              {simStep === 4 && <div className="mt-2 text-center text-xs text-yellow-400/60">{zh ? "↑ 金色蜡烛 = 您的平仓点" : "↑ Gold candle = your exit point"}</div>}
            </div>

            {/* Step 1 */}
            {simStep === 1 && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg">{zh ? "第一步：选择交易币种" : "Step 1: Choose a Coin"}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {SIM_COINS.map((c, i) => (
                    <button key={c.slug} onClick={() => setCoinIdx(i)}
                      className={`p-4 rounded-xl border-2 text-left transition ${coinIdx === i ? "border-yellow-400 bg-yellow-400/10" : "border-white/10 bg-white/5 hover:border-yellow-400/40"}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.emoji}</span>
                        <div><div className="font-bold">{c.name}</div><div className="text-xs text-white/40">≈ ${c.price.toLocaleString()}</div></div>
                      </div>
                    </button>
                  ))}
                </div>
                <Button className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6 text-lg" onClick={() => setSimStep(2)}>
                  {zh ? "已选择，下一步 →" : "Confirm & Next →"}<ChevronRight size={18} className="ml-1" />
                </Button>
              </div>
            )}

            {/* Step 2 */}
            {simStep === 2 && (
              <div className="space-y-6">
                <h4 className="font-bold text-lg">{zh ? "第二步：设置仓位" : "Step 2: Set Your Position"}</h4>
                <div>
                  <p className="text-sm text-white/50 mb-3">{zh ? "选择杠杆倍数" : "Choose Leverage"}</p>
                  <div className="flex gap-2 flex-wrap">
                    {LEVERAGES.map(l => <button key={l} onClick={() => setLeverage(l)} className={`px-4 py-2 rounded-lg border font-bold text-sm transition ${leverage === l ? "border-yellow-400 bg-yellow-400/15 text-yellow-400" : "border-white/15 text-white/50 hover:border-yellow-400/40"}`}>{l}x</button>)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-3">{zh ? "投入金额（USDT）" : "Amount (USDT)"}</p>
                  <div className="flex gap-2 flex-wrap">
                    {AMOUNTS.map(a => <button key={a} onClick={() => setAmount(a)} className={`px-4 py-2 rounded-lg border font-bold text-sm transition ${amount === a ? "border-yellow-400 bg-yellow-400/15 text-yellow-400" : "border-white/15 text-white/50 hover:border-yellow-400/40"}`}>${a}</button>)}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-sm text-white/40 mb-2">{zh ? "仓位摘要" : "Position Summary"}</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div><p className="text-xs text-white/30">{zh ? "投入" : "Capital"}</p><p className="font-bold">${amount}</p></div>
                    <div><p className="text-xs text-white/30">{zh ? "杠杆" : "Leverage"}</p><p className="font-bold text-yellow-400">{leverage}x</p></div>
                    <div><p className="text-xs text-white/30">{zh ? "控制仓位" : "Position"}</p><p className="font-bold">${(amount * leverage).toLocaleString()}</p></div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-white/15 text-white/50" onClick={() => setSimStep(1)}>{zh ? "← 上一步" : "← Back"}</Button>
                  <Button className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold" onClick={() => setSimStep(3)}>{zh ? "下一步 →" : "Next →"}</Button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {(simStep === 3 || (simStep === 4 && simRunning)) && (
              <div className="space-y-4">
                <h4 className="font-bold text-lg">{zh ? "第三步：选择开仓方向" : "Step 3: Choose Direction"}</h4>
                <p className="text-sm text-white/50">{zh ? "你认为接下来价格会涨还是跌？" : "Do you think the price will go up or down?"}</p>
                <div className="grid grid-cols-2 gap-4">
                  <button disabled={simRunning} onClick={() => runSim("long")}
                    className={`p-5 rounded-2xl border-2 font-bold text-lg transition ${dir === "long" ? "border-green-500 bg-green-500/15 text-green-400" : "border-white/15 bg-white/5 hover:border-green-500/50"} disabled:opacity-50`}>
                    <TrendingUp size={26} className="mx-auto mb-2 text-green-400" />
                    {zh ? "做多 Long" : "Long"}
                    <p className="text-xs font-normal text-white/40 mt-1">{zh ? "看涨，价格上涨盈利" : "Bullish, profit when price rises"}</p>
                  </button>
                  <button disabled={simRunning} onClick={() => runSim("short")}
                    className={`p-5 rounded-2xl border-2 font-bold text-lg transition ${dir === "short" ? "border-red-500 bg-red-500/15 text-red-400" : "border-white/15 bg-white/5 hover:border-red-500/50"} disabled:opacity-50`}>
                    <TrendingDown size={26} className="mx-auto mb-2 text-red-400" />
                    {zh ? "做空 Short" : "Short"}
                    <p className="text-xs font-normal text-white/40 mt-1">{zh ? "看跌，价格下跌盈利" : "Bearish, profit when price falls"}</p>
                  </button>
                </div>
                {simRunning && <div className="text-center text-yellow-400 animate-pulse py-4">{zh ? "⏳ 行情模拟中..." : "⏳ Simulating market..."}</div>}
                <Button variant="outline" className="w-full border-white/15 text-white/50" onClick={() => setSimStep(2)}>{zh ? "← 上一步" : "← Back"}</Button>
              </div>
            )}

            {/* Step 4: Result */}
            {simStep === 4 && !simRunning && (
              <div className="space-y-4">
                <div className={`rounded-2xl border-2 p-6 text-center ${pnl > 0 ? "border-green-500 bg-green-950/30" : "border-red-500 bg-red-950/30"}`}>
                  <div className="text-5xl mb-3">{pnl > 0 ? "🎉" : "😅"}</div>
                  <h4 className="text-2xl font-black mb-1" style={{ color: pnl > 0 ? "#22c55e" : "#ef4444" }}>
                    {pnl > 0 ? (zh ? "盈利！" : "Profit!") : (zh ? "亏损" : "Loss")} {pnl > 0 ? "+" : ""}{pnlPct.toFixed(1)}%
                  </h4>
                  <p className="text-3xl font-black mb-2" style={{ color: pnl > 0 ? "#22c55e" : "#ef4444" }}>
                    {pnl > 0 ? "+" : ""}{pnl.toFixed(2)} USDT
                  </p>
                  <p className="text-sm text-white/40">{zh ? `投入 $${amount} × ${leverage}x 杠杆 = 控制 $${(amount * leverage).toLocaleString()} 仓位` : `$${amount} × ${leverage}x leverage = $${(amount * leverage).toLocaleString()} position`}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white/50 leading-relaxed">
                  <p className="font-bold text-white mb-2">💡 {zh ? "这说明了什么？" : "What does this mean?"}</p>
                  <p>{zh ? `杠杆是双刃剑：${leverage}x 杠杆让你的收益放大了 ${leverage} 倍，但亏损也同样放大。实际交易中，设置止损是保护本金的关键。` : `Leverage is a double-edged sword: ${leverage}x amplifies your gains ${leverage}x, but losses too. In real trading, setting stop-losses is key to protecting capital.`}</p>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold" onClick={resetSim}>
                    <RefreshCw size={15} className="mr-2" />{zh ? "再来一次" : "Try Again"}
                  </Button>
                  <Button variant="outline" className="flex-1 border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10" onClick={() => window.open(gateLink, "_blank")}>
                    <ExternalLink size={15} className="mr-2" />{zh ? "开始真实交易" : "Start Real Trading"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Trust & Safety */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Lock size={18} className="text-yellow-400" />{zh ? "交易所安全吗？官方数据背书" : "Are Exchanges Safe? Official Data"}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "🏦", t: zh ? "储备金证明" : "Proof of Reserves", d: zh ? "五大交易所均与第三方审计机构合作，储备率 100%+，用户资产有保障" : "All 5 exchanges partner with third-party auditors, reserve ratios 100%+" },
                { icon: "🏛️", t: zh ? "监管牌照" : "Regulatory Licenses", d: zh ? "OKX 持有德国/波兰牌照，Bybit 持有荷兰牌照，合规运营有法律保障" : "OKX licensed in Germany/Poland, Bybit in Netherlands — legally compliant" },
                { icon: "🛡️", t: zh ? "用户保护基金" : "User Protection Fund", d: zh ? "Bitget 设立 $3 亿保护基金，Binance 设立 SAFU 基金，极端情况赔付用户" : "Bitget $300M protection fund, Binance SAFU fund — user compensation in extreme cases" },
                { icon: "📊", t: zh ? "权威评分认证" : "Authority Ratings", d: zh ? "CoinGlass 综合评分：Binance 94.33 / OKX 88.77 / Bitget 83.10，全球权威认可" : "CoinGlass scores: Binance 94.33 / OKX 88.77 / Bitget 83.10 — globally recognized" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 bg-white/5 rounded-xl p-4">
                  <span className="text-2xl shrink-0">{item.icon}</span>
                  <div><h4 className="font-bold text-sm mb-1">{item.t}</h4><p className="text-xs text-white/50 leading-relaxed">{item.d}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-5 bg-yellow-400/10 border border-yellow-400/25 rounded-xl p-4 text-center">
              <p className="text-yellow-400 font-bold">{zh ? "💡 新手建议：从 Gate.io 或 OKX 开始，储备透明、监管合规、返佣最高" : "💡 Beginner tip: Start with Gate.io or OKX — transparent reserves, regulatory compliance, highest rebates"}</p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] border-2 border-yellow-400/30 rounded-2xl p-8 text-center space-y-4">
            <div className="text-4xl">🚀</div>
            <h3 className="text-2xl font-bold">{zh ? "准备好了？开始真实交易" : "Ready? Start Real Trading"}</h3>
            <p className="text-white/50">{zh ? "通过我们的邀请链接注册，立享高额返佣，每笔交易都在省钱" : "Register via our referral link and enjoy high rebates on every trade"}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-lg px-8" onClick={() => window.open(gateLink, "_blank")}>
                {zh ? "注册 Gate.io（推荐）" : "Register Gate.io (Recommended)"}
              </Button>
              <Button size="lg" variant="outline" className="border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10" onClick={() => handleTabChange("rebate")}>
                {zh ? "查看全部交易所" : "All Exchanges"}
              </Button>
            </div>
            <p className="text-xs text-white/30">{zh ? "邀请码：FORMANUS（Gate.io）/ MANUS（其他交易所）" : "Invite code: FORMANUS (Gate.io) / MANUS (others)"}</p>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="py-8 px-4 border-t border-white/10 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40 mb-4 text-sm">{zh ? "选择适合您的交易所，开始享受手续费折扣吧！" : "Choose the right exchange and start enjoying fee discounts!"}</p>
          <Button onClick={goBack} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold">{zh ? "返回上一页" : "Back"}</Button>
        </div>
      </footer>

      <ScrollToTopButton color="yellow" />
    </div>
  );
}
