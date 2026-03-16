export const fmt = (n: number, decimals = 2): string =>
  n >= 1e12 ? `$${(n / 1e12).toFixed(1)}T` :
  n >= 1e9  ? `$${(n / 1e9).toFixed(1)}B`  :
  n >= 1e6  ? `$${(n / 1e6).toFixed(1)}M`  :
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

export const fmtVol = (n: number): string =>
  n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` :
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` :
  n >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : String(n);

export const fmtLKR = (n: number): string =>
  n >= 1e9 ? `₨${(n / 1e9).toFixed(1)}B` :
  n >= 1e6 ? `₨${(n / 1e6).toFixed(1)}M` :
  `₨${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const pctColor = (v: number): string => (v >= 0 ? "#22d3a5" : "#f87171");
export const pctBg    = (v: number): string => (v >= 0 ? "rgba(34,211,165,0.1)" : "rgba(248,113,113,0.1)");

export const generateSparkline = (base: number, n = 20): number[] =>
  Array.from({ length: n }, (_, i) =>
    Math.max(0, base + (Math.random() - 0.48) * base * 0.04 * (i + 1))
  );
