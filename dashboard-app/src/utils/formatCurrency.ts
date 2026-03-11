/**
 * Format a number as a currency string.
 * Automatically abbreviates large values (T, B, M).
 */
export function formatCurrency(
  value: number,
  currency = "USD",
  opts: { abbreviate?: boolean; decimals?: number } = {}
): string {
  const { abbreviate = false, decimals = 2 } = opts;

  if (abbreviate) {
    if (Math.abs(value) >= 1e12)
      return `$${(value / 1e12).toFixed(1)}T`;
    if (Math.abs(value) >= 1e9)
      return `$${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6)
      return `$${(value / 1e6).toFixed(1)}M`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: value < 1 ? 4 : decimals,
      maximumFractionDigits: value < 1 ? 6 : decimals,
    }).format(value);
  } catch {
    return `$${value.toFixed(decimals)}`;
  }
}

/** Compact price display – no currency symbol for tiny values */
export function formatPrice(value: number): string {
  if (value >= 1000) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (value >= 1)    return `$${value.toFixed(2)}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(6)}`;
}
