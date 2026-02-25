import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useScrollMemory } from "@/hooks/useScrollMemory";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { LEARNING_PATH_KEY, QUIZ_STORAGE_KEY } from "./Web3Quiz";

const ALL_SECTIONS = [
  {
    category: "Web3 入门",
    color: "#06b6d4",
    colorRgb: "6,182,212",
    items: [
      { icon: "🌐", title: "什么是 Web3", desc: "Web3 核心概念与发展历程", path: "/web3-guide/what-is-web3" },
      { icon: "⛓️", title: "区块链基础", desc: "区块链技术原理详解", path: "/web3-guide/blockchain-basics" },
      { icon: "🔑", title: "钱包与私钥", desc: "安全管理你的数字资产", path: "/web3-guide/wallet-keys" },
      { icon: "🏦", title: "DeFi 深度解析", desc: "去中心化金融全景概览", path: "/web3-guide/defi-deep" },
      { icon: "📈", title: "投资方式入门", desc: "加密货币投资方式总览", path: "/web3-guide/investment-gateway" },
      { icon: "🌍", title: "经济机遇分析", desc: "Web3 时代的历史机遇", path: "/web3-guide/economic-opportunity" },
      { icon: "🔄", title: "交易所功能详解", desc: "现货、合约、杠杆教学", path: "/web3-guide/exchange-guide" },
    ],
  },
  {
    category: "省钱与交易",
    color: "#f59e0b",
    colorRgb: "245,158,11",
    items: [
      { icon: "💰", title: "省钱指南", desc: "返佣机制全攻略", path: "/crypto-saving" },
      { icon: "📖", title: "交易所扫盲", desc: "五大交易所功能一网打尽", path: "/exchange-guide" },
      { icon: "📱", title: "下载交易所", desc: "新手下载注册全流程", path: "/exchange-download" },
      { icon: "🏢", title: "交易所对比", desc: "选择最适合你的交易所", path: "/exchanges" },
    ],
  },
  {
    category: "模拟交易",
    color: "#a855f7",
    colorRgb: "168,85,247",
    items: [
      { icon: "📊", title: "现货模拟", desc: "零风险学习现货交易", path: "/sim/spot" },
      { icon: "⚡", title: "合约模拟", desc: "体验合约交易玩法", path: "/sim/futures" },
      { icon: "📉", title: "杠杆模拟", desc: "了解杠杆交易机制", path: "/sim/margin" },
      { icon: "📋", title: "期权模拟", desc: "探索期权交易策略", path: "/sim/options" },
      { icon: "🤖", title: "量化机器人", desc: "体验自动化交易", path: "/sim/bot" },
      { icon: "🏛️", title: "传统金融模拟", desc: "对比传统金融交易", path: "/sim/tradfi" },
    ],
  },
];

export default function LearningComplete() {
  useScrollMemory();
  const [, navigate] = useLocation();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(LEARNING_PATH_KEY);
    if (!raw) { navigate("/web3-quiz"); return; }
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleRestart = () => {
    localStorage.removeItem(QUIZ_STORAGE_KEY);
    localStorage.removeItem(LEARNING_PATH_KEY);
    navigate("/web3-quiz");
  };

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1a2d 50%, #0a1628 100%)" }}>
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10px",
                background: ["#06b6d4", "#8b5cf6", "#f59e0b", "#4ade80", "#ec4899"][i % 5],
                animation: `confetti-fall ${2 + Math.random() * 2}s ease-in ${Math.random() * 1}s forwards`,
                opacity: 0.8,
              }}
            />
          ))}
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.9; }
              100% { transform: translateY(100vh) rotate(${360 + Math.random() * 360}deg) scale(0.3); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      <nav className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl" style={{ background: "rgba(10,15,30,0.85)" }}>
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            首页
          </Link>
          <span className="text-xs font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">学习完成</span>
          <div className="w-12" />
        </div>
      </nav>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(74,222,128,0.4), transparent 70%)" }} />
              </div>
              <span className="relative text-6xl">🎓</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              恭喜你完成学习之旅！
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-3">
              你已经系统学习了 Web3 的核心知识，现在是时候自由探索更广阔的世界了
            </p>
            <p className="text-slate-600 text-sm">
              下面是我们平台的全部内容，随时回来深入学习任何感兴趣的主题
            </p>
          </div>

          <div className="space-y-10">
            {ALL_SECTIONS.map(section => (
              <div key={section.category}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-6 rounded-full" style={{ background: section.color }} />
                  <h2 className="text-lg font-black" style={{ color: section.color }}>{section.category}</h2>
                  <span className="text-xs text-slate-600">{section.items.length} 个内容</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {section.items.map(item => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className="group rounded-2xl border p-4 flex items-start gap-3 transition-all duration-200 hover:scale-[1.02] hover:border-opacity-60"
                      style={{
                        borderColor: `rgba(${section.colorRgb}, 0.12)`,
                        background: `rgba(${section.colorRgb}, 0.03)`,
                      }}
                    >
                      <span className="text-2xl shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors mb-0.5">{item.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center space-y-4">
            <div className="rounded-2xl border border-white/8 p-8 mx-auto max-w-md" style={{ background: "rgba(255,255,255,0.02)" }}>
              <span className="text-3xl mb-3 block">🙏</span>
              <h3 className="text-lg font-black text-white mb-2">感谢你的信任</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">
                Web3 世界广阔无垠，这只是一个开始。继续探索，你会发现更多可能性。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", boxShadow: "0 4px 16px rgba(6,182,212,0.3)" }}
                >
                  返回首页
                </button>
                <button
                  onClick={handleRestart}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm border border-white/10 text-slate-400 hover:text-white hover:border-white/25 transition-all"
                >
                  重新测评
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-slate-700">
            © 2026 Web3 导航中心 · 为全球用户提供最优质的 Web3 入门内容
          </p>
          <p className="text-xs text-slate-800 mt-1">
            内容仅供参考，不构成投资建议。投资有风险，入市需谨慎。
          </p>
        </div>
      </footer>

      <ScrollToTopButton color="blue" />
    </div>
  );
}
