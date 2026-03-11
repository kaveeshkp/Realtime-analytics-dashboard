import { useState, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const generateSparkline = (base: number, points = 20) =>
  Array.from({ length: points }, (_, i) => ({
    t: i,
    v: base + (Math.random() - 0.48) * base * 0.04 * (i + 1),
  }));

const STOCKS_DATA = [
  { symbol: "AAPL", name: "Apple Inc.", price: 189.3, change: 2.14, pct: 1.14, volume: "54.2M", cap: "2.94T", sparkline: generateSparkline(189) },
  { symbol: "MSFT", name: "Microsoft", price: 415.5, change: -1.8, pct: -0.43, volume: "18.7M", cap: "3.08T", sparkline: generateSparkline(415) },
  { symbol: "GOOGL", name: "Alphabet", price: 175.2, change: 3.42, pct: 1.99, volume: "22.1M", cap: "2.18T", sparkline: generateSparkline(175) },
  { symbol: "TSLA", name: "Tesla", price: 248.5, change: -6.3, pct: -2.47, volume: "89.4M", cap: "792B", sparkline: generateSparkline(248) },
  { symbol: "NVDA", name: "NVIDIA", price: 875.4, change: 18.6, pct: 2.17, volume: "41.2M", cap: "2.15T", sparkline: generateSparkline(875) },
  { symbol: "AMZN", name: "Amazon", price: 193.6, change: 1.25, pct: 0.65, volume: "31.8M", cap: "2.01T", sparkline: generateSparkline(193) },
];

const CRYPTO_DATA = [
  { symbol: "BTC", name: "Bitcoin", price: 67420, change: 1843, pct: 2.81, cap: "1.32T", vol: "38.4B", sparkline: generateSparkline(67000) },
  { symbol: "ETH", name: "Ethereum", price: 3542, change: -89, pct: -2.45, cap: "425B", vol: "18.2B", sparkline: generateSparkline(3542) },
  { symbol: "BNB", name: "BNB", price: 582, change: 12.4, pct: 2.18, cap: "84.2B", vol: "2.1B", sparkline: generateSparkline(582) },
  { symbol: "SOL", name: "Solana", price: 178.3, change: 8.7, pct: 5.13, cap: "82.4B", vol: "4.8B", sparkline: generateSparkline(178) },
  { symbol: "ADA", name: "Cardano", price: 0.458, change: -0.012, pct: -2.55, cap: "16.2B", vol: "412M", sparkline: generateSparkline(0.458) },
  { symbol: "XRP", name: "XRP", price: 0.618, change: 0.023, pct: 3.86, cap: "34.1B", vol: "1.9B", sparkline: generateSparkline(0.618) },
];

const SPORTS_DATA = [
  { league: "NBA", home: "Lakers", away: "Celtics", homeScore: 108, awayScore: 112, status: "LIVE", time: "Q4 2:34" },
  { league: "NBA", home: "Warriors", away: "Bulls", homeScore: 94, awayScore: 87, status: "LIVE", time: "Q3 5:12" },
  { league: "NFL", home: "Chiefs", away: "Eagles", homeScore: 24, awayScore: 17, status: "FT", time: "Final" },
  { league: "EPL", home: "Arsenal", away: "Chelsea", homeScore: 2, awayScore: 1, status: "FT", time: "90'" },
  { league: "NFL", home: "Cowboys", away: "Giants", homeScore: 0, awayScore: 0, status: "UP", time: "Sun 18:30" },
  { league: "EPL", home: "Liverpool", away: "Man City", homeScore: 0, awayScore: 0, status: "UP", time: "Sat 12:30" },
];

const generateChartData = (base: number, days = 30) =>
  Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.max(base * 0.85, base + (Math.random() - 0.45) * base * 0.03 * Math.sqrt(i + 1)),
    };
  });

const WATCHLIST_DEFAULT = ["AAPL", "BTC", "NVDA"];

// ─── Utility ──────────────────────────────────────────────────────────────────
const fmt = (n: number, decimals = 2) =>
  n >= 1e12 ? `$${(n / 1e12).toFixed(1)}T` :
  n >= 1e9  ? `$${(n / 1e9).toFixed(1)}B` :
  n >= 1e6  ? `$${(n / 1e6).toFixed(1)}M` :
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

