import { useStockQuote, useDailyTimeSeries } from "../hooks/useStockData";
import { useCoinMarkets } from "../hooks/useCryptoData";
import { useWatchlistStore } from "../store/useWatchlistStore";
import { useTheme } from "../hooks/useTheme";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPercent, trendDirection } from "../utils/formatPercent";
import { pctColor } from "../utils/colorScale";

const TOP_SYMBOLS = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"];

function MarketSummaryCard({
  symbol,
}: {
  symbol: string;
}) {
  const { data, isLoading } = useStockQuote(symbol);
  const { dark } = useTheme();

  if (isLoading) {
    return (
      <div
        className={`p-4 rounded-xl border animate-pulse ${
          dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>
    );
  }

  if (!data) return null;

  const dir = trendDirection(data.changePercent);

  return (
    <div
      className={`p-4 rounded-xl border transition-colors ${
        dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <span className="text-xs font-mono text-gray-500">{symbol}</span>
      <p className="text-lg font-bold mt-0.5">{formatCurrency(data.price)}</p>
      <p className={`text-sm ${pctColor(data.changePercent)}`}>
        {dir === "up" ? "▲" : dir === "down" ? "▼" : "—"}{" "}
        {formatPercent(data.changePercent)}
      </p>
    </div>
  );
}

export default function Home() {
  const { items: watchlist } = useWatchlistStore();
  const { dark } = useTheme();
  const { data: topCoins } = useCoinMarkets("usd", 1);

  return (
    <div className="space-y-8">
      {/* Market overview */}
      <section>
        <h2
          className={`text-xl font-semibold mb-4 ${
            dark ? "text-white" : "text-gray-900"
          }`}
        >
          Market Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TOP_SYMBOLS.map((sym) => (
            <MarketSummaryCard key={sym} symbol={sym} />
          ))}
        </div>
      </section>

      {/* Top crypto */}
      {topCoins && topCoins.length > 0 && (
        <section>
          <h2
            className={`text-xl font-semibold mb-4 ${
              dark ? "text-white" : "text-gray-900"
            }`}
          >
            Top Crypto
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {topCoins.slice(0, 5).map((coin) => {
              const pct = coin.price_change_percentage_24h ?? 0;
              const dir = trendDirection(pct);
              return (
                <div
                  key={coin.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    dark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-xs font-mono text-gray-500">
                      {coin.symbol.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-lg font-bold">
                    {formatCurrency(coin.current_price)}
                  </p>
                  <p className={`text-sm ${pctColor(pct)}`}>
                    {dir === "up" ? "▲" : dir === "down" ? "▼" : "—"}{" "}
                    {formatPercent(pct)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Watchlist summary */}
      {watchlist.length > 0 && (
        <section>
          <h2
            className={`text-xl font-semibold mb-4 ${
              dark ? "text-white" : "text-gray-900"
            }`}
          >
            Your Watchlist
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {watchlist.map((item) => (
              <MarketSummaryCard key={item.symbol} symbol={item.symbol} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
