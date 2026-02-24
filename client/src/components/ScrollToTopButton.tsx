import { useState, useEffect } from "react";

interface ScrollToTopButtonProps {
  /** 触发显示的滚动距离，默认 300px */
  threshold?: number;
  /** 按钮颜色主题，默认 emerald */
  color?: "emerald" | "yellow" | "blue" | "purple";
}

const colorMap = {
  emerald: "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30",
  yellow: "bg-yellow-500 hover:bg-yellow-400 shadow-yellow-500/30",
  blue: "bg-blue-500 hover:bg-blue-400 shadow-blue-500/30",
  purple: "bg-purple-500 hover:bg-purple-400 shadow-purple-500/30",
};

export function ScrollToTopButton({
  threshold = 300,
  color = "emerald",
}: ScrollToTopButtonProps) {
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1.5 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {/* Tooltip */}
      <div
        className={`px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-medium whitespace-nowrap shadow-lg transition-all duration-200 ${
          showTooltip ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        回到顶部
        {/* 小三角 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800" />
      </div>

      {/* 圆形按钮 */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label="回到顶部"
        className={`w-12 h-12 rounded-full ${colorMap[color]} text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform duration-150`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
