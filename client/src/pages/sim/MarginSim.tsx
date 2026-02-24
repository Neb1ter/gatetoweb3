import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, RefreshCw, Info, AlertTriangle } from "lucide-react";

function generatePrice(prev: number, vol = 0.02) {
  return Math.max(prev * (1 + (Math.random() - 0.48) * vol), 1);
}
function initPrices(n = 80, start = 65000) {
  const a = [start];
  for (let i = 1; i < n; i++) a.push(generatePrice(a[i - 1]));
  return a;
}

function PriceChart({ prices, entryPrice, callPrice, width, height }: {
  prices: number[]; entryPrice?: number; callPrice?: number; width: number; height: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c || prices.length < 2) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    c.width = width * dpr; c.height = height * dpr;
    c.style.width = `${width}px`; c.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#0A192F"; ctx.fillRect(0, 0, width, height);
    const pad = { t: 20, b: 20, l: 10, r: 65 };
    const cW = width - pad.l - pad.r, cH = height - pad.t - pad.b;
    const all = [...prices]; if (entryPrice) all.push(entryPrice); if (callPrice) all.push(callPrice);
    const mn = Math.min(...all) * 0.997, mx = Math.max(...all) * 1.003, rng = mx - mn;
    const tx = (i: number) => pad.l + (i / (prices.length - 1)) * cW;
    const ty = (p: number) => pad.t + cH - ((p - mn) / rng) * cH;
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (cH / 4) * i; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(width - pad.r, y); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "10px monospace"; ctx.textAlign = "left";
      ctx.fillText((mx - (rng / 4) * i).toFixed(0), width - pad.r + 4, y + 4);
    }
    const isUp = prices[prices.length - 1] >= prices[0];
    ctx.beginPath(); prices.forEach((p, i) => i === 0 ? ctx.moveTo(tx(i), ty(p)) : ctx.lineTo(tx(i), ty(p)));
    ctx.strokeStyle = isUp ? "#26a69a" : "#ef5350"; ctx.lineWidth = 2; ctx.stroke();
    if (entryPrice) {
      const ey = ty(entryPrice);
      ctx.setLineDash([6, 3]); ctx.strokeStyle = "#FFD700"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(pad.l, ey); ctx.lineTo(width - pad.r, ey); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = "#FFD700"; ctx.font = "bold 10px monospace";
      ctx.fillText("开仓", width - pad.r + 4, ey + 4);
    }
    if (callPrice) {
      const cy = ty(callPrice);
      ctx.setLineDash([4, 4]); ctx.strokeStyle = "#FF6B35"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(pad.l, cy); ctx.lineTo(width - pad.r, cy); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = "#FF6B35"; ctx.font = "bold 10px monospace";
      ctx.fillText("追保", width - pad.r + 4, cy + 4);
    }
  }, [prices, entryPrice, callPrice, width, height]);
  return <canvas ref={ref} style={{ display: "block" }} />;
}

interface MarginPos {
  direction: "long" | "short";
  entryPrice: number;
  ownFunds: number;
  borrowed: number;
  totalSize: number; // USDT
  btcAmount: number;
  interestRate: number; // 每小时利率
  openTime: number; // timestamp
  callPrice: number; // 追加保证金价格
  liquidPrice: number;
}

const INITIAL_BALANCE = 10000;
const HOURLY_RATE = 0.0001; // 0.01%/小时

