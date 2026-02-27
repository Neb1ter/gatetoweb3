import { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { useScrollMemory } from "@/hooks/useScrollMemory";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { LEARNING_PATH_KEY, QUIZ_STORAGE_KEY } from "./Web3Quiz";
import type { LearningStep } from "./Web3Quiz";

interface PathState {
  steps: LearningStep[];
  currentStep: number;
  completedSteps: string[];
}

const DIFFICULTY_MAP = {
  beginner: { label: "入门", color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.25)" },
  intermediate: { label: "进阶", color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.25)" },
  advanced: { label: "高级", color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.25)" },
};

export default function LearningPath() {
  useScrollMemory();
  const [, navigate] = useLocation();
  const [pathState, setPathState] = useState<PathState | null>(null);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(LEARNING_PATH_KEY);
    if (raw) {
      try {
        setPathState(JSON.parse(raw));
      } catch {
        navigate("/web3-quiz");
      }
    } else {
      navigate("/web3-quiz");
    }
  }, [navigate]);

  const toggleComplete = useCallback((stepId: string) => {
    if (!pathState) return;
    setAnimatingId(stepId);
    const completed = pathState.completedSteps.includes(stepId)
      ? pathState.completedSteps.filter(id => id !== stepId)
      : [...pathState.completedSteps, stepId];

    const newState = { ...pathState, completedSteps: completed };
    setPathState(newState);
    localStorage.setItem(LEARNING_PATH_KEY, JSON.stringify(newState));
    setTimeout(() => setAnimatingId(null), 400);
  }, [pathState]);

  const handleReset = useCallback(() => {
    localStorage.removeItem(QUIZ_STORAGE_KEY);
    localStorage.removeItem(LEARNING_PATH_KEY);
    navigate("/web3-quiz");
  }, [navigate]);

  if (!pathState) return null;

  const { steps, completedSteps } = pathState;
  const progress = steps.length > 0 ? completedSteps.length / steps.length : 0;
  const allDone = completedSteps.length === steps.length && steps.length > 0;

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1a2d 50%, #0a1628 100%)" }}>
      <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl" style={{ background: "rgba(10,15,30,0.85)" }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            首页
          </Link>
          <span className="text-xs font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">我的学习路径</span>
          <button onClick={handleReset} className="text-xs text-slate-600 hover:text-red-400 transition-colors">重新测评</button>
        </div>
      </nav>

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-4xl mb-4 block">🗺️</span>
            <h1 className="text-2xl sm:text-3xl font-black mb-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              你的专属学习路径
            </h1>
            <p className="text-slate-500 text-sm">根据你的测评结果精心定制，按顺序学习效果最佳</p>
          </div>

          <div className="max-w-sm mx-auto mb-10 px-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500">学习进度</span>
              <span className="text-xs font-bold text-cyan-400">{completedSteps.length} / {steps.length}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progress * 100}%`,
                  background: allDone
                    ? "linear-gradient(90deg, #4ade80, #22d3ee)"
                    : "linear-gradient(90deg, #06b6d4, #8b5cf6)",
                }}
              />
            </div>
            {allDone && (
              <div className="text-center mt-3">
                <span className="text-xs font-bold text-emerald-400">🎉 恭喜你完成了所有学习！</span>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/30 via-purple-500/20 to-transparent" />

            <div className="space-y-4">
              {steps.map((step, index) => {
                const done = completedSteps.includes(step.id);
                const isCurrent = !done && index === steps.findIndex(s => !completedSteps.includes(s.id));
                const diff = DIFFICULTY_MAP[step.difficulty];
                const isAnimating = animatingId === step.id;

                return (
                  <div
                    key={step.id}
                    className="relative pl-14 group"
                    style={{
                      opacity: isAnimating ? 0.6 : 1,
                      transform: isAnimating ? "scale(0.98)" : "none",
                      transition: "opacity 0.3s, transform 0.3s",
                    }}
                  >
                    <button
                      onClick={() => toggleComplete(step.id)}
                      className="absolute left-0 top-4 w-[54px] flex items-center justify-center z-10"
                    >
                      <div
                        className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                        style={{
                          borderColor: done ? "#4ade80" : isCurrent ? "#06b6d4" : "rgba(255,255,255,0.15)",
                          background: done ? "rgba(74,222,128,0.2)" : isCurrent ? "rgba(6,182,212,0.15)" : "rgba(10,15,30,0.8)",
                          boxShadow: done
                            ? "0 0 10px rgba(74,222,128,0.3)"
                            : isCurrent
                              ? "0 0 10px rgba(6,182,212,0.3)"
                              : "none",
                        }}
                      >
                        {done ? (
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <span className="text-xs font-bold" style={{ color: isCurrent ? "#06b6d4" : "rgba(255,255,255,0.3)" }}>{index + 1}</span>
                        )}
                      </div>
                    </button>

                    <div
                      className="rounded-2xl border p-5 transition-all duration-200 hover:scale-[1.01]"
                      style={{
                        borderColor: done ? "rgba(74,222,128,0.2)" : isCurrent ? "rgba(6,182,212,0.3)" : "rgba(255,255,255,0.06)",
                        background: done
                          ? "rgba(74,222,128,0.04)"
                          : isCurrent
                            ? "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(139,92,246,0.04))"
                            : "rgba(255,255,255,0.02)",
                        boxShadow: isCurrent ? "0 4px 20px rgba(6,182,212,0.1)" : "none",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{step.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className={`font-black text-sm ${done ? "text-slate-500 line-through" : "text-white"}`}>{step.title}</h3>
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}
                            >
                              {diff.label}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 animate-pulse">
                                当前
                              </span>
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed mb-2 ${done ? "text-slate-600" : "text-slate-400"}`}>{step.description}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-600 flex items-center gap-1">
                              ⏱ {step.duration}
                            </span>
                            <Link
                              href={step.path}
                              className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              {done ? "再次查看 →" : "开始学习 →"}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {allDone && (
            <div className="mt-10 text-center">
              <button
                onClick={() => navigate("/learning-complete")}
                className="px-10 py-3.5 rounded-2xl font-black text-base text-white transition-all hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #4ade80, #06b6d4)",
                  boxShadow: "0 4px 24px rgba(74,222,128,0.3)",
                }}
              >
                查看完成总结 🎉
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 导航球使用指南（页面底部图文教程） ─────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
              style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4" }}>
              💡 使用技巧
            </div>
            <h2 className="text-2xl font-black text-white mb-3">用导航球快速跳转学习</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              页面底部居中的导航球是您的学习助手，随时掌握进度并一键直达任意学习步骤
            </p>
          </div>

          {/* 三步图文说明 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {/* Step 1 */}
            <div className="rounded-2xl p-5 flex flex-col items-center text-center"
              style={{ background: "rgba(10,15,28,0.8)", border: "1px solid rgba(6,182,212,0.15)" }}>
              {/* 示意图：导航球球体 */}
              <div className="mb-4 relative">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: "rgba(6,182,212,0.15)", border: "1.5px solid rgba(6,182,212,0.4)", boxShadow: "0 0 20px rgba(6,182,212,0.2)" }}>
                  <span className="text-2xl">🧭</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{ background: "linear-gradient(135deg,#06b6d4,#8b5cf6)" }}>1</div>
              </div>
              <h3 className="font-black text-white text-sm mb-2">找到底部导航球</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                在页面<span className="text-cyan-400 font-bold">底部正中央</span>找到悬浮导航球，
                它会显示当前所在页面的图标。学习路径未完成时会有<span className="text-cyan-400 font-bold">蓝色小点</span>提示。
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl p-5 flex flex-col items-center text-center"
              style={{ background: "rgba(10,15,28,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="mb-4 relative">
                {/* 示意图：展开的菜单 */}
                <div className="flex flex-col items-center gap-1.5">
                  {["🏠","🧭","🏦","📖","✉️"].map((icon, i) => (
                    <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                      style={{
                        background: i === 1 ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${i === 1 ? "rgba(6,182,212,0.4)" : "rgba(255,255,255,0.1)"}`,
                      }}>
                      {icon}
                    </div>
                  ))}
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{ background: "linear-gradient(135deg,#06b6d4,#8b5cf6)" }}>2</div>
              </div>
              <h3 className="font-black text-white text-sm mb-2">点击展开导航菜单</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                单击导航球，菜单<span className="text-purple-400 font-bold">向上弹出</span>五个图文按钮，
                悬停时显示页面名称。点击<span className="text-cyan-400 font-bold">🧭 学习</span>按钮进入学习路径面板。
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl p-5 flex flex-col items-center text-center"
              style={{ background: "rgba(10,15,28,0.8)", border: "1px solid rgba(74,222,128,0.15)" }}>
              <div className="mb-4 relative">
                {/* 示意图：步骤列表 */}
                <div className="w-32 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(6,182,212,0.2)", background: "rgba(10,15,28,0.95)" }}>
                  <div className="px-2 py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="text-[9px] font-bold text-cyan-400 mb-1">学习路径</div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full w-2/5 rounded-full" style={{ background: "linear-gradient(90deg,#06b6d4,#8b5cf6)" }} />
                    </div>
                  </div>
                  {[{icon:"🔗",label:"区块链基础",done:true},{icon:"💰",label:"DeFi入门",done:false,next:true},{icon:"🔐",label:"钱包安全",done:false}].map((s,i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2 py-1.5" style={{ background: s.next ? "rgba(6,182,212,0.08)" : "transparent", borderLeft: s.next ? "2px solid #06b6d4" : "2px solid transparent" }}>
                      <span className="text-[10px]">{s.done ? "✅" : s.next ? "🔵" : "⚪"}</span>
                      <span className="text-[9px]" style={{ color: s.done ? "rgba(255,255,255,0.3)" : s.next ? "#06b6d4" : "rgba(255,255,255,0.6)" }}>{s.label}</span>
                      {s.next && <span className="ml-auto text-[8px] text-cyan-400 font-bold">下一步</span>}
                    </div>
                  ))}
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{ background: "linear-gradient(135deg,#06b6d4,#8b5cf6)" }}>3</div>
              </div>
              <h3 className="font-black text-white text-sm mb-2">一键跳转任意步骤</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                学习面板显示<span className="text-green-400 font-bold">进度条</span>和每步状态，
                ✅ 已完成 · 🔵 下一步 · ⚪ 待学习。
                点击任意步骤即可<span className="text-cyan-400 font-bold">直接跳转</span>，无需返回本页。
              </p>
            </div>
          </div>

          {/* 快捷提示横幅 */}
          <div className="rounded-2xl p-5 flex items-start gap-4"
            style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(139,92,246,0.08))", border: "1px solid rgba(6,182,212,0.2)" }}>
            <div className="text-3xl shrink-0 mt-0.5">⌨️</div>
            <div>
              <h4 className="font-black text-white text-sm mb-1.5">快捷操作提示</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-6">
                {[
                  { icon: "👆", text: "单击导航球 → 展开/收起菜单" },
                  { icon: "🧭", text: "点击学习图标 → 打开步骤面板" },
                  { icon: "📍", text: "蓝色高亮 → 当前所在步骤" },
                  { icon: "🔵", text: "蓝点提示 → 有未完成的学习步骤" },
                  { icon: "✅", text: "绿色对勾 → 已完成的步骤" },
                  { icon: "🎓", text: "全部完成 → 查看学习总结" },
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{tip.icon}</span>
                    <span>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScrollToTopButton color="blue" />
    </div>
  );
}
