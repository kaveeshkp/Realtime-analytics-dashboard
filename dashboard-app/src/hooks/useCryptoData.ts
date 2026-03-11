import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCoinMarkets,
  fetchCoinDetail,
  fetchCoinOHLC,
} from "../services/api/coinGecko";

// ─── Keys ────────────────────────────────────────────────────────────────────

const CRYPTO_KEYS = {
  markets: (currency: string, page: number) =>
    ["crypto", "markets", currency, page] as const,
  coin: (id: string) => ["crypto", "coin", id] as const,
  ohlc: (id: string, days: number) => ["crypto", "ohlc", id, days] as const,
};

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useCoinMarkets(currency = "usd", page = 1) {
  return useQuery({
    queryKey: CRYPTO_KEYS.markets(currency, page),
    queryFn: () => fetchCoinMarkets(currency, page),
    staleTime: 60_000,
    refetchInterval: 90_000,
  });
}

export function useCoinDetail(coinId: string) {
  return useQuery({
    queryKey: CRYPTO_KEYS.coin(coinId),
    queryFn: () => fetchCoinDetail(coinId),
    enabled: !!coinId,
    staleTime: 2 * 60_000,
  });
}

export function useCoinOHLC(coinId: string, days: 1 | 7 | 14 | 30 | 90 | 180 | 365 = 7) {
  return useQuery({
    queryKey: CRYPTO_KEYS.ohlc(coinId, days),
    queryFn: () => fetchCoinOHLC(coinId, days),
    enabled: !!coinId,
    staleTime: 5 * 60_000,
  });
}

/** Programmatically invalidate coin market cache */
export function useInvalidateCoinMarkets() {
  const qc = useQueryClient();
  return (currency = "usd", page = 1) =>
    qc.invalidateQueries({ queryKey: CRYPTO_KEYS.markets(currency, page) });
}
