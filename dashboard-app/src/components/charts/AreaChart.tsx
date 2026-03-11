import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface AreaChartProps {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  gradientId?: string;
  formatter?: (v: number) => string;
}

const defaultFmt = (v: number) =>
  v >= 1000 ? `$${v.toLocaleString()}` : `$${v.toFixed(2)}`;

export function AreaChart({
  data,
  color = "#22d3a5",
  height = 200,
  showGrid = false,
  showAxes = true,
  gradientId = "area-gradient",
  formatter = defaultFmt,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
        )}

        {showAxes && (
          <XAxis
            dataKey="date"
            tick={{ fill: "#334155", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
        )}

        <YAxis hide domain={["auto", "auto"]} />

        <Tooltip
          contentStyle={{
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
          }}
          labelStyle={{ color: "#64748b", marginBottom: 4 }}
          itemStyle={{ color }}
          formatter={(v: number) => [formatter(v), "Price"]}
        />

        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
