import { useEffect, useState } from "react";
import { Icon } from "../ui/Icon";

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

interface TickerSnapshot {
  symbol: string;
  pct: number;
}

interface NavbarProps {
  page: string;
  onNavigate: (id: string) => void;
  navItems: NavItem[];
  ticker?: TickerSnapshot[];
  dark: boolean;
  onOpenWatchlist?: () => void;
}

const pctColor = (v: number) => (v >= 0 ? "#22d3a5" : "#f87171");

export function Navbar({
  page,
  onNavigate,
  navItems,
  ticker = [],
  dark,
  onOpenWatchlist,
}: NavbarProps) {
  const [tickIdx, setTickIdx] = useState(0);
  const navBg = dark ? "rgba(8,12,20,0.92)" : "rgba(255,255,255,0.95)";
  const navBorder = dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #dbe3ef";
  const logoText = dark ? "#f0f4ff" : "#0f172a";
  const navInactive = dark ? "#94a3b8" : "#475569";
  const tickerText = dark ? "#94a3b8" : "#475569";
  const tickerSymbol = dark ? "#f0f4ff" : "#0f172a";
  const divider = dark ? "rgba(255,255,255,0.08)" : "#dbe3ef";
  const iconBtnBg = dark ? "rgba(255,255,255,0.05)" : "#ffffff";
  const iconBtnBorder = dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1";

  // Depend only on ticker.length — ticker array reference changes every App render
  // (stocks/cryptos are new arrays on each fetch), so using the full array as a dep
  // would teardown/restart the interval on every state change in App.
  const tickerLen = ticker.length;
  useEffect(() => {
    if (tickerLen === 0) return;
    setTickIdx(i => i % tickerLen); // clamp index if length shrinks
    const t = setInterval(() => setTickIdx(i => (i + 1) % tickerLen), 3000);
    return () => clearInterval(t);
  }, [tickerLen]);

  const shown = ticker[tickIdx];

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: navBg,
        backdropFilter: "blur(20px)",
        borderBottom: navBorder,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 60,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "linear-gradient(135deg,#22d3a5,#3b82f6)",
            display: "grid",
            placeItems: "center",
            fontSize: 14,
          }}
        >
          ◈
        </div>
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 16,
            color: logoText,
            letterSpacing: -0.5,
          }}
        >
          DASHFLOW
        </span>
      </div>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: 4 }}>
        {navItems.map((n) => (
          <button
            key={n.id}
            onClick={() => onNavigate(n.id)}
            style={{
              background:
                page === n.id ? "rgba(34,211,165,0.12)" : "transparent",
              border:
                page === n.id
                  ? "1px solid rgba(34,211,165,0.3)"
                  : "1px solid transparent",
              color: page === n.id ? "#22d3a5" : navInactive,
              borderRadius: 8,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "'DM Mono', monospace",
              transition: "all 0.2s",
            }}
          >
            <span style={{ marginRight: 5, display: "flex", alignItems: "center" }}>
              <Icon
                name={n.icon}
                size={16}
                color={page === n.id ? "primary" : "muted"}
              />
            </span>
            {n.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {shown && (
          <div
            style={{
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              color: tickerText,
            }}
          >
            <span style={{ color: tickerSymbol, fontWeight: 600 }}>
              {shown.symbol}
            </span>{" "}
            <span style={{ color: pctColor(shown.pct) }}>
              {shown.pct >= 0 ? "+" : ""}
              {shown.pct.toFixed(2)}%
            </span>
          </div>
        )}

        <div
          style={{
            width: 1,
            height: 20,
            background: divider,
          }}
        />

        {onOpenWatchlist && (
          <button
            onClick={onOpenWatchlist}
            title="Watchlist"
            style={{
              background: iconBtnBg,
              border: iconBtnBorder,
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(34, 211, 165, 0.12)";
              e.currentTarget.style.borderColor = "rgba(34, 211, 165, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = iconBtnBg;
              e.currentTarget.style.borderColor = dark ? "rgba(255,255,255,0.1)" : "#cbd5e1";
            }}
          >
            <Icon name="watchlist" size={16} color="accent" />
          </button>
        )}
      </div>
    </nav>
  );
}
