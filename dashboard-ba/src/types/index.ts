export interface StockQuote {
  symbol:    string;
  price:     number;
  change:    number;   // dollar change from previous close
  pct:       number;   // percentage change
  volume:    number;
  high:      number;
  low:       number;
  prevClose: number;
}

export interface DataPoint {
  date:  string;   // e.g. 'Mar 12'
  value: number;
}

export interface CryptoAsset {
  id:        string;    // CoinGecko ID e.g. 'bitcoin'
  symbol:    string;    // e.g. 'BTC'
  name:      string;    // e.g. 'Bitcoin'
  price:     number;
  change:    number;    // 24h dollar change
  pct:       number;    // 24h percent change
  marketCap: number;
  volume:    number;
  sparkline: number[];  // 7-day price array
  image:     string;    // coin logo URL
}

export interface MatchScore {
  league:    string;
  home:      string;
  away:      string;
  homeScore: number;
  awayScore: number;
  status:    'FT' | 'LIVE' | 'UP';
  time:      string;
  date:      string;
}

export interface Fixture {
  league: string;
  home:   string;
  away:   string;
  status: 'UP';
  time:   string;
}

export interface WeatherNow {
  city:        string;
  country:     string;
  temp:        number;   // Celsius
  feelsLike:   number;
  humidity:    number;   // 0–100
  windSpeed:   number;   // m/s
  description: string;
  icon:        string;   // OpenWeatherMap icon code
}

export interface ForecastDay {
  date: string;
  high: number;
  low:  number;
  desc: string;
  icon: string;
}

export interface WsMessage {
  type:       'connected' | 'crypto_prices';
  data?:      CryptoAsset[];
  timestamp?: number;
  message?:   string;
}
