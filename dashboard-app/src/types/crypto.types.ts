export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  fullyDilutedValuation?: number;
  totalVolume: number;
  high24h: number;
  low24h: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  priceChangePercent7d?: number;
  priceChangePercent30d?: number;
  circulatingSupply: number;
  totalSupply?: number;
  maxSupply?: number;
  ath: number;
  athDate: string;
  atl: number;
  atlDate: string;
  sparkline?: number[];
  lastUpdated: string;
}

export interface CoinDetail extends CoinMarket {
  description: string;
  homepage: string;
  categories: string[];
  genesisDate?: string;
}

export interface CoinOHLC {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type CryptoCurrency = "usd" | "eur" | "gbp" | "btc" | "eth";