const pctColor = (v: number) => (v >= 0 ? "#22d3a5" : "#f87171");
const pctBg   = (v: number) => (v >= 0 ? "rgba(34,211,165,0.1)" : "rgba(248,113,113,0.1)");

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
const Spark = ({ data, positive }: { data: { t: number; v: number }[]; positive: boolean }) => (
  <ResponsiveContainer width={80} height={32}>
    <LineChart data={data}>
      <Line type="monotone" dataKey="v" stroke={positive ? "#22d3a5" : "#f87171"} strokeWidth={1.5} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, color = "#22d3a5" }: { label: string; value: string | number; sub?: string; color?: string }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "20px 22px",
    backdropFilter: "blur(10px)",
  }}>
    <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>{sub}</div>}
  </div>
);

// ─── Nav ──────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home",      label: "Overview",  icon: "⬡" },
  { id: "stocks",    label: "Stocks",    icon: "◈" },
  { id: "crypto",    label: "Crypto",    icon: "◉" },
  { id: "sports",    label: "Sports",    icon: "◎" },
  { id: "portfolio", label: "Portfolio", icon: "◇" },
];

const Navbar = ({ page, setPage, dark, setDark }: {
  page: string;
  setPage: (p: string) => void;
  dark: boolean;
  setDark: (fn: (d: boolean) => boolean) => void;
}) => {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 3000); return () => clearInterval(t); }, []);

  const tickerItems = [...STOCKS_DATA.slice(0, 3), ...CRYPTO_DATA.slice(0, 3)];
  const shown = tickerItems[tick % tickerItems.length];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(8,12,20,0.92)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "0 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 60,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#22d3a5,#3b82f6)", display: "grid", placeItems: "center", fontSize: 14 }}>◈</div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#f0f4ff", letterSpacing: -0.5 }}>DASHFLOW</span>
      </div>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: 4 }}>
        {NAV_ITEMS.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            background: page === n.id ? "rgba(34,211,165,0.12)" : "transparent",
            border: page === n.id ? "1px solid rgba(34,211,165,0.3)" : "1px solid transparent",
            color: page === n.id ? "#22d3a5" : "#64748b",
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            fontSize: 13, fontFamily: "'DM Mono', monospace",
            transition: "all 0.2s",
          }}>
            <span style={{ marginRight: 5 }}>{n.icon}</span>{n.label}
          </button>
        ))}
      </div>

      {/* Live ticker + theme */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#94a3b8" }}>
          <span style={{ color: "#f0f4ff", fontWeight: 600 }}>{shown?.symbol}</span>
          {" "}<span style={{ color: pctColor(shown?.pct) }}>{shown?.pct > 0 ? "+" : ""}{shown?.pct?.toFixed(2)}%</span>
        </div>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />
        <button onClick={() => setDark(d => !d)} style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#94a3b8", fontSize: 14,
        }}>{dark ? "☀" : "☾"}</button>
      </div>
    </nav>
  );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose, watchlist, setWatchlist }: {
  isOpen: boolean;
  onClose: () => void;
  watchlist: string[];
  setWatchlist: (fn: (w: string[]) => string[]) => void;
}) => {
  const allAssets = [...STOCKS_DATA, ...CRYPTO_DATA];
  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, backdropFilter: "blur(2px)" }} />}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0, width: 300,
        background: "rgba(10,14,24,0.98)", backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 50, padding: 24, overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", fontSize: 16 }}>Watchlist</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        {watchlist.map(sym => {
          const asset = allAssets.find(a => a.symbol === sym);
          if (!asset) return null;
          return (
            <div key={sym} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: "#f0f4ff", fontSize: 14 }}>{sym}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{asset.name}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", color: "#f0f4ff", fontSize: 13 }}>{fmt(asset.price)}</div>
                <div style={{ fontSize: 11, color: pctColor(asset.pct), marginTop: 2 }}>{asset.pct > 0 ? "+" : ""}{asset.pct.toFixed(2)}%</div>
              </div>
              <button onClick={() => setWatchlist(w => w.filter(s => s !== sym))} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 14, marginLeft: 10 }}>✕</button>
            </div>
          );
        })}
        {watchlist.length === 0 && <div style={{ color: "#334155", fontSize: 13, textAlign: "center", marginTop: 40 }}>No assets in watchlist.<br/>Add from Stocks or Crypto tab.</div>}
      </div>
    </>
  );
};

