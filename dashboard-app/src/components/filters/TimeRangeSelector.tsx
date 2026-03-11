export type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (r: TimeRange) => void;
  options?: TimeRange[];
  accentColor?: string;
}

const DEFAULT_OPTIONS: TimeRange[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

export function TimeRangeSelector({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  accentColor = "#3b82f6",
}: TimeRangeSelectorProps) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {options.map((r) => {
        const active = value === r;
        return (
          <button
            key={r}
            onClick={() => onChange(r)}
            style={{
              background: active ? `${accentColor}33` : "rgba(255,255,255,0.04)",
              border: `1px solid ${active ? `${accentColor}80` : "rgba(255,255,255,0.07)"}`,
              color: active ? accentColor : "#475569",
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              transition: "all 0.15s",
              minWidth: 36,
            }}
          >
            {r}
          </button>
        );
      })}
    </div>
  );
}
