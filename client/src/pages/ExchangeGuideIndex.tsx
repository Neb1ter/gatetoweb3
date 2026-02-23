import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronRight, ArrowLeft, BookOpen, TrendingUp, Zap, Shield, Coins, Globe, BarChart2, Bot, Users, Repeat, Star, Layers, Gift } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  "📊": <BarChart2 className="w-5 h-5" />,
  "📈": <TrendingUp className="w-5 h-5" />,
  "⚡": <Zap className="w-5 h-5" />,
  "🏦": <Coins className="w-5 h-5" />,
  "💰": <Coins className="w-5 h-5" />,
  "🌐": <Globe className="w-5 h-5" />,
  "🎯": <Star className="w-5 h-5" />,
  "🤝": <Users className="w-5 h-5" />,
  "👥": <Users className="w-5 h-5" />,
  "🤖": <Bot className="w-5 h-5" />,
  "🔄": <Repeat className="w-5 h-5" />,
  "🚀": <Layers className="w-5 h-5" />,
  "🌱": <Gift className="w-5 h-5" />,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-300 border-red-500/30",
};

const DIFFICULTY_LABELS: Record<string, { zh: string; en: string }> = {
  beginner: { zh: "新手友好", en: "Beginner" },
  intermediate: { zh: "进阶", en: "Intermediate" },
  advanced: { zh: "高级", en: "Advanced" },
};

