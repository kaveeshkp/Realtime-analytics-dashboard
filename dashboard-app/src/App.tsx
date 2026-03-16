import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StockQuote { symbol: string; price: number; change: number; pct: number; volume: number; high: number; low: number; prevClose: number; }
interface DataPoint  { date: string; value: number; }
interface CryptoAsset { id: string; symbol: string; name: string; price: number; change: number; pct: number; marketCap: number; volume: number; sparkline: number[]; image: string; }
interface MatchScore  { league: string; home: string; away: string; homeScore: number; awayScore: number; status: "FT" | "LIVE" | "UP"; time: string; date: string; }
interface Fixture     { league: string; home: string; away: string; status: "UP"; time: string; }
interface CSEQuote    { symbol: string; fullSymbol: string; name: string; price: number; change: number; pct: number; volume: number; high: number; low: number; prevClose: number; marketCap: number; }

// ─── API ──────────────────────────────────────────────────────────────────────
// Use relative URLs so Vite proxy forwards /api → http://localhost:5000
// (works regardless of which port the dev server picks: 3000, 3001, 3002…)
const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    throw new Error((body.error as string) ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Static metadata (Alpha Vantage GLOBAL_QUOTE doesn't return names) ────────
const STOCK_SYMBOLS = "AAPL,MSFT,GOOGL,TSLA,NVDA,AMZN";
const STOCK_META: Record<string, string> = {
  AAPL: "Apple Inc.", MSFT: "Microsoft", GOOGL: "Alphabet",
  TSLA: "Tesla",     NVDA: "NVIDIA",    AMZN: "Amazon",
};
const WATCHLIST_DEFAULT = ["AAPL", "BTC", "NVDA"];

// ─── Utility ──────────────────────────────────────────────────────────────────
const generateSparkline = (base: number, n = 20): number[] =>
  Array.from({ length: n }, (_, i) => Math.max(0, base + (Math.random() - 0.48) * base * 0.04 * (i + 1)));

const fmt = (n: number, decimals = 2) =>
  n >= 1e12 ? `$${(n / 1e12).toFixed(1)}T` :
  n >= 1e9  ? `$${(n / 1e9).toFixed(1)}B`  :
  n >= 1e6  ? `$${(n / 1e6).toFixed(1)}M`  :
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

const fmtVol = (n: number) =>
  n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` :
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` :
  n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : String(n);

const pctColor = (v: number) => (v >= 0 ? "#22d3a5" : "#f87171");
const pctBg    = (v: number) => (v >= 0 ? "rgba(34,211,165,0.1)" : "rgba(248,113,113,0.1)");

const CRICKET_FLAG_PATTERNS: Array<{ pattern: RegExp; flag: string }> = [
  { pattern: /india|\bind\b/i, flag: "🇮🇳" },
  { pattern: /pakistan|\bpak\b/i, flag: "🇵🇰" },
  { pattern: /sri lanka|\bsl\b/i, flag: "🇱🇰" },
  { pattern: /bangladesh|\bban\b/i, flag: "🇧🇩" },
  { pattern: /afghanistan|\bafg\b/i, flag: "🇦🇫" },
  { pattern: /england|\beng\b/i, flag: "🏴" },
  { pattern: /scotland|\bsco\b/i, flag: "🏴" },
  { pattern: /ireland|\bire\b/i, flag: "🇮🇪" },
  { pattern: /wales|\bwal\b/i, flag: "🏴" },
  { pattern: /new zealand|\bnz\b/i, flag: "🇳🇿" },
  { pattern: /south africa|\bsa\b/i, flag: "🇿🇦" },
  { pattern: /west indies|\bwi\b/i, flag: "🏴" },
  { pattern: /zimbabwe|\bzim\b/i, flag: "🇿🇼" },
  { pattern: /nepal|\bnep\b/i, flag: "🇳🇵" },
  { pattern: /netherlands|\bned\b/i, flag: "🇳🇱" },
  { pattern: /namibia|\bnam\b/i, flag: "🇳🇦" },
  { pattern: /oman|\bomn\b/i, flag: "🇴🇲" },
  { pattern: /canada|\bcan\b/i, flag: "🇨🇦" },
  { pattern: /usa|united states|\bus\b/i, flag: "🇺🇸" },
  { pattern: /australia|new south wales|queensland|victoria|tasmania|western australia|south australia/i, flag: "🇦🇺" },
];

const scorePattern = /\d{1,3}(?:\/\d{1,2})?(?:\s*&\s*\d{1,3}(?:\/\d{1,2})?)?/g;

function parseCricketSide(raw: string): { team: string; innings: string } {
  const clean = raw.replace(/\*/g, "").replace(/\s+/g, " ").trim();
  const innings = (clean.match(scorePattern) ?? []).join(" & ").trim();
  const team = clean
    .replace(scorePattern, "")
    .replace(/\s*&\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { team: team || raw, innings };
}

function cricketFlag(teamName: string): string {
  const hit = CRICKET_FLAG_PATTERNS.find(({ pattern }) => pattern.test(teamName));
  return hit?.flag ?? "🏏";
}

// ─── LKR formatter ───────────────────────────────────────────────────────────
const fmtLKR = (n: number) =>
  n >= 1e9 ? `₨${(n / 1e9).toFixed(1)}B` :
  n >= 1e6 ? `₨${(n / 1e6).toFixed(1)}M` :
  `₨${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skel = ({ w = "100%", h = 14 }: { w?: string | number; h?: number }) => (
  <div style={{ width: w, height: h, background: "rgba(255,255,255,0.07)", borderRadius: 4 }} />
);

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
const Spark = ({ data, positive }: { data: number[]; positive: boolean }) => (
  <ResponsiveContainer width={80} height={32}>
    <LineChart data={data.map((v, t) => ({ t, v }))}>
      <Line type="monotone" dataKey="v" stroke={positive ? "#22d3a5" : "#f87171"} strokeWidth={1.5} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, color = "#22d3a5" }: { label: string; value: string | number; sub?: string; color?: string }) => (
  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 22px", backdropFilter: "blur(10px)" }}>
    <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>{sub}</div>}
  </div>
);

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home",      label: "Overview",  icon: "⬡" },
  { id: "crypto",    label: "Crypto",    icon: "◉" },
  { id: "sports",    label: "Sports",    icon: "◎" },
  { id: "cse",       label: "Stocks 🇱🇰", icon: "" },
  { id: "portfolio", label: "Portfolio", icon: "◇" },
];

const Navbar = ({ page, setPage, dark, setDark, ticker }: {
  page: string;
  setPage: (p: string) => void;
  dark: boolean;
  setDark: (fn: (d: boolean) => boolean) => void;
  ticker: { symbol: string; pct: number }[];
}) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!ticker.length) return;
    const t = setInterval(() => setTick(x => x + 1), 3000);
    return () => clearInterval(t);
  }, [ticker.length]);
  const shown = ticker.length > 0 ? ticker[tick % ticker.length] : null;

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(8,12,20,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#22d3a5,#3b82f6)", display: "grid", placeItems: "center", fontSize: 14 }}>◈</div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#f0f4ff", letterSpacing: -0.5 }}>DASHFLOW</span>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            background: page === n.id ? "rgba(34,211,165,0.12)" : "transparent",
            border: page === n.id ? "1px solid rgba(34,211,165,0.3)" : "1px solid transparent",
            color: page === n.id ? "#22d3a5" : "#64748b",
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            fontSize: 13, fontFamily: "'DM Mono', monospace", transition: "all 0.2s",
          }}>
            <span style={{ marginRight: 5 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {shown && (
          <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#94a3b8" }}>
            <span style={{ color: "#f0f4ff", fontWeight: 600 }}>{shown.symbol}</span>
            {" "}<span style={{ color: pctColor(shown.pct) }}>{shown.pct > 0 ? "+" : ""}{shown.pct?.toFixed(2)}%</span>
          </div>
        )}
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />
        <button onClick={() => setDark(d => !d)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#94a3b8", fontSize: 14 }}>{dark ? "☀" : "☾"}</button>
      </div>
    </nav>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose, watchlist, setWatchlist, stocks, cryptos }: {
  isOpen: boolean; onClose: () => void;
  watchlist: string[]; setWatchlist: (fn: (w: string[]) => string[]) => void;
  stocks: StockQuote[]; cryptos: CryptoAsset[];
}) => {
  const findAsset = (sym: string) => {
    const s = stocks.find(a => a.symbol === sym);
    if (s) return { name: STOCK_META[sym] ?? sym, price: s.price, pct: s.pct };
    const c = cryptos.find(a => a.symbol === sym);
    if (c) return { name: c.name, price: c.price, pct: c.pct };
    return null;
  };
  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, backdropFilter: "blur(2px)" }} />}
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 300, background: "rgba(10,14,24,0.98)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(255,255,255,0.07)", transform: isOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)", zIndex: 50, padding: 24, overflowY: "auto" as const }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", fontSize: 16 }}>Watchlist</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        {watchlist.map(sym => {
          const asset = findAsset(sym);
          if (!asset) return <div key={sym} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}><Skel h={40} /></div>;
          return (
            <div key={sym} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: "#f0f4ff", fontSize: 14 }}>{sym}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{asset.name}</div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontFamily: "'DM Mono', monospace", color: "#f0f4ff", fontSize: 13 }}>{fmt(asset.price)}</div>
                <div style={{ fontSize: 11, color: pctColor(asset.pct), marginTop: 2 }}>{asset.pct > 0 ? "+" : ""}{asset.pct.toFixed(2)}%</div>
              </div>
              <button onClick={() => setWatchlist(w => w.filter(s => s !== sym))} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 14, marginLeft: 10 }}>✕</button>
            </div>
          );
        })}
        {watchlist.length === 0 && <div style={{ color: "#334155", fontSize: 13, textAlign: "center" as const, marginTop: 40, fontFamily: "'DM Mono', monospace" }}>No assets in watchlist.<br />Add from Stocks or Crypto tab.</div>}
      </div>
    </>
  );
};

// ─── Home Page ────────────────────────────────────────────────────────────────
const Home = ({ setPage, watchlist }: { setPage: (p: string) => void; watchlist: string[] }) => {
  const { data: stocks = [],  isLoading: sl } = useQuery<StockQuote[]>({
    queryKey: ["stocks", "batch"],
    queryFn: () => apiFetch(`/api/stocks/batch?symbols=${STOCK_SYMBOLS}`),
    refetchInterval: 30_000, staleTime: 25_000,
  });
  const { data: cryptos = [], isLoading: cl } = useQuery<CryptoAsset[]>({
    queryKey: ["crypto", "prices"],
    queryFn: () => apiFetch("/api/crypto/prices"),
    refetchInterval: 30_000, staleTime: 25_000,
  });
  const { data: liveScores = [] } = useQuery<MatchScore[]>({
    queryKey: ["sports", "live", "ALL"],
    queryFn: () => apiFetch("/api/sports/live?league=ALL"),
    refetchInterval: 60_000, staleTime: 55_000,
  });
  const { data: btcHistory } = useQuery<DataPoint[]>({
    queryKey: ["crypto", "history", "bitcoin", 30],
    queryFn: () => apiFetch("/api/crypto/history?coin=bitcoin&days=30"),
    staleTime: 300_000,
  });

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
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: "#f0f4ff", margin: 0, letterSpacing: -1 }}>Market Overview</h1>
        <p style={{ color: "#475569", fontSize: 14, marginTop: 6, fontFamily: "'DM Mono', monospace" }}>Live data · Updated just now</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <KpiCard label="Tracked Assets"  value={stocks.length + cryptos.length}     sub={`${stocks.length} stocks · ${cryptos.length} crypto`} color="#22d3a5" />
        <KpiCard label="Top Gainer"      value={topGainer ? `+${topGainer.pct.toFixed(2)}%` : "—"} sub={topGainer?.symbol ?? "Loading…"} color="#22d3a5" />
        <KpiCard label="Live Games"      value={liveGames}                           sub="Across all sports"   color="#3b82f6" />
        <KpiCard label="BTC Dominance"   value={`${btcDominance}%`}                 sub="Of total market cap" color="#f59e0b" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", fontSize: 16 }}>Bitcoin · 30 Day</div>
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
                <XAxis dataKey="date" tick={{ fill: "#334155", fontSize: 10, fontFamily: "'DM Mono', monospace" }} tickLine={false} axisLine={false} interval={6} />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "'DM Mono', monospace", fontSize: 12 }} labelStyle={{ color: "#64748b" }} itemStyle={{ color: "#22d3a5" }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Price"]} />
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
            <button key={item.id} onClick={() => setPage(item.id)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left" as const, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = `${item.color}44`; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 18, color: item.color }}>{item.icon}</div>
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, color: "#f0f4ff", fontSize: 14 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{item.sub}</div>
                </div>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: item.color }}>{item.val}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", marginBottom: 16, fontSize: 14 }}>Top Movers</div>
          {sl || cl ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <Skel w={60} h={13} /><Skel w={60} h={13} />
            </div>
          )) : topMovers.map(a => (
            <div key={a.symbol} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", color: "#94a3b8", fontSize: 13 }}>{a.symbol}</span>
              <span style={{ background: pctBg(a.pct), color: pctColor(a.pct), borderRadius: 4, padding: "2px 8px", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{a.pct > 0 ? "+" : ""}{a.pct.toFixed(2)}%</span>
            </div>
          ))}
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", marginBottom: 16, fontSize: 14 }}>Live Scores</div>
          {liveScores.filter(s => s.status === "LIVE").length === 0
            ? <div style={{ color: "#334155", fontSize: 13, fontFamily: "'DM Mono', monospace", textAlign: "center" as const, marginTop: 16 }}>No live games right now</div>
            : liveScores.filter(s => s.status === "LIVE").map((g, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#64748b" }}>{g.league}</span>
                <span style={{ color: "#f0f4ff", fontSize: 13, fontFamily: "'Syne', sans-serif" }}>{g.home} {g.homeScore} — {g.awayScore} {g.away}</span>
                <span style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>● LIVE</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// ─── Crypto Page ──────────────────────────────────────────────────────────────
const Crypto = ({ watchlist, setWatchlist }: {
  watchlist: string[];
  setWatchlist: (fn: (w: string[]) => string[]) => void;
}) => {
  const [selectedId, setSelectedId] = useState("bitcoin");

  const { data: cryptos = [], isLoading } = useQuery<CryptoAsset[]>({
    queryKey: ["crypto", "prices"],
    queryFn: () => apiFetch("/api/crypto/prices"),
    refetchInterval: 30_000, staleTime: 25_000,
  });
  const { data: history } = useQuery<DataPoint[]>({
    queryKey: ["crypto", "history", selectedId, 30],
    queryFn: () => apiFetch(`/api/crypto/history?coin=${selectedId}&days=30`),
    staleTime: 300_000,
  });

  const selectedCoin  = cryptos.find(c => c.id === selectedId);
  const inWatchlist   = watchlist.includes(selectedCoin?.symbol ?? "");
  const totalMarketCap = cryptos.reduce((s, c) => s + c.marketCap, 0);
  const totalVolume   = cryptos.reduce((s, c) => s + c.volume, 0);
  const btcDom        = totalMarketCap > 0 ? ((cryptos.find(c => c.id === "bitcoin")?.marketCap ?? 0) / totalMarketCap * 100).toFixed(1) : "—";

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#f0f4ff", margin: 0 }}>Cryptocurrency</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>Top {cryptos.length || 10} by market cap · Live prices</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        <KpiCard label="Total Market Cap" value={totalMarketCap ? fmt(totalMarketCap) : "—"} sub={`Top ${cryptos.length} coins`} color="#f59e0b" />
        <KpiCard label="24h Volume"        value={totalVolume ? fmt(totalVolume) : "—"}   sub="Across all pairs"  color="#3b82f6" />
        <KpiCard label="BTC Dominance"     value={`${btcDom}%`}                           sub="Of total cap"      color="#22d3a5" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 120px 100px 110px 80px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#334155", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
            <span>#</span><span>NAME</span><span style={{ textAlign: "right" as const }}>PRICE</span><span style={{ textAlign: "right" as const }}>24H</span><span style={{ textAlign: "right" as const }}>MARKET CAP</span><span style={{ textAlign: "right" as const }}>7D</span>
          </div>
          {isLoading ? Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "50px 1fr 120px 100px 110px 80px", padding: "14px 20px", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
              <Skel w={20} /><Skel w={110} /><Skel w={80} /><Skel w={60} /><Skel w={90} /><Skel w={80} h={32} />
            </div>
          )) : cryptos.map((c, i) => (
            <div key={c.id} onClick={() => setSelectedId(c.id)} style={{ display: "grid", gridTemplateColumns: "50px 1fr 120px 100px 110px 80px", padding: "14px 20px", cursor: "pointer", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", background: selectedId === c.id ? "rgba(245,158,11,0.06)" : "transparent", borderLeft: selectedId === c.id ? "2px solid #f59e0b" : "2px solid transparent", transition: "all 0.15s" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", color: "#334155", fontSize: 13 }}>{i + 1}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {c.image && <img src={c.image} alt={c.name} style={{ width: 20, height: 20, borderRadius: "50%" }} referrerPolicy="no-referrer" />}
                <div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#f0f4ff", fontSize: 14 }}>{c.symbol}</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{c.name}</div>
                </div>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", color: "#f0f4ff", fontSize: 13, textAlign: "right" as const }}>{c.price > 1 ? fmt(c.price) : `$${c.price.toFixed(4)}`}</span>
              <span style={{ textAlign: "right" as const }}>
                <span style={{ background: pctBg(c.pct), color: pctColor(c.pct), borderRadius: 5, padding: "3px 8px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{c.pct > 0 ? "+" : ""}{c.pct.toFixed(2)}%</span>
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569", textAlign: "right" as const }}>{fmt(c.marketCap)}</span>
              <div style={{ display: "flex", justifyContent: "flex-end" as const }}><Spark data={c.sparkline} positive={c.pct >= 0} /></div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedCoin && (
            <>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {selectedCoin.image && <img src={selectedCoin.image} alt={selectedCoin.name} style={{ width: 36, height: 36, borderRadius: "50%" }} referrerPolicy="no-referrer" />}
                    <div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#f59e0b", fontSize: 22 }}>{selectedCoin.symbol}</div>
                      <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{selectedCoin.name}</div>
                    </div>
                  </div>
                  <button onClick={() => setWatchlist(w => inWatchlist ? w.filter(s => s !== selectedCoin.symbol) : [...w, selectedCoin.symbol])} style={{ background: inWatchlist ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${inWatchlist ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.1)"}`, color: inWatchlist ? "#f59e0b" : "#64748b", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{inWatchlist ? "★ Watching" : "☆ Watch"}</button>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, color: "#f0f4ff", fontWeight: 700 }}>
                  {selectedCoin.price > 1 ? fmt(selectedCoin.price) : `$${selectedCoin.price.toFixed(4)}`}
                </div>
                <div style={{ fontSize: 13, color: pctColor(selectedCoin.pct), marginTop: 4 }}>
                  {selectedCoin.pct >= 0 ? "▲" : "▼"} {Math.abs(selectedCoin.change).toFixed(selectedCoin.price < 1 ? 4 : 2)} today
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                {history && history.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={["auto", "auto"]} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "'DM Mono', monospace", fontSize: 11 }} itemStyle={{ color: "#f59e0b" }} formatter={(v: number) => [v > 1 ? `$${v.toLocaleString()}` : `$${v.toFixed(4)}`, ""]} />
                      <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#cg)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <Skel w="100%" h={160} />}
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                {[["Market Cap", fmt(selectedCoin.marketCap)], ["24h Volume", fmt(selectedCoin.volume)], ["24h Change", `${selectedCoin.pct > 0 ? "+" : ""}${selectedCoin.pct.toFixed(2)}%`], ["Rank", `#${cryptos.findIndex(c => c.id === selectedId) + 1}`]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 12, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{l}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Sports Page ──────────────────────────────────────────────────────────────
const Sports = () => {
  const [league, setLeague] = useState("ALL");
  const LEAGUES = [
    { label: "All Sports", value: "ALL" },
    { label: "Cricket", value: "CRICKET" },
    { label: "Rugby", value: "RUGBY" },
    { label: "Football", value: "FOOTBALL" },
    { label: "Basketball", value: "BASKETBALL" },
  ];

  const { data: live = [],     isLoading: ll } = useQuery<MatchScore[]>({
    queryKey: ["sports", "live", league],
    queryFn:  () => apiFetch(`/api/sports/live?league=${league}`),
    refetchInterval: 30_000, staleTime: 25_000,
  });
  const { data: upcoming = [], isLoading: ul } = useQuery<Fixture[]>({
    queryKey: ["sports", "upcoming", league],
    queryFn:  () => apiFetch(`/api/sports/upcoming?league=${league}`),
    refetchInterval: 300_000, staleTime: 280_000,
  });

  // Combine live results + upcoming fixtures into one unified list
  type Row = { league: string; home: string; away: string; homeScore?: number; awayScore?: number; status: string; time: string };
  const rows: Row[] = [
    ...live,
    ...upcoming.map(f => ({ ...f, homeScore: undefined, awayScore: undefined })),
  ];

  const statusStyle = (s: string) => ({
    LIVE: { bg: "rgba(239,68,68,0.15)",   color: "#ef4444", label: "● LIVE" },
    FT:   { bg: "rgba(100,116,139,0.15)", color: "#64748b", label: "✓ FT"   },
    UP:   { bg: "rgba(59,130,246,0.15)",  color: "#3b82f6", label: "○ UP"   },
  }[s] ?? { bg: "", color: "", label: s });

  const formatUpdateTime = (raw: string) => {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const subtitle = league === "CRICKET"
    ? "Live cricket update feed · Refresh every 30s"
    : "International matches · all sports · Live refresh every 30s";

  const cricketTickerRows = rows.filter(r => r.league === "CRICKET").slice(0, 12);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#f0f4ff", margin: 0 }}>Live Sports</h1>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{subtitle}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {LEAGUES.map(({ label, value }) => (
            <button key={value} onClick={() => setLeague(value)} style={{ background: league === value ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${league === value ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.08)"}`, color: league === value ? "#ec4899" : "#64748b", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{label}</button>
          ))}
        </div>
      </div>

      {league === "CRICKET" && cricketTickerRows.length > 0 && (
        <>
          <style>{`@keyframes cricketTickerMove { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
          <div style={{
            marginBottom: 16,
            background: "linear-gradient(90deg, rgba(3,105,161,0.2), rgba(14,116,144,0.12))",
            border: "1px solid rgba(56,189,248,0.25)",
            borderRadius: 12,
            padding: "8px 0",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}>
            <div style={{
              display: "inline-flex",
              gap: 18,
              alignItems: "center",
              padding: "0 14px",
              minWidth: "max-content",
              animation: "cricketTickerMove 42s linear infinite",
            }}>
              {[...cricketTickerRows, ...cricketTickerRows].map((g, idx) => {
                const h = parseCricketSide(g.home);
                const a = parseCricketSide(g.away);
                return (
                  <span key={`${g.home}-${g.away}-${idx}`} style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#e2e8f0" }}>
                    <span style={{ color: "#38bdf8" }}>{cricketFlag(h.team)} {h.team}</span>
                    {h.innings && <span style={{ marginLeft: 6, color: "#a5f3fc" }}>[{h.innings}]</span>}
                    <span style={{ color: "#64748b", margin: "0 8px" }}>vs</span>
                    <span style={{ color: "#38bdf8" }}>{cricketFlag(a.team)} {a.team}</span>
                    {a.innings && <span style={{ marginLeft: 6, color: "#a5f3fc" }}>[{a.innings}]</span>}
                  </span>
                );
              })}
            </div>
          </div>
        </>
      )}

      {ll && ul ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 }}><Skel h={120} /></div>)}
        </div>
      ) : rows.length === 0 ? (
        <div style={{ color: "#334155", fontSize: 14, fontFamily: "'DM Mono', monospace", textAlign: "center" as const, marginTop: 60 }}>No matches found for {league}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: league === "CRICKET" ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
          {rows.map((g, i) => {
            const ss = statusStyle(g.status);
            if (g.league === "CRICKET") {
              const home = parseCricketSide(g.home);
              const away = parseCricketSide(g.away);
              return (
                <div key={i} style={{ background: "linear-gradient(135deg, rgba(14,36,50,0.55), rgba(16,24,39,0.7))", border: "1px solid rgba(56,189,248,0.25)", borderRadius: 14, padding: 22, boxShadow: "0 8px 24px rgba(14,165,233,0.12)", borderLeft: "4px solid #38bdf8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#7dd3fc", letterSpacing: 1.2 }}>CRICKET CENTER</span>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 12px rgba(239,68,68,0.8)" }} />
                    </div>
                    <span style={{ background: ss.bg, color: ss.color, borderRadius: 999, padding: "4px 10px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{ss.label}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 10 }}>
                    <div>
                      <div style={{ color: "#a5f3fc", fontSize: 11, fontFamily: "'DM Mono', monospace", textTransform: "uppercase" as const, letterSpacing: 1 }}>Team A</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f9ff", fontSize: 20, marginTop: 2 }}>{cricketFlag(home.team)} {home.team}</div>
                      {home.innings && (
                        <span style={{ display: "inline-block", marginTop: 8, background: "rgba(14,165,233,0.18)", border: "1px solid rgba(125,211,252,0.4)", color: "#bae6fd", borderRadius: 999, padding: "4px 10px", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                          {home.innings}
                        </span>
                      )}
                    </div>
                    <div style={{ color: "#38bdf8", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>vs</div>
                    <div style={{ textAlign: "right" as const }}>
                      <div style={{ color: "#a5f3fc", fontSize: 11, fontFamily: "'DM Mono', monospace", textTransform: "uppercase" as const, letterSpacing: 1 }}>Team B</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f9ff", fontSize: 20, marginTop: 2 }}>{cricketFlag(away.team)} {away.team}</div>
                      {away.innings && (
                        <span style={{ display: "inline-block", marginTop: 8, background: "rgba(14,165,233,0.18)", border: "1px solid rgba(125,211,252,0.4)", color: "#bae6fd", borderRadius: 999, padding: "4px 10px", fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                          {away.innings}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed rgba(125,211,252,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <span style={{ color: "#cbd5e1", fontSize: 12 }}>Latest update from live feed</span>
                    <span style={{ color: "#7dd3fc", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{formatUpdateTime(g.time)}</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24, borderTop: g.status === "LIVE" ? "2px solid #ef4444" : "2px solid transparent" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569", letterSpacing: 1 }}>{g.league}</span>
                  <span style={{ background: ss.bg, color: ss.color, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{ss.label}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12 }}>
                  <div style={{ textAlign: "center" as const }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", fontSize: 16 }}>{g.home}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 800, color: g.homeScore != null && g.awayScore != null && g.homeScore > g.awayScore ? "#22d3a5" : "#f0f4ff", marginTop: 8, lineHeight: 1 }}>
                      {g.homeScore ?? "–"}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" as const }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#334155" }}>VS</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569", marginTop: 4 }}>{g.time}</div>
                  </div>
                  <div style={{ textAlign: "center" as const }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", fontSize: 16 }}>{g.away}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 800, color: g.homeScore != null && g.awayScore != null && g.awayScore > g.homeScore ? "#22d3a5" : "#f0f4ff", marginTop: 8, lineHeight: 1 }}>
                      {g.awayScore ?? "–"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── CSE Page (Colombo Stock Exchange) ───────────────────────────────────────
const CSEMarket = () => {
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
    sortBy === "price" ? b.price - a.price :
    sortBy === "pct"   ? b.pct - a.pct :
    a.symbol.localeCompare(b.symbol)
  );

  const totalMcap  = cseStocks.reduce((s, q) => s + q.marketCap, 0);
  const gainers    = cseStocks.filter(s => s.pct >  0).length;
  const losers     = cseStocks.filter(s => s.pct <  0).length;

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
            <button key={s} onClick={() => setSortBy(s)} style={{ background: sortBy === s ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${sortBy === s ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"}`, color: sortBy === s ? "#10b981" : "#64748b", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>Sort: {s}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <KpiCard label="Listed"       value={cseStocks.length}            sub="Tracked CSE stocks"   color="#10b981" />
        <KpiCard label="Gainers"      value={gainers}                     sub={`${losers} losers today`} color={gainers >= losers ? "#22d3a5" : "#f87171"} />
        <KpiCard label="Total Mkt Cap" value={totalMcap > 0 ? fmtLKR(totalMcap) : "—"} sub="Combined (LKR)" color="#3b82f6" />
        <KpiCard label="Currency"     value="LKR · ₨"                    sub="Sri Lankan Rupee"     color="#f59e0b" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
        {/* Table */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 110px 90px 72px 80px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#334155", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
            <span>SYMBOL</span><span>NAME</span><span style={{ textAlign: "right" as const }}>PRICE (₨)</span><span style={{ textAlign: "right" as const }}>CHANGE</span><span style={{ textAlign: "right" as const }}>VOL</span><span style={{ textAlign: "right" as const }}>7D</span>
          </div>
          {isLoading ? Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 110px 90px 72px 80px", padding: "14px 20px", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
              <Skel w={44} /><Skel w={120} /><Skel w={70} /><Skel w={60} /><Skel w={44} /><Skel w={80} h={32} />
            </div>
          )) : sorted.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center" as const, color: "#334155", fontFamily: "'DM Mono', monospace", fontSize: 13, lineHeight: 1.8 }}>
              No CSE data returned.<br />
              <span style={{ fontSize: 11, color: "#1e293b" }}>Yahoo Finance may be temporarily unavailable or rate-limiting the backend.</span>
            </div>
          ) : sorted.map(s => (
            <div key={s.symbol} onClick={() => setSelected(s.symbol)} style={{ display: "grid", gridTemplateColumns: "80px 1fr 110px 90px 72px 80px", padding: "14px 20px", cursor: "pointer", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", background: selected === s.symbol ? "rgba(16,185,129,0.07)" : "transparent", borderLeft: selected === s.symbol ? "2px solid #10b981" : "2px solid transparent", transition: "all 0.15s" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#f0f4ff", fontSize: 14 }}>{s.symbol}</span>
              <span style={{ fontSize: 13, color: "#64748b" }}>{s.name}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", color: "#f0f4ff", fontSize: 13, textAlign: "right" as const }}>₨{s.price.toFixed(2)}</span>
              <span style={{ textAlign: "right" as const }}>
                <span style={{ background: pctBg(s.pct), color: pctColor(s.pct), borderRadius: 5, padding: "3px 8px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{s.pct > 0 ? "+" : ""}{s.pct.toFixed(2)}%</span>
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569", textAlign: "right" as const }}>{fmtVol(s.volume)}</span>
              <div style={{ display: "flex", justifyContent: "flex-end" as const }}><Spark data={sparklines[s.symbol] ?? []} positive={s.pct >= 0} /></div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
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
                {["1D", "1W", "1M", "3M", "1Y"].map(r => (
                  <button key={r} onClick={() => setRange(r)} style={{ flex: 1, background: range === r ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${range === r ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.07)"}`, color: range === r ? "#10b981" : "#475569", borderRadius: 8, padding: "7px 0", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{r}</button>
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
                ) : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160 }}><Skel w="100%" h={160} /></div>}
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
};

// ─── Portfolio Page ───────────────────────────────────────────────────────────
const Portfolio = ({ stocks, cryptos }: { stocks: StockQuote[]; cryptos: CryptoAsset[] }) => {
  const [holdings,   setHoldings]   = useState<Record<string, number>>({ AAPL: 10, BTC: 0.5, NVDA: 5 });
  const [newSymbol,  setNewSymbol]  = useState("");
  const [newQty,     setNewQty]     = useState("");

  const findPrice = (sym: string) => {
    const s = stocks.find(a => a.symbol === sym);
    if (s) return { price: s.price, pct: s.pct, change: s.change, name: STOCK_META[sym] ?? sym };
    const c = cryptos.find(a => a.symbol === sym);
    if (c) return { price: c.price, pct: c.pct, change: c.change, name: c.name };
    return null;
  };

  const portfolioItems = Object.entries(holdings).map(([sym, qty]) => {
    const asset = findPrice(sym);
    if (!asset) return null;
    const value  = asset.price * qty;
    const cost   = asset.price * qty * (1 - asset.pct / 100 * 5);
    const pnl    = value - cost;
    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
    return { sym, qty, asset, value, pnl, pnlPct };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  const totalValue = portfolioItems.reduce((s, i) => s + i.value, 0);
  const totalPnL   = portfolioItems.reduce((s, i) => s + i.pnl, 0);

  const addHolding = () => {
    const sym = newSymbol.toUpperCase().trim();
    const qty = parseFloat(newQty);
    if (sym && qty > 0 && findPrice(sym)) {
      setHoldings(h => ({ ...h, [sym]: qty }));
      setNewSymbol(""); setNewQty("");
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
        <KpiCard label="Total Value" value={fmt(totalValue)} sub="Across all holdings" color="#22d3a5" />
        <KpiCard label="Total P&L"   value={`${totalPnL >= 0 ? "+" : ""}${fmt(totalPnL)}`} sub="Unrealized gain/loss" color={pctColor(totalPnL)} />
        <KpiCard label="Holdings"    value={portfolioItems.length} sub="Active positions" color="#3b82f6" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 70px 1fr 1fr 1fr 60px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#334155", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
              <span>ASSET</span><span>QTY</span><span style={{ textAlign: "right" as const }}>PRICE</span><span style={{ textAlign: "right" as const }}>VALUE</span><span style={{ textAlign: "right" as const }}>P&L</span><span />
            </div>
            {portfolioItems.length === 0
              ? <div style={{ padding: 20, color: "#334155", fontFamily: "'DM Mono', monospace", fontSize: 13, textAlign: "center" as const }}>{stocks.length === 0 ? "Loading live prices…" : "No holdings. Add positions below."}</div>
              : portfolioItems.map(item => (
                <div key={item.sym} style={{ display: "grid", gridTemplateColumns: "80px 70px 1fr 1fr 1fr 60px", padding: "14px 20px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#f0f4ff", fontSize: 14 }}>{item.sym}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", color: "#64748b", fontSize: 13 }}>{item.qty}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", color: "#94a3b8", fontSize: 13, textAlign: "right" as const }}>{item.asset.price > 1 ? fmt(item.asset.price) : `$${item.asset.price.toFixed(4)}`}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", color: "#f0f4ff", fontSize: 13, textAlign: "right" as const }}>{fmt(item.value)}</span>
                  <span style={{ textAlign: "right" as const }}>
                    <span style={{ background: pctBg(item.pnl), color: pctColor(item.pnl), borderRadius: 5, padding: "3px 8px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{item.pnl >= 0 ? "+" : ""}{fmt(item.pnl)}</span>
                  </span>
                  <button onClick={() => setHoldings(h => { const n = { ...h }; delete n[item.sym]; return n; })} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 14, textAlign: "right" as const }}>✕</button>
                </div>
              ))}
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", marginBottom: 14, fontSize: 14 }}>Add Position</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={newSymbol} onChange={e => setNewSymbol(e.target.value)} onKeyDown={e => e.key === "Enter" && addHolding()} placeholder="Symbol (e.g. AAPL)" style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontFamily: "'DM Mono', monospace", fontSize: 13, outline: "none" }} />
              <input value={newQty}    onChange={e => setNewQty(e.target.value)}    onKeyDown={e => e.key === "Enter" && addHolding()} placeholder="Qty" type="number" min="0" style={{ width: 80, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontFamily: "'DM Mono', monospace", fontSize: 13, outline: "none" }} />
              <button onClick={addHolding} style={{ background: "rgba(34,211,165,0.15)", border: "1px solid rgba(34,211,165,0.3)", color: "#22d3a5", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>Add</button>
            </div>
            <div style={{ fontSize: 11, color: "#334155", marginTop: 8, fontFamily: "'DM Mono', monospace" }}>Available: {availableSymbols.join(", ")}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page,        setPage]        = useState("home");
  const [dark,        setDark]        = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [watchlist,   setWatchlist]   = useState<string[]>(WATCHLIST_DEFAULT);

  // Pre-fetch both datasets at root level so data is shared across all pages via the React Query cache
  const { data: stocks  = [] } = useQuery<StockQuote[]>({
    queryKey: ["stocks", "batch"],
    queryFn:  () => apiFetch(`/api/stocks/batch?symbols=${STOCK_SYMBOLS}`),
    refetchInterval: 30_000, staleTime: 25_000,
  });
  const { data: cryptos = [] } = useQuery<CryptoAsset[]>({
    queryKey: ["crypto", "prices"],
    queryFn:  () => apiFetch("/api/crypto/prices"),
    refetchInterval: 30_000, staleTime: 25_000,
  });

  const ticker = [
    ...stocks.slice(0, 3).map(s => ({ symbol: s.symbol, pct: s.pct })),
    ...cryptos.slice(0, 3).map(c => ({ symbol: c.symbol, pct: c.pct })),
  ];

  const bg = dark ? "#080c14" : "#f0f4ff";
  const fg = dark ? "#f0f4ff" : "#0f172a";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: fg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
        button { transition: all 0.15s ease; } button:hover { opacity: 0.85; }
        input::placeholder { color: #334155; }
      `}</style>

      <Navbar page={page} setPage={setPage} dark={dark} setDark={setDark} ticker={ticker} />

      <button onClick={() => setSidebarOpen(true)} style={{ position: "fixed", bottom: 28, right: 28, zIndex: 30, background: "linear-gradient(135deg,#22d3a5,#3b82f6)", border: "none", borderRadius: "50%", width: 52, height: 52, cursor: "pointer", fontSize: 20, color: "#080c14", boxShadow: "0 4px 20px rgba(34,211,165,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>☆</button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} watchlist={watchlist} setWatchlist={setWatchlist} stocks={stocks} cryptos={cryptos} />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {page === "home"      && <Home      setPage={setPage} watchlist={watchlist} />}
        {page === "crypto"    && <Crypto    watchlist={watchlist} setWatchlist={setWatchlist} />}
        {page === "sports"    && <Sports />}
        {page === "cse"       && <CSEMarket />}
        {page === "portfolio" && <Portfolio stocks={stocks} cryptos={cryptos} />}
      </main>
    </div>
  );
}

