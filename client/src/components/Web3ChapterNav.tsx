import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";

// ============================================================
// 所有章节定义（统一管理，方便维护）
// 章节顺序：01 什么是Web3 → 02 区块链基础 → 03 钱包与私钥
//           → 04 DeFi深度解析 → 05 经济形势与机遇 → 06 参与Web3的门户 → 07 交易所入门指南
// ============================================================
export const WEB3_CHAPTERS = [
  {
    id: "what-is-web3",
    path: "/web3-guide/what-is-web3",
    num: "01",
    title: "什么是 Web3",
    subtitle: "互联网的第三次进化",
    icon: "🌐",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/40",
    activeBg: "bg-emerald-500/15",
    badge: "入门",
  },
  {
    id: "blockchain-basics",
    path: "/web3-guide/blockchain-basics",
    num: "02",
    title: "区块链基础",
    subtitle: "支撑 Web3 的底层技术",
    icon: "⛓️",
    color: "text-blue-400",
    borderColor: "border-blue-500/40",
    activeBg: "bg-blue-500/15",
    badge: "进阶",
  },
  {
    id: "wallet-keys",
    path: "/web3-guide/wallet-keys",
    num: "03",
    title: "钱包与私钥",
    subtitle: "你的数字资产保险箱",
    icon: "🔐",
    color: "text-violet-400",
    borderColor: "border-violet-500/40",
    activeBg: "bg-violet-500/15",
    badge: "进阶",
  },
  {
    id: "defi-deep",
    path: "/web3-guide/defi-deep",
    num: "04",
    title: "DeFi 深度解析",
    subtitle: "去中心化金融的世界",
    icon: "💰",
    color: "text-yellow-400",
    borderColor: "border-yellow-500/40",
    activeBg: "bg-yellow-500/15",
    badge: "进阶",
  },
  {
    id: "economic-opportunity",
    path: "/web3-guide/economic-opportunity",
    num: "05",
    title: "经济形势与 Web3 机遇",
    subtitle: "现实压力与破局机遇",
    icon: "📈",
    color: "text-orange-400",
    borderColor: "border-orange-500/40",
    activeBg: "bg-orange-500/15",
    badge: "核心",
  },
  {
    id: "investment-gateway",
    path: "/web3-guide/investment-gateway",
    num: "06",
    title: "参与 Web3 的门户",
    subtitle: "CEX vs DEX vs 链上投资",
    icon: "🚪",
    color: "text-rose-400",
    borderColor: "border-rose-500/40",
    activeBg: "bg-rose-500/15",
    badge: "核心",
  },
  {
    id: "exchange-guide",
    path: "/web3-guide/exchange-guide",
    num: "07",
    title: "交易所入门指南",
    subtitle: "迈出 Web3 第一步",
    icon: "🏦",
    color: "text-teal-400",
    borderColor: "border-teal-500/40",
    activeBg: "bg-teal-500/15",
    badge: "实操",
  },
];

