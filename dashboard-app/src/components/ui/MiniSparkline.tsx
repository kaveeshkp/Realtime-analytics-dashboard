import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MiniSparklineProps {
  data: number[];
  positive: boolean;
}

export function MiniSparkline({ data, positive }: MiniSparklineProps) {
  return (
    <ResponsiveContainer width={80} height={32}>
      <LineChart data={data.map((v, t) => ({ t, v }))}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={positive ? "#22d3a5" : "#f87171"}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
