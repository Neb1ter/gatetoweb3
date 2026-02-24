import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, Clock, Zap, TrendingUp, TrendingDown, CheckCircle2, Timer, AlertCircle, RefreshCw } from "lucide-react";

// ─── 代币化资产配置 ────────────────────────────────────────────────────────────
const ASSETS = [
  {
    symbol: "TSLA",
    name: "特斯拉股票代币",
    icon: "🚗",
    basePrice: 248.5,
    volatility: 0.018,
    color: "text-red-400",
    border: "border-red-500/40",
    bg: "bg-red-500/10",
    category: "股票",
    tradfiHours: "美股 周一至周五 09:30–16:00 EST",
  },
  {
    symbol: "AAPL",
    name: "苹果股票代币",
    icon: "🍎",
    basePrice: 189.3,
    volatility: 0.012,
    color: "text-gray-300",
    border: "border-gray-500/40",
    bg: "bg-gray-500/10",
    category: "股票",
    tradfiHours: "美股 周一至周五 09:30–16:00 EST",
  },
  {
    symbol: "XAUUSDT",
    name: "黄金代币",
    icon: "🥇",
    basePrice: 2340.0,
    volatility: 0.006,
    color: "text-yellow-400",
    border: "border-yellow-500/40",
    bg: "bg-yellow-500/10",
    category: "商品",
    tradfiHours: "期货 周一至周五 有交易时段限制",
  },
  {
    symbol: "USOIL",
    name: "原油代币",
    icon: "🛢️",
    basePrice: 78.4,
    volatility: 0.022,
    color: "text-orange-400",
    border: "border-orange-500/40",
    bg: "bg-orange-500/10",
    category: "商品",
    tradfiHours: "期货 周一至周五 有交易时段限制",
  },
];

type Asset = (typeof ASSETS)[number];

interface SettlementRecord {
  id: number;
  type: "buy" | "sell";
  symbol: string;
  qty: number;
  price: number;
  total: number;
  mode: "crypto" | "tradfi";
  status: "pending" | "settled";
  createdAt: number;
}

interface Position {
  symbol: string;
  qty: number;
  avgPrice: number;
}

