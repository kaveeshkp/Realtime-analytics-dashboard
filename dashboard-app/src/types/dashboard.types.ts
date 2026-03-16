export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  pct: number;
  volume: number;
  high: number;
  low: number;
  prevClose: number;
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  pct: number;
  marketCap: number;
  volume: number;
  sparkline: number[];
  image: string;
}

export interface MatchScore {
  league: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  status: "FT" | "LIVE" | "UP";
  time: string;
  date: string;
}

export interface Fixture {
  league: string;
  home: string;
  away: string;
  status: "UP";
  time: string;
}

export interface CSEQuote {
  symbol: string;
  fullSymbol: string;
  name: string;
  price: number;
  change: number;
  pct: number;
  volume: number;
  high: number;
  low: number;
  prevClose: number;
  marketCap: number;
}
