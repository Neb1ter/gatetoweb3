import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";

// ============================================================
// 数据定义
// ============================================================

const navSections = [
  { id: "intro", label: "什么是 Web3", icon: "🌐" },
  { id: "blockchain", label: "区块链基础", icon: "⛓️" },
  { id: "defi", label: "DeFi 金融", icon: "💰" },
  { id: "economy", label: "经济形势", icon: "📈" },
  { id: "invest", label: "投资方式", icon: "🔄" },
  { id: "start", label: "如何开始", icon: "🚀" },
];

const defiProducts = [
  {
    icon: "🏦",
    title: "去中心化借贷",
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/5",
    desc: "无需银行审批，用加密资产作抵押，即时获得贷款。利率由市场供需决定，全程透明公开。任何人都可以成为「银行」，向协议提供流动性赚取利息。",
    protocols: ["Aave", "Compound", "MakerDAO", "Venus"],
    apy: "存款年化 3-15%",
    detail: "Aave 是最大的 DeFi 借贷协议，锁仓量超过 100 亿美元。用户存入 ETH 可获得约 3-5% 年化收益，同时可借出其他资产。",
  },
  {
    icon: "🔄",
    title: "去中心化交易所（DEX）",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    bgColor: "bg-emerald-500/5",
    desc: "无需注册账号、无需 KYC，通过智能合约直接交换代币。资产始终在你的钱包中，没有任何人可以冻结你的资金。",
    protocols: ["Uniswap", "SushiSwap", "PancakeSwap", "Curve"],
    apy: "流动性挖矿 5-50%+",
    detail: "Uniswap 是最大的 DEX，日交易量超过 10 亿美元。通过 AMM（自动做市商）机制，无需对手方即可完成交易。",
  },
  {
    icon: "🌾",
    title: "收益农场",
    color: "text-yellow-400",
    borderColor: "border-yellow-500/30",
    bgColor: "bg-yellow-500/5",
    desc: "将资产存入 DeFi 协议提供流动性，赚取交易手续费和协议代币奖励。通过复利策略，可以大幅提高资金利用效率。",
    protocols: ["Curve", "Convex", "Yearn", "Beefy"],
    apy: "年化收益 5-100%+",
    detail: "Yearn Finance 会自动将你的资产分配到收益最高的协议，省去手动操作的麻烦，被称为「DeFi 机器人理财」。",
  },
  {
    icon: "🎯",
    title: "质押挖矿",
    color: "text-purple-400",
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/5",
    desc: "持有并质押代币参与网络验证，获得区块奖励。以太坊转 PoS 后，质押 ETH 可获得约 4-5% 的年化收益，风险相对较低。",
    protocols: ["Ethereum", "Solana", "Polkadot", "Lido"],
    apy: "质押年化 4-12%",
    detail: "Lido 是最大的流动性质押协议，让用户在质押 ETH 的同时获得 stETH 代币，可继续在 DeFi 中使用。",
  },
];

const investMethods = [
  {
    type: "CEX",
    fullName: "中心化交易所",
    icon: "🏢",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/40",
    badge: "推荐新手",
    badgeBg: "bg-yellow-500 text-black",
    pros: [
      "界面友好，操作简单，有中文客服",
      "支持法币直接入金（银行卡/支付宝）",
      "流动性好，大额交易不滑点",
      "合规监管，资金相对安全",
      "提供杠杆、合约等多种交易工具",
    ],
    cons: [
      "需要 KYC 实名认证",
      "资产托管在交易所（非自托管）",
      "可能受监管政策影响",
    ],
    examples: ["Binance 币安", "OKX 欧易", "Gate.io 芝麻开门", "Bybit", "Bitget"],
    suitable: "99% 的新手首选，操作门槛最低",
    risk: "低",
    riskColor: "text-green-400",
    riskBg: "bg-green-500/10 border-green-500/30",
  },
  {
    type: "DEX",
    fullName: "去中心化交易所",
    icon: "🔄",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/40",
    badge: "进阶用户",
    badgeBg: "bg-emerald-600 text-white",
    pros: [
      "无需注册，无需 KYC，匿名交易",
      "资产完全自托管，无法被冻结",
      "可交易更多小众代币（早期机会）",
      "抗审查，无法被封号",
    ],
    cons: [
      "需要自行管理钱包（助记词丢失=资产永久丢失）",
      "Gas 费用较高，小额交易不划算",
      "界面相对复杂，学习成本高",
      "出问题无客服，完全自负责任",
    ],
    examples: ["Uniswap", "PancakeSwap", "dYdX", "GMX", "Jupiter"],
    suitable: "有一定经验，追求完全去中心化",
    risk: "中",
    riskColor: "text-yellow-400",
    riskBg: "bg-yellow-500/10 border-yellow-500/30",
  },
  {
    type: "链上投资",
    fullName: "DeFi 协议直接参与",
    icon: "⛓️",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/40",
    badge: "高级玩家",
    badgeBg: "bg-purple-600 text-white",
    pros: [
      "最高潜在收益（早期协议空投）",
      "完全去中心化，无需信任任何机构",
      "参与协议治理，影响项目发展",
      "多链机会（以太坊/BSC/Solana/Sui）",
    ],
    cons: [
      "智能合约漏洞风险（历史上多次被黑客攻击）",
      "操作极其复杂，学习曲线陡峭",
      "无监管保护，出问题无法追回",
      "Gas 费用高，小资金不划算",
    ],
    examples: ["Aave 借贷", "Curve 流动性", "Eigenlayer 再质押", "Pendle 收益代币化"],
    suitable: "深度参与者，充分理解智能合约风险",
    risk: "高",
    riskColor: "text-red-400",
    riskBg: "bg-red-500/10 border-red-500/30",
  },
];

