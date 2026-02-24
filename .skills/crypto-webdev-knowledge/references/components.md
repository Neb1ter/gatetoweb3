# 核心组件参考

## ScrollToTopButton 使用方式

```tsx
// 在主组件 return 最外层调用，颜色跟随页面主题
<ScrollToTopButton color="yellow" />  // /crypto-saving
<ScrollToTopButton color="blue" />    // /exchange-guide
<ScrollToTopButton color="emerald" /> // /web3-guide
```

## FloatChapterMenu 最小结构

```tsx
function FloatChapterMenu({ chapters, activeChapter, onSelect, theme }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 16, y: 24 }); // bottom-6 left-4 换算
  // ... 拖拽逻辑（mousedown/mousemove/mouseup + touchstart/touchmove/touchend）
  return (
    <div style={{ position: 'fixed', bottom: pos.y, left: pos.x, zIndex: 50 }}>
      {/* 触发按钮 */}
      <button onClick={() => setOpen(!open)}>
        {currentChapter.icon}
        <span>点此切换章节</span>
      </button>
      {/* 展开面板 */}
      {open && (
        <div className="backdrop-blur-md bg-black/70 rounded-2xl border ...">
          {chapters.map(ch => (
            <button key={ch.id} onClick={() => { onSelect(ch.id); setOpen(false); }}>
              {ch.icon} {ch.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 移动端章节标题动态显示

```tsx
// 顶部导航栏内（sm:hidden 仅移动端显示）
<div className="sm:hidden overflow-hidden h-5 flex items-center min-w-0">
  <span
    key={activeChapter}  // key 变化触发动画
    className="text-xs font-bold truncate"
    style={{
      color: '#FFD700',
      animation: 'slideInFromBottom 0.25s ease forwards',
    }}
  >
    {currentChapter?.icon} {currentChapter?.label}
  </span>
</div>

// index.css 中定义动画
@keyframes slideInFromBottom {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

## 手续费计算器（/crypto-saving 实战案例章节）

```tsx
// 核心逻辑：输入月交易量，计算不同交易所的手续费和返佣
const fee = monthlyVolume * feeRate * (1 - rebateRate);
const rebate = monthlyVolume * feeRate * rebateRate;
const annualSaving = rebate * 12;
```
