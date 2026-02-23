import { useState } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ChevronDown, ChevronUp, Star, CheckCircle, XCircle, AlertCircle, ExternalLink, MessageCircle, HelpCircle, TrendingUp, Shield, Zap, Users } from "lucide-react";

// 功能详细内容数据（静态内容，配合数据库动态数据）
const FEATURE_CONTENT: Record<string, {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  howItWorks: string[];
  pros: string[];
  cons: string[];
  tips: string[];
  quiz: { question: string; options: string[]; answer: number; explanation: string }[];
  riskLevel: "low" | "medium" | "high";
  suitableFor: string;
}> = {
  spot: {
    icon: "📈",
    title: "现货交易",
    subtitle: "加密货币交易的基础入门",
    description: "现货交易是最基础、最直接的加密货币买卖方式。你用真实资金购买真实的加密货币，价格即时成交，资产立即归属于你的账户。就像在菜市场买菜——一手交钱，一手交货，简单直接。",
    howItWorks: [
      "选择交易对（如 BTC/USDT），即比特币对美元稳定币",
      "选择订单类型：限价单（指定价格）或市价单（立即成交）",
      "输入购买数量，确认后资金从账户扣除，加密货币入账",
      "持有后可随时卖出，差价即为盈亏",
    ],
    pros: ["风险可控，最多亏损本金", "无需支付利息费用", "适合长期持有（HODL）策略", "新手友好，逻辑简单"],
    cons: ["只能做多（涨才能赚钱）", "资金利用率相对较低", "市场下跌时只能等待或止损"],
    tips: [
      "新手建议从主流币（BTC、ETH）开始，流动性好、波动相对可控",
      "使用限价单而非市价单，避免滑点损失",
      "设置止损，单笔亏损不超过总仓位的 5%",
      "不要把所有资金一次性买入，分批建仓降低风险",
    ],
    quiz: [
      {
        question: "现货交易中，你购买了 1 个 BTC，价格从 $60,000 涨到 $70,000，你的盈利是多少？",
        options: ["$5,000", "$10,000", "$70,000", "$60,000"],
        answer: 1,
        explanation: "现货交易盈利 = 卖出价 - 买入价 = $70,000 - $60,000 = $10,000。简单直接，没有杠杆放大。",
      },
      {
        question: "以下哪种订单类型能保证你以指定价格成交？",
        options: ["市价单", "限价单", "止损单", "以上都不能保证"],
        answer: 3,
        explanation: "限价单只能保证成交价格不差于你设定的价格，但不保证一定能成交（如果市场价格从未达到你的限价）。市价单保证成交但不保证价格。",
      },
    ],
    riskLevel: "low",
    suitableFor: "所有用户，尤其是新手",
  },
  futures: {
    icon: "⚡",
    title: "合约交易",
    subtitle: "放大收益，也放大风险",
    description: "合约交易允许你在不持有真实加密货币的情况下，通过预测价格涨跌来盈利。最大特点是可以使用杠杆（如 10x），用 1000 美元控制 10000 美元的仓位。既可以做多（看涨），也可以做空（看跌），双向都能盈利。",
    howItWorks: [
      "选择永续合约或交割合约，永续合约无到期日，交割合约有固定到期日",
      "选择杠杆倍数（1x-125x），杠杆越高风险越大",
      "开多仓（看涨）或开空仓（看跌）",
      "价格朝有利方向移动则盈利，反向则亏损，亏完保证金会被强制平仓（爆仓）",
    ],
    pros: ["双向交易，涨跌都能盈利", "杠杆放大资金效率", "永续合约无到期压力", "对冲现货仓位风险"],
    cons: ["杠杆放大亏损，可能爆仓", "需要支付资金费率", "心理压力大，需要严格纪律", "不适合新手"],
    tips: [
      "新手建议从 1-3x 低杠杆开始，感受市场节奏",
      "永远设置止损，保护本金是第一位",
      "了解资金费率机制，避免长期持仓被费率侵蚀",
      "合约仓位不超过总资产的 20%",
    ],
    quiz: [
      {
        question: "你用 $1,000 开了 10x 杠杆做多 BTC，价格下跌 10% 会发生什么？",
        options: ["亏损 $100", "亏损 $1,000（爆仓）", "亏损 $500", "什么都不会发生"],
        answer: 1,
        explanation: "10x 杠杆意味着价格下跌 10% = 亏损 100%（$1,000），触发强制平仓（爆仓），本金全部损失。这就是高杠杆的风险。",
      },
      {
        question: "永续合约的「资金费率」是什么？",
        options: ["交易手续费", "多空双方之间定期支付的费用", "提币手续费", "账户管理费"],
        answer: 1,
        explanation: "资金费率是永续合约中多空双方之间定期（通常每8小时）支付的费用，用于锚定合约价格与现货价格。多头占优时多头付给空头，反之亦然。",
      },
    ],
    riskLevel: "high",
    suitableFor: "有经验的交易者，了解风险管理",
  },
  margin: {
    icon: "🔧",
    title: "杠杆交易",
    subtitle: "借币放大现货仓位",
    description: "杠杆交易是在现货基础上借入资金，放大买卖规模。与合约不同，杠杆交易实际持有真实的加密货币，但借入了额外资金。通常提供 2-10x 杠杆，需要支付借款利息。",
    howItWorks: [
      "将资产存入杠杆账户作为抵押品",
      "选择杠杆倍数，系统自动借出对应资金",
      "用借来的资金买入（做多）或卖出（做空）加密货币",
      "平仓时归还借款+利息，剩余为净利润",
    ],
    pros: ["实际持有真实资产", "可用于现货套利策略", "比合约杠杆上限低，相对安全", "部分交易所支持跨币种借贷"],
    cons: ["需要支付借款利息（日息约 0.02%-0.1%）", "仍有爆仓风险", "操作比现货复杂", "流动性不如合约"],
    tips: [
      "杠杆交易利息按天计算，短期操作才划算",
      "维持充足的保证金比例，避免被强制平仓",
      "适合有现货基础的进阶用户",
    ],
    quiz: [
      {
        question: "杠杆交易与合约交易最主要的区别是什么？",
        options: ["杠杆交易没有风险", "杠杆交易实际持有真实加密货币", "合约交易需要付利息", "两者完全相同"],
        answer: 1,
        explanation: "杠杆交易实际借入资金购买真实的加密货币，你持有的是真实资产。合约交易则是衍生品，不涉及真实资产转移，只是对价格涨跌的押注。",
      },
    ],
    riskLevel: "high",
    suitableFor: "有现货交易经验的进阶用户",
  },
  tradfi: {
    icon: "🏦",
    title: "传统金融（TradFi）",
    subtitle: "加密货币与传统金融的融合",
    description: "TradFi（Traditional Finance）功能是指交易所提供的类传统金融服务，包括股票代币化、ETF 产品、指数基金等。让用户无需离开加密货币平台，就能接触传统金融市场。OKX 和 Bybit 在这一领域布局较为积极。",
    howItWorks: [
      "股票代币化：将苹果、特斯拉等股票的价格映射到链上代币",
      "加密 ETF：追踪一篮子加密资产的指数产品",
      "结构性产品：固定收益 + 加密资产组合的混合产品",
      "法币入金通道：支持银行转账、信用卡等传统支付方式",
    ],
    pros: ["一站式管理传统和加密资产", "降低传统金融投资门槛", "7×24 小时交易（传统市场只有工作日）", "无需开设证券账户"],
    cons: ["监管合规风险较高", "部分地区不可用", "流动性不如真实股票市场", "价格可能与真实市场有偏差"],
    tips: [
      "了解所在地区的监管政策，确认是否合法",
      "股票代币化产品流动性有限，大额交易注意滑点",
      "这类产品仍处于发展初期，谨慎配置",
    ],
    quiz: [
      {
        question: "「股票代币化」是指什么？",
        options: ["把股票变成 NFT", "将股票价格映射到区块链上的代币", "用加密货币购买真实股票", "股票市场的加密货币"],
        answer: 1,
        explanation: "股票代币化是将传统股票（如苹果、特斯拉）的价格映射到区块链代币上，让用户可以在加密货币平台上交易这些代币，获得与股票价格联动的收益，但不代表真实股权。",
      },
    ],
    riskLevel: "medium",
    suitableFor: "希望在加密平台接触传统金融的用户",
  },
  earn: {
    icon: "💰",
    title: "理财产品",
    subtitle: "让闲置资产持续增值",
    description: "交易所理财产品让你的闲置加密货币或稳定币持续产生收益，类似银行存款但收益率通常更高。主要包括活期理财（随存随取）、定期理财（锁定期更高收益）、Staking（质押获得网络奖励）等。",
    howItWorks: [
      "活期理财：将 USDT 等稳定币存入，年化收益约 3-8%，随时可取",
      "定期理财：锁定 7-90 天，年化收益约 5-15%，到期自动返还",
      "Staking：质押 ETH、BNB 等 PoS 代币，获得网络验证奖励",
      "双币投资：结合期权策略，在特定价格区间内获得更高收益",
    ],
    pros: ["无需主动操作，被动收益", "稳定币理财规避价格波动风险", "年化收益通常高于银行存款", "门槛低，小额也可参与"],
    cons: ["定期产品有锁定期，流动性受限", "平台风险（交易所倒闭风险）", "收益率随市场波动变化", "部分产品有最低存入门槛"],
    tips: [
      "稳定币理财（USDT/USDC）是最保守的选择，规避价格波动",
      "不要把所有资产都放在一个平台，分散平台风险",
      "了解产品的底层逻辑，避免高收益陷阱",
      "大额资金优先考虑合规平台的正规理财产品",
    ],
    quiz: [
      {
        question: "以下哪种理财产品风险最低？",
        options: ["BTC 定期理财", "USDT 活期理财", "双币投资", "DeFi 流动性挖矿"],
        answer: 1,
        explanation: "USDT 活期理财使用稳定币，规避了加密货币价格波动风险，同时活期可以随时取出，流动性最好，综合风险最低。BTC 定期理财有价格波动风险，双币投资有期权风险，DeFi 挖矿有智能合约风险。",
      },
    ],
    riskLevel: "low",
    suitableFor: "希望让闲置资产增值的保守型用户",
  },
  web3: {
    icon: "🌐",
    title: "Web3 功能",
    subtitle: "连接去中心化世界的桥梁",
    description: "交易所内置的 Web3 功能让你无需离开平台就能访问去中心化应用（DApp）、NFT 市场、DeFi 协议等。OKX Web3 钱包是目前功能最全面的交易所内置 Web3 入口，支持 80+ 条公链。",
    howItWorks: [
      "内置 Web3 钱包：无需安装 MetaMask，直接在 App 内管理链上资产",
      "DApp 浏览器：内置浏览器访问 Uniswap、OpenSea 等去中心化应用",
      "跨链桥：一键将资产从以太坊转移到 BSC、Solana 等其他链",
      "NFT 市场：直接在交易所内购买、出售、展示 NFT 藏品",
    ],
    pros: ["无需额外安装钱包插件", "私钥由用户掌控（非托管）", "多链支持，一个钱包管理所有链", "新手友好的 DeFi 入口"],
    cons: ["功能复杂，学习曲线陡峭", "Gas 费用需要自行管理", "链上操作不可逆，误操作风险", "部分 DApp 需要单独连接"],
    tips: [
      "Web3 钱包的助记词/私钥必须离线保存，不要截图或存云盘",
      "小额测试后再进行大额操作",
      "警惕钓鱼网站，只通过官方 App 访问 DApp",
      "了解 Gas 费用机制，避免在网络拥堵时操作",
    ],
    quiz: [
      {
        question: "交易所内置 Web3 钱包与中心化账户最大的区别是什么？",
        options: ["Web3 钱包收益更高", "Web3 钱包的私钥由用户自己掌控", "Web3 钱包更安全", "两者没有区别"],
        answer: 1,
        explanation: "中心化账户的资产由交易所托管（你的私钥在交易所服务器上），而 Web3 钱包的私钥由你自己掌控。「Not your keys, not your coins」——只有掌握私钥，才真正拥有资产。",
      },
    ],
    riskLevel: "medium",
    suitableFor: "希望探索 DeFi 和 NFT 的进阶用户",
  },
  options: {
    icon: "🎯",
    title: "期权交易",
    subtitle: "以小博大的衍生品工具",
    description: "期权给予你在特定时间以特定价格买入或卖出资产的「权利」（而非义务）。买入期权最多亏损权利金，但潜在收益无限。Deribit 是加密期权市场龙头，Binance、OKX 也提供期权产品。",
    howItWorks: [
      "认购期权（Call）：看涨，有权在到期日以行权价买入",
      "认沽期权（Put）：看跌，有权在到期日以行权价卖出",
      "支付权利金（Premium）购买期权",
      "到期时如果方向正确则行权获利，方向错误则权利金归零",
    ],
    pros: ["买方风险有限（最多亏损权利金）", "可以用小资金对冲大仓位风险", "策略灵活，可构建复杂组合", "波动率交易机会"],
    cons: ["产品复杂，学习成本高", "时间价值衰减（Theta 损耗）", "流动性不如现货和合约", "需要理解希腊字母（Delta/Gamma等）"],
    tips: [
      "新手先从购买期权（买方）开始，风险有限",
      "了解期权的时间价值，不要持有到最后一天才决策",
      "期权适合有明确方向判断时使用，不适合频繁交易",
    ],
    quiz: [
      {
        question: "你购买了一个 BTC 认购期权，支付了 $500 权利金，但到期时 BTC 价格低于行权价，你会亏损多少？",
        options: ["$0", "$500", "无限亏损", "取决于 BTC 价格"],
        answer: 1,
        explanation: "期权买方的最大亏损就是权利金。当期权到期价值归零时，你损失的只是购买期权时支付的 $500 权利金，不会有更多损失。这是期权买方最大的优势——风险有限。",
      },
    ],
    riskLevel: "high",
    suitableFor: "有合约经验的高级用户",
  },
  copy: {
    icon: "👥",
    title: "跟单交易",
    subtitle: "复制顶尖交易员的策略",
    description: "跟单交易让你自动复制优秀交易员的每一笔操作。选择一位历史收益率高、回撤小的交易员，设置跟单金额，系统会按比例自动执行相同的交易。Bybit 和 Bitget 的跟单生态最为成熟。",
    howItWorks: [
      "浏览交易员排行榜，筛选历史收益、最大回撤、跟单人数等指标",
      "选择交易员后设置跟单金额和风险参数",
      "系统自动按比例复制交易员的每笔开仓、平仓操作",
      "可随时暂停或停止跟单，独立管理资金",
    ],
    pros: ["无需自己分析市场，节省时间", "可以学习优秀交易员的策略", "适合没有时间盯盘的用户", "风险可控，可设置止损比例"],
    cons: ["过去业绩不代表未来", "跟单存在延迟，可能影响成交价格", "需要支付跟单手续费（通常5-10%利润分成）", "无法完全理解交易逻辑"],
    tips: [
      "选择交易员时看「最大回撤」比看「总收益」更重要",
      "不要把所有资金跟一个交易员，分散跟单降低风险",
      "观察交易员至少 3 个月的历史记录再决定跟单",
      "设置止损比例，避免跟单亏损超出承受范围",
    ],
    quiz: [
      {
        question: "选择跟单交易员时，以下哪个指标最能反映风险控制能力？",
        options: ["总收益率", "最大回撤", "跟单人数", "交易次数"],
        answer: 1,
        explanation: "最大回撤反映了交易员在最坏情况下从峰值到谷底的最大亏损幅度，是衡量风险控制能力的核心指标。一个总收益 200% 但最大回撤 80% 的交易员，风险远高于总收益 50% 但最大回撤只有 10% 的交易员。",
      },
    ],
    riskLevel: "medium",
    suitableFor: "没有时间主动交易的用户",
  },
  community: {
    icon: "💬",
    title: "社区功能",
    subtitle: "与全球交易者共同成长",
    description: "交易所社区功能提供交流、学习、信号分享等社交功能。Gate.io 的 Post（类推特社区）和 Binance Square 是目前最活跃的交易所社区，用户可以分享行情分析、交易策略、项目研究等内容。",
    howItWorks: [
      "发帖分享交易观点、市场分析",
      "关注 KOL（意见领袖）获取市场动态",
      "参与话题讨论，学习其他交易者的经验",
      "部分平台支持「一键跟单」直接复制 KOL 的交易",
    ],
    pros: ["获取多元化市场观点", "学习优秀交易者的分析方法", "及时获取项目动态和市场情绪", "建立人脉，发现合作机会"],
    cons: ["信息质量参差不齐，需要甄别", "容易受到 FOMO 情绪影响", "部分内容可能是付费推广", "时间成本较高"],
    tips: [
      "关注有历史记录的分析师，而非只看单次预测",
      "社区情绪可作为反向指标：极度乐观时谨慎，极度悲观时关注机会",
      "不要因为社区热议就冲动买入，做好自己的研究",
    ],
    quiz: [
      {
        question: "当加密货币社区中充斥着极度乐观情绪时，这通常意味着什么？",
        options: ["价格一定会继续上涨", "可能是市场见顶的信号", "是最佳买入时机", "与价格无关"],
        answer: 1,
        explanation: "「当所有人都在谈论某个资产时，可能已经是高点了」——这是经典的反向指标逻辑。极度乐观的市场情绪往往意味着大多数人已经买入，后续买盘减少，价格容易见顶回落。这不是绝对规律，但值得警惕。",
      },
    ],
    riskLevel: "low",
    suitableFor: "希望学习和交流的所有用户",
  },
  bot: {
    icon: "🤖",
    title: "交易机器人",
    subtitle: "7×24小时自动执行策略",
    description: "交易机器人根据预设策略自动执行交易，无需人工盯盘。主流策略包括网格机器人（区间震荡盈利）、DCA 定投机器人（定期买入摊低成本）、套利机器人等。Bitget 和 Bybit 的机器人功能最为丰富。",
    howItWorks: [
      "网格机器人：设置价格区间，在区间内低买高卖，震荡行情获利",
      "DCA 机器人：设置定投金额和频率，定期自动买入，摊低持仓成本",
      "套利机器人：利用不同交易所或不同合约之间的价差自动套利",
      "信号机器人：接收 TradingView 等平台的信号自动执行交易",
    ],
    pros: ["24小时不间断运行，不错过机会", "消除情绪化交易", "网格策略在震荡行情中表现优秀", "可以同时运行多个策略"],
    cons: ["趋势行情中网格策略可能亏损", "需要一定的初始设置知识", "极端行情可能导致策略失效", "需要定期检查和调整参数"],
    tips: [
      "网格机器人适合震荡行情，趋势行情中要及时暂停",
      "DCA 定投是最适合新手的机器人策略，长期持续买入",
      "从小资金开始测试机器人策略，验证有效后再加大投入",
    ],
    quiz: [
      {
        question: "网格机器人最适合哪种市场行情？",
        options: ["单边上涨行情", "单边下跌行情", "横盘震荡行情", "极端波动行情"],
        answer: 2,
        explanation: "网格机器人的逻辑是在设定的价格区间内低买高卖，在横盘震荡行情中可以频繁成交获利。在单边趋势行情中，价格会突破网格区间，导致策略失效甚至亏损。",
      },
    ],
    riskLevel: "medium",
    suitableFor: "希望自动化交易的用户",
  },
  otc: {
    icon: "🤝",
    title: "OTC 场外交易",
    subtitle: "大额交易的最优解",
    description: "OTC（Over-The-Counter）场外交易是指买卖双方直接协商价格进行大额交易，不通过公开市场撮合。适合大额资金出入金，避免对市场价格产生冲击（滑点）。各大交易所均提供 OTC 服务，通常需要 KYC 认证。",
    howItWorks: [
      "联系交易所 OTC 团队或通过平台 P2P 功能发布/接受报价",
      "双方协商价格（通常参考市场价加减点差）",
      "确认价格后，资金和加密货币同步转移",
      "交易所作为中间方提供担保，防止欺诈",
    ],
    pros: ["大额交易不影响市场价格", "价格透明，无滑点", "支持多种法币（人民币、港元、美元等）", "交易所背书，安全性高"],
    cons: ["通常有最低交易金额限制（$10,000+）", "需要完成 KYC 认证", "处理时间比自动撮合慢", "价差可能比市场价略高"],
    tips: [
      "OTC 主要适合单笔 $10,000 以上的大额交易",
      "比较多家 OTC 报价，选择最优价格",
      "确保通过官方渠道进行，避免私下 OTC 诈骗",
    ],
    quiz: [
      {
        question: "为什么大额交易者更倾向于使用 OTC 而非直接在市场下单？",
        options: ["OTC 手续费更低", "避免大额订单冲击市场价格（滑点）", "OTC 交易速度更快", "OTC 不需要 KYC"],
        answer: 1,
        explanation: "在公开市场下大额订单会「吃掉」多个价位的挂单，导致成交均价远差于当前市价（这就是滑点）。OTC 通过一对一协商，以固定价格完成整笔交易，避免了滑点损失。",
      },
    ],
    riskLevel: "low",
    suitableFor: "大额资金出入金的用户",
  },
  launchpad: {
    icon: "🚀",
    title: "打新（Launchpad）",
    subtitle: "第一时间参与新项目",
    description: "交易所 Launchpad 是新项目代币首发平台，用户可以在代币公开交易前以优惠价格认购。Binance Launchpad 是行业标杆，历史上推出了 Axie Infinity、Stepn 等现象级项目。参与通常需要持有平台币（BNB、OKB 等）。",
    howItWorks: [
      "持有平台币（BNB/OKB/GT/BGB 等）达到一定数量",
      "在快照期间持有，系统计算平均持仓量",
      "按持仓量分配认购额度",
      "以固定价格认购新代币，上市后通常有较大涨幅",
    ],
    pros: ["以低于市场的价格获得新代币", "参与优质项目的早期阶段", "历史上不少项目上市后大幅上涨", "持有平台币的额外收益"],
    cons: ["需要持有大量平台币，资金占用成本高", "优质项目认购竞争激烈，分配量少", "部分项目上市即跌破发行价", "锁仓期间无法使用资金"],
    tips: [
      "参与打新前研究项目基本面，不要只看交易所背书",
      "计算持有平台币的机会成本，综合评估是否值得",
      "上市首日往往是最高点，不要追高",
    ],
    quiz: [
      {
        question: "参与 Binance Launchpad 打新通常需要什么条件？",
        options: ["持有 BTC", "持有 BNB（币安平台币）", "完成 KYC 即可", "充值 USDT"],
        answer: 1,
        explanation: "Binance Launchpad 通常要求用户持有 BNB（币安平台币），系统根据快照期间的平均 BNB 持仓量来分配认购额度。持有 BNB 越多，获得的认购额度越大。其他交易所的打新也有类似的平台币持仓要求。",
      },
    ],
    riskLevel: "medium",
    suitableFor: "持有平台币、关注新项目的用户",
  },
  ecosystem: {
    icon: "🌿",
    title: "生态系统",
    subtitle: "交易所的完整产品矩阵",
    description: "头部交易所已不仅仅是交易平台，而是构建了完整的加密货币生态系统。包括自己的公链（BNB Chain、OKX Chain）、NFT 市场、GameFi 平台、支付卡、机构服务等，形成完整的加密金融生态。",
    howItWorks: [
      "公链生态：BNB Chain（Binance）、X Layer（OKX）等交易所自建公链",
      "NFT 市场：Binance NFT、OKX NFT 等一站式 NFT 交易平台",
      "支付服务：加密货币借记卡，在现实世界消费",
      "机构服务：为机构投资者提供托管、OTC、API 等专业服务",
    ],
    pros: ["一站式服务，减少跨平台操作", "平台币在生态内有更多使用场景", "公链生态提供更多 DeFi 机会", "机构级服务提升平台可信度"],
    cons: ["生态越大，复杂度越高", "平台币价值与生态发展强绑定", "公链竞争激烈，生态可能萎缩", "过于依赖单一平台存在集中风险"],
    tips: [
      "了解你使用的交易所的生态布局，有助于理解平台币的价值逻辑",
      "生态内的 DeFi 机会通常有更高风险，谨慎参与",
      "关注交易所公链的 TVL（总锁仓量）变化，反映生态健康度",
    ],
    quiz: [
      {
        question: "BNB Chain 与 Binance 交易所的关系是？",
        options: ["完全独立，没有关系", "BNB Chain 是 Binance 推出的公链，使用 BNB 作为原生代币", "BNB Chain 是以太坊的分叉", "BNB Chain 由比特币基金会管理"],
        answer: 1,
        explanation: "BNB Chain（原 Binance Smart Chain）是由 Binance 推出的公链，使用 BNB（币安平台币）作为原生代币支付 Gas 费。它是以太坊虚拟机（EVM）兼容链，交易速度快、费用低，是 Binance 生态的重要组成部分。",
      },
    ],
    riskLevel: "low",
    suitableFor: "希望深入了解交易所生态的用户",
  },
};