// ─── 实时价格引擎 ─────────────────────────────────────────────────────────────
function usePrices() {
  const [prices, setPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(ASSETS.map((a) => [a.symbol, a.basePrice]))
  );
  const [ticks, setTicks] = useState<Record<string, number>>(() =>
    Object.fromEntries(ASSETS.map((a) => [a.symbol, 0]))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        const nextTicks: Record<string, number> = {};
        ASSETS.forEach((a) => {
          const delta = (Math.random() - 0.49) * a.basePrice * a.volatility;
          next[a.symbol] = Math.max(next[a.symbol] + delta, a.basePrice * 0.5);
          nextTicks[a.symbol] = delta;
        });
        setTicks(nextTicks);
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return { prices, ticks };
}

// ─── 结算倒计时组件 ───────────────────────────────────────────────────────────
function SettlementTimer({
  record,
  onSettle,
}: {
  record: SettlementRecord;
  onSettle: (id: number) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  // 币圈：2秒结算；TradFi：模拟T+2（用12秒演示，实际是48小时）
  const threshold = record.mode === "crypto" ? 2000 : 12000;

  useEffect(() => {
    if (record.status === "settled") return;
    const start = Date.now();
    const interval = setInterval(() => {
      const e = Date.now() - start;
      setElapsed(e);
      if (e >= threshold) {
        onSettle(record.id);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [record.id, record.mode, record.status, threshold, onSettle]);

  if (record.status === "settled") {
    return (
      <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
        <CheckCircle2 className="w-3 h-3" />
        已结算
      </span>
    );
  }

  const pct = Math.min((elapsed / threshold) * 100, 100);
  const remaining = Math.max(0, Math.ceil((threshold - elapsed) / 1000));

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${record.mode === "crypto" ? "bg-emerald-400" : "bg-orange-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-xs font-mono ${record.mode === "crypto" ? "text-emerald-400" : "text-orange-400"}`}
      >
        {remaining}s
      </span>
    </div>
  );
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function TradFiSim() {
  const { prices, ticks } = usePrices();
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [orders, setOrders] = useState<SettlementRecord[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[0]);
  const [qty, setQty] = useState("1");
  const [tradeMode, setTradeMode] = useState<"crypto" | "tradfi">("crypto");
  const [tab, setTab] = useState<"trade" | "orders" | "compare">("trade");
  const [flash, setFlash] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const orderIdRef = useRef(0);

  const showFlash = (msg: string, type: "success" | "error") => {
    setFlash({ msg, type });
    setTimeout(() => setFlash(null), 2500);
  };

  const handleSettle = useCallback((id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "settled" } : o))
    );
  }, []);

  const handleBuy = () => {
    const q = parseFloat(qty);
    if (!q || q <= 0) return showFlash("请输入有效数量", "error");
    const price = prices[selectedAsset.symbol];
    const total = price * q;
    if (total > balance) return showFlash("余额不足", "error");

    setBalance((b) => b - total);
    setPositions((prev) => {
      const pos = prev[selectedAsset.symbol];
      if (pos) {
        const newQty = pos.qty + q;
        const newAvg = (pos.avgPrice * pos.qty + price * q) / newQty;
        return {
          ...prev,
          [selectedAsset.symbol]: {
            symbol: selectedAsset.symbol,
            qty: newQty,
            avgPrice: newAvg,
          },
        };
      }
      return {
        ...prev,
        [selectedAsset.symbol]: {
          symbol: selectedAsset.symbol,
          qty: q,
          avgPrice: price,
        },
      };
    });

    const record: SettlementRecord = {
      id: ++orderIdRef.current,
      type: "buy",
      symbol: selectedAsset.symbol,
      qty: q,
      price,
      total,
      mode: tradeMode,
      status: "pending",
      createdAt: Date.now(),
    };
    setOrders((prev) => [record, ...prev]);
    showFlash(
      `✅ 买入 ${q} ${selectedAsset.symbol} @ $${price.toFixed(2)}${tradeMode === "crypto" ? " · 约2秒结算" : " · T+2 延迟结算（模拟12秒）"}`,
      "success"
    );
  };

  const handleSell = () => {
    const q = parseFloat(qty);
    if (!q || q <= 0) return showFlash("请输入有效数量", "error");
    const pos = positions[selectedAsset.symbol];
    if (!pos || pos.qty < q) return showFlash("持仓不足", "error");
    const price = prices[selectedAsset.symbol];
    const total = price * q;

    setBalance((b) => b + total);
    setPositions((prev) => {
      const remaining = pos.qty - q;
      if (remaining <= 0.0001) {
        const next = { ...prev };
        delete next[selectedAsset.symbol];
        return next;
      }
      return { ...prev, [selectedAsset.symbol]: { ...pos, qty: remaining } };
    });

    const record: SettlementRecord = {
      id: ++orderIdRef.current,
      type: "sell",
      symbol: selectedAsset.symbol,
      qty: q,
      price,
      total,
      mode: tradeMode,
      status: "pending",
      createdAt: Date.now(),
    };
    setOrders((prev) => [record, ...prev]);
    showFlash(
      `✅ 卖出 ${q} ${selectedAsset.symbol} @ $${price.toFixed(2)}${tradeMode === "crypto" ? " · 约2秒结算" : " · T+2 延迟结算（模拟12秒）"}`,
      "success"
    );
  };

  const handleReset = () => {
    setBalance(10000);
    setPositions({});
    setOrders([]);
    setQty("1");
  };

  const totalPnl = Object.values(positions).reduce((acc, pos) => {
    return acc + (prices[pos.symbol] - pos.avgPrice) * pos.qty;
  }, 0);

  const portfolioValue = Object.values(positions).reduce(
    (acc, pos) => acc + prices[pos.symbol] * pos.qty,
    0
  );

  return (
    <div className="min-h-screen bg-[#0A192F] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A192F]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/exchange-guide">
            <button className="flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">返回 TradFi 教程</span>
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg">🏦</span>
            <span className="font-black text-sm sm:text-base">代币化资产实时交易模拟器</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">总资产</div>
              <div className="font-black text-yellow-400 text-sm">
                ${(balance + portfolioValue).toFixed(2)}
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">重置</span>
            </button>
          </div>
        </div>
      </header>

      {/* Flash */}
      {flash && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl ${flash.type === "success" ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}
        >
          {flash.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 核心概念横幅 */}
        <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-black text-sm">
                  币圈 TradFi 的核心优势
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                中心化交易所（CEX）将股票、黄金、原油等传统资产
                <strong className="text-white">代币化</strong>
                ，让你可以
                <strong className="text-yellow-300"> 7×24小时实时交易</strong>
                ，资金
                <strong className="text-emerald-300"> 即时到账（T+0）</strong>
                ——传统证券交易所有交易时段限制，且结算需要
                <strong className="text-orange-300"> T+2 两个工作日</strong>。
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="text-center px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                <div className="text-emerald-400 font-black text-xl">T+0</div>
                <div className="text-xs text-slate-400">币圈结算</div>
              </div>
              <div className="text-center px-3 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30">
                <div className="text-orange-400 font-black text-xl">T+2</div>
                <div className="text-xs text-slate-400">传统结算</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-6 w-fit">
          {(["trade", "orders", "compare"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === t ? "bg-yellow-500 text-black" : "text-slate-400 hover:text-white"}`}
            >
              {t === "trade"
                ? "🏦 实时交易"
                : t === "orders"
                  ? "📋 结算记录"
                  : "⚡ 效率对比"}
            </button>
          ))}
        </div>

        {/* ── 实时交易 TAB ── */}
        {tab === "trade" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 资产列表 */}
            <div className="lg:col-span-1 space-y-3">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                代币化资产（实时报价）
              </h2>
              {ASSETS.map((asset) => {
                const price = prices[asset.symbol];
                const tick = ticks[asset.symbol];
                const isUp = tick >= 0;
                return (
                  <button
                    key={asset.symbol}
                    onClick={() => setSelectedAsset(asset)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedAsset.symbol === asset.symbol ? `${asset.border} ${asset.bg}` : "border-white/10 hover:border-white/20 bg-white/3"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{asset.icon}</span>
                        <div>
                          <div className="font-black text-white text-sm">
                            {asset.symbol}
                          </div>
                          <div className="text-xs text-slate-400">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-white text-sm">
                          ${price.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs font-bold flex items-center gap-0.5 justify-end ${isUp ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {isUp ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {isUp ? "+" : ""}
                          {tick.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-slate-400">
                        {asset.category}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                        实时报价
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">
                        7×24H
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 交易面板 */}
            <div className="lg:col-span-2 space-y-4">
              {/* 当前资产价格 */}
              <div
                className={`rounded-2xl border ${selectedAsset.border} ${selectedAsset.bg} p-5`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedAsset.icon}</span>
                    <div>
                      <h2 className="text-xl font-black text-white">
                        {selectedAsset.symbol}
                      </h2>
                      <p className="text-xs text-slate-400">
                        {selectedAsset.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-3xl font-black ${selectedAsset.color}`}
                    >
                      ${prices[selectedAsset.symbol].toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-emerald-400 font-bold">
                        实时报价 · 随时可交易
                      </span>
                    </div>
                  </div>
                </div>
                {/* 传统市场对比提示 */}
                <div className="text-xs text-slate-500 bg-white/5 rounded-lg px-3 py-2 flex items-start gap-1.5">
                  <Clock className="w-3 h-3 mt-0.5 shrink-0 text-orange-400" />
                  <span>
                    <span className="text-orange-400">传统市场：</span>
                    {selectedAsset.tradfiHours}，休市期间无法交易
                    <span className="text-blue-400 ml-1">
                      → 币圈代币化版本 7×24H 不间断
                    </span>
                  </span>
                </div>
              </div>

              {/* 结算模式选择 */}
              <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                <h3 className="text-sm font-black text-white mb-3">
                  选择结算模式（体验差异）
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setTradeMode("crypto")}
                    className={`p-4 rounded-xl border transition-all text-left ${tradeMode === "crypto" ? "border-emerald-500/60 bg-emerald-500/15" : "border-white/10 hover:border-white/20"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span className="font-black text-emerald-400 text-sm">
                        币圈 CEX
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white">T+0</div>
                    <div className="text-xs text-slate-400 mt-1">
                      约 2 秒即时结算
                    </div>
                    <div className="text-xs text-emerald-400 mt-1">
                      ✓ 资金立即可用
                    </div>
                  </button>
                  <button
                    onClick={() => setTradeMode("tradfi")}
                    className={`p-4 rounded-xl border transition-all text-left ${tradeMode === "tradfi" ? "border-orange-500/60 bg-orange-500/15" : "border-white/10 hover:border-white/20"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span className="font-black text-orange-400 text-sm">
                        传统券商
                      </span>
                    </div>
                    <div className="text-2xl font-black text-white">T+2</div>
                    <div className="text-xs text-slate-400 mt-1">
                      需等待 2 个工作日
                    </div>
                    <div className="text-xs text-orange-400 mt-1">
                      ⚠ 资金 48 小时后到账
                    </div>
                  </button>
                </div>

                {/* 数量输入 & 下单 */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">
                      数量
                    </label>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      min="0.01"
                      step="0.01"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-yellow-500/50"
                      placeholder="输入数量"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {["0.1", "0.5", "1", "5"].map((v) => (
                      <button
                        key={v}
                        onClick={() => setQty(v)}
                        className="py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-all border border-white/10"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-slate-400 bg-white/5 rounded-lg px-3 py-2">
                    预计金额：
                    <span className="text-white font-bold">
                      $
                      {(
                        prices[selectedAsset.symbol] * (parseFloat(qty) || 0)
                      ).toFixed(2)}
                    </span>
                    {tradeMode === "crypto" ? (
                      <span className="text-emerald-400 ml-2">
                        → 约 2 秒后结算完成
                      </span>
                    ) : (
                      <span className="text-orange-400 ml-2">
                        → 模拟 T+2（12秒后结算）
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleBuy}
                      className="py-3.5 rounded-xl font-black text-base bg-emerald-500 hover:bg-emerald-400 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      买入
                    </button>
                    <button
                      onClick={handleSell}
                      className="py-3.5 rounded-xl font-black text-base bg-red-500 hover:bg-red-400 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      卖出
                    </button>
                  </div>
                </div>
              </div>

              {/* 当前持仓 */}
              {Object.values(positions).length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black text-white">当前持仓</h3>
                    <span
                      className={`text-sm font-black ${totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      总浮盈：{totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {Object.values(positions).map((pos) => {
                      const asset = ASSETS.find(
                        (a) => a.symbol === pos.symbol
                      )!;
                      const currentPrice = prices[pos.symbol];
                      const pnl = (currentPrice - pos.avgPrice) * pos.qty;
                      return (
                        <div
                          key={pos.symbol}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                        >
                          <div className="flex items-center gap-2">
                            <span>{asset?.icon}</span>
                            <div>
                              <div className="font-bold text-white text-sm">
                                {pos.symbol}
                              </div>
                              <div className="text-xs text-slate-400">
                                持仓 {pos.qty.toFixed(2)} · 均价 $
                                {pos.avgPrice.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-white">
                              ${(currentPrice * pos.qty).toFixed(2)}
                            </div>
                            <div
                              className={`text-xs font-bold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 结算记录 TAB ── */}
        {tab === "orders" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
              <h2 className="text-base font-black text-white mb-1">
                结算记录
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                观察币圈 T+0（约2秒）与传统 T+2（模拟12秒）的结算速度差异——下单后切换到此页面观察进度条
              </p>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Timer className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">
                    暂无订单，去「实时交易」下单后来这里对比结算速度
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const asset = ASSETS.find((a) => a.symbol === order.symbol);
                    return (
                      <div
                        key={order.id}
                        className={`p-4 rounded-xl border transition-all ${order.mode === "crypto" ? "border-emerald-500/20 bg-emerald-500/5" : "border-orange-500/20 bg-orange-500/5"}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-xl">{asset?.icon}</span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-xs font-black px-2 py-0.5 rounded-full ${order.type === "buy" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
                                >
                                  {order.type === "buy" ? "买入" : "卖出"}
                                </span>
                                <span className="font-bold text-white text-sm">
                                  {order.qty} {order.symbol}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${order.mode === "crypto" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"}`}
                                >
                                  {order.mode === "crypto"
                                    ? "⚡ T+0"
                                    : "🕐 T+2"}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                @ ${order.price.toFixed(2)} · 合计 $
                                {order.total.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <SettlementTimer
                            record={order}
                            onSettle={handleSettle}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 效率对比 TAB ── */}
        {tab === "compare" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/3 p-6">
              <h2 className="text-lg font-black text-white mb-1">
                币圈 TradFi vs 传统金融：核心差异
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                同样是交易苹果股票，两种方式的体验天壤之别
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 币圈 CEX */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <span className="font-black text-emerald-400">
                      币圈中心化交易所（CEX）
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        label: "交易时间",
                        value: "7×24H 全年无休",
                        good: true,
                      },
                      {
                        label: "结算速度",
                        value: "T+0（约2秒）",
                        good: true,
                      },
                      { label: "资金到账", value: "卖出即可用", good: true },
                      {
                        label: "最小单位",
                        value: "支持小数点交易",
                        good: true,
                      },
                      {
                        label: "开户门槛",
                        value: "KYC 即可，无需券商",
                        good: true,
                      },
                      {
                        label: "资产类型",
                        value: "代币化股票/黄金/原油",
                        good: true,
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 传统金融 */}
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <span className="font-black text-orange-400">
                      传统证券交易所
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        label: "交易时间",
                        value: "仅工作日特定时段",
                        good: false,
                      },
                      {
                        label: "结算速度",
                        value: "T+2（2个工作日）",
                        good: false,
                      },
                      {
                        label: "资金到账",
                        value: "卖出后 48 小时",
                        good: false,
                      },
                      {
                        label: "最小单位",
                        value: "通常 1 股起",
                        good: false,
                      },
                      {
                        label: "开户门槛",
                        value: "需开证券账户",
                        good: false,
                      },
                      {
                        label: "资产类型",
                        value: "真实股票（有托管）",
                        good: false,
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-orange-300 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 结算时间线可视化 */}
              <div className="mt-6 rounded-xl border border-white/10 bg-white/3 p-5">
                <h3 className="text-sm font-black text-white mb-4">
                  结算时间线对比
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        币圈 CEX（T+0）
                      </span>
                      <span className="text-xs text-emerald-400 font-mono">
                        ~2 秒
                      </span>
                    </div>
                    <div className="h-8 bg-white/5 rounded-lg overflow-hidden relative flex items-center">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-lg flex items-center justify-center"
                        style={{ width: "4%" }}
                      />
                      <span className="absolute left-3 text-xs text-white font-bold">
                        下单 → 即时结算完成 ✓
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        传统券商（T+2）
                      </span>
                      <span className="text-xs text-orange-400 font-mono">
                        48 小时
                      </span>
                    </div>
                    <div className="h-8 bg-white/5 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500/60 to-orange-400/30 rounded-lg"
                        style={{ width: "100%" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-3">
                        <span className="text-xs text-white font-bold">
                          下单
                        </span>
                        <span className="text-xs text-white/50">T+1</span>
                        <span className="text-xs text-white font-bold">
                          T+2 结算完成
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  * T+2 意味着：卖出后需等待 2 个工作日资金才能提取或再次使用。遇到周末或节假日则更长。
                </p>
              </div>
            </div>

            {/* 核心洞察 */}
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-5">
              <h3 className="text-sm font-black text-yellow-400 mb-3">
                💡 为什么即时结算很重要？
              </h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>
                  •{" "}
                  <strong className="text-white">资金效率</strong>
                  ：T+0 意味着你可以当天卖出、当天再买入其他资产，资金利用率大幅提升
                </p>
                <p>
                  •{" "}
                  <strong className="text-white">风险管理</strong>
                  ：市场突发事件时，币圈可以周末或深夜立即止损，传统市场只能等到下一个交易日
                </p>
                <p>
                  •{" "}
                  <strong className="text-white">全球化</strong>
                  ：无论你在哪个时区，都可以参与全球资产交易，不受地域和时段限制
                </p>
                <p>
                  •{" "}
                  <strong className="text-white">碎片化投资</strong>
                  ：0.01 股苹果也能买，大幅降低了普通投资者的参与门槛
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
