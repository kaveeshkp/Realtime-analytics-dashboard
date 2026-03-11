/**
 * Returns a CSS color string for a percentage change value.
 * Positive → green, negative → red, zero → muted.
 */
export function pctColor(value: number): string {
  if (value > 0) return "#22d3a5";
  if (value < 0) return "#f87171";
  return "#64748b";
}

/** Matching translucent background for badges */
export function pctBgColor(value: number): string {
  if (value > 0) return "rgba(34,211,165,0.12)";
  if (value < 0) return "rgba(248,113,113,0.12)";
  return "rgba(100,116,139,0.12)";
}

/**
 * Linear interpolation between two hex colors.
 * t = 0 → colorA, t = 1 → colorB.
 */
export function lerpColor(colorA: string, colorB: string, t: number): string {
  const hex = (s: string) => parseInt(s, 16);
  const parse = (c: string) => {
    const h = c.replace("#", "");
    return [hex(h.slice(0, 2)), hex(h.slice(2, 4)), hex(h.slice(4, 6))];
  };
  const [ar, ag, ab] = parse(colorA);
  const [br, bg, bb] = parse(colorB);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b = Math.round(ab + (bb - ab) * t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Maps a value within [min, max] to a color between two extremes.
 * Useful for heatmap cells.
 */
export function rangeColor(
  value: number,
  min: number,
  max: number,
  lowColor = "#f87171",
  midColor = "#1e293b",
  highColor = "#22d3a5"
): string {
  const mid = (min + max) / 2;
  if (value <= mid) {
    const t = Math.max(0, Math.min(1, (value - min) / (mid - min)));
    return lerpColor(lowColor, midColor, t);
  }
  const t = Math.max(0, Math.min(1, (value - mid) / (max - mid)));
  return lerpColor(midColor, highColor, t);
}
