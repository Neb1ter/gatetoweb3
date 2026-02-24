---
name: crypto-webdev-knowledge
description: 币圈/加密货币内容网站的设计与开发知识库。适用于：开始或继续编辑「币圈省钱指南」项目（project_init）时、设计加密货币相关页面时、需要了解该项目的主题色规范/组件规范/移动端优化策略时。每次开始新的网页编辑任务前，应询问用户是否采用此知识库。
---

# 币圈网站设计与开发知识库

> **使用前必读**：每次开始新的网页编辑/创建任务时，**必须询问用户**：「是否采用已学习的知识库（crypto-webdev-knowledge）？」用户确认后再按本知识库规范执行。

---

## 一、项目概览

**项目名称**：币圈省钱指南 — 加密货币返佣邀请网站
**项目路径**：`/home/ubuntu/project_init`
**技术栈**：React 19 + Tailwind 4 + tRPC 11 + Express 4 + Drizzle ORM

| 路由 | 页面名称 | 主题色 |
|------|---------|--------|
| `/portal` | 导航主页 | 深蓝底 + 金色点缀 |
| `/crypto-saving` | 币圈省钱指南（返佣科普） | 黄色 `#FFD700` |
| `/exchange-guide` | 交易所扫盲指南 | 蓝色 `#3b82f6` |
| `/exchanges` | 交易所中心（三 Tab） | 蓝色主题 |
| `/web3-guide` | Web3 入圈指南 | 绿色 `#34d399` |
| `/exchange-download` | 新手下载指南 | 黄色主题 |

---

## 二、主题色规范（严格遵守）

### 黄色主题（/crypto-saving、/exchange-download）
- 主色：`#FFD700` / `amber-400` / `yellow-400`；强调：`#FFA500`
- 背景：`#0A192F`；卡片：`#172A45`
- 所有 icon 背景、按钮、边框、进度环、浮动菜单均用黄色系
- Binance 品牌黄色**保留**（官方色，不属于主题色）

### 蓝色主题（/exchange-guide、/exchanges）
- 主色：`#3b82f6` / `blue-400` / `#93c5fd`；背景：`#0A192F`
- Tab 激活态、侧边栏 active、section 标题、Pro Tips、上下篇导航、FloatChapterMenu、ScrollToTopButton 均用蓝色系
- Binance 品牌黄色**保留**

### 绿色主题（/web3-guide）
- 主色：`#34d399` / `emerald-400`；背景：`#050D1A`

---

## 三、核心组件规范

### ScrollToTopButton（进度环回顶按钮）
- 文件：`client/src/components/ScrollToTopButton.tsx`
- 固定在 `fixed bottom-6 right-4`，滚动超过 300px 后显示
- SVG 进度环 + 泛光效果，Tooltip 显示「已读 XX% · 点击回顶」
- `color` prop：`"yellow"` / `"blue"` / `"emerald"` 跟随页面主题
- **必须放在主组件 return 最外层**，不能放在子组件内

### FloatChapterMenu（可拖拽浮动章节菜单）
- 初始位置：`bottom-6 left-4`（左下角，与回顶按钮同一水平线）
- 支持鼠标拖拽和触控拖拽
- 展开时显示高斯模糊面板（`backdrop-blur-md`），列出所有章节
- 触发按钮显示当前章节图标 + 「点此切换章节」提示
- 颜色主题跟随页面主题色（黄/蓝/绿）

### 移动端顶部导航栏（章节标题动态显示）
- 适用：`/crypto-saving`、`/web3-guide`
- 桌面端（`sm:` 以上）：显示页面标题；移动端（`sm:hidden`）：显示当前章节标题
- 动画：`@keyframes slideInFromBottom`（定义在 `client/src/index.css`）
- 通过 `key={activeChapter}` 触发重新渲染动画
- 结构：`[← 返回主页] | [章节标题/页面标题]    [桌面端导航]`

### 上一篇/下一篇导航（FeatureDetail）
- 适用：`/exchange-guide` 的 FeaturesTab
- props：`prevCategory` / `nextCategory` / `onNavigate`
- 点击后切换内容并 `window.scrollTo(0, 0)`

---

## 四、页面结构规范

### /crypto-saving 章节顺序（自然阅读流）
1. 什么是返佣
2. 返佣来源
3. 机制揭秘
4. 安全合规
5. 实战案例（含手续费计算器：输入月交易量，计算返佣收益）
6. 全场景覆盖
7. 新老用户如何获得
8. 总结与行动

### /exchange-guide 结构
- Tab 1（功能介绍）：左侧章节列表 + 右侧内容 + 底部上下篇导航 + 浮动章节菜单
- Tab 2（交易所对比）：对比表格 + 底部「不了解这些交易所？」跳转到 `/exchanges` 的卡片

### /exchanges 三 Tab 结构
- 返佣对比 / 各交易所详情 / 交易所科普
- 顶部：全球市场数据 banner（7亿用户 / $86.2万亿交易量 / 50+国持牌 / 100%+储备率）

---

## 五、移动端优化规范

- 浮动菜单：`bottom-6 left-4`；回顶按钮：`bottom-6 right-4`（同一水平线）
- 正文：`text-sm` 移动端 / `text-base` 桌面端；行高：`leading-relaxed`
- 标题：`text-xl sm:text-2xl`；段落间距：`mb-4 sm:mb-6`；卡片内边距：`p-4 sm:p-6`
- 返回主页按钮：移动端只显示箭头图标（`hidden sm:inline` 隐藏文字）

---

## 六、官方数据背书（可直接引用）

| 数据点 | 来源 | 数值 |
|--------|------|------|
| 全球加密交易量 | CoinGecko 2025年报 | $86.2 万亿 |
| 全球持币用户 | 行业估算 | 7 亿+ |
| Binance 注册用户 | 官方公告 | 2.5 亿+ |
| Binance 市场份额 | CoinGlass | ~40% |
| OKX 综合评分 | CoinGlass | 88.77 |
| Gate.io 储备率 | Armanino LLP 审计 | 125% |
| Bybit 储备率 | Hacken 月度审计 | ETH 101% |
| Bitget 综合评分 | CoinGlass | 83.10 |

---

## 七、常见错误与避坑

| 错误 | 正确做法 |
|------|---------|
| ScrollToTopButton 放在子组件内 | 放在主组件 return 最外层 |
| /exchange-guide 使用黄色 | 除 Binance 品牌色外全部换蓝色 |
| 浮动菜单初始位置在页面中央 | 固定 `bottom-6 left-4` |
| 章节标题切换无动画 | 用 `key={activeChapter}` 触发 `slideInFromBottom` |
| 旧日志误判为编译错误 | 检查时间戳，若早于最近 HMR 更新则为旧缓存 |

---

## 八、参考文件

详细组件代码片段见 `references/components.md`；各页面关键结构见 `references/pages.md`。
