import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, RefreshCw, Info, TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react";

// 资产配置
const ASSETS = [
  { id: "btc", name: "比特币 BTC", type: "crypto", startPrice: 65000, vol: 0.025, color: "#F7931A", icon: "₿" },
  { id: "eth", name: "以太坊 ETH", type: "crypto", startPrice: 3200, vol: 0.028, color: "#627EEA", icon: "Ξ" },
  { id: "sp500", name: "标普500 ETF", type: "stock", startPrice: 5200, vol: 0.008, color: "#4CAF50", icon: "📊" },
  { id: "gold", name: "黄金 XAUUSD", type: "commodity", startPrice: 2350, vol: 0.005, color: "#FFD700", icon: "🥇" },
  { id: "bond", name: "美国国债 10Y", type: "bond", startPrice: 98.5, vol: 0.002, color: "#90CAF9", icon: "📜" },
  { id: "tsla", name: "特斯拉 TSLA", type: "stock", startPrice: 185, vol: 0.022, color: "#CC0000", icon: "🚗" },
];

const TYPE_LABELS: Record<string, { zh: string; color: string }> = {
  crypto: { zh: "加密货币", color: "text-orange-400" },
  stock: { zh: "股票", color: "text-green-400" },
  commodity: { zh: "大宗商品", color: "text-yellow-400" },
  bond: { zh: "债券", color: "text-blue-400" },
};

function generatePrice(prev: number, vol: number) {
  return Math.max(prev * (1 + (Math.random() - 0.49) * vol), 0.01);
}

