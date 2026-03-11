import { useState } from "react";
import { Sparkline } from "../charts/Sparkline";

export interface AssetRow {
  symbol: string;
  name: string;
  price: number;
  change: number;
  pct: number;
  volume?: string;
  cap?: string;
  sparkline?: { t: number; v: number }[];
  [key: string]: unknown;
}

type SortKey = "symbol" | "price" | "pct" | "change";
type SortDir = "asc" | "desc";

interface AssetTableProps {
  rows: AssetRow[];
  onSelect?: (symbol: string) => void;
  selectedSymbol?: string;
  accentColor?: string;
}

const pctColor = (v: number) => (v >= 0 ? "#22d3a5" : "#f87171");
const pctBg = (v: number) =>
  v >= 0 ? "rgba(34,211,165,0.1)" : "rgba(248,113,113,0.1)";

export function AssetTable({
  rows,
  onSelect,
  selectedSymbol,
  accentColor = "#3b82f6",
}: AssetTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = [...rows].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortKey === "symbol") return mul * a.symbol.localeCompare(b.symbol);
    return mul * (Number(a[sortKey]) - Number(b[sortKey]));
  });

  const SortBtn = ({ col, label }: { col: SortKey; label: string }) => (
    <span
      onClick={() => toggleSort(col)}
      style={{
        cursor: "pointer",
        userSelect: "none",
        color: sortKey === col ? "#f0f4ff" : "#334155",
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      {label}
      {sortKey === col && (
        <span style={{ fontSize: 9 }}>{sortDir === "asc" ? "▲" : "▼"}</span>
      )}
    </span>
  );

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "80px 1fr 110px 90px 80px 80px",
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontSize: 11,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: 1,
          textTransform: "uppercase" as const,
        }}
      >
        <SortBtn col="symbol" label="Symbol" />
        <span style={{ color: "#334155" }}>Name</span>
        <span style={{ color: "#334155", textAlign: "right" as const }}>
          <SortBtn col="price" label="Price" />
        </span>
        <span style={{ color: "#334155", textAlign: "right" as const }}>
          <SortBtn col="pct" label="Change" />
        </span>
        <span style={{ color: "#334155", textAlign: "right" as const }}>Vol</span>
        <span style={{ color: "#334155", textAlign: "right" as const }}>7D</span>
      </div>

      {/* Rows */}
      {sorted.map((row) => (
        <div
          key={row.symbol}
          onClick={() => onSelect?.(row.symbol)}
          style={{
            display: "grid",
            gridTemplateColumns: "80px 1fr 110px 90px 80px 80px",
            padding: "14px 20px",
            cursor: onSelect ? "pointer" : "default",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background:
              selectedSymbol === row.symbol
                ? `${accentColor}11`
                : "transparent",
            borderLeft:
              selectedSymbol === row.symbol
                ? `2px solid ${accentColor}`
                : "2px solid transparent",
            transition: "background 0.15s",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontWeight: 700,
              color: "#f0f4ff",
              fontSize: 14,
            }}
          >
            {row.symbol}
          </span>
          <span style={{ fontSize: 13, color: "#64748b" }}>{row.name}</span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              color: "#f0f4ff",
              fontSize: 13,
              textAlign: "right",
            }}
          >
            {row.price >= 1
              ? `$${row.price.toLocaleString()}`
              : `$${row.price.toFixed(4)}`}
          </span>
          <span style={{ textAlign: "right" }}>
            <span
              style={{
                background: pctBg(row.pct),
                color: pctColor(row.pct),
                borderRadius: 5,
                padding: "3px 8px",
                fontSize: 11,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              {row.pct >= 0 ? "+" : ""}
              {row.pct.toFixed(2)}%
            </span>
          </span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#475569",
              textAlign: "right",
            }}
          >
            {row.volume ?? "—"}
          </span>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            {row.sparkline ? (
              <Sparkline data={row.sparkline} positive={row.pct >= 0} />
            ) : (
              <span style={{ color: "#334155", fontSize: 11 }}>—</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
