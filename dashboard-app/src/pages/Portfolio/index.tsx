import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { Skel } from "../../components/ui/Skeleton";
import { fmt, pctColor } from "../../utils/dashFormat";
import { STOCK_META } from "../../constants/stocks";
import type { StockQuote, CryptoAsset } from "../../types/dashboard.types";

interface PortfolioProps {
  stocks: StockQuote[];
  cryptos: CryptoAsset[];
}

export default function Portfolio({ stocks, cryptos }: PortfolioProps) {
  const [holdings,  setHoldings]  = useState<Record<string, number>>({ AAPL: 10, BTC: 0.5, NVDA: 5 });
  const [newSymbol, setNewSymbol] = useState("");
  const [newQty,    setNewQty]    = useState("");

  const findPrice = (sym: string) => {
    const s = stocks.find(a => a.symbol === sym);
    if (s) return { price: s.price, pct: s.pct, change: s.change, name: STOCK_META[sym] ?? sym };
    const c = cryptos.find(a => a.symbol === sym);
    if (c) return { price: c.price, pct: c.pct, change: c.change, name: c.name };
    return null;
  };

  const portfolioItems = Object.entries(holdings)
    .map(([sym, qty]) => {
      const asset = findPrice(sym);
      if (!asset) return null;
      const value  = asset.price * qty;
      const cost   = asset.price * qty * (1 - asset.pct / 100 * 5);
      const pnl    = value - cost;
      const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
      return { sym, qty, asset, value, pnl, pnlPct };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const totalValue = portfolioItems.reduce((s, i) => s + i.value, 0);
  const totalPnL   = portfolioItems.reduce((s, i) => s + i.pnl, 0);

  const addHolding = () => {
    const sym = newSymbol.toUpperCase().trim();
    const qty = parseFloat(newQty);
    if (sym && qty > 0 && findPrice(sym)) {
      setHoldings(h => ({ ...h, [sym]: qty }));
      setNewSymbol("");
      setNewQty("");
    }
  };

  const availableSymbols = [...stocks.map(s => s.symbol), ...cryptos.map(c => c.symbol)];
  const barData = portfolioItems.map(i => ({ name: i.sym, value: Math.round(i.value) }));

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#f0f4ff", margin: 0 }}>Portfolio</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>Simulated holdings · Live P&L</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        <KpiCard label="Total Value" value={fmt(totalValue)}                                             sub="Across all holdings"   color="#22d3a5" />
        <KpiCard label="Total P&L"   value={`${totalPnL >= 0 ? "+" : ""}${fmt(totalPnL)}`}             sub="Unrealized gain/loss"  color={pctColor(totalPnL)} />
        <KpiCard label="Holdings"    value={portfolioItems.length}                                       sub="Active positions"      color="#3b82f6" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Holdings table */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 70px 1fr 1fr 1fr 60px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#334155", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
              <span>ASSET</span><span>QTY</span>
              <span style={{ textAlign: "right" as const }}>PRICE</span>
              <span style={{ textAlign: "right" as const }}>VALUE</span>
              <span style={{ textAlign: "right" as const }}>P&L</span>
              <span />
            </div>
            {portfolioItems.length === 0 ? (
              <div style={{ padding: 20, color: "#334155", fontFamily: "'DM Mono', monospace", fontSize: 13, textAlign: "center" as const }}>
                {stocks.length === 0 ? "Loading live prices…" : "No holdings. Add positions below."}
              </div>
            ) : portfolioItems.map(item => (
              <div
                key={item.sym}
                style={{ display: "grid", gridTemplateColumns: "80px 70px 1fr 1fr 1fr 60px", padding: "14px 20px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#f0f4ff", fontSize: 13 }}>{item.sym}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>{item.asset.name}</div>
                </div>
                <span style={{ fontFamily: "'DM Mono', monospace", color: "#64748b", fontSize: 13 }}>{item.qty}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", color: "#f0f4ff", fontSize: 13, textAlign: "right" as const }}>{fmt(item.asset.price)}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", color: "#f0f4ff", fontSize: 13, textAlign: "right" as const }}>{fmt(item.value)}</span>
                <span style={{ textAlign: "right" as const }}>
                  <span style={{ color: pctColor(item.pnl), fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                    {item.pnl >= 0 ? "+" : ""}{fmt(item.pnl)} ({item.pnlPct >= 0 ? "+" : ""}{item.pnlPct.toFixed(1)}%)
                  </span>
                </span>
                <div style={{ display: "flex", justifyContent: "center" as const }}>
                  <button
                    onClick={() => setHoldings(h => { const next = { ...h }; delete next[item.sym]; return next; })}
                    style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 14 }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add position form */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", marginBottom: 14, fontSize: 14 }}>Add Position</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={newSymbol}
                onChange={e => setNewSymbol(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addHolding()}
                placeholder="Symbol (e.g. AAPL)"
                style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontFamily: "'DM Mono', monospace", fontSize: 13, outline: "none" }}
              />
              <input
                value={newQty}
                onChange={e => setNewQty(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addHolding()}
                placeholder="Qty"
                type="number"
                min="0"
                style={{ width: 80, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontFamily: "'DM Mono', monospace", fontSize: 13, outline: "none" }}
              />
              <button
                onClick={addHolding}
                style={{ background: "rgba(34,211,165,0.15)", border: "1px solid rgba(34,211,165,0.3)", color: "#22d3a5", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 13 }}
              >
                Add
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#334155", marginTop: 8, fontFamily: "'DM Mono', monospace" }}>
              Available: {availableSymbols.join(", ")}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Allocation bar chart */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", marginBottom: 16, fontSize: 14 }}>Allocation</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fill: "#64748b", fontSize: 12, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "'DM Mono', monospace", fontSize: 11 }} itemStyle={{ color: "#22d3a5" }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]} />
                <Bar dataKey="value" fill="#22d3a5" radius={[0, 4, 4, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weight bars */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", marginBottom: 14, fontSize: 14 }}>Weight</div>
            {portfolioItems.map(item => {
              const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
              return (
                <div key={item.sym} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#94a3b8" }}>{item.sym}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#64748b" }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#22d3a5,#3b82f6)", borderRadius: 2, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              );
            })}
            {portfolioItems.length === 0 && (
              <Skel h={80} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
