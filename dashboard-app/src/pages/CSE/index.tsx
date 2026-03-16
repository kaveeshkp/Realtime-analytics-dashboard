import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { apiFetch } from "../../services/api/client";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { Skel } from "../../components/ui/Skeleton";
import { MiniSparkline } from "../../components/ui/MiniSparkline";
import { fmtVol, fmtLKR, pctColor, pctBg, generateSparkline } from "../../utils/dashFormat";
import type { CSEQuote, DataPoint } from "../../types/dashboard.types";

const RANGES = ["1D", "1W", "1M", "3M", "1Y"];

export default function CSEMarket() {
  const [selected, setSelected] = useState("JKH");
  const [range,    setRange]    = useState("1M");
  const [sortBy,   setSortBy]   = useState("symbol");

  const { data: cseStocks = [], isLoading } = useQuery<CSEQuote[]>({
    queryKey: ["cse", "quotes"],
    queryFn:  () => apiFetch("/api/cse/quotes"),
    refetchInterval: 60_000, staleTime: 55_000,
  });

  const { data: history } = useQuery<DataPoint[]>({
    queryKey: ["cse", "history", selected, range],
    queryFn:  () => apiFetch(`/api/cse/history?symbol=${selected}&range=${range}`),
    staleTime: range === "1D" ? 300_000 : 3_600_000,
  });

  const selectedStock = cseStocks.find(s => s.symbol === selected);

  const sparklines = useMemo(
    () => Object.fromEntries(cseStocks.map(s => [s.symbol, generateSparkline(s.price)])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cseStocks.map(s => `${s.symbol}${s.pct >= 0}`).join(",")]
  );

  const sorted = [...cseStocks].sort((a, b) =>
    sortBy === "price"  ? b.price - a.price :
    sortBy === "pct"    ? b.pct - a.pct :
    a.symbol.localeCompare(b.symbol)
  );

  const totalMcap = cseStocks.reduce((s, q) => s + q.marketCap, 0);
  const gainers   = cseStocks.filter(s => s.pct >  0).length;
  const losers    = cseStocks.filter(s => s.pct <  0).length;

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 26 }}>🇱🇰</span>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#f0f4ff", margin: 0 }}>CSE · Sri Lanka</h1>
          </div>
          <p style={{ color: "#475569", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>Colombo Stock Exchange · Prices in LKR (₨) · Simulated live feed · Refreshes every 60s</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["symbol", "price", "pct"].map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              style={{ background: sortBy === s ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${sortBy === s ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`, color: sortBy === s ? "#10b981" : "#64748b", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace" }}
            >
              Sort: {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <KpiCard label="Listed"        value={cseStocks.length}                                           sub="Tracked CSE stocks"       color="#10b981" />
        <KpiCard label="Gainers"       value={gainers}                                                    sub={`${losers} losers today`} color={gainers >= losers ? "#22d3a5" : "#f87171"} />
        <KpiCard label="Total Mkt Cap" value={totalMcap > 0 ? fmtLKR(totalMcap) : "—"}                  sub="Combined (LKR)"           color="#3b82f6" />
        <KpiCard label="Currency"      value="LKR · ₨"                                                   sub="Sri Lankan Rupee"         color="#f59e0b" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
        {/* Table */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 110px 90px 72px 80px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#334155", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
            <span>SYMBOL</span><span>NAME</span>
            <span style={{ textAlign: "right" as const }}>PRICE (₨)</span>
            <span style={{ textAlign: "right" as const }}>CHANGE</span>
            <span style={{ textAlign: "right" as const }}>VOL</span>
            <span style={{ textAlign: "right" as const }}>7D</span>
          </div>
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 110px 90px 72px 80px", padding: "14px 20px", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                <Skel w={44} /><Skel w={120} /><Skel w={70} /><Skel w={60} /><Skel w={44} /><Skel w={80} h={32} />
              </div>
            ))
            : sorted.length === 0
              ? (
                <div style={{ padding: "60px 20px", textAlign: "center" as const, color: "#334155", fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 1.8 }}>
                  No CSE data returned.<br />
                  <span style={{ fontSize: 11, color: "#1e293b" }}>The backend may be temporarily unavailable.</span>
                </div>
              )
              : sorted.map(s => (
                <div
                  key={s.symbol}
                  onClick={() => setSelected(s.symbol)}
                  style={{ display: "grid", gridTemplateColumns: "80px 1fr 110px 90px 72px 80px", padding: "14px 20px", cursor: "pointer", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", background: selected === s.symbol ? "rgba(16,185,129,0.07)" : "transparent", borderLeft: selected === s.symbol ? "2px solid #10b981" : "2px solid transparent", transition: "all 0.15s" }}
                >
                  <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#f0f4ff", fontSize: 14 }}>{s.symbol}</span>
                  <span style={{ fontSize: 13, color: "#64748b" }}>{s.name}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", color: "#f0f4ff", fontSize: 13, textAlign: "right" as const }}>₨{s.price.toFixed(2)}</span>
                  <span style={{ textAlign: "right" as const }}>
                    <span style={{ background: pctBg(s.pct), color: pctColor(s.pct), borderRadius: 5, padding: "3px 8px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{s.pct > 0 ? "+" : ""}{s.pct.toFixed(2)}%</span>
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569", textAlign: "right" as const }}>{fmtVol(s.volume)}</span>
                  <div style={{ display: "flex", justifyContent: "flex-end" as const }}>
                    <MiniSparkline data={sparklines[s.symbol] ?? []} positive={s.pct >= 0} />
                  </div>
                </div>
              ))}
        </div>

        {/* Detail panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedStock ? (
            <>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#10b981", fontSize: 22 }}>{selectedStock.symbol}</div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{selectedStock.name} · CSE</div>
                  </div>
                  <span style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>COLOMBO SE</span>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, color: "#f0f4ff", fontWeight: 700 }}>₨{selectedStock.price.toFixed(2)}</div>
                <div style={{ fontSize: 13, color: pctColor(selectedStock.pct), marginTop: 4 }}>
                  {selectedStock.pct >= 0 ? "▲" : "▼"} ₨{Math.abs(selectedStock.change).toFixed(2)} ({selectedStock.pct > 0 ? "+" : ""}{selectedStock.pct.toFixed(2)}%) today
                </div>
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                {RANGES.map(r => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    style={{ flex: 1, background: range === r ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${range === r ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.07)"}`, color: range === r ? "#10b981" : "#475569", borderRadius: 8, padding: "7px 0", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace" }}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                {history && history.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="cseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={["auto", "auto"]} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "'DM Mono', monospace", fontSize: 11 }} itemStyle={{ color: "#10b981" }} formatter={(v: number) => [`₨${v.toLocaleString()}`, ""]} />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#cseGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160 }}>
                    <Skel w="100%" h={160} />
                  </div>
                )}
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                {[
                  ["Prev Close", `₨${selectedStock.prevClose.toFixed(2)}`],
                  ["Day High",   `₨${selectedStock.high.toFixed(2)}`],
                  ["Day Low",    `₨${selectedStock.low.toFixed(2)}`],
                  ["Volume",     fmtVol(selectedStock.volume)],
                  ["Mkt Cap",    selectedStock.marketCap > 0 ? fmtLKR(selectedStock.marketCap) : "—"],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 12, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{l}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          ) : isLoading ? (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
              <Skel h={22} w={100} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
