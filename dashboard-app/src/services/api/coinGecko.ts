import axios from "axios";
import type { CoinMarket, CoinDetail, CoinOHLC } from "../../types/crypto.types";

const client = axios.create({
  baseURL: "https://api.coingecko.com/api/v3",
});

// ─── Market list ──────────────────────────────────────────────────────────────

export async function fetchCoinMarkets(
  vsCurrency = "usd",
  page = 1,
  perPage = 20
): Promise<CoinMarket[]> {
  const { data } = await client.get<CoinMarket[]>("/coins/markets", {
    params: {
      vs_currency: vsCurrency,
      order: "market_cap_desc",
      per_page: perPage,
      page,
      sparkline: false,
      price_change_percentage: "1h,24h,7d",
    },
  });
  return data;
}

// ─── Coin detail ──────────────────────────────────────────────────────────────

export async function fetchCoinDetail(coinId: string): Promise<CoinDetail> {
  const { data } = await client.get<CoinDetail>(`/coins/${coinId}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
    },
  });
  return data;
}

// ─── OHLC ─────────────────────────────────────────────────────────────────────

export async function fetchCoinOHLC(
  coinId: string,
  days: 1 | 7 | 14 | 30 | 90 | 180 | 365 = 7
): Promise<CoinOHLC[]> {
  // CoinGecko returns an array of [timestamp, open, high, low, close]
  const { data } = await client.get<[number, number, number, number, number][]>(
    `/coins/${coinId}/ohlc`,
    { params: { vs_currency: "usd", days } }
  );

  return data.map(([timestamp, open, high, low, close]) => ({
    timestamp,
    open,
    high,
    low,
    close,
  }));
}
