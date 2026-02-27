/**
 * MarginSim — 杠杆交易模拟器（重构版）
 * 参考 OKX 移动端杠杆界面（图3）
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, RefreshCw, Info, X, ChevronDown } from "lucide-react";
import {
  CandleChart, OrderBook, PositionCard, TpSlModal, Toast, EmptyHint, HistoryTab, ResetConfirmModal, PercentSlider,
  initCandles, nextCandle, calcEMA, genBook,
  type Position, type LimitOrder,
} from "./SimComponents";
import { useLocalHistory } from "./SimComponents";

const INITIAL_BALANCE = 10000;
const TICK_MS = 1000;
const LEVERAGES = [3, 5, 10, 20] as const;
const MARGIN_MODES = ["逐仓", "全仓"] as const;
const HOURLY_RATE = 0.000413;
const INIT_PRICE = 1893;

export default function MarginSim() {
  const [, navigate] = useLocation();

  const [candles,      setCandles]      = useState(() => initCandles(80, INIT_PRICE));
  const [currentPrice, setCurrentPrice] = useState(INIT_PRICE);
  const [openPrice]                     = useState(INIT_PRICE);
  const [book,         setBook]         = useState(() => genBook(INIT_PRICE));
  const [balance,      setBalance]      = useState(INITIAL_BALANCE);
  const [positions,    setPositions]    = useState<Position[]>([]);
  const [limitOrders,  setLimitOrders]  = useState<LimitOrder[]>([]);
  const [borrowed,     setBorrowed]     = useState(0);
  const [side,         setSide]         = useState<"buy" | "sell">("buy");
  const [orderType,    setOrderType]    = useState<"market" | "limit">("market");
  const [limitPrice,   setLimitPrice]   = useState("");
  const [amountInput,  setAmountInput]  = useState("");
  const [marginMode,   setMarginMode]   = useState<typeof MARGIN_MODES[number]>("逐仓");
  const [leverage,     setLeverage]     = useState(10);
  const [paused,       setPaused]       = useState(false);
  const [speed,        setSpeed]        = useState(1);
  const [msg,          setMsg]          = useState<{ text: string; ok: boolean } | null>(null);
  const [drawerTab,    setDrawerTab]    = useState<"positions" | "orders" | "assets" | "history">("positions");
  const [showTip,      setShowTip]      = useState(false);
  const [chartH,       setChartH]       = useState(170);
  const [timeframe,    setTimeframe]    = useState("小时");
  const [showBorrow,   setShowBorrow]   = useState(false);
  const [borrowAmount, setBorrowAmount] = useState("");
  const [tpSlPos,      setTpSlPos]      = useState<Position | null>(null);
  const [showReset,    setShowReset]    = useState(false);
  const [openedAt,     setOpenedAt]     = useState<Record<number, number>>({});
  // 价格偏向：买入时约 70% 向上偏、30% 向下偏，有亏有赢更真实
  const [priceBias,    setPriceBias]    = useState(0);
  // 首次开仓后自动滚动到仓位区域
  const drawerRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);
  // 滑块百分比
  const [sliderPct,    setSliderPct]    = useState(0);

  const { records: historyRecords, addRecord: addHistory, resetRecords: resetHistory } = useLocalHistory("margin");

  const posIdRef = useRef(0);
  const ordIdRef = useRef(0);
  const tickRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const upd = () => setChartH(Math.max(130, Math.min(190, window.innerHeight * 0.22)));
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  const scrollToDrawer = () => {
    if (!hasScrolled.current && drawerRef.current) {
      hasScrolled.current = true;
      setTimeout(() => {
        drawerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  };

  const tick = useCallback(() => {
    setCandles(prev => {
      const last = prev[prev.length - 1];
      const c = nextCandle(last.close, priceBias);
      const price = c.close;
      setCurrentPrice(price);
      setBook(genBook(price));

      // 爆仓 + 止盈止损
      setPositions(ps => ps.filter(p => {
        if (p.direction === "long" && price <= p.liquidPrice) { showMsg("⚠️ 仓位已爆仓", false); return false; }
        if (p.direction === "short" && price >= p.liquidPrice) { showMsg("⚠️ 仓位已爆仓", false); return false; }
        if (p.tpPrice && p.direction === "long" && price >= p.tpPrice) {
          const pnl = (price - p.entryPrice) * p.size;
          setBalance(b => b + p.margin + pnl);
          showMsg(`✅ 止盈触发 +${pnl.toFixed(2)} USDT`, true);
          return false;
        }
        if (p.slPrice && p.direction === "long" && price <= p.slPrice) {
          const pnl = (price - p.entryPrice) * p.size;
          setBalance(b => b + p.margin + pnl);
          showMsg(`🛑 止损触发 ${pnl.toFixed(2)} USDT`, false);
          return false;
        }
        return true;
      }));

      // 限价单触发
      setLimitOrders(orders => {
        const remaining: LimitOrder[] = [];
        orders.forEach(o => {
          const triggered = o.side === "buy" ? price <= o.price : price >= o.price;
          if (triggered) {
            const marginNeeded = o.amount * o.price / leverage;
            setBalance(b => b - marginNeeded);
            posIdRef.current++;
            const liqP = o.side === "buy"
              ? o.price * (1 - 1 / leverage * 0.9)
              : o.price * (1 + 1 / leverage * 0.9);
            setPositions(ps => [...ps, {
              id: posIdRef.current, symbol: "ETH/USDT", type: "margin",
              direction: o.side === "buy" ? "long" : "short",
              size: o.amount, entryPrice: o.price, leverage, margin: marginNeeded, liquidPrice: liqP,
            }]);
            showMsg(`限价单成交 @ ${o.price.toFixed(2)}`, true);
          } else {
            remaining.push(o);
          }
        });
        return remaining;
      });

      return [...prev.slice(-99), c];
    });
  }, [leverage, priceBias]);

  useEffect(() => {
    if (paused) return;
    tickRef.current = setInterval(tick, speed === 1 ? TICK_MS : 350);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [tick, speed, paused]);

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 2500);
  };

  const execPrice = orderType === "market" ? currentPrice : (parseFloat(limitPrice) || currentPrice);
  const amountNum = parseFloat(amountInput) || 0;
  const totalCost = execPrice * amountNum;
  const marginNeeded = totalCost / leverage;
  const canOpen = balance + borrowed;
  const maxBorrow = balance * (leverage - 1);
  const priceChange = (currentPrice - openPrice) / openPrice;

  const unrealizedPnl = positions.reduce((s, p) => {
    const pnl = p.direction === "long"
      ? (currentPrice - p.entryPrice) * p.size
      : (p.entryPrice - currentPrice) * p.size;
    return s + pnl;
  }, 0);

  const handleOrder = () => {
    if (amountNum <= 0) return showMsg("请输入数量", false);
    if (orderType === "limit") {
      ordIdRef.current++;
      setLimitOrders(o => [...o, { id: ordIdRef.current, side, price: execPrice, amount: amountNum, time: new Date().toLocaleTimeString() }]);
      showMsg(`限价委托 ${side === "buy" ? "杠杆买" : "杠杆卖"} @ ${execPrice.toFixed(2)}`, true);
      setAmountInput("");
      return;
    }
    if (side === "buy") {
      if (marginNeeded > balance) return showMsg("保证金不足", false);
      const liqP = execPrice * (1 - 1 / leverage * 0.9);
      posIdRef.current++;
      const newId = posIdRef.current;
      setPositions(ps => [...ps, {
        id: newId, symbol: "ETH/USDT", type: "margin", direction: "long",
        size: amountNum, entryPrice: execPrice, leverage, margin: marginNeeded, liquidPrice: liqP,
      }]);
      setBalance(b => b - marginNeeded);
      setOpenedAt(m => ({ ...m, [newId]: Date.now() }));
      // 约 70% 胜率：70% 时价格向上偏（盈利），30% 时向下偏（亏损）
      setPriceBias(Math.random() < 0.7 ? 0.22 : -0.22);
      setTimeout(() => setPriceBias(0), 15000);
      showMsg(`杠杆买入 ${amountNum.toFixed(4)} ETH @ ${execPrice.toFixed(2)}`, true);
      // 首次开仓后自动切换 Tab 并滚动
      hasScrolled.current = false;
      setDrawerTab("positions");
      scrollToDrawer();
    } else {
      const longPos = positions.find(p => p.direction === "long");
      if (!longPos) return showMsg("无多仓可卖", false);
      const pnl = (execPrice - longPos.entryPrice) * longPos.size;
      const pnlPct = pnl / longPos.margin * 100;
      setBalance(b => b + longPos.margin + pnl);
      setPositions(ps => ps.filter(p => p.id !== longPos.id));
      showMsg(`卖出 盈亏 ${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} USDT`, pnl >= 0);
      addHistory({
        simType: "margin",
        symbol: "ETH/USDT",
        direction: "long",
        entryPrice: longPos.entryPrice.toFixed(2),
        exitPrice: execPrice.toFixed(2),
        size: longPos.size.toFixed(6),
        leverage: longPos.leverage,
        pnl: pnl.toFixed(2),
        pnlPct: pnlPct.toFixed(2),
        closeReason: "manual",
        openedAt: openedAt[longPos.id] || Date.now(),
      });
    }
    setAmountInput(""); setSliderPct(0);
  };

  const closePosition = (pos: Position, reason = "manual") => {
    const pnl = pos.direction === "long"
      ? (currentPrice - pos.entryPrice) * pos.size
      : (pos.entryPrice - currentPrice) * pos.size;
    const pnlPct = pnl / pos.margin * 100;
    setBalance(b => b + pos.margin + pnl);
    setPositions(ps => ps.filter(p => p.id !== pos.id));
    showMsg(`平仓 ${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} USDT`, pnl >= 0);
    addHistory({
      simType: "margin",
      symbol: pos.symbol,
      direction: pos.direction,
      entryPrice: pos.entryPrice.toFixed(2),
      exitPrice: currentPrice.toFixed(2),
      size: pos.size.toFixed(6),
      leverage: pos.leverage,
      pnl: pnl.toFixed(2),
      pnlPct: pnlPct.toFixed(2),
      closeReason: reason,
      openedAt: openedAt[pos.id] || Date.now(),
    });
  };

  const reversePosition = (pos: Position) => {
    closePosition(pos);
    const newDir = pos.direction === "long" ? "short" : "long";
    const liqP = newDir === "long"
      ? currentPrice * (1 - 1 / pos.leverage * 0.9)
      : currentPrice * (1 + 1 / pos.leverage * 0.9);
    const newMargin = pos.size * currentPrice / pos.leverage;
    if (newMargin > balance) return showMsg("余额不足以反手", false);
    posIdRef.current++;
    setPositions(ps => [...ps, {
      id: posIdRef.current, symbol: "ETH/USDT", type: "margin", direction: newDir,
      size: pos.size, entryPrice: currentPrice, leverage: pos.leverage, margin: newMargin, liquidPrice: liqP,
    }]);
    setBalance(b => b - newMargin);
    showMsg(`反手 ${newDir === "long" ? "开多" : "开空"} @ ${currentPrice.toFixed(2)}`, true);
  };

  const updateTpSl = (posId: number, update: Partial<Position>) => {
    setPositions(ps => ps.map(p => p.id === posId ? { ...p, ...update } : p));
    showMsg("止盈止损已设置", true);
  };

  const handleBorrow = () => {
    const amt = parseFloat(borrowAmount);
    if (!amt || amt <= 0) return showMsg("请输入借款金额", false);
    if (amt > maxBorrow - borrowed) return showMsg("超出最大借款额度", false);
    setBorrowed(b => b + amt);
    setBalance(b => b + amt);
    showMsg(`借入 ${amt.toFixed(2)} USDT`, true);
    setBorrowAmount("");
    setShowBorrow(false);
  };

  const handleRepay = () => {
    if (borrowed <= 0) return showMsg("无需还款", false);
    if (balance < borrowed) return showMsg("余额不足以还款", false);
    setBalance(b => b - borrowed);
    setBorrowed(0);
    showMsg("还款成功", true);
    setShowBorrow(false);
  };

  const emas = (() => {
    const closes = candles.map(c => c.close);
    return {
      ema5:   calcEMA(closes, 5).at(-1)!,
      ema25:  calcEMA(closes, 25).at(-1)!,
      ema45:  calcEMA(closes, 45).at(-1)!,
      ema144: calcEMA(closes, 144).at(-1)!,
    };
  })();

  const timeframes = ["1时", "2时", "4时", "6时", "8时", "12时", "1日", "2日", "3日", "5日"];

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0e1a", color: "#fff", fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 13, overscrollBehaviorX: "none" as any, touchAction: "pan-y", overflowX: "hidden" }}>

      {/* 顶部导航（sticky 固定） */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px 6px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0a0e1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => window.history.back()} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "2px 6px 2px 0", display: "flex", alignItems: "center" }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 17 }}>ETH/USDT</span>
              <ChevronDown size={13} color="rgba(255,255,255,0.4)" />
            </div>
            <div style={{ fontSize: 11, color: priceChange >= 0 ? "#26a69a" : "#ef5350", fontWeight: 600, marginTop: 1 }}>
              {priceChange >= 0 ? "+" : ""}{(priceChange * 100).toFixed(2)}%
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setPaused(p => !p)} style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.07)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 11 }}>
            {paused ? "▶" : "⏸"}
          </button>
          <button onClick={() => setSpeed(s => s === 1 ? 3 : 1)} style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.07)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 11 }}>
            {speed}×
          </button>
          <button onClick={() => { setCandles(initCandles(80, INIT_PRICE)); setBalance(INITIAL_BALANCE); setPositions([]); setLimitOrders([]); setBorrowed(0); setCurrentPrice(INIT_PRICE); setAmountInput(""); }} style={{ background: "rgba(255,255,255,0.07)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", borderRadius: 6, padding: "3px 6px", display: "flex", alignItems: "center" }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* 时间周期 */}
      <div style={{ flexShrink: 0, display: "flex", overflowX: "auto", padding: "4px 8px 2px", scrollbarWidth: "none" }}>
        {timeframes.map(t => (
          <button key={t} onClick={() => setTimeframe(t)} style={{
            padding: "4px 10px", fontSize: 12, background: "none", border: "none", cursor: "pointer", flexShrink: 0,
            color: timeframe === t ? "#fff" : "rgba(255,255,255,0.35)",
            fontWeight: timeframe === t ? 700 : 400,
            borderBottom: timeframe === t ? "2px solid #26a69a" : "2px solid transparent",
          }}>{t}</button>
        ))}
      </div>

      {/* EMA 指标行 */}
      <div style={{ flexShrink: 0, display: "flex", gap: 8, padding: "2px 10px 3px", fontSize: 10, fontFamily: "monospace" }}>
        <span style={{ color: "#f59e0b" }}>EMA5:{emas.ema5.toFixed(2)}</span>
        <span style={{ color: "#22c55e" }}>EMA25:{emas.ema25.toFixed(2)}</span>
        <span style={{ color: "#3b82f6" }}>EMA45:{emas.ema45.toFixed(2)}</span>
        <span style={{ color: "#ef4444" }}>EMA144:{emas.ema144.toFixed(2)}</span>
      </div>

      {/* K线图 */}
      <div style={{ flexShrink: 0 }}>
        <CandleChart
          candles={candles}
          height={chartH}
          entryPrice={positions.length > 0 ? positions[positions.length - 1].entryPrice : undefined}
          liquidPrice={positions.length > 0 ? positions[positions.length - 1].liquidPrice : undefined}
        />
      </div>

      {/* 中部：左侧买卖面板 + 右侧借/还+订单簿 */}
      <div style={{ display: "flex", minHeight: 300, borderTop: "1px solid rgba(255,255,255,0.06)" }}>

        {/* 左侧：买卖面板 */}
        <div style={{ flex: "0 0 56%", display: "flex", flexDirection: "column", padding: "8px 10px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

          {/* 买入/卖出 Tab */}
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <button onClick={() => setSide("buy")} style={{
              flex: 1, padding: "8px 0", borderRadius: 22, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700,
              background: side === "buy" ? "#26a69a" : "rgba(255,255,255,0.07)",
              color: side === "buy" ? "#fff" : "rgba(255,255,255,0.45)",
            }}>买入</button>
            <button onClick={() => setSide("sell")} style={{
              flex: 1, padding: "8px 0", borderRadius: 22, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700,
              background: side === "sell" ? "#ef5350" : "rgba(255,255,255,0.07)",
              color: side === "sell" ? "#fff" : "rgba(255,255,255,0.45)",
            }}>卖出</button>
          </div>

          {/* 逐仓/全仓 + 杠杆 */}
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <button onClick={() => setMarginMode(m => m === "逐仓" ? "全仓" : "逐仓")} style={{
              padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "none", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 3,
            }}>{marginMode}<ChevronDown size={11} color="rgba(255,255,255,0.4)" /></button>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "5px 6px" }}>
              {LEVERAGES.map(lv => (
                <button key={lv} onClick={() => setLeverage(lv)} style={{
                  flex: 1, padding: "3px 0", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 11,
                  background: leverage === lv ? "#26a69a" : "transparent",
                  color: leverage === lv ? "#fff" : "rgba(255,255,255,0.4)",
                  fontWeight: leverage === lv ? 700 : 400,
                }}>{lv}x</button>
              ))}
            </div>
          </div>

          {/* 订单类型 */}
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            {(["market", "limit"] as const).map(t => (
              <button key={t} onClick={() => setOrderType(t)} style={{
                flex: 1, padding: "5px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11,
                background: orderType === t ? "rgba(255,255,255,0.12)" : "transparent",
                color: orderType === t ? "#fff" : "rgba(255,255,255,0.35)",
              }}>{t === "market" ? "市价" : "限价"}</button>
            ))}
          </div>

          {/* 限价输入 */}
          {orderType === "limit" && (
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 10px", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginRight: 6 }}>价格</span>
              <input value={limitPrice} onChange={e => setLimitPrice(e.target.value)} placeholder={currentPrice.toFixed(2)}
                style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: 13, textAlign: "right", outline: "none" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginLeft: 4 }}>USDT</span>
            </div>
          )}

          {/* 市价提示 */}
          {orderType === "market" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 10px", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>市场最优价</span>
              <ChevronDown size={12} color="rgba(255,255,255,0.4)" />
            </div>
          )}

          {/* 交易额 */}
          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 10px", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginRight: 6 }}>交易额</span>
            <input value={amountInput} onChange={e => setAmountInput(e.target.value)} placeholder="0"
              style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: 13, textAlign: "right", outline: "none" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginLeft: 4 }}>USDT</span>
          </div>

          {/* 仓位分配滑动条（优化版） */}
          <PercentSlider
            value={sliderPct}
            onChange={pct => {
              setSliderPct(pct);
              setAmountInput(((canOpen * pct / 100) / execPrice).toFixed(4));
            }}
            color={side === "buy" ? "#26a69a" : "#ef5350"}
          />

          {/* 可用 / 可开 / 借款 */}
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 2, display: "flex", justifyContent: "space-between" }}>
            <span>可用</span><span style={{ color: "rgba(255,255,255,0.8)" }}>{balance.toFixed(2)} USDT</span>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 2, display: "flex", justifyContent: "space-between" }}>
            <span>可开</span><span style={{ color: "rgba(255,255,255,0.8)" }}>{canOpen.toFixed(2)} USDT</span>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
            <span>借款</span><span style={{ color: borrowed > 0 ? "#f59e0b" : "rgba(255,255,255,0.8)" }}>{borrowed.toFixed(2)} USDT</span>
          </div>

          {/* 杠杆买入/卖出按钮 */}
          <button onClick={handleOrder} style={{
            width: "100%", padding: "11px 0", borderRadius: 24, border: "none", cursor: "pointer",
            background: side === "buy" ? "#26a69a" : "#ef5350",
            color: "#fff", fontSize: 15, fontWeight: 700,
            boxShadow: `0 2px 14px ${side === "buy" ? "rgba(38,166,154,0.4)" : "rgba(239,83,80,0.4)"}`,
          }}>
            {side === "buy" ? "杠杆买" : "杠杆卖"}
          </button>
        </div>

        {/* 右侧：借/还 + 小时利率 + 订单簿 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {/* 借/还 + 小时利率 */}
          <div style={{ padding: "6px 6px 4px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <button onClick={() => setShowBorrow(true)} style={{
                padding: "5px 14px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                background: "#26a69a", color: "#fff",
              }}>借/还</button>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>小时利率</div>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: "#f59e0b" }}>{HOURLY_RATE.toFixed(6)}%</div>
              </div>
            </div>
          </div>
          {/* 订单簿 */}
          <div style={{ flex: 1, padding: "4px 4px" }}>
            <OrderBook asks={book.asks} bids={book.bids} mid={currentPrice} decimals={2} />
          </div>
        </div>
      </div>

      {/* ── 底部 Tab 导航 + 内容区 ── */}
      <div ref={drawerRef}>
        {/* Tab 导航栏 */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          borderTop: "2px solid rgba(255,255,255,0.1)",
          background: "rgba(8,12,22,0.98)",
          backdropFilter: "blur(8px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
            {(["positions", "orders", "assets", "history"] as const).map(t => (
              <button key={t} onClick={() => setDrawerTab(t)} style={{
                flex: 1, padding: "11px 4px", background: "none", border: "none", cursor: "pointer",
                fontSize: 12,
                color: drawerTab === t ? "#fff" : "rgba(255,255,255,0.4)",
                fontWeight: drawerTab === t ? 700 : 400,
                borderBottom: drawerTab === t ? "2px solid #f59e0b" : "2px solid transparent",
                transition: "color 0.15s",
              }}>
                {t === "positions" ? `仓位 (${positions.length})`
                  : t === "orders" ? `委托 (${limitOrders.length})`
                  : t === "history" ? "历史"
                  : "资产"}
              </button>
            ))}
            <button onClick={() => setShowTip(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", padding: "11px 6px", color: "rgba(255,255,255,0.3)" }}>
              <Info size={14} />
            </button>
          </div>
        </div>

        {/* Tab 内容区 */}
        <div style={{ background: "#0b0f1e", minHeight: 180, padding: "12px 12px 24px" }}>
          {drawerTab === "positions" && (
            positions.length === 0
              ? <EmptyHint text="暂无持仓" hint={"先点「借/还」借入 USDT，再杠杆买入 ETH\n例：本金 1000，借入 9000，共 10000 USDT 买 ETH\n价格涨 1% = 盈利 100 USDT（实际收益率 10%）"} />
              : <>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                    <button onClick={() => positions.forEach(p => closePosition(p))} style={{
                      padding: "5px 14px", borderRadius: 16, background: "rgba(239,83,80,0.15)", outline: "1px solid rgba(239,83,80,0.3)", color: "#ef5350", fontSize: 12, cursor: "pointer", border: "none",
                    }}>一键平仓</button>
                  </div>
                  {positions.map(pos => (
                    <PositionCard key={pos.id} pos={pos} currentPrice={currentPrice}
                      onClose={closePosition}
                      onReverse={reversePosition}
                      onTpSl={p => setTpSlPos(p)}
                    />
                  ))}
                </>
          )}
          {drawerTab === "orders" && (
            limitOrders.length === 0
              ? <EmptyHint text="暂无委托" hint={"切换到「限价」模式，设置目标价格后挂单\n价格到达时自动成交"} />
              : limitOrders.map(o => (
                  <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 10, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: o.side === "buy" ? "#26a69a" : "#ef5350" }}>
                        {o.side === "buy" ? "杠杆买" : "杠杆卖"} ETH/USDT
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                        限价 {o.price.toFixed(2)} · {o.amount.toFixed(4)} ETH · {o.time}
                      </div>
                    </div>
                    <button onClick={() => setLimitOrders(os => os.filter(x => x.id !== o.id))} style={{
                      padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 11,
                    }}>撤单</button>
                  </div>
                ))
          )}
          {drawerTab === "assets" && (
            <div style={{ fontSize: 13 }}>
              {[
                ["USDT 余额", `${balance.toFixed(2)} USDT`],
                ["借款", `${borrowed.toFixed(2)} USDT`, borrowed > 0 ? "#f59e0b" : undefined],
                ["浮动盈亏", `${unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)} USDT`, unrealizedPnl >= 0 ? "#26a69a" : "#ef5350"],
                ["账户净値", `${(balance + unrealizedPnl - borrowed).toFixed(2)} USDT`],
                ["小时利率", `${HOURLY_RATE.toFixed(6)}%`, "#f59e0b"],
              ].map(([k, v, c]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{k}</span>
                  <span style={{ fontFamily: "monospace", color: (c as string) || "#fff" }}>{v}</span>
                </div>
              ))}
            </div>
          )}
          {drawerTab === "history" && (
            <HistoryTab
              records={historyRecords}
              isLoading={false}
              onReset={() => setShowReset(true)}
            />
          )}
        </div>
      </div>{/* end drawerRef */}

      <Toast msg={msg} />

      {/* 重置确认弹窗 */}
      {showReset && (
        <ResetConfirmModal
          onCancel={() => setShowReset(false)}
          onConfirm={() => {
            resetHistory();
            setBalance(INITIAL_BALANCE);
            setPositions([]);
            setLimitOrders([]);
            setBorrowed(0);
            setOpenedAt({});
            setShowReset(false);
            showMsg("资金和历史记录已重置", true);
          }}
          isLoading={false}
        />
      )}

      {/* 借/还 弹窗 */}
      {showBorrow && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowBorrow(false)}>
          <div style={{ background: "#0d1120", borderRadius: "20px 20px 0 0", border: "1px solid rgba(255,255,255,0.1)", padding: 16 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>借入 / 还款</span>
              <button onClick={() => setShowBorrow(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}><X size={18} /></button>
            </div>
            {[
              ["最大可借", `${(maxBorrow - borrowed).toFixed(2)} USDT`],
              ["当前借款", `${borrowed.toFixed(2)} USDT`, borrowed > 0 ? "#f59e0b" : undefined],
              ["小时利率", `${HOURLY_RATE.toFixed(6)}%`, "#f59e0b"],
            ].map(([k, v, c]) => (
              <div key={k} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
                <span>{k}</span><span style={{ color: (c as string) || "#fff" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
              <input value={borrowAmount} onChange={e => setBorrowAmount(e.target.value)} placeholder="输入借款金额"
                style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: 14, outline: "none" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>USDT</span>
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 10, lineHeight: 1.5 }}>
              💡 借入资金后可增加买入量，放大收益。每小时支付利息，记得及时还款。
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleBorrow} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer", background: "#26a69a", color: "#fff", fontSize: 14, fontWeight: 700 }}>借入</button>
              <button onClick={handleRepay} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", cursor: "pointer", background: borrowed > 0 ? "#ef5350" : "rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, fontWeight: 700 }}>还款</button>
            </div>
          </div>
        </div>
      )}

      {/* 止盈止损弹窗 */}
      {tpSlPos && (
        <TpSlModal
          pos={tpSlPos}
          currentPrice={currentPrice}
          onClose={() => setTpSlPos(null)}
          onConfirm={update => updateTpSl(tpSlPos.id, update)}
        />
      )}

      {/* 教学提示 */}
      {showTip && (
        <div style={{
          position: "fixed", bottom: 60, right: 12, zIndex: 30, width: 260,
          background: "rgba(13,17,32,0.96)", border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: 16, padding: 14, fontSize: 12, color: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)", boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 700, color: "#60a5fa" }}>💡 杠杆交易要点</span>
            <button onClick={() => setShowTip(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}><X size={14} /></button>
          </div>
          <p style={{ marginBottom: 6 }}><strong style={{ color: "#fff" }}>借入资金</strong>：先借入 USDT，再用于买入 ETH，放大仓位</p>
          <p style={{ marginBottom: 6 }}><strong style={{ color: "#fff" }}>小时利率</strong>：每小时支付借款利息，持仓越久成本越高</p>
          <p style={{ marginBottom: 6 }}><strong style={{ color: "#fff" }}>逐仓模式</strong>：亏损只影响该仓位的保证金，不影响账户其他资金</p>
          <p><strong style={{ color: "#fff" }}>止盈止损</strong>：开仓后点仓位卡片上的「止盈/止损」按钮设置</p>
        </div>
      )}
    </div>
  );
}
