/**
 * MobileFloatNav — 移动端磁性悬浮导航球
 *
 * 设计原则：
 * - 默认位置：屏幕底部居中（bottom:24px, 水平居中）
 * - 阻尼非线性运动：贴边时速度越来越慢（easeOut 曲线）
 * - 惯性甩动：松手后速度衰减，磁吸最近边缘
 * - 两球永不重叠：磁斥物理效果
 * - 向下滑动 或 点击页面任意处 → 收缩为小球
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Home, Building2, BookOpen, Mail } from "lucide-react";

// ─── 导航项（未来增加只需在此追加）────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "home",      path: "/",              icon: Home,      labelZh: "首页",   labelEn: "Home",      color: "#10b981", colorRgb: "16,185,129" },
  { key: "exchanges", path: "/exchanges",      icon: Building2, labelZh: "交易所", labelEn: "Exchanges", color: "#3b82f6", colorRgb: "59,130,246" },
  { key: "guide",     path: "/exchange-guide", icon: BookOpen,  labelZh: "指南",   labelEn: "Guide",     color: "#f59e0b", colorRgb: "245,158,11" },
  { key: "contact",   path: "/contact",        icon: Mail,      labelZh: "联系",   labelEn: "Contact",   color: "#a855f7", colorRgb: "168,85,247" },
] as const;

type Edge = "left" | "right" | "top" | "bottom";

// ─── 常量 ────────────────────────────────────────────────────────────────────
const BALL_SIZE        = 52;
const MARGIN           = 24;
const GAP              = 12;
const MIN_DIST         = BALL_SIZE + GAP;
const SCROLL_THRESHOLD = 300;
const TRANSITION_MS    = 320;

// 阻尼参数：惯性衰减（每帧乘以此值）
const FRICTION_BASE    = 0.88;   // 基础摩擦系数
const MIN_SPEED        = 0.3;    // 低于此速度停止惯性
const VELOCITY_FRAMES  = 6;

// ─── 工具函数 ────────────────────────────────────────────────────────────────
function scrollBtnCenter(vw: number, vh: number) {
  return { cx: vw - MARGIN - BALL_SIZE / 2, cy: vh - MARGIN - BALL_SIZE / 2 };
}

function repelOffset(ax: number, ay: number, bcx: number, bcy: number) {
  const cx = ax + BALL_SIZE / 2;
  const cy = ay + BALL_SIZE / 2;
  const dx = cx - bcx;
  const dy = cy - bcy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist >= MIN_DIST || dist === 0) return { ox: 0, oy: 0 };
  const push = MIN_DIST - dist;
  return { ox: (dx / dist) * push * 1.6, oy: (dy / dist) * push * 1.6 };
}

function nearestEdge(x: number, y: number, vw: number, vh: number): Edge {
  const d = { left: x, right: vw - x - BALL_SIZE, top: y, bottom: vh - y - BALL_SIZE };
  return (Object.keys(d) as Edge[]).reduce((a, b) => d[a] <= d[b] ? a : b);
}

/** 阻尼贴边：距离越近速度越慢（easeOut 效果） */
function dampedSnap(current: number, target: number, friction: number): number {
  const delta = target - current;
  const absDelta = Math.abs(delta);
  // 非线性：距离越小，步进越小
  const step = delta * (1 - Math.pow(friction, 1 + absDelta / 80));
  return current + step;
}

function snapPos(x: number, y: number, edge: Edge, vw: number, vh: number, avoidBtn?: { cx: number; cy: number }) {
  const clampY = (v: number) => Math.max(MARGIN, Math.min(v, vh - BALL_SIZE - MARGIN));
  const clampX = (v: number) => Math.max(MARGIN, Math.min(v, vw - BALL_SIZE - MARGIN));
  let sx: number, sy: number;
  switch (edge) {
    case "left":   sx = MARGIN;                    sy = clampY(y); break;
    case "right":  sx = vw - BALL_SIZE - MARGIN;   sy = clampY(y); break;
    case "top":    sx = clampX(x);                 sy = MARGIN;    break;
    case "bottom": sx = clampX(x);                 sy = vh - BALL_SIZE - MARGIN; break;
  }
  if (avoidBtn) {
    const { ox, oy } = repelOffset(sx, sy, avoidBtn.cx, avoidBtn.cy);
    if (ox !== 0 || oy !== 0) {
      sx = Math.max(0, Math.min(sx + ox, vw - BALL_SIZE));
      sy = Math.max(0, Math.min(sy + oy, vh - BALL_SIZE));
    }
  }
  return { x: sx, y: sy };
}

