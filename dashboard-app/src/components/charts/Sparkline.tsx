import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

interface SparklineProps {
  data: { t: number; v: number }[];
  positive?: boolean;
  width?: number;
  height?: number;
  strokeWidth?: number;
  showTooltip?: boolean;
}

export function Sparkline({
  data,
  positive = true,
  width = 80,
  height = 32,
  strokeWidth = 1.5,
  showTooltip = false,
}: SparklineProps) {
  const color = positive ? "#22d3a5" : "#f87171";

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={strokeWidth}
          dot={false}
          activeDot={showTooltip ? { r: 3, fill: color, strokeWidth: 0 } : false}
        />
        {showTooltip && (
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              padding: "4px 8px",
            }}
            itemStyle={{ color }}
            labelFormatter={() => ""}
            formatter={(v: number) => [`$${v.toFixed(2)}`, ""]}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function generateSparkData(base: number, points = 20) {
  return Array.from({ length: points }, (_, i) => ({
    t: i,
    v: base + (Math.random() - 0.48) * base * 0.04 * (i + 1),
  }));
}
