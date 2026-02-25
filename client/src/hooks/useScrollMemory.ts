import { useEffect } from "react";
import { useLocation } from "wouter";

// ============================================================
// 滚动位置记忆系统
//
// 架构说明：
//   - PageTransition（App.tsx）负责在路由切换时：
//       1. 保存「离开页面」的滚动位置
//       2. 新页面渲染后，检查 sessionStorage 决定恢复或滚顶
//   - useScrollMemory Hook 负责：
//       实时将当前页面的滚动位置写入 sessionStorage（节流）
//       使得 PageTransition 在切换时能读到最新位置
//
// 使用方式：在需要记忆滚动位置的页面组件顶层调用 useScrollMemory()
// ============================================================

const SCROLL_PREFIX = "scroll:";

/** 获取某个路径对应的 sessionStorage key */
export function scrollKey(path: string) {
  return `${SCROLL_PREFIX}${path}`;
}

/** 保存指定路径的滚动位置 */
export function saveScrollPosition(path: string, y?: number) {
  const pos = y !== undefined ? y : window.scrollY;
  sessionStorage.setItem(scrollKey(path), String(Math.round(pos)));
}

/** 读取指定路径的滚动位置，不存在则返回 null */
export function getScrollPosition(path: string): number | null {
  const val = sessionStorage.getItem(scrollKey(path));
  if (val === null) return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

/**
 * useScrollMemory
 *
 * 在当前页面实时记录滚动位置到 sessionStorage。
 * 配合 PageTransition（App.tsx）使用，实现返回时恢复阅读位置。
 */
export function useScrollMemory() {
  const [location] = useLocation();

  useEffect(() => {
    // 实时记录滚动位置（requestAnimationFrame 节流，避免频繁写入）
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          saveScrollPosition(location);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      // 组件卸载时（路由跳转）立即保存当前位置，确保最新值
      saveScrollPosition(location);
    };
  }, [location]);
}

/**
 * goBack
 *
 * 返回上一页（浏览器原生 history.back）。
 * 配合 useScrollMemory + PageTransition，返回时自动恢复上一页的阅读位置。
 */
export function goBack() {
  window.history.back();
}
