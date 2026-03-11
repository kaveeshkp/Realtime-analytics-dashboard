interface SidebarItem {
  symbol: string;
  name: string;
  price: number;
  pct: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarItem[];
  onRemove?: (symbol: string) => void;
}

const pctColor = (v: number) => (v >= 0 ? "#22d3a5" : "#f87171");

export function Sidebar({ isOpen, onClose, items, onRemove }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 40,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: 300,
          background: "rgba(10,14,24,0.98)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 50,
          padding: 24,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              color: "#f0f4ff",
              fontSize: 16,
            }}
          >
            Watchlist
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div
            style={{
              color: "#334155",
              fontSize: 13,
              textAlign: "center",
              marginTop: 40,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            No assets in watchlist.
            <br />
            Add from Stocks or Crypto tab.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.symbol}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 600,
                    color: "#f0f4ff",
                    fontSize: 14,
                  }}
                >
                  {item.symbol}
                </div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                  {item.name}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    color: "#f0f4ff",
                    fontSize: 13,
                  }}
                >
                  {item.price >= 1
                    ? `$${item.price.toLocaleString()}`
                    : `$${item.price.toFixed(4)}`}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: pctColor(item.pct),
                    marginTop: 2,
                  }}
                >
                  {item.pct >= 0 ? "+" : ""}
                  {item.pct.toFixed(2)}%
                </div>
              </div>
              {onRemove && (
                <button
                  onClick={() => onRemove(item.symbol)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#334155",
                    cursor: "pointer",
                    fontSize: 14,
                    marginLeft: 10,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
