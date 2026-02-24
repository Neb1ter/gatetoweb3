import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, Info } from "lucide-react";

// ─── 价格生成器 ───────────────────────────────────────────────
function generateCandle(prev: number, volatility = 0.018): {
  open: number; high: number; low: number; close: number; volume: number;
} {
  const change = (Math.random() - 0.48) * volatility;
  const open = prev;
  const close = prev * (1 + change);
  const wick = Math.random() * volatility * 0.5;
  const high = Math.max(open, close) * (1 + wick);
  const low = Math.min(open, close) * (1 - wick);
  const volume = Math.random() * 500 + 100;
  return { open, high, low, close: Math.max(close, 1), volume };
}

function initCandles(count = 60, startPrice = 65000) {
  const candles = [];
  let price = startPrice;
  for (let i = 0; i < count; i++) {
    const c = generateCandle(price);
    candles.push(c);
    price = c.close;
  }
  return candles;
}

// ─── K线画布 ──────────────────────────────────────────────────
function CandleChart({ candles, width, height }: {
  candles: { open: number; high: number; low: number; close: number }[];
  width: number; height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0A192F";
    ctx.fillRect(0, 0, width, height);

    const pad = { top: 20, bottom: 30, left: 10, right: 60 };
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;

    const prices = candles.flatMap(c => [c.high, c.low]);
    const minP = Math.min(...prices) * 0.999;
    const maxP = Math.max(...prices) * 1.001;
    const range = maxP - minP;

    const toY = (p: number) => pad.top + chartH - ((p - minP) / range) * chartH;
    const candleW = Math.max(2, chartW / candles.length - 2);
    const spacing = chartW / candles.length;

    // 网格线
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
      const price = maxP - (range / 4) * i;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      ctx.fillText(price.toFixed(0), width - pad.right + 4, y + 4);
    }

    // K线
    candles.forEach((c, i) => {
      const x = pad.left + i * spacing + spacing / 2;
      const isUp = c.close >= c.open;
      const color = isUp ? "#26a69a" : "#ef5350";

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, toY(c.high));
      ctx.lineTo(x, toY(c.low));
      ctx.stroke();

      ctx.fillStyle = color;
      const bodyTop = toY(Math.max(c.open, c.close));
      const bodyH = Math.max(1, Math.abs(toY(c.open) - toY(c.close)));
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
    });

    // 最新价格线
    const last = candles[candles.length - 1];
    const lastY = toY(last.close);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = last.close >= last.open ? "#26a69a" : "#ef5350";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, lastY);
    ctx.lineTo(width - pad.right, lastY);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [candles, width, height]);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}

// ─── 主游戏组件 ───────────────────────────────────────────────
interface Position {
  id: number;
  type: "buy" | "sell";
  price: number;
  amount: number; // BTC数量
  time: string;
  closed?: boolean;
  closePrice?: number;
  pnl?: number;
}

const INITIAL_BALANCE = 10000; // USDT

