interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  dark?: boolean;
}

export function KpiCard({ label, value, sub, color = "#22d3a5", dark = true }: KpiCardProps) {
  return (
    <div
      style={{
        background: dark ? "rgba(255,255,255,0.03)" : "#ffffff",
        border: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #dbe3ef",
        borderRadius: 14,
        padding: "20px 22px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: dark ? "#64748b" : "#475569",
          fontFamily: "'DM Mono', monospace",
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color,
          fontFamily: "'Syne', sans-serif",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: dark ? "#475569" : "#64748b", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
