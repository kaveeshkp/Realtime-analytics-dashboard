import axios from 'axios';
import { StockQuote, DataPoint } from '../types';

const API_KEY  = process.env.ALPHA_VANTAGE_API_KEY ?? 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

function assertNoRateLimit(data: Record<string, unknown>, symbol: string): void {
  if (data['Note'] || data['Information']) {
    throw new Error(
      `Alpha Vantage rate limit reached for ${symbol}. ` +
      'Free tier allows 25 requests/day and 5 requests/minute.',
    );
  }
}

export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  const { data } = await axios.get<Record<string, unknown>>(BASE_URL, {
    params:  { function: 'GLOBAL_QUOTE', symbol, apikey: API_KEY },
    timeout: 10_000,
  });

  assertNoRateLimit(data, symbol);

  const q = data['Global Quote'] as Record<string, string> | undefined;
  if (!q || !q['05. price']) {
    throw new Error(`No data for ${symbol}`);
  }

  return {
    symbol:    q['01. symbol'],
    price:     parseFloat(q['05. price']),
    change:    parseFloat(q['09. change']),
    pct:       parseFloat(q['10. change percent'].replace('%', '')),
    volume:    parseInt(q['06. volume'], 10),
    high:      parseFloat(q['03. high']),
    low:       parseFloat(q['04. low']),
    prevClose: parseFloat(q['08. previous close']),
  };
}

const RANGE_DAYS: Record<string, number> = { '1W': 7, '1M': 30, '1Y': 365 };

export async function fetchStockHistory(symbol: string, range: string): Promise<DataPoint[]> {
  if (range === '1D') return fetchIntradayHistory(symbol);

  const { data } = await axios.get<Record<string, unknown>>(BASE_URL, {
    params: {
      function:   'TIME_SERIES_DAILY',
      symbol,
      outputsize: range === '1Y' ? 'full' : 'compact',
      apikey:     API_KEY,
    },
    timeout: 15_000,
  });

  assertNoRateLimit(data, symbol);

  const series = data['Time Series (Daily)'] as Record<string, Record<string, string>> | undefined;
  if (!series) throw new Error(`No daily history for ${symbol}`);

  const days    = RANGE_DAYS[range] ?? 30;
  const entries = Object.entries(series).slice(0, days).reverse();

  return entries.map(([date, values]) => ({
    date:  shortDate(date),
    value: parseFloat(values['4. close']),
  }));
}

async function fetchIntradayHistory(symbol: string): Promise<DataPoint[]> {
  const { data } = await axios.get<Record<string, unknown>>(BASE_URL, {
    params: { function: 'TIME_SERIES_INTRADAY', symbol, interval: '5min', apikey: API_KEY },
    timeout: 15_000,
  });

  assertNoRateLimit(data, symbol);

  const series = data['Time Series (5min)'] as Record<string, Record<string, string>> | undefined;
  if (!series) throw new Error(`No intraday data for ${symbol}`);

  // Up to 78 bars = 6.5 hours of 5-minute trading data, oldest first
  return Object.entries(series)
    .slice(0, 78)
    .reverse()
    .map(([datetime, values]) => ({
      date:  datetime.split(' ')[1].slice(0, 5),  // 'HH:MM'
      value: parseFloat(values['4. close']),
    }));
}

function shortDate(iso: string): string {
  // Append T12:00:00 to avoid timezone shifting the day
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
  });
}
