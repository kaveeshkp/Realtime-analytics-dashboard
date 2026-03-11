/**
 * Format a decimal as a percentage string.
 * e.g. 0.0214 → "+2.14%" or -0.043 → "-4.30%"
 */
export function formatPercent(
  value: number,
  opts: { alreadyPercent?: boolean; showSign?: boolean; decimals?: number } = {}
): string {
  const { alreadyPercent = true, showSign = true, decimals = 2 } = opts;

  const pct = alreadyPercent ? value : value * 100;
  const sign = showSign && pct > 0 ? "+" : "";

  return `${sign}${pct.toFixed(decimals)}%`;
}

/** Returns "up", "down", or "neutral" based on the value */
export function trendDirection(value: number): "up" | "down" | "neutral" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
}
