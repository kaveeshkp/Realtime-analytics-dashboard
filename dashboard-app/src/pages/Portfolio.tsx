
import { useWatchlistStore } from "../store/useWatchlistStore";
import { useStockQuote } from "../hooks/useStockData";
import { useTheme } from "../hooks/useTheme";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPercent, trendDirection } from "../utils/formatPercent";
import { pctColor } from "../utils/colorScale";

function PortfolioRow({ symbol, onRemove }: { symbol: string; onRemove: () => void }) {
  const { data, isLoading } = useStockQuote(symbol);
  const { dark } = useTheme();

  if (isLoading) {
    return (
      <tr className="animate-pulse">
        <td colSpan={4} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </td>
      </tr>
    );
  }
  if (!data) return null;

  const pct = data.changePercent ?? 0;
  const dir = trendDirection(pct);

  return (
    <tr
      className={`border-b transition-colors ${
        dark ? "border-gray-700 hover:bg-gray-700/40" : "border-gray-100 hover:bg-gray-50"
      }`}
    >
      <td className="px-4 py-3 font-mono font-semibold text-sm">{symbol}</td>
      <td className="px-4 py-3 text-right">{formatCurrency(data.price)}</td>
      <td className={`px-4 py-3 text-right ${pctColor(pct)}`}>
        {dir === "up" ? "▲" : dir === "down" ? "▼" : "—"} {formatPercent(pct)}
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={onRemove}
          className="text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

export default function Portfolio() {
  const { items, removeItem, clearWatchlist } = useWatchlistStore();
  const { dark } = useTheme();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <p className={`text-lg font-medium ${dark ? "text-gray-300" : "text-gray-600"}`}>
          Your watchlist is empty
        </p>
        <p className="text-sm text-gray-400">
          Add stocks from the Stocks page to track them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
          Portfolio / Watchlist
        </h2>
        <button
          onClick={clearWatchlist}
          className="text-xs text-red-400 hover:text-red-600 border border-red-300 dark:border-red-700 px-3 py-1 rounded-full transition-colors"
        >
          Clear All
        </button>
      </div>

      <div
        className={`rounded-xl border overflow-auto ${
          dark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        }`}
      >
        <table className="w-full min-w-[400px] text-sm">
          <thead>
            <tr
              className={`text-xs uppercase tracking-wide ${
                dark ? "text-gray-400" : "text-gray-500 bg-gray-50"
              }`}
            >
              <th className="px-4 py-3 text-left">Symbol</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Change %</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <PortfolioRow
                key={item.symbol}
                symbol={item.symbol}
                onRemove={() => removeItem(item.symbol)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
