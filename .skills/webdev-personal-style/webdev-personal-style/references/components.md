# 通用组件实现示例

## 1. 进度环回顶按钮（ScrollToTopButton）

```tsx
// 核心逻辑：监听滚动，计算进度百分比，渲染 SVG 进度环
const [visible, setVisible] = useState(false);
const [progress, setProgress] = useState(0);

useEffect(() => {
  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0);
    setVisible(scrollTop > 300);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);

// SVG 进度环
const radius = 20;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = circumference - (progress / 100) * circumference;

// 泛光效果（颜色跟随主题）
// yellow: drop-shadow(0 0 8px rgba(234,179,8,0.8))
// blue:   drop-shadow(0 0 8px rgba(59,130,246,0.8))
// emerald: drop-shadow(0 0 8px rgba(52,211,153,0.8))
```

---

## 2. 可拖拽浮动章节菜单（FloatChapterMenu）

```tsx
// 拖拽状态
const [pos, setPos] = useState({ x: 16, y: 24 }); // bottom-6 left-4
const dragging = useRef(false);
const dragOffset = useRef({ x: 0, y: 0 });

// 鼠标拖拽
const onMouseDown = (e: React.MouseEvent) => {
  dragging.current = true;
  dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
};
// 触控拖拽
const onTouchStart = (e: React.TouchEvent) => {
  dragging.current = true;
  dragOffset.current = {
    x: e.touches[0].clientX - pos.x,
    y: e.touches[0].clientY - pos.y
  };
};

// 位置样式（fixed，从左下角计算）
style={{ position: 'fixed', left: pos.x, bottom: pos.y, zIndex: 50 }}

// 展开面板：backdrop-blur-md + 主题色边框
```

---

## 3. 移动端顶部导航栏章节标题动画

```css
/* index.css */
@keyframes slideInFromBottom {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-slide-in-from-bottom {
  animation: slideInFromBottom 0.25s ease-out forwards;
}
```

```tsx
// 顶部导航栏结构
<header className="sticky top-0 z-40 backdrop-blur-md border-b">
  <div className="flex items-center gap-3 px-4 py-3">
    {/* 返回主页 */}
    <Link to="/portal" className="flex items-center gap-1 text-sm">
      <ChevronLeft className="w-4 h-4" />
      <span className="hidden sm:inline">返回主页</span>
    </Link>
    {/* 移动端章节标题（桌面端隐藏） */}
    <span
      key={activeChapter}  // key 变化触发动画重新执行
      className="sm:hidden text-sm font-medium animate-slide-in-from-bottom truncate"
    >
      {chapters.find(c => c.id === activeChapter)?.title}
    </span>
    {/* 桌面端页面标题（移动端隐藏） */}
    <span className="hidden sm:block text-sm font-medium">{pageTitle}</span>
  </div>
</header>
```

---

## 4. 跨页面跳转提示卡片

```tsx
// 在内容页底部引导用户跳转到相关页面
<div className="mt-8 p-4 rounded-2xl border border-blue-500/30 bg-blue-500/10">
  <p className="text-sm text-blue-300 mb-2">💡 不了解这些交易所？</p>
  <p className="text-xs text-gray-400 mb-3">
    前往交易所中心，查看详细介绍、功能对比和安全背书
  </p>
  <Link to="/exchanges" className="text-xs text-blue-400 hover:text-blue-300 underline">
    前往交易所中心 →
  </Link>
</div>
```