/** 默认位置：底部居中 */
function defaultPos(vw: number, vh: number) {
  return {
    x: Math.round((vw - BALL_SIZE) / 2),
    y: vh - BALL_SIZE - MARGIN,
  };
}

// ─── 组件 ────────────────────────────────────────────────────────────────────
export default function MobileFloatNav() {
  const [location, navigate] = useLocation();
  const { language } = useLanguage();
  const zh = language === "zh";

  const [expanded,     setExpanded]     = useState(true);
  const [animating,    setAnimating]    = useState(false);
  const [edge,         setEdge]         = useState<Edge>("bottom");
  const [inited,       setInited]       = useState(false);
  const [scrollBtnVis, setScrollBtnVis] = useState(false);
  const [repelling,    setRepelling]    = useState(false);

  const posRef      = useRef({ x: 0, y: 0 });
  const ballRef     = useRef<HTMLDivElement>(null);

  const dragging    = useRef(false);
  const hasMoved    = useRef(false);
  const dragStart   = useRef({ px: 0, py: 0, bx: 0, by: 0 });
  const velHistory  = useRef<{ vx: number; vy: number; t: number }[]>([]);
  const rafId       = useRef<number | null>(null);
  const pendingPos  = useRef({ x: 0, y: 0 });
  const userDragged = useRef(false);
  const lastScrollY = useRef(0);
  const repelTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inertiaRaf  = useRef<number | null>(null);
  const scrollBtnVisRef = useRef(false);

  const isActive = (path: string) => {
    if (path === "/") return location === "/" || location === "/portal";
    return location.startsWith(path);
  };
  const activeItem = NAV_ITEMS.find(item => isActive(item.path)) ?? NAV_ITEMS[0];

  // ── DOM 位置更新 ─────────────────────────────────────────────────────────
  const applyPos = useCallback((x: number, y: number) => {
    posRef.current = { x, y };
    if (ballRef.current) {
      ballRef.current.style.left = `${x}px`;
      ballRef.current.style.top  = `${y}px`;
    }
  }, []);

  // ── 初始化 ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (inited) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pos = defaultPos(vw, vh);
    applyPos(pos.x, pos.y);
    setInited(true);
  }, [inited, applyPos]);

  // ── 监听滚动 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const cur = window.scrollY;
      const delta = cur - lastScrollY.current;
      if (delta > 8 && expanded) triggerCollapse();
      const vis = cur > SCROLL_THRESHOLD;
      if (vis !== scrollBtnVisRef.current) {
        scrollBtnVisRef.current = vis;
        setScrollBtnVis(vis);
      }
      lastScrollY.current = cur;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [expanded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 回顶按钮出现/消失时，若用户未手动拖拽则不自动移动（默认居中不受影响）
  useEffect(() => {
    if (!inited || userDragged.current) return;
    // 只在 right 边时需要避让
    if (edge !== "right") return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const { cx: bcx, cy: bcy } = scrollBtnCenter(vw, vh);
    const { ox, oy } = repelOffset(posRef.current.x, posRef.current.y, bcx, bcy);
    if (ox !== 0 || oy !== 0) {
      if (ballRef.current) {
        ballRef.current.style.transition = "left 0.4s ease, top 0.4s ease";
      }
      applyPos(
        Math.max(0, Math.min(posRef.current.x + ox, vw - BALL_SIZE)),
        Math.max(0, Math.min(posRef.current.y + oy, vh - BALL_SIZE))
      );
      setTimeout(() => { if (ballRef.current) ballRef.current.style.transition = ""; }, 450);
    }
  }, [scrollBtnVis, inited, edge, applyPos]);

  // ── 展开/收缩 ────────────────────────────────────────────────────────────
  const triggerCollapse = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setExpanded(false);
    setTimeout(() => setAnimating(false), TRANSITION_MS);
  }, [animating]);

  const triggerExpand = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setExpanded(true);
    setTimeout(() => setAnimating(false), TRANSITION_MS);
  }, [animating]);

  // ── 点击页面任意处收缩 ───────────────────────────────────────────────────
  useEffect(() => {
    if (!expanded) return;
    const onDocClick = (e: MouseEvent | TouchEvent) => {
      if ((e.target as Element).closest("[data-float-nav]")) return;
      triggerCollapse();
    };
    const t = setTimeout(() => {
      document.addEventListener("click", onDocClick, { passive: true });
      document.addEventListener("touchend", onDocClick as EventListener, { passive: true });
    }, 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("touchend", onDocClick as EventListener);
    };
  }, [expanded, triggerCollapse]);

  // ── 磁斥触发 ─────────────────────────────────────────────────────────────
  const triggerRepel = useCallback(() => {
    setRepelling(true);
    if (repelTimer.current) clearTimeout(repelTimer.current);
    repelTimer.current = setTimeout(() => setRepelling(false), 500);
  }, []);

  // ── 阻尼贴边动画（非线性，贴边时越来越慢）────────────────────────────────
  const animateToTarget = useCallback((tx: number, ty: number, onDone?: () => void) => {
    if (inertiaRaf.current) cancelAnimationFrame(inertiaRaf.current);
    const step = () => {
      const cx = posRef.current.x;
      const cy = posRef.current.y;
      const nx = dampedSnap(cx, tx, FRICTION_BASE);
      const ny = dampedSnap(cy, ty, FRICTION_BASE);
      applyPos(nx, ny);
      const dx = Math.abs(nx - tx);
      const dy = Math.abs(ny - ty);
      if (dx < 0.5 && dy < 0.5) {
        applyPos(tx, ty);
        onDone?.();
        return;
      }
      inertiaRaf.current = requestAnimationFrame(step);
    };
    inertiaRaf.current = requestAnimationFrame(step);
  }, [applyPos]);

  // ── 惯性运动（甩动后衰减 + 阻尼贴边）────────────────────────────────────
  const startInertia = useCallback((vx: number, vy: number) => {
    if (inertiaRaf.current) cancelAnimationFrame(inertiaRaf.current);
    let cvx = vx, cvy = vy;

    const step = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // 速度衰减（非线性：速度越大衰减越快）
      const speed = Math.sqrt(cvx * cvx + cvy * cvy);
      const friction = FRICTION_BASE + (1 - FRICTION_BASE) * Math.min(speed / 30, 1) * 0.3;
      cvx *= friction;
      cvy *= friction;

      if (Math.sqrt(cvx * cvx + cvy * cvy) < MIN_SPEED) {
        // 惯性结束 → 阻尼贴边
        const e = nearestEdge(posRef.current.x, posRef.current.y, vw, vh);
        const { cx: bcx, cy: bcy } = scrollBtnCenter(vw, vh);
        const snapped = snapPos(
          posRef.current.x, posRef.current.y,
          e, vw, vh,
          scrollBtnVisRef.current ? { cx: bcx, cy: bcy } : undefined
        );
        setEdge(e);
        animateToTarget(snapped.x, snapped.y);
        return;
      }

      let nx = posRef.current.x + cvx;
      let ny = posRef.current.y + cvy;

      // 边界弹射（减弱）
      if (nx < 0)              { nx = 0;              cvx = Math.abs(cvx) * 0.3; }
      if (nx > vw - BALL_SIZE) { nx = vw - BALL_SIZE; cvx = -Math.abs(cvx) * 0.3; }
      if (ny < 0)              { ny = 0;              cvy = Math.abs(cvy) * 0.3; }
      if (ny > vh - BALL_SIZE) { ny = vh - BALL_SIZE; cvy = -Math.abs(cvy) * 0.3; }

      // 磁斥
      const { cx: bcx, cy: bcy } = scrollBtnCenter(vw, vh);
      if (scrollBtnVisRef.current) {
        const { ox, oy } = repelOffset(nx, ny, bcx, bcy);
        if (ox !== 0 || oy !== 0) {
          triggerRepel();
          nx = Math.max(0, Math.min(nx + ox, vw - BALL_SIZE));
          ny = Math.max(0, Math.min(ny + oy, vh - BALL_SIZE));
        }
      }

      applyPos(nx, ny);
      inertiaRaf.current = requestAnimationFrame(step);
    };

    inertiaRaf.current = requestAnimationFrame(step);
  }, [applyPos, triggerRepel, animateToTarget]);

  // ── Pointer Events 拖拽 ──────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    if (inertiaRaf.current) cancelAnimationFrame(inertiaRaf.current);
    dragging.current = true;
    hasMoved.current = false;
    velHistory.current = [];
    dragStart.current = { px: e.clientX, py: e.clientY, bx: posRef.current.x, by: posRef.current.y };
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    e.preventDefault();
    e.stopPropagation();

    const dx = e.clientX - dragStart.current.px;
    const dy = e.clientY - dragStart.current.py;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let nx = Math.max(0, Math.min(dragStart.current.bx + dx, vw - BALL_SIZE));
    let ny = Math.max(0, Math.min(dragStart.current.by + dy, vh - BALL_SIZE));

    // 磁斥
    const { cx: bcx, cy: bcy } = scrollBtnCenter(vw, vh);
    if (scrollBtnVisRef.current) {
      const { ox, oy } = repelOffset(nx, ny, bcx, bcy);
      if (ox !== 0 || oy !== 0) {
        triggerRepel();
        nx = Math.max(0, Math.min(nx + ox, vw - BALL_SIZE));
        ny = Math.max(0, Math.min(ny + oy, vh - BALL_SIZE));
      }
    }

    const now = performance.now();
    velHistory.current.push({ vx: nx - posRef.current.x, vy: ny - posRef.current.y, t: now });
    if (velHistory.current.length > VELOCITY_FRAMES) velHistory.current.shift();

    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    pendingPos.current = { x: nx, y: ny };
    rafId.current = requestAnimationFrame(() => {
      applyPos(pendingPos.current.x, pendingPos.current.y);
      rafId.current = null;
    });
  }, [applyPos, triggerRepel]);

  const onPointerUp = useCallback((_e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.overflow = "";
    document.body.style.touchAction = "";

    if (!hasMoved.current) return;
    userDragged.current = true;

    const hist = velHistory.current;
    let avgVx = 0, avgVy = 0;
    if (hist.length > 0) {
      avgVx = hist.reduce((s, h) => s + h.vx, 0) / hist.length;
      avgVy = hist.reduce((s, h) => s + h.vy, 0) / hist.length;
    }

    const speed = Math.sqrt(avgVx * avgVx + avgVy * avgVy);
    if (speed > 1.5) {
      // 有速度 → 惯性（乘以 2.5，比之前的 3 小，减弱惯性）
      startInertia(avgVx * 2.5, avgVy * 2.5);
    } else {
      // 速度不足 → 阻尼贴边
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const e = nearestEdge(posRef.current.x, posRef.current.y, vw, vh);
      const { cx: bcx, cy: bcy } = scrollBtnCenter(vw, vh);
      const snapped = snapPos(
        posRef.current.x, posRef.current.y,
        e, vw, vh,
        scrollBtnVisRef.current ? { cx: bcx, cy: bcy } : undefined
      );
      setEdge(e);
      animateToTarget(snapped.x, snapped.y);
    }
  }, [startInertia, animateToTarget]);

  const isVertical = edge === "left" || edge === "right";

  // ── 展开 Tab 栏定位 ──────────────────────────────────────────────────────
  const expandedStyle: React.CSSProperties = (() => {
    const base: React.CSSProperties = { position: "fixed", zIndex: 9998 };
    switch (edge) {
      case "bottom": return { ...base, bottom: MARGIN, left: "50%", transform: "translateX(-50%)" };
      case "top":    return { ...base, top: MARGIN,    left: "50%", transform: "translateX(-50%)" };
      case "left":   return { ...base, left: MARGIN,   top: "50%",  transform: "translateY(-50%)" };
      case "right":  return { ...base, right: MARGIN,  top: "50%",  transform: "translateY(-50%)" };
    }
  })();

  // ── 渲染：小球 ───────────────────────────────────────────────────────────
  const renderBall = () => {
    const r = activeItem.colorRgb;
    const c = activeItem.color;
    return (
      <div
        ref={ballRef}
        style={{
          position: "fixed",
          zIndex: 9998,
          left: posRef.current.x,
          top: posRef.current.y,
          transition: "none",
          animation: repelling ? "repel-shake 0.45s cubic-bezier(0.36,0.07,0.19,0.97)" : "none",
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => { if (!hasMoved.current) triggerExpand(); }}
        data-float-nav
      >
        <div
          style={{
            width: BALL_SIZE,
            height: BALL_SIZE,
            borderRadius: "50%",
            background: `rgba(${r}, 0.12)`,
            border: `1px solid rgba(${r}, 0.35)`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            cursor: "grab",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
            outline: "none",
            boxShadow: repelling
              ? `0 0 0 4px rgba(${r},0.35), 0 0 18px 6px rgba(${r},0.4), 0 2px 8px rgba(0,0,0,0.3)`
              : `0 0 0 2px rgba(${r},0.18), 0 0 10px 2px rgba(${r},0.18), 0 2px 8px rgba(0,0,0,0.3)`,
            transition: `box-shadow 0.2s ease, transform ${TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1), opacity ${TRANSITION_MS}ms ease`,
            opacity: expanded ? 0 : 1,
            transform: expanded ? "scale(0.3)" : "scale(1)",
          }}
          onTouchStart={e => { e.currentTarget.style.transform = "scale(0.9)"; }}
          onTouchEnd={e => { e.currentTarget.style.transform = expanded ? "scale(0.3)" : "scale(1)"; }}
        >
          {(() => {
            const Icon = activeItem.icon;
            return <Icon size={20} color={c} strokeWidth={2} style={{ flexShrink: 0, pointerEvents: "none" }} />;
          })()}
        </div>
      </div>
    );
  };

  // ── 渲染：展开 Tab 栏 ────────────────────────────────────────────────────
  const renderTabBar = () => {
    const transformOrigin = (() => {
      switch (edge) {
        case "bottom": return "bottom center";
        case "top":    return "top center";
        case "left":   return "center left";
        case "right":  return "center right";
      }
    })();

    return (
      <div style={expandedStyle} data-float-nav>
        <div
          style={{
            display: "flex",
            flexDirection: isVertical ? "column" : "row",
            alignItems: "center",
            gap: isVertical ? "4px" : "2px",
            padding: isVertical ? "10px 8px" : "8px 10px",
            background: "rgba(10, 15, 28, 0.72)",
            backdropFilter: "blur(20px) saturate(1.5)",
            WebkitBackdropFilter: "blur(20px) saturate(1.5)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: isVertical ? "22px" : "38px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)",
            transition: `all ${TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1)`,
            opacity: expanded ? 1 : 0,
            transform: expanded ? "scale(1)" : "scale(0.3)",
            transformOrigin,
            pointerEvents: expanded ? "auto" : "none",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            const label = zh ? item.labelZh : item.labelEn;
            const r = item.colorRgb;
            return (
              <button
                key={item.key}
                onClick={() => { navigate(item.path); setTimeout(() => triggerCollapse(), 150); }}
                style={{
                  display: "flex",
                  flexDirection: isVertical ? "row" : "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isVertical ? "8px" : "3px",
                  padding: isVertical ? "8px 14px 8px 10px" : "6px 10px",
                  borderRadius: isVertical ? "14px" : "26px",
                  border: "none",
                  cursor: "pointer",
                  background: active ? `rgba(${r}, 0.18)` : "transparent",
                  boxShadow: active ? `inset 0 0 0 1px rgba(${r},0.3)` : "none",
                  transition: "background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease",
                  minWidth: isVertical ? "80px" : "44px",
                  outline: "none",
                  WebkitTapHighlightColor: "transparent",
                  position: "relative",
                }}
                onTouchStart={e => { e.currentTarget.style.transform = "scale(0.9)"; }}
                onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {active && (
                  <div style={{
                    position: "absolute",
                    ...(isVertical
                      ? { left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: "0 2px 2px 0" }
                      : { bottom: 1, left: "50%", transform: "translateX(-50%)", width: 18, height: 3, borderRadius: "2px 2px 0 0" }
                    ),
                    background: item.color,
                    boxShadow: `0 0 6px ${item.color}`,
                  }} />
                )}
                <Icon
                  size={isVertical ? 18 : 20}
                  color={active ? item.color : "rgba(255,255,255,0.5)"}
                  strokeWidth={active ? 2.2 : 1.8}
                  style={{ filter: active ? `drop-shadow(0 0 4px ${item.color}80)` : "none", transition: "color 0.2s ease, filter 0.2s ease", flexShrink: 0 }}
                />
                <span style={{
                  fontSize: isVertical ? "13px" : "10px",
                  fontWeight: active ? 700 : 500,
                  color: active ? item.color : "rgba(255,255,255,0.45)",
                  lineHeight: 1,
                  letterSpacing: "0.02em",
                  transition: "color 0.2s ease",
                  whiteSpace: "nowrap",
                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (!inited) return null;

  return (
    <>
      <style>{`
        @keyframes repel-shake {
          0%   { transform: translate(0,0) scale(1); }
          15%  { transform: translate(-4px,-3px) scale(1.06); }
          30%  { transform: translate(4px,3px) scale(0.95); }
          45%  { transform: translate(-2px,-1px) scale(1.03); }
          60%  { transform: translate(2px,1px) scale(0.98); }
          75%  { transform: translate(-1px,0) scale(1.01); }
          100% { transform: translate(0,0) scale(1); }
        }
      `}</style>
      <div className="md:hidden">
        {renderTabBar()}
        {!expanded && renderBall()}
      </div>
    </>
  );
}
