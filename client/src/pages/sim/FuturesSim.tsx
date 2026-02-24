import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, RefreshCw, AlertTriangle, Info, Zap } from "lucide-react";

function generatePrice(prev: number, vol = 0.02): number {
  const change = (Math.random() - 0.48) * vol;
  return Math.max(prev * (1 + change), 1);
}

function initPrices(count = 80, start = 65000) {
  const arr = [start];
  for (let i = 1; i < count; i++) arr.push(generatePrice(arr[i - 1]));
  return arr;
}

// 简单折线图
function PriceChart({ prices, entryPrice, liquidPrice, width, height }: {
  prices: number[]; entryPrice?: number; liquidPrice?: number; width: number; height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prices.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "#0A192F";
    ctx.fillRect(0, 0, width, height);

    const pad = { top: 20, bottom: 20, left: 10, right: 60 };
    const cW = width - pad.left - pad.right;
    const cH = height - pad.top - pad.bottom;

    const allPrices = [...prices];
    if (entryPrice) allPrices.push(entryPrice);
    if (liquidPrice) allPrices.push(liquidPrice);
    const minP = Math.min(...allPrices) * 0.998;
    const maxP = Math.max(...allPrices) * 1.002;
    const range = maxP - minP;

    const toX = (i: number) => pad.left + (i / (prices.length - 1)) * cW;
    const toY = (p: number) => pad.top + cH - ((p - minP) / range) * cH;

    // 网格
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (cH / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
      const p = maxP - (range / 4) * i;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      ctx.fillText(p.toFixed(0), width - pad.right + 4, y + 4);
    }

    // 价格线
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    const isUp = prices[prices.length - 1] >= prices[0];
    grad.addColorStop(0, isUp ? "rgba(38,166,154,0.3)" : "rgba(239,83,80,0.3)");
    grad.addColorStop(1, "transparent");
    ctx.beginPath();
    prices.forEach((p, i) => i === 0 ? ctx.moveTo(toX(i), toY(p)) : ctx.lineTo(toX(i), toY(p)));
    ctx.lineTo(toX(prices.length - 1), pad.top + cH);
    ctx.lineTo(toX(0), pad.top + cH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    prices.forEach((p, i) => i === 0 ? ctx.moveTo(toX(i), toY(p)) : ctx.lineTo(toX(i), toY(p)));
    ctx.strokeStyle = isUp ? "#26a69a" : "#ef5350";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 开仓价线
    if (entryPrice) {
      const ey = toY(entryPrice);
      ctx.setLineDash([6, 3]);
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(pad.left, ey); ctx.lineTo(width - pad.right, ey); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 10px monospace";
      ctx.fillText("开仓", width - pad.right + 4, ey + 4);
    }

    // 强平线
    if (liquidPrice && liquidPrice > 0) {
      const ly = toY(liquidPrice);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#ef5350";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(pad.left, ly); ctx.lineTo(width - pad.right, ly); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ef5350";
      ctx.font = "bold 10px monospace";
      ctx.fillText("强平", width - pad.right + 4, ly + 4);
    }
  }, [prices, entryPrice, liquidPrice, width, height]);
  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}

interface FuturesPosition {
  direction: "long" | "short";
  entryPrice: number;
  leverage: number;
  margin: number; // 保证金 USDT
  size: number; // 合约价值 USDT
  liquidPrice: number;
  time: string;
}

const INITIAL_BALANCE = 5000;