export default function SpotSim() {
  const [candles, setCandles] = useState(() => initCandles(60, 65000));
  const [currentPrice, setCurrentPrice] = useState(65000);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [btcHeld, setBtcHeld] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [closedTrades, setClosedTrades] = useState<Position[]>([]);
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [speed, setSpeed] = useState(1); // 1=慢, 2=快
  const [paused, setPaused] = useState(false);
  const posIdRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showMsg = (text: string, type: "success" | "error" | "info" = "info") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2500);
  };

  // 价格推进
  const tick = useCallback(() => {
    setCandles(prev => {
      const last = prev[prev.length - 1];
      const newCandle = generateCandle(last.close);
      const next = [...prev.slice(-79), newCandle];
      setCurrentPrice(newCandle.close);
      return next;
    });
  }, []);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(tick, speed === 1 ? 1200 : 400);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [tick, speed, paused]);

  const execPrice = orderType === "market" ? currentPrice : parseFloat(limitPrice) || currentPrice;
  const amountNum = parseFloat(amount) || 0;
  const totalCost = execPrice * amountNum;

  const handleBuy = () => {
    if (amountNum <= 0) return showMsg("请输入购买数量", "error");
    if (totalCost > balance) return showMsg("余额不足！", "error");
    const price = orderType === "market" ? currentPrice : parseFloat(limitPrice);
    if (!price || price <= 0) return showMsg("请输入有效限价", "error");
    const fee = totalCost * 0.001;
    setBalance(b => b - totalCost - fee);
    setBtcHeld(h => h + amountNum);
    posIdRef.current++;
    setPositions(p => [...p, {
      id: posIdRef.current,
      type: "buy",
      price,
      amount: amountNum,
      time: new Date().toLocaleTimeString(),
    }]);
    showMsg(`✅ 买入 ${amountNum} BTC @ $${price.toFixed(2)}，手续费 $${fee.toFixed(2)}`, "success");
    setAmount("");
  };

  const handleSell = () => {
    if (amountNum <= 0) return showMsg("请输入卖出数量", "error");
    if (amountNum > btcHeld) return showMsg(`持仓不足！当前持有 ${btcHeld.toFixed(4)} BTC`, "error");
    const price = orderType === "market" ? currentPrice : parseFloat(limitPrice);
    if (!price || price <= 0) return showMsg("请输入有效限价", "error");
    const proceeds = price * amountNum;
    const fee = proceeds * 0.001;
    setBalance(b => b + proceeds - fee);
    setBtcHeld(h => h - amountNum);

    // 计算盈亏（FIFO）
    const avgBuyPrice = positions.filter(p => !p.closed && p.type === "buy")
      .reduce((acc, p) => acc + p.price * p.amount, 0) / (btcHeld || 1);
    const pnl = (price - avgBuyPrice) * amountNum;

    posIdRef.current++;
    const trade: Position = {
      id: posIdRef.current,
      type: "sell",
      price,
      amount: amountNum,
      time: new Date().toLocaleTimeString(),
      closed: true,
      closePrice: price,
      pnl,
    };
    setClosedTrades(p => [trade, ...p].slice(0, 10));
    showMsg(`✅ 卖出 ${amountNum} BTC @ $${price.toFixed(2)}，盈亏 ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`, pnl >= 0 ? "success" : "error");
    setAmount("");
  };

  const totalPnl = closedTrades.reduce((a, t) => a + (t.pnl || 0), 0);
  const unrealizedPnl = btcHeld > 0
    ? (() => {
        const avgBuy = positions.filter(p => !p.closed && p.type === "buy")
          .reduce((acc, p) => acc + p.price * p.amount, 0) / (btcHeld || 1);
        return (currentPrice - avgBuy) * btcHeld;
      })()
    : 0;

  const priceChange = candles.length >= 2
    ? ((candles[candles.length - 1].close - candles[0].close) / candles[0].close * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0A192F] text-white">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-30 bg-[#0A192F]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/exchange-guide/spot">
            <button className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> 返回现货教程
            </button>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-yellow-400 font-bold text-sm">📈 现货交易模拟器</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(p => !p)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${paused ? "bg-green-500 text-black" : "bg-slate-700 text-white"}`}
          >
            {paused ? "▶ 继续" : "⏸ 暂停"}
          </button>
          <button
            onClick={() => setSpeed(s => s === 1 ? 2 : 1)}
            className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-700 text-white hover:bg-slate-600"
          >
            {speed === 1 ? "🐢 慢速" : "🐇 快速"}
          </button>
          <button
            onClick={() => {
              setCandles(initCandles(60, 65000));
              setBalance(INITIAL_BALANCE);
              setBtcHeld(0);
              setPositions([]);
              setClosedTrades([]);
              setCurrentPrice(65000);
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-slate-700 text-white hover:bg-slate-600"
          >
            <RefreshCw className="w-3 h-3" /> 重置
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* 消息提示 */}
        {msg && (
          <div className={`mb-3 px-4 py-2 rounded-xl text-sm font-medium animate-pulse ${
            msg.type === "success" ? "bg-green-500/20 text-green-300 border border-green-500/30" :
            msg.type === "error" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
            "bg-blue-500/20 text-blue-300 border border-blue-500/30"
          }`}>
            {msg.text}
          </div>
        )}

        {/* 价格头部 */}
        <div className="flex items-center gap-4 mb-4">
          <div>
            <span className="text-slate-400 text-sm">BTC/USDT</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-white">${currentPrice.toFixed(2)}</span>
              <span className={`text-sm font-bold ${priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                {priceChange >= 0 ? "▲" : "▼"} {Math.abs(priceChange).toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="ml-auto flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-slate-400 text-xs">余额</div>
              <div className="font-bold text-yellow-400">${balance.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 text-xs">持仓BTC</div>
              <div className="font-bold text-white">{btcHeld.toFixed(4)}</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 text-xs">浮动盈亏</div>
              <div className={`font-bold ${unrealizedPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 text-xs">已实现盈亏</div>
              <div className={`font-bold ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* K线图 */}
          <div className="lg:col-span-2 bg-[#0D2137] rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">BTC/USDT · 1分钟K线（模拟）</span>
              <div className="flex gap-1">
                {["1m", "5m", "15m"].map(t => (
                  <span key={t} className={`text-xs px-2 py-0.5 rounded ${t === "1m" ? "bg-yellow-500 text-black font-bold" : "text-slate-500"}`}>{t}</span>
                ))}
              </div>
            </div>
            <div className="w-full" style={{ height: 280 }}>
              <CandleChart candles={candles} width={800} height={280} />
            </div>
          </div>

          {/* 交易面板 */}
          <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setOrderType("market")}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${orderType === "market" ? "bg-yellow-500 text-black" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
              >
                市价单
              </button>
              <button
                onClick={() => setOrderType("limit")}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${orderType === "limit" ? "bg-yellow-500 text-black" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
              >
                限价单
              </button>
            </div>

            {orderType === "limit" && (
              <div className="mb-3">
                <label className="text-xs text-slate-400 mb-1 block">限价 (USDT)</label>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={e => setLimitPrice(e.target.value)}
                  placeholder={currentPrice.toFixed(2)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                />
              </div>
            )}

            <div className="mb-3">
              <label className="text-xs text-slate-400 mb-1 block">数量 (BTC)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.001"
                step="0.001"
                min="0.001"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
              />
              <div className="flex gap-1 mt-1.5">
                {[0.25, 0.5, 0.75, 1].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setAmount(((balance * pct) / execPrice).toFixed(4))}
                    className="flex-1 text-xs py-1 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    {pct * 100}%
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 mb-4 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>成交价格</span>
                <span className="text-white">${execPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>预计费用</span>
                <span className="text-white">${(totalCost * 0.001).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-bold">
                <span>合计</span>
                <span className="text-yellow-400">${(totalCost * 1.001).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleBuy}
                className="py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-black text-sm transition-all hover:scale-105"
              >
                买入 / 做多
              </button>
              <button
                onClick={handleSell}
                className="py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-black text-sm transition-all hover:scale-105"
              >
                卖出 / 平仓
              </button>
            </div>
          </div>
        </div>

        {/* 交易记录 */}
        <div className="mt-4 bg-[#0D2137] rounded-2xl border border-white/10 p-4">
          <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-yellow-400" /> 交易记录
          </h3>
          {closedTrades.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">暂无交易记录，先买入一些 BTC 吧！</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-white/5">
                    <th className="text-left pb-2">时间</th>
                    <th className="text-right pb-2">方向</th>
                    <th className="text-right pb-2">价格</th>
                    <th className="text-right pb-2">数量</th>
                    <th className="text-right pb-2">盈亏</th>
                  </tr>
                </thead>
                <tbody>
                  {closedTrades.map(t => (
                    <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 text-slate-400">{t.time}</td>
                      <td className="py-2 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${t.type === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {t.type === "buy" ? "买入" : "卖出"}
                        </span>
                      </td>
                      <td className="py-2 text-right text-white">${t.price.toFixed(2)}</td>
                      <td className="py-2 text-right text-white">{t.amount.toFixed(4)}</td>
                      <td className={`py-2 text-right font-bold ${(t.pnl || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {(t.pnl || 0) >= 0 ? "+" : ""}${(t.pnl || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 教学提示 */}
        <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-300 space-y-1">
              <p className="font-bold text-blue-400">💡 现货交易要点</p>
              <p>• <strong>市价单</strong>：立即以当前价格成交，适合快速入场，但可能有滑点</p>
              <p>• <strong>限价单</strong>：设定目标价格，等待市场到达后成交，适合有计划的交易者</p>
              <p>• 手续费为 <strong>0.1%</strong>（模拟真实交易所费率），每笔交易都会扣除</p>
              <p>• 现货交易最多亏损本金，<strong>不会爆仓</strong>，适合新手入门</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
