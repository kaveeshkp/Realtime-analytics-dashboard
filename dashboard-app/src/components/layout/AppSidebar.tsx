import { fmt, pctColor } from "../../utils/dashFormat";
import { Skel } from "../ui/Skeleton";
import { STOCK_META } from "../../constants/stocks";
import type { StockQuote, CryptoAsset } from "../../types/dashboard.types";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: string[];
  setWatchlist: (fn: (w: string[]) => string[]) => void;
  stocks: StockQuote[];
  cryptos: CryptoAsset[];
}

export function AppSidebar({ isOpen, onClose, watchlist, setWatchlist, stocks, cryptos }: AppSidebarProps) {
  const findAsset = (sym: string) => {
    const s = stocks.find(a => a.symbol === sym);
    if (s) return { name: STOCK_META[sym] ?? sym, price: s.price, pct: s.pct };
    const c = cryptos.find(a => a.symbol === sym);
    if (c) return { name: c.name, price: c.price, pct: c.pct };
    return null;
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, backdropFilter: "blur(2px)" }}
        />
      )}
      <div
        style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 300, background: "rgba(10,14,24,0.98)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(255,255,255,0.07)", transform: isOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)", zIndex: 50, padding: 24, overflowY: "auto" as const }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", fontSize: 16 }}>Watchlist</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        {watchlist.map(sym => {
          const asset = findAsset(sym);
          if (!asset) return (
            <div key={sym} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <Skel h={40} />
            </div>
          );
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
              <button
                onClick={() => setWatchlist(w => w.filter(s => s !== sym))}
                style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 14, marginLeft: 10 }}
              >
                ✕
              </button>
            </div>
          );
        })}

        {watchlist.length === 0 && (
          <div style={{ color: "#334155", fontSize: 13, textAlign: "center" as const, marginTop: 40, fontFamily: "'DM Mono', monospace" }}>
            No assets in watchlist.<br />Add from Stocks or Crypto tab.
          </div>
        )}
      </div>
    </>
  );
}