// ============================================================
// 触发按钮图标（3D 网格感，带脉冲提示）
// ============================================================
function TriggerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative">
      {!isOpen && (
        <span
          className="absolute inset-0 rounded-xl animate-ping"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
            animationDuration: "2.5s",
          }}
        />
      )}
      <div
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-indigo-500/30 border border-indigo-400/60"
            : "bg-slate-800/80 border border-slate-600/60 hover:border-indigo-500/60 hover:bg-indigo-500/10"
        }`}
        style={{
          boxShadow: isOpen
            ? "0 0 20px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {isOpen ? (
          <svg className="w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.5" className="text-indigo-400" stroke="currentColor" />
            <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.5" className="text-indigo-300" stroke="currentColor" />
            <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.5" className="text-slate-400" stroke="currentColor" />
            <line x1="14" y1="17.5" x2="21" y2="17.5" strokeWidth="1.5" strokeLinecap="round" className="text-slate-500" stroke="currentColor" />
            <line x1="14" y1="20.5" x2="18.5" y2="20.5" strokeWidth="1.5" strokeLinecap="round" className="text-slate-600" stroke="currentColor" />
          </svg>
        )}
      </div>
      {!isOpen && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-slate-500 font-medium tracking-wider">
          章节
        </div>
      )}
    </div>
  );
}

// ============================================================
// 主组件
// ============================================================
interface Web3ChapterNavProps {
  currentChapterId: string;
}

export default function Web3ChapterNav({ currentChapterId }: Web3ChapterNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const currentChapter = WEB3_CHAPTERS.find((c) => c.id === currentChapterId);
  const currentIndex = WEB3_CHAPTERS.findIndex((c) => c.id === currentChapterId);

  return (
    <div ref={menuRef} className="relative" style={{ zIndex: 60 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center gap-0.5 focus:outline-none"
        aria-label="章节导航"
      >
        <TriggerIcon isOpen={isOpen} />
      </button>

      <div
        className="absolute right-0 top-14 w-72 sm:w-80 rounded-2xl overflow-hidden"
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(-12px) scale(0.96)",
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease, transform 0.25s ease",
          background: "rgba(8, 15, 30, 0.92)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* 菜单顶部标题 */}
        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(99,102,241,0.15)" }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">
              Web3 入圈指南 · 章节导航
            </span>
          </div>
          {currentChapter && (
            <p className="text-[10px] text-slate-500 mt-1 ml-3.5">
              当前：第 {currentChapter.num} 章 · {currentChapter.title}
            </p>
          )}
        </div>

        {/* 章节列表 */}
        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {WEB3_CHAPTERS.map((chapter, i) => {
            const isCurrent = chapter.id === currentChapterId;
            const isPrev = i < currentIndex;
            return (
              <Link
                key={chapter.id}
                href={chapter.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 group cursor-pointer ${
                  isCurrent
                    ? `${chapter.activeBg} border ${chapter.borderColor}`
                    : "hover:bg-white/5 border border-transparent hover:border-white/8"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black transition-all ${
                    isCurrent
                      ? `${chapter.color} bg-white/10`
                      : isPrev
                      ? "text-slate-500 bg-slate-800/60"
                      : "text-slate-400 bg-slate-800/40 group-hover:text-slate-200"
                  }`}
                  style={isCurrent ? { boxShadow: "0 0 12px rgba(99,102,241,0.2)" } : {}}
                >
                  {isPrev && !isCurrent ? (
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    chapter.num
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold leading-tight ${isCurrent ? chapter.color : "text-slate-300 group-hover:text-white"} transition-colors`}>
                    {chapter.icon} {chapter.title}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                    {chapter.subtitle}
                  </div>
                </div>

                {isCurrent ? (
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${chapter.color.replace("text-", "bg-")}`} />
                ) : (
                  <svg className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mx-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* 底部：返回主页 + 币圈省钱 */}
        <div className="p-2 pt-1.5">
          <Link
            href="/web3-guide"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 hover:bg-white/5 border border-transparent hover:border-white/8 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                📋 指南总览
              </div>
              <div className="text-[10px] text-slate-600">返回 Web3 入圈指南主页</div>
            </div>
          </Link>

          <Link
            href="/crypto-saving"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-yellow-500/8 border border-transparent hover:border-yellow-500/20 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">💰</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-yellow-500/80 group-hover:text-yellow-400 transition-colors">
                币圈省钱指南
              </div>
              <div className="text-[10px] text-slate-600">交易所返佣 · 手续费优化</div>
            </div>
            <svg className="w-3.5 h-3.5 text-yellow-600/60 group-hover:text-yellow-500 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>

        <div className="px-4 py-2 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="text-[9px] text-slate-700 tracking-widest uppercase">
            Web3 入圈指南 · 7 个章节
          </span>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 -z-10" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
