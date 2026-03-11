interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  sub,
  color = "#22d3a5",
  trend,
  onClick,
}: StatCardProps) {
  const trendIcon = trend === "up" ? "▲" : trend === "down" ? "▼" : null;
  const trendColor = trend === "up" ? "#22d3a5" : trend === "down" ? "#f87171" : "#64748b";

  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "20px 22px",
        backdropFilter: "blur(10px)",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.borderColor = `${color}44`;
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
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
          display: "flex",
          alignItems: "baseline",
          gap: 6,
        }}
      >
        {value}
        {trendIcon && (
          <span style={{ fontSize: 13, color: trendColor }}>{trendIcon}</span>
        )}
      </div>

      {sub && (
        <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>{sub}</div>
      )}
    </div>
  );
}