const economyStats = [
  { label: "全球加密市值", value: "$3.2T", sub: "2024年峰值", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { label: "DeFi 锁仓量", value: "$200B+", sub: "TVL 2024", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "全球加密用户", value: "5.8亿+", sub: "2024年估计", color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "比特币10年涨幅", value: "100万%+", sub: "2014-2024", color: "text-purple-400", bg: "bg-purple-500/10" },
];

const startSteps = [
  {
    step: "01",
    title: "选择主流交易所注册",
    desc: "对于新手，强烈推荐从中心化交易所（CEX）开始。界面友好、支持法币入金、有客服支持。推荐 OKX、Binance 或 Gate.io，通过邀请码注册还能享受手续费返佣，长期省下不少费用。",
    action: "前往查看返佣邀请码",
    href: "/crypto-saving",
    color: "text-yellow-400",
    borderColor: "border-yellow-500/40",
    bgColor: "bg-yellow-500/10",
    icon: "🏢",
    tip: "使用邀请码注册可享受最高 30% 手续费返佣",
  },
  {
    step: "02",
    title: "完成 KYC 实名认证",
    desc: "上传身份证件完成实名认证，这是合规要求，也是保护你账户安全的必要步骤。认证后才能使用法币入金和提现功能。整个过程通常 5-10 分钟完成。",
    action: "了解 KYC 流程",
    href: "/exchange-guide",
    color: "text-blue-400",
    borderColor: "border-blue-500/40",
    bgColor: "bg-blue-500/10",
    icon: "🪪",
    tip: "KYC 是保护你账户安全的必要步骤",
  },
  {
    step: "02.5",
    title: "了解钱包与私鑰安全",
    desc: "在进行任何操作之前，了解钱包和私鑰的基础知识至关重要。助记词是你资产的最后保障，一旦泄露就会导致资产永久丢失。就算是使用交易所，了解这些知识也能让你更安全地使用加密资产。",
    action: "学习钱包安全知识",
    href: "/web3-guide/wallet-keys",
    color: "text-violet-400",
    borderColor: "border-violet-500/40",
    bgColor: "bg-violet-500/10",
    icon: "🔐",
    tip: "了解私鑰和助记词，是进入 Web3 的必修课",
  },
  {
    step: "03",
    title: "小额入金，购买主流币",
    desc: "建议从 500-1000 元人民币开始，购买比特币（BTC）或以太坊（ETH）等主流币。不要一开始就追求高收益的小币，先熟悉操作流程，了解市场节奏。",
    action: "查看交易所对比",
    href: "/exchanges",
    color: "text-emerald-400",
    borderColor: "border-emerald-500/40",
    bgColor: "bg-emerald-500/10",
    icon: "💰",
    tip: "BTC 和 ETH 是最安全的入门选择",
  },
  {
    step: "04",
    title: "持续学习，逐步深入",
    desc: "了解 K 线图、技术分析基础，关注市场动态。等熟悉了 CEX 操作后，再逐步探索 DeFi 和链上投资。记住：永远不要投入超出你承受范围的资金，风险管理是第一位的。",
    action: "查看新手问答",
    href: "/beginner",
    color: "text-purple-400",
    borderColor: "border-purple-500/40",
    bgColor: "bg-purple-500/10",
    icon: "📚",
    tip: "持续学习是在加密市场长期生存的关键",
  },
];

// ============================================================
// 工具 Hook：滚动进入视野触发动画
// ============================================================
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ============================================================
// 渐入动画容器
// ============================================================
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// Web1/2/3 互动演示组件
// ============================================================
function WebEvolutionDemo() {
  const [activeEra, setActiveEra] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const eras = [
    {
      era: "Web 1.0",
      period: "1991 — 2004",
      color: "#60A5FA",
      bgGradient: "from-blue-900/40 to-blue-800/20",
      borderColor: "border-blue-500/50",
      btnColor: "bg-blue-600 hover:bg-blue-500",
      icon: "📄",
      title: "只读互联网",
      subtitle: "Read-Only",
      analogy: "就像一本数字百科全书，你只能读，不能写。",
      userAction: "你是访客，只能浏览",
      dataOwner: "网站所有者",
      // 模拟界面
      demo: {
        type: "readonly",
        content: "欢迎来到新浪门户网站\n今日头条：...\n体育新闻：...\n娱乐资讯：...",
        userOptions: ["浏览新闻", "查看图片", "阅读文章"],
        blocked: ["发表评论", "上传内容", "互动交流"],
      },
      features: [
        { icon: "👁️", text: "只能浏览，无法互动" },
        { icon: "📰", text: "内容由网站编辑控制" },
        { icon: "🔒", text: "数据属于网站所有者" },
        { icon: "🌐", text: "静态页面，单向传播" },
      ],
    },
    {
      era: "Web 2.0",
      period: "2004 — 至今",
      color: "#A78BFA",
      bgGradient: "from-purple-900/40 to-purple-800/20",
      borderColor: "border-purple-500/50",
      btnColor: "bg-purple-600 hover:bg-purple-500",
      icon: "👥",
      title: "读写互联网",
      subtitle: "Read-Write",
      analogy: "你可以发帖、评论，但你的数据和内容属于平台，不属于你。",
      userAction: "你是用户，可以创作",
      dataOwner: "平台（微信/抖音/微博）",
      demo: {
        type: "readwrite",
        content: "你发布了一条视频，获得了 10 万播放量！\n但是...\n平台随时可以：删除你的内容\n封禁你的账号\n拿走你的数据卖广告",
        userOptions: ["发帖", "评论", "上传视频", "建立粉丝"],
        blocked: ["拥有数据", "带走粉丝", "控制账号"],
      },
      features: [
        { icon: "✍️", text: "可以发布内容，互动交流" },
        { icon: "📊", text: "你的数据被平台收集变现" },
        { icon: "⚠️", text: "账号随时可能被封禁" },
        { icon: "🏢", text: "平台垄断，数据不可携带" },
      ],
    },
    {
      era: "Web 3.0",
      period: "2020 — 未来",
      color: "#6EE7B7",
      bgGradient: "from-emerald-900/40 to-teal-800/20",
      borderColor: "border-emerald-500/50",
      btnColor: "bg-emerald-600 hover:bg-emerald-500",
      icon: "🔗",
      title: "读写拥有互联网",
      subtitle: "Read-Write-Own",
      analogy: "你的数据、资产、身份都真正属于你，没有任何平台可以剥夺。",
      userAction: "你是所有者，完全自主",
      dataOwner: "你自己（钱包地址）",
      demo: {
        type: "own",
        content: "你的数字资产存在区块链上\n没有任何人可以冻结\n没有任何人可以删除\n没有任何人可以剥夺\n代码即法律，规则透明",
        userOptions: ["拥有数字资产", "控制个人数据", "参与协议治理", "跨平台使用身份"],
        blocked: [],
      },
      features: [
        { icon: "🔑", text: "资产真正属于你，自托管" },
        { icon: "🌐", text: "去中心化，无单点故障" },
        { icon: "📜", text: "智能合约自动执行，无需信任" },
        { icon: "💎", text: "代币激励，参与者共享价值" },
      ],
    },
  ];

  const handleEraChange = (idx: number) => {
    if (isAnimating || idx === activeEra) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActiveEra(idx);
      setIsAnimating(false);
    }, 300);
  };

  const current = eras[activeEra];

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 overflow-hidden mb-12">
      {/* 标签切换 */}
      <div className="flex border-b border-slate-700/60">
        {eras.map((era, i) => (
          <button
            key={i}
            onClick={() => handleEraChange(i)}
            className={`flex-1 py-3 px-2 text-xs sm:text-sm font-bold transition-all duration-300 ${
              activeEra === i
                ? `text-white border-b-2`
                : "text-slate-500 hover:text-slate-300"
            }`}
            style={activeEra === i ? { borderBottomColor: era.color, color: era.color } : {}}
          >
            <span className="hidden sm:inline">{era.icon} </span>
            {era.era}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div
        className={`p-5 sm:p-8 bg-gradient-to-br ${current.bgGradient} transition-all duration-300`}
        style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? "translateY(8px)" : "translateY(0)" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：说明 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{current.icon}</span>
              <div>
                <h3 className="text-2xl font-black text-white">{current.era}</h3>
                <div className="text-sm font-mono" style={{ color: current.color }}>{current.period} · {current.subtitle}</div>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {current.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-black/20">
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-slate-200 text-sm">{f.text}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-black/30 border" style={{ borderColor: current.color + "40" }}>
              <p className="text-sm italic" style={{ color: current.color }}>
                💬 "{current.analogy}"
              </p>
            </div>
          </div>

          {/* 右侧：模拟界面 */}
          <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
            {/* 模拟浏览器顶栏 */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 border-b border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <div className="flex-1 mx-2 bg-slate-700/60 rounded text-xs text-slate-400 px-2 py-0.5 text-center truncate">
                {activeEra === 0 ? "www.sina.com.cn" : activeEra === 1 ? "app.weibo.com" : "app.uniswap.org"}
              </div>
            </div>

            <div className="p-4">
              {/* 数据所有权标识 */}
              <div className="flex items-center justify-between mb-3 p-2 rounded-lg bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400">数据所有者</span>
                <span className="text-xs font-bold" style={{ color: current.color }}>{current.dataOwner}</span>
              </div>

              {/* 可以做的事 */}
              <div className="mb-3">
                <div className="text-xs text-slate-500 mb-2">✅ 你可以做：</div>
                <div className="flex flex-wrap gap-1.5">
                  {current.demo.userOptions.map((opt) => (
                    <span key={opt} className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                      {opt}
                    </span>
                  ))}
                </div>
              </div>

              {/* 不能做的事 */}
              {current.demo.blocked.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-slate-500 mb-2">🚫 你无法：</div>
                  <div className="flex flex-wrap gap-1.5">
                    {current.demo.blocked.map((item) => (
                      <span key={item} className="text-xs px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 line-through">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 内容展示 */}
              <div className="p-3 rounded-lg bg-black/30 border border-white/5">
                <pre className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed font-sans">{current.demo.content}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* 底部导航按钮 */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => handleEraChange(Math.max(0, activeEra - 1))}
            disabled={activeEra === 0}
            className="text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            ← 上一个时代
          </button>
          <div className="flex gap-2">
            {eras.map((_, i) => (
              <button
                key={i}
                onClick={() => handleEraChange(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === activeEra ? current.color : "#475569" }}
              />
            ))}
          </div>
          <button
            onClick={() => handleEraChange(Math.min(eras.length - 1, activeEra + 1))}
            disabled={activeEra === eras.length - 1}
            className="text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            下一个时代 →
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 区块链互动演示：模拟区块打包过程
// ============================================================
function BlockchainDemo() {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [txHash, setTxHash] = useState("");

  const steps = [
    { label: "发起交易", desc: "Alice 向 Bob 发送 0.1 BTC", icon: "📤", color: "text-blue-400" },
    { label: "广播网络", desc: "交易被广播到全球节点", icon: "📡", color: "text-yellow-400" },
    { label: "节点验证", desc: "数千个节点验证交易合法性", icon: "✅", color: "text-emerald-400" },
    { label: "打包区块", desc: "矿工将交易打包进新区块", icon: "📦", color: "text-purple-400" },
    { label: "链上确认", desc: "区块永久写入区块链，不可篡改", icon: "🔒", color: "text-emerald-400" },
  ];

  const runDemo = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStep(0);
    setTxHash("");
    for (let i = 0; i <= steps.length - 1; i++) {
      await new Promise((r) => setTimeout(r, 900));
      setStep(i + 1);
      if (i === steps.length - 1) {
        setTxHash("0x" + Math.random().toString(16).slice(2, 18).toUpperCase() + "...");
      }
    }
    setIsRunning(false);
  }, [isRunning]);

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 sm:p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-blue-400 mb-1">⛓️ 区块链交易流程演示</h3>
          <p className="text-slate-400 text-sm">点击按钮，看看一笔比特币交易是如何完成的</p>
        </div>
        <button
          onClick={runDemo}
          disabled={isRunning}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all"
        >
          {isRunning ? "处理中..." : step > 0 ? "重新演示" : "▶ 开始演示"}
        </button>
      </div>

      {/* 步骤流程 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 mb-6">
        {steps.map((s, i) => (
          <div key={i} className="flex sm:flex-col items-center gap-2 sm:gap-0 flex-1">
            <div className="flex items-center sm:flex-col gap-2 sm:gap-1 flex-1 sm:flex-none">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-500 border-2 ${
                  step > i
                    ? "border-emerald-500 bg-emerald-500/20 scale-110"
                    : step === i && isRunning
                    ? "border-yellow-500 bg-yellow-500/20 animate-pulse"
                    : "border-slate-700 bg-slate-800/50"
                }`}
              >
                {s.icon}
              </div>
              <div className="sm:text-center">
                <div className={`text-xs font-bold transition-colors ${step > i ? "text-emerald-400" : "text-slate-500"}`}>
                  {s.label}
                </div>
                <div className="text-xs text-slate-600 hidden sm:block max-w-[80px] text-center leading-tight mt-0.5">
                  {s.desc}
                </div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`hidden sm:block h-0.5 flex-1 mx-1 transition-all duration-500 ${step > i ? "bg-emerald-500" : "bg-slate-700"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* 当前步骤说明 */}
      <div className="p-4 rounded-xl bg-black/30 border border-white/10 min-h-[60px] transition-all">
        {step === 0 ? (
          <p className="text-slate-500 text-sm text-center">点击"开始演示"查看区块链交易流程</p>
        ) : step <= steps.length ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">{steps[step - 1].icon}</span>
            <div>
              <div className={`font-bold text-sm ${steps[step - 1].color}`}>{steps[step - 1].label}</div>
              <div className="text-slate-300 text-sm">{steps[step - 1].desc}</div>
            </div>
            {isRunning && step <= steps.length && (
              <div className="ml-auto flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>
        ) : null}
        {txHash && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-sm font-bold">✅ 交易已确认！</span>
              <span className="text-xs text-slate-500 font-mono">{txHash}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">此交易已永久记录在区块链上，任何人都无法修改或删除。</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 哈希演示：输入任意文字，看哈希值变化
// ============================================================
function HashDemo() {
  const [input, setInput] = useState("币安学院");
  const [hash, setHash] = useState("");

  useEffect(() => {
    // 简单模拟哈希（非真实 SHA256，仅演示用）
    const mockHash = async (str: string) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    };
    mockHash(input || " ").then(setHash);
  }, [input]);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5 mb-4">
      <h4 className="text-sm font-bold text-slate-300 mb-3">🔐 哈希函数体验：输入任意文字，看输出如何变化</h4>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">输入内容（随意修改）</label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="输入任意文字..."
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">SHA-256 哈希值（改变一个字符，输出完全不同）</label>
          <div className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 font-mono text-xs text-blue-300 break-all">
            {hash || "..."}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          💡 注意：即使只改动一个字符，哈希值也会完全不同。这就是区块链「不可篡改」的密码学基础。
        </p>
      </div>
    </div>
  );
}

// ============================================================
// 数字计数动画
// ============================================================
function CountUp({ target, suffix = "", duration = 2000 }: { target: string; suffix?: string; duration?: number }) {
  const { ref, inView } = useInView();
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    // 如果目标包含非数字，直接显示
    const num = parseFloat(target.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) { setDisplay(target); return; }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * num);
      setDisplay(target.replace(/[0-9.]+/, current.toString()));
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ============================================================
// SectionTitle 组件
// ============================================================
function SectionTitle({ id, icon, title, subtitle }: { id: string; icon: string; title: string; subtitle: string }) {
  return (
    <FadeIn>
      <div id={id} className="scroll-mt-20 mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{icon}</span>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-600 to-transparent" />
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2">{title}</h2>
        <p className="text-slate-400 text-base sm:text-lg">{subtitle}</p>
      </div>
    </FadeIn>
  );
}

// ============================================================
// 主组件
// ============================================================
export default function Web3Guide() {
  const [activeSection, setActiveSection] = useState("intro");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const [expandedDefi, setExpandedDefi] = useState<number | null>(null);

  // 页面进入渐入动画
  useEffect(() => {
    const t = setTimeout(() => setPageVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // 滚动监听，更新活跃导航项
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    navSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileNavOpen(false);
  };

  return (
    <div
      className="min-h-screen bg-[#050D1A] text-white"
      style={{
        opacity: pageVisible ? 1 : 0,
        transform: pageVisible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {/* ===== 顶部导航栏 ===== */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#050D1A]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回主页
              </button>
            </Link>
            <div className="w-px h-4 bg-slate-700" />
            <span className="text-emerald-400 font-bold text-sm hidden sm:block">Web3 入圈指南</span>
          </div>

          {/* 桌面端导航 */}
          <nav className="hidden lg:flex items-center gap-1">
            {navSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeSection === sec.id
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {sec.icon} {sec.label}
              </button>
            ))}
          </nav>

          {/* 移动端菜单按钮 */}
          <button
            className="lg:hidden text-slate-400 hover:text-white p-2"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* 移动端下拉导航 */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-[#050D1A]/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-2">
              {navSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                    activeSection === sec.id
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <span>{sec.icon}</span>
                  <span>{sec.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* ===== Hero ===== */}
        <div className="text-center mb-16 sm:mb-20">
          <FadeIn delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              面向圈外人的 Web3 完整入门指南
            </div>
          </FadeIn>
          <FadeIn delay={200}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
              <span className="text-white">进入 </span>
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #6EE7B7, #3B82F6, #8B5CF6)" }}
              >
                Web3
              </span>
              <span className="text-white"> 世界</span>
              <br />
              <span className="text-2xl sm:text-3xl text-slate-400 font-bold">你需要知道的一切</span>
            </h1>
          </FadeIn>
          <FadeIn delay={300}>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              从区块链的诞生到 DeFi 的爆发，从 Web1 到 Web3 的演进，
              再到如何迈出你的第一步投资——本指南将带你系统了解这个改变世界的技术浪潮。
            </p>
          </FadeIn>
          <FadeIn delay={400}>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {navSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className="px-4 py-2 rounded-full border border-slate-700 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
                >
                  {sec.icon} {sec.label}
                </button>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* ===== 深度内容引导提示横幅 ===== */}
        <FadeIn className="mb-10">
          <div className="rounded-2xl border border-dashed border-slate-600/60 bg-gradient-to-r from-slate-800/40 via-slate-800/20 to-slate-800/40 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-lg">📚</span>
                <span className="text-sm font-bold text-slate-300">每个板块都有深度内容</span>
              </div>
              <div className="flex-1 text-xs text-slate-500 leading-relaxed">
                本页面是概览导览，每个章节末尾都有「深入学习」按钮，点击可进入专属深度页面，获取更详细的知识、互动演示和实操指南。
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {[
                  { label: "Web3基础", color: "bg-emerald-500/20 text-emerald-400" },
                  { label: "区块链", color: "bg-blue-500/20 text-blue-400" },
                  { label: "钱包安全", color: "bg-violet-500/20 text-violet-400" },
                  { label: "DeFi", color: "bg-yellow-500/20 text-yellow-400" },
                  { label: "投资门户", color: "bg-orange-500/20 text-orange-400" },
                  { label: "交易所", color: "bg-emerald-500/20 text-emerald-400" },
                ].map((tag) => (
                  <span key={tag.label} className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full ${tag.color}`}>{tag.label}</span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ===== Section 1: 什么是 Web3 ===== */}
        <SectionTitle id="intro" icon="🌐" title="什么是 Web3？" subtitle="互联网的第三次进化——从只读到拥有" />

        <FadeIn className="mb-6">
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-5 sm:p-7">
            <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
              Web3 是互联网的下一个阶段。如果说 Web1 是「只能看」，Web2 是「可以发帖但数据属于平台」，
              那么 <strong className="text-emerald-400">Web3 就是真正属于用户自己的互联网</strong>——你的数据、资产、
              数字身份都存储在区块链上，没有任何公司或政府可以控制或剥夺。
            </p>
          </div>
        </FadeIn>

        {/* Web1/2/3 互动演示 */}
        <FadeIn>
          <WebEvolutionDemo />
        </FadeIn>

        {/* Web3 核心理念 */}
        <FadeIn>
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-6 sm:p-8 mb-16">
            <h3 className="text-xl font-bold text-emerald-400 mb-6">🎯 Web3 的三大核心理念</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "所有权（Ownership）", desc: "你的数字资产、数据和身份真正属于你，不受任何平台控制。NFT、DeFi 代币都是你真实拥有的资产。", icon: "🔑", color: "text-yellow-400" },
                { title: "无需许可（Permissionless）", desc: "任何人都可以参与，无需申请账号、无需审批，代码即规则。全球 17 亿无银行账户的人也能参与。", icon: "🚪", color: "text-blue-400" },
                { title: "去信任化（Trustless）", desc: "通过智能合约自动执行，无需信任任何中间人或机构。代码公开透明，规则不可更改。", icon: "🤝", color: "text-purple-400" },
              ].map((item) => (
                <div key={item.title} className="p-5 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h4 className={`font-bold text-sm mb-2 ${item.color}`}>{item.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            {/* 深入学习按钮 */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-slate-500 text-xs">想深入了解 Web1/2/3 的演进历史、数据所有权原理？</p>
              <Link href="/web3-guide/what-is-web3">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-sm font-bold transition-all whitespace-nowrap">
                  📖 深入学习 Web3 基础 →
                </button>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* ===== Section 2: 区块链基础 ===== */}
        <SectionTitle id="blockchain" icon="⛓️" title="区块链基础" subtitle="支撑 Web3 世界的底层技术——理解它，才能真正理解 Web3" />

        <FadeIn>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 sm:p-8 mb-8">
            <h3 className="text-lg font-bold text-blue-400 mb-4">📖 什么是区块链？</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              区块链是一种<strong className="text-white">分布式账本技术</strong>。想象一本账本，
              不是存在银行服务器上，而是同时存在全球<strong className="text-blue-300">数千台电脑</strong>上。
              每一笔交易都被打包成「区块」，通过密码学连接成「链」，任何人都无法单独修改历史记录。
            </p>
            <p className="text-slate-300 leading-relaxed mb-5">
              区块链的革命性在于：它第一次让人类可以在<strong className="text-white">不信任任何中间人</strong>的情况下，
              安全地传递价值。就像 Email 让信息传递不再需要邮局，区块链让价值传递不再需要银行。
            </p>
            <div className="flex flex-wrap gap-2">
              {["比特币（BTC）", "以太坊（ETH）", "BNB Chain", "Solana", "Polygon", "Avalanche"].map((chain) => (
                <span key={chain} className="text-xs px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300">
                  {chain}
                </span>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* 区块链交易演示 */}
        <FadeIn>
          <BlockchainDemo />
        </FadeIn>

        {/* 哈希函数体验 */}
        <FadeIn>
          <HashDemo />
        </FadeIn>

        {/* 区块链四大特性 */}
        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: "🔒", title: "不可篡改", color: "text-blue-400", borderColor: "border-blue-500/30", desc: "数据一旦写入区块链，任何人（包括开发者）都无法修改或删除，历史记录永久保存。", example: "就像在石头上刻字，而不是在沙子上写字。" },
              { icon: "🌐", title: "去中心化", color: "text-emerald-400", borderColor: "border-emerald-500/30", desc: "没有单一的控制中心，数据分布在全球数千个节点上，没有任何一方可以单独控制整个网络。", example: "就像 BitTorrent 下载，没有中央服务器，人人都是节点。" },
              { icon: "🔍", title: "透明可验证", color: "text-yellow-400", borderColor: "border-yellow-500/30", desc: "所有交易记录公开可查，任何人都可以在区块链浏览器上验证任意一笔交易的真实性。", example: "就像一本全世界都能看到的公开账本，无法造假。" },
              { icon: "📜", title: "智能合约", color: "text-purple-400", borderColor: "border-purple-500/30", desc: "代码自动执行合约条款，无需中间人。条件满足时自动触发，不受任何人干预，不可更改。", example: "就像自动售货机：投币 → 选择 → 自动出货，无需店员。" },
            ].map((feat, i) => (
              <div key={i} className={`rounded-xl border ${feat.borderColor} bg-slate-800/30 p-5 hover:bg-slate-800/50 transition-colors`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{feat.icon}</span>
                  <h4 className={`font-bold text-lg ${feat.color}`}>{feat.title}</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">{feat.desc}</p>
                <div className="p-3 rounded-lg bg-black/20 border border-white/5">
                  <p className="text-slate-400 text-xs italic">💡 {feat.example}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* 主流区块链对比 */}
        <FadeIn>
          <div className="rounded-2xl border border-slate-700 overflow-hidden mb-16">
            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700">
              <h3 className="font-bold text-white">主流区块链对比</h3>
              <p className="text-slate-400 text-xs mt-1">不同区块链各有侧重，了解差异有助于选择合适的投资标的</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/30">
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">区块链</th>
                    <th className="text-center px-4 py-3 text-slate-400 font-medium">代币</th>
                    <th className="text-center px-4 py-3 text-slate-400 font-medium">特点</th>
                    <th className="text-center px-4 py-3 text-slate-400 font-medium">TPS</th>
                    <th className="text-center px-4 py-3 text-slate-400 font-medium">适合场景</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["₿ 比特币", "BTC", "数字黄金，最安全", "7", "价值储存"],
                    ["Ξ 以太坊", "ETH", "智能合约鼻祖", "15-30", "DeFi / NFT"],
                    ["◎ Solana", "SOL", "高速低费", "65,000+", "高频交易 / 游戏"],
                    ["⬡ BNB Chain", "BNB", "币安生态", "300+", "低成本 DeFi"],
                    ["⬡ Polygon", "MATIC", "以太坊 L2", "7,000+", "低成本以太坊应用"],
                  ].map(([chain, token, feature, tps, use], i) => (
                    <tr key={i} className={`border-b border-slate-800 ${i % 2 === 0 ? "bg-slate-800/20" : ""}`}>
                      <td className="px-4 py-3 text-white font-medium">{chain}</td>
                      <td className="px-4 py-3 text-yellow-400 text-center font-mono font-bold">{token}</td>
                      <td className="px-4 py-3 text-slate-300 text-center">{feature}</td>
                      <td className="px-4 py-3 text-blue-300 text-center font-mono">{tps}</td>
                      <td className="px-4 py-3 text-emerald-300 text-center">{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 深入学习按钮 */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-slate-500 text-xs">想深入了解共识机制、Layer2、Gas 费等技术细节？</p>
              <Link href="/web3-guide/blockchain-basics">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 text-sm font-bold transition-all whitespace-nowrap">
                  ⛓️ 深入学习区块链技术 →
                </button>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* ===== Section 3: DeFi ===== */}
        <SectionTitle id="defi" icon="💰" title="DeFi：去中心化金融" subtitle="无需银行，人人可参与的开放金融体系" />

        <FadeIn>
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 sm:p-8 mb-8">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">💡 DeFi 是什么？</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              DeFi（Decentralized Finance，去中心化金融）是建立在区块链上的金融服务体系。
              传统金融需要银行、券商等中间机构，而 DeFi 通过<strong className="text-white">智能合约</strong>
              自动执行所有金融操作——借贷、交易、理财——无需任何机构审批，全球任何人都可以参与。
            </p>
            <p className="text-slate-300 leading-relaxed">
              根据 DeFiLlama 数据，2024 年 DeFi 协议锁仓总价值（TVL）超过 <strong className="text-yellow-300">2000 亿美元</strong>，
              日交易量超过 <strong className="text-yellow-300">100 亿美元</strong>。这个「无银行的金融体系」正在快速成长。
            </p>
          </div>
        </FadeIn>

        {/* DeFi 产品矩阵（可展开） */}
        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {defiProducts.map((prod, i) => (
              <div
                key={i}
                className={`rounded-xl border ${prod.borderColor} ${prod.bgColor} p-5 cursor-pointer transition-all hover:scale-[1.01]`}
                onClick={() => setExpandedDefi(expandedDefi === i ? null : i)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{prod.icon}</span>
                    <h4 className={`font-bold ${prod.color}`}>{prod.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                      {prod.apy}
                    </span>
                    <span className="text-slate-500 text-xs">{expandedDefi === i ? "▲" : "▼"}</span>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-3">{prod.desc}</p>
                {expandedDefi === i && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
                    <p className="text-slate-400 text-xs leading-relaxed bg-black/20 p-3 rounded-lg">
                      📖 {prod.detail}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {prod.protocols.map((p) => (
                        <span key={p} className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </FadeIn>

        {/* DeFi vs 传统金融对比 */}
        <FadeIn>
          <div className="rounded-2xl border border-slate-700 overflow-hidden mb-16">
            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700">
              <h3 className="font-bold text-white">DeFi vs 传统金融对比</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-4 py-3 text-slate-400 font-medium">对比维度</th>
                    <th className="text-center px-4 py-3 text-slate-400 font-medium">传统金融</th>
                    <th className="text-center px-4 py-3 text-emerald-400 font-medium">DeFi</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["准入门槛", "需要银行账户、身份证明", "只需一个钱包地址"],
                    ["运营时间", "工作日 9:00-17:00", "7×24 小时不间断"],
                    ["透明度", "黑箱操作，不透明", "代码开源，完全透明"],
                    ["存款利率", "银行决定，通常 1-3%", "市场决定，通常 3-15%+"],
                    ["资产控制", "银行托管，可能被冻结", "自托管，完全自主"],
                    ["地域限制", "受国家监管限制", "全球无边界访问"],
                    ["结算速度", "T+1 或 T+2 工作日", "秒级确认"],
                  ].map(([dim, trad, defi], i) => (
                    <tr key={i} className={`border-b border-slate-800 ${i % 2 === 0 ? "bg-slate-800/20" : ""}`}>
                      <td className="px-4 py-3 text-slate-300 font-medium">{dim}</td>
                      <td className="px-4 py-3 text-slate-400 text-center">{trad}</td>
                      <td className="px-4 py-3 text-emerald-300 text-center">{defi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 深入学习按钮 */}
            <div className="px-6 py-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-slate-500 text-xs">想深入了解 AMM 原理、流动性挖矿、收益计算？</p>
              <Link href="/web3-guide/defi-deep">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 text-sm font-bold transition-all whitespace-nowrap">
                  💰 深入学习 DeFi 玩法 →
                </button>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* ===== Section 4: 经济形势 ===== */}
        <SectionTitle id="economy" icon="📈" title="经济形势与 Web3 机遇" subtitle="为什么现在是了解 Web3 的最佳时机" />

        {/* 数据统计卡片（带计数动画） */}
        <FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {economyStats.map((stat, i) => (
              <div key={i} className={`rounded-xl border border-slate-700/50 ${stat.bg} p-4 text-center`}>
                <div className={`text-xl sm:text-2xl font-black ${stat.color} mb-1`}>
                  <CountUp target={stat.value} />
                </div>
                <div className="text-slate-300 text-xs font-medium mb-1">{stat.label}</div>
                <div className="text-slate-500 text-xs">{stat.sub}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* 经济形势分析 */}
        <div className="space-y-4 mb-10">
          {[
            {
              icon: "💵",
              title: "全球货币贬值压力",
              color: "border-red-500/30 bg-red-500/5",
              titleColor: "text-red-400",
              content: "全球主要经济体持续印钞，通货膨胀侵蚀储蓄价值。比特币总量固定为 2100 万枚，被称为「数字黄金」，成为对抗通胀的工具。2020-2021 年美联储大幅扩表后，比特币价格从 1 万美元涨至 6.9 万美元，2024 年再创历史新高突破 10 万美元。",
            },
            {
              icon: "🏦",
              title: "传统金融的局限",
              color: "border-orange-500/30 bg-orange-500/5",
              titleColor: "text-orange-400",
              content: "银行存款利率长期低于通胀率，资金效率极低。而 DeFi 协议提供的存款年化收益通常在 3-15%，远高于传统银行。同时，全球仍有 17 亿成年人没有银行账户，Web3 为他们提供了金融服务的可能——只需一部手机和网络连接。",
            },
            {
              icon: "🏛️",
              title: "机构资金大规模入场",
              color: "border-blue-500/30 bg-blue-500/5",
              titleColor: "text-blue-400",
              content: "2024 年，美国 SEC 批准比特币现货 ETF，贝莱德（全球最大资管公司）、富达等传统金融巨头开始提供加密资产产品。贝莱德比特币 ETF 上市首周吸引超过 10 亿美元资金流入，创历史记录。机构资金的入场标志着加密市场正在走向成熟。",
            },
            {
              icon: "🚀",
              title: "技术成熟，生态爆发",
              color: "border-emerald-500/30 bg-emerald-500/5",
              titleColor: "text-emerald-400",
              content: "以太坊 Layer 2 解决方案（如 Arbitrum、Optimism、Base）大幅降低了交易成本，让 DeFi 对普通用户变得可负担。Solana 等高性能公链的崛起，让链上应用的用户体验接近传统互联网。Web3 的基础设施已经基本就绪，现在是最好的入场时机。",
            },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className={`rounded-xl border ${item.color} p-5 sm:p-6`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <h4 className={`font-bold text-base mb-2 ${item.titleColor}`}>{item.title}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{item.content}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* 视野拓展 */}
        <FadeIn>
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/5 p-6 sm:p-8 mb-16">
            <h3 className="text-xl font-bold text-purple-400 mb-6">🔭 为什么了解 Web3 能拓展你的视野？</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "理解未来货币体系", desc: "央行数字货币（CBDC）、稳定币、比特币——未来的货币形态将与今天截然不同，提前了解让你不被时代落下。" },
                { title: "参与全球经济", desc: "Web3 打破了地域限制，任何人都可以参与全球金融市场，接触到传统渠道无法获得的投资机会。" },
                { title: "理解技术革命", desc: "区块链、智能合约、去中心化——这些技术正在重塑金融、供应链、版权、身份认证等多个行业。" },
                { title: "把握财富机遇", desc: "每一次技术革命都创造了巨大财富。互联网造就了阿里、腾讯，Web3 同样会创造下一批财富机会。" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-black/20 border border-white/5">
                  <span className="text-purple-400 text-xl flex-shrink-0">✦</span>
                  <div>
                    <h5 className="font-bold text-white text-sm mb-1">{item.title}</h5>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ===== Section 5: 投资方式对比 ===== */}
        <SectionTitle id="invest" icon="🔄" title="Web3 投资方式对比" subtitle="CEX、DEX 与链上投资——找到最适合你的方式" />

        {/* 第五章入口引导 */}
        <FadeIn className="mb-6">
          <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-yellow-500/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-3xl">🚪</span>
              <div>
                <h3 className="font-black text-white text-base">第五章：参与 Web3 的门户</h3>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                  深度对比 CEX、DEX 和链上投资的本质差异，包含质押理财收益计算器、无常损失解析、CEX 内置 Web3 功能介绍，以及新手推荐路径。
                </p>
              </div>
            </div>
            <Link href="/web3-guide/investment-gateway">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-sm font-black transition-all whitespace-nowrap flex-shrink-0">
                深入了解 →
              </button>
            </Link>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="space-y-4 mb-10">
            {investMethods.map((method, i) => (
              <div key={i} className={`rounded-2xl border ${method.borderColor} ${method.bgColor} p-5 sm:p-6`}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{method.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-xl font-black ${method.color}`}>{method.type}</h3>
                        <span className={`${method.badgeBg} text-xs font-bold px-2 py-0.5 rounded-full`}>
                          {method.badge}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{method.fullName}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-xs font-bold ${method.riskBg} ${method.riskColor}`}>
                    风险：{method.risk}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">✅ 优势</h4>
                    <ul className="space-y-1">
                      {method.pros.map((p) => (
                        <li key={p} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5 flex-shrink-0">+</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider">⚠️ 注意事项</h4>
                    <ul className="space-y-1">
                      {method.cons.map((c) => (
                        <li key={c} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-red-400 mt-0.5 flex-shrink-0">-</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
                  <div>
                    <span className="text-xs text-slate-500">代表平台：</span>
                    <span className="text-slate-300 text-xs ml-1">{method.examples.join(" · ")}</span>
                  </div>
                  <div className="text-xs text-slate-400 italic">适合：{method.suitable}</div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* 投资路径推荐 */}
        <FadeIn>
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-6 sm:p-8 mb-16">
            <h3 className="text-lg font-bold text-yellow-400 mb-4">🎯 推荐投资路径（新手版）</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 mb-4">
              {["注册 CEX 交易所", "→", "完成 KYC", "→", "购买 BTC/ETH", "→", "熟悉操作", "→", "探索 DeFi"].map((step, i) => (
                <span
                  key={i}
                  className={
                    step === "→"
                      ? "text-slate-500 hidden sm:block mx-1"
                      : "px-3 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 font-medium text-xs"
                  }
                >
                  {step}
                </span>
              ))}
            </div>
            <p className="text-slate-400 text-sm">
              💡 <strong className="text-white">重要提示：</strong>
              永远不要投入超出你能承受损失的资金。加密市场波动剧烈，做好风险管理是长期参与的前提。
              建议新手从小额开始，先熟悉操作流程，再逐步增加投入。
            </p>
            <div className="mt-5 pt-5 border-t border-yellow-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-slate-500 text-xs">想深度了解 CEX vs DEX vs 链上的全面对比、质押收益计算器？</p>
              <div className="flex gap-2 flex-wrap">
                <Link href="/web3-guide/investment-gateway">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-sm font-black transition-all whitespace-nowrap">
                    🚪 第五章：参与 Web3 的门户 →
                  </button>
                </Link>
                <Link href="/web3-guide/exchange-guide">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-sm font-bold transition-all whitespace-nowrap">
                    🏦 交易所入门指南 →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ===== Section 6: 如何开始 ===== */}
        <SectionTitle id="start" icon="🚀" title="如何迈出第一步" subtitle="从零开始的 Web3 入门行动指南" />

        <div className="space-y-4 mb-12">
          {startSteps.map((step, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className={`rounded-2xl border ${step.borderColor} ${step.bgColor} p-5 sm:p-6`}>
                <div className="flex items-start gap-4">
                  <div className={`text-3xl font-black ${step.color} opacity-30 leading-none flex-shrink-0 w-12 text-center`}>
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{step.icon}</span>
                      <h3 className={`font-bold text-base sm:text-lg ${step.color}`}>{step.title}</h3>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-3">{step.desc}</p>
                    <div className="flex items-center justify-between">
                      <Link href={step.href}>
                        <button className={`text-sm font-bold px-4 py-2 rounded-lg border ${step.borderColor} ${step.color} hover:bg-white/5 transition-colors`}>
                          {step.action} →
                        </button>
                      </Link>
                      <span className={`text-xs px-2 py-1 rounded-full ${step.bgColor} border ${step.borderColor} ${step.color}`}>
                        💡 {step.tip}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* 风险提示 */}
        <FadeIn>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 mb-12">
            <h3 className="text-base font-bold text-red-400 mb-3">⚠️ 重要风险提示</h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              {[
                "加密货币价格波动极大，可能在短时间内大幅上涨或下跌，请做好心理准备。",
                "投资前请充分了解相关风险，只投入你能承受全部损失的资金。",
                "谨防诈骗：不要相信保证收益的项目，不要将助记词或私钥告诉任何人。",
                "警惕假冒交易所和钓鱼网站，请通过官方渠道下载 App 和访问网站。",
                "本指南内容仅供教育目的，不构成任何投资建议，投资需自行判断。",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        {/* 底部 CTA */}
        <FadeIn>
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-8 text-center mb-12">
            <h3 className="text-2xl font-black text-white mb-3">准备好开始了吗？</h3>
            <p className="text-slate-400 mb-6">
              通过我们的邀请码注册交易所，享受最高 30% 手续费返佣，让每一笔交易都更划算。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/crypto-saving">
                <button className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-8 py-3 rounded-xl transition-all hover:scale-105">
                  🎁 查看返佣邀请码
                </button>
              </Link>
              <Link href="/exchanges">
                <button className="border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-bold px-8 py-3 rounded-xl transition-all">
                  📊 交易所对比
                </button>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* 底部导航 */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/">
            <button className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2">
              ← 返回主页
            </button>
          </Link>
          <p className="text-slate-600 text-xs text-center">
            内容参考：币安学院 · BlockBeats · CoinMarketCap · 登链社区
          </p>
          <Link href="/crypto-saving">
            <button className="text-slate-400 hover:text-yellow-400 transition-colors text-sm flex items-center gap-2">
              币圈省钱指南 →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
