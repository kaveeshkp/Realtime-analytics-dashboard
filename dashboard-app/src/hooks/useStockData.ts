import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchQuote,
  fetchDailyTimeSeries,
  fetchIntradayTimeSeries,
  searchSymbols,
} from "../services/api/alphaVantage";
import type { TimeSeriesInterval } from "../types/stock.types";

// ─── Keys ────────────────────────────────────────────────────────────────────

const STOCK_KEYS = {
  quote: (symbol: string) => ["stock", "quote", symbol] as const,
  daily: (symbol: string) => ["stock", "daily", symbol] as const,
  intraday: (symbol: string, interval: TimeSeriesInterval) =>
    ["stock", "intraday", symbol, interval] as const,
  search: (kw: string) => ["stock", "search", kw] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useStockQuote(symbol: string) {
  return useQuery({
    queryKey: STOCK_KEYS.quote(symbol),
    queryFn: () => fetchQuote(symbol),
    enabled: !!symbol,
    refetchInterval: 60_000, // refresh every minute
    staleTime: 30_000,
  });
}

export function useDailyTimeSeries(symbol: string) {
  return useQuery({
    queryKey: STOCK_KEYS.daily(symbol),
    queryFn: () => fetchDailyTimeSeries(symbol),
    enabled: !!symbol,
    staleTime: 5 * 60_000,
  });
}

export function useIntradayTimeSeries(
  symbol: string,
  interval: TimeSeriesInterval = "5min"
) {
  return useQuery({
    queryKey: STOCK_KEYS.intraday(symbol, interval),
    queryFn: () => fetchIntradayTimeSeries(symbol, interval),
    enabled: !!symbol,
    refetchInterval: 2 * 60_000,
    staleTime: 60_000,
  });
}

export function useStockSearch(keyword: string) {
  return useQuery({
    queryKey: STOCK_KEYS.search(keyword),
    queryFn: () => searchSymbols(keyword),
    enabled: keyword.length >= 2,
    staleTime: 10 * 60_000,
  });
}

/** Programmatically invalidate a quote cache entry */
export function useInvalidateStockQuote() {
  const qc = useQueryClient();
  return (symbol: string) => qc.invalidateQueries({ queryKey: STOCK_KEYS.quote(symbol) });
}
