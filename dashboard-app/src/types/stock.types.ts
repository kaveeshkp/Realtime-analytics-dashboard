export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  week52High?: number;
  week52Low?: number;
  timestamp: number;
}

export interface OHLCVBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

export type TimeSeriesInterval =
  | "1min"
  | "5min"
  | "15min"
  | "30min"
  | "60min"
  | "daily"
  | "weekly"
  | "monthly";

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  type: "stock" | "crypto";
  addedAt: number;
}
