import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { apiFetch } from "../../services/api/client";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { Skel } from "../../components/ui/Skeleton";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { fmt, pctColor, pctBg } from "../../utils/dashFormat";
import type { StockQuote, CryptoAsset, MatchScore, DataPoint } from "../../types/dashboard.types";

interface HomeProps {
  dark: boolean;
  setPage: (p: string) => void;
  watchlist: string[];
  stocks?: StockQuote[];
  cryptos?: CryptoAsset[];
  stocksLoading?: boolean;
  cryptosLoading?: boolean;
  stocksError?: Error | null;
  cryptosError?: Error | null;
  onRefreshStocks?: () => void;
  onRefreshCryptos?: () => void;
}

export default function Home({
  dark,
  setPage,
  watchlist,
  stocks = [],
  cryptos = [],
  stocksLoading = false,
  cryptosLoading = false,
  stocksError = null,
  cryptosError = null,
  onRefreshStocks,
  onRefreshCryptos,
}: HomeProps) {
  const theme = {
    text: dark ? "#f0f4ff" : "#0f172a",
    muted: dark ? "#475569" : "#64748b",
    soft: dark ? "#334155" : "#64748b",
    panel: dark ? "rgba(255,255,255,0.03)" : "#ffffff",
    panelBorder: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #dbe3ef",
    rowBorder: dark ? "1px solid rgba(255,255,255,0.04)" : "1px solid #edf2f7",
    hoverPanel: dark ? "rgba(255,255,255,0.06)" : "#f8fafc",
    chartTooltipBg: dark ? "#0f172a" : "#ffffff",
    chartTooltipBorder: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #dbe3ef",
    chartTick: dark ? "#334155" : "#64748b",
  };

  // Only fetch sports and crypto history locally (Home-specific data)
  const { data: liveScores = [], isError: se2 } = useQuery<MatchScore[]>({
    queryKey: ["sports", "live", "ALL"],
    queryFn: () => apiFetch("/api/sports/live?league=ALL"),
    refetchInterval: 60_000, staleTime: 55_000,
  });
  const { data: btcHistory } = useQuery<DataPoint[]>({
    queryKey: ["crypto", "history", "bitcoin", 30],
    queryFn: () => apiFetch("/api/crypto/history?coin=bitcoin&days=30"),
    staleTime: 300_000,
  });

  const sl = stocksLoading;
  const cl = cryptosLoading;
  const se = stocksError;
  const ce = cryptosError;

  const allTickers = [
    ...stocks.map(s => ({ symbol: s.symbol, pct: s.pct })),
    ...cryptos.map(c => ({ symbol: c.symbol, pct: c.pct })),
  ];
  const topGainer    = [...allTickers].sort((a, b) => b.pct - a.pct)[0];
  const liveGames    = liveScores.filter(s => s.status === "LIVE").length;
  const btc          = cryptos.find(c => c.id === "bitcoin");
  const totalMcap    = cryptos.reduce((s, c) => s + c.marketCap, 0);
  const btcDominance = totalMcap > 0 ? ((btc?.marketCap ?? 0) / totalMcap * 100).toFixed(1) : "—";
  const topMovers    = [...allTickers].sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 5);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: theme.text, margin: 0, letterSpacing: -1 }}>Market Overview</h1>
        <p style={{ color: theme.muted, fontSize: 14, marginTop: 6, fontFamily: "'DM Mono', monospace" }}>Live data · Updated just now</p>
      </div>

      {(se || ce || se2) && (
        <ErrorBanner
          error={new Error('Failed to load market data')}
          message="Some data failed to load. The backend may be unavailable — retrying automatically."
          onRetry={() => {
            if (se && onRefreshStocks) onRefreshStocks();
            if (ce && onRefreshCryptos) onRefreshCryptos();
          }}
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <KpiCard dark={dark} label="Tracked Assets"  value={stocks.length + cryptos.length}     sub={`${stocks.length} stocks · ${cryptos.length} crypto`} color="#22d3a5" />
        <KpiCard dark={dark} label="Top Gainer"      value={topGainer ? `+${topGainer.pct.toFixed(2)}%` : "—"} sub={topGainer?.symbol ?? "Loading…"} color="#22d3a5" />
        <KpiCard dark={dark} label="Live Games"      value={liveGames}                           sub="Across all sports"   color="#3b82f6" />
        <KpiCard dark={dark} label="BTC Dominance"   value={`${btcDominance}%`}                 sub="Of total market cap" color="#f59e0b" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 24 }}>
        <div style={{ background: theme.panel, border: theme.panelBorder, borderRadius: 14, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: theme.text, fontSize: 16 }}>Bitcoin · 30 Day</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, color: "#22d3a5", marginTop: 2 }}>
                {btc ? fmt(btc.price) : <Skel w={120} h={22} />}
              </div>
            </div>
            <span style={{ background: pctBg(btc?.pct ?? 0), color: pctColor(btc?.pct ?? 0), borderRadius: 6, padding: "4px 10px", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
              {(btc?.pct ?? 0) > 0 ? "+" : ""}{(btc?.pct ?? 0).toFixed(2)}%
            </span>
          </div>
          {btcHistory && btcHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={btcHistory}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3a5" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#22d3a5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: theme.chartTick, fontSize: 10, fontFamily: "'DM Mono', monospace" }} tickLine={false} axisLine={false} interval={6} />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: theme.chartTooltipBg, border: theme.chartTooltipBorder, borderRadius: 8, fontFamily: "'DM Mono', monospace", fontSize: 12 }} labelStyle={{ color: theme.muted }} itemStyle={{ color: "#22d3a5" }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Price"]} />
                <Area type="monotone" dataKey="value" stroke="#22d3a5" strokeWidth={2} fill="url(#grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <Skel w="100%" h={200} />}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { id: "cse",       label: "Stocks 🇱🇰",  icon: "",   color: "#3b82f6", sub: `${stocks.length} assets tracked`,          val: stocks[0] ? `${stocks[0].pct > 0 ? "+" : ""}${stocks[0].pct.toFixed(2)}%` : "…" },
            { id: "crypto",    label: "Crypto",       icon: "◉", color: "#f59e0b", sub: `Top ${cryptos.length} by market cap`,       val: btc ? `${btc.pct > 0 ? "+" : ""}${btc.pct.toFixed(2)}%` : "…" },
            { id: "sports",    label: "Sports",       icon: "◎", color: "#ec4899", sub: `${liveGames} games live`,                   val: liveGames > 0 ? "LIVE" : "Upcoming" },
            { id: "portfolio", label: "Portfolio",    icon: "◇", color: "#22d3a5", sub: `${watchlist.length} assets`,                val: "Track" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{ background: theme.panel, border: theme.panelBorder, borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left" as const, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = theme.hoverPanel; e.currentTarget.style.borderColor = `${item.color}44`; }}
              onMouseLeave={e => { e.currentTarget.style.background = theme.panel; e.currentTarget.style.borderColor = dark ? "rgba(255,255,255,0.07)" : "#dbe3ef"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 18, color: item.color }}>{item.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, color: theme.text, fontSize: 14 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: theme.muted, marginTop: 2 }}>{item.sub}</div>
                </div>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: item.color }}>{item.val}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: theme.panel, border: theme.panelBorder, borderRadius: 14, padding: 20 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: theme.text, marginBottom: 16, fontSize: 14 }}>Top Movers</div>
          {sl || cl ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: theme.rowBorder }}>
              <Skel w={60} h={13} /><Skel w={60} h={13} />
            </div>
          )) : topMovers.map(a => (
            <div key={a.symbol} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: theme.rowBorder }}>
              <span style={{ fontFamily: "'DM Mono', monospace", color: theme.muted, fontSize: 13 }}>{a.symbol}</span>
              <span style={{ background: pctBg(a.pct), color: pctColor(a.pct), borderRadius: 4, padding: "2px 8px", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{a.pct > 0 ? "+" : ""}{a.pct.toFixed(2)}%</span>
            </div>
          ))}
        </div>
        <div style={{ background: theme.panel, border: theme.panelBorder, borderRadius: 14, padding: 20 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: theme.text, marginBottom: 16, fontSize: 14 }}>Live Scores</div>
          {liveScores.filter(s => s.status === "LIVE").length === 0
            ? <div style={{ color: theme.soft, fontSize: 13, fontFamily: "'DM Mono', monospace", textAlign: "center" as const, marginTop: 16 }}>No live games right now</div>
            : liveScores.filter(s => s.status === "LIVE").map((g, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: theme.rowBorder }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: theme.muted }}>{g.league}</span>
                <span style={{ color: theme.text, fontSize: 13, fontFamily: "'Syne', sans-serif" }}>{g.home} {g.homeScore} — {g.awayScore} {g.away}</span>
                <span style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>● LIVE</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
