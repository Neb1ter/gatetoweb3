import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import {
  ArrowLeft, ChevronRight, Check, X, Star, ExternalLink,
  Menu, Shield, TrendingUp, Zap, Globe, Users, Gift,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Exchange static data ─────────────────────────────────────────────────────

const EXCHANGES = [
  {
    slug: 'gate',
    name: 'Gate.io',
    emoji: '🟢',
    color: '#00B173',
    bgGradient: 'from-emerald-950 to-gray-900',
    borderColor: 'border-emerald-500/40',
    accentColor: 'text-emerald-400',
    founded: '2013',
    headquarters: '开曼群岛',
    coins: '3,600+',
    dailyVolume: '$18.8亿',
    reserves: '$49.3亿',
    reserveRatio: '125%',
    maxLeverage: '100x',
    makerFee: '0.15%',
    takerFee: '0.15%',
    platformToken: 'GT',
    tagline: { zh: '最多新币 · 最透明储备 · TradFi先锋', en: 'Most Altcoins · Highest Transparency · TradFi Pioneer' },
    badge: { zh: '新币最多', en: 'Most Altcoins' },
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description: {
      zh: 'Gate.io 成立于 2013 年，是全球历史最悠久的主流加密交易所之一。作为全球首家承诺 100% 储备的主流交易所，Gate 与美国顶级审计公司 Armanino LLP 合作，通过开源 Merkle Tree 方案让用户随时验证资产。2025 年 4 月，平台升级为新域名 Gate.com，全面迈向下一代加密交易所。',
      en: 'Gate.io, founded in 2013, is one of the oldest mainstream crypto exchanges globally. As the first mainstream exchange to commit to 100% reserves, Gate partners with US auditing firm Armanino LLP and uses open-source Merkle Tree verification. In April 2025, the platform upgraded to Gate.com.',
    },
    highlights: [
      { icon: '🪙', zh: '支持 3,600+ 种加密货币，远超其他主流交易所', en: 'Supports 3,600+ cryptocurrencies, far more than other major exchanges' },
      { icon: '🔍', zh: '全球首家 100% 储备承诺，储备率高达 125%', en: 'World\'s first 100% reserve commitment, reserve ratio up to 125%' },
      { icon: '🏦', zh: '支持黄金代币 (XAUt) 等传统金融资产交易，TradFi 友好', en: 'Supports gold tokens (XAUt) and TradFi assets — unique among top exchanges' },
      { icon: '🚀', zh: 'Gate Alpha 提供早期高潜力链上资产，结合 CEX 便利与 DEX 自由', en: 'Gate Alpha offers early-stage on-chain assets combining CEX convenience with DEX freedom' },
      { icon: '🎯', zh: '四合一发射生态：Launchpool + Launchpad + CandyDrop + HODLer Airdrop', en: 'Four-in-one launch ecosystem: Launchpool + Launchpad + CandyDrop + HODLer Airdrop' },
      { icon: '⛓️', zh: 'Gate Layer 二层网络 + Gate Perp DEX 去中心化衍生品', en: 'Gate Layer L2 network + Gate Perp DEX decentralized derivatives' },
    ],
    pros: {
      zh: ['新币上线最快最多，山寨币玩家首选', '储备透明度全行业最高', '支持黄金等传统金融资产', '返佣比例高达 60%'],
      en: ['Fastest and most new coin listings', 'Highest reserve transparency in industry', 'Supports gold and TradFi assets', 'Up to 60% rebate rate'],
    },
    cons: {
      zh: ['界面相对复杂，新手需要适应', '主流币流动性略低于 Binance/OKX', '不支持跟单交易'],
      en: ['Interface relatively complex for beginners', 'Liquidity slightly lower than Binance/OKX for major pairs', 'No copy trading'],
    },
    bestFor: { zh: '山寨币猎手 · TradFi 投资者 · 追求透明度的用户', en: 'Altcoin hunters · TradFi investors · Transparency-focused users' },
  },
  {
    slug: 'okx',
    name: 'OKX',
    emoji: '🔷',
    color: '#3B82F6',
    bgGradient: 'from-blue-950 to-gray-900',
    borderColor: 'border-blue-500/40',
    accentColor: 'text-blue-400',
    founded: '2017',
    headquarters: '塞舌尔 / 巴哈马',
    coins: '350+',
    dailyVolume: '$16.5亿',
    reserves: '$143.9亿',
    reserveRatio: '105%+',
    maxLeverage: '125x',
    makerFee: '0.08%',
    takerFee: '0.10%',
    platformToken: 'OKB',
    tagline: { zh: 'Web3 门户 · 最强 DEX · 自有 Layer2', en: 'Web3 Gateway · Best DEX · Own Layer2' },
    badge: { zh: 'Web3 最强', en: 'Best Web3' },
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: {
      zh: 'OKX 是全球前二的衍生品交易所，在香港、新加坡、阿联酋、硅谷等地设有办公室。OKX 不仅是一个交易所，更是一个完整的 Web3 生态系统，拥有全功能 Web3 钱包、内置 DEX 聚合器、NFT 市场和 DApp 生态，以及自有 Layer2 区块链 X Layer。',
      en: 'OKX is one of the top 2 derivatives exchanges globally, with offices in Hong Kong, Singapore, UAE, and Silicon Valley. Beyond being an exchange, OKX is a complete Web3 ecosystem with a full-featured Web3 wallet, built-in DEX aggregator, NFT marketplace, DApp ecosystem, and its own Layer2 blockchain X Layer.',
    },
    highlights: [
      { icon: '🌐', zh: 'OKX Wallet：支持 30+ 区块链的全功能 Web3 钱包，内置 DEX 聚合', en: 'OKX Wallet: Full Web3 wallet supporting 30+ blockchains with built-in DEX aggregation' },
      { icon: '⛓️', zh: 'X Layer：自有 Layer2 区块链，支持 DApp 部署和 OKX Oracle 预言机', en: 'X Layer: Own Layer2 blockchain supporting DApp deployment and OKX Oracle' },
      { icon: '🤖', zh: '丰富的交易机器人：网格交易、DCA、套利等自动化策略', en: 'Rich trading bots: grid trading, DCA, arbitrage and other automated strategies' },
      { icon: '📈', zh: '衍生品深度全球顶尖，最高 125x 杠杆', en: 'Top-tier derivatives depth globally, up to 125x leverage' },
      { icon: '🎮', zh: 'Jumpstart Launchpad + OKX Earn 一站式收益产品', en: 'Jumpstart Launchpad + OKX Earn all-in-one yield products' },
      { icon: '💳', zh: 'OKX Card 加密借记卡，支持全球消费', en: 'OKX Card crypto debit card for global spending' },
    ],
    pros: {
      zh: ['Web3 生态最完整，钱包+DEX+DApp 一体化', '衍生品流动性极强', '交易机器人功能丰富', '手续费较低 (Maker 0.08%)'],
      en: ['Most complete Web3 ecosystem: wallet+DEX+DApp integrated', 'Extremely strong derivatives liquidity', 'Rich trading bot features', 'Low fees (Maker 0.08%)'],
    },
    cons: {
      zh: ['支持币种数量较少（350+）', '美国用户受限', '新币上线速度不及 Gate.io'],
      en: ['Fewer supported coins (350+)', 'US users restricted', 'Slower new coin listings than Gate.io'],
    },
    bestFor: { zh: 'Web3 用户 · 衍生品交易者 · 机器人策略玩家', en: 'Web3 users · Derivatives traders · Bot strategy players' },
  },
  {
    slug: 'binance',
    name: 'Binance',
    emoji: '🟡',
    color: '#F0B90B',
    bgGradient: 'from-yellow-950 to-gray-900',
    borderColor: 'border-yellow-500/40',
    accentColor: 'text-yellow-400',
    founded: '2017',
    headquarters: '全球多地 (去中心化)',
    coins: '350+',
    dailyVolume: '$40-60亿',
    reserves: '行业最大',
    reserveRatio: '100%+',
    maxLeverage: '125x',
    makerFee: '0.10%',
    takerFee: '0.10%',
    platformToken: 'BNB',
    tagline: { zh: '全球第一 · 最强流动性 · 最大 P2P', en: 'World #1 · Best Liquidity · Largest P2P' },
    badge: { zh: '全球最大', en: 'World\'s Largest' },
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    description: {
      zh: '币安是全球交易量最大的加密货币交易所，由赵长鹏（CZ）于 2017 年创立。凭借无与伦比的流动性、最广泛的合规覆盖（100+ 国家获得监管许可）和最完整的产品生态，币安成为全球加密用户的首选平台。BNB Chain 更是成为全球最活跃的公链之一。',
      en: 'Binance is the world\'s largest crypto exchange by trading volume, founded by Changpeng Zhao (CZ) in 2017. With unmatched liquidity, the broadest regulatory coverage (100+ countries), and the most complete product ecosystem, Binance is the go-to platform for global crypto users. BNB Chain has become one of the most active public blockchains globally.',
    },
    highlights: [
      { icon: '💧', zh: '全球最强流动性，买卖价差最小，大额交易滑点最低', en: 'World\'s strongest liquidity, tightest spreads, lowest slippage for large trades' },
      { icon: '🚀', zh: 'Binance Launchpad：最早、最多 IEO 项目，参与新币首发', en: 'Binance Launchpad: earliest and most IEO projects, participate in new coin launches' },
      { icon: '🪙', zh: 'BNB 折扣：持有 BNB 可享 25% 手续费折扣', en: 'BNB discount: holding BNB gives 25% fee discount' },
      { icon: '💳', zh: 'Binance Pay + Binance Card：加密支付和借记卡全球消费', en: 'Binance Pay + Binance Card: crypto payment and debit card for global spending' },
      { icon: '🏦', zh: 'Binance Earn：最高 APY 稳定币理财，多种收益产品', en: 'Binance Earn: highest APY stablecoin products, multiple yield options' },
      { icon: '🤝', zh: '全球最大 P2P 市场，支持法币直接买卖加密货币', en: 'World\'s largest P2P market, supports fiat-to-crypto direct trading' },
    ],
    pros: {
      zh: ['流动性全球第一，大额交易首选', 'Launchpad 项目质量最高', '合规覆盖最广', 'P2P 市场最大，入金最方便'],
      en: ['#1 liquidity globally, best for large trades', 'Highest quality Launchpad projects', 'Broadest regulatory coverage', 'Largest P2P market, easiest fiat on-ramp'],
    },
    cons: {
      zh: ['手续费相对较高（0.1%）', '新币上线较慢', '部分地区受监管限制'],
      en: ['Relatively higher fees (0.1%)', 'Slower new coin listings', 'Regulatory restrictions in some regions'],
    },
    bestFor: { zh: '大额交易者 · 新手入门 · BNB 持有者 · P2P 入金用户', en: 'Large traders · Beginners · BNB holders · P2P fiat users' },
  },
  {
    slug: 'bybit',
    name: 'Bybit',
    emoji: '🔵',
    color: '#F7931A',
    bgGradient: 'from-orange-950 to-gray-900',
    borderColor: 'border-orange-500/40',
    accentColor: 'text-orange-400',
    founded: '2018',
    headquarters: '迪拜',
    coins: '1,000+',
    dailyVolume: '$10亿+',
    reserves: '$100亿+',
    reserveRatio: '100%+',
    maxLeverage: '125x',
    makerFee: '0.01%',
    takerFee: '0.055%',
    platformToken: '无',
    tagline: { zh: '衍生品专家 · 超低合约费 · 跟单交易', en: 'Derivatives Expert · Ultra-Low Contract Fees · Copy Trading' },
    badge: { zh: '合约最低费', en: 'Lowest Contract Fee' },
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    description: {
      zh: 'Bybit 成立于 2018 年，总部位于迪拜，专注于衍生品交易领域。凭借极低的合约手续费（Maker 仅 0.01%）和机构级流动性，Bybit 迅速成为全球合约交易者的首选平台之一。2022 年起，Bybit 大力扩展现货和 Web3 业务，成为综合性交易所。',
      en: 'Bybit, founded in 2018 and headquartered in Dubai, specializes in derivatives trading. With ultra-low contract fees (Maker only 0.01%) and institutional-grade liquidity, Bybit has become one of the top platforms for contract traders globally. Since 2022, Bybit has expanded into spot and Web3.',
    },
    highlights: [
      { icon: '📉', zh: '合约 Maker 手续费仅 0.01%，全行业最低之一', en: 'Contract Maker fee only 0.01%, one of the lowest in the industry' },
      { icon: '👥', zh: '跟单交易：跟随顶级交易员，一键复制策略', en: 'Copy trading: follow top traders, one-click strategy copying' },
      { icon: '🏆', zh: '机构级合约流动性，大额开仓滑点极小', en: 'Institutional-grade contract liquidity, minimal slippage for large positions' },
      { icon: '💰', zh: 'Bybit Earn：灵活理财 + 固定理财 + 质押产品', en: 'Bybit Earn: flexible savings + fixed savings + staking products' },
      { icon: '🎯', zh: 'Launchpad：参与优质新项目首发', en: 'Launchpad: participate in quality new project launches' },
      { icon: '🛡️', zh: '迪拜监管合规，资金安全有保障', en: 'Dubai regulatory compliance, fund security guaranteed' },
    ],
    pros: {
      zh: ['合约手续费全行业最低', '衍生品流动性极强', '跟单交易体验好', '支持 1,000+ 币种'],
      en: ['Lowest contract fees in industry', 'Extremely strong derivatives liquidity', 'Great copy trading experience', 'Supports 1,000+ coins'],
    },
    cons: {
      zh: ['现货流动性不及 Binance/OKX', '无平台币折扣机制', 'Web3 功能相对较弱'],
      en: ['Spot liquidity weaker than Binance/OKX', 'No platform token discount mechanism', 'Relatively weak Web3 features'],
    },
    bestFor: { zh: '合约交易者 · 跟单新手 · 低费率追求者', en: 'Contract traders · Copy trading beginners · Low-fee seekers' },
  },
  {
    slug: 'bitget',
    name: 'Bitget',
    emoji: '🟣',
    color: '#00D4AA',
    bgGradient: 'from-teal-950 to-gray-900',
    borderColor: 'border-teal-500/40',
    accentColor: 'text-teal-400',
    founded: '2018',
    headquarters: '塞舌尔',
    coins: '800+',
    dailyVolume: '$5-10亿',
    reserves: '$30亿+',
    reserveRatio: '150%+',
    maxLeverage: '125x',
    makerFee: '0.02%',
    takerFee: '0.06%',
    platformToken: 'BGB',
    tagline: { zh: '跟单鼻祖 · 最大跟单平台 · 用户保护基金', en: 'Copy Trading Pioneer · Largest Copy Platform · User Protection Fund' },
    badge: { zh: '跟单第一', en: 'Copy Trading #1' },
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    description: {
      zh: 'Bitget 成立于 2018 年，以跟单交易起家，目前已成为全球最大的跟单交易平台。平台拥有 800+ 专业交易员供用户跟随，操作简单，一键复制。Bitget 还设立了 $3 亿用户保护基金，为用户资产安全提供额外保障。',
      en: 'Bitget, founded in 2018, started with copy trading and has become the world\'s largest copy trading platform. With 800+ professional traders to follow and one-click copying, Bitget also maintains a $300M user protection fund for additional asset security.',
    },
    highlights: [
      { icon: '🏆', zh: '全球最大跟单平台：800+ 专业交易员，一键跟单', en: 'World\'s largest copy trading platform: 800+ pro traders, one-click copy' },
      { icon: '🛡️', zh: '$3 亿用户保护基金，行业最高保障之一', en: '$300M user protection fund, one of the highest in the industry' },
      { icon: '📊', zh: '透明的跟单数据：收益率、回撤、胜率一目了然', en: 'Transparent copy trading data: ROI, drawdown, win rate at a glance' },
      { icon: '💼', zh: 'Bitget Wallet：内置 Web3 钱包，支持多链资产管理', en: 'Bitget Wallet: built-in Web3 wallet supporting multi-chain asset management' },
      { icon: '🎪', zh: 'KCGI 年度合约大赛，丰厚奖励吸引顶级交易员', en: 'KCGI annual contract competition, rich rewards attract top traders' },
      { icon: '💎', zh: 'BGB 平台币：持有可享手续费折扣和额外收益', en: 'BGB platform token: hold for fee discounts and additional yield' },
    ],
    pros: {
      zh: ['跟单功能全行业最强', '用户保护基金行业领先', '储备率超过 150%', '新手友好，界面简洁'],
      en: ['Best copy trading in industry', 'Industry-leading user protection fund', 'Reserve ratio over 150%', 'Beginner-friendly, clean interface'],
    },
    cons: {
      zh: ['交易量和流动性不及头部交易所', '合约品种少于 Bybit/OKX', '知名度相对较低'],
      en: ['Lower volume and liquidity than top exchanges', 'Fewer contract types than Bybit/OKX', 'Relatively lower brand recognition'],
    },
    bestFor: { zh: '跟单交易新手 · 风险厌恶者 · 寻求稳健收益的用户', en: 'Copy trading beginners · Risk-averse users · Steady yield seekers' },
  },
];

// ─── Feature comparison matrix ────────────────────────────────────────────────

const COMPARISON_FEATURES = [
  { key: 'coins',        zh: '支持币种',     en: 'Supported Coins',    values: ['3,600+', '350+', '350+', '1,000+', '800+'], highlight: 0 },
  { key: 'volume',       zh: '日交易量',     en: 'Daily Volume',       values: ['$18.8亿', '$16.5亿', '$40-60亿', '$10亿+', '$5-10亿'], highlight: 2 },
  { key: 'reserves',     zh: '储备率',       en: 'Reserve Ratio',      values: ['125% ⭐', '105%+', '100%+', '100%+', '150%+ ⭐'], highlight: -1 },
  { key: 'makerFee',     zh: '现货Maker费',  en: 'Spot Maker Fee',     values: ['0.15%', '0.08% ⭐', '0.10%', '0.10%', '0.02% ⭐'], highlight: -1 },
  { key: 'futuresFee',   zh: '合约Maker费',  en: 'Futures Maker Fee',  values: ['-0.015%', '-0.0025%', '0.02%', '0.01% ⭐', '0.02%'], highlight: -1 },
  { key: 'leverage',     zh: '最高杠杆',     en: 'Max Leverage',       values: ['100x', '125x', '125x', '125x', '125x'], highlight: -1 },
  { key: 'copyTrading',  zh: '跟单交易',     en: 'Copy Trading',       values: [false, true, true, true, '⭐最强'], highlight: 4 },
  { key: 'web3Wallet',   zh: 'Web3 钱包',    en: 'Web3 Wallet',        values: [true, '⭐最强', true, false, true], highlight: 1 },
  { key: 'dex',          zh: '内置 DEX',     en: 'Built-in DEX',       values: [true, '⭐最强', false, false, false], highlight: 1 },
  { key: 'tradfi',       zh: 'TradFi 资产',  en: 'TradFi Assets',      values: ['⭐独有', false, false, false, false], highlight: 0 },
  { key: 'launchpad',    zh: 'Launchpad',    en: 'Launchpad',          values: [true, true, '⭐最强', true, true], highlight: 2 },
  { key: 'p2p',          zh: 'P2P 交易',     en: 'P2P Trading',        values: [true, true, '⭐最大', true, true], highlight: 2 },
  { key: 'card',         zh: '加密借记卡',   en: 'Crypto Card',        values: [false, true, true, false, false], highlight: -1 },
  { key: 'layer2',       zh: '自有 Layer2',  en: 'Own Layer2',         values: [true, true, '✅ BNB Chain', false, false], highlight: -1 },
  { key: 'protectFund',  zh: '用户保护基金', en: 'Protection Fund',    values: [true, true, true, true, '⭐$3亿'], highlight: 4 },
  { key: 'rebate',       zh: '返佣比例',     en: 'Rebate Rate',        values: ['60% ⭐', '20%', '20%', '30%', '50%'], highlight: 0 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExchangeGuide() {
  const [, navigate] = useLocation();
  const { language, setLanguage } = useLanguage();
  const { data: dbLinks } = trpc.exchanges.list.useQuery();
  const zh = language === 'zh';

  const [activeSlug, setActiveSlug] = useState('gate');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (sidebarOpen && !target.closest('#sidebar') && !target.closest('#sidebar-toggle')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sidebarOpen]);

  const scrollToExchange = (slug: string) => {
    setActiveSlug(slug);
    setSidebarOpen(false);
    setTimeout(() => {
      sectionRefs.current[slug]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const getReferralLink = (slug: string) => {
    return dbLinks?.find(l => l.slug === slug)?.referralLink ?? '#';
  };
  const getInviteCode = (slug: string) => {
    return dbLinks?.find(l => l.slug === slug)?.inviteCode ?? '';
  };

  const renderValue = (val: string | boolean) => {
    if (val === true) return <Check size={16} className="text-green-400 mx-auto" />;
    if (val === false) return <X size={16} className="text-red-400/60 mx-auto" />;
    if (typeof val === 'string' && val.includes('⭐')) {
      return <span className="text-yellow-400 font-semibold text-xs">{val}</span>;
    }
    return <span className="text-xs text-gray-300">{val}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0A192F] text-white">
      {/* ── Top Nav ── */}
      <nav className="sticky top-0 z-40 bg-[#0A192F]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            {/* Mobile sidebar toggle */}
            <button
              id="sidebar-toggle"
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-yellow-400 hover:opacity-80 transition"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium hidden sm:block">
                {zh ? '返回首页' : 'Back to Home'}
              </span>
            </button>
          </div>

          <h1 className="text-base sm:text-lg font-bold text-white">
            {zh ? '交易所深度指南' : 'Exchange Deep Guide'}
          </h1>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${language === 'zh' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-yellow-400'}`}
            >中文</button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${language === 'en' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-yellow-400'}`}
            >EN</button>
          </div>
        </div>
      </nav>

      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-b from-yellow-950/30 to-transparent py-10 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs px-4 py-1.5 rounded-full mb-4">
          <Star size={12} />
          {zh ? '数据来源：CoinMarketCap 官方数据' : 'Data source: CoinMarketCap official data'}
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">
          {zh ? '不了解这几个交易所？' : 'Not familiar with these exchanges?'}
        </h2>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
          {zh
            ? '5 大主流交易所深度对比，帮你找到最适合自己的平台，让返佣价值最大化'
            : 'In-depth comparison of 5 major exchanges to help you find the best platform and maximize your rebate value'}
        </p>
        {/* Quick jump pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {EXCHANGES.map(ex => (
            <button
              key={ex.slug}
              onClick={() => scrollToExchange(ex.slug)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition ${
                activeSlug === ex.slug
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-white/5 border-white/20 hover:border-yellow-400/50 text-gray-300'
              }`}
            >
              <span>{ex.emoji}</span>
              <span>{ex.name}</span>
            </button>
          ))}
          <button
            onClick={() => {
              document.getElementById('comparison-table')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-white/20 bg-white/5 hover:border-yellow-400/50 text-gray-300 transition"
          >
            <TrendingUp size={14} />
            {zh ? '功能对比表' : 'Feature Comparison'}
          </button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="max-w-7xl mx-auto px-4 pb-20 flex gap-6 relative">

        {/* ── Sidebar (desktop: sticky, mobile: overlay) ── */}
        <>
          {/* Mobile overlay backdrop */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <aside
            id="sidebar"
            className={`
              fixed lg:sticky top-14 left-0 h-[calc(100vh-3.5rem)] lg:h-auto
              w-56 bg-[#0D2137] lg:bg-transparent border-r lg:border-r-0 border-white/10
              z-40 lg:z-auto overflow-y-auto
              transition-transform duration-300 lg:translate-x-0
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:flex-shrink-0 lg:w-48 xl:w-52
              pt-4 lg:pt-6 px-3
            `}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-2">
              {zh ? '交易所' : 'Exchanges'}
            </p>
            <nav className="space-y-1">
              {EXCHANGES.map(ex => (
                <button
                  key={ex.slug}
                  onClick={() => scrollToExchange(ex.slug)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition text-left ${
                    activeSlug === ex.slug
                      ? 'bg-yellow-400/15 text-yellow-400 border border-yellow-400/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-base">{ex.emoji}</span>
                  <span className="font-medium">{ex.name}</span>
                  {activeSlug === ex.slug && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}
              <div className="pt-2 border-t border-white/10 mt-2">
                <button
                  onClick={() => document.getElementById('comparison-table')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition text-left"
                >
                  <TrendingUp size={16} />
                  <span>{zh ? '功能对比' : 'Comparison'}</span>
                </button>
              </div>
            </nav>
          </aside>
        </>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0 py-6 space-y-10">

          {/* Exchange Cards */}
          {EXCHANGES.map((ex) => (
            <section
              key={ex.slug}
              ref={el => { sectionRefs.current[ex.slug] = el; }}
              className={`rounded-2xl border ${ex.borderColor} bg-gradient-to-br ${ex.bgGradient} overflow-hidden scroll-mt-20`}
            >
              {/* Card Header */}
              <div className="p-5 sm:p-7 border-b border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-5xl sm:text-6xl">{ex.emoji}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-2xl sm:text-3xl font-bold">{ex.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${ex.badgeColor}`}>
                          {zh ? ex.badge.zh : ex.badge.en}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${ex.accentColor}`}>
                        {zh ? ex.tagline.zh : ex.tagline.en}
                      </p>
                    </div>
                  </div>
                  <a
                    href={getReferralLink(ex.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition whitespace-nowrap self-start"
                  >
                    <ExternalLink size={16} />
                    {zh ? '立即注册返佣' : 'Register & Earn Rebate'}
                  </a>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  {[
                    { label: zh ? '成立年份' : 'Founded', value: ex.founded },
                    { label: zh ? '支持币种' : 'Coins', value: ex.coins },
                    { label: zh ? '日交易量' : 'Daily Vol.', value: ex.dailyVolume },
                    { label: zh ? '储备率' : 'Reserve Ratio', value: ex.reserveRatio },
                  ].map(stat => (
                    <div key={stat.label} className="bg-black/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                      <p className={`text-lg font-bold ${ex.accentColor}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="px-5 sm:px-7 py-5">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {zh ? ex.description.zh : ex.description.en}
                </p>
              </div>

              {/* Highlights */}
              <div className="px-5 sm:px-7 pb-5">
                <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${ex.accentColor}`}>
                  <Zap size={14} />
                  {zh ? '核心亮点' : 'Key Highlights'}
                </h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  {ex.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-black/20 rounded-lg p-3">
                      <span className="text-lg flex-shrink-0">{h.icon}</span>
                      <p className="text-xs text-gray-300 leading-relaxed">{zh ? h.zh : h.en}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros & Cons + Best For */}
              <div className="px-5 sm:px-7 pb-5 grid sm:grid-cols-3 gap-4">
                {/* Pros */}
                <div className="bg-green-950/30 border border-green-500/20 rounded-xl p-4">
                  <h5 className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1">
                    <Check size={12} /> {zh ? '优势' : 'Pros'}
                  </h5>
                  <ul className="space-y-1.5">
                    {(zh ? ex.pros.zh : ex.pros.en).map((p, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                        <span className="text-green-400 mt-0.5 flex-shrink-0">+</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Cons */}
                <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4">
                  <h5 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1">
                    <X size={12} /> {zh ? '劣势' : 'Cons'}
                  </h5>
                  <ul className="space-y-1.5">
                    {(zh ? ex.cons.zh : ex.cons.en).map((c, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                        <span className="text-red-400 mt-0.5 flex-shrink-0">−</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Best For */}
                <div className="bg-yellow-950/30 border border-yellow-500/20 rounded-xl p-4">
                  <h5 className="text-xs font-bold text-yellow-400 mb-2 flex items-center gap-1">
                    <Users size={12} /> {zh ? '适合人群' : 'Best For'}
                  </h5>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {zh ? ex.bestFor.zh : ex.bestFor.en}
                  </p>
                  {/* Invite code */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-500 mb-1">{zh ? '邀请码' : 'Invite Code'}</p>
                    <div className="flex items-center gap-2">
                      <code className="text-yellow-400 font-mono font-bold text-sm bg-yellow-400/10 px-2 py-0.5 rounded">
                        {getInviteCode(ex.slug)}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(getInviteCode(ex.slug))}
                        className="text-xs text-gray-500 hover:text-yellow-400 transition"
                      >
                        {zh ? '复制' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Details (collapsible) */}
              <div className="px-5 sm:px-7 pb-5">
                <button
                  onClick={() => setExpandedSection(expandedSection === ex.slug ? null : ex.slug)}
                  className="w-full flex items-center justify-between bg-black/20 hover:bg-black/30 rounded-xl px-4 py-3 transition"
                >
                  <span className="text-sm font-medium text-gray-300">
                    {zh ? '查看详细费率' : 'View Detailed Fees'}
                  </span>
                  {expandedSection === ex.slug ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                {expandedSection === ex.slug && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: zh ? '现货 Maker' : 'Spot Maker', value: ex.makerFee },
                      { label: zh ? '现货 Taker' : 'Spot Taker', value: ex.takerFee },
                      { label: zh ? '最高杠杆' : 'Max Leverage', value: ex.maxLeverage },
                      { label: zh ? '平台币' : 'Platform Token', value: ex.platformToken },
                    ].map(item => (
                      <div key={item.label} className="bg-black/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <p className={`text-base font-bold ${ex.accentColor}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}

          {/* ── Feature Comparison Table ── */}
          <section id="comparison-table" className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow-400/10 rounded-full p-2">
                <TrendingUp className="text-yellow-400" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{zh ? '全功能对比表' : 'Full Feature Comparison'}</h3>
                <p className="text-xs text-gray-500">{zh ? '⭐ 表示该项目行业领先' : '⭐ indicates industry-leading'}</p>
              </div>
            </div>

            {/* Mobile: scrollable table */}
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-left px-4 py-3 text-gray-400 font-medium w-32">
                      {zh ? '功能' : 'Feature'}
                    </th>
                    {EXCHANGES.map(ex => (
                      <th key={ex.slug} className="px-3 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xl">{ex.emoji}</span>
                          <span className={`text-xs font-bold ${ex.accentColor}`}>{ex.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((feat, i) => (
                    <tr
                      key={feat.key}
                      className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                    >
                      <td className="px-4 py-3 text-gray-400 text-xs font-medium">
                        {zh ? feat.zh : feat.en}
                      </td>
                      {feat.values.map((val, vi) => (
                        <td
                          key={vi}
                          className={`px-3 py-3 text-center ${feat.highlight === vi ? 'bg-yellow-400/5' : ''}`}
                        >
                          {renderValue(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 bg-gradient-to-r from-yellow-950/50 to-amber-950/30 border border-yellow-500/30 rounded-2xl p-6 text-center">
              <Gift className="text-yellow-400 mx-auto mb-3" size={28} />
              <h4 className="text-lg font-bold mb-2">
                {zh ? '通过邀请链接注册，立享最高 60% 返佣' : 'Register via referral link, enjoy up to 60% rebate'}
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                {zh
                  ? '有任何返佣疑问或需要高额度配置，请联系我们，专人为您解答'
                  : 'For any rebate questions or high-volume configuration, contact us for dedicated support'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/exchanges')}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold"
                >
                  <ExternalLink size={16} className="mr-2" />
                  {zh ? '查看所有返佣链接' : 'View All Referral Links'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/contact')}
                  className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
                >
                  <Shield size={16} className="mr-2" />
                  {zh ? '联系我们获取帮助' : 'Contact Us for Help'}
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
