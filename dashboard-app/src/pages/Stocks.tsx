import { useState } from "react";
import { useStockQuote, useStockSearch } from "../hooks/useStockData";
import { useWatchlistStore } from "../store/useWatchlistStore";
import { useTheme } from "../hooks/useTheme";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPercent, trendDirection } from "../utils/formatPercent";
import { pctColor } from "../utils/colorScale";
import type { StockSearchResult } from "../types/stock.types";

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "NFLX"];

function StockRow({ symbol }: { symbol: string }) {
  const { data, isLoading } = useStockQuote(symbol);
  const { addItem, removeItem, isInWatchlist } = useWatchlistStore();
  const { dark } = useTheme();
  const inWatchlist = isInWatchlist(symbol);

  if (isLoading) {
    return (
      <tr className="animate-pulse">
        <td colSpan={5} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </td>
      </tr>
    );
  }
  if (!data) return null;

  const dir = trendDirection(data.changePercent);

  return (
    <tr
      className={`border-b transition-colors ${
        dark ? "border-gray-700 hover:bg-gray-700/40" : "border-gray-100 hover:bg-gray-50"
      }`}
    >
      <td className="px-4 py-3 font-mono font-semibold text-sm">{symbol}</td>
      <td className="px-4 py-3 text-right">{formatCurrency(data.price)}</td>
      <td className={`px-4 py-3 text-right ${pctColor(data.changePercent)}`}>
        {dir === "up" ? "▲" : dir === "down" ? "▼" : "—"}{" "}
        {formatPercent(data.changePercent)}
      </td>
      <td className="px-4 py-3 text-right text-sm text-gray-500">
        {data.volume?.toLocaleString() ?? "—"}
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() =>
            inWatchlist
              ? removeItem(symbol)
              : addItem({ symbol, name: data.name ?? symbol, type: "stock" })
          }
          className={`text-xs px-2 py-1 rounded-full border transition-colors ${
            inWatchlist
              ? "border-red-400 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              : "border-blue-400 text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          }`}
        >
          {inWatchlist ? "Remove" : "+ Watch"}
        </button>
      </td>
    </tr>
  );
}

export default function Stocks() {
  const { dark } = useTheme();
  const [search, setSearch] = useState("");
  const { data: searchResults } = useStockSearch(search);

  const displaySymbols =
    search.length >= 2 && searchResults
      ? searchResults.map((r: StockSearchResult) => r.symbol)
      : DEFAULT_SYMBOLS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className={`text-xl font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
          Stocks
        </h2>
        <input
          type="text"
          placeholder="Search symbol or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`px-3 py-2 text-sm rounded-lg border outline-none w-56 ${
            dark
              ? "bg-gray-800 border-gray-600 text-white placeholder-gray-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
          }`}
        />
      </div>

      <div
        className={`rounded-xl border overflow-auto ${
          dark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        }`}
      >
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr
              className={`text-xs uppercase tracking-wide ${
                dark ? "text-gray-400 bg-gray-750" : "text-gray-500 bg-gray-50"
              }`}
            >
              <th className="px-4 py-3 text-left">Symbol</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Change&nbsp;%</th>
              <th className="px-4 py-3 text-right">Volume</th>
              <th className="px-4 py-3 text-center">Watchlist</th>
            </tr>
          </thead>
          <tbody>
            {displaySymbols.map((sym) => (
              <StockRow key={sym} symbol={sym} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
