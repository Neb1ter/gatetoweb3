import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import Web3ChapterNav from "@/components/Web3ChapterNav";

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

// 互动：流动性挖矿计算器
function LiquidityCalculator() {
  const [amount, setAmount] = useState(1000);
  const [days, setDays] = useState(30);
  const [apy, setApy] = useState(12);

  const dailyRate = apy / 365 / 100;
  const compound = amount * Math.pow(1 + dailyRate, days);
  const profit = compound - amount;
  const bankProfit = amount * (0.02 / 365) * days;

  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 sm:p-6">
      <h3 className="font-black text-yellow-400 text-base mb-4">📊 DeFi 收益计算器</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">投入金额（USDT）</label>
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">存入天数</label>
          <input type="number" value={days} onChange={e => setDays(Number(e.target.value))}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">年化收益率 APY（%）</label>
          <input type="number" value={apy} onChange={e => setApy(Number(e.target.value))}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
          <div className="text-2xl font-black text-yellow-400">${profit.toFixed(2)}</div>
          <div className="text-xs text-slate-400 mt-1">DeFi 收益</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
          <div className="text-2xl font-black text-slate-400">${bankProfit.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-1">银行存款收益（2% APY）</div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
          <div className="text-2xl font-black text-emerald-400">{bankProfit > 0 ? (profit / bankProfit).toFixed(1) : "∞"}x</div>
          <div className="text-xs text-slate-400 mt-1">DeFi 收益倍数</div>
        </div>
      </div>
      <p className="text-slate-500 text-xs mt-3">⚠️ 仅供参考，DeFi 收益会随市场波动，存在无常损失等风险，不构成投资建议。</p>
    </div>
  );
}