const RISK_CONFIG = {
  low: { label: "低风险", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", icon: Shield },
  medium: { label: "中等风险", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: AlertCircle },
  high: { label: "高风险", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: Zap },
};

const EXCHANGE_NAMES: Record<string, string> = {
  binance: "Binance",
  okx: "OKX",
  bybit: "Bybit",
  gate: "Gate.io",
  bitget: "Bitget",
};

export default function ExchangeFeatureDetail() {
  const { featureSlug } = useParams<{ featureSlug: string }>();
  const { language } = useLanguage();
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const [expandedExchange, setExpandedExchange] = useState<string | null>(null);

  const { data: supportData, isLoading } = trpc.exchangeGuide.featureSupport.useQuery(
    { featureSlug: featureSlug ?? "" },
    { enabled: !!featureSlug }
  );

  const content = featureSlug ? FEATURE_CONTENT[featureSlug] : null;

  if (!content) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">功能页面未找到</p>
          <Link href="/exchange-guide">
            <button className="bg-yellow-500 text-black px-6 py-2 rounded-xl font-bold">返回指南</button>
          </Link>
        </div>
      </div>
    );
  }

  const riskConfig = RISK_CONFIG[content.riskLevel];
  const RiskIcon = riskConfig.icon;

  const handleQuizAnswer = (qIndex: number, aIndex: number) => {
    if (quizSubmitted[qIndex]) return;
    setQuizAnswers(prev => ({ ...prev, [qIndex]: aIndex }));
  };

  const handleQuizSubmit = (qIndex: number) => {
    if (quizAnswers[qIndex] === undefined || quizAnswers[qIndex] === null) return;
    setQuizSubmitted(prev => ({ ...prev, [qIndex]: true }));
  };

  return (
    <div className="min-h-screen bg-[#0A192F]">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-[#0A192F]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* 左上角返回按钮 */}
          <Link href="/exchange-guide">
            <button className="flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">返回交易所扫盲指南</span>
              <span className="sm:hidden">返回</span>
            </button>
          </Link>

          {/* 功能标题 */}
          <div className="flex items-center gap-2">
            <span className="text-lg">{content.icon}</span>
            <span className="text-white font-bold text-sm sm:text-base">{content.title}</span>
          </div>

          {/* 右上角风险标签 */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${riskConfig.bg} ${riskConfig.color}`}>
            <RiskIcon className="w-3 h-3" />
            <span className="hidden sm:inline">{riskConfig.label}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Hero 区域 */}
        <div className="text-center py-6">
          <div className="text-6xl mb-4">{content.icon}</div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{content.title}</h1>
          <p className="text-yellow-400 font-semibold text-lg mb-4">{content.subtitle}</p>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${riskConfig.bg} ${riskConfig.color}`}>
            <RiskIcon className="w-4 h-4" />
            {riskConfig.label} · 适合：{content.suitableFor}
          </div>
        </div>

        {/* 功能介绍 */}
        <section className="bg-white/5 rounded-2xl border border-white/10 p-6 sm:p-8">
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <span className="text-yellow-400">📖</span> 什么是{content.title}？
          </h2>
          <p className="text-slate-300 leading-relaxed text-base">{content.description}</p>
        </section>

        {/* 运作原理 */}
        <section>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <span className="text-yellow-400">⚙️</span> 如何运作？
          </h2>
          <div className="space-y-3">
            {content.howItWorks.map((step, i) => (
              <div key={i} className="flex items-start gap-4 bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="w-7 h-7 rounded-full bg-yellow-500 text-black font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 优缺点对比 */}
        <section className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5">
            <h3 className="text-green-400 font-black mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> 优势
            </h3>
            <ul className="space-y-2">
              {content.pros.map((pro, i) => (
                <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
            <h3 className="text-red-400 font-black mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> 风险与局限
            </h3>
            <ul className="space-y-2">
              {content.cons.map((con, i) => (
                <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 新手贴士 */}
        <section className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6">
          <h2 className="text-yellow-400 font-black mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" /> 新手必读贴士
          </h2>
          <ul className="space-y-3">
            {content.tips.map((tip, i) => (
              <li key={i} className="text-slate-300 text-sm flex items-start gap-3">
                <span className="text-yellow-400 font-black flex-shrink-0">💡</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>

        {/* 五大交易所对比 */}
        <section>
          <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
            <span className="text-yellow-400">🏆</span> 五大交易所对比
          </h2>
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">加载中...</div>
          ) : (
            <div className="space-y-3">
              {supportData?.map((item) => (
                <div key={item.exchangeSlug} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedExchange(expandedExchange === item.exchangeSlug ? null : item.exchangeSlug)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-sm">{EXCHANGE_NAMES[item.exchangeSlug] ?? item.exchangeSlug}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        item.levelZh === "完整支持" ? "bg-green-500/20 text-green-400" :
                        item.levelZh === "部分支持" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {item.levelZh}
                      </span>
                      {item.highlight === 1 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400">
                          ⭐ 推荐
                        </span>
                      )}
                    </div>
                    {expandedExchange === item.exchangeSlug ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {expandedExchange === item.exchangeSlug && (
                    <div className="px-4 pb-4 border-t border-white/10 pt-3">
                      <p className="text-slate-300 text-sm leading-relaxed mb-3">{item.detailZh}</p>
                      {item.feeInfo && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                          <p className="text-yellow-400 text-xs font-bold mb-1">🌟 独特优势</p>
                          <p className="text-slate-300 text-sm">{item.feeInfo}</p>
                        </div>
                      )}
                      <Link href="/exchanges">
                        <button className="mt-3 flex items-center gap-1 text-yellow-400 text-xs hover:text-yellow-300 transition-colors">
                          查看 {EXCHANGE_NAMES[item.exchangeSlug]} 返佣链接 <ExternalLink className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 互动问答 */}
        <section>
          <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-yellow-400" /> 知识测验
          </h2>
          <p className="text-slate-400 text-sm mb-5">测试一下你对{content.title}的理解，选择正确答案！</p>
          <div className="space-y-6">
            {content.quiz.map((q, qIndex) => (
              <div key={qIndex} className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6">
                <p className="text-white font-bold mb-4 leading-relaxed">
                  <span className="text-yellow-400 mr-2">Q{qIndex + 1}.</span>{q.question}
                </p>
                <div className="space-y-2 mb-4">
                  {q.options.map((option, aIndex) => {
                    const isSelected = quizAnswers[qIndex] === aIndex;
                    const isSubmitted = quizSubmitted[qIndex];
                    const isCorrect = aIndex === q.answer;
                    let btnClass = "w-full text-left p-3 rounded-xl border text-sm transition-all ";
                    if (!isSubmitted) {
                      btnClass += isSelected
                        ? "border-yellow-500 bg-yellow-500/10 text-yellow-300"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/10";
                    } else {
                      if (isCorrect) btnClass += "border-green-500 bg-green-500/10 text-green-300";
                      else if (isSelected) btnClass += "border-red-500 bg-red-500/10 text-red-300";
                      else btnClass += "border-white/10 bg-white/5 text-slate-500";
                    }
                    return (
                      <button key={aIndex} className={btnClass} onClick={() => handleQuizAnswer(qIndex, aIndex)}>
                        <span className="font-bold mr-2">{String.fromCharCode(65 + aIndex)}.</span>{option}
                        {isSubmitted && isCorrect && <span className="ml-2 text-green-400">✓</span>}
                        {isSubmitted && isSelected && !isCorrect && <span className="ml-2 text-red-400">✗</span>}
                      </button>
                    );
                  })}
                </div>
                {!quizSubmitted[qIndex] ? (
                  <button
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-5 py-2 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleQuizSubmit(qIndex)}
                    disabled={quizAnswers[qIndex] === undefined || quizAnswers[qIndex] === null}
                  >
                    提交答案
                  </button>
                ) : (
                  <div className={`rounded-xl p-4 border ${quizAnswers[qIndex] === q.answer ? "bg-green-500/10 border-green-500/30" : "bg-orange-500/10 border-orange-500/30"}`}>
                    <p className={`font-bold text-sm mb-1 ${quizAnswers[qIndex] === q.answer ? "text-green-400" : "text-orange-400"}`}>
                      {quizAnswers[qIndex] === q.answer ? "🎉 回答正确！" : "💡 解析"}
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 底部 CTA */}
        <section className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-2xl p-6 sm:p-8 text-center">
          <h3 className="text-xl font-black text-white mb-2">准备好实践了吗？</h3>
          <p className="text-slate-400 text-sm mb-6">
            了解了{content.title}的原理，下一步就是选择合适的交易所开始体验。通过我们的合作伙伴链接注册，享受永久手续费返佣。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/exchanges">
              <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-6 py-3 rounded-xl transition-all hover:scale-105 text-sm">
                🎁 查看合作伙伴链接
              </button>
            </Link>
            <Link href="/exchange-guide">
              <button className="border border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-xl transition-all text-sm font-semibold">
                ← 返回功能列表
              </button>
            </Link>
            <Link href="/beginner">
              <button className="border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 px-6 py-3 rounded-xl transition-all text-sm font-semibold flex items-center gap-2 justify-center">
                <HelpCircle className="w-4 h-4" /> 有疑问？查看新手问答
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
