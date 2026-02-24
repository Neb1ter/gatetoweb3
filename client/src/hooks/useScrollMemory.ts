import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * useScrollMemory
 *
 * 在当前页面离开前将滚动位置存入 sessionStorage，
 * 返回该页面时自动恢复到离开时的位置，保持阅读连续性。
 *
 * 用法：在页面组件顶层调用 useScrollMemory()
 */
export function useScrollMemory() {
  const [location] = useLocation();
  const key = `scroll:${location}`;

  // 页面加载时恢复滚动位置
  useEffect(() => {
    const saved = sessionStorage.getItem(key);
    if (saved !== null) {
      const y = parseInt(saved, 10);
      // 延迟一帧，确保页面内容已渲染
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "instant" });
      });
    } else {
      // 首次进入页面时滚动到顶部
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    // 离开前记录当前滚动位置
    const handleBeforeUnload = () => {
      sessionStorage.setItem(key, String(window.scrollY));
    };

    // 监听页面滚动，实时更新（防止 SPA 路由跳转时来不及记录）
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          sessionStorage.setItem(key, String(window.scrollY));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // 组件卸载时（路由跳转）保存当前位置
      sessionStorage.setItem(key, String(window.scrollY));
    };
  }, [key]);
}

/**
 * goBack
 *
 * 返回上一页。使用 history.back() 触发浏览器原生返回，
 * 配合 useScrollMemory 可恢复上一页的滚动位置。
 */
export function goBack() {
  window.history.back();
}
