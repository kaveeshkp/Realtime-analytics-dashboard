// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: "rgba(34,211,165,0.15)",
    border: "1px solid rgba(34,211,165,0.35)",
    color: "#22d3a5",
  },
  secondary: {
    background: "rgba(59,130,246,0.15)",
    border: "1px solid rgba(59,130,246,0.35)",
    color: "#3b82f6",
  },
  ghost: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#64748b",
  },
  danger: {
    background: "rgba(248,113,113,0.12)",
    border: "1px solid rgba(248,113,113,0.3)",
    color: "#f87171",
  },
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: "4px 10px", fontSize: 11 },
  md: { padding: "7px 16px", fontSize: 13 },
  lg: { padding: "10px 22px", fontSize: 15 },
};

export function Button({
  variant = "ghost",
  size = "md",
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        borderRadius: 8,
        cursor: "pointer",
        fontFamily: "'DM Mono', monospace",
        transition: "opacity 0.15s",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
}

export function Badge({ label, color = "#22d3a5", bg }: BadgeProps) {
  return (
    <span
      style={{
        background: bg ?? `${color}1a`,
        color,
        borderRadius: 6,
        padding: "3px 9px",
        fontSize: 11,
        fontFamily: "'DM Mono', monospace",
        fontWeight: 500,
        letterSpacing: 0.3,
      }}
    >
      {label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, style, onClick }: CardProps) {
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
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ vertical = false }: { vertical?: boolean }) {
  return (
    <div
      style={
        vertical
          ? { width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.07)" }
          : { height: 1, background: "rgba(255,255,255,0.07)", margin: "12px 0" }
      }
    />
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = "#22d3a5" }: { size?: number; color?: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid rgba(255,255,255,0.08)`,
        borderTop: `2px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}
