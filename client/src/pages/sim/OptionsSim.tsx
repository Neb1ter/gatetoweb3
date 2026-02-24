import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, RefreshCw, Info } from "lucide-react";

// Black-Scholes 简化版（用于教学）
function blackScholes(S: number, K: number, T: number, r: number, sigma: number, type: "call" | "put") {
  if (T <= 0) {
    if (type === "call") return Math.max(S - K, 0);
    return Math.max(K - S, 0);
  }
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const N = (x: number) => {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    const t2 = 1 / (1 + p * Math.abs(x));
    const y = 1 - (((((a5 * t2 + a4) * t2) + a3) * t2 + a2) * t2 + a1) * t2 * Math.exp(-x * x / 2);
    return 0.5 * (1 + sign * y);
  };
  if (type === "call") return S * N(d1) - K * Math.exp(-r * T) * N(d2);
  return K * Math.exp(-r * T) * N(-d2) - S * N(-d1);
}

function calcGreeks(S: number, K: number, T: number, r: number, sigma: number, type: "call" | "put") {
  if (T <= 0) return { delta: type === "call" ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, theta: 0, vega: 0 };
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const N = (x: number) => {
    const p = 0.3275911, a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
    const sign = x < 0 ? -1 : 1;
    const t2 = 1 / (1 + p * Math.abs(x));
    const y = 1 - (((((a5 * t2 + a4) * t2) + a3) * t2 + a2) * t2 + a1) * t2 * Math.exp(-x * x / 2);
    return 0.5 * (1 + sign * y);
  };
  const Nprime = (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
  const delta = type === "call" ? N(d1) : N(d1) - 1;
  const gamma = Nprime(d1) / (S * sigma * Math.sqrt(T));
  const theta = (-(S * Nprime(d1) * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * (type === "call" ? N(d2) : N(-d2))) / 365;
  const vega = S * Nprime(d1) * Math.sqrt(T) / 100;
  return { delta, gamma, theta, vega };
}

function generatePrice(prev: number, vol = 0.018) {
  return Math.max(prev * (1 + (Math.random() - 0.48) * vol), 1);
}

// 盈亏图
function PnLChart({ S, K, premium, type, width, height }: {
  S: number; K: number; premium: number; type: "call" | "put"; width: number; height: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    c.width = width * dpr; c.height = height * dpr;
    c.style.width = `${width}px`; c.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#0D2137"; ctx.fillRect(0, 0, width, height);
    const pad = { t: 10, b: 25, l: 50, r: 10 };
    const cW = width - pad.l - pad.r, cH = height - pad.t - pad.b;
    const priceRange = K * 0.4;
    const prices = Array.from({ length: 100 }, (_, i) => K - priceRange + (i / 99) * priceRange * 2);
    const pnls = prices.map(p => {
      if (type === "call") return Math.max(p - K, 0) - premium;
      return Math.max(K - p, 0) - premium;
    });
    const minPnl = Math.min(...pnls, -premium * 1.5);
    const maxPnl = Math.max(...pnls, premium * 2);
    const rng = maxPnl - minPnl;
    const tx = (i: number) => pad.l + (i / 99) * cW;
    const ty = (p: number) => pad.t + cH - ((p - minPnl) / rng) * cH;
    // 零线
    const zeroY = ty(0);
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.l, zeroY); ctx.lineTo(width - pad.r, zeroY); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "9px monospace"; ctx.textAlign = "right";
    ctx.fillText("0", pad.l - 4, zeroY + 3);
    // 当前价格线
    const curIdx = prices.findIndex(p => p >= S);
    if (curIdx >= 0) {
      ctx.strokeStyle = "#FFD700"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(tx(curIdx), pad.t); ctx.lineTo(tx(curIdx), pad.t + cH); ctx.stroke();
      ctx.setLineDash([]);
    }
    // PnL曲线
    ctx.beginPath();
    pnls.forEach((pnl, i) => {
      const x = tx(i), y = ty(pnl);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#FFD700"; ctx.lineWidth = 2.5; ctx.stroke();
    // 填色
    ctx.beginPath();
    pnls.forEach((pnl, i) => { const x = tx(i), y = ty(pnl); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.lineTo(tx(99), zeroY); ctx.lineTo(tx(0), zeroY); ctx.closePath();
    ctx.fillStyle = "rgba(255,215,0,0.08)"; ctx.fill();
    // 标注
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "9px monospace"; ctx.textAlign = "center";
    ctx.fillText(`行权价 $${K.toFixed(0)}`, pad.l + (prices.findIndex(p => p >= K) / 99) * cW, pad.t + cH + 15);
  }, [S, K, premium, type, width, height]);
  return <canvas ref={ref} style={{ display: "block" }} />;
}

interface OptionPosition {
  type: "call" | "put";
  action: "buy" | "sell";
  strike: number;
  expiry: number; // 天数
  premium: number;
  contracts: number;
  entrySpot: number;
  time: string;
}

const INITIAL_BALANCE = 20000;
const SIGMA = 0.65; // 65% 年化波动率（BTC典型值）
const R = 0.05;

export default function OptionsSim() {
  const [spotPrice, setSpotPrice] = useState(65000);
  const [priceHistory, setPriceHistory] = useState([65000]);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [positions, setPositions] = useState<OptionPosition[]>([]);
  const [closedTrades, setClosedTrades] = useState<{ desc: string; pnl: number; time: string }[]>([]);
  const [optionType, setOptionType] = useState<"call" | "put">("call");
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [strike, setStrike] = useState(65000);
  const [expiry, setExpiry] = useState(7);
  const [contracts, setContracts] = useState(1);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [daysElapsed, setDaysElapsed] = useState(0);

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000);
  };

  const tick = useCallback(() => {
    setSpotPrice(prev => {
      const next = generatePrice(prev);
      setPriceHistory(h => [...h.slice(-59), next]);
      return next;
    });
    setDaysElapsed(d => d + 0.1); // 每tick = 0.1天
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(tick, speed === 1 ? 1200 : 400);
    return () => clearInterval(id);
  }, [tick, speed, paused]);

  // 到期处理
  useEffect(() => {
    setPositions(prev => {
      const expired: OptionPosition[] = [];
      const remaining = prev.filter(p => {
        const remainingDays = p.expiry - daysElapsed;
        if (remainingDays <= 0) { expired.push(p); return false; }
        return true;
      });
      if (expired.length > 0) {
        expired.forEach(p => {
          const intrinsic = p.type === "call" ? Math.max(spotPrice - p.strike, 0) : Math.max(p.strike - spotPrice, 0);
          const pnl = p.action === "buy"
            ? (intrinsic - p.premium) * p.contracts * 0.01
            : (p.premium - intrinsic) * p.contracts * 0.01;
          setBalance(b => b + (p.action === "buy" ? 0 : p.premium * p.contracts * 0.01) + pnl);
          setClosedTrades(t => [{
            desc: `${p.action === "buy" ? "买" : "卖"}${p.type === "call" ? "看涨" : "看跌"} K=${p.strike} 到期`,
            pnl, time: new Date().toLocaleTimeString(),
          }, ...t].slice(0, 8));
          showMsg(`⏰ 期权到期！${p.type === "call" ? "看涨" : "看跌"} K=$${p.strike}，内在价值 $${intrinsic.toFixed(0)}，盈亏 ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`, pnl >= 0);
        });
      }
      return remaining;
    });
  }, [daysElapsed]);

  const T = expiry / 365;
  const premium = blackScholes(spotPrice, strike, T, R, SIGMA, optionType);
  const greeks = calcGreeks(spotPrice, strike, T, R, SIGMA, optionType);
  const totalPremium = premium * contracts * 0.01; // 每份合约 = 0.01 BTC

  const handleTrade = () => {
    if (action === "buy" && totalPremium > balance) return showMsg("余额不足", false);
    if (action === "buy") setBalance(b => b - totalPremium);
    else setBalance(b => b + totalPremium); // 卖方收取权利金
    setPositions(p => [...p, {
      type: optionType, action, strike, expiry: daysElapsed + expiry,
      premium, contracts, entrySpot: spotPrice, time: new Date().toLocaleTimeString(),
    }]);
    showMsg(`✅ ${action === "buy" ? "买入" : "卖出"} ${contracts}份 ${optionType === "call" ? "看涨" : "看跌"}期权，行权价 $${strike}，${action === "buy" ? "支付" : "收取"}权利金 $${totalPremium.toFixed(2)}`, true);
  };

  const handleExercise = (p: OptionPosition) => {
    const intrinsic = p.type === "call" ? Math.max(spotPrice - p.strike, 0) : Math.max(p.strike - spotPrice, 0);
    const pnl = (intrinsic - p.premium) * p.contracts * 0.01;
    setBalance(b => b + pnl);
    setPositions(prev => prev.filter(x => x !== p));
    setClosedTrades(t => [{
      desc: `提前行权 ${p.type === "call" ? "看涨" : "看跌"} K=${p.strike}`,
      pnl, time: new Date().toLocaleTimeString(),
    }, ...t].slice(0, 8));
    showMsg(`${pnl >= 0 ? "🎉" : "📉"} 行权成功，盈亏 ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`, pnl >= 0);
  };

  const totalPnl = closedTrades.reduce((a, t) => a + t.pnl, 0);

  // 当前持仓浮动价值
  const positionValue = positions.reduce((sum, p) => {
    const remainT = Math.max(p.expiry - daysElapsed, 0) / 365;
    const currentPremium = blackScholes(spotPrice, p.strike, remainT, R, SIGMA, p.type);
    const pnl = p.action === "buy"
      ? (currentPremium - p.premium) * p.contracts * 0.01
      : (p.premium - currentPremium) * p.contracts * 0.01;
    return sum + pnl;
  }, 0);

  return (
    <div className="min-h-screen bg-[#0A192F] text-white">
      <div className="sticky top-0 z-30 bg-[#0A192F]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/exchange-guide/options">
            <button className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" /> 返回期权教程
            </button>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-purple-400 font-bold text-sm">🎯 期权交易模拟器</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">模拟第 {daysElapsed.toFixed(1)} 天</span>
          <button onClick={() => setPaused(p => !p)} className={`px-3 py-1 rounded-lg text-xs font-bold ${paused ? "bg-green-500 text-black" : "bg-slate-700 text-white"}`}>
            {paused ? "▶ 继续" : "⏸ 暂停"}
          </button>
          <button onClick={() => setSpeed(s => s === 1 ? 2 : 1)} className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-700 text-white">
            {speed === 1 ? "🐢 慢速" : "🐇 快速"}
          </button>
          <button onClick={() => {
            setSpotPrice(65000); setPriceHistory([65000]); setBalance(INITIAL_BALANCE);
            setPositions([]); setClosedTrades([]); setDaysElapsed(0); setStrike(65000);
          }} className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-slate-700 text-white">
            <RefreshCw className="w-3 h-3" /> 重置
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {msg && (
          <div className={`mb-3 px-4 py-2 rounded-xl text-sm font-medium ${msg.ok ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
            {msg.text}
          </div>
        )}

        {/* 账户概览 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "BTC现价", value: `$${spotPrice.toFixed(0)}`, color: "text-white" },
            { label: "可用余额", value: `$${balance.toFixed(2)}`, color: "text-yellow-400" },
            { label: "持仓浮动盈亏", value: `${positionValue >= 0 ? "+" : ""}$${positionValue.toFixed(2)}`, color: positionValue >= 0 ? "text-green-400" : "text-red-400" },
            { label: "已实现盈亏", value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? "text-green-400" : "text-red-400" },
          ].map(item => (
            <div key={item.label} className="bg-[#0D2137] rounded-xl border border-white/10 p-3 text-center">
              <div className="text-slate-400 text-xs mb-1">{item.label}</div>
              <div className={`font-black text-lg ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左侧：盈亏图 + 持仓 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 盈亏图 */}
            <div className="bg-[#0D2137] rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10">
                <span className="text-xs text-slate-400">到期盈亏图（黄线=盈亏，竖线=当前价格）</span>
              </div>
              <PnLChart S={spotPrice} K={strike} premium={premium} type={optionType} width={700} height={180} />
            </div>

            {/* Greeks 展示 */}
            <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3">📐 Greeks（期权敏感度指标）</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Delta Δ", value: greeks.delta.toFixed(3), desc: "价格变动1$，期权价值变动", color: "text-blue-400" },
                  { name: "Gamma Γ", value: greeks.gamma.toFixed(5), desc: "Delta的变化速度", color: "text-green-400" },
                  { name: "Theta Θ", value: `$${greeks.theta.toFixed(4)}/天`, desc: "每天时间价值损耗", color: "text-red-400" },
                  { name: "Vega ν", value: `$${greeks.vega.toFixed(4)}/1%`, desc: "波动率每变1%的影响", color: "text-purple-400" },
                ].map(g => (
                  <div key={g.name} className="bg-white/5 rounded-xl p-3">
                    <div className={`text-lg font-black ${g.color}`}>{g.value}</div>
                    <div className="text-white text-xs font-bold mt-1">{g.name}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{g.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 当前持仓 */}
            {positions.length > 0 && (
              <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-4">
                <h3 className="text-sm font-bold text-slate-300 mb-3">当前持仓</h3>
                <div className="space-y-2">
                  {positions.map((p, i) => {
                    const remainT = Math.max(p.expiry - daysElapsed, 0) / 365;
                    const curPrem = blackScholes(spotPrice, p.strike, remainT, R, SIGMA, p.type);
                    const floatPnl = p.action === "buy"
                      ? (curPrem - p.premium) * p.contracts * 0.01
                      : (p.premium - curPrem) * p.contracts * 0.01;
                    const remainDays = Math.max(p.expiry - daysElapsed, 0).toFixed(1);
                    return (
                      <div key={i} className="flex flex-wrap items-center gap-2 text-xs border-b border-white/5 pb-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${p.type === "call" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {p.action === "buy" ? "买" : "卖"}{p.type === "call" ? "看涨" : "看跌"}
                        </span>
                        <span className="text-slate-400">K=${p.strike.toFixed(0)}</span>
                        <span className="text-slate-400">剩余{remainDays}天</span>
                        <span className="text-slate-400">权利金${p.premium.toFixed(2)}</span>
                        <span className={`font-bold ${floatPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {floatPnl >= 0 ? "+" : ""}${floatPnl.toFixed(2)}
                        </span>
                        <button onClick={() => handleExercise(p)}
                          className="ml-auto px-3 py-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-lg font-bold">
                          行权
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 历史记录 */}
            {closedTrades.length > 0 && (
              <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-4">
                <h3 className="text-sm font-bold text-slate-300 mb-3">历史记录</h3>
                <div className="space-y-1.5">
                  {closedTrades.map((t, i) => (
                    <div key={i} className="flex justify-between text-xs border-b border-white/5 pb-1.5">
                      <span className="text-slate-400">{t.time} · {t.desc}</span>
                      <span className={`font-bold ${t.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧：交易面板 */}
          <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-4 h-fit">
            {/* 期权类型 */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={() => setOptionType("call")}
                className={`py-2 rounded-xl text-sm font-bold ${optionType === "call" ? "bg-green-500 text-black" : "bg-white/5 text-slate-400"}`}>
                📈 看涨 Call
              </button>
              <button onClick={() => setOptionType("put")}
                className={`py-2 rounded-xl text-sm font-bold ${optionType === "put" ? "bg-red-500 text-white" : "bg-white/5 text-slate-400"}`}>
                📉 看跌 Put
              </button>
            </div>

            {/* 买/卖 */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={() => setAction("buy")}
                className={`py-2 rounded-xl text-sm font-bold ${action === "buy" ? "bg-yellow-500 text-black" : "bg-white/5 text-slate-400"}`}>
                买入（支付权利金）
              </button>
              <button onClick={() => setAction("sell")}
                className={`py-2 rounded-xl text-sm font-bold ${action === "sell" ? "bg-slate-500 text-white" : "bg-white/5 text-slate-400"}`}>
                卖出（收取权利金）
              </button>
            </div>

            {/* 行权价 */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 mb-1 block">行权价 Strike (USDT)</label>
              <input type="number" value={strike} onChange={e => setStrike(Number(e.target.value))}
                step={500}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50" />
              <div className="flex gap-1 mt-1.5">
                {[-2000, -1000, 0, 1000, 2000].map(d => (
                  <button key={d} onClick={() => setStrike(Math.round((spotPrice + d) / 500) * 500)}
                    className="flex-1 text-xs py-1 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10">
                    {d === 0 ? "平价" : `${d > 0 ? "+" : ""}${d}`}
                  </button>
                ))}
              </div>
            </div>

            {/* 到期天数 */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400">到期天数</label>
                <span className="text-purple-400 font-bold">{expiry}天</span>
              </div>
              <input type="range" min={1} max={30} step={1} value={expiry}
                onChange={e => setExpiry(Number(e.target.value))}
                className="w-full accent-purple-500" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1天</span><span>7天</span><span>14天</span><span>30天</span>
              </div>
            </div>

            {/* 合约数量 */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-1 block">合约数量（1份=0.01 BTC）</label>
              <input type="number" value={contracts} onChange={e => setContracts(Math.max(1, Number(e.target.value)))}
                min={1} max={100}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50" />
            </div>

            {/* 价格信息 */}
            <div className="bg-white/5 rounded-xl p-3 mb-4 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>理论权利金（每份）</span>
                <span className="text-purple-400 font-bold">${premium.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>总{action === "buy" ? "支付" : "收取"}</span>
                <span className="text-white font-bold">${totalPremium.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>盈亏平衡点</span>
                <span className="text-yellow-400">
                  ${optionType === "call" ? (strike + premium).toFixed(0) : (strike - premium).toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>最大亏损</span>
                <span className={action === "buy" ? "text-red-400" : "text-slate-400"}>
                  {action === "buy" ? `-$${totalPremium.toFixed(2)}（权利金）` : "理论无限"}
                </span>
              </div>
            </div>

            <button onClick={handleTrade}
              className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-sm transition-all hover:scale-105">
              {action === "buy" ? "买入期权" : "卖出期权"}
            </button>
          </div>
        </div>

        <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-300 space-y-1">
              <p className="font-bold text-purple-400">🎯 期权交易核心概念</p>
              <p>• <strong>看涨期权（Call）</strong>：赋予你以行权价买入BTC的权利，看好价格上涨时买入</p>
              <p>• <strong>看跌期权（Put）</strong>：赋予你以行权价卖出BTC的权利，看空价格时买入</p>
              <p>• <strong>买方</strong>：支付权利金，最大亏损 = 权利金，收益理论无限</p>
              <p>• <strong>卖方</strong>：收取权利金，最大收益 = 权利金，亏损理论无限</p>
              <p>• <strong>时间价值衰减（Theta）</strong>：越接近到期日，期权价值衰减越快</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