const EXCHANGE_LIST = [
  { slug: "binance", name: "Binance", color: "from-yellow-500/20 to-yellow-600/10", border: "border-yellow-500/30", dot: "bg-yellow-400" },
  { slug: "okx", name: "OKX", color: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/30", dot: "bg-blue-400" },
  { slug: "bybit", name: "Bybit", color: "from-orange-500/20 to-orange-600/10", border: "border-orange-500/30", dot: "bg-orange-400" },
  { slug: "gate", name: "Gate.io", color: "from-purple-500/20 to-purple-600/10", border: "border-purple-500/30", dot: "bg-purple-400" },
  { slug: "bitget", name: "Bitget", color: "from-cyan-500/20 to-cyan-600/10", border: "border-cyan-500/30", dot: "bg-cyan-400" },
];

export default function ExchangeGuideIndex() {
  const { language } = useLanguage();
  const zh = language === "zh";
  const [activeTab, setActiveTab] = useState<"features" | "compare">("features");
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: categories = [], isLoading } = trpc.exchangeGuide.categories.useQuery();

  return (
    <div className="min-h-screen bg-[#0A192F] text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0A192F]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Left: Back */}
          <Link href="/crypto-saving">
            <button className="flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{zh ? "返回主页" : "Back"}</span>
            </button>
          </Link>

          {/* Center: Title */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-yellow-400" />
            <span className="font-black text-sm sm:text-base text-white">
              {zh ? "交易所扫盲指南" : "Exchange Guide"}
            </span>
          </div>

          {/* Right: Tab switcher */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("features")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeTab === "features" ? "bg-yellow-500 text-black" : "text-slate-400 hover:text-white"}`}
            >
              {zh ? "功能介绍" : "Features"}
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${activeTab === "compare" ? "bg-yellow-500 text-black" : "text-slate-400 hover:text-white"}`}
            >
              {zh ? "交易所对比" : "Compare"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "features" ? (
          <FeaturesTab categories={categories} isLoading={isLoading} zh={zh} />
        ) : (
          <CompareTab zh={zh} selectedExchange={selectedExchange} setSelectedExchange={setSelectedExchange} />
        )}

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 p-8 text-center">
          <h3 className="text-2xl font-black text-white mb-3">
            {zh ? "了解完了，准备开始了吗？" : "Ready to get started?"}
          </h3>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto text-sm leading-relaxed">
            {zh
              ? "通过我们的合作伙伴链接注册，享受永久手续费返佣。还有疑问？前往新手问答页面获取解答。"
              : "Register via our partner links for permanent fee rebates. Still have questions? Check our FAQ page."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/crypto-saving">
              <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-7 py-3 rounded-xl transition-all hover:scale-105 text-sm">
                {zh ? "🎁 查看合作伙伴链接" : "🎁 View Partner Links"}
              </button>
            </Link>
            <Link href="/beginner">
              <button className="border border-white/20 hover:border-yellow-500/50 text-white hover:text-yellow-300 font-bold px-7 py-3 rounded-xl transition-all text-sm">
                {zh ? "💬 前往新手问答" : "💬 FAQ Page"}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Features Tab ─────────────────────────────────────────────────────────────

function FeaturesTab({ categories, isLoading, zh }: {
  categories: Array<{ id: number; slug: string; nameZh: string; nameEn: string; icon: string; descZh: string; descEn: string; difficulty: string; sortOrder: number }>;
  isLoading: boolean;
  zh: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selected = categories.find(c => c.slug === activeCategory) ?? categories[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Sidebar Menu */}
      <aside className="lg:w-64 shrink-0">
        <div className="lg:sticky lg:top-20">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
            {zh ? "功能分类" : "Categories"}
          </p>
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all whitespace-nowrap lg:whitespace-normal w-full ${
                  (activeCategory ?? categories[0]?.slug) === cat.slug
                    ? "bg-yellow-500/20 border border-yellow-500/40 text-yellow-300"
                    : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <span className="text-lg shrink-0">{cat.icon}</span>
                <span className="text-sm font-semibold truncate">
                  {zh ? cat.nameZh : cat.nameEn}
                </span>
                <ChevronRight className={`w-3 h-3 ml-auto shrink-0 hidden lg:block transition-transform ${(activeCategory ?? categories[0]?.slug) === cat.slug ? "rotate-90 text-yellow-400" : ""}`} />
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Right Content */}
      <main className="flex-1 min-w-0">
        {selected && (
          <FeatureDetail category={selected} zh={zh} />
        )}
      </main>
    </div>
  );
}

// ─── Feature Detail ────────────────────────────────────────────────────────────

function FeatureDetail({ category, zh }: {
  category: { slug: string; nameZh: string; nameEn: string; icon: string; descZh: string; descEn: string; difficulty: string };
  zh: boolean;
}) {
  const { data: supports = [], isLoading } = trpc.exchangeGuide.featureSupport.useQuery({ featureSlug: category.slug });
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const FEATURE_CONTENT = getFeatureContent(category.slug, zh);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{category.icon}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {zh ? category.nameZh : category.nameEn}
            </h1>
            <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[category.difficulty] ?? DIFFICULTY_COLORS.beginner}`}>
              {zh ? DIFFICULTY_LABELS[category.difficulty]?.zh : DIFFICULTY_LABELS[category.difficulty]?.en}
            </span>
          </div>
        </div>
        <p className="text-slate-300 leading-relaxed text-base">
          {zh ? category.descZh : category.descEn}
        </p>
      </div>

      {/* Deep Content */}
      <div className="space-y-6 mb-10">
        {FEATURE_CONTENT.sections.map((section, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/3 p-6">
            <h2 className="text-lg font-black text-yellow-300 mb-3">{section.title}</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">{section.body}</p>
            {section.tips && (
              <ul className="space-y-2">
                {section.tips.map((tip, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-yellow-400 mt-0.5 shrink-0">▸</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Exchange Comparison Table */}
      {!isLoading && supports.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-black text-white mb-4">
            {zh ? "五大交易所对比" : "Exchange Comparison"}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-slate-400 font-bold">{zh ? "交易所" : "Exchange"}</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-bold">{zh ? "支持程度" : "Level"}</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-bold hidden md:table-cell">{zh ? "详情" : "Details"}</th>
                  {supports.some(s => s.feeInfo) && (
                    <th className="text-left px-4 py-3 text-slate-400 font-bold hidden lg:table-cell">{zh ? "费率" : "Fee"}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {supports.map((s) => {
                  const ex = EXCHANGE_LIST.find(e => e.slug === s.exchangeSlug);
                  return (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {ex && <span className={`w-2 h-2 rounded-full ${ex.dot}`} />}
                          <span className="font-bold text-white">{ex?.name ?? s.exchangeSlug}</span>
                          {s.highlight === 1 && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-1.5 py-0.5 rounded-full font-bold">
                              {zh ? "推荐" : "Top"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                          s.supported === 1 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                        }`}>
                          {zh ? s.levelZh : s.levelEn}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs leading-relaxed hidden md:table-cell max-w-xs">
                        {zh ? s.detailZh : s.detailEn}
                      </td>
                      {supports.some(sup => sup.feeInfo) && (
                        <td className="px-4 py-3 text-slate-300 text-xs hidden lg:table-cell">
                          {s.feeInfo ?? "—"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Quiz */}
      {FEATURE_CONTENT.quiz && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6 mb-6">
          <h3 className="text-base font-black text-blue-300 mb-1">
            🧠 {zh ? "小测验" : "Quick Quiz"}
          </h3>
          <p className="text-white font-semibold mb-4 text-sm">{FEATURE_CONTENT.quiz.question}</p>
          <div className="space-y-2">
            {FEATURE_CONTENT.quiz.options.map((opt) => (
              <button
                key={opt.value}
                disabled={quizSubmitted}
                onClick={() => { setQuizAnswer(opt.value); setQuizSubmitted(true); }}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                  quizSubmitted
                    ? opt.value === FEATURE_CONTENT.quiz!.correct
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : opt.value === quizAnswer
                        ? "bg-red-500/20 border-red-500/40 text-red-300"
                        : "border-white/10 text-slate-500"
                    : "border-white/10 hover:border-yellow-500/40 hover:bg-yellow-500/5 text-slate-300 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {quizSubmitted && (
            <div className={`mt-4 p-3 rounded-xl text-sm ${quizAnswer === FEATURE_CONTENT.quiz.correct ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-500/10 text-slate-300"}`}>
              {quizAnswer === FEATURE_CONTENT.quiz.correct
                ? `✅ ${zh ? "回答正确！" : "Correct!"} ${FEATURE_CONTENT.quiz.explanation}`
                : `❌ ${zh ? "答案是：" : "Answer: "}${FEATURE_CONTENT.quiz.options.find(o => o.value === FEATURE_CONTENT.quiz!.correct)?.label}。${FEATURE_CONTENT.quiz.explanation}`}
            </div>
          )}
        </div>
      )}

      {/* Pro Tips */}
      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
        <h3 className="text-sm font-black text-yellow-400 mb-3">
          💡 {zh ? "新手必知" : "Pro Tips"}
        </h3>
        <ul className="space-y-2">
          {FEATURE_CONTENT.proTips.map((tip, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
              <span className="text-yellow-400 shrink-0 mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Compare Tab ───────────────────────────────────────────────────────────────

function CompareTab({ zh, selectedExchange, setSelectedExchange }: {
  zh: boolean;
  selectedExchange: string | null;
  setSelectedExchange: (s: string | null) => void;
}) {
  const active = selectedExchange ?? "binance";
  const { data: features = [], isLoading } = trpc.exchangeGuide.exchangeFeatures.useQuery({ exchangeSlug: active });
  const { data: categories = [] } = trpc.exchangeGuide.categories.useQuery();

  const ex = EXCHANGE_LIST.find(e => e.slug === active)!;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white mb-2">
          {zh ? "五大交易所功能全览" : "Exchange Feature Overview"}
        </h2>
        <p className="text-slate-400 text-sm">
          {zh ? "选择一家交易所，查看其全部功能支持情况。" : "Select an exchange to view all supported features."}
        </p>
      </div>

      {/* Exchange Selector */}
      <div className="flex flex-wrap gap-3 mb-8">
        {EXCHANGE_LIST.map((e) => (
          <button
            key={e.slug}
            onClick={() => setSelectedExchange(e.slug)}
            className={`px-4 py-2 rounded-xl border font-bold text-sm transition-all ${
              active === e.slug
                ? `bg-gradient-to-r ${e.color} ${e.border} text-white`
                : "border-white/10 text-slate-400 hover:text-white hover:border-white/30"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${e.dot} inline-block mr-2`} />
            {e.name}
          </button>
        ))}
      </div>

      {/* Exchange Overview Card */}
      <div className={`rounded-2xl border ${ex.border} bg-gradient-to-br ${ex.color} p-6 mb-8`}>
        <h3 className="text-xl font-black text-white mb-1">{ex.name}</h3>
        <p className="text-slate-300 text-sm">{getExchangeOverview(ex.slug, zh)}</p>
      </div>

      {/* Feature Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const cat = categories.find(c => c.slug === f.featureSlug);
            return (
              <div
                key={f.id}
                className={`rounded-xl border p-4 transition-all ${
                  f.supported === 1
                    ? f.highlight === 1
                      ? "border-yellow-500/40 bg-yellow-500/5"
                      : "border-white/10 bg-white/3"
                    : "border-white/5 bg-white/1 opacity-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{cat?.icon ?? "📌"}</span>
                  <span className="font-bold text-white text-sm">{zh ? (cat?.nameZh ?? f.featureSlug) : (cat?.nameEn ?? f.featureSlug)}</span>
                  {f.highlight === 1 && (
                    <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-1.5 py-0.5 rounded-full font-bold">
                      {zh ? "亮点" : "★"}
                    </span>
                  )}
                </div>
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border mb-2 ${
                  f.supported === 1 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-slate-500/20 text-slate-500 border-slate-500/30"
                }`}>
                  {zh ? f.levelZh : f.levelEn}
                </span>
                <p className="text-slate-400 text-xs leading-relaxed">{zh ? f.detailZh : f.detailEn}</p>
                {f.feeInfo && (
                  <p className="text-yellow-400/70 text-xs mt-2 font-medium">💰 {f.feeInfo}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Exchange Recommendation */}
      <div className="mt-12 rounded-2xl border border-white/10 bg-white/3 p-6">
        <h3 className="text-lg font-black text-white mb-4">
          {zh ? "🏆 交易所选择建议" : "🏆 Exchange Recommendation"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXCHANGE_RECOMMENDATIONS(zh).map((rec, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/3 p-4">
              <div className="text-2xl mb-2">{rec.emoji}</div>
              <h4 className="font-black text-white text-sm mb-1">{rec.title}</h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-2">{rec.desc}</p>
              <div className="flex flex-wrap gap-1">
                {rec.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/beginner">
            <button className="border border-yellow-500/40 hover:bg-yellow-500/10 text-yellow-300 font-bold px-6 py-2.5 rounded-xl transition-all text-sm">
              {zh ? "💬 还有疑问？前往新手问答 →" : "💬 Still confused? Visit FAQ →"}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Static Content Helpers ────────────────────────────────────────────────────

function getExchangeOverview(slug: string, zh: boolean): string {
  const data: Record<string, { zh: string; en: string }> = {
    binance: {
      zh: "全球最大的加密货币交易所，日均交易量超 650 亿美元，支持 350+ 交易对，产品线最全面，适合各类用户。",
      en: "World's largest crypto exchange with $65B+ daily volume, 350+ trading pairs, and the most comprehensive product lineup.",
    },
    okx: {
      zh: "全球第二大交易所，以 Web3 钱包和链上功能著称，合约交易深度极佳，OKX Web3 钱包支持 100+ 公链。",
      en: "World's 2nd largest exchange, renowned for its Web3 wallet supporting 100+ chains and excellent derivatives depth.",
    },
    bybit: {
      zh: "以合约交易起家，近年快速扩张至现货和 TradFi 领域，交易界面专业，跟单交易功能业界领先。",
      en: "Started with derivatives, rapidly expanded to spot and TradFi. Professional UI and industry-leading copy trading.",
    },
    gate: {
      zh: "支持币种数量最多（1700+），上新速度快，适合寻找小市值项目的用户，TradFi 资产覆盖广泛。",
      en: "Largest selection of coins (1700+), fastest listing speed, ideal for small-cap hunters with broad TradFi coverage.",
    },
    bitget: {
      zh: "跟单交易平台的行业标杆，拥有超过 10 万名专业交易员供用户跟单，合约费率极具竞争力。",
      en: "Industry benchmark for copy trading with 100,000+ professional traders, highly competitive derivatives fees.",
    },
  };
  return zh ? (data[slug]?.zh ?? "") : (data[slug]?.en ?? "");
}

function EXCHANGE_RECOMMENDATIONS(zh: boolean) {
  return [
    {
      emoji: "🌟",
      title: zh ? "新手首选" : "Best for Beginners",
      desc: zh ? "界面友好、中文支持完善、P2P 法币入金便捷，安全性有保障。" : "Friendly UI, great Chinese support, easy P2P fiat on-ramp.",
      tags: ["Binance", "OKX"],
    },
    {
      emoji: "📈",
      title: zh ? "合约玩家" : "Derivatives Traders",
      desc: zh ? "高流动性、低滑点、多种合约类型，适合专业合约交易者。" : "High liquidity, low slippage, multiple contract types for pro traders.",
      tags: ["Bybit", "Binance", "OKX"],
    },
    {
      emoji: "🔍",
      title: zh ? "寻找新币" : "Altcoin Hunters",
      desc: zh ? "上新速度最快，支持最多小市值项目，打新机会丰富。" : "Fastest new listings, most small-cap projects, rich IEO opportunities.",
      tags: ["Gate.io", "Bitget"],
    },
    {
      emoji: "🤝",
      title: zh ? "跟单交易" : "Copy Trading",
      desc: zh ? "无需自己分析，跟随专业交易员自动复制交易，适合忙碌的上班族。" : "Auto-copy professional traders without analysis. Great for busy workers.",
      tags: ["Bitget", "Bybit"],
    },
    {
      emoji: "🌐",
      title: zh ? "Web3 探索" : "Web3 Explorer",
      desc: zh ? "内置 Web3 钱包，支持 DEX、NFT、DeFi，一站式 Web3 体验。" : "Built-in Web3 wallet supporting DEX, NFT, DeFi — all-in-one Web3 hub.",
      tags: ["OKX", "Binance"],
    },
    {
      emoji: "🏦",
      title: zh ? "理财增值" : "Passive Income",
      desc: zh ? "活期理财、Launchpool、Staking，让闲置资产持续产生收益。" : "Flexible savings, Launchpool, Staking — put idle assets to work.",
      tags: ["Binance", "OKX", "Gate.io"],
    },
  ];
}

interface FeatureContent {
  sections: Array<{ title: string; body: string; tips?: string[] }>;
  quiz?: {
    question: string;
    options: Array<{ value: string; label: string }>;
    correct: string;
    explanation: string;
  };
  proTips: string[];
}

function getFeatureContent(slug: string, zh: boolean): FeatureContent {
  const content: Record<string, FeatureContent> = {
    spot: {
      sections: [
        {
          title: zh ? "什么是现货交易？" : "What is Spot Trading?",
          body: zh
            ? "现货交易是最基础的加密货币交易方式：你用一种资产直接买入另一种资产，交易即时完成，资产立刻归你所有。例如用 100 USDT 买入 BTC，价格上涨后卖出获利。现货交易没有杠杆，最多亏损本金，是新手入门的最佳选择。"
            : "Spot trading is the most basic form of crypto trading: you directly exchange one asset for another, with immediate settlement. For example, buy BTC with 100 USDT and sell when the price rises. No leverage means you can only lose your principal — perfect for beginners.",
          tips: zh
            ? ["挂单（Limit Order）：设定价格，等待成交，手续费更低", "市价单（Market Order）：立即以当前价格成交，适合急需交易时", "止损单（Stop Loss）：设定触发价，自动卖出防止亏损扩大"]
            : ["Limit Order: set your price, wait for fill, lower fees", "Market Order: fill immediately at current price", "Stop Loss: auto-sell at trigger price to limit losses"],
        },
        {
          title: zh ? "手续费对比" : "Fee Comparison",
          body: zh
            ? "各交易所现货手续费通常在 0.1% 左右。通过合作伙伴链接注册可享受折扣，持有平台币（BNB/OKB/GT 等）还可进一步降低费率。长期交易者每年可节省数千元手续费。"
            : "Spot fees are typically around 0.1%. Register via partner links for discounts, and hold platform tokens (BNB/OKB/GT) for further reductions. Active traders can save thousands annually.",
        },
      ],
      quiz: {
        question: zh ? "现货交易中，「挂单（Maker）」和「吃单（Taker）」哪个手续费更低？" : "In spot trading, which has lower fees: Maker or Taker?",
        options: [
          { value: "a", label: zh ? "A. 挂单（Maker）更低" : "A. Maker is lower" },
          { value: "b", label: zh ? "B. 吃单（Taker）更低" : "B. Taker is lower" },
          { value: "c", label: zh ? "C. 两者相同" : "C. They are the same" },
        ],
        correct: "a",
        explanation: zh ? "挂单方为市场提供流动性，交易所给予更低手续费作为奖励，通常比吃单低 0.01%-0.02%。" : "Makers provide liquidity and are rewarded with lower fees, typically 0.01-0.02% less than takers.",
      },
      proTips: zh
        ? ["新手建议从现货开始，不要碰合约", "使用限价单而非市价单，节省手续费", "持有 BNB 可在 Binance 享受 25% 手续费折扣", "分批买入（定投）比一次性买入风险更低"]
        : ["Beginners should start with spot, avoid futures", "Use limit orders to save on fees", "Hold BNB for 25% fee discount on Binance", "DCA (dollar-cost averaging) is safer than lump-sum buying"],
    },
    futures: {
      sections: [
        {
          title: zh ? "什么是合约交易？" : "What is Futures Trading?",
          body: zh
            ? "合约交易（永续合约）允许你用「保证金」控制更大的仓位，通过杠杆放大收益（同时也放大风险）。永续合约没有到期日，可以做多（看涨）也可以做空（看跌）。例如：用 100 USDT 开 10 倍杠杆，相当于控制 1000 USDT 的仓位，价格涨 10% 你赚 100%，但跌 10% 也会亏损 100%（强平）。"
            : "Futures (perpetual contracts) let you control a larger position with margin through leverage. No expiry date, supports both long (bullish) and short (bearish). Example: 100 USDT at 10x leverage controls a 1000 USDT position — 10% price gain = 100% profit, but 10% drop = 100% loss (liquidation).",
          tips: zh
            ? ["永续合约有资金费率，持仓超过 8 小时需支付/收取费用", "强平价格 = 开仓价格 ± (保证金 / 仓位大小)", "建议新手使用 2-3 倍杠杆，切勿满仓操作"]
            : ["Perpetual contracts have funding rates every 8 hours", "Liquidation price = entry ± (margin / position size)", "Beginners should use 2-3x leverage, never go all-in"],
        },
        {
          title: zh ? "资金费率机制" : "Funding Rate Mechanism",
          body: zh
            ? "资金费率是永续合约特有的机制，每 8 小时结算一次。当市场整体看多时，多头向空头支付费率；当市场看空时，空头向多头支付。这一机制使永续合约价格与现货价格保持锚定，避免长期偏离。"
            : "Funding rates are unique to perpetual contracts, settled every 8 hours. When the market is bullish, longs pay shorts; when bearish, shorts pay longs. This mechanism keeps perpetual prices anchored to spot prices.",
        },
      ],
      quiz: {
        question: zh ? "开 10 倍杠杆做多，价格下跌多少会被强制平仓？" : "With 10x leverage long, how much price drop triggers liquidation?",
        options: [
          { value: "a", label: zh ? "A. 下跌 5%" : "A. 5% drop" },
          { value: "b", label: zh ? "B. 下跌 10%" : "B. 10% drop" },
          { value: "c", label: zh ? "C. 下跌 50%" : "C. 50% drop" },
        ],
        correct: "b",
        explanation: zh ? "10 倍杠杆意味着保证金率为 10%，价格下跌约 10% 时保证金耗尽，触发强制平仓。" : "10x leverage means 10% margin ratio. A ~10% price drop exhausts the margin, triggering liquidation.",
      },
      proTips: zh
        ? ["永远设置止损，不要裸奔", "杠杆越高，强平价格越接近开仓价", "Bybit 和 Binance 的合约流动性最好", "资金费率为负时，空头反而收钱，可以考虑对冲策略"]
        : ["Always set stop-loss, never trade without one", "Higher leverage = liquidation price closer to entry", "Bybit and Binance have the best futures liquidity", "Negative funding rate means shorts earn — consider hedging"],
    },
    margin: {
      sections: [
        {
          title: zh ? "杠杆交易 vs 合约交易" : "Margin vs Futures",
          body: zh
            ? "杠杆交易是在现货市场借入资金进行交易，你实际持有的是真实的加密货币资产。与合约不同，杠杆交易有借贷利息，但没有资金费率，且可以提取实物资产。最高杠杆通常为 3-10 倍，风险相对合约更低。"
            : "Margin trading borrows funds to trade in the spot market — you actually hold real crypto assets. Unlike futures, margin trading has borrowing interest but no funding rates, and you can withdraw real assets. Max leverage is typically 3-10x, lower risk than futures.",
          tips: zh
            ? ["借贷利率按小时计算，长期持仓成本较高", "全仓模式：所有资产作为保证金，风险更高", "逐仓模式：单独设置每个仓位的保证金，风险可控"]
            : ["Borrowing interest is hourly — high cost for long holds", "Cross margin: all assets as collateral, higher risk", "Isolated margin: separate collateral per position, controlled risk"],
        },
      ],
      quiz: {
        question: zh ? "杠杆交易和合约交易最主要的区别是什么？" : "What is the main difference between margin and futures trading?",
        options: [
          { value: "a", label: zh ? "A. 杠杆交易持有真实资产，合约交易持有虚拟合约" : "A. Margin holds real assets, futures hold virtual contracts" },
          { value: "b", label: zh ? "B. 合约交易手续费更低" : "B. Futures have lower fees" },
          { value: "c", label: zh ? "C. 杠杆交易没有风险" : "C. Margin trading has no risk" },
        ],
        correct: "a",
        explanation: zh ? "杠杆交易在现货市场进行，持有真实加密资产；合约交易是衍生品，持有的是合约而非实物资产。" : "Margin trading occurs in the spot market with real assets; futures are derivatives — you hold contracts, not actual assets.",
      },
      proTips: zh
        ? ["杠杆交易适合中短期持仓，长期持仓利息成本高", "Binance 和 OKX 的杠杆交易流动性最好", "新手建议先用现货熟悉市场，再尝试杠杆"]
        : ["Margin suits short-to-medium holds; long holds incur high interest", "Binance and OKX have the best margin liquidity", "Beginners: master spot first, then try margin"],
    },
    tradfi: {
      sections: [
        {
          title: zh ? "什么是 TradFi（传统金融）产品？" : "What is TradFi on Exchanges?",
          body: zh
            ? "TradFi（Traditional Finance）是指加密交易所提供的传统金融资产交易，包括股票代币化（如苹果、特斯拉的代币化股票）、黄金、白银、原油等大宗商品，以及外汇（Forex）交易。Gate.io 和 Bybit 在这一领域布局最为积极，让用户无需开设证券账户即可交易全球资产。"
            : "TradFi on crypto exchanges refers to tokenized traditional financial assets: stocks (Apple, Tesla tokens), commodities (gold, silver, oil), and forex. Gate.io and Bybit lead in this area, letting users trade global assets without a brokerage account.",
          tips: zh
            ? ["代币化股票与真实股票价格挂钩，但不享有股东权利", "交易时间不受传统市场限制，可 7×24 小时交易", "Gate.io 支持 NYSE/NASDAQ 上市公司股票代币化交易"]
            : ["Tokenized stocks track real prices but carry no shareholder rights", "Trade 24/7 without traditional market hour restrictions", "Gate.io supports tokenized NYSE/NASDAQ listed stocks"],
        },
      ],
      quiz: {
        question: zh ? "在交易所购买代币化苹果股票（AAPL），你是否成为苹果公司股东？" : "If you buy tokenized Apple stock (AAPL) on an exchange, are you an Apple shareholder?",
        options: [
          { value: "a", label: zh ? "A. 是，享有完整股东权利" : "A. Yes, with full shareholder rights" },
          { value: "b", label: zh ? "B. 否，只是价格挂钩的代币" : "B. No, it's just a price-pegged token" },
          { value: "c", label: zh ? "C. 享有部分股东权利" : "C. Partial shareholder rights" },
        ],
        correct: "b",
        explanation: zh ? "代币化股票只是追踪真实股票价格的合成资产，不赋予持有者任何股东权利，如投票权或股息。" : "Tokenized stocks are synthetic assets that track real stock prices. They do not grant shareholder rights like voting or dividends.",
      },
      proTips: zh
        ? ["Gate.io 的 TradFi 产品线最丰富，覆盖股票、大宗商品、外汇", "Bybit 近年大力扩展 TradFi，支持黄金和石油交易", "TradFi 资产流动性相对较低，注意滑点"]
        : ["Gate.io has the richest TradFi lineup: stocks, commodities, forex", "Bybit has aggressively expanded into TradFi with gold and oil", "TradFi assets have lower liquidity — watch for slippage"],
    },
    earn: {
      sections: [
        {
          title: zh ? "理财产品类型" : "Types of Earn Products",
          body: zh
            ? "交易所理财产品主要分为：① 活期理财（Flexible Savings）：随存随取，年化收益 1-8%；② 定期理财（Fixed Savings）：锁定一定期限，收益更高；③ Launchpool：质押平台币挖矿新项目代币，收益潜力高；④ Staking：质押 PoS 代币参与网络验证，获得链上奖励；⑤ 双币理财：结构性产品，适合有方向判断的用户。"
            : "Exchange earn products include: ① Flexible Savings: deposit/withdraw anytime, 1-8% APY; ② Fixed Savings: locked term, higher yield; ③ Launchpool: stake platform tokens to mine new project tokens; ④ Staking: stake PoS tokens for on-chain rewards; ⑤ Dual Investment: structured products for directional traders.",
          tips: zh
            ? ["活期理财适合短期闲置资金，随时可用", "Launchpool 收益波动大，取决于新项目代币价格", "Staking 有解锁期，急需资金时无法立即取回"]
            : ["Flexible savings for short-term idle funds, always accessible", "Launchpool yields vary with new token prices", "Staking has unbonding periods — funds aren't immediately available"],
        },
      ],
      quiz: {
        question: zh ? "Launchpool 的主要收益来源是什么？" : "What is the main source of Launchpool rewards?",
        options: [
          { value: "a", label: zh ? "A. 交易所利息" : "A. Exchange interest" },
          { value: "b", label: zh ? "B. 新项目代币奖励" : "B. New project token rewards" },
          { value: "c", label: zh ? "C. 链上质押奖励" : "C. On-chain staking rewards" },
        ],
        correct: "b",
        explanation: zh ? "Launchpool 是质押平台币（如 BNB）来挖取新项目代币的机制，收益取决于新代币的价格表现。" : "Launchpool involves staking platform tokens (like BNB) to mine new project tokens. Yields depend on the new token's price performance.",
      },
      proTips: zh
        ? ["Binance Launchpool 历史收益最丰厚，BNB 持有者优先受益", "OKX Jumpstart 是 OKX 的等效产品", "理财产品不是无风险的，稳定币理财也有智能合约风险"]
        : ["Binance Launchpool historically has the best yields for BNB holders", "OKX Jumpstart is OKX's equivalent product", "Earn products aren't risk-free — stablecoin vaults have smart contract risk"],
    },
    web3: {
      sections: [
        {
          title: zh ? "交易所内置 Web3 钱包" : "Built-in Web3 Wallets",
          body: zh
            ? "主流交易所均推出了内置 Web3 钱包，让用户无需离开 App 即可访问链上世界。OKX Web3 钱包支持 100+ 公链，是目前功能最强大的交易所内置钱包；Binance Web3 钱包支持 BNB Chain、以太坊等主流链；Gate.io Web3 钱包支持多链 DeFi 和 NFT 交易。"
            : "Major exchanges have built-in Web3 wallets for on-chain access without leaving the app. OKX Web3 Wallet supports 100+ chains — the most powerful built-in wallet; Binance Web3 Wallet covers BNB Chain, Ethereum, and more; Gate.io Web3 Wallet supports multi-chain DeFi and NFT trading.",
          tips: zh
            ? ["内置钱包私钥由交易所托管，安全性不如独立硬件钱包", "适合小额链上操作，大额资产建议转入冷钱包", "OKX Web3 钱包支持 DEX 聚合器，可以找到最优兑换路径"]
            : ["Built-in wallet private keys are custodied by the exchange — less secure than hardware wallets", "Good for small on-chain operations; large holdings should go to cold wallets", "OKX Web3 Wallet has a DEX aggregator for best swap rates"],
        },
      ],
      quiz: {
        question: zh ? "交易所内置 Web3 钱包与独立硬件钱包相比，最主要的安全差异是什么？" : "What is the main security difference between an exchange Web3 wallet and a hardware wallet?",
        options: [
          { value: "a", label: zh ? "A. 内置钱包私钥由交易所托管" : "A. Exchange wallet private keys are custodied by the exchange" },
          { value: "b", label: zh ? "B. 内置钱包不支持 DeFi" : "B. Built-in wallets don't support DeFi" },
          { value: "c", label: zh ? "C. 两者安全性相同" : "C. Both have the same security" },
        ],
        correct: "a",
        explanation: zh ? "内置钱包的私钥由交易所管理，如果交易所被黑客攻击或倒闭，资产可能面临风险。硬件钱包私钥完全由用户掌控。" : "Built-in wallet private keys are managed by the exchange. If the exchange is hacked or goes bankrupt, assets may be at risk. Hardware wallet keys are fully user-controlled.",
      },
      proTips: zh
        ? ["OKX Web3 钱包是目前功能最全的交易所内置钱包", "日常小额 DeFi 操作可用内置钱包，大额资产用 Ledger/Trezor", "内置钱包通常支持 NFT 展示和交易"]
        : ["OKX Web3 Wallet is the most feature-rich exchange built-in wallet", "Use built-in wallets for small DeFi ops; use Ledger/Trezor for large holdings", "Built-in wallets typically support NFT display and trading"],
    },
    options: {
      sections: [
        {
          title: zh ? "什么是期权交易？" : "What is Options Trading?",
          body: zh
            ? "期权赋予持有者在特定时间以特定价格买入（看涨期权/Call）或卖出（看跌期权/Put）资产的权利，但没有义务。买方支付权利金（Premium），最大亏损为权利金；卖方收取权利金，但面临无限亏损风险。期权是高级衍生品工具，适合有丰富经验的交易者。"
            : "Options give holders the right (not obligation) to buy (Call) or sell (Put) an asset at a specific price by a specific date. Buyers pay a premium with maximum loss limited to the premium; sellers collect premium but face unlimited loss risk. Options are advanced derivatives for experienced traders.",
          tips: zh
            ? ["Deribit 是加密期权市场的主要平台，Binance 和 OKX 也提供期权", "Delta 表示期权价格对标的资产价格变动的敏感度", "期权适合对冲现货仓位风险，而非单纯投机"]
            : ["Deribit is the main crypto options platform; Binance and OKX also offer options", "Delta measures option price sensitivity to underlying asset price changes", "Options are best for hedging spot positions, not pure speculation"],
        },
      ],
      quiz: {
        question: zh ? "购买看涨期权（Call Option），最大亏损是多少？" : "When buying a Call Option, what is the maximum loss?",
        options: [
          { value: "a", label: zh ? "A. 无限亏损" : "A. Unlimited loss" },
          { value: "b", label: zh ? "B. 仅限支付的权利金" : "B. Limited to the premium paid" },
          { value: "c", label: zh ? "C. 标的资产价格的 10%" : "C. 10% of the underlying asset price" },
        ],
        correct: "b",
        explanation: zh ? "期权买方的最大亏损是支付的权利金（Premium），无论标的资产价格如何变动，亏损不会超过权利金。" : "The maximum loss for an option buyer is the premium paid. Regardless of how the underlying asset moves, losses cannot exceed the premium.",
      },
      proTips: zh
        ? ["期权是高级工具，新手不建议直接参与", "Binance 期权适合已有合约交易经验的用户", "期权可以用来对冲现货持仓，降低整体风险"]
        : ["Options are advanced tools — not recommended for beginners", "Binance options suit users with futures trading experience", "Use options to hedge spot positions and reduce overall risk"],
    },
    copy_trading: {
      sections: [
        {
          title: zh ? "什么是跟单交易？" : "What is Copy Trading?",
          body: zh
            ? "跟单交易允许你自动复制专业交易员的每一笔操作，无需自己分析市场。你设定跟单金额和风险参数，系统按比例自动执行。Bitget 和 Bybit 是跟单交易的行业标杆，分别拥有超过 10 万名和 5 万名专业交易员供用户选择。"
            : "Copy trading lets you automatically replicate every trade of professional traders without market analysis. Set your copy amount and risk parameters, and the system executes proportionally. Bitget and Bybit are industry leaders with 100,000+ and 50,000+ professional traders respectively.",
          tips: zh
            ? ["选择交易员时关注：胜率、最大回撤、交易频率、历史收益", "建议跟单多名交易员分散风险，不要全押一人", "设置止损比例，避免单次跟单亏损过大"]
            : ["When selecting traders, check: win rate, max drawdown, trade frequency, historical returns", "Copy multiple traders to diversify risk — don't put all eggs in one basket", "Set a stop-loss percentage to limit losses from any single copy trade"],
        },
      ],
      quiz: {
        question: zh ? "跟单交易中，选择交易员时最重要的指标是什么？" : "In copy trading, what is the most important metric when selecting a trader?",
        options: [
          { value: "a", label: zh ? "A. 总收益率越高越好" : "A. Highest total return rate" },
          { value: "b", label: zh ? "B. 胜率和最大回撤的综合表现" : "B. Combined win rate and max drawdown" },
          { value: "c", label: zh ? "C. 跟单人数越多越好" : "C. Most followers" },
        ],
        correct: "b",
        explanation: zh ? "高收益率可能伴随极高风险。综合考量胜率（稳定性）和最大回撤（风险控制）才能找到真正优秀的交易员。" : "High returns often come with high risk. Combining win rate (consistency) with max drawdown (risk control) identifies truly skilled traders.",
      },
      proTips: zh
        ? ["Bitget 跟单交易员数量最多，选择空间最大", "Bybit 跟单界面最专业，数据展示最详细", "新手建议从小额跟单开始，观察 1-2 个月再加仓"]
        : ["Bitget has the most copy traders to choose from", "Bybit has the most professional copy trading interface with detailed data", "Beginners: start with small amounts, observe for 1-2 months before increasing"],
    },
    community: {
      sections: [
        {
          title: zh ? "交易所社区功能" : "Exchange Community Features",
          body: zh
            ? "主流交易所均建立了社区生态，包括：交易员广场（分享交易观点）、行情讨论区、官方 Telegram/Discord 群组、KOL 合作计划等。Binance Square 是目前最活跃的交易所社区，OKX 社区也在快速增长。社区是获取市场信息和交流经验的重要渠道。"
            : "Major exchanges have built community ecosystems: trader squares (sharing trading views), market discussion boards, official Telegram/Discord groups, and KOL partnership programs. Binance Square is the most active exchange community, with OKX Community growing rapidly. Communities are key channels for market insights and experience sharing.",
        },
      ],
      quiz: {
        question: zh ? "Binance Square 主要是什么功能？" : "What is Binance Square primarily used for?",
        options: [
          { value: "a", label: zh ? "A. 交易员分享观点和市场分析的社区平台" : "A. Community platform for traders to share views and market analysis" },
          { value: "b", label: zh ? "B. 专业量化交易工具" : "B. Professional quantitative trading tools" },
          { value: "c", label: zh ? "C. NFT 交易市场" : "C. NFT marketplace" },
        ],
        correct: "a",
        explanation: zh ? "Binance Square 是 Binance 的社交内容平台，用户可以发布交易观点、市场分析，关注 KOL 和专业交易员。" : "Binance Square is Binance's social content platform where users share trading views, market analysis, and follow KOLs and professional traders.",
      },
      proTips: zh
        ? ["加入官方 Telegram 群可第一时间获取交易所公告", "Binance Square 有优质 KOL 内容，但需甄别信息真伪", "社区讨论可以帮助了解市场情绪，但不应作为唯一决策依据"]
        : ["Join official Telegram groups for first-hand exchange announcements", "Binance Square has quality KOL content — but verify information carefully", "Community discussions help gauge market sentiment but shouldn't be your only decision basis"],
    },
    trading_bot: {
      sections: [
        {
          title: zh ? "交易机器人类型" : "Types of Trading Bots",
          body: zh
            ? "主流交易所提供多种内置交易机器人：① 网格机器人（Grid Bot）：在价格区间内自动低买高卖，适合震荡行情；② 定投机器人（DCA Bot）：定期买入，摊低成本；③ 套利机器人（Arbitrage Bot）：利用不同市场价差获利；④ 信号机器人（Signal Bot）：根据技术指标自动交易。Bitget 和 Gate.io 的机器人功能最为丰富。"
            : "Major exchanges offer built-in trading bots: ① Grid Bot: auto buy-low-sell-high within a price range, ideal for sideways markets; ② DCA Bot: periodic purchases to average down cost; ③ Arbitrage Bot: profit from price differences across markets; ④ Signal Bot: auto-trade based on technical indicators. Bitget and Gate.io have the richest bot features.",
          tips: zh
            ? ["网格机器人在震荡行情中表现最佳，单边趋势行情中可能亏损", "定投机器人适合长期看好某资产的用户", "机器人需要持续监控，不是完全无人值守的"]
            : ["Grid bots perform best in sideways markets; may lose in strong trends", "DCA bots suit users who are long-term bullish on an asset", "Bots require ongoing monitoring — they're not fully autonomous"],
        },
      ],
      quiz: {
        question: zh ? "网格机器人最适合哪种市场行情？" : "In which market condition do grid bots perform best?",
        options: [
          { value: "a", label: zh ? "A. 单边上涨行情" : "A. Strong uptrend" },
          { value: "b", label: zh ? "B. 震荡横盘行情" : "B. Sideways/ranging market" },
          { value: "c", label: zh ? "C. 单边下跌行情" : "C. Strong downtrend" },
        ],
        correct: "b",
        explanation: zh ? "网格机器人通过在设定价格区间内反复低买高卖获利，最适合价格在一定范围内震荡的行情。" : "Grid bots profit by repeatedly buying low and selling high within a set price range — they're most effective in ranging/sideways markets.",
      },
      proTips: zh
        ? ["Gate.io 和 Bitget 的网格机器人功能最成熟", "设置网格时，价格区间不宜过宽，否则单格利润太低", "建议先用小资金测试机器人策略，再加大投入"]
        : ["Gate.io and Bitget have the most mature grid bot features", "Don't set too wide a grid range — each grid profit becomes too small", "Test bot strategies with small capital before scaling up"],
    },
    otc: {
      sections: [
        {
          title: zh ? "什么是 OTC 场外交易？" : "What is OTC Trading?",
          body: zh
            ? "OTC（Over-The-Counter）场外交易是指不通过交易所公开市场，而是直接与对手方进行的大额交易。主要形式：① P2P 交易：用户之间直接买卖，支持支付宝/微信/银行转账；② 机构 OTC：专为大额交易设计，最小起点通常为 10 万美元以上，价格更优惠，不影响市场价格。"
            : "OTC (Over-The-Counter) trading bypasses the public exchange order book for direct large-volume transactions. Main forms: ① P2P: direct user-to-user trading supporting Alipay/WeChat/bank transfer; ② Institutional OTC: designed for large trades ($100K+ minimum), better pricing without market impact.",
          tips: zh
            ? ["P2P 是国内用户购买 USDT 的主要方式", "选择有担保的 P2P 商家，避免诈骗", "大额 OTC 交易需要 KYC 认证和资金来源证明"]
            : ["P2P is the primary way for Chinese users to buy USDT", "Choose escrow-protected P2P merchants to avoid scams", "Large OTC trades require KYC and proof of funds source"],
        },
      ],
      quiz: {
        question: zh ? "P2P 交易中，交易所扮演什么角色？" : "In P2P trading, what role does the exchange play?",
        options: [
          { value: "a", label: zh ? "A. 直接参与买卖" : "A. Direct buyer/seller" },
          { value: "b", label: zh ? "B. 担保方，托管加密货币直到交易完成" : "B. Escrow agent, holding crypto until trade completes" },
          { value: "c", label: zh ? "C. 不参与，纯粹撮合" : "C. Pure matchmaker with no involvement" },
        ],
        correct: "b",
        explanation: zh ? "交易所在 P2P 交易中充当担保方，卖方的加密货币被锁定在交易所托管，买方付款确认后才释放，保障双方安全。" : "The exchange acts as an escrow agent in P2P trading — the seller's crypto is locked by the exchange and only released after the buyer's payment is confirmed, protecting both parties.",
      },
      proTips: zh
        ? ["Binance P2P 和 OKX P2P 是国内用户最常用的法币入金渠道", "交易时不要在聊天中透露个人信息", "遇到异常情况立即申诉，不要轻易放行"]
        : ["Binance P2P and OKX P2P are the most popular fiat on-ramps for Chinese users", "Never share personal information in P2P chat", "File a dispute immediately if anything seems wrong — don't release funds hastily"],
    },
    launchpad: {
      sections: [
        {
          title: zh ? "什么是打新（Launchpad/IEO）？" : "What is Launchpad/IEO?",
          body: zh
            ? "打新是指在新项目代币正式上市前，通过交易所的 Launchpad 平台以优惠价格认购。IEO（Initial Exchange Offering）由交易所背书，比 ICO 更安全。参与方式：① 质押平台币（BNB/OKB/GT）获得认购资格；② 按持仓量分配认购份额；③ 代币上市后通常有较大涨幅。Binance Launchpad 历史收益最为丰厚。"
            : "Launchpad/IEO (Initial Exchange Offering) lets users subscribe to new project tokens at preferential prices before public listing, backed by the exchange for better security than ICOs. Participation: ① Stake platform tokens (BNB/OKB/GT) for subscription eligibility; ② Allocation based on holdings; ③ Tokens often surge significantly after listing. Binance Launchpad has historically delivered the best returns.",
          tips: zh
            ? ["BNB 持有量越多，Binance Launchpad 认购份额越大", "打新有锁仓期，代币上市后才能卖出", "并非所有打新项目都会上涨，需要研究项目基本面"]
            : ["More BNB holdings = larger Binance Launchpad allocation", "Launchpad tokens have lock-up periods before you can sell", "Not all IEO projects pump — research project fundamentals"],
        },
      ],
      quiz: {
        question: zh ? "参与 Binance Launchpad 打新的主要条件是什么？" : "What is the main requirement to participate in Binance Launchpad?",
        options: [
          { value: "a", label: zh ? "A. 持有 BNB 并完成 KYC" : "A. Hold BNB and complete KYC" },
          { value: "b", label: zh ? "B. 只需要有 USDT" : "B. Just need USDT" },
          { value: "c", label: zh ? "C. 需要是 VIP 用户" : "C. Must be a VIP user" },
        ],
        correct: "a",
        explanation: zh ? "Binance Launchpad 要求用户持有 BNB 并完成 KYC 认证，BNB 持仓量决定认购份额大小。" : "Binance Launchpad requires holding BNB and completing KYC. The amount of BNB held determines the subscription allocation.",
      },
      proTips: zh
        ? ["Binance Launchpad 历史年化收益超过 300%，是持有 BNB 的重要理由", "Gate.io Startup 和 OKX Jumpstart 也是优质打新平台", "打新前务必研究项目白皮书和团队背景"]
        : ["Binance Launchpad has historically delivered 300%+ annualized returns — a key reason to hold BNB", "Gate.io Startup and OKX Jumpstart are also quality launchpad platforms", "Always research the project whitepaper and team before participating in IEOs"],
    },
    ecosystem: {
      sections: [
        {
          title: zh ? "交易所生态系统" : "Exchange Ecosystem",
          body: zh
            ? "头部交易所已从单纯的交易平台演变为完整的金融生态系统。Binance 生态包括：BNB Chain（公链）、Binance Pay（支付）、Binance Card（加密借记卡）、Binance NFT（NFT 市场）；OKX 生态包括：OKX Web3 钱包、OKX NFT、OKX DEX；Gate.io 生态包括：GateChain（公链）、Gate NFT、Gate Wallet。"
            : "Top exchanges have evolved from pure trading platforms into complete financial ecosystems. Binance ecosystem: BNB Chain (blockchain), Binance Pay (payments), Binance Card (crypto debit card), Binance NFT; OKX ecosystem: OKX Web3 Wallet, OKX NFT, OKX DEX; Gate.io ecosystem: GateChain (blockchain), Gate NFT, Gate Wallet.",
          tips: zh
            ? ["BNB Chain 是目前交易量最大的 EVM 兼容公链之一", "使用生态内产品通常可以获得额外奖励", "交易所自有公链的安全性需要额外关注"]
            : ["BNB Chain is one of the highest-volume EVM-compatible blockchains", "Using ecosystem products often earns additional rewards", "Exchange-owned blockchains require extra security scrutiny"],
        },
      ],
      quiz: {
        question: zh ? "BNB Chain 是哪家交易所推出的公链？" : "Which exchange launched BNB Chain?",
        options: [
          { value: "a", label: "A. OKX" },
          { value: "b", label: "B. Binance" },
          { value: "c", label: "C. Gate.io" },
        ],
        correct: "b",
        explanation: zh ? "BNB Chain（原 Binance Smart Chain）是由 Binance 推出的 EVM 兼容公链，BNB 是其原生代币。" : "BNB Chain (formerly Binance Smart Chain) is an EVM-compatible blockchain launched by Binance, with BNB as its native token.",
      },
      proTips: zh
        ? ["BNB Chain 上的 DeFi 协议手续费远低于以太坊", "OKX Web3 钱包支持 100+ 公链，是多链操作的最佳工具", "使用交易所生态产品前，了解其安全审计情况"]
        : ["DeFi protocols on BNB Chain have much lower fees than Ethereum", "OKX Web3 Wallet supports 100+ chains — the best tool for multi-chain operations", "Before using exchange ecosystem products, check their security audit status"],
    },
  };

  return content[slug] ?? {
    sections: [{ title: zh ? "功能介绍" : "Feature Introduction", body: zh ? "该功能详情正在完善中，敬请期待。" : "Feature details coming soon." }],
    proTips: [zh ? "请关注官方公告获取最新信息" : "Follow official announcements for the latest updates"],
  };
}
