import { useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search symbol or name…",
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 12,
          color: "#334155",
          fontSize: 14,
          pointerEvents: "none",
        }}
      >
        ⌕
      </span>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8,
          padding: "8px 12px 8px 32px",
          color: "#f0f4ff",
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          outline: "none",
          width: 220,
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          style={{
            position: "absolute",
            right: 10,
            background: "none",
            border: "none",
            color: "#475569",
            cursor: "pointer",
            fontSize: 13,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
