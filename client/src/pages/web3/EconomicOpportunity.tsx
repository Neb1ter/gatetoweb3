import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import Web3ChapterNav from "@/components/Web3ChapterNav";
import { useScrollMemory } from '@/hooks/useScrollMemory';
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { renderBoldText } from "@/lib/utils";

// ============================================================
// 工具 Hook：滚动进入视野触发动画
// ============================================================
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// 数字滚动动画
// ============================================================
function CountUp({ value, duration = 1800 }: { value: string; duration?: number }) {
  const [display, setDisplay] = useState("0");
  const { ref, inView } = useInView(0.3);

  useEffect(() => {
    if (!inView) return;
    const numMatch = value.match(/[\d.]+/);
    if (!numMatch) { setDisplay(value); return; }
    const target = parseFloat(numMatch[0]);
    const prefix = value.slice(0, value.indexOf(numMatch[0]));
    const suffix = value.slice(value.indexOf(numMatch[0]) + numMatch[0].length);
    const isDecimal = numMatch[0].includes(".");
    const decimals = isDecimal ? numMatch[0].split(".")[1].length : 0;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      setDisplay(prefix + current.toFixed(decimals) + suffix);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return <span ref={ref}>{display}</span>;
}

// ============================================================
// 数据来源标注
// ============================================================
function Source({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-slate-500 text-xs ml-1 italic">（{children}）</span>
  );
}

// ============================================================
// 主组件
// ============================================================
export default function EconomicOpportunity() {
  useScrollMemory();
  const [pageVisible, setPageVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"pressure" | "web3">("pressure");

  useEffect(() => {
    const t = setTimeout(() => setPageVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const pressureStats = [
    { label: "全球经济增速", value: "3.0%", sub: "2025年预测（IMF）", color: "text-red-400", bg: "bg-red-500/10", icon: "📉", note: "创2008年以来最慢" },
    { label: "全球青年失业率", value: "12.6%", sub: "2025年（ILO）", color: "text-orange-400", bg: "bg-orange-500/10", icon: "👨‍🎓", note: "年轻人就业最难" },
    { label: "全球贫富差距", value: "Top 10%", sub: "收入超其余90%总和", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: "⚖️", note: "2026全球不平等报告" },
    { label: "中国高校毕业生", value: "1250万", sub: "2025年（教育部）", color: "text-purple-400", bg: "bg-purple-500/10", icon: "🎓", note: "历史新高" },
  ];

  const web3Stats = [
    { label: "比特币ETF资管规模", value: "$1250亿+", sub: "2026年1月", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: "🏦", note: "贝莱德、摩根士丹利入场" },
    { label: "稳定币年交易量", value: "$33万亿", sub: "2025年全年", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "💸", note: "同比增长72%" },
    { label: "区块链市场规模", value: "$311亿", sub: "2025年", color: "text-blue-400", bg: "bg-blue-500/10", icon: "⛓️", note: "预计2034年达$5773亿" },
    { label: "活跃加密钱包地址", value: "8.3亿", sub: "2025年Q3", color: "text-purple-400", bg: "bg-purple-500/10", icon: "👛", note: "82%在30天内有交易" },
  ];

  const economicPressures = [
    {
      icon: "💼",
      title: "就业市场的结构性危机",
      color: "text-red-400",
      borderColor: "border-red-500/30",
      bgColor: "bg-red-500/5",
      content: `2025年，中国高校毕业生规模达到历史峰值 **1250万人**，而城市就业增速仅为 0.9%，"增长—就业"脱钩日益加剧。与此同时，AI 技术加速替代白领岗位，世界经济论坛《2025未来就业报告》指出，AI 已成为颠覆就业市场的核心力量之一。

全球青年失业率高达 **12.6%**，远超整体失业率水平。麦肯锡 2025 年 12 月调查显示，这是自 2020 年 9 月以来，首次有超过半数受访者预期本国失业率将在未来半年上升。`,
      highlight: "年轻人正面临历史上最激烈的就业竞争",
      source: "ILO全球工资报告 · 世界经济论坛 · 麦肯锡",
    },
    {
      icon: "💸",
      title: "工资增长跑不赢通胀",
      color: "text-orange-400",
      borderColor: "border-orange-500/30",
      bgColor: "bg-orange-500/5",
      content: `国际劳工组织 2025 年《全球工资报告》揭示了一个残酷现实：全球仍有 **45% 的国家**最低工资增幅低于通货膨胀率，意味着大量低收入劳动者的实际购买力在持续下降。

美国 2025 年出现明显的"K 型经济"分化：收入最高的 10% 家庭贡献了近 **50% 的消费支出**，而中低收入家庭因劳动力市场疲软和通胀压力，生活质量持续恶化。美国银行调查显示，62% 的受访者在 2025 年圣诞季感到经济压力。`,
      highlight: "努力工作，却越来越难以维持生活水准",
      source: "ILO · 美国银行 · 穆迪分析",
    },
    {
      icon: "🏠",
      title: "资产价格高企，普通人被挡在门外",
      color: "text-yellow-400",
      borderColor: "border-yellow-500/30",
      bgColor: "bg-yellow-500/5",
      content: `2026 年《全球不平等报告》（由 200 名研究人员汇编）显示：收入最高的前 **10% 人口**所得已超过其余 90% 的总和，全球不足 6 万人掌握着全球财富的 6%。

在加拿大，2025 年贫富差距创历史新高，最富裕群体与最贫困 20% 家庭的可支配收入差距飙升至 **40 倍**。传统的"努力工作→积累财富→阶层上升"路径，正在被资产价格通胀和收入停滞双重夹击下彻底堵死。`,
      highlight: "传统财富积累路径正在对普通人关闭",
      source: "世界不平等报告2026 · 加拿大统计局",
    },
    {
      icon: "🤖",
      title: "AI 浪潮加速岗位消失",
      color: "text-purple-400",
      borderColor: "border-purple-500/30",
      bgColor: "bg-purple-500/5",
      content: `人工智能不再只是科技圈的话题。2025 年，AI 已开始大规模替代客服、文案、数据分析、基础编程等白领岗位。世界经济论坛预测，到 2030 年，AI 将净消除 **8500 万个工作岗位**，同时创造 9700 万个新岗位——但新岗位需要完全不同的技能，转型窗口极窄。

对于没有稀缺技能的普通人而言，在传统就业市场中的竞争优势正在被系统性削弱。依赖单一工资收入的财务模型，比任何时候都更加脆弱。`,
      highlight: "单一工资收入的财务模型正变得越来越脆弱",
      source: "世界经济论坛《2025未来就业报告》",
    },
  ];

  const web3Opportunities = [
    {
      icon: "🏛️",
      title: "机构资金大规模入场，市场走向成熟",
      color: "text-yellow-400",
      borderColor: "border-yellow-500/30",
      bgColor: "bg-yellow-500/5",
      content: `2024 年，美国 SEC 批准比特币现货 ETF，这是加密市场走向主流的历史性时刻。到 2026 年 1 月，比特币 ETF 资管规模已突破 **1250 亿美元**，贝莱德（全球最大资管公司）、摩根士丹利、富达等传统金融巨头纷纷加码加密资产布局。

彭博社数据显示，2025 年比特币 ETF 年度净流入突破 **69.6 亿美元**，机构布局进入加速阶段。这不再是散户的投机游戏——全球最聪明的资本正在系统性配置加密资产。`,
      highlight: "全球最大资管公司正在系统性买入比特币",
      source: "彭博社 · BlockEden · 律动BlockBeats",
    },
    {
      icon: "💱",
      title: "稳定币交易量爆炸式增长，链上支付成真",
      color: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-500/5",
      content: `2025 年，稳定币年交易量达到创纪录的 **33 万亿美元**，同比增长 **72%**。零售交易笔数从 3.14 亿笔飙升至 **32 亿笔**，增长超过 10 倍。稳定币市值在 2025 年增长 **1021 亿美元（+48.9%）**，达到历史新高 **3110 亿美元**。

这意味着什么？链上支付不再是实验性技术，而是正在被全球数亿人实际使用的金融基础设施。对于生活在高通胀或外汇管制国家的人而言，USDT 等稳定币已经是真实的财富保护工具。`,
      highlight: "稳定币正在成为全球数亿人的真实金融工具",
      source: "CoinGecko 2025年报 · MEXC研究院",
    },
    {
      icon: "⛓️",
      title: "区块链基础设施成熟，用户体验接近传统互联网",
      color: "text-blue-400",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/5",
      content: `2025 年，全球区块链技术市场规模达到 **311.8 亿美元**，预计到 2034 年将增长至 **5773.6 亿美元**，复合年增长率高达 **36.5%**。

以太坊 Layer 2 方案（Arbitrum、Base、Optimism）将交易费用降至几美分，Solana 等高性能公链实现了接近传统互联网的用户体验。2025 年 Q3，全球活跃加密钱包地址达 **8.3 亿个**，连接钱包的 DApp 数量较上年增长 **117%**。基础设施已经就绪，现在是普通人入场的最佳窗口期。`,
      highlight: "Web3 的基础设施已经成熟，入场门槛大幅降低",
      source: "Fortune Business Insights · Dune Analytics",
    },
    {
      icon: "📈",
      title: "比特币：历史上回报最高的资产之一",
      color: "text-purple-400",
      borderColor: "border-purple-500/30",
      bgColor: "bg-purple-500/5",
      content: `比特币自 2009 年诞生以来，经历了多次剧烈波动，但长期趋势始终向上。从 2014 年到 2024 年的十年间，比特币涨幅超过 **100 万%**。2024 年，比特币突破 **10 万美元**历史新高，全年涨幅约 **120%**。

2025 年，比特币日波动率降至历史最低的 **2.24%**（K33 Research），显示市场正在走向成熟稳健。尽管短期价格波动仍然存在，但越来越多的机构将比特币视为数字黄金，纳入长期资产配置。`,
      highlight: "比特币是过去十年回报率最高的主流资产之一",
      source: "K33 Research · TradingView · CoinDesk",
    },
  ];

  const historicalTimeline = [
    { year: "2009", event: "比特币诞生", btcPrice: "$0.001", context: "全球金融危机后，中本聪发布比特币白皮书，创造了第一个去中心化货币", color: "text-slate-400" },
    { year: "2013", event: "首次破千美元", btcPrice: "$1,000", context: "比特币首次突破1000美元，引发全球关注，塞浦路斯银行危机加速了人们对去中心化货币的兴趣", color: "text-blue-400" },
    { year: "2017", event: "ICO 狂潮", btcPrice: "$19,783", context: "以太坊智能合约引发 ICO 热潮，加密市场总市值首次突破 8000 亿美元，比特币创当时历史新高", color: "text-yellow-400" },
    { year: "2020", event: "机构入场元年", btcPrice: "$29,000", context: "MicroStrategy、特斯拉等上市公司将比特币纳入资产负债表，PayPal 开放加密货币购买，机构资金开始系统性入场", color: "text-emerald-400" },
    { year: "2021", event: "DeFi & NFT 爆发", btcPrice: "$69,000", context: "DeFi 锁仓量突破 2000 亿美元，NFT 市场爆发，元宇宙概念兴起，加密市场总市值首次突破 3 万亿美元", color: "text-purple-400" },
    { year: "2024", event: "比特币 ETF 获批", btcPrice: "$108,000", context: "美国 SEC 批准比特币现货 ETF，贝莱德等传统金融巨头入场，比特币突破 10 万美元历史新高，加密市场正式走向主流", color: "text-yellow-400" },
    { year: "2025", event: "机构化加速", btcPrice: "$65,000~$125,000", context: "比特币 ETF 资管规模突破 1250 亿美元，稳定币年交易量达 33 万亿美元，Web3 用户突破 8 亿，区块链基础设施全面成熟", color: "text-emerald-400" },
  ];

  const comparisonData = [
    { asset: "比特币 (BTC)", return5y: "+2,100%", return10y: "+100万%+", risk: "高", liquidity: "极高", threshold: "无门槛", color: "text-yellow-400" },
    { asset: "A股（沪深300）", return5y: "-15%", return10y: "+80%", risk: "中高", liquidity: "高", threshold: "需开户", color: "text-red-400" },
    { asset: "美股（标普500）", return5y: "+85%", return10y: "+230%", risk: "中", liquidity: "高", threshold: "需开户+汇款", color: "text-blue-400" },
    { asset: "中国房产", return5y: "-10%~+5%", return10y: "+150%（一线）", risk: "中", liquidity: "极低", threshold: "首付门槛极高", color: "text-orange-400" },
    { asset: "银行存款", return5y: "+15%（累计）", return10y: "+35%（累计）", risk: "极低", liquidity: "高", threshold: "无门槛", color: "text-slate-400" },
    { asset: "黄金", return5y: "+65%", return10y: "+120%", risk: "低", liquidity: "中", threshold: "较低", color: "text-yellow-300" },
  ];

  return (
    <div
      className="min-h-screen bg-[#050D1A] text-white"
      style={{
        opacity: pageVisible ? 1 : 0,
        transform: pageVisible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {/* ===== 顶部导航栏 ===== */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#050D1A]/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            返回上一页
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 hidden sm:inline-flex">核心 · 章节 05</span>
            <Web3ChapterNav currentChapterId="economic-opportunity" />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* ===== Hero ===== */}
        <FadeIn delay={100}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            第五章 · 经济形势与 Web3 机遇
          </div>
        </FadeIn>

        <FadeIn delay={150}>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
            <span className="text-white">现实世界的</span>
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #FB923C, #F59E0B, #EAB308)" }}
            >
              经济压力
            </span>
            <span className="text-white">，</span>
            <br />
            <span className="text-white">与 Web3 的</span>
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #6EE7B7, #3B82F6)" }}
            >
              破局机遇
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed mb-10">
            2025 年，全球经济增速创下 2008 年金融危机以来最慢记录，贫富差距持续拉大，年轻人就业压力前所未有。
            与此同时，Web3 正在以惊人的速度走向主流——这是时代的矛盾，也是个人的机遇。
          </p>
        </FadeIn>

        {/* ===== Tab 切换 ===== */}
        <FadeIn delay={250} className="mb-10">
          <div className="flex gap-2 p-1 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <button
              onClick={() => setActiveTab("pressure")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "pressure"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              😰 现实经济压力
            </button>
            <button
              onClick={() => setActiveTab("web3")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "web3"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🚀 Web3 机遇数据
            </button>
          </div>
        </FadeIn>

        {/* ===== 数据统计卡片 ===== */}
        <FadeIn className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(activeTab === "pressure" ? pressureStats : web3Stats).map((stat, i) => (
              <div key={`${activeTab}-${i}`} className={`rounded-xl border border-slate-700/50 ${stat.bg} p-4 text-center transition-all`}>
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className={`text-lg sm:text-xl font-black ${stat.color} mb-1 leading-tight`}>
                  {stat.value}
                </div>
                <div className="text-slate-300 text-xs font-medium mb-1">{stat.label}</div>
                <div className="text-slate-500 text-xs">{stat.sub}</div>
                <div className={`text-xs mt-2 px-2 py-0.5 rounded-full ${stat.bg} border border-current/20 ${stat.color}`}>
                  {stat.note}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ===== Section 1: 现实经济压力 ===== */}
        <FadeIn className="mb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-orange-400 rounded-full" />
            <div>
              <h2 className="text-2xl font-black text-white">现实世界的经济压力</h2>
              <p className="text-slate-400 text-sm">为什么普通人越来越难以通过传统路径实现财富积累</p>
            </div>
          </div>
        </FadeIn>

        {/* 经济压力分析 */}
        <div className="space-y-5 mb-14">
          {economicPressures.map((item, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div className={`rounded-2xl border ${item.borderColor} ${item.bgColor} p-6 sm:p-7`}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-black text-lg mb-3 ${item.color}`}>{item.title}</h3>
                    <div className="text-slate-300 text-sm leading-relaxed mb-4 space-y-2">
                      {item.content.split("\n\n").map((para, j) => (
                        <p key={j}>{renderBoldText(para)}</p>
                      ))}
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${item.borderColor} ${item.bgColor}`}>
                      <span className={`text-xs font-bold ${item.color}`}>💡 核心矛盾：{item.highlight}</span>
                    </div>
                    <div className="mt-3">
                      <span className="text-slate-500 text-xs">数据来源：{item.source}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* ===== 过渡段落 ===== */}
        <FadeIn className="mb-14">
          <div className="rounded-2xl border border-dashed border-slate-600 bg-gradient-to-br from-slate-800/40 to-slate-900/40 p-7 sm:p-9 text-center">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-2xl font-black text-white mb-4">
              当传统路径越走越窄，<br />
              <span className="text-emerald-400">新的路径正在打开</span>
            </h3>
            <p className="text-slate-300 text-base leading-relaxed max-w-2xl mx-auto">
              历史上每一次重大经济变革，都会同时关闭一些旧门，打开一些新门。
              互联网的兴起让一批人实现了财富跨越，移动互联网又造就了一批新富阶层。
              Web3 正在成为下一个这样的窗口——而且这个窗口，对所有人开放，没有地域限制，没有资金门槛。
            </p>
          </div>
        </FadeIn>

        {/* ===== Section 2: Web3 机遇 ===== */}
        <FadeIn className="mb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-blue-400 rounded-full" />
            <div>
              <h2 className="text-2xl font-black text-white">Web3 的历史机遇</h2>
              <p className="text-slate-400 text-sm">最新数据说话：这不是炒作，而是正在发生的变革</p>
            </div>
          </div>
        </FadeIn>

        <div className="space-y-5 mb-14">
          {web3Opportunities.map((item, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div className={`rounded-2xl border ${item.borderColor} ${item.bgColor} p-6 sm:p-7`}>
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-black text-lg mb-3 ${item.color}`}>{item.title}</h3>
                    <div className="text-slate-300 text-sm leading-relaxed mb-4 space-y-2">
                      {item.content.split("\n\n").map((para, j) => (
                        <p key={j}>{renderBoldText(para)}</p>
                      ))}
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${item.borderColor} ${item.bgColor}`}>
                      <span className={`text-xs font-bold ${item.color}`}>✦ {item.highlight}</span>
                    </div>
                    <div className="mt-3">
                      <span className="text-slate-500 text-xs">数据来源：{item.source}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* ===== 比特币历史时间线 ===== */}
        <FadeIn className="mb-14">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 sm:p-8">
            <h3 className="text-xl font-black text-yellow-400 mb-2">📅 比特币的历史轨迹</h3>
            <p className="text-slate-400 text-sm mb-6">从 0.001 美元到 10 万美元——每一次危机，都是加密市场的催化剂</p>
            <div className="relative">
              {/* 时间线竖线 */}
              <div className="absolute left-[5.5rem] top-0 bottom-0 w-px bg-gradient-to-b from-slate-700 via-yellow-500/30 to-slate-700 hidden sm:block" />
              <div className="space-y-4">
                {historicalTimeline.map((item, i) => (
                  <div key={i} className="flex gap-4 sm:gap-6 items-start">
                    <div className="flex-shrink-0 w-20 sm:w-20 text-right">
                      <span className={`text-sm font-black ${item.color}`}>{item.year}</span>
                    </div>
                    <div className="hidden sm:flex flex-shrink-0 items-center justify-center w-3 h-3 rounded-full bg-slate-700 border-2 border-slate-600 mt-1 relative z-10">
                      <div className={`w-1.5 h-1.5 rounded-full ${item.color.replace("text-", "bg-")}`} />
                    </div>
                    <div className="flex-1 pb-4 border-b border-slate-800/50 last:border-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-white font-bold text-sm">{item.event}</span>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${item.color} bg-current/10`}>
                          {item.btcPrice}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{item.context}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ===== 资产回报对比表 ===== */}
        <FadeIn className="mb-14">
          <div className="rounded-2xl border border-slate-700 overflow-hidden">
            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700">
              <h3 className="font-black text-white">主流资产回报率对比</h3>
              <p className="text-slate-400 text-xs mt-1">过去 5 年 / 10 年的近似回报率，仅供参考，不构成投资建议</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/30">
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">资产类别</th>
                    <th className="text-center px-4 py-3 text-slate-400 font-medium">近5年回报</th>
                    <th className="text-center px-4 py-3 text-slate-400 font-medium">近10年回报</th>
                    <th className="text-center px-4 py-3 text-slate-400 font-medium">风险</th>
                    <th className="text-center px-4 py-3 text-slate-400 font-medium">入场门槛</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={i} className={`border-b border-slate-800 ${i % 2 === 0 ? "bg-slate-800/20" : ""} ${i === 0 ? "bg-yellow-500/5" : ""}`}>
                      <td className={`px-4 py-3 font-bold ${row.color}`}>{row.asset}</td>
                      <td className={`px-4 py-3 text-center font-mono font-bold ${row.return5y.startsWith("-") ? "text-red-400" : "text-emerald-400"}`}>
                        {row.return5y}
                      </td>
                      <td className={`px-4 py-3 text-center font-mono font-bold ${row.return10y.startsWith("-") ? "text-red-400" : "text-emerald-400"}`}>
                        {row.return10y}
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-center text-xs">{row.risk}</td>
                      <td className="px-4 py-3 text-slate-300 text-center text-xs">{row.threshold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-slate-800/20 border-t border-slate-700">
              <p className="text-slate-500 text-xs">⚠️ 历史回报不代表未来表现。加密资产波动极大，请充分了解风险后再做决策。数据来源：TradingView · CoinGecko · 中国证监会</p>
            </div>
          </div>
        </FadeIn>

        {/* ===== 总结：为什么是现在 ===== */}
        <FadeIn className="mb-14">
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-blue-500/5 p-7 sm:p-9">
            <h3 className="text-2xl font-black text-white mb-6">🎯 为什么现在是了解 Web3 的最佳时机？</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[
                {
                  icon: "⏰",
                  title: "窗口期正在缩小",
                  desc: "机构资金大规模入场后，早期投资者的超额收益会逐渐被稀释。现在仍是相对早期，但窗口已经开始关闭。",
                  color: "text-orange-400",
                },
                {
                  icon: "🛡️",
                  title: "基础设施已经成熟",
                  desc: "不同于 2017 年的蛮荒时代，2025 年的 Web3 已有成熟的合规交易所、稳定的基础设施和相对完善的监管框架。",
                  color: "text-blue-400",
                },
                {
                  icon: "📚",
                  title: "信息获取成本极低",
                  desc: "你现在正在阅读的这份指南，就是证明。了解 Web3 的门槛已经降至历史最低，不需要技术背景，只需要愿意学习。",
                  color: "text-emerald-400",
                },
                {
                  icon: "💰",
                  title: "资金门槛极低",
                  desc: "在主流交易所，100 元人民币就可以购买比特币或以太坊。这是历史上门槛最低的全球性投资机会之一。",
                  color: "text-yellow-400",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <h5 className={`font-bold text-sm mb-1 ${item.color}`}>{item.title}</h5>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <p className="text-slate-300 text-sm leading-relaxed">
                <strong className="text-red-400">⚠️ 重要风险提示：</strong>
                Web3 和加密货币市场波动极大，价格可能在短时间内大幅下跌。本页面内容仅供教育目的，
                不构成任何投资建议。请在充分了解风险的前提下，只投入你能承受全部损失的资金。
              </p>
            </div>
          </div>
        </FadeIn>

        {/* ===== 底部导航 ===== */}
        <FadeIn>
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6 text-center mb-10">
            <h3 className="text-xl font-black text-white mb-2">准备好迈出第一步了吗？</h3>
            <p className="text-slate-400 text-sm mb-5">
              通过我们的合作伙伴链接注册交易所，享受永久高额手续费返佣，让每一笔交易都更划算。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/crypto-saving" className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-7 py-3 rounded-xl transition-all hover:scale-105 text-sm">
                  🎁可以尝试下
              </Link>
              <Link href="/web3-guide" className="border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-bold px-7 py-3 rounded-xl transition-all text-sm">
                  📖 返回 Web3 入圈指南
              </Link>
              <Link href="/web3-guide/investment-gateway" className="border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 font-bold px-7 py-3 rounded-xl transition-all text-sm">
                  🚪 下一章：参与 Web3 的门户 →
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* 底部导航 */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/web3-guide" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2">
              ← 返回 Web3 入圈指南
          </Link>
          <p className="text-slate-600 text-xs text-center">
            数据来源：IMF · ILO · CoinGecko · 彭博社 · Fortune Business Insights · 律动BlockBeats
          </p>
          <Link href="/web3-guide/investment-gateway" className="text-slate-400 hover:text-orange-400 transition-colors text-sm flex items-center gap-2">
              第六章：参与 Web3 的门户 →
          </Link>
        </div>
      </div>
      {/* 右下角回到顶部按钮 */}
      <ScrollToTopButton color="emerald" />
    </div>
  );
}
