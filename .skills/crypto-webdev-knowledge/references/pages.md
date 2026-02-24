# 各页面关键结构说明

## /crypto-saving（Home.tsx）

**文件**：`client/src/pages/Home.tsx`  
**主题**：黄色 `#FFD700`  
**关键 state**：
- `activeChapter`：当前激活章节 ID（用于浮动菜单高亮和顶部标题显示）
- `scrollY`：页面滚动距离（用于 ScrollToTopButton 显示/隐藏）

**章节 ID 列表**：
`what-is-rebate` / `rebate-source` / `mechanism` / `safety` / `case-study` / `scenarios` / `how-to-get` / `summary`

**滚动感知逻辑**：
```tsx
useEffect(() => {
  const handleScroll = () => {
    const sections = chapters.map(ch => document.getElementById(ch.id));
    const current = sections.findLast(el => el && el.getBoundingClientRect().top <= 80);
    if (current) setActiveChapter(current.id);
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

---

## /exchange-guide（ExchangeGuideIndex.tsx）

**文件**：`client/src/pages/ExchangeGuideIndex.tsx`  
**主题**：蓝色 `#3b82f6`  
**组件层级**：
```
ExchangeGuideIndex（主组件）
├── FeaturesTab（功能介绍 Tab）
│   ├── 左侧章节列表（activeCategory 状态提升到主组件）
│   └── FeatureDetail（内容区，含上下篇导航）
├── CompareTab（交易所对比 Tab）
│   └── 底部跳转卡片（→ /exchanges）
└── FloatChapterMenu（浮动菜单，仅 FeaturesTab 激活时显示）
```

**activeCategory 状态提升**：从 FeaturesTab 提升到 ExchangeGuideIndex，通过 props 传入，使 FloatChapterMenu 可以同步显示当前章节。

---

## /exchanges（Exchanges.tsx）

**文件**：`client/src/pages/Exchanges.tsx`  
**三 Tab**：`rebate`（返佣对比）/ `detail`（各交易所详情）/ `intro`（交易所科普）  
**交易所数据**：Binance / OKX / Gate.io / Bybit / Bitget  

---

## /web3-guide（Web3Guide.tsx）

**文件**：`client/src/pages/Web3Guide.tsx`  
**主题**：绿色 `#34d399`  
**章节 ID**：`navSections` 数组定义在文件顶部（约第 10-30 行）  
**关键 state**：`activeSection`（当前激活章节，用于浮动菜单和顶部标题）  

---

## /exchange-download（ExchangeDownload.tsx）

**文件**：`client/src/pages/ExchangeDownload.tsx`  
**路由**：`/exchange-download`（在 App.tsx 中注册）  
**入口**：`/crypto-saving` 页面的「新手不知道怎么下载？」按钮  
**内容**：五大交易所下载链接 + 三步快速上手指南 + 安全验证提示