// 迷你折线图
function MiniChart({ prices, color }: { prices: number[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prices.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = 80, h = 32;
    canvas.width = w * 2; canvas.height = h * 2;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    ctx.scale(2, 2);
    ctx.clearRect(0, 0, w, h);
    const min = Math.min(...prices), max = Math.max(...prices);
    const range = max - min || 1;
    const toX = (i: number) => (i / (prices.length - 1)) * w;
    const toY = (p: number) => h - ((p - min) / range) * (h - 4) - 2;
    ctx.beginPath();
    prices.forEach((p, i) => i === 0 ? ctx.moveTo(toX(i), toY(p)) : ctx.lineTo(toX(i), toY(p)));
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [prices, color]);
  return <canvas ref={canvasRef} />;
}

interface Holding {
  assetId: string;
  buyPrice: number;
  shares: number;
  time: string;
}

interface Trade {
  assetId: string;
  assetName: string;
  type: "buy" | "sell";
  price: number;
  shares: number;
  pnl?: number;
  time: string;
}

const INITIAL_BALANCE = 50000;

export default function TradFiSim() {
  const [prices, setPrices] = useState<Record<string, number>>(() =>
    Object.fromEntries(ASSETS.map(a => [a.id, a.startPrice]))
  );
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(ASSETS.map(a => [a.id, [a.startPrice]]))
  );
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [holdings, setHoldings] = useState<Record<string, Holding>>({});
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedAsset, setSelectedAsset] = useState("btc");
  const [sharesInput, setSharesInput] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0); // 模拟天数

  const showMsg = (text: string, ok: boolean) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 2500);
  };

  const tick = useCallback(() => {
    setPrices(prev => {
      const next = { ...prev };
      ASSETS.forEach(a => { next[a.id] = generatePrice(prev[a.id], a.vol); });
      setPriceHistory(h => {
        const nh = { ...h };
        ASSETS.forEach(a => { nh[a.id] = [...(h[a.id] || []).slice(-39), next[a.id]]; });
        return nh;
      });
      return next;
    });
    setElapsed(d => d + 1);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(tick, speed === 1 ? 1500 : 500);
    return () => clearInterval(id);
  }, [tick, speed, paused]);

  const asset = ASSETS.find(a => a.id === selectedAsset)!;
  const currentPrice = prices[selectedAsset];
  const sharesNum = parseFloat(sharesInput) || 0;
  const totalCost = currentPrice * sharesNum;
  const holding = holdings[selectedAsset];

  const handleBuy = () => {
    if (sharesNum <= 0) return showMsg("请输入购买数量", false);
    if (totalCost > balance) return showMsg("余额不足！", false);
    const fee = asset.type === "crypto" ? totalCost * 0.001 : totalCost * 0.003; // 股票手续费更高
    const waitTime = asset.type === "stock" ? "（股票T+1交割）" : "（即时到账）";
    setBalance(b => b - totalCost - fee);
    setHoldings(h => ({
      ...h,
      [selectedAsset]: h[selectedAsset]
        ? { ...h[selectedAsset], shares: h[selectedAsset].shares + sharesNum }
        : { assetId: selectedAsset, buyPrice: currentPrice, shares: sharesNum, time: new Date().toLocaleTimeString() },
    }));
    setTrades(t => [{
      assetId: selectedAsset, assetName: asset.name, type: "buy" as const,
      price: currentPrice, shares: sharesNum, time: new Date().toLocaleTimeString(),
    }, ...t].slice(0, 15));
    showMsg(`✅ 买入 ${sharesNum} ${asset.name} @ $${currentPrice.toFixed(2)}，手续费 $${fee.toFixed(2)} ${waitTime}`, true);
    setSharesInput("");
  };

  const handleSell = () => {
    if (!holding || sharesNum <= 0) return showMsg("无持仓或数量有误", false);
    if (sharesNum > holding.shares) return showMsg(`持仓不足，当前持有 ${holding.shares}`, false);
    const proceeds = currentPrice * sharesNum;
    const fee = asset.type === "crypto" ? proceeds * 0.001 : proceeds * 0.003;
    const pnl = (currentPrice - holding.buyPrice) * sharesNum - fee;
    setBalance(b => b + proceeds - fee);
    setHoldings(h => {
      const nh = { ...h };
      const remaining = h[selectedAsset].shares - sharesNum;
      if (remaining <= 0) delete nh[selectedAsset];
      else nh[selectedAsset] = { ...h[selectedAsset], shares: remaining };
      return nh;
    });
    setTrades(t => [{
      assetId: selectedAsset, assetName: asset.name, type: "sell" as const,
      price: currentPrice, shares: sharesNum, pnl, time: new Date().toLocaleTimeString(),
    }, ...t].slice(0, 15));
    showMsg(`${pnl >= 0 ? "🎉" : "📉"} 卖出成功，盈亏 ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`, pnl >= 0);
    setSharesInput("");
  };

  // 总资产
  const portfolioValue = Object.entries(holdings).reduce((sum, [id, h]) => {
    return sum + prices[id] * h.shares;
  }, 0);
  const totalAssets = balance + portfolioValue;
  const totalReturn = ((totalAssets - INITIAL_BALANCE) / INITIAL_BALANCE * 100);

  return (
    <div className="min-h-screen bg-[#0A192F] text-white">
      <div className="sticky top-0 z-30 bg-[#0A192F]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/exchange-guide/tradfi">
            <button className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" /> 返回TradFi教程
            </button>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-green-400 font-bold text-sm">🏦 传统金融 vs 加密货币 模拟器</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPaused(p => !p)} className={`px-3 py-1 rounded-lg text-xs font-bold ${paused ? "bg-green-500 text-black" : "bg-slate-700 text-white"}`}>
            {paused ? "▶ 继续" : "⏸ 暂停"}
          </button>
          <button onClick={() => setSpeed(s => s === 1 ? 2 : 1)} className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-700 text-white">
            {speed === 1 ? "🐢 慢速" : "🐇 快速"}
          </button>
          <button onClick={() => {
            setPrices(Object.fromEntries(ASSETS.map(a => [a.id, a.startPrice])));
            setPriceHistory(Object.fromEntries(ASSETS.map(a => [a.id, [a.startPrice]])));
            setBalance(INITIAL_BALANCE); setHoldings({}); setTrades([]); setElapsed(0);
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

        {/* 账户总览 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "总资产", value: `$${totalAssets.toFixed(2)}`, color: "text-yellow-400" },
            { label: "可用现金", value: `$${balance.toFixed(2)}`, color: "text-white" },
            { label: "持仓市值", value: `$${portfolioValue.toFixed(2)}`, color: "text-blue-400" },
            { label: "总收益率", value: `${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)}%`, color: totalReturn >= 0 ? "text-green-400" : "text-red-400" },
          ].map(item => (
            <div key={item.label} className="bg-[#0D2137] rounded-xl border border-white/10 p-3 text-center">
              <div className="text-slate-400 text-xs mb-1">{item.label}</div>
              <div className={`font-black text-lg ${item.color}`}>{item.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 资产列表 */}
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-sm font-bold text-slate-300 mb-2">选择资产（点击切换）</h3>
            {ASSETS.map(a => {
              const p = prices[a.id];
              const hist = priceHistory[a.id];
              const change = hist.length >= 2 ? ((p - hist[0]) / hist[0] * 100) : 0;
              const h = holdings[a.id];
              const isSelected = selectedAsset === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedAsset(a.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected ? "border-yellow-500/50 bg-yellow-500/5" : "border-white/10 bg-[#0D2137] hover:border-white/20"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: a.color + "20" }}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm truncate">{a.name}</span>
                      <span className={`text-xs ${TYPE_LABELS[a.type].color}`}>{TYPE_LABELS[a.type].zh}</span>
                    </div>
                    {h && (
                      <div className="text-xs text-slate-400">
                        持有 {h.shares} 份 · 成本 ${h.buyPrice.toFixed(2)} · 
                        <span className={(p - h.buyPrice) >= 0 ? "text-green-400" : "text-red-400"}>
                          {" "}{(p - h.buyPrice) >= 0 ? "+" : ""}${((p - h.buyPrice) * h.shares).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-sm">${p.toFixed(a.id === "bond" ? 2 : 0)}</div>
                    <div className={`text-xs font-bold ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                    </div>
                  </div>
                  <MiniChart prices={hist} color={change >= 0 ? "#26a69a" : "#ef5350"} />
                </div>
              );
            })}

            {/* 对比说明 */}
            <div className="mt-3 bg-[#0D2137] rounded-xl border border-white/10 p-4">
              <h4 className="text-sm font-bold text-slate-300 mb-3">📊 不同资产类别对比</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { type: "加密货币", vol: "极高 (20-100%/年)", hours: "24/7", fee: "0.1%", settle: "即时" },
                  { type: "股票", vol: "中等 (10-30%/年)", hours: "工作日 9:30-16:00", fee: "0.1-0.5%", settle: "T+2" },
                  { type: "大宗商品", vol: "低-中 (5-20%/年)", hours: "工作日", fee: "0.2-0.5%", settle: "T+2" },
                  { type: "债券", vol: "极低 (1-5%/年)", hours: "工作日", fee: "0.05-0.2%", settle: "T+1" },
                ].map(r => (
                  <div key={r.type} className="bg-white/5 rounded-lg p-2">
                    <div className="font-bold text-white mb-1">{r.type}</div>
                    <div className="text-slate-400">波动率: {r.vol}</div>
                    <div className="text-slate-400">交易时间: {r.hours}</div>
                    <div className="text-slate-400">手续费: {r.fee}</div>
                    <div className="text-slate-400">结算: {r.settle}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 交易面板 */}
          <div className="space-y-4">
            <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{asset.icon}</span>
                <div>
                  <div className="text-white font-bold text-sm">{asset.name}</div>
                  <div className={`text-xs ${TYPE_LABELS[asset.type].color}`}>{TYPE_LABELS[asset.type].zh}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-white font-black">${currentPrice.toFixed(2)}</div>
                  {asset.type === "stock" && (
                    <div className="text-xs text-orange-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> T+1交割
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs text-slate-400 mb-1 block">数量（份/枚）</label>
                <input
                  type="number"
                  value={sharesInput}
                  onChange={e => setSharesInput(e.target.value)}
                  placeholder={asset.type === "crypto" ? "0.01" : "1"}
                  step={asset.type === "crypto" ? "0.01" : "1"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                />
              </div>

              <div className="bg-white/5 rounded-xl p-3 mb-4 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>预计金额</span>
                  <span className="text-white">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>手续费</span>
                  <span className="text-white">${(totalCost * (asset.type === "crypto" ? 0.001 : 0.003)).toFixed(2)}</span>
                </div>
                {asset.type === "stock" && (
                  <div className="flex justify-between text-orange-400">
                    <span>交割时间</span>
                    <span>T+1 工作日</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleBuy} className="py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-black text-sm">买入</button>
                <button onClick={handleSell} className="py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-black text-sm">卖出</button>
              </div>
            </div>

            {/* 交易记录 */}
            <div className="bg-[#0D2137] rounded-2xl border border-white/10 p-4">
              <h3 className="text-sm font-bold text-slate-300 mb-3">交易记录</h3>
              {trades.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-3">暂无记录</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {trades.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-xs border-b border-white/5 pb-1.5">
                      <div>
                        <span className={`font-bold ${t.type === "buy" ? "text-green-400" : "text-red-400"}`}>
                          {t.type === "buy" ? "买" : "卖"}
                        </span>
                        <span className="text-slate-400 ml-1">{t.assetName.split(" ")[1]}</span>
                      </div>
                      <span className="text-slate-400">${t.price.toFixed(0)}</span>
                      {t.pnl !== undefined && (
                        <span className={`font-bold ${t.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm text-slate-300 space-y-1">
              <p className="font-bold text-blue-400">🏦 TradFi vs 加密货币的核心差异</p>
              <p>• <strong>波动性</strong>：加密货币日波动可达10%+，股票通常1-3%，债券更低</p>
              <p>• <strong>交易时间</strong>：加密货币全年无休24/7，股票只在工作日开市</p>
              <p>• <strong>结算周期</strong>：加密货币即时到账，股票T+2结算（买了不能立即卖）</p>
              <p>• <strong>监管保护</strong>：股票受证监会监管，加密货币监管相对宽松</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
