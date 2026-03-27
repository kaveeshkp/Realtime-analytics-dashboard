import { useRef } from "react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dark?: boolean;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search symbol or name…",
  dark = true,
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
          color: dark ? "#334155" : "#64748b",
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
          background: dark ? "rgba(255,255,255,0.05)" : "#ffffff",
          border: dark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1",
          borderRadius: 8,
          padding: "8px 12px 8px 32px",
          color: dark ? "#f0f4ff" : "#0f172a",
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
          e.currentTarget.style.borderColor = dark ? "rgba(255,255,255,0.1)" : "#cbd5e1";
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
            color: dark ? "#475569" : "#64748b",
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
