import { useState, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { Skel } from "../../components/ui/Skeleton";
import { fmt, pctColor } from "../../utils/dashFormat";
import { STOCK_META } from "../../constants/stocks";
import { useTheme } from "../../hooks/useTheme";
import type { StockQuote, CryptoAsset } from "../../types/dashboard.types";

interface PortfolioProps {
  stocks: StockQuote[];
  cryptos: CryptoAsset[];
}

export default function Portfolio({ stocks, cryptos }: PortfolioProps) {
  const { dark } = useTheme();
  const [holdings,  setHoldings]  = useState<Record<string, number>>({ AAPL: 10, BTC: 0.5, NVDA: 5 });
  const [newSymbol, setNewSymbol] = useState("");
  const [newQty,    setNewQty]    = useState("");
  const [formNote,  setFormNote]  = useState<string | null>(null);

  const findPrice = useCallback((sym: string) => {
    const s = stocks.find(a => a.symbol === sym);
    if (s) return { price: s.price, pct: s.pct, change: s.change, name: STOCK_META[sym] ?? sym };
    const c = cryptos.find(a => a.symbol === sym);
    if (c) return { price: c.price, pct: c.pct, change: c.change, name: c.name };
    return null;
  }, [stocks, cryptos]);

  const portfolioItems = useMemo(() => {
    return Object.entries(holdings)
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
  }, [holdings, findPrice]);

  const totalValue = useMemo(() => portfolioItems.reduce((s, i) => s + i.value, 0), [portfolioItems]);
  const totalPnL   = useMemo(() => portfolioItems.reduce((s, i) => s + i.pnl, 0), [portfolioItems]);

  const addHolding = useCallback(() => {
    const sym = newSymbol.toUpperCase().trim();
    const qty = parseFloat(newQty);
    if (sym && qty > 0 && findPrice(sym)) {
      setHoldings(h => ({ ...h, [sym]: (h[sym] ?? 0) + qty }));
      setFormNote(`Added ${qty} ${sym}`);
      setNewSymbol("");
      setNewQty("");
      return;
    }
    setFormNote("Choose a valid symbol and quantity greater than 0.");
  }, [newSymbol, newQty, findPrice]);

  const availableSymbols = useMemo(
    () => Array.from(new Set([...stocks.map(s => s.symbol), ...cryptos.map(c => c.symbol)])).sort(),
    [stocks, cryptos],
  );
  const quickPicks = useMemo(() => availableSymbols.slice(0, 8), [availableSymbols]);
  const normalizedSymbol = useMemo(() => newSymbol.trim().toUpperCase(), [newSymbol]);
  const selectedAsset = useMemo(() => (normalizedSymbol ? findPrice(normalizedSymbol) : null), [normalizedSymbol, findPrice]);
  const qtyNumber = useMemo(() => parseFloat(newQty), [newQty]);
  const estimatedValue = useMemo(() => {
    if (!selectedAsset || Number.isNaN(qtyNumber) || qtyNumber <= 0) return null;
    return selectedAsset.price * qtyNumber;
  }, [selectedAsset, qtyNumber]);
  const canSubmit = Boolean(selectedAsset && !Number.isNaN(qtyNumber) && qtyNumber > 0);
  const barData = useMemo(() => portfolioItems.map(i => ({ name: i.sym, value: Math.round(i.value) })), [portfolioItems]);
  const theme = useMemo(() => ({
    text: dark ? "#f0f4ff" : "#0f172a",
    subtext: dark ? "#64748b" : "#475569",
    faint: dark ? "#334155" : "#64748b",
    cardBg: dark ? "rgba(255,255,255,0.03)" : "#ffffff",
    cardBorder: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e2e8f0",
    softBg: dark ? "rgba(255,255,255,0.05)" : "#f8fafc",
    softBorder: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1",
    panelBg: dark ? "rgba(15,23,42,0.35)" : "#f8fafc",
    panelBorder: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e2e8f0",
    rowBorder: dark ? "1px solid rgba(255,255,255,0.04)" : "1px solid #edf2f7",
    headerBorder: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0",
  }), [dark]);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: theme.text, margin: 0 }}>Portfolio</h1>
        <p style={{ color: theme.subtext, fontSize: 13, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>Simulated holdings · Live P&L</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        <KpiCard label="Total Value" value={fmt(totalValue)}                                             sub="Across all holdings"   color="#22d3a5" />
        <KpiCard label="Total P&L"   value={`${totalPnL >= 0 ? "+" : ""}${fmt(totalPnL)}`}             sub="Unrealized gain/loss"  color={pctColor(totalPnL)} />
        <KpiCard label="Holdings"    value={portfolioItems.length}                                       sub="Active positions"      color="#3b82f6" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Holdings table */}
          <div style={{ background: theme.cardBg, border: theme.cardBorder, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 70px 1fr 1fr 1fr 60px", padding: "12px 20px", borderBottom: theme.headerBorder, fontSize: 11, color: theme.faint, fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
              <span>ASSET</span><span>QTY</span>
              <span style={{ textAlign: "right" as const }}>PRICE</span>
              <span style={{ textAlign: "right" as const }}>VALUE</span>
              <span style={{ textAlign: "right" as const }}>P&L</span>
              <span />
            </div>
            {portfolioItems.length === 0 ? (
              <div style={{ padding: 20, color: theme.faint, fontFamily: "'DM Mono', monospace", fontSize: 13, textAlign: "center" as const }}>
                {stocks.length === 0 ? "Loading live prices…" : "No holdings. Add positions below."}
              </div>
            ) : portfolioItems.map(item => (
              <div
                key={item.sym}
                style={{ display: "grid", gridTemplateColumns: "80px 70px 1fr 1fr 1fr 60px", padding: "14px 20px", alignItems: "center", borderBottom: theme.rowBorder }}
              >
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: theme.text, fontSize: 13 }}>{item.sym}</div>
                  <div style={{ fontSize: 10, color: theme.subtext, marginTop: 1 }}>{item.asset.name}</div>
                </div>
                <span style={{ fontFamily: "'DM Mono', monospace", color: theme.subtext, fontSize: 13 }}>{item.qty}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", color: theme.text, fontSize: 13, textAlign: "right" as const }}>{fmt(item.asset.price)}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", color: theme.text, fontSize: 13, textAlign: "right" as const }}>{fmt(item.value)}</span>
                <span style={{ textAlign: "right" as const }}>
                  <span style={{ color: pctColor(item.pnl), fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                    {item.pnl >= 0 ? "+" : ""}{fmt(item.pnl)} ({item.pnlPct >= 0 ? "+" : ""}{item.pnlPct.toFixed(1)}%)
                  </span>
                </span>
                <div style={{ display: "flex", justifyContent: "center" as const }}>
                  <button
                    onClick={() => setHoldings(h => { const next = { ...h }; delete next[item.sym]; return next; })}
                    style={{ background: "none", border: "none", color: theme.faint, cursor: "pointer", fontSize: 14 }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add position form */}
          <div style={{ background: theme.cardBg, border: theme.cardBorder, borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: theme.text, marginBottom: 14, fontSize: 14 }}>Add Position</div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addHolding();
              }}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 92px", gap: 10 }}>
                <input
                  value={newSymbol}
                  onChange={e => {
                    setNewSymbol(e.target.value.toUpperCase());
                    setFormNote(null);
                  }}
                  list="portfolio-symbols"
                  placeholder="Symbol (AAPL, BTC, TSLA...)"
                  style={{ background: theme.softBg, border: `1px solid ${newSymbol && !selectedAsset ? "rgba(239,68,68,0.5)" : dark ? "rgba(255,255,255,0.1)" : "#cbd5e1"}`, borderRadius: 8, padding: "10px 14px", color: theme.text, fontFamily: "'DM Mono', monospace", fontSize: 13, outline: "none" }}
                />
                <input
                  value={newQty}
                  onChange={e => {
                    setNewQty(e.target.value);
                    setFormNote(null);
                  }}
                  placeholder="Qty"
                  type="number"
                  min="0"
                  step="any"
                  style={{ background: theme.softBg, border: `1px solid ${newQty && (!qtyNumber || qtyNumber <= 0) ? "rgba(239,68,68,0.5)" : dark ? "rgba(255,255,255,0.1)" : "#cbd5e1"}`, borderRadius: 8, padding: "10px 12px", color: theme.text, fontFamily: "'DM Mono', monospace", fontSize: 13, outline: "none" }}
                />
              </div>

              <datalist id="portfolio-symbols">
                {availableSymbols.map(sym => (
                  <option key={sym} value={sym} />
                ))}
              </datalist>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {quickPicks.map(sym => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => {
                      setNewSymbol(sym);
                      setFormNote(null);
                    }}
                    style={{
                      background: newSymbol === sym ? "rgba(34,211,165,0.22)" : theme.softBg,
                      border: `1px solid ${newSymbol === sym ? "rgba(34,211,165,0.5)" : dark ? "rgba(255,255,255,0.08)" : "#dbe3ef"}`,
                      color: newSymbol === sym ? "#22d3a5" : theme.subtext,
                      borderRadius: 999,
                      padding: "4px 10px",
                      cursor: "pointer",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                    }}
                  >
                    {sym}
                  </button>
                ))}
              </div>

              <div style={{ background: theme.panelBg, border: theme.panelBorder, borderRadius: 8, padding: "10px 12px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: theme.subtext }}>
                {selectedAsset ? (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span>{selectedAsset.name} · {normalizedSymbol}</span>
                    <span>
                      {fmt(selectedAsset.price)}
                      {estimatedValue !== null ? ` · Est: ${fmt(estimatedValue)}` : ""}
                    </span>
                  </div>
                ) : (
                  <span>Select a valid symbol to preview live price.</span>
                )}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    background: canSubmit ? "rgba(34,211,165,0.15)" : "rgba(100,116,139,0.15)",
                    border: `1px solid ${canSubmit ? "rgba(34,211,165,0.35)" : "rgba(100,116,139,0.35)"}`,
                    color: canSubmit ? "#22d3a5" : "#64748b",
                    borderRadius: 8,
                    padding: "9px 16px",
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    flex: 1,
                  }}
                >
                  Add Position
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewSymbol("");
                    setNewQty("");
                    setFormNote(null);
                  }}
                  style={{ background: "transparent", border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1", color: theme.subtext, borderRadius: 8, padding: "9px 14px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 13 }}
                >
                  Clear
                </button>
              </div>
            </form>
            <div style={{ fontSize: 11, color: formNote?.startsWith("Added") ? "#22d3a5" : theme.faint, marginTop: 8, fontFamily: "'DM Mono', monospace" }}>
              {formNote ?? `Market symbols: ${availableSymbols.slice(0, 14).join(", ")}${availableSymbols.length > 14 ? "..." : ""}`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Allocation bar chart */}
          <div style={{ background: theme.cardBg, border: theme.cardBorder, borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: theme.text, marginBottom: 16, fontSize: 14 }}>Allocation</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fill: theme.subtext, fontSize: 12, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "'DM Mono', monospace", fontSize: 11 }} itemStyle={{ color: "#22d3a5" }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]} />
                <Bar dataKey="value" fill="#22d3a5" radius={[0, 4, 4, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weight bars */}
          <div style={{ background: theme.cardBg, border: theme.cardBorder, borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: theme.text, marginBottom: 14, fontSize: 14 }}>Weight</div>
            {portfolioItems.map(item => {
              const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
              return (
                <div key={item.sym} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: theme.subtext }}>{item.sym}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: theme.faint }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 4, background: dark ? "rgba(255,255,255,0.06)" : "#e2e8f0", borderRadius: 2 }}>
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