// 互动：AMM 自动做市商模拟
function AMMDemo() {
  const [ethReserve, setEthReserve] = useState(100);
  const [usdcReserve, setUsdcReserve] = useState(200000);
  const [swapAmount, setSwapAmount] = useState(1);
  const [swapDir, setSwapDir] = useState<"eth2usdc" | "usdc2eth">("eth2usdc");

  const k = ethReserve * usdcReserve;
  let outputAmount = 0;
  let priceImpact = 0;
  let newEthReserve = ethReserve;
  let newUsdcReserve = usdcReserve;

  if (swapDir === "eth2usdc" && swapAmount > 0) {
    const fee = swapAmount * 0.003;
    const amountWithFee = swapAmount - fee;
    newEthReserve = ethReserve + amountWithFee;
    newUsdcReserve = k / newEthReserve;
    outputAmount = usdcReserve - newUsdcReserve;
    const marketPrice = usdcReserve / ethReserve;
    priceImpact = Math.abs((outputAmount / swapAmount - marketPrice) / marketPrice * 100);
  } else if (swapDir === "usdc2eth" && swapAmount > 0) {
    const fee = swapAmount * 0.003;
    const amountWithFee = swapAmount - fee;
    newUsdcReserve = usdcReserve + amountWithFee;
    newEthReserve = k / newUsdcReserve;
    outputAmount = ethReserve - newEthReserve;
    const marketPrice = ethReserve / usdcReserve;
    priceImpact = Math.abs((outputAmount / swapAmount - marketPrice) / marketPrice * 100);
  }

  const currentPrice = usdcReserve / ethReserve;

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 sm:p-6">
      <h3 className="font-black text-blue-400 text-base mb-2">🔄 AMM 自动做市商模拟</h3>
      <p className="text-slate-500 text-xs mb-4">Uniswap 等 DEX 使用 x×y=k 公式自动定价，无需人工做市</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-center">
          <div className="text-xs text-slate-500 mb-1">流动性池</div>
          <div className="text-sm font-bold text-white">{ethReserve} ETH</div>
          <div className="text-xs text-slate-400">+ {usdcReserve.toLocaleString()} USDC</div>
        </div>
        <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-center">
          <div className="text-xs text-slate-500 mb-1">当前价格</div>
          <div className="text-sm font-bold text-yellow-400">1 ETH = ${currentPrice.toFixed(0)}</div>
          <div className="text-xs text-slate-400">k = {(k / 1e6).toFixed(1)}M</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-2 mb-3">
          <button onClick={() => setSwapDir("eth2usdc")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${swapDir === "eth2usdc" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"}`}>ETH → USDC</button>
          <button onClick={() => setSwapDir("usdc2eth")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${swapDir === "usdc2eth" ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"}`}>USDC → ETH</button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">输入数量</label>
            <input type="number" value={swapAmount} onChange={e => setSwapAmount(Number(e.target.value))}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div className="text-slate-500 text-xl mt-4">→</div>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">获得数量（扣除 0.3% 手续费）</label>
            <div className="bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 text-sm font-bold">
              {outputAmount > 0 ? outputAmount.toFixed(swapDir === "eth2usdc" ? 2 : 6) : "0"}
            </div>
          </div>
        </div>
      </div>

      {outputAmount > 0 && (
        <div className={`p-3 rounded-xl border text-xs ${priceImpact > 5 ? "border-red-500/30 bg-red-500/10" : "border-emerald-500/30 bg-emerald-500/10"}`}>
          <div className="flex justify-between">
            <span className="text-slate-400">价格影响</span>
            <span className={priceImpact > 5 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>{priceImpact.toFixed(2)}%</span>
          </div>
          {priceImpact > 5 && <p className="text-red-400 mt-1">⚠️ 价格影响过大，建议减少交易量或分批交易</p>}
        </div>
      )}
    </div>
  );
}

export default function DefiDeep() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const defiCategories = [
    {
      icon: "🔄", title: "去中心化交易所（DEX）", color: "text-blue-400", border: "border-blue-500/30",
      desc: "无需注册账号，直接用钱包连接即可交易。代表：Uniswap、PancakeSwap、dYdX",
      howItWorks: "DEX 使用自动做市商（AMM）算法，通过流动性池而非订单簿进行交易。流动性提供者（LP）存入代币对，赚取交易手续费。",
      pros: ["无需 KYC", "资产完全自托管", "支持长尾代币", "7×24 小时运行"],
      cons: ["Gas 费较高", "存在无常损失", "操作复杂", "无法法币入金"],
    },
    {
      icon: "🏦", title: "去中心化借贷", color: "text-emerald-400", border: "border-emerald-500/30",
      desc: "无需信用评分，超额抵押即可借款。代表：Aave、Compound、MakerDAO",
      howItWorks: "借款人需要存入超过借款价值的抵押品（通常 150%+）。若抵押品价值下跌至清算线，智能合约自动清算，保护贷款人资金安全。",
      pros: ["无需信用评分", "全球可访问", "利率由市场决定", "透明可审计"],
      cons: ["需要超额抵押", "清算风险", "智能合约漏洞风险", "利率波动大"],
    },
    {
      icon: "🌾", title: "流动性挖矿", color: "text-yellow-400", border: "border-yellow-500/30",
      desc: "为 DEX 提供流动性，赚取交易手续费和额外代币奖励。代表：Curve、Convex、Yearn",
      howItWorks: "将代币存入流动性池，获得 LP 代币。LP 代币可以再质押到收益聚合器，自动复投，最大化收益。",
      pros: ["被动收入", "复利效应", "支持多种代币", "可随时退出"],
      cons: ["无常损失风险", "智能合约风险", "代币价格风险", "Gas 费消耗"],
    },
    {
      icon: "💎", title: "质押（Staking）", color: "text-purple-400", border: "border-purple-500/30",
      desc: "锁定代币参与网络验证，获得质押奖励。代表：Lido、Rocket Pool、ETH 2.0",
      howItWorks: "质押 ETH 等 PoS 代币，帮助验证区块链交易，获得新发行代币作为奖励。流动性质押协议（如 Lido）发行 stETH，让你质押的同时保持流动性。",
      pros: ["相对稳定收益", "支持网络安全", "流动性质押可保持灵活性", "复利增长"],
      cons: ["锁定期风险", "代币价格波动", "罚没风险（Slashing）", "智能合约风险"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#050D1A] text-white" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease" }}>
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#050D1A]/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            返回上一页
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hidden sm:inline-flex">进阶 · 章节 04</span>
            <Web3ChapterNav currentChapterId="defi-deep" />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12 pb-20">
        <FadeIn className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs mb-5">
            💰 第四章：DeFi 深度解析
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-300 bg-clip-text text-transparent">DeFi</span> 深度解析
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
            去中心化金融正在重构全球金融体系。了解 DEX、借贷、流动性挖矿和质押，掌握 Web3 的核心玩法。
          </p>
        </FadeIn>

        {/* DeFi 总览 */}
        <FadeIn className="mb-8">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
            <h2 className="text-xl font-black text-yellow-400 mb-4">🌍 DeFi 生态现状</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { value: "$2000亿+", label: "总锁仓价值（TVL）", color: "text-yellow-400" },
                { value: "500+", label: "主要 DeFi 协议", color: "text-blue-400" },
                { value: "$100亿+", label: "日均交易量", color: "text-emerald-400" },
                { value: "1亿+", label: "活跃 DeFi 用户", color: "text-purple-400" },
              ].map((stat, i) => (
                <div key={i} className="p-3 rounded-xl bg-black/20 border border-white/5 text-center">
                  <div className={`text-lg font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              DeFi 从 2020 年「DeFi 之夏」爆发至今，已经发展成为一个拥有数千亿美元资产的完整金融生态系统。
              它提供了传统金融的所有核心功能——交易、借贷、理财——但无需任何中间机构，全球任何人都可以参与。
            </p>
          </div>
        </FadeIn>

        {/* DeFi 分类详解 */}
        <FadeIn className="mb-8">
          <h2 className="text-2xl font-black text-white mb-5">📚 DeFi 四大核心玩法</h2>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {defiCategories.map((cat, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${activeTab === i ? `${cat.border} bg-white/5 ${cat.color}` : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                {cat.icon} <span className="hidden sm:inline">{cat.title.split("（")[0]}</span>
              </button>
            ))}
          </div>
          <div className={`rounded-2xl border ${defiCategories[activeTab].border} bg-black/20 p-5 sm:p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{defiCategories[activeTab].icon}</span>
              <h3 className={`font-black text-lg ${defiCategories[activeTab].color}`}>{defiCategories[activeTab].title}</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">{defiCategories[activeTab].desc}</p>
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 mb-4">
              <div className="text-xs font-bold text-slate-400 mb-2">⚙️ 工作原理</div>
              <p className="text-slate-300 text-sm leading-relaxed">{defiCategories[activeTab].howItWorks}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-emerald-400 mb-2">✅ 优势</div>
                <ul className="space-y-1">{defiCategories[activeTab].pros.map(p => <li key={p} className="text-slate-300 text-xs flex items-start gap-1.5"><span className="text-emerald-400">+</span>{p}</li>)}</ul>
              </div>
              <div>
                <div className="text-xs font-bold text-red-400 mb-2">⚠️ 风险</div>
                <ul className="space-y-1">{defiCategories[activeTab].cons.map(c => <li key={c} className="text-slate-300 text-xs flex items-start gap-1.5"><span className="text-red-400">-</span>{c}</li>)}</ul>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* AMM 演示 */}
        <FadeIn className="mb-8">
          <h2 className="text-2xl font-black text-white mb-4">🔄 AMM 自动做市商原理</h2>
          <p className="text-slate-400 mb-5 text-sm leading-relaxed">
            传统交易所需要买卖双方匹配订单。DEX 使用 AMM 算法，通过数学公式 <strong className="text-white">x × y = k</strong> 自动定价，
            无需人工做市商，任何人都可以成为流动性提供者。
          </p>
          <AMMDemo />
        </FadeIn>

        {/* 收益计算器 */}
        <FadeIn className="mb-8">
          <h2 className="text-2xl font-black text-white mb-4">💹 DeFi 收益计算器</h2>
          <LiquidityCalculator />
        </FadeIn>

        {/* 下一章 */}
        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/web3-guide/economic-opportunity">
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 hover:bg-orange-500/10 transition-colors cursor-pointer">
                <div className="text-xs text-slate-500 mb-1">下一章</div>
                <h3 className="font-black text-white text-base">📈 第五章：经济形势与 Web3 机遇</h3>
                <p className="text-slate-400 text-xs mt-1">现实经济压力与 Web3 的破局机遇</p>
              </div>
            </Link>
            <Link href="/web3-guide">
              <div className="rounded-2xl border border-slate-700 bg-slate-800/30 p-5 hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="text-xs text-slate-500 mb-1">返回</div>
                <h3 className="font-black text-white text-base">📖 Web3 入圈指南总览</h3>
                <p className="text-slate-400 text-xs mt-1">回到主页面查看完整学习路径</p>
              </div>
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
