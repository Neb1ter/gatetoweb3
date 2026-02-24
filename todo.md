# Project TODO

- [x] Copy source files from uploaded project to Manus project directory
- [x] Configure database schema (exchange_links, contact_submissions, faqs, crypto_news)
- [x] Execute database migrations via webdev_execute_sql
- [x] Seed initial exchange data (Gate.io, OKX, Binance, Bybit, Bitget)
- [x] Seed initial FAQ data (18 entries)
- [x] Verify tRPC routers work (exchanges, contact, faq, news)
- [x] Verify frontend pages render correctly (Portal, Home, Exchanges, Contact, Beginner)
- [x] Verify Chinese/English language switching
- [x] Verify responsive design on mobile and desktop
- [x] Run vitest tests (6 files, 23 tests, all passed)
- [x] Save checkpoint and deliver to user (version: fa1141df)
- [x] 修改 Portal 页面交易所跑马灯为纯文字样式（移除假 Logo）
- [x] 验证效果并保存检查点 (version: 6e803633)
- [x] 搜集最新经济形势与 Web3 数据（近半年）
- [x] 创建「经济形势与 Web3 机遇」二级页面（EconomicOpportunity.tsx）
- [x] 在 Web3 入圈指南首页插入新板块入口，后续板块序号顺延
- [x] 同步二级菜单导航
- [x] 验证效果并保存检查点
- [x] 创建 Web3Guide 六章共用导航组件（章节菜单 + 返回按鈕）
- [x] 更新六个二级页面应用统一导航，修正章节序号（第4章 DeFi，第5章经济形势，第6章投资方式，第7章交易所）
- [x] 验证所有页面 UI 一致性并保存检查点
- [x] 修复 /crypto-saving 页面跳转时整个界面模糊的问题（移除 scale 变换 + backdrop-blur）
- [x] 验证修复效果并保存检查点 (version: 83fc47bc)
- [x] 删除交易所对比页（Exchanges.tsx）中「返佣比例：个性化」显示内容
- [x] 搜集五大交易所功能板块官网资料
- [x] 设计并创建 exchange_feature_categories 和 exchange_feature_support 数据库表，插入详细功能数据
- [x] 创建 tRPC 路由 exchangeGuide（功能列表、功能详情）
- [x] 创建「交易所扫盲指南」主页面（ExchangeGuideIndex.tsx）含左侧菜单
- [x] 创建功能二级页面（ExchangeFeatureDetail.tsx）
- [x] 在 crypto-saving 主页添加「交易所扫盲指南」板块入口（已完成但需迁移到 Portal）
- [x] 添加交易所选择建议和跳转新手问答按钮
- [x] 分析 Portal 页面现有两个大板块结构规格
- [x] 在 Portal 新增「交易所扫盲指南」第三大板块（与前两个保持一致规格）
- [x] 从 /crypto-saving 主页移除「交易所扫盲指南」板块
- [x] 验证 Portal 页面效果和移动端适配，保存检查点

## 模拟交易游戏模块
- [x] 规划6个模拟渃8戏设计方案和共用组件架构
- [x] 开发现货交易模拟渃8戏（/sim/spot）：实时K线+买卖操作+持仓面板+盈亏统计
- [x] 开发合约交易模拟渃8戏（/sim/futures）：多空方向+杠杆选择+强平机制+PnL
- [x] 开发TradFi模拟渃8戏（/sim/tradfi）：股票/债券/加密对比+传统交易流程
- [x] 开发杠杆交易模拟渃8戏（/sim/margin）：借贷+利息计算+爆仓预警
- [x] 开发期权交易模拟渃8戏（/sim/options）：行权价+到期日+Call/Put+Greeks
- [x] 开发机器人交易模拟渃8戏（/sim/bot）：策略配置+历史回测+自动执行动画
- [x] 在各详情页测验下方添加「进入模拟渃8戏」入口按鈕
- [x] 注册6条路由到 App.tsx
- [x] 验证全流程并保存检查点

## Bug 修复
- [x] 修复 /exchange-guide 详情页缺少「进入模拟游戏」入口按鈕的问题（入口加到了 ExchangeGuideIndex.tsx 的 FeatureDetail 组件中）
- [x] 验证6个交易模块详情页均能正确跳转对应模拟游戏
