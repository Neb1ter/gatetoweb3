import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";

const CATEGORY_LABELS: Record<string, { zh: string; en: string; color: string }> = {
  market:   { zh: "行情",   en: "Market",   color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  policy:   { zh: "政策",   en: "Policy",   color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  exchange: { zh: "交易所", en: "Exchange", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  defi:     { zh: "DeFi",   en: "DeFi",     color: "bg-green-500/20 text-green-300 border-green-500/30" },
  nft:      { zh: "NFT",    en: "NFT",      color: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  other:    { zh: "其他",   en: "Other",    color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
};

const CATEGORY_FILTERS = ["all", "market", "policy", "exchange", "defi", "other"] as const;
type CategoryFilter = typeof CATEGORY_FILTERS[number];

function formatTime(date: Date | string, lang: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (lang === "zh") {
    if (diffMin < 60) return `${diffMin} 分钟前`;
    if (diffHr < 24) return `${diffHr} 小时前`;
    if (diffDay < 7) return `${diffDay} 天前`;
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  } else {
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

function formatDate(date: Date | string, lang: string): string {
  const d = new Date(date);
  if (lang === "zh") {
    return d.toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export default function CryptoNews() {
  const { language } = useLanguage();
  const zh = language === "zh";
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");

  const { data: newsItems = [], isLoading } = trpc.news.list.useQuery({ limit: 20 });

  const filtered = activeFilter === "all"
    ? newsItems
    : newsItems.filter(n => n.category === activeFilter);

  // Group by date for timeline
  const grouped: Record<string, typeof newsItems> = {};
  for (const item of filtered) {
    const dateKey = formatDate(item.publishedAt, language);
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(item);
  }
  const dateGroups = Object.entries(grouped);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0A192F 0%, #0d2137 50%, #0A192F 100%)" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-yellow-500/20 backdrop-blur-md" style={{ background: "rgba(10,25,47,0.92)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-yellow-400 transition-colors">
              <span>←</span>
              <span className="hidden sm:inline">{zh ? "返回首页" : "Home"}</span>
            </button>
          </Link>
          <h1 className="text-base sm:text-lg font-bold text-yellow-400 flex items-center gap-2">
            <span>📡</span>
            <span>{zh ? "币圈资讯" : "Crypto News"}</span>
          </h1>
          <a
            href="https://www.theblockbeats.info"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-yellow-400 transition-colors hidden sm:block"
          >
            {zh ? "来源：律动" : "Source: BlockBeats"}
          </a>
          <div className="sm:hidden w-16" />
        </div>

        {/* Category filter tabs */}
        <div className="max-w-3xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORY_FILTERS.map(cat => {
            const label = cat === "all"
              ? (zh ? "全部" : "All")
              : (zh ? CATEGORY_LABELS[cat]?.zh : CATEGORY_LABELS[cat]?.en) ?? cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  activeFilter === cat
                    ? "bg-yellow-500 text-gray-900 border-yellow-500"
                    : "bg-transparent text-gray-400 border-gray-600 hover:border-yellow-500/50 hover:text-yellow-400"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Disclaimer */}
        <div className="mb-5 px-3 py-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 flex items-start gap-2">
          <span className="text-yellow-400 text-sm mt-0.5 flex-shrink-0">⚠️</span>
          <p className="text-xs text-gray-400 leading-relaxed">
            {zh
              ? "以下资讯来源于律动BlockBeats，仅供参考，不构成投资建议。加密市场波动较大，请谨慎决策。"
              : "News sourced from BlockBeats for reference only. Not investment advice. Crypto markets are volatile."}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-gray-700 rounded w-24 mb-3" />
                <div className="h-16 bg-gray-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <p>{zh ? "暂无相关资讯" : "No news found"}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {dateGroups.map(([dateLabel, items]) => (
              <div key={dateLabel}>
                {/* Date separator */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/30" />
                  <span className="text-xs font-semibold text-yellow-500/80 px-2 py-0.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 flex-shrink-0">
                    {dateLabel}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/30" />
                </div>

                {/* Timeline items */}
                <div className="relative pl-5">
                  {/* Vertical line */}
                  <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gradient-to-b from-yellow-500/40 via-yellow-500/20 to-transparent" />

                  <div className="space-y-4">
                    {items.map((item) => {
                      const catInfo = CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.other;
                      const catLabel = zh ? catInfo.zh : catInfo.en;

                      return (
                        <div key={item.id} className="relative group">
                          {/* Timeline dot */}
                          <div className={`absolute -left-5 top-3 w-2.5 h-2.5 rounded-full border-2 transition-transform group-hover:scale-125 ${
                            item.isPinned
                              ? "bg-yellow-400 border-yellow-400 shadow-[0_0_8px_rgba(255,215,0,0.6)]"
                              : "bg-gray-700 border-yellow-500/50 group-hover:bg-yellow-500/60"
                          }`} />

                          {/* Card */}
                          <div className={`rounded-xl border transition-all duration-200 group-hover:border-yellow-500/40 group-hover:shadow-[0_0_20px_rgba(255,215,0,0.06)] ${
                            item.isPinned
                              ? "border-yellow-500/40 bg-yellow-500/5"
                              : "border-gray-700/60 bg-gray-800/40"
                          }`}>
                            <div className="p-3.5 sm:p-4">
                              {/* Top row: category + time + pinned */}
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${catInfo.color}`}>
                                  {catLabel}
                                </span>
                                {item.isPinned && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-medium">
                                    📌 {zh ? "置顶" : "Pinned"}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 ml-auto flex-shrink-0">
                                  {formatTime(item.publishedAt, language)}
                                </span>
                              </div>

                              {/* Title */}
                              <h3 className="text-sm sm:text-base font-semibold text-gray-100 leading-snug mb-1.5 group-hover:text-yellow-300 transition-colors">
                                {item.title}
                              </h3>

                              {/* Summary */}
                              {item.summary && (
                                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed line-clamp-2">
                                  {item.summary}
                                </p>
                              )}

                              {/* Footer: source + read more */}
                              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-700/50">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <span>📰</span>
                                  {item.source}
                                </span>
                                {item.url && (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-yellow-500 hover:text-yellow-300 transition-colors flex items-center gap-1"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {zh ? "原文" : "Source"} →
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 p-4 sm:p-5 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-transparent text-center">
          <p className="text-sm sm:text-base font-semibold text-yellow-300 mb-1">
            {zh ? "🔔 想第一时间获取币圈资讯？" : "🔔 Want real-time crypto updates?"}
          </p>
          <p className="text-xs text-gray-400 mb-3">
            {zh ? "关注律动BlockBeats，掌握市场第一手动态" : "Follow BlockBeats for the latest market insights"}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <a
              href="https://www.theblockbeats.info"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-yellow-500 text-gray-900 text-sm font-bold hover:bg-yellow-400 transition-colors"
            >
              {zh ? "访问律动BlockBeats" : "Visit BlockBeats"}
            </a>
            <Link href="/exchanges">
              <button className="px-4 py-2 rounded-lg border border-yellow-500/40 text-yellow-400 text-sm font-medium hover:bg-yellow-500/10 transition-colors w-full sm:w-auto">
                {zh ? "查看交易所返佣" : "View Exchange Rebates"}
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
