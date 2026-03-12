import axios from 'axios';
import { CryptoAsset, DataPoint } from '../types';

const BASE_URL = 'https://api.coingecko.com/api/v3';
const API_KEY  = process.env.COINGECKO_API_KEY ?? '';

function headers(): Record<string, string> {
  return API_KEY ? { 'x-cg-pro-api-key': API_KEY } : {};
}

export async function fetchCryptoPrices(): Promise<CryptoAsset[]> {
  const { data } = await axios.get<unknown[]>(`${BASE_URL}/coins/markets`, {
    params: {
      vs_currency:             'usd',
      order:                   'market_cap_desc',
      per_page:                10,
      page:                    1,
      sparkline:               true,
      price_change_percentage: '24h',
    },
    headers: headers(),
    timeout: 15_000,
  });

  return data.map((coin: any) => ({
    id:        coin.id   as string,
    symbol:    (coin.symbol as string).toUpperCase(),
    name:      coin.name as string,
    price:     coin.current_price        as number,
    change:    (coin.price_change_24h    as number) ?? 0,
    pct:       (coin.price_change_percentage_24h as number) ?? 0,
    marketCap: coin.market_cap           as number,
    volume:    coin.total_volume         as number,
    sparkline: (coin.sparkline_in_7d?.price as number[]) ?? [],
    image:     coin.image                as string,
  }));
}

export async function fetchCryptoHistory(coin: string, days: number): Promise<DataPoint[]> {
  const { data } = await axios.get<{ prices: [number, number][] }>(
    `${BASE_URL}/coins/${coin}/market_chart`,
    {
      params:  { vs_currency: 'usd', days },
      headers: headers(),
      timeout: 15_000,
    },
  );

  return data.prices.map(([ts, price]) => ({
    date:  shortDate(ts),
    value: parseFloat(price.toFixed(2)),
  }));
}

function shortDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
  });
}
