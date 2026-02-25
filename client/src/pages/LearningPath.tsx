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

      <ScrollToTopButton color="blue" />
    </div>
  );
}
