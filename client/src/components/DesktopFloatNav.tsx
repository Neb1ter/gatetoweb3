/**
 * DesktopFloatNav — 桌面端悬浮导航球（底部居中）
 *
 * 设计原则：
 * - 固定在页面底部居中，不与回顶按钮重叠
 * - 点击球体展开垂直图文菜单（向上弹出）
 * - 学习路径子菜单向上弹出，显示步骤列表和进度
 * - 仅在 md 及以上屏幕显示（移动端由 MobileFloatNav 负责）
 * - 始终挂载，通过 CSS 控制可见性，确保稳定显示
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Home, Building2, BookOpen, Mail, Compass,
  ChevronUp, CheckCircle2, Circle, ChevronRight,
} from "lucide-react";

// ─── 导航项 ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "home",      path: "/",              icon: Home,      labelZh: "首页",   labelEn: "Home",      color: "#10b981", colorRgb: "16,185,129"  },
  { key: "learn",     path: "/learning-path", icon: Compass,   labelZh: "学习",   labelEn: "Learn",     color: "#06b6d4", colorRgb: "6,182,212"   },
  { key: "exchanges", path: "/exchanges",      icon: Building2, labelZh: "交易所", labelEn: "Exchanges", color: "#3b82f6", colorRgb: "59,130,246"  },
  { key: "guide",     path: "/exchange-guide", icon: BookOpen,  labelZh: "指南",   labelEn: "Guide",     color: "#f59e0b", colorRgb: "245,158,11"  },
  { key: "contact",   path: "/contact",        icon: Mail,      labelZh: "联系",   labelEn: "Contact",   color: "#a855f7", colorRgb: "168,85,247"  },
] as const;

const BALL_SIZE = 56;
const BOTTOM_OFFSET = 28;

export default function DesktopFloatNav() {
  const [location, navigate] = useLocation();
  const { language } = useLanguage();
  const zh = language === "zh";

  const [expanded, setExpanded] = useState(false);
  const [learningMenuOpen, setLearningMenuOpen] = useState(false);
  const [hasLearningPath, setHasLearningPath] = useState(false);
  const [learningIncomplete, setLearningIncomplete] = useState(false);
  const [pathSteps, setPathSteps] = useState<{ id: string; icon: string; title: string; path: string }[]>([]);
  const [pathCompleted, setPathCompleted] = useState<string[]>([]);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // ── 读取学习路径数据 ─────────────────────────────────────────────────────
  useEffect(() => {
    const checkPath = () => {
      try {
        const raw = localStorage.getItem("web3_learning_path");
        if (raw) {
          const data = JSON.parse(raw);
          setHasLearningPath(true);
          setPathSteps(Array.isArray(data.steps) ? data.steps : []);
          setPathCompleted(Array.isArray(data.completedSteps) ? data.completedSteps : []);
          setLearningIncomplete(
            Array.isArray(data.steps) &&
            Array.isArray(data.completedSteps) &&
            data.completedSteps.length < data.steps.length
          );
        } else {
          setHasLearningPath(false);
          setPathSteps([]);
          setPathCompleted([]);
          setLearningIncomplete(false);
        }
      } catch {
        setHasLearningPath(false);
      }
    };
    checkPath();
    window.addEventListener("storage", checkPath);
    const interval = setInterval(checkPath, 2000);
    return () => {
      window.removeEventListener("storage", checkPath);
      clearInterval(interval);
    };
  }, []);

  // ── 点击外部关闭 ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!expanded) return;
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setLearningMenuOpen(false);
      }
    };
    const t = setTimeout(() => document.addEventListener("mousedown", onOutside), 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onOutside);
    };
  }, [expanded]);

  const isActive = useCallback((path: string) => {
    if (path === "/") return location === "/" || location === "/portal";
    if (path === "/learning-path") {
      return location === "/learning-path" ||
        location === "/web3-quiz" ||
        location === "/learning-complete";
    }
    return location.startsWith(path);
  }, [location]);

  const activeItem = NAV_ITEMS.find(item => isActive(item.path)) ?? NAV_ITEMS[0];

  const handleNavClick = useCallback((path: string, key: string) => {
    if (key === "learn" && hasLearningPath) {
      setLearningMenuOpen(prev => !prev);
      return;
    }
    navigate(path);
    setExpanded(false);
    setLearningMenuOpen(false);
  }, [hasLearningPath, navigate]);

  const handleLearningStepClick = useCallback((stepPath: string) => {
    navigate(stepPath);
    setLearningMenuOpen(false);
    setExpanded(false);
  }, [navigate]);

  const nextStepIndex = pathSteps.findIndex(s => !pathCompleted.includes(s.id));
  const allDone = pathSteps.length > 0 && pathCompleted.length >= pathSteps.length;
  const progress = pathSteps.length > 0 ? Math.round((pathCompleted.length / pathSteps.length) * 100) : 0;

  return (
    // 仅在 md 及以上显示，始终挂载保证稳定性
    <div
      className="hidden md:block"
      style={{ position: "fixed", bottom: BOTTOM_OFFSET, left: "50%", transform: "translateX(-50%)", zIndex: 9990 }}
      ref={containerRef}
    >
      {/* ── 展开的导航菜单（向上弹出） ──────────────────────────────────────── */}
      {expanded && (
        <div
          style={{
            position: "absolute",
            bottom: BALL_SIZE + 12,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            animation: "desktopNavUp 0.22s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {/* 学习路径子菜单（向上展开） */}
          {learningMenuOpen && hasLearningPath && pathSteps.length > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                marginBottom: 8,
                width: 280,
                maxHeight: "55vh",
                overflowY: "auto",
                borderRadius: 16,
                background: "rgba(10,15,28,0.97)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(6,182,212,0.25)",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
                animation: "desktopNavUp 0.18s cubic-bezier(0.22,1,0.36,1) both",
              }}
            >
              {/* 标题 + 进度 */}
              <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {zh ? "学习路径" : "Learning Path"}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{progress}%</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#06b6d4,#8b5cf6)", borderRadius: 2, transition: "width 0.5s ease" }} />
                </div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  {allDone
                    ? (zh ? "🎉 全部完成！" : "🎉 All done!")
                    : zh ? `${pathCompleted.length}/${pathSteps.length} 步骤已完成` : `${pathCompleted.length}/${pathSteps.length} steps done`
                  }
                </p>
              </div>

              {/* 步骤列表 */}
              <div style={{ padding: "6px 0" }}>
                {pathSteps.map((step, index) => {
                  const done = pathCompleted.includes(step.id);
                  const isNext = nextStepIndex === index;
                  const isCurrent = location.split("?")[0] === step.path || location.split("?")[0].startsWith(step.path + "/");
                  return (
                    <button
                      key={step.id}
                      onClick={() => handleLearningStepClick(step.path)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 16px",
                        background: isCurrent ? "rgba(6,182,212,0.1)" : "transparent",
                        borderLeft: `3px solid ${isCurrent ? "#06b6d4" : "transparent"}`,
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={e => { if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                      onMouseLeave={e => { if (!isCurrent) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      <span style={{ flexShrink: 0 }}>
                        {done ? (
                          <CheckCircle2 size={15} color="#4ade80" />
                        ) : isNext ? (
                          <div style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid #06b6d4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#06b6d4" }} />
                          </div>
                        ) : (
                          <Circle size={15} color="rgba(255,255,255,0.18)" />
                        )}
                      </span>
                      <span style={{ fontSize: 15, flexShrink: 0 }}>{step.icon}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: done ? "rgba(255,255,255,0.35)" : isCurrent ? "#06b6d4" : "rgba(255,255,255,0.82)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {step.title}
                      </span>
                      {isNext && !done && (
                        <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, color: "#06b6d4", background: "rgba(6,182,212,0.12)", padding: "2px 6px", borderRadius: 20 }}>
                          {zh ? "下一步" : "Next"}
                        </span>
                      )}
                      {!done && !isNext && (
                        <ChevronRight size={12} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 全部完成时的总结按钮 */}
              {allDone && (
                <div style={{ padding: "8px 12px 12px" }}>
                  <button
                    onClick={() => { navigate("/learning-complete"); setLearningMenuOpen(false); setExpanded(false); }}
                    style={{ width: "100%", padding: "8px", borderRadius: 10, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    {zh ? "🎓 查看完成总结 →" : "🎓 View Summary →"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 导航项列表（从下到上排列） */}
          {[...NAV_ITEMS].reverse().map((item, revIdx) => {
            const idx = NAV_ITEMS.length - 1 - revIdx;
            const active = isActive(item.path);
            const Icon = item.icon;
            const label = zh ? item.labelZh : item.labelEn;
            const showDot = item.key === "learn" && learningIncomplete && !active;
            const isHovered = hoveredKey === item.key;
            const isLearnOpen = item.key === "learn" && learningMenuOpen;

            return (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  animation: `desktopNavUp 0.22s cubic-bezier(0.22,1,0.36,1) ${idx * 0.04}s both`,
                }}
              >
                {/* 悬停文字标签（左侧） */}
                {(isHovered || active) && (
                  <div
                    style={{
                      padding: "5px 10px",
                      borderRadius: 10,
                      background: "rgba(10,15,28,0.95)",
                      border: `1px solid rgba(${item.colorRgb},0.3)`,
                      color: item.color,
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      boxShadow: `0 4px 16px rgba(0,0,0,0.4)`,
                      backdropFilter: "blur(12px)",
                      animation: "fadeInLeft 0.15s ease",
                    }}
                  >
                    {label}
                    {item.key === "learn" && hasLearningPath && (
                      <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.6 }}>
                        {allDone ? "✓" : `${pathCompleted.length}/${pathSteps.length}`}
                      </span>
                    )}
                  </div>
                )}

                {/* 导航按钮 */}
                <button
                  onClick={() => handleNavClick(item.path, item.key)}
                  onMouseEnter={() => setHoveredKey(item.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  style={{
                    position: "relative",
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: active || isLearnOpen
                      ? `rgba(${item.colorRgb},0.2)`
                      : isHovered
                        ? `rgba(${item.colorRgb},0.1)`
                        : "rgba(10,15,28,0.85)",
                    border: `1.5px solid rgba(${item.colorRgb},${active || isLearnOpen ? 0.5 : isHovered ? 0.3 : 0.15})`,
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    boxShadow: active || isLearnOpen
                      ? `0 0 0 2px rgba(${item.colorRgb},0.15), 0 4px 16px rgba(${item.colorRgb},0.25)`
                      : `0 2px 8px rgba(0,0,0,0.3)`,
                    cursor: "pointer",
                    outline: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Icon
                    size={19}
                    color={active || isLearnOpen ? item.color : isHovered ? item.color : "rgba(255,255,255,0.5)"}
                    strokeWidth={active || isLearnOpen ? 2.2 : 1.8}
                    style={{
                      filter: (active || isLearnOpen) ? `drop-shadow(0 0 4px ${item.color}80)` : "none",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  />
                  {/* 未读小点 */}
                  {showDot && (
                    <span style={{
                      position: "absolute", top: -1, right: -1,
                      width: 9, height: 9, borderRadius: "50%",
                      background: "#06b6d4",
                      boxShadow: "0 0 6px rgba(6,182,212,0.8)",
                    }} />
                  )}
                  {/* 活跃指示条（底部） */}
                  {active && (
                    <div style={{
                      position: "absolute", bottom: -1, left: "50%", transform: "translateX(-50%)",
                      width: 16, height: 2, borderRadius: 2,
                      background: item.color,
                      boxShadow: `0 0 6px ${item.color}`,
                    }} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 主球体（底部居中） ──────────────────────────────────────────────── */}
      <button
        onClick={() => {
          setExpanded(prev => !prev);
          if (expanded) setLearningMenuOpen(false);
        }}
        style={{
          position: "relative",
          width: BALL_SIZE,
          height: BALL_SIZE,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: expanded
            ? `rgba(${activeItem.colorRgb},0.18)`
            : "rgba(10,15,28,0.85)",
          border: `1.5px solid rgba(${activeItem.colorRgb},${expanded ? 0.5 : 0.28})`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: expanded
            ? `0 0 0 3px rgba(${activeItem.colorRgb},0.12), 0 8px 32px rgba(${activeItem.colorRgb},0.28), 0 4px 16px rgba(0,0,0,0.4)`
            : `0 0 0 1px rgba(${activeItem.colorRgb},0.1), 0 4px 20px rgba(0,0,0,0.4), 0 0 16px rgba(${activeItem.colorRgb},0.1)`,
          cursor: "pointer",
          outline: "none",
          transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* 当前页面图标 */}
        {(() => {
          const Icon = activeItem.icon;
          return (
            <Icon
              size={24}
              color={activeItem.color}
              strokeWidth={2}
              style={{
                filter: `drop-shadow(0 0 5px ${activeItem.color}80)`,
                transition: "all 0.3s ease",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                flexShrink: 0,
              }}
            />
          );
        })()}

        {/* 学习路径未完成小点 */}
        {learningIncomplete && !isActive("/learning-path") && (
          <span style={{
            position: "absolute", top: 2, right: 2,
            width: 10, height: 10, borderRadius: "50%",
            background: "#06b6d4",
            boxShadow: "0 0 8px rgba(6,182,212,0.8)",
          }} />
        )}

        {/* 展开/收起箭头指示 */}
        <div style={{
          position: "absolute",
          top: -10,
          left: "50%",
          transform: `translateX(-50%) ${expanded ? "rotate(180deg)" : "rotate(0deg)"}`,
          transition: "transform 0.25s ease",
          color: "rgba(255,255,255,0.3)",
          lineHeight: 1,
        }}>
          <ChevronUp size={12} color={expanded ? activeItem.color : "rgba(255,255,255,0.3)"} />
        </div>
      </button>

      {/* 动画样式 */}
      <style>{`
        @keyframes desktopNavUp {
          from { opacity: 0; transform: translateY(12px) scale(0.85); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