export default function MarginSim() {
  const [prices, setPrices] = useState(() => initPrices(80, 65000));
  const [currentPrice, setCurrentPrice] = useState(65000);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [position, setPosition] = useState<MarginPos | null>(null);
  const [marginRatio, setMarginRatio] = useState<number>(3); // 3x
  const [ownFundsInput, setOwnFundsInput] = useState("");
  const [trades, setTrades] = useState<{ dir: string; pnl: number; interest: number; time: string }[]>([]);
  const [msg, setMsg] = useState<{ text: string; type: "ok" | "err" | "warn" } | null>(null);
  const [ticks, setTicks] = useState(0); // 用于计算利息
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [callTriggered, setCallTriggered] = useState(false);

  const showMsg = (text: string, type: "ok" | "err" | "warn" = "ok") => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000);
  };

  const tick = useCallback(() => {
    setPrices(prev => {
      const last = prev[prev.length - 1];
      const next = generatePrice(last);
      setCurrentPrice(next);
      return [...prev.slice(-99), next];
    });
    setTicks(t => t + 1);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(tick, speed === 1 ? 1000 : 350);
    return () => clearInterval(id);
  }, [tick, speed, paused]);

  // 追保 & 强平检测
  useEffect(() => {
    if (!position) return;
    const { direction, callPrice, liquidPrice, ownFunds, borrowed, btcAmount } = position;
    const equity = direction === "long"
      ? ownFunds + (currentPrice - position.entryPrice) * btcAmount - borrowed * HOURLY_RATE * ticks
      : ownFunds + (position.entryPrice - currentPrice) * btcAmount - borrowed * HOURLY_RATE * ticks;

    if (direction === "long" && currentPrice <= liquidPrice) {
      setBalance(b => b); // 本金亏光
      setPosition(null);
      setTrades(t => [{ dir: "多", pnl: -ownFunds, interest: borrowed * HOURLY_RATE * ticks, time: new Date().toLocaleTimeString() }, ...t]);
      showMsg(`💥 强制平仓！价格跌至 $${currentPrice.toFixed(0)}，本金全部亏损！`, "err");
    } else if (direction === "short" && currentPrice >= liquidPrice) {
      setPosition(null);
      setTrades(t => [{ dir: "空", pnl: -ownFunds, interest: borrowed * HOURLY_RATE * ticks, time: new Date().toLocaleTimeString() }, ...t]);
      showMsg(`💥 强制平仓！价格涨至 $${currentPrice.toFixed(0)}，本金全部亏损！`, "err");
    } else if (!callTriggered && direction === "long" && currentPrice <= callPrice) {
      setCallTriggered(true);
      showMsg(`⚠️ 追加保证金通知！价格跌至 $${currentPrice.toFixed(0)}，请追加资金或平仓！`, "warn");
    } else if (!callTriggered && direction === "short" && currentPrice >= callPrice) {
      setCallTriggered(true);
      showMsg(`⚠️ 追加保证金通知！价格涨至 $${currentPrice.toFixed(0)}，请追加资金或平仓！`, "warn");
    }
  }, [currentPrice, position, ticks, callTriggered]);

  const ownFundsNum = parseFloat(ownFundsInput) || 0;
  const borrowed = ownFundsNum * (marginRatio - 1);
  const totalSize = ownFundsNum * marginRatio;

  const calcCallPrice = (dir: "long" | "short", entry: number, ratio: number) => {
    if (dir === "long") return entry * (1 - (1 / ratio) * 0.5);
    return entry * (1 + (1 / ratio) * 0.5);
  };
  const calcLiquidPrice = (dir: "long" | "short", entry: number, ratio: number) => {
    if (dir === "long") return entry * (1 - 1 / ratio * 0.85);
    return entry * (1 + 1 / ratio * 0.85);
  };

  const handleOpen = (dir: "long" | "short") => {
    if (position) return showMsg("已有持仓，请先平仓", "err");
    if (ownFundsNum <= 0) return showMsg("请输入自有资金", "err");
    if (ownFundsNum > balance) return showMsg("余额不足", "err");
    const btcAmt = totalSize / currentPrice;
    const callP = calcCallPrice(dir, currentPrice, marginRatio);
    const liqP = calcLiquidPrice(dir, currentPrice, marginRatio);
    setBalance(b => b - ownFundsNum);
    setPosition({
      direction: dir, entryPrice: currentPrice,
      ownFunds: ownFundsNum, borrowed,
      totalSize, btcAmount: btcAmt,
      interestRate: HOURLY_RATE,
      openTime: Date.now(),
      callPrice: callP, liquidPrice: liqP,
    });
    setCallTriggered(false);
    setTicks(0);
    showMsg(`✅ 开${dir === "long" ? "多" : "空"} ${marginRatio}x，自有 $${ownFundsNum}，借入 $${borrowed.toFixed(0)}，日利率 ${(HOURLY_RATE * 24 * 100).toFixed(2)}%`, "ok");
    setOwnFundsInput("");
  };

  const handleClose = () => {
    if (!position) return;
    const { direction, entryPrice, ownFunds, borrowed: b, btcAmount } = position;
    const interest = b * HOURLY_RATE * ticks;
    const pricePnl = direction === "long"
      ? (currentPrice - entryPrice) * btcAmount
      : (entryPrice - currentPrice) * btcAmount;
    const netPnl = pricePnl - interest;
    setBalance(bal => bal + ownFunds + netPnl);
    setTrades(t => [{ dir: direction === "long" ? "多" : "空", pnl: netPnl, interest, time: new Date().toLocaleTimeString() }, ...t].slice(0, 8));
    setPosition(null);
    showMsg(`${netPnl >= 0 ? "🎉" : "📉"} 平仓，价差盈亏 ${pricePnl >= 0 ? "+" : ""}$${pricePnl.toFixed(2)}，利息 -$${interest.toFixed(2)}，净盈亏 ${netPnl >= 0 ? "+" : ""}$${netPnl.toFixed(2)}`, netPnl >= 0 ? "ok" : "err");
  };

  const unrealizedPnl = position
    ? (() => {
        const { direction, entryPrice, btcAmount, borrowed: b } = position;
        const interest = b * HOURLY_RATE * ticks;
        const diff = direction === "long" ? (currentPrice - entryPrice) * btcAmount : (entryPrice - currentPrice) * btcAmount;
        return diff - interest;
      })()
    : 0;

  const totalPnl = trades.reduce((a, t) => a + t.pnl, 0);
  const totalInterest = trades.reduce((a, t) => a + t.interest, 0);

  return (
    <div className="min-h-screen bg-[#0A192F] text-white">
      <div className="sticky top-0 z-30 bg-[#0A192F]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/exchange-guide/margin">
            <button className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" /> 返回杠杆教程
            </button>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-orange-400 font-bold text-sm">🔥 杠杆交易模拟器</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPaused(p => !p)} className={`px-3 py-1 rounded-lg text-xs font-bold ${paused ? "bg-green-500 text-black" : "bg-slate-700 text-white"}`}>
            {paused ? "▶ 继续" : "⏸ 暂停"}
          </button>
          <button onClick={() => setSpeed(s => s === 1 ? 2 : 1)} className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-700 text-white">
            {speed === 1 ? "🐢 慢速" : "🐇 快速"}
          </button>
          <button onClick={() => {
            setPrices(initPrices(80, 65000)); setBalance(INITIAL_BALANCE);
            setPosition(null); setTrades([]); setCurrentPrice(65000); setTicks(0);
          }} className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-slate-700 text-white">
            <RefreshCw className="w-3 h-3" /> 重置
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {msg && (
          <div className={`mb-3 px-4 py-2 rounded-xl text-sm font-medium ${
            msg.type === "ok" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
            msg.type === "err" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
            "bg-orange-500/20 text-orange-300 border border-orange-500/30"
          }`}>{msg.text}</div>
        )}

        {/* 账户概览 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "可用余额", value: `$${balance.toFixed(2)}`, color: "text-yellow-400" },
            { label: "浮动盈亏", value: position ? `${unrealizedPnl >= 0 ? "+" : ""}$${unrealizedPnl.toFixed(2)}` : "—", color: position ? (unrealizedPnl >= 0 ? "text-green-400" : "text-red-400") : "text-slate-500" },
            { label: "累计利息支出", value: `-$${totalInterest.toFixed(2)}`, color: "text-orange-400" },
            { label: "累计净盈亏", value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? "text-green-400" : "text-red-400" },
          ].map(item => (
            <div key={item.label} className="bg-[#0D2137] rounded-xl border border-white/10 p-3 text-center">
              <div className="text-slate-400 text-xs mb-1">{item.label}</div>
              <div className={`font-black text-lg ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 图表 */}
          <div className="lg:col-span-2 bg-[#0D2137] rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-white font-black text-lg">${currentPrice.toFixed(2)}</span>
                {position && (
                  <span className={`text-sm font-bold ${unrealizedPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)}
                  </span>
                )}
              </div>
              {position && (
                <div className="flex gap-3 text-xs">
                  <span className="text-yellow-400">开仓: ${position.entryPrice.toFixed(0)}</span>
                  <span className="text-orange-400">追保: ${position.callPrice.toFixed(0)}</span>
                  <span className="text-red-400">强平: ${position.liquidPrice.toFixed(0)}</span>
                  <span className="text-slate-400">利息: -${(position.borrowed * HOURLY_RATE * ticks).toFixed(2)}</span>
                </div>
              )}
            </div>
            <div style={{ height: 280 }}>
              <PriceChart prices={prices} entryPrice={position?.entryPrice} callPrice={position?.callPrice} width={800} height={280} />
            </div>
          </div>

          {/* 交易面板 */}
          <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-400">杠杆倍数</label>
                <span className="text-orange-400 font-black text-lg">{marginRatio}x</span>
              </div>
              <input type="range" min={2} max={10} step={1} value={marginRatio}
                onChange={e => setMarginRatio(Number(e.target.value))}
                className="w-full accent-orange-500" disabled={!!position} />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>2x</span><span>5x</span><span>10x</span>
              </div>
              <div className="mt-2 bg-white/5 rounded-lg p-2 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>自有资金</span><span className="text-white">${ownFundsNum.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>借入资金</span><span className="text-orange-400">${borrowed.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>日利率</span><span className="text-orange-400">{(HOURLY_RATE * 24 * 100).toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-1 block">自有资金 (USDT)</label>
              <input type="number" value={ownFundsInput} onChange={e => setOwnFundsInput(e.target.value)}
                placeholder="1000" disabled={!!position}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500/50 disabled:opacity-50" />
            </div>

            <div className="bg-white/5 rounded-xl p-3 mb-4 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>总仓位</span><span className="text-white">${totalSize.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>追保价（做多）</span><span className="text-orange-400">${calcCallPrice("long", currentPrice, marginRatio).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>强平价（做多）</span><span className="text-red-400">${calcLiquidPrice("long", currentPrice, marginRatio).toFixed(0)}</span>
              </div>
            </div>

            {!position ? (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleOpen("long")} className="py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-black text-sm">▲ 做多</button>
                <button onClick={() => handleOpen("short")} className="py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-black text-sm">▼ 做空</button>
              </div>
            ) : (
              <button onClick={handleClose} className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black text-sm">
                平仓 ({unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)})
              </button>
            )}
          </div>
        </div>

        {/* 追保警告 */}
        {callTriggered && position && (
          <div className="mt-4 bg-orange-500/20 border border-orange-500/40 rounded-xl p-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
            <div>
              <p className="text-orange-300 font-bold text-sm">⚠️ 追加保证金通知（Margin Call）</p>
              <p className="text-orange-400 text-xs">你的保证金比率已低于安全线，需要追加资金或立即平仓，否则将触发强制平仓</p>
            </div>
          </div>
        )}

        {/* 交易记录 */}
        {trades.length > 0 && (
          <div className="mt-4 bg-[#0D2137] rounded-2xl border border-white/10 p-4">
            <h3 className="text-sm font-bold text-slate-300 mb-3">平仓记录</h3>
            <div className="space-y-2">
              {trades.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-slate-400">{t.time}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${t.dir === "多" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{t.dir}</span>
                  <span className="text-orange-400">利息 -${t.interest.toFixed(2)}</span>
                  <span className={`font-bold ${t.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>{t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-300 space-y-1">
              <p className="font-bold text-orange-400">🔥 杠杆交易 vs 合约交易的关键区别</p>
              <p>• <strong>杠杆交易</strong>：你真实借入资产，需要支付<strong>利息</strong>，持仓越久成本越高</p>
              <p>• <strong>追保通知（Margin Call）</strong>：当亏损接近本金时，交易所要求你追加资金</p>
              <p>• <strong>强制平仓</strong>：如果不追保，系统强制卖出你的资产来偿还借款</p>
              <p>• <strong>合约交易</strong>：不实际借入资产，无利息，但有资金费率（每8小时）</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
