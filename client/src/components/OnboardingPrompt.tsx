import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { QUIZ_STORAGE_KEY, LEARNING_PATH_KEY } from "@/pages/Web3Quiz";

const DISMISSED_KEY = "web3_onboarding_dismissed";

interface OnboardingPromptProps {
  lang: "zh" | "en";
}

export default function OnboardingPrompt({ lang }: OnboardingPromptProps) {
  const [, navigate] = useLocation();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const zh = lang === "zh";

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    const hasProfile = localStorage.getItem(QUIZ_STORAGE_KEY);
    const hasPath = localStorage.getItem(LEARNING_PATH_KEY);
    if (!dismissed && !hasProfile && !hasPath) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    }, 300);
  };

  const handleStart = () => {
    navigate("/web3-quiz");
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        opacity: closing ? 0 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDismiss} />

      <div
        className="relative w-full max-w-sm rounded-3xl border overflow-hidden"
        style={{
          borderColor: "rgba(6,182,212,0.25)",
          background: "linear-gradient(135deg, rgba(10,15,30,0.98), rgba(13,26,45,0.98))",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(6,182,212,0.1)",
          transform: closing ? "scale(0.9) translateY(20px)" : "scale(1) translateY(0)",
          transition: "transform 0.3s ease",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #06b6d4, #8b5cf6, #ec4899)" }} />

        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/10 transition-all z-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-6 pt-8 text-center">
          <div className="relative mb-5 inline-block">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-24 h-24 rounded-full" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.5), transparent 70%)" }} />
            </div>
            <span className="relative text-5xl block" style={{ animation: "float 3s ease-in-out infinite" }}>🧭</span>
          </div>

          <h3 className="text-lg font-black text-white mb-2">
            {zh ? "让我了解你" : "Let Us Know You"}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            {zh
              ? "花 2 分钟完成一个简单的测评，我们将根据你的背景和兴趣为你量身打造 Web3 学习路径"
              : "Take a 2-minute quiz and we'll create a personalized Web3 learning path based on your background and interests"}
          </p>

          <div className="flex items-center justify-center gap-4 mb-5">
            {[
              { icon: "⏱", text: zh ? "2 分钟" : "2 min" },
              { icon: "🎯", text: zh ? "5 道题" : "5 Q's" },
              { icon: "✨", text: zh ? "个性化" : "Custom" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-[0.98] mb-3"
            style={{
              background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
              boxShadow: "0 4px 20px rgba(6,182,212,0.3)",
            }}
          >
            {zh ? "开始测评 →" : "Start Quiz →"}
          </button>

          <button
            onClick={handleDismiss}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            {zh ? "以后再说" : "Maybe later"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