export default function FuturesSim() {
  const [prices, setPrices] = useState(() => initPrices(80, 65000));
  const [currentPrice, setCurrentPrice] = useState(65000);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [position, setPosition] = useState<FuturesPosition | null>(null);
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState("");
  const [closedTrades, setClosedTrades] = useState<{ dir: string; pnl: number; time: string }[]>([]);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" | "info" | "warn" } | null>(null);
  const [liquidated, setLiquidated] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);

  const showMsg = (text: string, type: "success" | "error" | "info" | "warn" = "info") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const tick = useCallback(() => {
    setPrices(prev => {
      const last = prev[prev.length - 1];
      const next = generatePrice(last);
      setCurrentPrice(next);
      return [...prev.slice(-99), next];
    });
  }, []);

  useEffect(() => {
    if (paused || liquidated) return;
    const id = setInterval(tick, speed === 1 ? 1000 : 350);
    return () => clearInterval(id);
  }, [tick, speed, paused, liquidated]);

  // 强平检测
  useEffect(() => {
    if (!position) return;
    const { direction, liquidPrice } = position;
    if (direction === "long" && currentPrice <= liquidPrice) {
      setLiquidated(true);
      setBalance(b => b - position.margin); // 保证金归零
      setPosition(null);
      showMsg(`💥 爆仓！价格跌至 $${currentPrice.toFixed(2)}，低于强平价 $${liquidPrice.toFixed(2)}，保证金全部亏损！`, "error");
      setClosedTrades(p => [{ dir: "多", pnl: -position.margin, time: new Date().toLocaleTimeString() }, ...p]);
    } else if (direction === "short" && currentPrice >= liquidPrice) {
      setLiquidated(true);
      setBalance(b => b - position.margin);
      setPosition(null);
      showMsg(`💥 爆仓！价格涨至 $${currentPrice.toFixed(2)}，高于强平价 $${liquidPrice.toFixed(2)}，保证金全部亏损！`, "error");
      setClosedTrades(p => [{ dir: "空", pnl: -position.margin, time: new Date().toLocaleTimeString() }, ...p]);
    }
  }, [currentPrice, position]);

  const marginNum = parseFloat(margin) || 0;
  const contractSize = marginNum * leverage;

  const calcLiquidPrice = (dir: "long" | "short", entry: number, lev: number) => {
    const maintenanceRate = 0.005;
    if (dir === "long") return entry * (1 - 1 / lev + maintenanceRate);
    else return entry * (1 + 1 / lev - maintenanceRate);
  };

  const handleOpen = (dir: "long" | "short") => {
    if (liquidated) return showMsg("请先重置游戏", "error");
    if (position) return showMsg("已有持仓，请先平仓", "error");
    if (marginNum <= 0) return showMsg("请输入保证金", "error");
    if (marginNum > balance) return showMsg("余额不足", "error");
    const liqPrice = calcLiquidPrice(dir, currentPrice, leverage);
    setBalance(b => b - marginNum);
    setPosition({
      direction: dir,
      entryPrice: currentPrice,
      leverage,
      margin: marginNum,
      size: contractSize,
      liquidPrice: liqPrice,
      time: new Date().toLocaleTimeString(),
    });
    setLiquidated(false);
    showMsg(`✅ 开${dir === "long" ? "多" : "空"} ${leverage}x，保证金 $${marginNum}，合约价值 $${contractSize.toFixed(0)}，强平价 $${liqPrice.toFixed(2)}`, "success");
    setMargin("");
  };

  const handleClose = () => {
    if (!position) return;
    const { direction, entryPrice, margin: m, size } = position;
    const priceDiff = direction === "long"
      ? (currentPrice - entryPrice) / entryPrice
      : (entryPrice - currentPrice) / entryPrice;
    const pnl = priceDiff * size;
    const returnBalance = m + pnl;
    setBalance(b => b + Math.max(returnBalance, 0));
    setClosedTrades(p => [{
      dir: direction === "long" ? "多" : "空",
      pnl,
      time: new Date().toLocaleTimeString(),
    }, ...p].slice(0, 8));
    setPosition(null);
    showMsg(`${pnl >= 0 ? "🎉" : "📉"} 平仓成功，盈亏 ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`, pnl >= 0 ? "success" : "error");
  };

  // 实时盈亏
  const unrealizedPnl = position
    ? (() => {
        const { direction, entryPrice, size } = position;
        const diff = direction === "long"
          ? (currentPrice - entryPrice) / entryPrice
          : (entryPrice - currentPrice) / entryPrice;
        return diff * size;
      })()
    : 0;

  const marginRatio = position
    ? Math.max(0, ((position.margin + unrealizedPnl) / position.margin) * 100)
    : 100;

  const totalPnl = closedTrades.reduce((a, t) => a + t.pnl, 0);

  return (
    <div className="min-h-screen bg-[#0A192F] text-white">
      <div className="sticky top-0 z-30 bg-[#0A192F]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/exchange-guide/futures">
            <button className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> 返回合约教程
            </button>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-red-400 font-bold text-sm">⚡ 合约交易模拟器</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPaused(p => !p)} className={`px-3 py-1 rounded-lg text-xs font-bold ${paused ? "bg-green-500 text-black" : "bg-slate-700 text-white"}`}>
            {paused ? "▶ 继续" : "⏸ 暂停"}
          </button>
          <button onClick={() => setSpeed(s => s === 1 ? 2 : 1)} className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-700 text-white">
            {speed === 1 ? "🐢 慢速" : "🐇 快速"}
          </button>
          <button onClick={() => {
            setPrices(initPrices(80, 65000));
            setBalance(INITIAL_BALANCE);
            setPosition(null);
            setClosedTrades([]);
            setCurrentPrice(65000);
            setLiquidated(false);
          }} className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-slate-700 text-white">
            <RefreshCw className="w-3 h-3" /> 重置
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {msg && (
          <div className={`mb-3 px-4 py-2 rounded-xl text-sm font-medium ${
            msg.type === "success" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
            msg.type === "error" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
            msg.type === "warn" ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" :
            "bg-blue-500/20 text-blue-300 border border-blue-500/30"
          }`}>
            {msg.text}
          </div>
        )}

        {liquidated && (
          <div className="mb-4 bg-red-500/20 border border-red-500/40 rounded-2xl p-4 text-center">
            <div className="text-4xl mb-2">💥</div>
            <div className="text-red-300 font-black text-lg">爆仓了！</div>
            <p className="text-red-400 text-sm mt-1">这就是合约交易的风险——杠杆放大了亏损，保证金全部归零。</p>
            <button onClick={() => {
              setPrices(initPrices(80, 65000));
              setBalance(INITIAL_BALANCE);
              setPosition(null);
              setClosedTrades([]);
              setCurrentPrice(65000);
              setLiquidated(false);
            }} className="mt-3 px-6 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl text-sm">
              重新开始
            </button>
          </div>
        )}

        {/* 价格 + 账户 */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div>
            <span className="text-slate-400 text-sm">BTC/USDT 永续合约</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black">${currentPrice.toFixed(2)}</span>
              {position && (
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${unrealizedPnl >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <div className="ml-auto flex gap-4 text-sm flex-wrap">
            <div className="text-center">
              <div className="text-slate-400 text-xs">可用余额</div>
              <div className="font-bold text-yellow-400">${balance.toFixed(2)}</div>
            </div>
            {position && (
              <>
                <div className="text-center">
                  <div className="text-slate-400 text-xs">方向</div>
                  <div className={`font-bold ${position.direction === "long" ? "text-green-400" : "text-red-400"}`}>
                    {position.direction === "long" ? "▲ 做多" : "▼ 做空"} {position.leverage}x
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400 text-xs">保证金比率</div>
                  <div className={`font-bold ${marginRatio > 50 ? "text-green-400" : marginRatio > 20 ? "text-yellow-400" : "text-red-400"}`}>
                    {marginRatio.toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400 text-xs">强平价</div>
                  <div className="font-bold text-red-400">${position.liquidPrice.toFixed(2)}</div>
                </div>
              </>
            )}
            <div className="text-center">
              <div className="text-slate-400 text-xs">累计盈亏</div>
              <div className={`font-bold ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 图表 */}
          <div className="lg:col-span-2 bg-[#0D2137] rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">BTC/USDT 永续 · 实时价格（模拟）</span>
              {position && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-yellow-400">开仓: ${position.entryPrice.toFixed(2)}</span>
                  <span className="text-red-400">强平: ${position.liquidPrice.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div style={{ height: 280 }}>
              <PriceChart
                prices={prices}
                entryPrice={position?.entryPrice}
                liquidPrice={position?.liquidPrice}
                width={800} height={280}
              />
            </div>
          </div>

          {/* 交易面板 */}
          <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-4">
            {/* 杠杆选择 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-400">杠杆倍数</label>
                <span className="text-yellow-400 font-black text-lg">{leverage}x</span>
              </div>
              <input
                type="range" min={1} max={100} step={1}
                value={leverage}
                onChange={e => setLeverage(Number(e.target.value))}
                className="w-full accent-yellow-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1x</span><span>25x</span><span>50x</span><span>100x</span>
              </div>
              {leverage >= 20 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-orange-400">
                  <AlertTriangle className="w-3 h-3" /> 高杠杆极度危险，新手慎用
                </div>
              )}
            </div>

            {/* 保证金 */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-1 block">保证金 (USDT)</label>
              <input
                type="number"
                value={margin}
                onChange={e => setMargin(e.target.value)}
                placeholder="100"
                disabled={!!position}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50 disabled:opacity-50"
              />
              <div className="flex gap-1 mt-1.5">
                {[0.1, 0.25, 0.5, 1].map(pct => (
                  <button key={pct} onClick={() => setMargin((balance * pct).toFixed(2))} disabled={!!position}
                    className="flex-1 text-xs py-1 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 disabled:opacity-50">
                    {pct * 100}%
                  </button>
                ))}
              </div>
            </div>

            {/* 合约信息 */}
            <div className="bg-white/5 rounded-xl p-3 mb-4 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>合约价值</span>
                <span className="text-white">${(marginNum * leverage).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>预计强平价（做多）</span>
                <span className="text-red-400">${calcLiquidPrice("long", currentPrice, leverage).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>预计强平价（做空）</span>
                <span className="text-red-400">${calcLiquidPrice("short", currentPrice, leverage).toFixed(2)}</span>
              </div>
            </div>

            {!position ? (
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleOpen("long")}
                  className="py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-black text-sm transition-all hover:scale-105">
                  ▲ 做多
                </button>
                <button onClick={() => handleOpen("short")}
                  className="py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-black text-sm transition-all hover:scale-105">
                  ▼ 做空
                </button>
              </div>
            ) : (
              <button onClick={handleClose}
                className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-sm transition-all hover:scale-105">
                平仓 (当前 {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)})
              </button>
            )}
          </div>
        </div>

        {/* 保证金比率警告 */}
        {position && marginRatio < 30 && (
          <div className="mt-4 bg-red-500/20 border border-red-500/40 rounded-xl p-3 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="text-red-300 font-bold text-sm">⚠️ 保证金比率过低！（{marginRatio.toFixed(1)}%）</p>
              <p className="text-red-400 text-xs">距离强平价格仅剩 {Math.abs(((currentPrice - position.liquidPrice) / currentPrice) * 100).toFixed(2)}%，请考虑平仓或追加保证金</p>
            </div>
          </div>
        )}

        {/* 交易记录 */}
        {closedTrades.length > 0 && (
          <div className="mt-4 bg-[#0D2137] rounded-2xl border border-white/10 p-4">
            <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-400" /> 平仓记录
            </h3>
            <div className="space-y-2">
              {closedTrades.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-slate-400">{t.time}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${t.dir === "多" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {t.dir === "多" ? "▲ 做多" : "▼ 做空"}
                  </span>
                  <span className={`font-bold ${t.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 教学提示 */}
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-300 space-y-1">
              <p className="font-bold text-red-400">⚡ 合约交易核心风险</p>
              <p>• <strong>杠杆放大效应</strong>：10倍杠杆意味着价格波动1%，你的盈亏就是10%</p>
              <p>• <strong>强平机制</strong>：当保证金比率过低时，系统自动平仓，保证金归零</p>
              <p>• <strong>做多 vs 做空</strong>：做多赌价格上涨，做空赌价格下跌，双向均可盈利</p>
              <p>• <strong>建议</strong>：新手不要使用超过5倍杠杆，单次仓位不超过账户的10%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
