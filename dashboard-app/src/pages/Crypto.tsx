import { useState } from "react";
import { useCoinMarkets } from "../hooks/useCryptoData";
import { useTheme } from "../hooks/useTheme";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPercent, trendDirection } from "../utils/formatPercent";
import { pctColor } from "../utils/colorScale";
import type { CoinMarket } from "../types/crypto.types";

function CoinRow({ coin }: { coin: CoinMarket }) {
  const { dark } = useTheme();
  const pct = coin.priceChangePercent24h ?? 0;
  const dir = trendDirection(pct);

  return (
    <tr
      className={`border-b transition-colors ${
        dark ? "border-gray-700 hover:bg-gray-700/40" : "border-gray-100 hover:bg-gray-50"
      }`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
          <span className="font-medium text-sm">{coin.name}</span>
          <span className="text-xs text-gray-500 font-mono">
            {coin.symbol.toUpperCase()}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">{formatCurrency(coin.currentPrice)}</td>
      <td className={`px-4 py-3 text-right ${pctColor(pct)}`}>
        {dir === "up" ? "▲" : dir === "down" ? "▼" : "—"} {formatPercent(pct)}
      </td>
      <td className="px-4 py-3 text-right text-sm text-gray-500">
        {formatCurrency(coin.marketCap, "USD", { abbreviate: true })}
      </td>
      <td className="px-4 py-3 text-right text-sm text-gray-500">
        {formatCurrency(coin.totalVolume, "USD", { abbreviate: true })}
      </td>
    </tr>
  );
}

export default function Crypto() {
  const { dark } = useTheme();
  const [page, setPage] = useState(1);
  const [currency] = useState("usd");
  const { data: coins, isLoading } = useCoinMarkets(currency, page);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
          Crypto Markets
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Page {page}</span>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40"
          >
            ‹
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600"
          >
            ›
          </button>
        </div>
      </div>

      <div
        className={`rounded-xl border overflow-auto ${
          dark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        }`}
      >
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : (
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr
                className={`text-xs uppercase tracking-wide ${
                  dark ? "text-gray-400" : "text-gray-500 bg-gray-50"
                }`}
              >
                <th className="px-4 py-3 text-left">Coin</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">24h %</th>
                <th className="px-4 py-3 text-right">Market Cap</th>
                <th className="px-4 py-3 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {coins?.map((coin) => <CoinRow key={coin.id} coin={coin} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
