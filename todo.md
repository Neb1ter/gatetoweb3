# 币圈省钱指南 — 迁移 TODO

## 数据库 & 配置
- [x] 迁移 drizzle/schema.ts（含所有业务表）
- [x] 迁移 drizzle/relations.ts
- [x] 迁移 drizzle 迁移文件（SQL + meta）
- [x] 迁移 shared/const.ts、shared/types.ts、shared/_core/errors.ts
- [x] 迁移 tsconfig.json、vite.config.ts、vitest.config.ts、components.json、drizzle.config.ts
- [x] 迁移 patches/wouter@3.7.1.patch

## 服务端
- [x] 迁移 server/db.ts（含所有业务查询和 seed 数据）
- [x] 迁移 server/routers.ts
- [x] 迁移 server/storage.ts
- [x] 迁移所有服务端测试文件

## 前端
- [x] 迁移 client/index.html
- [x] 迁移 client/src/index.css
- [x] 迁移 client/src/const.ts
- [x] 迁移 client/src/main.tsx
- [x] 迁移 client/src/App.tsx
- [x] 迁移 client/src/lib/（trpc.ts、utils.ts、i18n.ts）
- [x] 迁移 client/src/contexts/（LanguageContext、ThemeContext）
- [x] 迁移 client/src/hooks/（useComposition、useMobile、usePersistFn、useScrollMemory）
- [x] 迁移 client/src/components/（自定义组件 + ui 组件）
- [x] 迁移 client/src/pages/（所有页面文件）

## 验证 & 发布
- [x] 运行 pnpm db:push 迁移数据库
- [x] 运行 pnpm test 验证测试通过（23/23 通过）
- [x] 检查开发服务器正常运行
- [x] 保存检查点
- [ ] 发布为永久网站

## Bug 修复
- [x] 排查 /exchange-guide 页面内容未显示的问题
- [x] 修复 /exchange-guide 页面所有错误（13 个功能分类 + 65 条交易所对比数据 seed）

## 新功能：交易所指南管理系统
- [x] 恢复 TradFi 功能分类（黄金、股票等传统金融资产交易）
- [x] 扩充 exchange_feature_support 字段：手续费等级、KYC 要求、支持地区等
- [x] 补充「交易所对比」 Tab 完整数据（手续费等级/KYC/支持地区）
- [x] 新建后台管理页面 /admin/exchange-guide：功能分类 CRUD
- [x] 后台管理页面：交易所支持数据 CRUD
- [x] 确保所有 seed 数据在首次启动时写入数据库，后续修改通过管理页面完成

## 重构：/exchange-guide 页面 UI/UX
- [x] 补充杠杆交易（margin）seed 数据（5 条）
- [x] 补充 TradFi 完整 seed 数据（确认已正确写入）
- [x] 重排功能分类顺序：现货→合约→杠杆→跟单→TradFi→P2P→打新→机器人→借记卡→DEX→Web3钉包→安全→生态→活动
- [x] 删除 NFT 市场分类
- [x] 功能介绍 Tab：删除五大交易所对比卡片
- [x] 交易所对比 Tab：改为网格布局（可点击跳转功能介绍）
- [x] 移动端：功能分类替换为淡入淡出跑马灯（图标+文字）
- [x] 桌面端：页面底部添加跑马灯
- [x] Tab 切换改为滑块物理动画（弹性滑块 + 内容切换动画）

## Bug 修复 & 优化：/exchange-guide 第二轮
- [x] 修复 Tab 切换时内容无法正确加载的问题
- [x] 重新实现移动端跑马灯：横向滚动切入/切出 + 淡入淡出 + 编号 + 留冗余扩展位
- [x] 丰富功能介绍文字内容（更详细、有实例）

## 手续费数据统一化
- [x] 创建 shared/exchangeFees.ts 统一手续费数据源
- [x] 更新 Exchanges.tsx 引用统一数据源
- [x] 更新 ExchangeGuide.tsx 引用统一数据源（COMPARISON_FEATURES 矩阵 + 各交易所 makerFee/takerFee）
- [x] 核查全站手续费数字一致性（ExchangeGuideIndex.tsx 文本内容为说明性文字，无需动态引用）

## 邀请码统一化 + 移动端悬浮导航
- [x] 扫描全站邀请码，提取到 shared/exchangeFees.ts 的 INVITE_CODES 常量
- [x] 更新所有页面引用统一邀请码常量（Exchanges.tsx + ExchangeGuide.tsx）
- [x] 实现移动端磁性悬浮导航球组件（MobileFloatNav）
- [x] 悬浮球支持拖拽 + 磁吸边缘（上下左右四边）
- [x] 滚动向下时收缩为小圆，向上时展开为 Tab 栏
- [x] 贴左右边展开为竖向 Tab 栏，贴上下边展开为横向 Tab 栏
- [x] 展开/收缩过渡动画（小圆 ↔ Tab 栏形变）
- [x] 集成到 App.tsx，全站可用

## 悬浮导航球升级（iOS 液态玻璃质感）
- [x] 小球 iOS 液态玻璃质感（折射/色彩畸变/高光/透明分层）
- [x] 小球大小与回顶按钮一致（52px）
- [x] 收缩时机改为：点击页面任意处 或 向下滑动时收缩
- [x] 收缩状态下显示当前页面主题色光晕
- [x] 色彩畸变效果（页面内容透过小球产生折射感）

