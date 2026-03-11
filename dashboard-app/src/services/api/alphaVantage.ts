import axios from "axios";
import type { StockQuote, OHLCVBar, StockSearchResult, TimeSeriesInterval } from "../../types/stock.types";

const BASE_URL = "https://www.alphavantage.co/query";

function getApiKey(): string {
  const key = import.meta.env.VITE_ALPHA_VANTAGE_KEY as string | undefined;
  if (!key) throw new Error("VITE_ALPHA_VANTAGE_KEY is not set");
  return key;
}

const client = axios.create({ baseURL: BASE_URL });

// ─── Quote ───────────────────────────────────────────────────────────────────

export async function fetchQuote(symbol: string): Promise<StockQuote> {
  const { data } = await client.get("", {
    params: { function: "GLOBAL_QUOTE", symbol, apikey: getApiKey() },
  });

  const raw = data["Global Quote"];
  if (!raw || !raw["01. symbol"]) {
    throw new Error(`No quote data for ${symbol}`);
  }

  return {
    symbol: raw["01. symbol"],
    name: symbol,
    price: parseFloat(raw["05. price"]),
    open: parseFloat(raw["02. open"]),
    high: parseFloat(raw["03. high"]),
    low: parseFloat(raw["04. low"]),
    previousClose: parseFloat(raw["08. previous close"]),
    change: parseFloat(raw["09. change"]),
    changePercent: parseFloat(raw["10. change percent"].replace("%", "")),
    volume: parseInt(raw["06. volume"], 10),
    latestTradingDay: raw["07. latest trading day"],
  };
}

// ─── Daily Time Series ────────────────────────────────────────────────────────

export async function fetchDailyTimeSeries(symbol: string): Promise<OHLCVBar[]> {
  const { data } = await client.get("", {
    params: {
      function: "TIME_SERIES_DAILY",
      symbol,
      outputsize: "compact",
      apikey: getApiKey(),
    },
  });

  const series = data["Time Series (Daily)"];
  if (!series) throw new Error(`No daily series for ${symbol}`);

  return Object.entries(series)
    .map(([date, v]: [string, unknown]) => {
      const vals = v as Record<string, string>;
      return {
        date,
        open: parseFloat(vals["1. open"]),
        high: parseFloat(vals["2. high"]),
        low: parseFloat(vals["3. low"]),
        close: parseFloat(vals["4. close"]),
        volume: parseInt(vals["5. volume"], 10),
      };
    })
    .reverse(); // oldest first
}

// ─── Intraday Time Series ─────────────────────────────────────────────────────

export async function fetchIntradayTimeSeries(
  symbol: string,
  interval: TimeSeriesInterval = "5min"
): Promise<OHLCVBar[]> {
  const { data } = await client.get("", {
    params: {
      function: "TIME_SERIES_INTRADAY",
      symbol,
      interval,
      outputsize: "compact",
      apikey: getApiKey(),
    },
  });

  const key = `Time Series (${interval})`;
  const series = data[key];
  if (!series) throw new Error(`No intraday series for ${symbol}`);

  return Object.entries(series)
    .map(([date, v]: [string, unknown]) => {
      const vals = v as Record<string, string>;
      return {
        date,
        open: parseFloat(vals["1. open"]),
        high: parseFloat(vals["2. high"]),
        low: parseFloat(vals["3. low"]),
        close: parseFloat(vals["4. close"]),
        volume: parseInt(vals["5. volume"], 10),
      };
    })
    .reverse();
}

// ─── Symbol Search ────────────────────────────────────────────────────────────

export async function searchSymbols(keywords: string): Promise<StockSearchResult[]> {
  const { data } = await client.get("", {
    params: { function: "SYMBOL_SEARCH", keywords, apikey: getApiKey() },
  });

  const matches = data["bestMatches"];
  if (!Array.isArray(matches)) return [];

  return matches.map((m: Record<string, string>) => ({
    symbol: m["1. symbol"],
    name: m["2. name"],
    type: m["3. type"],
    region: m["4. region"],
    marketOpen: m["5. marketOpen"],
    marketClose: m["6. marketClose"],
    timezone: m["7. timezone"],
    currency: m["8. currency"],
    matchScore: parseFloat(m["9. matchScore"]),
  }));
}
