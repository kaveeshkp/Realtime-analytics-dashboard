interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export function KpiCard({ label, value, sub, color = "#22d3a5" }: KpiCardProps) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "20px 22px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#64748b",
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
      {sub && (
        <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>{sub}</div>
      )}
    </div>
  );
}