## 导航球与回顶按钮位置协调
- [x] 导航球添加轻触反馈（scale 0.9）
- [x] 两球同时出现时保持一致边缘距离且不重叠（MARGIN=24px，GAP=8px）
- [x] 回顶按钮出现/消失时导航球平滑移动（用户手动拖拽后不再自动调整）

## 导航球拖拽优化
- [x] 使用 pointer events + requestAnimationFrame 提升帧率和跟手性（直接操作 DOM，绕过 React 重渲染）
- [x] 拖拽时阻止页面滚动（body overflow/touchAction）
- [x] 两球磁斥物理效果：强制靠近时弹性推开 + repel-shake 动画
- [x] 确保两球在任何情况下都不重叠（磁吸后再做一次磁斥修正）

## 导航球 + 现货游戏优化（Round 2）
- [x] 导航球默认位置与回顶按钮水平对齐（同一行 bottom:24px）
- [x] 添加惯性甩动效果（速度向量 + 摩擦衰减 + 边缘磁吸）
- [x] 彻底解决两球重叠（初始化时计算正确 x 坐标）
- [x] 重构现货交易游戏为移动端 OKX 风格（全屏布局、无横向滚动）
- [x] K 线图自适应容器宽度，不再硬编码 800px
- [x] 买卖按鈕/输入框参考 OKX 移动端布局（底部固定交易面板 + 抽屉记录）
- [x] 减少网页负载（移除硬编码宽度、简化状态管理）

## OKX 风格模拟交易界面重构
- [x] 导航球：阻尼非线性运动（贴边时速度越来越慢）+ 默认底部居中
- [x] SpotSim 重构：参考 OKX 现货截图（左侧买卖面板+右侧订单簿+K线+底部导航）
- [x] FuturesSim 重构：参考 OKX 合约截图（开仓/平仓+杠杆+开多/开空+资金费率）
- [x] MarginSim 重构：参考 OKX 杠杆截图（逐仓/杠杆+借还+小时利率+杠杆买入）

## 模拟器全面升级 + 扫盲指南杠杆章节
- [x] 创建 SimComponents.tsx 共享组件（CandleChart、OrderBook、PositionCard、TpSlModal、EmptyHint、Toast）
- [x] PositionCard：参考 OKX 图2，显示未实现盈亏、收益率、持仓数量、维持保证金、MMR、开仓均价、标记价格、预估强平价
- [x] TpSlModal：三 Tab（全部仓位/部分仓位/追踪止盈），价格↔收益率联动，滑块，确认按钮
- [x] FuturesSim：集成 PositionCard + TpSlModal + 反手功能 + 资产盈亏 + 委托限价单 + 一键平仓
- [x] SpotSim：去除顶部时间盒/底部机器人文案，集成仓位/资产/委托抽屉，返回按钮实际返回上一页
- [x] MarginSim：集成 PositionCard + TpSlModal + 借还弹窗 + 资产盈亏 + 委托限价单
- [x] 三个模拟器底部内容区向下延伸（maxHeight 45vh，可滚动）
- [x] 交易所扫盲指南：杠杆交易章节大幅扩充（3个子章节：什么是杠杆/全仓vs逐仓/借贷利息与强平）
- [x] 杠杆交易章节新增测验题（5倍杠杆强平价计算）
- [x] 杠杆交易章节新增 5 条专业建议

## 模拟器修复 Round 2
- [x] 补充杠杆交易扫盲内容（数据库插入 margin 记录 sortOrder:3）
- [x] 扩宽模拟器页面：缩短K线图高度（22% 屏幕高度，最大 190px）
- [x] 全仓/逐仓差异化：全仓 0.95 系数爆仓价更远，逐仓 0.90 系数爆仓价更近
- [x] K线图上显示爆仓线（橙色虚线）和持仓价格线（绿色虚线）
- [x] 禁用向右滑动返回手势（仅保留返回按鈕和安卓系统级返回）
- [x] 更新测试期望値（categories 14 个）

## 模拟器修复 Round 3
- [x] 彻底禁用所有水平滑动手势（dx>dy 判断，阀値 5px）
- [x] 模拟器页面改为可向下滚动（minHeight:100dvh + overflowX:hidden）
- [x] 顶部导航改为 sticky 固定（滚动时不消失）
- [x] 返回按鈕改用 window.history.back()（实际返回上一页）
- [x] 底部内容区取消 maxHeight 限制，自然延伸

## 模拟器修复 Round 4
- [x] 彻底修复左右滑动切换页面（index.css body overscroll-behavior-x:none + App.tsx 全局拦截）
- [x] 数据库新增 sim_trade_history 表（包含 userId 防止越权）
- [x] 服务端添加 sim.saveHistory / getHistory / resetAll 接口
- [x] 三个模拟器集成历史仓位：平仓写入、历史 Tab 展示、重置确认弹窗

## 模拟器历史记录改为 localStorage
- [x] SimComponents.tsx：新增 useLocalHistory hook（读写 localStorage，最多 200 条）
- [x] 三个模拟器：移除 trpc/useAuth 依赖，改用 useLocalHistory
- [x] 历史 Tab：无需登录直接显示，重置清空 localStorage

## 历史记录即时显示修复
- [x] 重写 useLocalHistory hook：全局事件总线 + 直接写入 state，平仓后历史 Tab 即时刷新

## SpotSim 历史记录修复
- [ ] 诊断 SpotSim 历史记录无法显示的根本原因并修复
