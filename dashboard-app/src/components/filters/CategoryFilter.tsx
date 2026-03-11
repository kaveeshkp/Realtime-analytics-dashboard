interface CategoryFilterProps {
  categories: string[];
  value: string;
  onChange: (cat: string) => void;
  accentColor?: string;
  allLabel?: string;
}

export function CategoryFilter({
  categories,
  value,
  onChange,
  accentColor = "#ec4899",
  allLabel = "All",
}: CategoryFilterProps) {
  const all = [allLabel, ...categories];

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {all.map((cat) => {
        const active = value === cat;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            style={{
              background: active ? `${accentColor}22` : "rgba(255,255,255,0.04)",
              border: `1px solid ${active ? `${accentColor}66` : "rgba(255,255,255,0.08)"}`,
              color: active ? accentColor : "#64748b",
              borderRadius: 8,
              padding: "6px 16px",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              transition: "all 0.15s",
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