// ─── Home Page ────────────────────────────────────────────────────────────────
const Home = ({ setPage, watchlist }: { setPage: (p: string) => void; watchlist: string[] }) => {
  const topGainer = [...STOCKS_DATA, ...CRYPTO_DATA].sort((a, b) => b.pct - a.pct)[0];
  const totalAssets = STOCKS_DATA.length + CRYPTO_DATA.length;
  const liveGames = SPORTS_DATA.filter(s => s.status === "LIVE").length;
  const chartData = generateChartData(67000, 30);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: "#f0f4ff", margin: 0, letterSpacing: -1 }}>
          Market Overview
        </h1>
        <p style={{ color: "#475569", fontSize: 14, marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
          Live data · Updated just now
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <KpiCard label="Tracked Assets" value={totalAssets} sub="6 stocks · 6 crypto" color="#22d3a5" />
        <KpiCard label="Top Gainer" value={`+${topGainer.pct.toFixed(2)}%`} sub={topGainer.symbol} color="#22d3a5" />
        <KpiCard label="Live Games" value={liveGames} sub="NBA in progress" color="#3b82f6" />
        <KpiCard label="BTC Dominance" value="51.4%" sub="Market cap share" color="#f59e0b" />
      </div>

      {/* Chart + Quick Access */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", fontSize: 16 }}>Bitcoin · 30 Day</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, color: "#22d3a5", marginTop: 2 }}>$67,420</div>
            </div>
            <span style={{ background: "rgba(34,211,165,0.1)", color: "#22d3a5", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>+2.81%</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
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
        </div>

        {/* Quick Nav Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { id: "stocks", label: "Stock Market", sub: "6 assets tracked", icon: "◈", color: "#3b82f6", val: "+1.14%" },
            { id: "crypto", label: "Crypto", sub: "Top 6 by market cap", icon: "◉", color: "#f59e0b", val: "+2.81%" },
            { id: "sports", label: "Sports", sub: `${liveGames} games live`, icon: "◎", color: "#ec4899", val: "LIVE" },
            { id: "portfolio", label: "Portfolio", sub: `${watchlist.length} assets`, icon: "◇", color: "#22d3a5", val: "Track" },
          ].map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: "14px 18px", cursor: "pointer", textAlign: "left",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = `${item.color}44`; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
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

      {/* Mini tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top movers */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", marginBottom: 16, fontSize: 14 }}>Top Movers</div>
          {[...STOCKS_DATA, ...CRYPTO_DATA].sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct)).slice(0, 5).map(a => (
            <div key={a.symbol} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", color: "#94a3b8", fontSize: 13 }}>{a.symbol}</span>
              <span style={{ background: pctBg(a.pct), color: pctColor(a.pct), borderRadius: 4, padding: "2px 8px", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{a.pct > 0 ? "+" : ""}{a.pct.toFixed(2)}%</span>
            </div>
          ))}
        </div>
        {/* Live scores */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", marginBottom: 16, fontSize: 14 }}>Live Scores</div>
          {SPORTS_DATA.filter(s => s.status === "LIVE").map((g, i) => (
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

// ─── Stocks Page ──────────────────────────────────────────────────────────────
const Stocks = ({ watchlist, setWatchlist }: {
  watchlist: string[];
  setWatchlist: (fn: (w: string[]) => string[]) => void;
}) => {
  const [selected, setSelected] = useState("AAPL");
  const [range, setRange] = useState("1M");
  const [sortBy, setSortBy] = useState("symbol");
  const selectedStock = STOCKS_DATA.find(s => s.symbol === selected);
  const chartData = generateChartData(selectedStock?.price || 100, range === "1D" ? 24 : range === "1W" ? 7 : range === "1M" ? 30 : 365);
  const inWatchlist = watchlist.includes(selected);

  const sorted = [...STOCKS_DATA].sort((a, b) => {
    if (sortBy === "price") return b.price - a.price;
    if (sortBy === "pct") return b.pct - a.pct;
    return a.symbol.localeCompare(b.symbol);
  });

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#f0f4ff", margin: 0 }}>Stock Market</h1>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>NYSE · NASDAQ · Real-time data</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["symbol", "price", "pct"].map(s => (
            <button key={s} onClick={() => setSortBy(s)} style={{
              background: sortBy === s ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${sortBy === s ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: sortBy === s ? "#3b82f6" : "#64748b", borderRadius: 8,
              padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace",
            }}>Sort: {s}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
        {/* Table */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 110px 90px 80px 80px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#334155", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
            <span>SYMBOL</span><span>NAME</span><span style={{ textAlign: "right" }}>PRICE</span><span style={{ textAlign: "right" }}>CHANGE</span><span style={{ textAlign: "right" }}>VOLUME</span><span style={{ textAlign: "right" }}>7D</span>
          </div>
          {sorted.map(s => (
            <div key={s.symbol} onClick={() => setSelected(s.symbol)} style={{
              display: "grid", gridTemplateColumns: "80px 1fr 110px 90px 80px 80px",
              padding: "14px 20px", cursor: "pointer", alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              background: selected === s.symbol ? "rgba(59,130,246,0.07)" : "transparent",
              borderLeft: selected === s.symbol ? "2px solid #3b82f6" : "2px solid transparent",
              transition: "all 0.15s",
            }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#f0f4ff", fontSize: 14 }}>{s.symbol}</span>
              <span style={{ fontSize: 13, color: "#64748b" }}>{s.name}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", color: "#f0f4ff", fontSize: 13, textAlign: "right" }}>{fmt(s.price)}</span>
              <span style={{ textAlign: "right" }}>
                <span style={{ background: pctBg(s.pct), color: pctColor(s.pct), borderRadius: 5, padding: "3px 8px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                  {s.pct > 0 ? "+" : ""}{s.pct.toFixed(2)}%
                </span>
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569", textAlign: "right" }}>{s.volume}</span>
              <div style={{ display: "flex", justifyContent: "flex-end" }}><Spark data={s.sparkline} positive={s.pct >= 0} /></div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#f0f4ff", fontSize: 22 }}>{selectedStock?.symbol}</div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{selectedStock?.name}</div>
              </div>
              <button onClick={() => setWatchlist(w => inWatchlist ? w.filter(s => s !== selected) : [...w, selected])} style={{
                background: inWatchlist ? "rgba(34,211,165,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${inWatchlist ? "rgba(34,211,165,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: inWatchlist ? "#22d3a5" : "#64748b", borderRadius: 8,
                padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace",
              }}>{inWatchlist ? "★ Watching" : "☆ Watch"}</button>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, color: "#f0f4ff", fontWeight: 700 }}>{fmt(selectedStock?.price || 0)}</div>
            <div style={{ fontSize: 13, color: pctColor(selectedStock?.pct || 0), marginTop: 4 }}>
              {(selectedStock?.pct ?? 0) >= 0 ? "▲" : "▼"} {Math.abs(selectedStock?.change || 0).toFixed(2)} ({(selectedStock?.pct ?? 0) > 0 ? "+" : ""}{selectedStock?.pct?.toFixed(2)}%) today
            </div>
          </div>

          {/* Range Selector */}
          <div style={{ display: "flex", gap: 6 }}>
            {["1D","1W","1M","1Y"].map(r => (
              <button key={r} onClick={() => setRange(r)} style={{
                flex: 1, background: range === r ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${range === r ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.07)"}`,
                color: range === r ? "#3b82f6" : "#475569", borderRadius: 8,
                padding: "7px 0", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace",
              }}>{r}</button>
            ))}
          </div>

          {/* Chart */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "'DM Mono', monospace", fontSize: 11 }} itemStyle={{ color: "#3b82f6" }} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#sg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stats */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
            {[["Market Cap", selectedStock?.cap], ["Volume", selectedStock?.volume], ["52W High", fmt((selectedStock?.price || 0) * 1.28)], ["52W Low", fmt((selectedStock?.price || 0) * 0.72)]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 12, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{l}</span>
                <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{v}</span>
              </div>
            ))}
          </div>
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
  const [selected, setSelected] = useState("BTC");
  const selectedCoin = CRYPTO_DATA.find(c => c.symbol === selected);
  const chartData = generateChartData(selectedCoin?.price || 1, 30);
  const inWatchlist = watchlist.includes(selected);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#f0f4ff", margin: 0 }}>Cryptocurrency</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>Top 6 by market cap · Live prices</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        <KpiCard label="Total Market Cap" value="$2.17T" sub="Top 6 coins" color="#f59e0b" />
        <KpiCard label="24h Volume" value="$65.4B" sub="Across all pairs" color="#3b82f6" />
        <KpiCard label="BTC Dominance" value="51.4%" sub="Of total cap" color="#22d3a5" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 120px 100px 100px 80px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#334155", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
            <span>#</span><span>NAME</span><span style={{ textAlign: "right" }}>PRICE</span><span style={{ textAlign: "right" }}>24H</span><span style={{ textAlign: "right" }}>MARKET CAP</span><span style={{ textAlign: "right" }}>7D</span>
          </div>
          {CRYPTO_DATA.map((c, i) => (
            <div key={c.symbol} onClick={() => setSelected(c.symbol)} style={{
              display: "grid", gridTemplateColumns: "60px 1fr 120px 100px 100px 80px",
              padding: "14px 20px", cursor: "pointer", alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              background: selected === c.symbol ? "rgba(245,158,11,0.06)" : "transparent",
              borderLeft: selected === c.symbol ? "2px solid #f59e0b" : "2px solid transparent",
              transition: "all 0.15s",
            }}>
              <span style={{ fontFamily: "'DM Mono', monospace", color: "#334155", fontSize: 13 }}>{i + 1}</span>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#f0f4ff", fontSize: 14 }}>{c.symbol}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{c.name}</div>
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", color: "#f0f4ff", fontSize: 13, textAlign: "right" }}>
                {c.price > 1 ? fmt(c.price) : `$${c.price.toFixed(4)}`}
              </span>
              <span style={{ textAlign: "right" }}>
                <span style={{ background: pctBg(c.pct), color: pctColor(c.pct), borderRadius: 5, padding: "3px 8px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                  {c.pct > 0 ? "+" : ""}{c.pct.toFixed(2)}%
                </span>
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569", textAlign: "right" }}>{c.cap}</span>
              <div style={{ display: "flex", justifyContent: "flex-end" }}><Spark data={c.sparkline} positive={c.pct >= 0} /></div>
            </div>
          ))}
        </div>

        {/* Crypto Detail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#f59e0b", fontSize: 22 }}>{selectedCoin?.symbol}</div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{selectedCoin?.name}</div>
              </div>
              <button onClick={() => setWatchlist(w => inWatchlist ? w.filter(s => s !== selected) : [...w, selected])} style={{
                background: inWatchlist ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${inWatchlist ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.1)"}`,
                color: inWatchlist ? "#f59e0b" : "#64748b", borderRadius: 8,
                padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace",
              }}>{inWatchlist ? "★ Watching" : "☆ Watch"}</button>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, color: "#f0f4ff", fontWeight: 700 }}>
              {(selectedCoin?.price ?? 0) > 1 ? fmt(selectedCoin?.price || 0) : `$${selectedCoin?.price?.toFixed(4)}`}
            </div>
            <div style={{ fontSize: 13, color: pctColor(selectedCoin?.pct || 0), marginTop: 4 }}>
              {(selectedCoin?.pct ?? 0) >= 0 ? "▲" : "▼"} {Math.abs(selectedCoin?.change || 0).toFixed((selectedCoin?.price ?? 1) < 1 ? 4 : 2)} today
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
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
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
            {[["Market Cap", selectedCoin?.cap], ["24h Volume", selectedCoin?.vol], ["24h Change", `${(selectedCoin?.pct ?? 0) > 0 ? "+" : ""}${selectedCoin?.pct?.toFixed(2)}%`], ["Rank", `#${CRYPTO_DATA.findIndex(c => c.symbol === selected) + 1}`]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 12, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{l}</span>
                <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sports Page ──────────────────────────────────────────────────────────────
const Sports = () => {
  const [league, setLeague] = useState("All");
  const leagues = ["All", "NBA", "NFL", "EPL"];
  const filtered = league === "All" ? SPORTS_DATA : SPORTS_DATA.filter(g => g.league === league);

  const statusStyle = (s: string) => ({
    LIVE: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "● LIVE" },
    FT:   { bg: "rgba(100,116,139,0.15)", color: "#64748b", label: "✓ FT" },
    UP:   { bg: "rgba(59,130,246,0.15)", color: "#3b82f6", label: "○ UP" },
  }[s] || { bg: "", color: "", label: "" });

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#f0f4ff", margin: 0 }}>Live Sports</h1>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>NBA · NFL · EPL · Auto-refreshes every 60s</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {leagues.map(l => (
            <button key={l} onClick={() => setLeague(l)} style={{
              background: league === l ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${league === l ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.08)"}`,
              color: league === l ? "#ec4899" : "#64748b", borderRadius: 8,
              padding: "6px 16px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace",
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {filtered.map((g, i) => {
          const ss = statusStyle(g.status);
          return (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: 24,
              borderTop: g.status === "LIVE" ? "2px solid #ef4444" : "2px solid transparent",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569", letterSpacing: 1 }}>{g.league}</span>
                <span style={{ background: ss.bg, color: ss.color, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{ss.label}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", fontSize: 16 }}>{g.home}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 800, color: g.homeScore > g.awayScore ? "#22d3a5" : "#f0f4ff", marginTop: 8, lineHeight: 1 }}>{g.status === "UP" ? "–" : g.homeScore}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#334155" }}>VS</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569", marginTop: 4 }}>{g.time}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", fontSize: 16 }}>{g.away}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 800, color: g.awayScore > g.homeScore ? "#22d3a5" : "#f0f4ff", marginTop: 8, lineHeight: 1 }}>{g.status === "UP" ? "–" : g.awayScore}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Portfolio Page ───────────────────────────────────────────────────────────
const Portfolio = () => {
  const [holdings, setHoldings] = useState<Record<string, number>>({ AAPL: 10, BTC: 0.5, NVDA: 5 });
  const [newSymbol, setNewSymbol] = useState("");
  const [newQty, setNewQty] = useState("");
  const allAssets = [...STOCKS_DATA, ...CRYPTO_DATA];

  const portfolioItems = Object.entries(holdings).map(([sym, qty]) => {
    const asset = allAssets.find(a => a.symbol === sym);
    if (!asset) return null;
    const value = asset.price * qty;
    const cost = asset.price * qty * (1 - asset.pct / 100 * 5);
    const pnl = value - cost;
    const pnlPct = (pnl / cost) * 100;
    return { sym, qty, asset, value, pnl, pnlPct };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  const totalValue = portfolioItems.reduce((s, i) => s + i.value, 0);
  const totalPnL = portfolioItems.reduce((s, i) => s + i.pnl, 0);

  const addHolding = () => {
    const sym = newSymbol.toUpperCase();
    const qty = parseFloat(newQty);
    if (sym && qty > 0 && allAssets.find(a => a.symbol === sym)) {
      setHoldings(h => ({ ...h, [sym]: qty }));
      setNewSymbol(""); setNewQty("");
    }
  };

  const barData = portfolioItems.map(i => ({ name: i.sym, value: Math.round(i.value) }));

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#f0f4ff", margin: 0 }}>Portfolio</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>Simulated holdings · Live P&L</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        <KpiCard label="Total Value" value={fmt(totalValue)} sub="Across all holdings" color="#22d3a5" />
        <KpiCard label="Total P&L" value={`${totalPnL >= 0 ? "+" : ""}${fmt(totalPnL)}`} sub="Unrealized gain/loss" color={pctColor(totalPnL)} />
        <KpiCard label="Holdings" value={portfolioItems.length} sub="Active positions" color="#3b82f6" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Holdings Table */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "80px 70px 1fr 1fr 1fr 60px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#334155", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
              <span>ASSET</span><span>QTY</span><span style={{ textAlign: "right" }}>PRICE</span><span style={{ textAlign: "right" }}>VALUE</span><span style={{ textAlign: "right" }}>P&L</span><span />
            </div>
            {portfolioItems.map(item => (
              <div key={item.sym} style={{ display: "grid", gridTemplateColumns: "80px 70px 1fr 1fr 1fr 60px", padding: "14px 20px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#f0f4ff", fontSize: 14 }}>{item.sym}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", color: "#64748b", fontSize: 13 }}>{item.qty}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", color: "#94a3b8", fontSize: 13, textAlign: "right" }}>{item.asset.price > 1 ? fmt(item.asset.price) : `$${item.asset.price.toFixed(4)}`}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", color: "#f0f4ff", fontSize: 13, textAlign: "right" }}>{fmt(item.value)}</span>
                <span style={{ textAlign: "right" }}>
                  <span style={{ background: pctBg(item.pnl), color: pctColor(item.pnl), borderRadius: 5, padding: "3px 8px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                    {item.pnl >= 0 ? "+" : ""}{fmt(item.pnl)}
                  </span>
                </span>
                <button onClick={() => setHoldings(h => { const n = { ...h }; delete n[item.sym]; return n; })} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 14, textAlign: "right" }}>✕</button>
              </div>
            ))}
          </div>

          {/* Add Holding */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", marginBottom: 14, fontSize: 14 }}>Add Position</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={newSymbol} onChange={e => setNewSymbol(e.target.value)} placeholder="Symbol (e.g. AAPL)" style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontFamily: "'DM Mono', monospace", fontSize: 13, outline: "none" }} />
              <input value={newQty} onChange={e => setNewQty(e.target.value)} placeholder="Qty" type="number" style={{ width: 80, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 14px", color: "#f0f4ff", fontFamily: "'DM Mono', monospace", fontSize: 13, outline: "none" }} />
              <button onClick={addHolding} style={{ background: "rgba(34,211,165,0.15)", border: "1px solid rgba(34,211,165,0.3)", color: "#22d3a5", borderRadius: 8, padding: "9px 20px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>Add</button>
            </div>
            <div style={{ fontSize: 11, color: "#334155", marginTop: 8, fontFamily: "'DM Mono', monospace" }}>Available: {[...STOCKS_DATA, ...CRYPTO_DATA].map(a => a.symbol).join(", ")}</div>
          </div>
        </div>

        {/* Bar chart */}
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

          {/* Allocation % */}
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
  const [page, setPage] = useState("home");
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [watchlist, setWatchlist] = useState(WATCHLIST_DEFAULT);

  const bg = dark ? "#080c14" : "#f0f4ff";
  const fg = dark ? "#f0f4ff" : "#0f172a";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: fg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        button { transition: all 0.15s ease; }
        button:hover { opacity: 0.85; }
        input::placeholder { color: #334155; }
      `}</style>

      <Navbar page={page} setPage={setPage} dark={dark} setDark={setDark} />

      {/* Watchlist toggle button */}
      <button onClick={() => setSidebarOpen(true)} style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 30,
        background: "linear-gradient(135deg,#22d3a5,#3b82f6)",
        border: "none", borderRadius: "50%", width: 52, height: 52,
        cursor: "pointer", fontSize: 20, color: "#080c14",
        boxShadow: "0 4px 20px rgba(34,211,165,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>☆</button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} watchlist={watchlist} setWatchlist={setWatchlist} />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
        {page === "home"      && <Home      setPage={setPage} watchlist={watchlist} />}
        {page === "stocks"    && <Stocks    watchlist={watchlist} setWatchlist={setWatchlist} />}
        {page === "crypto"    && <Crypto    watchlist={watchlist} setWatchlist={setWatchlist} />}
        {page === "sports"    && <Sports />}
        {page === "portfolio" && <Portfolio />}
      </main>
    </div>
  );
}
