import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronRight, ArrowLeft, BookOpen, TrendingUp, Zap, Shield, Coins, Globe, BarChart2, Bot, Users, Repeat, Star, Layers, Gift, Gamepad2, CreditCard, Shuffle } from "lucide-react";
import { useScrollMemory } from "@/hooks/useScrollMemory";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

// ─── Constants ────────────────────────────────────────────────────────────────

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
  "💳": <CreditCard className="w-5 h-5" />,
  "🔀": <Shuffle className="w-5 h-5" />,
  "🛡️": <Shield className="w-5 h-5" />,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  intermediate: "bg-blue-500/20 text-blue-300 border-blue-500/30",
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

// ─── Marquee Component ────────────────────────────────────────────
// Horizontal scroll marquee with fade-in/out effect.
// Each item slides in from the right and fades out to the left.
// Numbered badges and extensible slot for future categories.

type MarqueeCat = { id: number; slug: string; nameZh: string; nameEn: string; icon: string; sortOrder: number };

// EXTENSIBLE: Add future marquee items here (e.g. promotions, new features)
// Each item needs: id (unique number), slug, nameZh, nameEn, icon, sortOrder
// The component will automatically pick up new items from the categories array.

// Duplicate items for seamless loop: [original x2]
function buildMarqueeItems(categories: MarqueeCat[]) {
  return [...categories, ...categories];
}
function CategoryMarquee({ categories, zh, onSelect }: {
  categories: MarqueeCat[];
  zh: boolean;
  onSelect?: (slug: string) => void;
}) {
  if (categories.length === 0) return null;
  const items = buildMarqueeItems(categories);
  // Speed: px per second. Adjust to taste.
  const speed = 40; // px/s
  // Estimate total width: each item ~130px on average
  const totalWidth = categories.length * 130;
  const duration = totalWidth / speed;
  return (
    <div className="relative overflow-hidden py-3" style={{ minHeight: 52 }}>
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(10,25,47,1), transparent)" }}
      />
      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, rgba(10,25,47,1), transparent)" }}
      />
      {/* Scrolling track */}
      <div className="flex">
        <div
          className="flex items-center gap-5 flex-shrink-0"
          style={{
            animation: `categoryMarquee ${duration}s linear infinite`,
            willChange: "transform",
          }}
        >
          {items.map((cat, i) => {
            const realIdx = i % categories.length;
            return (
              <button
                key={i}
                onClick={() => onSelect?.(cat.slug)}
                className="flex-shrink-0 flex items-center gap-2 select-none hover:opacity-80 active:scale-95 transition-all"
                title={zh ? cat.nameZh : cat.nameEn}
              >
                {/* Number badge */}
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-black shrink-0"
                  style={{ fontSize: 10 }}
                >
                  {realIdx + 1}
                </span>
                <span className="text-lg leading-none shrink-0">{cat.icon}</span>
                <span className="text-sm font-semibold text-white whitespace-nowrap">
                  {zh ? cat.nameZh : cat.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes categoryMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ─── Slider Tab Switcher ──────────────────────────────────────────────────────

function SliderTabSwitcher({ activeTab, setActiveTab, zh }: {
  activeTab: "features" | "compare";
  setActiveTab: (t: "features" | "compare") => void;
  zh: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLButtonElement>(null);
  const compareRef = useRef<HTMLButtonElement>(null);
  const [sliderStyle, setSliderStyle] = useState<React.CSSProperties>({ left: 0, width: 0 });

  useEffect(() => {
    const btn = activeTab === "features" ? featuresRef.current : compareRef.current;
    const container = containerRef.current;
    if (!btn || !container) return;
    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setSliderStyle({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    });
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center bg-white/5 rounded-xl p-1 gap-0"
      style={{ isolation: "isolate" }}
    >
      {/* Physical slider block */}
      <div
        className="absolute top-1 bottom-1 rounded-lg bg-blue-500 z-0"
        style={{
          ...sliderStyle,
          transition: "left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: "0 2px 12px rgba(59,130,246,0.45)",
        }}
      />
      <button
        ref={featuresRef}
        onClick={() => setActiveTab("features")}
        className={`relative z-10 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200 ${
          activeTab === "features" ? "text-white" : "text-slate-400 hover:text-white"
        }`}
      >
        {zh ? "功能介绍" : "Features"}
      </button>
      <button
        ref={compareRef}
        onClick={() => setActiveTab("compare")}
        className={`relative z-10 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200 ${
          activeTab === "compare" ? "text-white" : "text-slate-400 hover:text-white"
        }`}
      >
        {zh ? "交易所对比" : "Compare"}
      </button>
    </div>
  );
}

// ─── Animated Tab Content Wrapper ────────────────────────────────────────────
// Fix: accept both tab contents as separate props so both are always in React tree.
// Only the currently-visible tab is shown; the other is hidden via display:none.
// This prevents content flash caused by parent conditional rendering during animation.
function AnimatedTabContent({ activeTab, featuresContent, compareContent }: {
  activeTab: "features" | "compare";
  featuresContent: React.ReactNode;
  compareContent: React.ReactNode;
}) {
  const [visibleTab, setVisibleTab] = useState<"features" | "compare">(activeTab);
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const [direction, setDirection] = useState<1 | -1>(1);
  const prevTabRef = useRef(activeTab);

  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (activeTab === prevTabRef.current) return;
    const dir = activeTab === "compare" ? 1 : -1;
    setDirection(dir);
    setPhase("exit");
    const t1 = setTimeout(() => {
      setVisibleTab(activeTab);
      prevTabRef.current = activeTab;
      setPhase("enter");
      // Use double-rAF to ensure "enter" state is painted before transitioning to "idle"
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setPhase("idle");
        });
      });
    }, 200);
    return () => {
      clearTimeout(t1);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeTab]);

  const getStyle = (): React.CSSProperties => {
    if (phase === "exit") return { opacity: 0, transform: `translateX(${direction * -28}px)`, transition: "opacity 0.2s ease, transform 0.2s ease", pointerEvents: "none" };
    if (phase === "enter") return { opacity: 0, transform: `translateX(${direction * 28}px)`, transition: "none", pointerEvents: "none" };
    return { opacity: 1, transform: "translateX(0)", transition: "opacity 0.26s ease, transform 0.26s cubic-bezier(0.34,1.56,0.64,1)" };
  };

  return (
    <div style={{ overflow: "hidden" }}>
      <div style={getStyle()}>
        {/* Always render both tabs but hide the inactive one to keep state alive */}
        <div style={{ display: visibleTab === "features" ? undefined : "none" }}>{featuresContent}</div>
        <div style={{ display: visibleTab === "compare" ? undefined : "none" }}>{compareContent}</div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ExchangeGuideIndex() {
  useScrollMemory();
  const { language } = useLanguage();
  const zh = language === "zh";
  const [activeTab, setActiveTab] = useState<"features" | "compare">("features");
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [floatMenuOpen, setFloatMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { data: categories = [], isLoading } = trpc.exchangeGuide.categories.useQuery();
  const selectedCat = categories.find(c => c.slug === activeCategory) ?? categories[0];

  return (
    <div className="min-h-screen bg-[#0A192F] text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#0A192F]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Left: Back */}
          <Link href="/portal" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium no-underline">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{zh ? "返回主页" : "Back"}</span>
          </Link>

          {/* Center: Title */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="font-black text-sm sm:text-base text-white">
              {zh ? "交易所扫盲指南" : "Exchange Guide"}
            </span>
          </div>

          {/* Right: Slider Tab Switcher */}
          <SliderTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} zh={zh} />
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatedTabContent
          activeTab={activeTab}
          featuresContent={
            <FeaturesTab
              categories={categories}
              isLoading={isLoading}
              zh={zh}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          }
          compareContent={
            <CompareTab
              zh={zh}
              selectedExchange={selectedExchange}
              setSelectedExchange={setSelectedExchange}
              onNavigateToFeature={(slug) => {
                setActiveCategory(slug);
                setActiveTab("features");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          }
        />

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-8 text-center">
          <h3 className="text-2xl font-black text-white mb-3">
            {zh ? "了解完了，准备开始了吗？" : "Ready to get started?"}
          </h3>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto text-sm leading-relaxed">
            {zh
              ? "通过我们的合作伙伴链接注册，享受永久手续费返佣。还有疑问？前往新手问答页面获取解答。"
              : "Register via our partner links for permanent fee rebates. Still have questions? Check our FAQ page."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/crypto-saving" className="bg-blue-500 hover:bg-blue-400 text-white font-black px-7 py-3 rounded-xl transition-all hover:scale-105 text-sm no-underline">
              {zh ? "🎁 查看合作伙伴链接" : "🎁 View Partner Links"}
            </Link>
            <Link href="/beginner" className="border border-white/20 hover:border-blue-500/50 text-white hover:text-blue-300 font-bold px-7 py-3 rounded-xl transition-all text-sm no-underline">
              {zh ? "💬 前往新手问答" : "💬 FAQ Page"}
            </Link>
          </div>
        </div>

        {/* Desktop bottom marquee */}
        {!isLoading && categories.length > 0 && (
          <div className="hidden lg:block mt-10 rounded-2xl border border-white/5 bg-white/2 px-6 py-2">
            <p className="text-center text-xs text-slate-600 mb-1 font-medium uppercase tracking-widest">
              {zh ? "功能分类速览" : "Feature Categories"}
            </p>
            <DesktopMarqueeRow categories={categories} zh={zh} onSelect={(slug) => {
              setActiveCategory(slug);
              setActiveTab("features");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }} />
          </div>
        )}
      </div>

      {/* 右下角回到顶部按钮 */}
      <ScrollToTopButton color="blue" />

      {/* 浮动章节菜单：仅在 features tab 且有内容时显示 */}
      {activeTab === "features" && categories.length > 0 && (
        <FloatChapterMenu
          categories={categories}
          activeSlug={selectedCat?.slug ?? ""}
          zh={zh}
          open={floatMenuOpen}
          onToggle={() => setFloatMenuOpen(o => !o)}
          onSelect={(slug: string) => {
            setActiveCategory(slug);
            setFloatMenuOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}

// ─── Desktop Marquee Row ──────────────────────────────────────────────────────

function DesktopMarqueeRow({ categories, zh, onSelect }: {
  categories: MarqueeCat[];
  zh: boolean;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 py-1">
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onSelect(cat.slug)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors group"
        >
          <span className="text-base leading-none group-hover:scale-110 transition-transform">{cat.icon}</span>
          <span className="text-xs font-medium">{zh ? cat.nameZh : cat.nameEn}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Features Tab ─────────────────────────────────────────────────────────────

function FeaturesTab({ categories, isLoading, zh, activeCategory, setActiveCategory }: {
  categories: Array<{ id: number; slug: string; nameZh: string; nameEn: string; icon: string; descZh: string; descEn: string; difficulty: string; sortOrder: number }>;
  isLoading: boolean;
  zh: boolean;
  activeCategory: string | null;
  setActiveCategory: (slug: string) => void;
}) {
  // 切换分类时滚动到顶部
  const prevCategoryRef = useRef<string | null>(null);
  useEffect(() => {
    if (activeCategory && activeCategory !== prevCategoryRef.current) {
      prevCategoryRef.current = activeCategory;
      // 延迟确保 DOM 已更新
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    }
  }, [activeCategory]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selected = categories.find(c => c.slug === activeCategory) ?? categories[0];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Mobile: Marquee replaces sidebar */}
      <div className="lg:hidden rounded-xl border border-white/8 bg-white/3 px-4">
        <CategoryMarquee
          categories={categories}
          zh={zh}
          onSelect={(slug) => setActiveCategory(slug)}
        />
      </div>

      {/* Desktop: Left Sidebar Menu */}
      <aside className="hidden lg:block lg:w-64 shrink-0">
        <div className="lg:sticky lg:top-20">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
            {zh ? "功能分类" : "Categories"}
          </p>
          <nav className="flex flex-col gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all w-full ${
                  (activeCategory ?? categories[0]?.slug) === cat.slug
                    ? "bg-blue-500/20 border border-blue-500/40 text-blue-300"
                    : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <span className="text-lg shrink-0">{cat.icon}</span>
                <span className="text-sm font-semibold truncate">
                  {zh ? cat.nameZh : cat.nameEn}
                </span>
                <ChevronRight className={`w-3 h-3 ml-auto shrink-0 transition-transform ${(activeCategory ?? categories[0]?.slug) === cat.slug ? "rotate-90 text-blue-400" : ""}`} />
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Right Content */}
      <main className="flex-1 min-w-0">
        {selected && (() => {
          const idx = categories.findIndex(c => c.slug === selected.slug);
          const prev = idx > 0 ? categories[idx - 1] : undefined;
          const next = idx < categories.length - 1 ? categories[idx + 1] : undefined;
          return (
            <FeatureDetail
              category={selected}
              zh={zh}
              prevCategory={prev}
              nextCategory={next}
              onNavigate={(slug) => {
                setActiveCategory(slug);
              }}
              currentIndex={idx + 1}
              totalCount={categories.length}
            />
          );
        })()}
      </main>
    </div>
  );
}

// ─── Feature Detail ────────────────────────────────────────────────────────────

type CategoryItem = { id: number; slug: string; nameZh: string; nameEn: string; icon: string; descZh: string; descEn: string; difficulty: string; sortOrder: number };

function FeatureDetail({ category, zh, prevCategory, nextCategory, onNavigate, currentIndex, totalCount }: {
  category: CategoryItem;
  zh: boolean;
  prevCategory?: CategoryItem;
  nextCategory?: CategoryItem;
  onNavigate?: (slug: string) => void;
  currentIndex: number;
  totalCount: number;
}) {
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Reset quiz when category changes
  useEffect(() => {
    setQuizAnswer(null);
    setQuizSubmitted(false);
  }, [category.slug]);

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

      {/* Deep Content Sections */}
      <div className="space-y-6 mb-10">
        {FEATURE_CONTENT.sections.map((section, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/3 p-6">
            <h2 className="text-lg font-black text-blue-300 mb-3">{section.title}</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">{section.body}</p>
            {section.tips && (
              <ul className="space-y-2">
                {section.tips.map((tip, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-blue-400 mt-0.5 shrink-0">▸</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

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
                    : "border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 text-slate-300 hover:text-white"
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
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 mb-6">
        <h3 className="text-sm font-black text-blue-400 mb-3">
          💡 {zh ? "新手必知" : "Pro Tips"}
        </h3>
        <ul className="space-y-2">
          {FEATURE_CONTENT.proTips.map((tip, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
              <span className="text-blue-400 shrink-0 mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Simulation Game Entry */}
      {(() => {
        const SIM_MAP: Record<string, { path: string; labelZh: string; labelEn: string; descZh: string; descEn: string; color: string; borderColor: string; bgColor: string }> = {
          spot:    { path: "/sim/spot",    labelZh: "现货交易模拟器",     labelEn: "Spot Trading Sim",    descZh: "实时K线 · 买卖操作 · 盈亏统计",     descEn: "Live chart · Buy/Sell · P&L tracking",  color: "text-green-400",  borderColor: "border-green-500/40",  bgColor: "bg-green-500/10" },
          futures: { path: "/sim/futures", labelZh: "合约交易模拟器",     labelEn: "Futures Trading Sim", descZh: "多空方向 · 杠杆选择 · 爆仓体验",     descEn: "Long/Short · Leverage · Liquidation",  color: "text-red-400",    borderColor: "border-red-500/40",    bgColor: "bg-red-500/10" },
          tradfi:  { path: "/sim/tradfi",  labelZh: "传统金融对比模拟器", labelEn: "TradFi vs Crypto",   descZh: "股票/债券/加密 · 对比体验",         descEn: "Stocks/Bonds/Crypto · Side-by-side",  color: "text-blue-400",   borderColor: "border-blue-500/40",   bgColor: "bg-blue-500/10" },
          margin:  { path: "/sim/margin",  labelZh: "杠杆交易模拟器",     labelEn: "Margin Trading Sim",  descZh: "借贷利息 · 追保通知 · 强平体验",     descEn: "Borrow interest · Margin call · Liq", color: "text-orange-400", borderColor: "border-orange-500/40", bgColor: "bg-orange-500/10" },
          options: { path: "/sim/options", labelZh: "期权交易模拟器",     labelEn: "Options Trading Sim", descZh: "行权价 · 到期日 · Greeks展示",       descEn: "Strike · Expiry · Greeks display",    color: "text-purple-400", borderColor: "border-purple-500/40", bgColor: "bg-purple-500/10" },
          bot:     { path: "/sim/bot",     labelZh: "交易机器人模拟器",   labelEn: "Trading Bot Sim",    descZh: "网格/DCA/均线/RSI · 自动执行",         descEn: "Grid/DCA/MA/RSI · Auto-execute",      color: "text-cyan-400",   borderColor: "border-cyan-500/40",   bgColor: "bg-cyan-500/10" },
        };
        const sim = SIM_MAP[category.slug];
        if (!sim) return null;
        return (
          <div className={`rounded-2xl border ${sim.borderColor} ${sim.bgColor} p-6`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Gamepad2 className={`w-5 h-5 ${sim.color}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider ${sim.color}`}>
                    {zh ? "模拟游戏" : "Simulation"}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mb-1">
                  {zh ? `亲身体验 ${category.nameZh}` : `Try ${category.nameEn}`}
                </h3>
                <p className={`text-sm mb-1 ${sim.color}`}>{zh ? sim.labelZh : sim.labelEn}</p>
                <p className="text-slate-400 text-xs">{zh ? sim.descZh : sim.descEn}</p>
                <p className="text-slate-500 text-xs mt-1">{zh ? "无需真实资金 · 模拟真实市场 · 即时反馈" : "No real money · Real market sim · Instant feedback"}</p>
              </div>
              <Link
                href={sim.path}
                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-sm transition-all hover:scale-105 active:scale-95 border ${sim.borderColor} ${sim.bgColor} ${sim.color} hover:brightness-125 flex items-center justify-center gap-2 whitespace-nowrap no-underline`}
              >
                <Gamepad2 className="w-4 h-4" />
                {zh ? "进入模拟游戏 →" : "Play Simulation →"}
              </Link>
            </div>
          </div>
        );
      })()}

      {/* 进度条 + 上一篇 / 下一篇导航 */}
      <div className="mt-8">
        {/* 第 X / N 篇进度指示器 */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {zh ? `第 ${currentIndex} / ${totalCount} 篇` : `${currentIndex} / ${totalCount}`}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalCount }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i + 1 === currentIndex
                    ? 'w-4 h-1.5 bg-blue-400'
                    : i + 1 < currentIndex
                    ? 'w-1.5 h-1.5 bg-blue-600/60'
                    : 'w-1.5 h-1.5 bg-white/15'
                }`}
              />
            ))}
          </div>
        </div>
        {/* 进度条 */}
        <div className="w-full h-0.5 bg-white/8 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${(currentIndex / totalCount) * 100}%` }}
          />
        </div>

        {(prevCategory || nextCategory) && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              {prevCategory ? (
                <button
                  onClick={() => { onNavigate?.(prevCategory.slug); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="w-full group flex flex-col items-start gap-1 px-4 py-3 rounded-xl border border-white/10 bg-white/3 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left"
                >
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                    {zh ? "上一篇" : "Previous"}
                  </span>
                  <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                    <span className="text-base">{prevCategory.icon}</span>
                    {zh ? prevCategory.nameZh : prevCategory.nameEn}
                  </span>
                </button>
              ) : <div />}
            </div>
            <div>
              {nextCategory ? (
                <button
                  onClick={() => { onNavigate?.(nextCategory.slug); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="w-full group flex flex-col items-end gap-1 px-4 py-3 rounded-xl border border-white/10 bg-white/3 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-right"
                >
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1 justify-end">
                    {zh ? "下一篇" : "Next"}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </span>
                  <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5 justify-end">
                    {zh ? nextCategory.nameZh : nextCategory.nameEn}
                    <span className="text-base">{nextCategory.icon}</span>
                  </span>
                </button>
              ) : <div />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Compare Tab ──────────────────────────────────────────────────────────────

function CompareTab({ zh, selectedExchange, setSelectedExchange, onNavigateToFeature }: {
  zh: boolean;
  selectedExchange: string | null;
  setSelectedExchange: (s: string | null) => void;
  onNavigateToFeature: (slug: string) => void;
}) {
  const { data: categories = [] } = trpc.exchangeGuide.categories.useQuery();
  const { data: allSupport = [], isLoading } = trpc.exchangeGuide.allFeatureSupport.useQuery();

  // Build a lookup: exchangeSlug → featureSlug → support record
  type SupportRecord = { id: number; exchangeSlug: string; featureSlug: string; supported: number; highlight: number; levelZh: string; levelEn: string };
  const supportMap = new Map<string, Map<string, SupportRecord>>();
  for (const s of allSupport as SupportRecord[]) {
    if (!supportMap.has(s.exchangeSlug)) supportMap.set(s.exchangeSlug, new Map());
    supportMap.get(s.exchangeSlug)!.set(s.featureSlug, s);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white mb-2">
          {zh ? "五大交易所功能全览" : "Exchange Feature Overview"}
        </h2>
        <p className="text-slate-400 text-sm">
          {zh ? "点击功能格子，可跳转到功能介绍页面查看详细说明。" : "Click any feature cell to view detailed explanation in the Features tab."}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-slate-400 font-bold min-w-[120px]">
                  {zh ? "功能" : "Feature"}
                </th>
                {EXCHANGE_LIST.map((ex) => (
                  <th key={ex.slug} className="text-center px-3 py-3 font-bold min-w-[80px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${ex.dot}`} />
                      <span className="text-white text-xs">{ex.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, rowIdx) => (
                <tr
                  key={cat.slug}
                  className={`border-b border-white/5 ${rowIdx % 2 === 0 ? "bg-white/1" : "bg-transparent"}`}
                >
                  {/* Feature name cell */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onNavigateToFeature(cat.slug)}
                      className="flex items-center gap-2 text-left group hover:text-blue-300 transition-colors"
                    >
                      <span className="text-base leading-none">{cat.icon}</span>
                      <span className="text-slate-300 font-semibold text-xs group-hover:text-blue-300 transition-colors">
                        {zh ? cat.nameZh : cat.nameEn}
                      </span>
                    </button>
                  </td>
                  {/* Exchange support cells */}
                  {EXCHANGE_LIST.map((ex) => {
                    const record = supportMap.get(ex.slug)?.get(cat.slug);
                    const supported = record?.supported === 1;
                    const highlight = record?.highlight === 1;
                    return (
                      <td key={ex.slug} className="px-3 py-3 text-center">
                        <button
                          onClick={() => onNavigateToFeature(cat.slug)}
                          title={supported ? (zh ? record?.levelZh : record?.levelEn) ?? "" : (zh ? "暂不支持" : "Not supported")}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-110 active:scale-95 ${
                            supported
                              ? highlight
                                ? "bg-blue-500/25 border border-blue-500/50 text-blue-300 hover:bg-blue-500/40"
                                : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
                              : "bg-white/3 border border-white/8 text-slate-600 hover:bg-white/8"
                          }`}
                        >
                          {supported ? (
                            highlight ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            )
                          ) : (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-500/25 border border-blue-500/50 text-blue-300">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </span>
          {zh ? "亮点功能" : "Highlight"}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          {zh ? "支持" : "Supported"}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-white/3 border border-white/8 text-slate-600">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </span>
          {zh ? "暂不支持" : "Not supported"}
        </div>
        <span className="text-slate-600">·</span>
        <span>{zh ? "点击任意格子查看详细功能介绍" : "Click any cell for feature details"}</span>
      </div>

      {/* Exchange Recommendation */}
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/3 p-6">
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
          <Link href="/beginner" className="border border-blue-500/40 hover:bg-blue-500/10 text-blue-300 font-bold px-6 py-2.5 rounded-xl transition-all text-sm no-underline inline-block">
            {zh ? "💬 还有疑问？前往新手问答 →" : "💬 Still confused? Visit FAQ →"}
          </Link>
        </div>
      </div>

      {/* Jump to Exchange Hub */}
      <div className="mt-8 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-900/30 to-slate-900/60 p-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-2xl">
              🏦
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black text-white mb-1">
                {zh ? "不了解这些交易所？这里有详细说明" : "Not familiar with these exchanges? We've got you covered"}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                {zh
                  ? "前往「交易所中心」，查看每家交易所的深度介绍、功能对比矩阵、适合人群分析，以及 CEX / DEX / 合约所的科普解读。"
                  : "Visit the Exchange Hub for in-depth profiles, feature comparison matrix, user suitability analysis, and a beginner guide to CEX / DEX / derivatives exchanges."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/exchanges" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm flex items-center gap-2 shadow-lg shadow-blue-900/40 no-underline w-fit">
                  <span>🔍</span>
                  <span>{zh ? "查看各交易所详情" : "View Exchange Details"}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Float Chapter Menu ────────────────────────────────────────────────────────

type FloatCat = { id: number; slug: string; nameZh: string; nameEn: string; icon: string; descZh: string; descEn: string; difficulty: string; sortOrder: number };

function FloatChapterMenu({
  categories,
  activeSlug,
  zh,
  open,
  onToggle,
  onSelect,
}: {
  categories: FloatCat[];
  activeSlug: string;
  zh: boolean;
  open: boolean;
  onToggle: () => void;
  onSelect: (slug: string) => void;
}) {
  const active = categories.find(c => c.slug === activeSlug) ?? categories[0];
  const total = categories.length;
  const currentIdx = categories.findIndex(c => c.slug === activeSlug);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          zIndex: 45,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
        }}
      >
        {/* Expanded menu panel */}
        <div
          style={{
            transition: "opacity 0.25s ease, transform 0.25s ease",
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
            pointerEvents: open ? "auto" : "none",
            transformOrigin: "bottom left",
            background: "rgba(10, 20, 40, 0.82)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: "16px",
            padding: "12px",
            width: "220px",
            maxHeight: "60vh",
            overflowY: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div style={{ padding: "4px 8px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "8px" }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(59,130,246,0.8)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
              {zh ? `章节导航 · ${currentIdx + 1} / ${total}` : `Chapters · ${currentIdx + 1} / ${total}`}
            </p>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {categories.map((cat, i) => {
              const isActive = cat.slug === activeSlug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => onSelect(cat.slug)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    border: isActive ? "1px solid rgba(59,130,246,0.4)" : "1px solid transparent",
                    background: isActive ? "rgba(59,130,246,0.12)" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    textAlign: "left",
                    width: "100%",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <span style={{ fontSize: "10px", fontWeight: 700, color: isActive ? "rgba(93,169,255,0.9)" : "rgba(100,116,139,0.8)", minWidth: "16px", textAlign: "right", flexShrink: 0 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: "16px", flexShrink: 0 }}>{cat.icon}</span>
                  <span style={{ fontSize: "12px", fontWeight: isActive ? 700 : 500, color: isActive ? "#93c5fd" : "rgba(148,163,184,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {zh ? cat.nameZh : cat.nameEn}
                  </span>
                  {isActive && (
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 6px 2px rgba(59,130,246,0.6)", flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Trigger button */}
        <button
          onClick={onToggle}
          aria-label={zh ? "打开章节菜单" : "Open chapter menu"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px 8px 10px",
            borderRadius: "40px",
            border: open ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(59,130,246,0.25)",
            background: open ? "rgba(59,130,246,0.15)" : "rgba(10,20,40,0.75)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: open
              ? "0 0 0 3px rgba(59,130,246,0.15), 0 4px 16px rgba(0,0,0,0.4)"
              : "0 0 0 1px rgba(59,130,246,0.08), 0 4px 16px rgba(0,0,0,0.4)",
            maxWidth: "200px",
          }}
        >
          <span style={{ fontSize: "20px", lineHeight: 1, flexShrink: 0 }}>{active?.icon}</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", overflow: "hidden" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#93c5fd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "120px" }}>
              {active ? (zh ? active.nameZh : active.nameEn) : ""}
            </span>
            <span style={{ fontSize: "10px", color: "rgba(148,163,184,0.7)", whiteSpace: "nowrap" }}>
              {zh ? "点此切换章节" : "Tap to switch"}
            </span>
          </div>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(59,130,246,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0, transition: "transform 0.2s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      </div>
    </>
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
      zh: "跟单交易行业标杆，拥有超过 10 万名专业交易员，交易机器人功能丰富，近年快速崛起。",
      en: "Industry benchmark for copy trading with 100,000+ professional traders, rich bot features, and rapid growth.",
    },
  };
  return data[slug]?.[zh ? "zh" : "en"] ?? "";
}

function EXCHANGE_RECOMMENDATIONS(zh: boolean) {
  return [
    {
      emoji: "🌱",
      title: zh ? "新手首选" : "Best for Beginners",
      desc: zh ? "界面友好，教程丰富，安全性高，支持中文客服。" : "Friendly UI, rich tutorials, high security, Chinese support.",
      tags: ["Binance", "OKX"],
    },
    {
      emoji: "📈",
      title: zh ? "合约交易" : "Futures Trading",
      desc: zh ? "流动性最深，滑点最低，专业交易工具齐全。" : "Deepest liquidity, lowest slippage, professional tools.",
      tags: ["Binance", "Bybit", "OKX"],
    },
    {
      emoji: "👥",
      title: zh ? "跟单交易" : "Copy Trading",
      desc: zh ? "交易员数量最多，数据最透明，跟单体验最佳。" : "Most traders, most transparent data, best copy experience.",
      tags: ["Bitget", "Bybit"],
    },
    {
      emoji: "🔍",
      title: zh ? "寻找新币" : "Finding New Coins",
      desc: zh ? "上新速度最快，支持 1700+ 币种，小市值项目最多。" : "Fastest listings, 1700+ coins, most small-cap projects.",
      tags: ["Gate.io"],
    },
    {
      emoji: "🌐",
      title: zh ? "Web3 & DeFi" : "Web3 & DeFi",
      desc: zh ? "内置 Web3 钱包最强，支持 100+ 公链，DEX 聚合器。" : "Best built-in Web3 wallet, 100+ chains, DEX aggregator.",
      tags: ["OKX"],
    },
    {
      emoji: "🏛️",
      title: zh ? "TradFi 资产" : "TradFi Assets",
      desc: zh ? "股票代币化、黄金、外汇，传统金融资产覆盖最广。" : "Tokenized stocks, gold, forex — broadest TradFi coverage.",
      tags: ["Gate.io", "Bybit"],
    },
  ];
}

// ─── Feature Content ──────────────────────────────────────────────────────────

type FeatureContent = {
  sections: { title: string; body: string; tips?: string[] }[];
  quiz?: {
    question: string;
    options: { value: string; label: string }[];
    correct: string;
    explanation: string;
  };
  proTips: string[];
};

function getFeatureContent(slug: string, zh: boolean): FeatureContent {
  const content: Record<string, FeatureContent> = {
    spot: {
      sections: [
        {
          title: zh ? "什么是现货交易？" : "What is Spot Trading?",
          body: zh
            ? "现货交易是最基础的加密货币交易方式：你用一种资产直接买入另一种资产，交易即时完成，资产立刻归你所有。举例：你用 1000 USDT 在 BTC 价格为 60,000 USDT 时买入 0.0167 BTC；三个月后 BTC 涨到 90,000 USDT，你卖出获得 1500 USDT，净赚 500 USDT（+50%）。现货交易没有杠杆，最大亏损仅限于本金，不存在「爆仓」风险。主流交易对包括 BTC/USDT、ETH/USDT、BNB/USDT 等，流动性极佳。现货交易支持三种订单类型：① 市价单（立即以当前最优价格成交）；② 限价单（设定目标价格等待成交，手续费更低）；③ 止损单（价格触及设定值时自动卖出，保护利润或限制亏损）。"
            : "Spot trading is the most basic form of crypto trading: you directly exchange one asset for another, with immediate settlement. For example, buy BTC with 100 USDT and sell when the price rises. No leverage means you can only lose your principal — perfect for beginners.",
          tips: zh
            ? ["挂单（Limit Order）：设定价格，等待成交，手续费更低", "市价单（Market Order）：立即以当前价格成交，适合急需交易时", "止损单（Stop Loss）：设定触发价，自动卖出防止亏损扩大"]
            : ["Limit Order: set your price, wait for fill, lower fees", "Market Order: fill immediately at current price", "Stop Loss: auto-sell at trigger price to limit losses"],
        },
        {
          title: zh ? "手续费对比" : "Fee Comparison",
          body: zh
            ? "各交易所现货手续费通常在 0.1% 左右，但差异显著。以 1 万 USDT 的交易量为例：Binance 标准费率 0.1%，持有 BNB 可降至 0.075%，通过合作伙伴链接注册再享 20% 折扣，最终费率约 0.06%，每笔节省 4 USDT；Bitget 的 Maker 费率仅 0.02%，是主流交易所中最低的；OKX 和 Bybit 的 VIP 用户费率可低至 0.01%。对于月交易量超过 100 万 USDT 的活跃用户，选择低费率交易所每年可节省数万元。建议：注册时务必通过返佣链接，这是最简单的省钱方式。"
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
            ? "合约交易（永续合约）允许你用「保证金」控制更大的仓位，通过杠杆放大收益（同时也放大风险）。永续合约没有到期日，可以做多（看涨）也可以做空（看跌）。具体示例：假设 BTC 当前价格 60,000 USDT，你用 1000 USDT 开 10 倍杠杆做多，相当于控制价值 10,000 USDT 的 BTC（约 0.167 BTC）。① 若 BTC 涨到 66,000 USDT（+10%），你的盈利 = 10,000 × 10% = 1,000 USDT，相当于本金翻倍（+100%）；② 若 BTC 跌到 54,000 USDT（-10%），你的亏损 = 1,000 USDT，本金归零，触发强平。做空同理：若你看跌，开空仓后价格下跌即可盈利。合约交易的核心风险在于杠杆的双刃剑效应，建议新手从 2-3 倍杠杆开始，严格设置止损。"
            : "Futures (perpetual contracts) let you control a larger position with margin through leverage. No expiry date, supports both long (bullish) and short (bearish). Example: 100 USDT at 10x leverage controls a 1000 USDT position — 10% price gain = 100% profit, but 10% drop = 100% loss (liquidation).",
          tips: zh
            ? ["永续合约有资金费率，持仓超过 8 小时需支付/收取费用", "强平价格 = 开仓价格 ± (保证金 / 仓位大小)", "建议新手使用 2-3 倍杠杆，切勿满仓操作"]
            : ["Perpetual contracts have funding rates every 8 hours", "Liquidation price = entry ± (margin / position size)", "Beginners should use 2-3x leverage, never go all-in"],
        },
        {
          title: zh ? "资金费率机制" : "Funding Rate Mechanism",
          body: zh
            ? "资金费率是永续合约特有的机制，每 8 小时结算一次（即每天 3 次：00:00、08:00、16:00 UTC）。当市场整体看多时，多头向空头支付费率；当市场看空时，空头向多头支付。典型费率在 0.01% 左右，但极端行情下可达 0.1% 甚至更高。实例：2021 年牛市高峰期，BTC 资金费率一度高达 0.3%/8h，持有 10 万 USDT 多仓每天需支付约 900 USDT 的资金费，年化成本超过 300%。这一机制有两个用途：① 使永续合约价格与现货价格保持锚定；② 产生套利机会——当资金费率极高时，可以做空合约同时做多现货，无风险收取资金费（即「资金费率套利」）。"
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
          title: zh ? "什么是杠杆交易？" : "What is Margin Trading?",
          body: zh
            ? "杠杆交易是在现货市场借入资金进行交易，你实际持有的是真实的加密货币资产（而非合约）。核心原理：你提供一部分本金作为保证金，向交易所借入额外资金，从而控制更大的仓位。\n\n📌 具体示例：你有 1000 USDT，在 ETH 价格 2000 USDT 时开 5 倍杠杆做多，借入 4000 USDT，共买入价值 5000 USDT 的 ETH（2.5 个 ETH）。\n① 若 ETH 涨到 2400 USDT（+20%），你的 2.5 ETH 价值 6000 USDT，还清借款 4000 USDT 后，净赚 1000 USDT（相当于本金翻倍，+100%）；\n② 若 ETH 跌到 1600 USDT（-20%），你的 2.5 ETH 价值 4000 USDT，还清借款后本金归零，触发强平。\n\n杠杆交易与合约交易的核心区别：杠杆交易持有真实资产，没有资金费率，但有借贷利息；合约交易持有的是衍生品合约，有资金费率，没有借贷利息，且最高杠杆可达 100-200 倍（远高于杠杆交易的 3-10 倍）。"
            : "Margin trading borrows funds to trade in the spot market — you actually hold real crypto assets. Core principle: you provide a portion of your own capital as collateral and borrow additional funds from the exchange to control a larger position.\n\n📌 Example: You have 1000 USDT. At ETH price 2000 USDT, you open a 5x long position, borrowing 4000 USDT to buy 2.5 ETH worth 5000 USDT.\n① If ETH rises to 2400 (+20%), your 2.5 ETH is worth 6000 USDT. After repaying 4000 USDT, you profit 1000 USDT (+100% on your principal).\n② If ETH drops to 1600 (-20%), your 2.5 ETH is worth 4000 USDT. After repaying the loan, your principal is gone — liquidation triggered.\n\nKey difference from futures: margin holds real assets with no funding rate but has borrowing interest; futures hold derivative contracts with funding rates but no interest, and support much higher leverage (100-200x vs 3-10x for margin).",
          tips: zh
            ? ["借贷利率按小时计算，OKX 和 Binance 的利率最具竞争力", "杠杆倍数越高，强平价格越接近开仓价，风险越大", "建议新手从 2-3 倍杠杆开始，切勿直接使用最高倍数"]
            : ["Borrowing interest is calculated hourly — OKX and Binance offer the most competitive rates", "Higher leverage = liquidation price closer to entry, more risk", "Beginners should start with 2-3x leverage, never jump to maximum"],
        },
        {
          title: zh ? "全仓 vs 逐仓模式" : "Cross Margin vs Isolated Margin",
          body: zh
            ? "杠杆交易有两种保证金模式，选择正确的模式对风险管理至关重要：\n\n🔵 全仓模式（Cross Margin）：账户中所有可用资产都作为保证金，当某个仓位亏损时，系统会自动从其他资产中补充保证金，延迟强平。优点：不容易爆仓；缺点：一旦爆仓，损失的是整个账户资金。\n\n🟠 逐仓模式（Isolated Margin）：每个仓位单独分配保证金，亏损只影响该仓位，不会波及账户其他资金。优点：风险可控，最多亏损该仓位的保证金；缺点：更容易触发强平，需要手动补充保证金。\n\n建议：新手使用逐仓模式，明确每笔交易的最大亏损上限；有经验的交易者可根据策略选择全仓模式。"
            : "There are two margin modes, and choosing the right one is crucial for risk management:\n\n🔵 Cross Margin: All available assets in your account serve as collateral. When a position loses money, the system automatically draws from other assets to prevent liquidation. Pro: harder to get liquidated; Con: if liquidated, you lose the entire account balance.\n\n🟠 Isolated Margin: Each position has its own dedicated margin. Losses only affect that position's allocated funds. Pro: risk is capped at the position's margin; Con: easier to trigger liquidation, requires manual top-ups.\n\nRecommendation: Beginners should use isolated margin to cap maximum loss per trade; experienced traders can choose cross margin based on strategy.",
          tips: zh
            ? ["逐仓模式：最大亏损 = 该仓位的保证金", "全仓模式：最大亏损 = 整个账户余额", "可以随时在两种模式间切换（平仓后生效）"]
            : ["Isolated margin: max loss = that position's allocated margin", "Cross margin: max loss = entire account balance", "You can switch between modes anytime (takes effect after closing position)"],
        },
        {
          title: zh ? "借贷利息与强平机制" : "Borrowing Interest & Liquidation",
          body: zh
            ? "借贷利息是杠杆交易的主要成本，按小时计算，即使不交易也会持续产生。以 OKX 为例，BTC 借贷年化利率约 5-15%（视市场供需波动），折算为小时利率约 0.0006%-0.0017%。\n\n💡 利息成本计算示例：借入 10,000 USDT，年化利率 10%，持仓 30 天的利息成本 = 10,000 × 10% ÷ 365 × 30 ≈ 82 USDT。这意味着你的 ETH 需要至少涨 0.82% 才能覆盖利息成本。\n\n强平机制：当你的保证金率低于维持保证金率（通常为 5-10%）时，系统触发强平，强制卖出你的资产以偿还借款。强平价格计算：以 3 倍杠杆做多为例，强平价格 ≈ 开仓价格 × (1 - 1/杠杆倍数 × 0.9) = 开仓价格 × 0.7。即价格下跌约 30% 时触发强平。"
            : "Borrowing interest is the main cost of margin trading, calculated hourly and accruing even when you're not actively trading. For example, at OKX, BTC borrowing APR is approximately 5-15% (fluctuates with market supply/demand), translating to an hourly rate of ~0.0006%-0.0017%.\n\n💡 Interest cost example: Borrow 10,000 USDT at 10% APR for 30 days: 10,000 × 10% ÷ 365 × 30 ≈ 82 USDT. This means your ETH needs to rise at least 0.82% just to cover interest costs.\n\nLiquidation: When your margin ratio falls below the maintenance margin (typically 5-10%), the system triggers forced liquidation, selling your assets to repay the loan. Liquidation price formula: for a 3x long position, liquidation price ≈ entry price × (1 - 1/leverage × 0.9) = entry price × 0.7. In other words, a ~30% price drop triggers liquidation.",
          tips: zh
            ? ["长期持仓（超过 30 天）利息成本不可忽视，需纳入盈亏计算", "设置价格警报，在接近强平价时主动补充保证金或减仓", "市场剧烈波动时，价格可能瞬间穿越强平价，损失超过预期"]
            : ["For long holds (30+ days), interest costs are significant — factor them into P&L calculations", "Set price alerts to add margin or reduce position before approaching liquidation", "During extreme volatility, prices can gap through liquidation levels, causing larger-than-expected losses"],
        },
      ],
      quiz: {
        question: zh ? "使用 5 倍杠杆做多，价格下跌多少会触发强平（约）？" : "With 5x leverage long, approximately how much price drop triggers liquidation?",
        options: [
          { value: "a", label: zh ? "A. 下跌 5%" : "A. 5% drop" },
          { value: "b", label: zh ? "B. 下跌 20%" : "B. 20% drop" },
          { value: "c", label: zh ? "C. 下跌 50%" : "C. 50% drop" },
        ],
        correct: "b",
        explanation: zh ? "5 倍杠杆意味着保证金率约为 20%，价格下跌约 20% 时保证金耗尽，触发强制平仓（实际强平价略高，因为需保留维持保证金）。" : "5x leverage means a ~20% margin ratio. A ~20% price drop exhausts the margin, triggering liquidation (actual liquidation price is slightly higher due to maintenance margin requirements).",
      },
      proTips: zh
        ? ["杠杆交易适合中短期持仓（1-7 天），长期持仓利息成本侵蚀利润", "Binance 和 OKX 的杠杆交易流动性最好，借贷利率最低", "新手建议先用现货熟悉市场，再尝试 2-3 倍杠杆", "每次开仓前计算好强平价格，确保有足够的安全边际", "可以用杠杆交易对冲现货持仓风险（做空对冲）"]
        : ["Margin suits short-to-medium holds (1-7 days); long holds incur high interest", "Binance and OKX have the best margin liquidity and lowest borrowing rates", "Beginners: master spot first, then try 2-3x leverage", "Before each trade, calculate your liquidation price and ensure adequate safety margin", "Margin can be used to hedge spot holdings (short hedge)"],
    },
    copy_trading: {
      sections: [
        {
          title: zh ? "什么是跟单交易？" : "What is Copy Trading?",
          body: zh
            ? "跟单交易允许你自动复制专业交易员的每一笔操作，无需自己分析市场。你设定跟单金额和风险参数，系统按比例自动执行。Bitget 和 Bybit 是跟单交易的行业标杆，分别拥有超过 10 万名和 5 万名专业交易员供用户选择。"
            : "Copy trading lets you automatically replicate every trade of professional traders without market analysis. Set your copy amount and risk parameters, and the system executes proportionally. Bitget and Bybit are industry leaders with 100,000+ and 50,000+ professional traders respectively.",
          tips: zh
            ? ["选择交易员时关注：胜率、最大回撤、交易频率、历史收益", "建议跟单多名交易员分散风险，不要全压一人", "设置止损比例，避免单次跟单亏损过大"]
            : ["When selecting traders, check: win rate, max drawdown, trade frequency, historical returns", "Copy multiple traders to diversify risk \u2014 don't put all eggs in one basket", "Set a stop-loss percentage to limit losses from any single copy trade"],
        },
        {
          title: zh ? "如何选择优质交易员？" : "How to Select Quality Traders?",
          body: zh
            ? "筛选跟单交易员的实用清单：① 运行时长：至少有 3-6 个月的历史数据，新手交易员不可信；② 最大回撤 < 20%：超过 30% 的回撤意味着极高风险；③ 胜率 > 55%：长期稳定盈利的标志；④ 交易频率适中：过高（每天 20+ 笔）可能是刺刀刷单，过低（每周 < 5 笔）样本量不足；⑤ 跟单人数：跟单人数过多可能导致滑点增大。Bitget 提供的「全周期收益」和「最大回撤」筛选功能非常实用。"
            : "Practical checklist for selecting copy traders: \u2460 Track record: at least 3-6 months of history \u2014 new traders are unreliable; \u2461 Max drawdown < 20%: over 30% means extreme risk; \u2462 Win rate > 55%: sign of consistent profitability; \u2463 Moderate trade frequency: too high (20+ trades/day) may indicate scalping, too low (< 5/week) insufficient sample size; \u2464 Follower count: too many followers can increase slippage. Bitget's 'Full-cycle returns' and 'Max drawdown' filter tools are very practical.",
          tips: zh
            ? ["优先选择在牛熊两市都有盈利记录的交易员", "跟单金额不要超过可投资资金的 20%，分散风险", "定期检查跟单交易员的最新表现，及时停止表现变差的交易员"]
            : ["Prioritize traders with profitable records in both bull and bear markets", "Don't allocate more than 20% of investable capital to copy trading \u2014 diversify risk", "Regularly review trader performance and stop copying those with deteriorating results"],
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
    tradfi: {
      sections: [
        {
          title: zh ? "什么是 TradFi（传统金融）产品？" : "What is TradFi on Exchanges?",
          body: zh
            ? "TradFi（Traditional Finance）是指加密交易所提供的传统金融资产交易，包括股票代币化（如苹果、特斯拉的代币化股票）、黄金、白銀、原油等大宗商品，以及外汇（Forex）交易。Gate.io 和 Bybit 在这一领域布局最为积极，让用户无需开设证券账户即可交易全球资产。"
            : "TradFi on crypto exchanges refers to tokenized traditional financial assets: stocks (Apple, Tesla tokens), commodities (gold, silver, oil), and forex. Gate.io and Bybit lead in this area, letting users trade global assets without a brokerage account.",
          tips: zh
            ? ["代币化股票与真实股票价格挂钙，但不享有股东权利", "交易时间不受传统市场限制，可 7×24 小时交易", "Gate.io 支持 NYSE/NASDAQ 上市公司股票代币化交易"]
            : ["Tokenized stocks track real prices but carry no shareholder rights", "Trade 24/7 without traditional market hour restrictions", "Gate.io supports tokenized NYSE/NASDAQ listed stocks"],
        },
        {
          title: zh ? "实际使用场景与产品对比" : "Real Use Cases & Product Comparison",
          body: zh
            ? "场景一：中国用户想买美股但无法开证券账户，可在 Gate.io 买入 AAPL、TSLA 代币化股票，实时跟踪美股价格。场景二：市场不确定时期配置黄金，可在 Bybit 或 Gate.io 买入 XAU/USDT（黄金对 USDT）合约。场景三：外汇交易者可在交易所内直接操作 EUR/USD、USD/JPY 等主流货币对。主要平台对比： Gate.io 股票+大宗商品+外汇全覆盖； Bybit 大宗商品和外汇为主； Binance 目前 TradFi 产品较少。"
            : "Scenario 1: A user in China wants US stocks but can't open a brokerage account — buy AAPL or TSLA tokenized stocks on Gate.io, tracking real-time US stock prices. Scenario 2: During market uncertainty, allocate to gold via XAU/USDT contracts on Bybit or Gate.io. Scenario 3: Forex traders can directly trade EUR/USD, USD/JPY pairs on exchanges. Platform comparison: Gate.io covers stocks + commodities + forex; Bybit focuses on commodities and forex; Binance has limited TradFi products currently.",
          tips: zh
            ? ["代币化股票流动性较低，大额交易注意滑点", "黄金合约常用于对冲加密市场风险", "外汇交易受全球宏观消息影响较大，需关注美联储政策"]
            : ["Tokenized stocks have lower liquidity — watch for slippage on large trades", "Gold contracts are commonly used to hedge crypto market risk", "Forex trading is heavily influenced by global macro news — watch Fed policy"],
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
    p2p: {
      sections: [
        {
          title: zh ? "什么是 P2P 法币交易？" : "What is P2P Fiat Trading?",
          body: zh
            ? "P2P（Peer-to-Peer）法币交易是指用户之间直接进行法币与加密货币的兑换，交易所充当担保方。支持支付宝、微信、银行转账等多种支付方式，是国内用户购买 USDT 的主要渠道。Binance P2P 和 OKX P2P 是最主流的平台。"
            : "P2P (Peer-to-Peer) fiat trading is direct exchange between users, with the exchange acting as escrow. Supports Alipay, WeChat, bank transfer, and more. It's the primary way for Chinese users to buy USDT. Binance P2P and OKX P2P are the most popular platforms.",
          tips: zh
            ? ["选择有担保的 P2P 商家，避免诈骗", "交易时不要在聊天中透露个人信息", "遇到异常情况立即申诉，不要轻易放行"]
            : ["Choose escrow-protected P2P merchants to avoid scams", "Never share personal information in P2P chat", "File a dispute immediately if anything seems wrong"],
        },
        {
          title: zh ? "P2P 安全交易指南" : "P2P Safe Trading Guide",
          body: zh
            ? "P2P 交易中的常见诈骗手法及防范：① 假截图诈骗：骗子发送伪造的付款截图，声称已付款但实际未转账，务必等待银行到账通知再放行；② 退款诈骗：骗子用信用卡付款后申请退款，导致你的银行账户被冻结；③ 超额付款：骗子故意多付，要求你退回差额，实际是洗钱行为；④ 客服诈骗：假冒交易所客服要求你在聊天中放行，真正的交易所客服不会这样操作。安全原则：只在平台内聊天，收到银行到账短信后再放行，遇到任何异常立即申诉。"
            : "Common P2P scams and how to avoid them: ① Fake payment screenshot: scammer sends forged payment proof — always wait for bank confirmation before releasing; ② Chargeback fraud: scammer pays with credit card then files chargeback, freezing your account; ③ Overpayment scam: scammer overpays and asks for refund — this is money laundering; ④ Fake customer service: impersonates exchange support asking you to release in chat — real support never does this. Safety rule: only chat on-platform, wait for bank SMS confirmation before releasing, dispute immediately on any anomaly.",
          tips: zh
            ? ["永远不要在平台外（微信/QQ/Telegram）与对方沟通，所有记录都应在平台内留存", "收到付款后等待 10-15 分钟确认银行到账，不要仅凭截图放行", "选择信誉评分高（95% 以上）、成交量大的商家，降低诈骗风险"]
            : ["Never communicate outside the platform (WeChat/QQ/Telegram) — all records should be on-platform", "Wait 10-15 minutes after payment for bank confirmation — never release based on screenshots alone", "Choose merchants with high reputation scores (95%+) and large trade volumes to reduce scam risk"],
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
        explanation: zh ? "交易所在 P2P 交易中充当担保方，卖方的加密货币被锁定在交易所托管，买方付款确认后才释放，保障双方安全。" : "The exchange acts as an escrow agent — the seller's crypto is locked and only released after the buyer's payment is confirmed.",
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
            ? "打新是指在新项目代币正式上市前，通过交易所的 Launchpad 平台以优惠价格认购。IEO（Initial Exchange Offering）由交易所背书，比 ICO 更安全。参与方式：① 在快照日期前持有一定数量的平台币（BNB/OKB/GT）；② 按持仓量分配认购份额（持有越多，分配越多）；③ 代币上市后通常有 2-10 倍的涨幅。Binance Launchpad 历史案例：2019 年 BitTorrent（BTT）上市首日涨幅超过 500%；2020 年 Band Protocol（BAND）上市后最高涨幅超过 2000%；2021 年 Axie Infinity（AXS）从打新价到最高点涨幅超过 100 倍。参与打新的核心逻辑：以低于市场价的价格买入，上市后即可获利。但需注意：① 并非所有项目都会上涨；② 认购份额通常很小；③ 需要提前持有平台币，本身存在价格波动风险。"
            : "Launchpad/IEO lets users subscribe to new project tokens at preferential prices before public listing, backed by the exchange. Participation: ① Stake platform tokens (BNB/OKB/GT) for eligibility; ② Allocation based on holdings; ③ Tokens often surge after listing. Binance Launchpad has historically delivered the best returns.",
          tips: zh
            ? ["BNB 持有量越多，Binance Launchpad 认购份额越大", "打新有锁仓期，代币上市后才能卖出", "并非所有打新项目都会上涨，需要研究项目基本面"]
            : ["More BNB holdings = larger Binance Launchpad allocation", "Launchpad tokens have lock-up periods before you can sell", "Not all IEO projects pump \u2014 research project fundamentals"],
        },
        {
          title: zh ? "历史经典案例与收益分析" : "Historical Cases & Return Analysis",
          body: zh
            ? "典型打新案例：① Axie Infinity (AXS)：Binance Launchpad 2020 年上市，认购价 $0.1，上市后最高涨至 $165，涨幅超过 1600 倍；② STEPN (GMT)：OKX Jumpstart 2022 年上市，认购价 $0.01，最高涨至 $4.11，涨幅 400 倍；③ Gate.io Startup 多个项目也有上百倍收益。但要注意：这些是历史最佳案例，也有大量项目上市后跌跌不止。建议采用「小仓展开」策略：小额参与多个项目，分散风险。"
            : "Classic launchpad cases: \u2460 Axie Infinity (AXS): Binance Launchpad 2020, subscription price $0.1, peaked at $165 \u2014 1600x return; \u2461 STEPN (GMT): OKX Jumpstart 2022, subscription price $0.01, peaked at $4.11 \u2014 400x return; \u2462 Gate.io Startup has also produced multiple 100x+ projects. However, these are the best historical cases \u2014 many projects also decline sharply after listing. Strategy: use small positions across multiple projects to diversify risk.",
          tips: zh
            ? ["参与多个小额打新项目，分散风险", "上市当天如果涨幅过大，可考虑分批卖出锁仓部分", "关注项目的路线图和社区活跃度，是判断长期价値的重要指标"]
            : ["Participate in multiple small-amount IEOs to diversify risk", "If listing day gains are large, consider selling part of the locked allocation in batches", "Monitor project roadmap and community activity as key indicators of long-term value"],
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
    trading_bot: {
      sections: [
        {
          title: zh ? "交易机器人类型" : "Types of Trading Bots",
          body: zh
            ? "交易机器人是自动执行交易策略的程序，24/7 不间断运行，不受情绪影响。主流策略详解：① 网格机器人（Grid Bot）：在设定的价格区间内自动高卖低买，每次价格波动都能获利。例如设置 BTC 在 58,000-62,000 USDT 区间，每隔 500 USDT 设一个网格，价格每次在网格间波动都会触发买卖，特别适合横盘震荡行情；② DCA 机器人（定投机器人）：每天/每周/每月自动买入固定金额，无论价格高低都执行，平摊成本。例如每周自动买入 100 USDT 的 BTC，长期坚持可有效降低持仓成本；③ 趋势跟踪机器人：根据均线、RSI 等技术指标自动判断趋势，在上涨时买入、下跌时卖出；④ 套利机器人：利用同一资产在不同交易所的价差自动套利，风险极低但需要大量资金。Binance、OKX 和 Bybit 均提供内置机器人功能，无需编程即可使用。"
            : "Major exchanges offer built-in trading bots: ① Grid Bot: auto buy-low-sell-high within a price range, ideal for sideways markets; ② DCA Bot: periodic purchases to average down cost; ③ Arbitrage Bot: profit from price differences across markets; ④ Signal Bot: auto-trade based on technical indicators. Bitget and Gate.io have the richest bot features.",
          tips: zh
            ? ["网格机器人在震荡行情中表现最佳，单边趋势行情中可能亏损", "定投机器人适合长期看好某资产的用户", "机器人需要持续监控，不是完全无人值守的"]
            : ["Grid bots perform best in sideways markets; may lose in strong trends", "DCA bots suit users who are long-term bullish on an asset", "Bots require ongoing monitoring — they're not fully autonomous"],
        },
        {
          title: zh ? "如何选择适合自己的机器人策略？" : "How to Choose the Right Bot Strategy?",
          body: zh
            ? "选择机器人策略需要考虑市场环境和个人风险偏好：① 震荡行情（BTC 在某价格区间反复横跳）→ 选网格机器人，设置合理的上下轨；② 长期看涨某资产 → 选定投机器人（DCA），每天/每周定额买入；③ 想参与套利但不想手动操作 → 选套利机器人；④ 有交易信号来源 → 选信号机器人。建议先用平台提供的「历史回测」功能验证策略，再投入真实资金。"
            : "Choosing a bot strategy depends on market conditions and risk appetite: ① Sideways market (BTC bouncing in a range) → Grid bot with well-set upper/lower bounds; ② Long-term bullish on an asset → DCA bot buying daily/weekly; ③ Want arbitrage without manual work → Arbitrage bot; ④ Have trading signals → Signal bot. Always use the platform's backtesting feature to validate strategies before committing real funds.",
          tips: zh
            ? ["Gate.io 提供免费的机器人历史回测功能，强烈推荐使用", "机器人策略需要根据市场变化定期调整，不是一劳永逸", "从小资金开始测试，验证策略有效后再逐步加仓"]
            : ["Gate.io offers free bot backtesting — highly recommended", "Bot strategies need periodic adjustment as markets change", "Start with small capital to validate strategies before scaling up"],
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
    card: {
      sections: [
        {
          title: zh ? "加密借记卡是什么？" : "What is a Crypto Debit Card?",
          body: zh
            ? "加密借记卡允许你用加密资产在现实世界消费，刷卡时自动将加密货币兑换为法币支付，支持全球 Visa/Mastercard 网络。主流产品对比：① Binance Card（Visa）：支持 BTC、BNB、BUSD 等多种资产，消费返现最高 8%（以 BNB 形式），无年费，支持 Google Pay/Apple Pay；② Bybit Card（Visa）：支持 USDT、BTC、ETH 等，消费返现 2-4%，在欧洲地区使用较广泛；③ Gate Card（Visa）：支持多种加密货币，消费返现 1-5%，申请门槛较低。实际使用场景：你在超市消费 100 元，系统自动从你的 USDT 余额中扣除等值金额，同时返还 2-8 元的加密货币返现。对于长期持有加密资产的用户，这是将加密资产变现日常消费的最便捷方式，同时还能赚取返现收益。"
            : "Crypto debit cards let you spend crypto in the real world via Visa/Mastercard networks at millions of merchants globally. Crypto is automatically converted to local fiat at the point of sale. Binance Card, Bybit Card, and Gate Card are leading options, with some offering up to 8% cashback.",
          tips: zh
            ? ["部分地区不支持加密借记卡，请先确认当地法规", "消费返现通常以平台币形式发放", "需要完成 KYC 认证才能申请"]
            : ["Crypto debit cards may not be available in all regions — check local regulations first", "Cashback is usually paid in platform tokens", "KYC verification is required to apply"],
        },
        {
          title: zh ? "主流加密借记卡对比" : "Major Crypto Debit Card Comparison",
          body: zh
            ? "各交易所借记卡对比：① Binance Card：欧洲用户最友好，支持 60+ 种加密货币消费，最高 8% BNB 返现；② Bybit Card：亚洲地区覆盖较好，支持 Visa 网络，最高 10% 返现；③ Gate Card：支持 Gate.io 账户余额直接消费，返现以 GT 发放。注意：加密借记卡在消费时会产生兑换手续费（通常 0.5-1.5%），需要综合考虑返现是否覆盖手续费成本。"
            : "Crypto debit card comparison: ① Binance Card: most Europe-friendly, supports 60+ cryptos, up to 8% BNB cashback; ② Bybit Card: good Asia coverage, Visa network, up to 10% cashback; ③ Gate Card: spend directly from Gate.io balance, cashback in GT. Note: cards charge conversion fees (usually 0.5-1.5%) — factor this into whether cashback covers the cost.",
          tips: zh
            ? ["计算实际收益 = 返现比例 - 兑换手续费", "在支持免手续费的商户消费可最大化返现收益", "部分卡片对月消费额有最低要求才能获得最高返现"]
            : ["Real return = cashback rate minus conversion fee", "Spend at fee-free merchants to maximize cashback", "Some cards require minimum monthly spend to unlock top cashback tiers"],
        },
      ],
      quiz: {
        question: zh ? "使用加密借记卡消费时，如何完成支付？" : "How does payment work when using a crypto debit card?",
        options: [
          { value: "a", label: zh ? "A. 商家直接接受加密货币" : "A. Merchant directly accepts crypto" },
          { value: "b", label: zh ? "B. 自动将加密货币兑换为法币完成支付" : "B. Crypto is auto-converted to fiat for payment" },
          { value: "c", label: zh ? "C. 需要手动兑换后才能消费" : "C. Manual conversion required before spending" },
        ],
        correct: "b",
        explanation: zh ? "加密借记卡在消费时自动将你的加密货币兑换为当地法币，商家收到的是法币，整个过程对商家透明。" : "The card automatically converts your crypto to local fiat at the point of sale. The merchant receives fiat — the process is transparent to them.",
      },
      proTips: zh
        ? ["Binance Card 在欧洲地区支持最广", "消费返现需要持有一定数量的平台币", "注意汇率和手续费，部分场景不如直接用法币划算"]
        : ["Binance Card has the widest coverage in Europe", "Cashback usually requires holding a minimum amount of platform tokens", "Watch out for exchange rates and fees — sometimes direct fiat is cheaper"],
    },
    dex: {
      sections: [
        {
          title: zh ? "交易所内置 DEX 是什么？" : "What is a Built-in DEX?",
          body: zh
            ? "DEX（去中心化交易所）是运行在区块链上的交易协议，无需注册、无需 KYC，直接用 MetaMask 等钱包连接即可交易。工作原理：DEX 使用 AMM（自动做市商）机制，通过流动性池而非订单簿撮合交易。当你在 Uniswap 用 ETH 换 USDC 时，实际上是从 ETH/USDC 流动性池中取出 USDC，并将 ETH 注入池中。主流 DEX 对比：① Uniswap（以太坊）：最大的 DEX，日交易量超过 10 亿美元，支持所有 ERC-20 代币；② PancakeSwap（BNB Chain）：Gas 费远低于以太坊，适合小额交易；③ dYdX：专注于合约交易的 DEX，支持最高 20 倍杠杆；④ OKX DEX：聚合 100+ 条链的流动性，自动寻找最优兑换路径。DEX 的核心优势：① 无需 KYC，隐私保护；② 资产完全自托管，无交易所跑路风险；③ 可交易任何代币（包括刚上线的新项目）。主要劣势：Gas 费较高（以太坊主网每笔交易可能需要 5-50 美元），流动性通常低于 CEX。"
            : "A DEX (Decentralized Exchange) lets you swap tokens directly on-chain without depositing assets into a centralized exchange. OKX DEX is the most powerful built-in DEX, aggregating liquidity across 100+ chains to find optimal swap routes. Gate.io also offers DEX functionality on GateChain.",
          tips: zh
            ? ["DEX 交易需要支付 Gas 费，不同链的 Gas 费差异很大", "DEX 聚合器可以找到最优兑换路径，减少滑点", "小额交易在 Gas 费较高的链上可能不划算"]
            : ["DEX trades require gas fees, which vary significantly across chains", "DEX aggregators find optimal swap routes to minimize slippage", "Small trades may not be cost-effective on high-gas chains"],
        },
        {
          title: zh ? "Gas 费与滑点：DEX 使用的隐藏成本" : "Gas Fees & Slippage: Hidden DEX Costs",
          body: zh
            ? "使用 DEX 需要了解两个关键成本：① Gas 费：以太坊主网 Gas 费高昂（有时超过 $50），建议优先使用 Layer 2（Arbitrum、Optimism）或低 Gas 链（BNB Chain、Polygon）；② 滑点（Slippage）：实际成交价与预期价格的偏差，流动性差的代币滑点可高达 5-10%。DEX 聚合器（如 OKX DEX）通过分拆路由降低滑点，是大额 DEX 交易的最佳工具。"
            : "Two key costs when using DEX: ① Gas fees: Ethereum mainnet gas can be very high (sometimes $50+) — prefer Layer 2 (Arbitrum, Optimism) or low-gas chains (BNB Chain, Polygon); ② Slippage: difference between expected and actual price, can reach 5-10% for illiquid tokens. DEX aggregators (like OKX DEX) split routes to minimize slippage — the best tool for large DEX trades.",
          tips: zh
            ? ["以太坊 Gas 费在周末和非高峰时段通常更低", "设置合理的滑点容忍度（通常 0.5-1%），过高容易被 MEV 机器人攻击", "跨链桥接资产时注意手续费，部分桥接费用高达 0.3%"]
            : ["Ethereum gas fees are typically lower on weekends and off-peak hours", "Set reasonable slippage tolerance (usually 0.5-1%) — too high risks MEV bot attacks", "Watch bridge fees when moving assets cross-chain — some charge up to 0.3%"],
        },
      ],
      quiz: {
        question: zh ? "DEX 和 CEX 最主要的区别是什么？" : "What is the main difference between DEX and CEX?",
        options: [
          { value: "a", label: zh ? "A. DEX 交易速度更快" : "A. DEX is faster" },
          { value: "b", label: zh ? "B. DEX 无需将资产托管给交易所" : "B. DEX doesn't require custodying assets to an exchange" },
          { value: "c", label: zh ? "C. DEX 手续费更低" : "C. DEX has lower fees" },
        ],
        correct: "b",
        explanation: zh ? "DEX 的核心优势是非托管性：你的资产始终在自己的钱包中，通过智能合约直接交换，无需信任第三方。" : "DEX's core advantage is non-custodial trading: your assets stay in your own wallet, swapped directly via smart contracts without trusting a third party.",
      },
      proTips: zh
        ? ["OKX Web3 钱包内置 DEX 聚合器，支持 100+ 链", "使用 DEX 前确保钱包中有足够的 Gas 代币", "大额交易建议分批进行，减少价格影响"]
        : ["OKX Web3 Wallet has a built-in DEX aggregator supporting 100+ chains", "Ensure you have enough gas tokens before using DEX", "For large trades, split into batches to reduce price impact"],
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
        {
          title: zh ? "Web3 钱包安全使用指南" : "Web3 Wallet Security Best Practices",
          body: zh
            ? "安全使用 Web3 钱包的核心原则：① 助记词（Seed Phrase）是一切的根本，必须离线保存（纸质或金属板），绝不截图或存入云端；② 授权管理：定期检查并撤销不再使用的 DApp 授权（可用 Revoke.cash）；③ 钱包分层：日常操作用热钱包，大额资产用硬件钱包（Ledger/Trezor），两者不混用；④ 警惕钓鱼网站：永远通过官方渠道访问 DApp，不点击不明链接。"
            : "Core principles for secure Web3 wallet use: ① Seed phrase is everything — store offline (paper or metal plate), never screenshot or upload to cloud; ② Authorization management: regularly check and revoke unused DApp approvals (use Revoke.cash); ③ Wallet layering: hot wallet for daily ops, hardware wallet (Ledger/Trezor) for large holdings — never mix; ④ Beware phishing: always access DApps through official channels, never click unknown links.",
          tips: zh
            ? ["每隔 1-3 个月检查一次钱包授权，撤销不再使用的合约权限", "使用 MetaMask 或 OKX Web3 钱包时，注意检查交易详情再签名", "硬件钱包 Ledger Nano X 约 $150，是保护大额资产的最佳投资"]
            : ["Check wallet approvals every 1-3 months and revoke unused contract permissions", "When using MetaMask or OKX Web3 Wallet, always review transaction details before signing", "Ledger Nano X (~$150) is the best investment for protecting large holdings"],
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
    security: {
      sections: [
        {
          title: zh ? "交易所安全与储备金" : "Exchange Security & Reserves",
          body: zh
            ? "2022 年 FTX 暴雷事件（损失超过 80 亿美元用户资产）后，储备金证明（Proof of Reserves）成为交易所透明度的核心指标。主流交易所均发布了默克尔树储备金证明，用户可自行验证资产是否被足额托管。如何验证：登录交易所账户 → 前往「储备金证明」页面 → 输入你的账户哈希值 → 系统显示你的资产是否包含在储备金证明中。安全保障体系：① 冷热钱包分离：95% 以上的用户资产存储在离线冷钱包中，只有少量热钱包用于日常提款；② 多重签名（Multi-sig）：大额转账需要多个私钥共同签名，防止单点失败；③ 保险基金：Binance 的 SAFU（Secure Asset Fund for Users）基金超过 10 亿美元，用于在极端情况下赔偿用户损失；④ 第三方审计：Binance、OKX 等均定期接受 Mazars 等会计师事务所的储备金审计。"
            : "After the FTX collapse, Proof of Reserves became a key transparency metric. Major exchanges publish Merkle tree proof of reserves, allowing users to verify their assets are fully backed. Cold/hot wallet separation, multi-signature, and insurance funds (like Binance SAFU) are also key security measures.",
          tips: zh
            ? ["定期检查交易所的储备金证明报告", "不要将所有资产存放在同一交易所", "开启双重验证（2FA）保护账户安全"]
            : ["Regularly check the exchange's proof of reserves reports", "Don't keep all assets on a single exchange", "Enable 2FA to protect your account"],
        },
        {
          title: zh ? "账户安全设置完全指南" : "Complete Account Security Setup Guide",
          body: zh
            ? "保护交易所账户的完整安全清单：① 2FA 认证：优先使用 Google Authenticator 或 Yubikey，避免使用短信验证（SIM 卡可被劫持）；② 反钓鱼码：在 Binance/OKX 设置专属反钓鱼码，所有官方邮件都会包含此码；③ 提币白名单：只允许向预设地址提币，防止账户被盗后资产被转走；④ 登录设备管理：定期检查授权设备，删除不再使用的设备；⑤ 密码管理：使用 1Password 等密码管理器，每个平台使用不同的强密码。"
            : "Complete security checklist for exchange accounts: ① 2FA: prefer Google Authenticator or Yubikey over SMS (SIM can be hijacked); ② Anti-phishing code: set a unique code on Binance/OKX — all official emails will include it; ③ Withdrawal whitelist: only allow withdrawals to pre-set addresses; ④ Device management: regularly review authorized devices, remove unused ones; ⑤ Password management: use 1Password or similar, unique strong password per platform.",
          tips: zh
            ? ["Google Authenticator 备份码要妥善保存，换手机时需要", "设置提币白名单后，新地址需要 24-48 小时才能提币，防止被盗后立即转走", "定期（每季度）更换密码，尤其是在安全事件发生后"]
            : ["Save Google Authenticator backup codes safely — needed when changing phones", "After setting withdrawal whitelist, new addresses require 24-48h before withdrawal — prevents immediate theft", "Rotate passwords regularly (quarterly), especially after security incidents"],
        },
      ],
      quiz: {
        question: zh ? "「储备金证明（Proof of Reserves）」的主要作用是什么？" : "What is the main purpose of Proof of Reserves?",
        options: [
          { value: "a", label: zh ? "A. 证明交易所盈利能力" : "A. Prove exchange profitability" },
          { value: "b", label: zh ? "B. 证明用户资产被足额托管，未被挪用" : "B. Prove user assets are fully backed and not misused" },
          { value: "c", label: zh ? "C. 证明交易所的交易量真实" : "C. Prove trading volume is genuine" },
        ],
        correct: "b",
        explanation: zh ? "储备金证明通过密码学方法（默克尔树）让用户验证自己的资产确实存在于交易所的储备中，防止交易所挪用用户资金。" : "Proof of Reserves uses cryptographic methods (Merkle trees) to let users verify their assets actually exist in the exchange's reserves, preventing misappropriation.",
      },
      proTips: zh
        ? ["Binance SAFU 基金规模超过 10 亿美元，是行业最大的用户保护基金", "Gate.io 和 OKX 的储备金证明透明度较高", "硬件钱包是保护大额资产的最佳方式"]
        : ["Binance SAFU fund exceeds $1B — the industry's largest user protection fund", "Gate.io and OKX have high proof of reserves transparency", "Hardware wallets are the best way to protect large holdings"],
    },
    ecosystem: {
      sections: [
        {
          title: zh ? "交易所生态系统" : "Exchange Ecosystem",
          body: zh
            ? "头部交易所已从单纯的交易平台演变为完整的金融生态系统，构建了自己的公链、钱包、支付和 DeFi 生态。各平台生态详解：① Binance 生态：BNB Chain（全球第二大公链，日交易量超过以太坊）、Binance Pay（支持 300+ 商户的加密支付）、Binance Card（全球消费）、Binance NFT 市场、Binance Launchpad（打新平台）。BNB Chain 上的 DeFi 锁仓量超过 50 亿美元；② OKX 生态：OKX Web3 钱包（支持 100+ 公链，功能最强）、OKX DEX（聚合 100+ 链流动性）、OKX NFT 市场、X Layer（OKX 的以太坊 L2 公链）；③ Gate.io 生态：GateChain（公链）、Gate Wallet、Gate NFT 市场、Gate Startup（打新）；④ Bitget 生态：Bitget Wallet（独立 Web3 钱包，支持 100+ 链）、Bitget DEX。生态越完整的交易所，平台币的需求越大，价值越高。"
            : "Top exchanges have evolved from pure trading platforms into complete financial ecosystems. Binance ecosystem: BNB Chain (blockchain), Binance Pay (payments), Binance Card (crypto debit card); OKX ecosystem: OKX Web3 Wallet, OKX DEX; Gate.io ecosystem: GateChain (blockchain), Gate Wallet.",
          tips: zh
            ? ["BNB Chain 是目前交易量最大的 EVM 兼容公链之一", "使用生态内产品通常可以获得额外奖励", "交易所自有公链的安全性需要额外关注"]
            : ["BNB Chain is one of the highest-volume EVM-compatible blockchains", "Using ecosystem products often earns additional rewards", "Exchange-owned blockchains require extra security scrutiny"],
        },
        {
          title: zh ? "平台币的价値与投资逻辑" : "Platform Token Value & Investment Logic",
          body: zh
            ? "平台币（BNB/OKB/GT/BGB）是交易所生态的核心资产，持有可享受多重权益：① 手续费折扣（通常 25%）；② Launchpad/Launchpool 优先参与权；③ 生态项目空投；④ 质押收益。从历史表现看，BNB 从 2017 年 ICO 价 $0.1 涨至最高 $700+，是持有平台币的最佳案例。但要注意：平台币价格与交易所业务高度相关，交易所出现问题时平台币会大幅下跌（参考 FTT 暴跌案例）。"
            : "Platform tokens (BNB/OKB/GT/BGB) are core ecosystem assets with multiple benefits: \u2460 Fee discounts (usually 25%); \u2461 Priority access to Launchpad/Launchpool; \u2462 Ecosystem project airdrops; \u2463 Staking yields. Historically, BNB rose from $0.1 ICO price in 2017 to $700+. However, platform token prices are tightly correlated with exchange health \u2014 they can crash severely if the exchange has problems (see FTT collapse).",
          tips: zh
            ? ["BNB 是目前生态最完善的平台币，持有 BNB 可参与 Binance 全系产品", "不要将过多资产集中在单一平台币，分散持有降低风险", "平台币的价値来源于交易所的盈利能力和生态活跃度"]
            : ["BNB has the most complete ecosystem \u2014 holding BNB unlocks all Binance products", "Don't concentrate too much in a single platform token \u2014 diversify to reduce risk", "Platform token value derives from exchange profitability and ecosystem activity"],
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
    events: {
      sections: [
        {
          title: zh ? "交易所活动与福利" : "Exchange Events & Rewards",
          body: zh
            ? "交易所定期举办各类活动，善用这些活动可以显著降低交易成本甚至免费获取加密货币。主要活动类型详解：① 交易大赛（Trading Competition）：按交易量或盈利率排名，前几名瓜分奖金池（通常为 BTC 或 USDT）。技巧：选择参与人数少的小币种大赛，竞争压力小；② 新用户存款奖励：首次存款满足条件可获得 USDT 奖励。例如 Bybit 新用户存款 100 USDT 完成指定任务可获得最高 30,000 USDT 的奖励（需满足交易量要求）；③ 任务中心（Task Center）：完成 KYC、首次交易、邀请好友等任务获得奖励，几乎零成本；④ 节日活动：春节、双十一等节假日通常有大额奖励，Binance 和 OKX 的节日活动奖金池有时高达数百万美元；⑤ 空投活动：持有特定代币或完成特定操作可获得新项目空投，2021-2023 年 Uniswap、Arbitrum 等项目的空投价值数千至数万美元；⑥ 返佣计划：通过合作伙伴链接注册，每笔交易手续费的 20-40% 永久返还，长期下来节省金额可观。"
            : "Major exchanges regularly host events: trading competitions, new user registration bonuses, deposit cashback, holiday specials, and partner project airdrops. Actively participating in events is an effective way to reduce trading costs and earn extra rewards. Binance and OKX stand out for event frequency and reward scale.",
          tips: zh
            ? ["关注交易所官方 Twitter/Telegram 第一时间获取活动信息", "新用户注册奖励通常有时效限制，尽早领取", "交易大赛奖励丰厚，但需要较高的交易量"]
            : ["Follow official Twitter/Telegram for first-hand event info", "New user registration bonuses usually have time limits — claim early", "Trading competitions offer rich rewards but require high trading volume"],
        },
        {
          title: zh ? "如何最大化活动收益？" : "How to Maximize Event Rewards?",
          body: zh
            ? "系统化参与交易所活动的策略：① 新用户奖励：通过合作伙伴链接注册，通常可获得额外奖励（$30-$100 不等）；② 交易量任务：完成指定交易量解锁奖励，可通过低手续费的现货交易完成；③ 持仓快照：部分活动对特定时间点的持仓进行快照，提前布局可获得空投；④ 社区活动：关注官方 Discord/Telegram 群，参与问答、转发等简单任务获取小额奖励；⑤ 节日活动：春节、圣诞等节日期间活动力度最大，提前准备资金。"
            : "Systematic strategy for exchange events: ① New user bonuses: register via partner links for extra rewards ($30-$100); ② Trading volume tasks: complete volume requirements through low-fee spot trading; ③ Holding snapshots: some events snapshot holdings at specific times — position early for airdrops; ④ Community events: join official Discord/Telegram for simple tasks (Q&A, reposts) for small rewards; ⑤ Holiday events: Chinese New Year, Christmas have the biggest events — prepare funds in advance.",
          tips: zh
            ? ["Binance 的「任务中心」汇集了所有当前活动，每天签到领取积分", "OKX 的「赚币」页面有持续性的高收益活动", "参与活动时注意 KYC 等级要求，部分高额活动需要完成高级认证"]
            : ["Binance's 'Task Center' aggregates all current events — daily check-in for points", "OKX's 'Earn' page has ongoing high-yield events", "Check KYC level requirements for events — some high-value events require advanced verification"],
        },
      ],
      quiz: {
        question: zh ? "获取交易所活动信息最及时的渠道是什么？" : "What is the most timely channel for exchange event information?",
        options: [
          { value: "a", label: zh ? "A. 交易所官方 Twitter/Telegram" : "A. Official Twitter/Telegram" },
          { value: "b", label: zh ? "B. 搜索引擎" : "B. Search engines" },
          { value: "c", label: zh ? "C. 朋友推荐" : "C. Friend recommendations" },
        ],
        correct: "a",
        explanation: zh ? "交易所官方社交媒体（Twitter、Telegram、微博）是最及时的活动信息来源，通常比其他渠道早 24-48 小时发布。" : "Official exchange social media (Twitter, Telegram) is the most timely source of event information, typically 24-48 hours ahead of other channels.",
      },
      proTips: zh
        ? ["Binance 每周都有新活动，建议关注官方公告频道", "OKX 的活动奖励通常以 OKB 形式发放", "参与活动前仔细阅读规则，避免因误解规则而错失奖励"]
        : ["Binance has new events weekly — follow the official announcement channel", "OKX event rewards are usually paid in OKB", "Read event rules carefully before participating to avoid missing rewards due to misunderstandings"],
    },
    earn: {
      sections: [
        {
          title: zh ? "理财产品类型" : "Types of Earn Products",
          body: zh
            ? "交易所理财产品主要分为五大类，适合不同风险偏好的用户：① 活期理财（Flexible Savings）：随存随取，年化收益 1-8%，适合短期闲置资金。例如将 1000 USDT 存入 Binance 活期，年化 3% 约可获得 30 USDT/年，随时可取出；② 定期理财（Fixed Savings）：锁定 7-90 天，年化收益 5-20%，适合确定短期不用的资金。例如 OKX 的 30 天 USDT 定期，年化约 8-12%；③ Launchpool（流动性挖矿）：质押 BNB/OKB 等平台币参与新项目代币挖矿，收益潜力高但波动大。Binance Launchpool 历史上有项目年化超过 100%；④ Staking（质押）：质押 ETH、SOL、ADA 等 PoS 代币参与网络验证，获得链上奖励。ETH 质押年化约 3-5%，SOL 约 6-8%，BNB 约 5-7%；⑤ 双币投资（Dual Investment）：结构性产品，设定目标买入价或卖出价，到期时根据市场情况获得高收益或低价买入/高价卖出。年化收益可达 20-80%，适合有明确买卖目标的用户。"
            : "Exchange earn products include: ① Flexible Savings: deposit/withdraw anytime, 1-8% APY; ② Fixed Savings: locked term, higher yield; ③ Launchpool: stake platform tokens to mine new project tokens; ④ Staking: stake PoS tokens for on-chain rewards; ⑤ Dual Investment: structured products for directional traders.",
          tips: zh
            ? ["活期理财适合短期闲置资金，随时可用", "Launchpool 收益波动大，取决于新项目代币价格", "Staking 有解锁期，急需资金时无法立即取回"]
            : ["Flexible savings for short-term idle funds, always accessible", "Launchpool yields vary with new token prices", "Staking has unbonding periods — funds aren't immediately available"],
        },
        {
          title: zh ? "理财产品风险管理" : "Earn Product Risk Management",
          body: zh
            ? "不同理财产品的风险等级：① 活期/定期理财（稳定币）：风险最低，但仍有智能合约风险和平台风险；② ETH/BTC Staking：资产价格波动风险，解锁期内无法应对急跌；③ Launchpool：新代币价格风险，代币上市即暴跌会大幅降低实际收益；④ 双币理财：结构性产品，可能以非预期资产结算，适合有方向判断的用户。建议：稳定币理财占理财总仓位的 50-70%，其余配置高风险高收益产品。"
            : "Risk levels of earn products: ① Flexible/Fixed savings (stablecoins): lowest risk, but still has smart contract and platform risk; ② ETH/BTC Staking: asset price volatility risk, can't respond to sharp drops during unbonding; ③ Launchpool: new token price risk — token crashing at listing significantly reduces real returns; ④ Dual Investment: structured product, may settle in unexpected asset, for directional traders. Recommendation: 50-70% of earn portfolio in stablecoin products, rest in higher-risk/higher-yield options.",
          tips: zh
            ? ["不要把所有理财资金放在同一平台，分散平台风险", "稳定币理财年化超过 15% 通常意味着更高风险，需要仔细研究", "定期检查理财产品的到期日，避免自动续期到不想要的产品"]
            : ["Don't put all earn funds on one platform — diversify platform risk", "Stablecoin yields above 15% APY usually signal higher risk — research carefully", "Regularly check earn product expiry dates to avoid auto-renewal into unwanted products"],
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
  };

  return content[slug] ?? {
    sections: [{ title: zh ? "功能介绍" : "Feature Introduction", body: zh ? "该功能详情正在完善中，敬请期待。" : "Feature details coming soon." }],
    proTips: [zh ? "请关注官方公告获取最新信息" : "Follow official announcements for the latest updates"],
  };
}
