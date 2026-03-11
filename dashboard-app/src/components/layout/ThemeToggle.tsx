interface ThemeToggleProps {
  dark: boolean;
  onToggle: () => void;
  size?: number;
}

export function ThemeToggle({ dark, onToggle, size = 36 }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: size,
        height: size,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        cursor: "pointer",
        color: dark ? "#fbbf24" : "#475569",
        fontSize: size * 0.45,
        display: "grid",
        placeItems: "center",
        transition: "all 0.2s",
      }}
    >
      {dark ? "☀" : "☾"}
    </button>
  );
}
