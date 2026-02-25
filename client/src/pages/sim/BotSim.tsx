import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, RefreshCw, Info, Play, Square, Zap } from "lucide-react";
import { useScrollMemory, goBack } from '@/hooks/useScrollMemory';

function generatePrice(prev: number, vol = 0.018) {
  return Math.max(prev * (1 + (Math.random() - 0.48) * vol), 1);
}
function initPrices(n = 200, start = 65000) {
  const a = [start];
  for (let i = 1; i < n; i++) a.push(generatePrice(a[i - 1]));
  return a;
}

// 策略类型
const STRATEGIES = [
  {
    id: "grid",
    name: "网格交易",
    icon: "🔲",
    desc: "在价格区间内均匀设置买卖网格，震荡行情中自动低买高卖",
    params: [
      { key: "lower", label: "价格下限", default: 60000, min: 1000, max: 200000, step: 1000 },
      { key: "upper", label: "价格上限", default: 70000, min: 1000, max: 200000, step: 1000 },
      { key: "grids", label: "网格数量", default: 10, min: 3, max: 50, step: 1 },
    ],
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  {
    id: "dca",
    name: "定投策略 DCA",
    icon: "📅",
    desc: "每隔固定时间自动买入固定金额，平摊成本，适合长期持有",
    params: [
      { key: "interval", label: "买入间隔（ticks）", default: 20, min: 5, max: 100, step: 5 },
      { key: "amount", label: "每次买入金额 ($)", default: 200, min: 50, max: 2000, step: 50 },
    ],
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
  },
  {
    id: "ma",
    name: "均线交叉策略",
    icon: "📈",
    desc: "短期均线上穿长期均线时买入，下穿时卖出（经典趋势跟踪）",
    params: [
      { key: "shortMA", label: "短期均线周期", default: 5, min: 2, max: 20, step: 1 },
      { key: "longMA", label: "长期均线周期", default: 20, min: 5, max: 60, step: 1 },
    ],
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
  },
  {
    id: "rsi",
    name: "RSI 超买超卖",
    icon: "📊",
    desc: "RSI低于超卖线时买入，高于超买线时卖出（均值回归）",
    params: [
      { key: "period", label: "RSI周期", default: 14, min: 5, max: 30, step: 1 },
      { key: "oversold", label: "超卖线（买入）", default: 30, min: 10, max: 45, step: 5 },
      { key: "overbought", label: "超买线（卖出）", default: 70, min: 55, max: 90, step: 5 },
    ],
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
];

// 计算RSI
function calcRSI(prices: number[], period: number): number {
  if (prices.length < period + 1) return 50;
  const changes = prices.slice(-period - 1).map((p, i, a) => i > 0 ? p - a[i - 1] : 0).slice(1);
  const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
  const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0)) / period;
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

// 计算均线
function calcMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1];
  return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
}

// 图表
function BotChart({ prices, trades, width, height }: {
  prices: number[];
  trades: { price: number; type: "buy" | "sell"; idx: number }[];
  width: number; height: number;
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
    const pad = { t: 15, b: 20, l: 10, r: 65 };
    const cW = width - pad.l - pad.r, cH = height - pad.t - pad.b;
    const mn = Math.min(...prices) * 0.998, mx = Math.max(...prices) * 1.002, rng = mx - mn;
    const tx = (i: number) => pad.l + (i / (prices.length - 1)) * cW;
    const ty = (p: number) => pad.t + cH - ((p - mn) / rng) * cH;
    // 网格
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + (cH / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(width - pad.r, y); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "10px monospace"; ctx.textAlign = "left";
      ctx.fillText((mx - (rng / 4) * i).toFixed(0), width - pad.r + 4, y + 4);
    }
    // 价格线
    ctx.beginPath();
    prices.forEach((p, i) => i === 0 ? ctx.moveTo(tx(i), ty(p)) : ctx.lineTo(tx(i), ty(p)));
    const isUp = prices[prices.length - 1] >= prices[0];
    ctx.strokeStyle = isUp ? "#26a69a" : "#ef5350"; ctx.lineWidth = 1.5; ctx.stroke();
    // 交易标记
    trades.forEach(t => {
      if (t.idx >= prices.length) return;
      const x = tx(t.idx), y = ty(t.price);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = t.type === "buy" ? "#26a69a" : "#ef5350";
      ctx.fill();
      ctx.fillStyle = t.type === "buy" ? "#26a69a" : "#ef5350";
      ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(t.type === "buy" ? "B" : "S", x, y + (t.type === "buy" ? 18 : -10));
    });
  }, [prices, trades, width, height]);
  return <canvas ref={ref} style={{ display: "block" }} />;
}

