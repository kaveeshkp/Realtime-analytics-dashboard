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
  dark: boolean;
}

export function AppSidebar({ isOpen, onClose, watchlist, setWatchlist, stocks, cryptos, dark }: AppSidebarProps) {
  const panelBg = dark ? "rgba(10,14,24,0.98)" : "#ffffff";
  const panelBorder = dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #dbe3ef";
  const titleColor = dark ? "#f0f4ff" : "#0f172a";
  const closeColor = dark ? "#64748b" : "#475569";
  const rowBorder = dark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #edf2f7";
  const symbolColor = dark ? "#f0f4ff" : "#0f172a";
  const nameColor = dark ? "#475569" : "#64748b";
  const removeColor = dark ? "#334155" : "#94a3b8";
  const emptyColor = dark ? "#334155" : "#64748b";

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
        style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 300, background: panelBg, backdropFilter: "blur(20px)", borderLeft: panelBorder, transform: isOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)", zIndex: 50, padding: 24, overflowY: "auto" as const }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: titleColor, fontSize: 16 }}>Watchlist</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: closeColor, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        {watchlist.map(sym => {
          const asset = findAsset(sym);
          if (!asset) return (
            <div key={sym} style={{ padding: "12px 0", borderBottom: rowBorder }}>
              <Skel h={40} />
            </div>
          );
          return (
            <div key={sym} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: rowBorder }}>
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, color: symbolColor, fontSize: 14 }}>{sym}</div>
                <div style={{ fontSize: 11, color: nameColor, marginTop: 2 }}>{asset.name}</div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontFamily: "'DM Mono', monospace", color: symbolColor, fontSize: 13 }}>{fmt(asset.price)}</div>
                <div style={{ fontSize: 11, color: pctColor(asset.pct), marginTop: 2 }}>{asset.pct > 0 ? "+" : ""}{asset.pct.toFixed(2)}%</div>
              </div>
              <button
                onClick={() => setWatchlist(w => w.filter(s => s !== sym))}
                style={{ background: "none", border: "none", color: removeColor, cursor: "pointer", fontSize: 14, marginLeft: 10 }}
              >
                ✕
              </button>
            </div>
          );
        })}

        {watchlist.length === 0 && (
          <div style={{ color: emptyColor, fontSize: 13, textAlign: "center" as const, marginTop: 40, fontFamily: "'DM Mono', monospace" }}>
            No assets in watchlist.<br />Add from Stocks or Crypto tab.
          </div>
        )}
      </div>
    </>
  );
}
