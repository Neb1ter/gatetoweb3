import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import Web3ChapterNav from "@/components/Web3ChapterNav";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

// 互动：三种方式对比选择器
function MethodComparison() {
  const [active, setActive] = useState<"cex" | "dex" | "onchain">("cex");

  const methods = {
    cex: {
      name: "中心化交易所 (CEX)",
      icon: "🏦",
      color: "emerald",
      tagline: "Web3 的入门大门",
      badge: "推荐新手",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      borderColor: "border-emerald-500/40",
      bgColor: "bg-emerald-500/5",
      activeBg: "bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500",
      desc: "中心化交易所由公司运营，提供类似银行的服务体验。用户将资产托管给平台，换取便利的操作界面、法币出入金和客服支持。",
      pros: [
        "界面友好，操作简单，适合零基础新手",
        "支持银行卡、支付宝等法币入金",
        "有客服支持，出问题可以联系解决",
        "提供现货、合约、理财等一站式服务",
        "内置 DEX 功能（如 OKX Web3 钱包）",
        "质押理财年化收益通常 3-15%，远超银行",
        "流动性好，大额交易滑点小",
      ],
      cons: [
        "资产由平台托管，非完全自主（「Not your keys, not your coins」）",
        "需要 KYC 实名认证，有隐私成本",
        "平台可能被黑客攻击（历史上有 Mt.Gox 事件）",
        "部分国家/地区有访问限制",
      ],
      examples: ["币安 (Binance)", "OKX", "Gate.io", "Bybit", "Bitget"],
      suitable: "加密货币新手、日常交易者、不想管理私钥的用户",
      risk: "中低",
      riskColor: "text-yellow-400",
    },
    dex: {
      name: "去中心化交易所 (DEX)",
      icon: "🔄",
      color: "blue",
      tagline: "无需许可的链上交易",
      badge: "进阶用户",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      borderColor: "border-blue-500/40",
      bgColor: "bg-blue-500/5",
      activeBg: "bg-blue-500/20 text-blue-400 border-b-2 border-blue-500",
      desc: "去中心化交易所通过智能合约运行，无需注册账号，用钱包直连即可交易。资产始终在你的钱包里，平台无法冻结或没收。",
      pros: [
        "无需注册，钱包连接即可交易",
        "资产完全自托管，平台无法冻结",
        "无 KYC，保护隐私",
        "可交易长尾代币（CEX 未上市的早期项目）",
        "提供流动性可赚取手续费分成",
        "质押理财收益通常 5-20%+（流动性挖矿）",
        "代码开源，规则透明不可篡改",
      ],
      cons: [
        "需要自己管理私钥和助记词，门槛较高",
        "Gas 费用较高（尤其以太坊主网）",
        "界面相对复杂，容易操作失误",
        "无客服，出问题只能自己解决",
        "存在智能合约漏洞风险",
        "流动性相对 CEX 较低",
      ],
      examples: ["Uniswap", "PancakeSwap", "dYdX", "Curve", "GMX"],
      suitable: "有一定经验的用户、注重隐私者、想参与早期项目的用户",
      risk: "中高",
      riskColor: "text-orange-400",
    },
    onchain: {
      name: "链上直接操作",
      icon: "⛓️",
      color: "purple",
      tagline: "最大化去中心化程度",
      badge: "高级玩家",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      borderColor: "border-purple-500/40",
      bgColor: "bg-purple-500/5",
      activeBg: "bg-purple-500/20 text-purple-400 border-b-2 border-purple-500",
      desc: "直接与区块链协议交互，包括参与 DeFi 协议、NFT 铸造、链上治理投票等。需要深度理解智能合约和链上操作。",
      pros: [
        "最大程度的去中心化和自主权",
        "可参与最早期的 DeFi 协议和 IDO",
        "收益潜力最高（早期流动性挖矿、空投等）",
        "完全匿名，无任何 KYC",
        "可参与链上治理，影响协议发展",
      ],
      cons: [
        "门槛极高，需要深度技术理解",
        "Gas 费高，小额操作不划算",
        "智能合约漏洞风险（历史上多次数亿美元被盗）",
        "Rug Pull 风险（项目方跑路）",
        "操作失误无法撤销，资金可能永久丢失",
        "需要持续关注市场，时间成本高",
      ],
      examples: ["Aave", "Compound", "MakerDAO", "Yearn Finance", "Convex"],
      suitable: "深度 DeFi 参与者、技术开发者、高风险承受能力的资深用户",
      risk: "高",
      riskColor: "text-red-400",
    },
  };

  const m = methods[active];

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 overflow-hidden">
      {/* 标签切换 */}
      <div className="flex border-b border-slate-700">
        {(["cex", "dex", "onchain"] as const).map((key) => (
          <button key={key} onClick={() => setActive(key)}
            className={`flex-1 py-3.5 text-xs sm:text-sm font-bold transition-all ${active === key ? methods[key].activeBg : "text-slate-500 hover:text-slate-300"}`}>
            {methods[key].icon} {key === "cex" ? "CEX" : key === "dex" ? "DEX" : "链上"}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-6">
        {/* 标题和标签 */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-black text-white">{m.name}</h3>
            <p className="text-slate-400 text-sm mt-0.5">{m.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full border ${m.badgeColor}`}>{m.badge}</span>
            <span className={`text-xs font-bold ${m.riskColor}`}>风险：{m.risk}</span>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-5 p-3 rounded-xl bg-white/3 border border-white/5">{m.desc}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <h4 className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">✅ 优势</h4>
            <ul className="space-y-1.5">
              {m.pros.map((p, i) => (
                <li key={i} className="text-slate-300 text-xs flex items-start gap-2 leading-relaxed">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">+</span>{p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider">⚠️ 注意事项</h4>
            <ul className="space-y-1.5">
              {m.cons.map((c, i) => (
                <li key={i} className="text-slate-300 text-xs flex items-start gap-2 leading-relaxed">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">−</span>{c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-white/5">
          <div>
            <span className="text-xs text-slate-500">代表平台：</span>
            <span className="text-slate-300 text-xs ml-1">{m.examples.join(" · ")}</span>
          </div>
          <div className="text-xs text-slate-400 italic">适合：{m.suitable}</div>
        </div>
      </div>
    </div>
  );
}

// 互动：质押收益计算器
function StakingCalculator() {
  const [amount, setAmount] = useState(10000);
  const [period, setPeriod] = useState(12);
  const [type, setType] = useState<"bank" | "cex" | "dex">("cex");

  const rates = {
    bank: { rate: 0.015, label: "银行活期", color: "text-slate-400", bg: "bg-slate-700/30", border: "border-slate-600/50" },
    cex: { rate: 0.08, label: "CEX 活期理财", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    dex: { rate: 0.18, label: "DEX 流动性挖矿", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  };

  const r = rates[type];
  const monthlyRate = r.rate / 12;
  const finalAmount = amount * Math.pow(1 + monthlyRate, period);
  const profit = finalAmount - amount;
  const profitPercent = (profit / amount * 100).toFixed(1);

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 sm:p-6">
      <h3 className="font-black text-white text-base mb-1">💹 收益对比计算器</h3>
      <p className="text-slate-500 text-xs mb-5">同样的资金，不同的理财方式，收益差距有多大？</p>

      {/* 类型切换 */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["bank", "cex", "dex"] as const).map((t) => (
          <button key={t} onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${type === t ? rates[t].bg + " " + rates[t].color + " " + rates[t].border : "border-slate-700 text-slate-500 hover:text-slate-300"}`}>
            {rates[t].label}（年化 {(rates[t].rate * 100).toFixed(1)}%）
          </button>
        ))}
      </div>

      {/* 输入 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">投入金额（元）</label>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">持有时间（月）</label>
          <input type="range" min={1} max={60} value={period} onChange={e => setPeriod(Number(e.target.value))}
            className="w-full mt-2" />
          <div className="text-center text-sm text-white font-bold mt-1">{period} 个月</div>
        </div>
      </div>

      {/* 结果 */}
      <div className={`rounded-xl border ${r.border} ${r.bg} p-4`}>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-slate-500 mb-1">本金</div>
            <div className="text-white font-black text-lg">¥{amount.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">收益</div>
            <div className={`font-black text-lg ${r.color}`}>+¥{profit.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">涨幅</div>
            <div className={`font-black text-lg ${r.color}`}>+{profitPercent}%</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 text-center">
          <span className="text-xs text-slate-400">最终金额：</span>
          <span className={`text-base font-black ml-1 ${r.color}`}>¥{finalAmount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-3 leading-relaxed">
        ⚠️ 以上为简化演示，实际收益受市场波动影响。DEX 流动性挖矿还需考虑无常损失风险。
      </p>
    </div>
  );
}

// 互动：三方横向对比表
function ComparisonTable() {
  const rows = [
    { dim: "资产托管", cex: "平台托管", dex: "自托管（钱包）", onchain: "完全自托管", cexOk: false, dexOk: true, onchainOk: true },
    { dim: "注册要求", cex: "需要 KYC 实名", dex: "无需注册", onchain: "无需注册", cexOk: false, dexOk: true, onchainOk: true },
    { dim: "法币入金", cex: "✅ 支持", dex: "❌ 不支持", onchain: "❌ 不支持", cexOk: true, dexOk: false, onchainOk: false },
    { dim: "客服支持", cex: "✅ 有客服", dex: "❌ 无客服", onchain: "❌ 无客服", cexOk: true, dexOk: false, onchainOk: false },
    { dim: "操作难度", cex: "⭐ 简单", dex: "⭐⭐⭐ 较难", onchain: "⭐⭐⭐⭐⭐ 很难", cexOk: true, dexOk: null, onchainOk: null },
    { dim: "理财收益", cex: "3-15% 年化", dex: "5-20%+ 年化", onchain: "5-50%+ 年化", cexOk: null, dexOk: null, onchainOk: null },
    { dim: "内置 DEX", cex: "部分平台有", dex: "核心功能", onchain: "直接操作", cexOk: null, dexOk: true, onchainOk: true },
    { dim: "早期项目", cex: "❌ 上市后才有", dex: "✅ 第一时间", onchain: "✅ 最早参与", cexOk: false, dexOk: true, onchainOk: true },
    { dim: "安全风险", cex: "平台被黑风险", dex: "合约漏洞风险", onchain: "操作失误风险", cexOk: null, dexOk: null, onchainOk: null },
    { dim: "适合人群", cex: "新手/日常用户", dex: "进阶用户", onchain: "高级玩家", cexOk: null, dexOk: null, onchainOk: null },
  ];

  return (
    <div className="rounded-2xl border border-slate-700 overflow-hidden">
      <div className="bg-slate-800/50 px-5 py-4 border-b border-slate-700">
        <h3 className="font-black text-white">三种方式全面对比</h3>
        <p className="text-slate-400 text-xs mt-1">了解差异，选择最适合你的参与方式</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/30">
              <th className="text-left px-4 py-3 text-slate-400 font-medium w-24">对比维度</th>
              <th className="text-center px-4 py-3 text-emerald-400 font-bold">🏦 CEX</th>
              <th className="text-center px-4 py-3 text-blue-400 font-bold">🔄 DEX</th>
              <th className="text-center px-4 py-3 text-purple-400 font-bold">⛓️ 链上</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-b border-slate-800 ${i % 2 === 0 ? "bg-slate-800/10" : ""}`}>
                <td className="px-4 py-3 text-slate-400 font-medium text-xs">{row.dim}</td>
                <td className="px-4 py-3 text-center text-xs text-slate-300">{row.cex}</td>
                <td className="px-4 py-3 text-center text-xs text-slate-300">{row.dex}</td>
                <td className="px-4 py-3 text-center text-xs text-slate-300">{row.onchain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// DEX 质押理财解释
function StakingExplainer() {
  const [expanded, setExpanded] = useState<number | null>(0);

  const items = [
    {
      q: "为什么 DEX 质押收益比银行高这么多？",
      icon: "💡",
      color: "text-yellow-400",
      border: "border-yellow-500/30",
      bg: "bg-yellow-500/5",
      a: `银行存款利率低（1-2%），是因为银行把你的钱贷给别人，中间赚取利差，而你只拿到一小部分。

DEX 质押收益高，原因有三：

① **手续费分成**：你向 DEX 提供流动性（如 ETH/USDC 交易对），每次有人用这个交易对换币，都会支付 0.1-0.3% 手续费，这些费用直接分给流动性提供者。

② **协议激励**：DEX 为了吸引流动性，会额外发放平台代币作为奖励（流动性挖矿），这部分收益可能非常高。

③ **市场供需**：加密市场借贷需求旺盛，借款人愿意支付更高利率，这些利率最终传导到存款端。

⚠️ 需注意：高收益伴随高风险，包括无常损失（Impermanent Loss）和智能合约风险。`,
    },
    {
      q: "什么是无常损失？为什么 DEX 理财有这个风险？",
      icon: "⚠️",
      color: "text-orange-400",
      border: "border-orange-500/30",
      bg: "bg-orange-500/5",
      a: `无常损失（Impermanent Loss）是 DEX 流动性提供者特有的风险。

**简单理解**：假设你向 Uniswap 提供 1 ETH + 2000 USDC（ETH 价格 $2000）。如果 ETH 价格涨到 $4000，套利者会来买走你的 ETH，你的池子变成 0.7 ETH + 2800 USDC。

你的总价值 = 0.7×4000 + 2800 = $5600
如果你直接持有 = 1×4000 + 2000 = $6000

差额 $400 就是无常损失。价格波动越大，无常损失越大。

**如何降低风险**：
- 选择稳定币对（如 USDC/USDT），价格几乎不变，无常损失接近零
- 选择手续费高的交易对，用手续费收入覆盖无常损失
- 使用集中流动性协议（如 Uniswap V3）精确控制价格区间`,
    },
    {
      q: "CEX 内置 DEX 功能是什么？有什么优势？",
      icon: "🔄",
      color: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/5",
      a: `许多主流 CEX 现在已内置 Web3 钱包和 DEX 聚合器，让你无需离开 App 就能完成链上操作。

**代表平台**：
- **OKX Web3 钱包**：内置 DEX 聚合器，支持 80+ 条链，一键跨链换币
- **Binance Web3 钱包**：内置 DEX 功能，支持链上 DeFi 操作
- **Bybit Web3**：集成 NFT 市场和 DeFi 协议

**优势**：
① 无需在 CEX 和 MetaMask 之间频繁切换
② 资产在 CEX 和链上之间快速转移
③ 界面更友好，降低链上操作门槛
④ 聚合多个 DEX，自动找到最优汇率

这是 CeFi（中心化金融）和 DeFi 融合的趋势，让新手也能方便地参与链上世界。`,
    },
    {
      q: "新手应该从哪种方式开始？",
      icon: "🚀",
      color: "text-blue-400",
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      a: `**强烈推荐从 CEX 开始**，原因如下：

**第一阶段（0-3个月）：CEX 入门**
- 注册主流交易所，完成 KYC
- 小额入金（500-1000元），购买 BTC/ETH
- 熟悉买卖操作、K线图、市场动态
- 尝试 CEX 活期理财，感受收益

**第二阶段（3-6个月）：尝试 DEX**
- 在 CEX 内置 Web3 钱包中尝试小额链上操作
- 了解 Gas 费、钱包地址、助记词管理
- 参与稳定币流动性挖矿（风险较低）

**第三阶段（6个月+）：深度链上**
- 参与 DeFi 协议，探索更高收益机会
- 关注新项目空投，参与链上治理
- 构建多链资产组合

记住：每一步都要充分了解风险，不要超出自己的承受范围。`,
    },
  ];

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className={`rounded-xl border ${item.border} ${item.bg} overflow-hidden transition-all`}>
          <button onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left">
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className={`font-bold text-sm ${item.color}`}>{item.q}</span>
            </div>
            <span className={`text-lg transition-transform duration-300 ${expanded === i ? "rotate-180" : ""} ${item.color}`}>
              ▾
            </span>
          </button>
          {expanded === i && (
            <div className="px-4 pb-4 pt-0">
              <div className="border-t border-white/10 pt-4">
                {item.a.split("\n\n").map((para, j) => (
                  <p key={j} className="text-slate-300 text-sm leading-relaxed mb-3 last:mb-0"
                    dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function InvestmentGateway() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <div className="min-h-screen bg-[#050D1A] text-white" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease" }}>
      {/* 导航 */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#050D1A]/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            返回上一页
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 hidden sm:inline-flex">核心 · 章节 06</span>
            <Web3ChapterNav currentChapterId="investment-gateway" />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12 pb-20">
        {/* 标题 */}
        <FadeIn className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs mb-5">
            🚪 第六章：参与 Web3 的门户
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            参与 <span className="bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">Web3</span> 的门户
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
            进入 Web3 世界有三条路：中心化交易所（CEX）、去中心化交易所（DEX）和直接链上操作。
            了解它们的本质差异，选择最适合你的入场方式。
          </p>
        </FadeIn>

        {/* 三种方式概览 */}
        <FadeIn className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "🏦", title: "CEX", sub: "中心化交易所", desc: "新手首选，界面友好，法币入金，一站式服务", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400", badge: "推荐新手" },
              { icon: "🔄", title: "DEX", sub: "去中心化交易所", desc: "无需注册，资产自托管，更高收益潜力", color: "border-blue-500/30 bg-blue-500/5 text-blue-400", badge: "进阶用户" },
              { icon: "⛓️", title: "链上操作", sub: "直接与协议交互", desc: "最大自主权，最高收益潜力，门槛最高", color: "border-purple-500/30 bg-purple-500/5 text-purple-400", badge: "高级玩家" },
            ].map((item, i) => (
              <div key={i} className={`rounded-2xl border ${item.color} p-5`}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="font-black text-white text-lg">{item.title}</div>
                <div className="text-xs text-slate-400 mb-2">{item.sub}</div>
                <p className="text-slate-300 text-xs leading-relaxed mb-3">{item.desc}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${item.color}`}>{item.badge}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* 互动对比选择器 */}
        <FadeIn className="mb-10">
          <h2 className="text-2xl font-black text-white mb-4">🔍 深度对比：点击切换查看详情</h2>
          <MethodComparison />
        </FadeIn>

        {/* 三方横向对比表 */}
        <FadeIn className="mb-10">
          <ComparisonTable />
        </FadeIn>

        {/* DEX 质押理财专题 */}
        <FadeIn className="mb-10">
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">💎</span>
              <div>
                <h2 className="text-xl font-black text-white">DEX 质押理财：为什么收益比银行高？</h2>
                <p className="text-slate-400 text-sm">理解高收益背后的逻辑，才能做出明智的决策</p>
              </div>
            </div>
            <div className="mt-6">
              <StakingExplainer />
            </div>
          </div>
        </FadeIn>

        {/* 收益计算器 */}
        <FadeIn className="mb-10">
          <h2 className="text-2xl font-black text-white mb-4">📊 收益对比：数字说话</h2>
          <StakingCalculator />
        </FadeIn>

        {/* CEX 内置 DEX 功能介绍 */}
        <FadeIn className="mb-10">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 sm:p-8">
            <h2 className="text-xl font-black text-emerald-400 mb-4">🌉 CeFi + DeFi 融合：CEX 内置 Web3 功能</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-5">
              好消息是：你不必在 CEX 和 DEX 之间二选一。现代主流 CEX 已经内置了 Web3 钱包和 DEX 功能，
              让你在一个 App 里就能完成从法币入金到链上 DeFi 的全流程。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { platform: "OKX Web3 钱包", icon: "🟡", features: ["支持 80+ 条链", "内置 DEX 聚合器", "NFT 市场", "DeFi 一站式操作"], color: "border-yellow-500/30 bg-yellow-500/5" },
                { platform: "Binance Web3 钱包", icon: "🟠", features: ["多链资产管理", "链上 DeFi 操作", "跨链桥接", "Gas 费优化"], color: "border-orange-500/30 bg-orange-500/5" },
                { platform: "Bybit Web3", icon: "🔵", features: ["NFT 市场集成", "DeFi 协议接入", "链上质押", "Web3 探索页面"], color: "border-blue-500/30 bg-blue-500/5" },
              ].map((item, i) => (
                <div key={i} className={`rounded-xl border ${item.color} p-4`}>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h4 className="font-bold text-white text-sm mb-3">{item.platform}</h4>
                  <ul className="space-y-1">
                    {item.features.map((f, j) => (
                      <li key={j} className="text-slate-400 text-xs flex items-center gap-1.5">
                        <span className="text-emerald-400">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* 新手路径建议 */}
        <FadeIn className="mb-10">
          <h2 className="text-2xl font-black text-white mb-4">🗺️ 推荐学习路径</h2>
          <div className="space-y-3">
            {[
              { phase: "第一阶段", time: "0-3个月", title: "从 CEX 起步", desc: "注册主流交易所，完成 KYC，小额入金购买 BTC/ETH，熟悉操作界面和市场节奏，尝试 CEX 活期理财。", color: "border-emerald-500/40 bg-emerald-500/5 text-emerald-400", step: "01" },
              { phase: "第二阶段", time: "3-6个月", title: "探索 CEX 内置 Web3 功能", desc: "通过 OKX/Binance 内置 Web3 钱包尝试链上操作，了解 Gas 费和钱包管理，参与稳定币流动性挖矿。", color: "border-blue-500/40 bg-blue-500/5 text-blue-400", step: "02" },
              { phase: "第三阶段", time: "6个月+", title: "深入 DEX 和链上世界", desc: "独立使用 MetaMask 等钱包，参与 DeFi 协议，探索更高收益机会，关注新项目空投和链上治理。", color: "border-purple-500/40 bg-purple-500/5 text-purple-400", step: "03" },
            ].map((item, i) => (
              <div key={i} className={`rounded-xl border ${item.color} p-5 flex items-start gap-4`}>
                <div className={`text-3xl font-black opacity-30 leading-none flex-shrink-0 w-10 text-center ${item.color.split(" ")[2]}`}>{item.step}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-black text-sm ${item.color.split(" ")[2]}`}>{item.phase}</span>
                    <span className="text-xs text-slate-500">· {item.time}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* 风险提示 */}
        <FadeIn className="mb-10">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <h3 className="font-bold text-red-400 text-sm mb-3">⚠️ 重要风险提示</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "加密货币价格波动剧烈，可能短时间内大幅涨跌",
                "DEX 质押收益受市场影响，并非保证固定收益",
                "智能合约存在漏洞风险，历史上多次发生大规模被盗事件",
                "私钥/助记词泄露将导致资产永久丢失，无法找回",
                "谨防 Rug Pull（项目方跑路）和钓鱼网站",
                "本内容仅供教育目的，不构成任何投资建议",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>{item}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* 引导下一章 CTA */}
        <FadeIn>
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🏦</div>
              <h2 className="text-2xl font-black text-white mb-2">准备好迈出第一步了吗？</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
                无论你选择哪种方式，<strong className="text-white">从 CEX 开始</strong>都是最明智的选择。
                它是你进入 Web3 世界最安全的桥梁——有客服、有保障、有法币通道。
                等你熟悉了加密世界，再逐步探索 DEX 和链上操作。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border border-emerald-500/20 bg-black/20 p-4 text-center">
                <div className="text-2xl mb-2">📚</div>
                <h4 className="font-bold text-white text-sm mb-1">第七章：交易所入门指南</h4>
                <p className="text-slate-400 text-xs mb-3">详细了解各大交易所的对比、注册步骤和安全使用指南</p>
                <Link href="/web3-guide/exchange-guide">
                  <button className="w-full py-2 rounded-lg border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold transition-all">
                    继续学习 →
                  </button>
                </Link>
              </div>
              <div className="rounded-xl border border-yellow-500/20 bg-black/20 p-4 text-center">
                <div className="text-2xl mb-2">🎁</div>
                <h4 className="font-bold text-white text-sm mb-1">立即注册，享受返佣优惠</h4>
                <p className="text-slate-400 text-xs mb-3">通过邀请码注册，享受最高 30% 手续费返佣，每笔交易都更划算</p>
                <Link href="/crypto-saving">
                  <button className="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black transition-all">
                    查看返佣邀请码 →
                  </button>
                </Link>
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => window.history.back()} className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
                ← 返回上一页
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