interface BotTrade {
  type: "buy" | "sell";
  price: number;
  amount: number;
  reason: string;
  time: string;
  idx: number;
}

const INITIAL_BALANCE = 20000;

export default function BotSim() {
  useScrollMemory();
  const [strategyId, setStrategyId] = useState("grid");
  const [params, setParams] = useState<Record<string, number>>(() => {
    const p: Record<string, number> = {};
    STRATEGIES.forEach(s => s.params.forEach(param => { p[`${s.id}_${param.key}`] = param.default; }));
    return p;
  });
  const [prices, setPrices] = useState(() => initPrices(200, 65000));
  const [currentPrice, setCurrentPrice] = useState(65000);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [btcHeld, setBtcHeld] = useState(0);
  const [botTrades, setBotTrades] = useState<BotTrade[]>([]);
  const [botRunning, setBotRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  const [lastGridBuy, setLastGridBuy] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [prevShortMA, setPrevShortMA] = useState<number | null>(null);
  const [prevLongMA, setPrevLongMA] = useState<number | null>(null);

  const strategy = STRATEGIES.find(s => s.id === strategyId)!;
  const getParam = (key: string) => params[`${strategyId}_${key}`] ?? 0;

  const showMsg = (text: string) => { setMsg(text); setTimeout(() => setMsg(null), 2500); };

  const executeBotLogic = useCallback((price: number, priceArr: number[], tick: number, bal: number, btc: number) => {
    let newBal = bal, newBtc = btc;
    let trade: BotTrade | null = null;

    if (strategyId === "grid") {
      const lower = getParam("lower"), upper = getParam("upper"), grids = getParam("grids");
      if (price < lower || price > upper) return { bal: newBal, btc: newBtc, trade: null };
      const gridSize = (upper - lower) / grids;
      const gridLevel = Math.floor((price - lower) / gridSize);
      const gridPrice = lower + gridLevel * gridSize;
      if (lastGridBuy === null || Math.abs(price - gridPrice) < gridSize * 0.1) {
        if (lastGridBuy === null || price < lastGridBuy - gridSize * 0.8) {
          const amount = 200 / price;
          if (newBal >= 200) {
            newBal -= 200; newBtc += amount;
            trade = { type: "buy", price, amount, reason: `网格买入 Level ${gridLevel}`, time: new Date().toLocaleTimeString(), idx: priceArr.length - 1 };
            setLastGridBuy(price);
          }
        } else if (lastGridBuy !== null && price > lastGridBuy + gridSize * 0.8) {
          const amount = Math.min(newBtc, 200 / price);
          if (amount > 0.0001) {
            newBal += amount * price; newBtc -= amount;
            trade = { type: "sell", price, amount, reason: `网格卖出 +${((price - lastGridBuy) / lastGridBuy * 100).toFixed(1)}%`, time: new Date().toLocaleTimeString(), idx: priceArr.length - 1 };
            setLastGridBuy(null);
          }
        }
      }
    } else if (strategyId === "dca") {
      const interval = getParam("interval"), amount = getParam("amount");
      if (tick % interval === 0 && newBal >= amount) {
        const btcAmt = amount / price;
        newBal -= amount; newBtc += btcAmt;
        trade = { type: "buy", price, amount: btcAmt, reason: `定投 $${amount}`, time: new Date().toLocaleTimeString(), idx: priceArr.length - 1 };
      }
    } else if (strategyId === "ma") {
      const shortP = getParam("shortMA"), longP = getParam("longMA");
      if (priceArr.length >= longP + 1) {
        const shortMA = calcMA(priceArr, shortP);
        const longMA = calcMA(priceArr, longP);
        if (prevShortMA !== null && prevLongMA !== null) {
          if (prevShortMA <= prevLongMA && shortMA > longMA && newBal >= 500) {
            const btcAmt = 500 / price;
            newBal -= 500; newBtc += btcAmt;
            trade = { type: "buy", price, amount: btcAmt, reason: `均线金叉 MA${shortP}↑MA${longP}`, time: new Date().toLocaleTimeString(), idx: priceArr.length - 1 };
          } else if (prevShortMA >= prevLongMA && shortMA < longMA && newBtc > 0.001) {
            const amount = newBtc * 0.5;
            newBal += amount * price; newBtc -= amount;
            trade = { type: "sell", price, amount, reason: `均线死叉 MA${shortP}↓MA${longP}`, time: new Date().toLocaleTimeString(), idx: priceArr.length - 1 };
          }
        }
        setPrevShortMA(shortMA);
        setPrevLongMA(longMA);
      }
    } else if (strategyId === "rsi") {
      const period = getParam("period"), oversold = getParam("oversold"), overbought = getParam("overbought");
      if (priceArr.length >= period + 1) {
        const rsi = calcRSI(priceArr, period);
        if (rsi < oversold && newBal >= 300) {
          const btcAmt = 300 / price;
          newBal -= 300; newBtc += btcAmt;
          trade = { type: "buy", price, amount: btcAmt, reason: `RSI超卖 ${rsi.toFixed(1)}<${oversold}`, time: new Date().toLocaleTimeString(), idx: priceArr.length - 1 };
        } else if (rsi > overbought && newBtc > 0.001) {
          const amount = newBtc * 0.5;
          newBal += amount * price; newBtc -= amount;
          trade = { type: "sell", price, amount, reason: `RSI超买 ${rsi.toFixed(1)}>${overbought}`, time: new Date().toLocaleTimeString(), idx: priceArr.length - 1 };
        }
      }
    }
    return { bal: newBal, btc: newBtc, trade };
  }, [strategyId, params, lastGridBuy, prevShortMA, prevLongMA]);

  const tick = useCallback(() => {
    setPrices(prev => {
      const last = prev[prev.length - 1];
      const next = generatePrice(last);
      const newPrices = [...prev.slice(-199), next];
      setCurrentPrice(next);
      setTickCount(t => {
        const newTick = t + 1;
        if (botRunning) {
          setBalance(bal => {
            setBtcHeld(btc => {
              const result = executeBotLogic(next, newPrices, newTick, bal, btc);
              if (result.trade) {
                setBotTrades(trades => [result.trade!, ...trades].slice(0, 20));
                showMsg(`🤖 ${result.trade.type === "buy" ? "买入" : "卖出"} @ $${result.trade.price.toFixed(0)} · ${result.trade.reason}`);
              }
              return result.btc;
            });
            return bal; // 临时返回，实际在上面更新
          });
          // 重新执行一次获取正确的余额
          setBalance(bal => {
            setBtcHeld(btc => {
              const result = executeBotLogic(next, newPrices, newTick, bal, btc);
              return result.btc;
            });
            const result2 = executeBotLogic(next, newPrices, newTick, bal, btcHeld);
            return result2.bal;
          });
        }
        return newTick;
      });
      return newPrices;
    });
  }, [botRunning, executeBotLogic, btcHeld]);

  // 简化的tick逻辑，避免state闭包问题
  const balRef = useRef(balance);
  const btcRef = useRef(btcHeld);
  const tickRef = useRef(0);
  balRef.current = balance;
  btcRef.current = btcHeld;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setPrices(prev => {
        const last = prev[prev.length - 1];
        const next = generatePrice(last);
        const newPrices = [...prev.slice(-199), next];
        setCurrentPrice(next);
        tickRef.current++;
        if (botRunning) {
          const result = executeBotLogic(next, newPrices, tickRef.current, balRef.current, btcRef.current);
          if (result.trade) {
            setBotTrades(trades => [result.trade!, ...trades].slice(0, 20));
          }
          setBalance(result.bal);
          setBtcHeld(result.btc);
        }
        return newPrices;
      });
    }, speed === 1 ? 1000 : 300);
    return () => clearInterval(id);
  }, [botRunning, speed, paused, executeBotLogic]);

  const totalValue = balance + btcHeld * currentPrice;
  const totalReturn = ((totalValue - INITIAL_BALANCE) / INITIAL_BALANCE * 100);
  const chartTrades = botTrades.slice(0, 30).map(t => ({ price: t.price, type: t.type, idx: t.idx }));

  // RSI 当前值
  const currentRSI = strategyId === "rsi" ? calcRSI(prices, getParam("period")) : null;
  const shortMAVal = strategyId === "ma" ? calcMA(prices, getParam("shortMA")) : null;
  const longMAVal = strategyId === "ma" ? calcMA(prices, getParam("longMA")) : null;

  return (
    <div className="min-h-screen bg-[#0A192F] text-white">
      <div className="sticky top-0 z-30 bg-[#0A192F]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" /> 返回机器人教程
            </button>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-bold text-sm">🤖 交易机器人模拟器</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPaused(p => !p)} className={`px-3 py-1 rounded-lg text-xs font-bold ${paused ? "bg-green-500 text-black" : "bg-slate-700 text-white"}`}>
            {paused ? "▶ 继续" : "⏸ 暂停"}
          </button>
          <button onClick={() => setSpeed(s => s === 1 ? 2 : 1)} className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-700 text-white">
            {speed === 1 ? "🐢 慢速" : "🐇 快速"}
          </button>
          <button onClick={() => {
            setPrices(initPrices(200, 65000)); setBalance(INITIAL_BALANCE);
            setBtcHeld(0); setBotTrades([]); setCurrentPrice(65000);
            setBotRunning(false); tickRef.current = 0; setLastGridBuy(null);
            setPrevShortMA(null); setPrevLongMA(null);
          }} className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-slate-700 text-white">
            <RefreshCw className="w-3 h-3" /> 重置
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {msg && (
          <div className="mb-3 px-4 py-2 rounded-xl text-sm font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
            {msg}
          </div>
        )}

        {/* 账户概览 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "BTC价格", value: `$${currentPrice.toFixed(0)}`, color: "text-white" },
            { label: "现金余额", value: `$${balance.toFixed(2)}`, color: "text-yellow-400" },
            { label: "持仓BTC", value: `${btcHeld.toFixed(4)} BTC`, color: "text-cyan-400" },
            { label: "总资产 / 收益率", value: `$${totalValue.toFixed(0)} (${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)}%)`, color: totalReturn >= 0 ? "text-green-400" : "text-red-400" },
          ].map(item => (
            <div key={item.label} className="bg-[#0D2137] rounded-xl border border-white/10 p-3 text-center">
              <div className="text-slate-400 text-xs mb-1">{item.label}</div>
              <div className={`font-black text-sm ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 图表 + 记录 */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0D2137] rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">BTC/USDT · 绿点=买入 红点=卖出</span>
                <div className="flex items-center gap-2">
                  {currentRSI !== null && (
                    <span className={`text-xs font-bold ${currentRSI < 30 ? "text-green-400" : currentRSI > 70 ? "text-red-400" : "text-slate-400"}`}>
                      RSI: {currentRSI.toFixed(1)}
                    </span>
                  )}
                  {shortMAVal !== null && (
                    <span className="text-xs text-yellow-400">
                      MA{getParam("shortMA")}: ${shortMAVal.toFixed(0)} | MA{getParam("longMA")}: ${longMAVal?.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
              <BotChart prices={prices} trades={chartTrades} width={800} height={260} />
            </div>

            {/* 交易记录 */}
            <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" /> 机器人交易记录
                <span className="ml-auto text-xs text-slate-500">{botTrades.length} 笔</span>
              </h3>
              {botTrades.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">启动机器人后，交易记录将在此显示</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {botTrades.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs border-b border-white/5 pb-1.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold shrink-0 ${t.type === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {t.type === "buy" ? "买" : "卖"}
                      </span>
                      <span className="text-white">${t.price.toFixed(0)}</span>
                      <span className="text-slate-400 truncate flex-1">{t.reason}</span>
                      <span className="text-slate-500 shrink-0">{t.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 策略配置面板 */}
          <div className="space-y-4">
            {/* 策略选择 */}
            <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3">选择策略</h3>
              <div className="space-y-2">
                {STRATEGIES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { if (!botRunning) { setStrategyId(s.id); setPrevShortMA(null); setPrevLongMA(null); } }}
                    disabled={botRunning}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      strategyId === s.id ? s.bg : "border-white/10 bg-white/5 hover:bg-white/10"
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{s.icon}</span>
                      <div>
                        <div className={`text-sm font-bold ${strategyId === s.id ? s.color : "text-white"}`}>{s.name}</div>
                        <div className="text-slate-500 text-xs">{s.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 参数配置 */}
            <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3">参数配置</h3>
              <div className="space-y-3">
                {strategy.params.map(param => (
                  <div key={param.key}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-slate-400">{param.label}</label>
                      <span className={`text-sm font-bold ${strategy.color}`}>{getParam(param.key)}</span>
                    </div>
                    <input
                      type="range"
                      min={param.min} max={param.max} step={param.step}
                      value={getParam(param.key)}
                      onChange={e => setParams(p => ({ ...p, [`${strategyId}_${param.key}`]: Number(e.target.value) }))}
                      disabled={botRunning}
                      className="w-full accent-cyan-500 disabled:opacity-50"
                    />
                    <div className="flex justify-between text-xs text-slate-600 mt-0.5">
                      <span>{param.min}</span><span>{param.max}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 启动/停止 */}
            <button
              onClick={() => setBotRunning(r => !r)}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all hover:scale-105 flex items-center justify-center gap-3 ${
                botRunning
                  ? "bg-red-500 hover:bg-red-400 text-white"
                  : "bg-cyan-500 hover:bg-cyan-400 text-black"
              }`}
            >
              {botRunning ? (
                <><Square className="w-5 h-5" /> 停止机器人</>
              ) : (
                <><Play className="w-5 h-5" /> 启动机器人</>
              )}
            </button>

            {botRunning && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-cyan-400">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-sm font-bold">机器人运行中...</span>
                </div>
                <p className="text-slate-400 text-xs mt-1">策略：{strategy.name}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-300 space-y-1">
              <p className="font-bold text-cyan-400">🤖 交易机器人的优势与局限</p>
              <p>• <strong>优势</strong>：24/7不间断运行，无情绪干扰，严格执行策略，速度极快</p>
              <p>• <strong>网格策略</strong>：适合震荡行情，单边趋势行情中可能持续亏损</p>
              <p>• <strong>均线策略</strong>：趋势跟踪，信号滞后，频繁震荡时会被"割韭菜"</p>
              <p>• <strong>RSI策略</strong>：均值回归，强趋势行情中会逆势操作导致亏损</p>
              <p>• <strong>没有万能策略</strong>：所有策略都有适用场景，需要根据市场状态切换</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
