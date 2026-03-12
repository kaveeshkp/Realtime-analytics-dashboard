# Dashboard Backend

Express + TypeScript API proxy for the Real-Time Analytics Dashboard.  
Keeps all third-party API keys server-side, handles CORS, and caches responses to respect free-tier rate limits.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file from the template
cp .env.example .env
# Then fill in your API keys (see "API keys" below)

# 3. Start the dev server (hot-reload)
npm run dev
```

The server starts on **http://localhost:5000**.  
WebSocket is available at **ws://localhost:5000/ws**.

---

## API keys

| Key | Where to get it | Free tier |
|-----|----------------|-----------|
| `ALPHA_VANTAGE_API_KEY` | https://www.alphavantage.co/support/#api-key | 25 req/day, 5 req/min |
| `OPENWEATHER_API_KEY` | https://openweathermap.org/api | 60 req/min, 1M req/month |
| `COINGECKO_API_KEY` | https://www.coingecko.com/en/api (optional) | Public tier is free, rate-limited |

> **Sports (ESPN)** — no API key required. The backend calls the public ESPN scoreboard API.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot-reload (ts-node-dev) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled output |
| `npm run typecheck` | Type-check without emitting |

---

## Endpoints

| Method | Path | Description | Cache TTL |
|--------|------|-------------|-----------|
| GET | `/api/health` | Server health check | — |
| GET | `/api/stocks/quote?symbol=` | Single stock quote | 30 s |
| GET | `/api/stocks/batch?symbols=` | Up to 5 quotes | 30 s |
| GET | `/api/stocks/history?symbol=&range=` | OHLCV history | 5 min – 1 hr |
| GET | `/api/crypto/prices` | Top 10 coins by market cap | 30 s |
| GET | `/api/crypto/history?coin=&days=` | Coin price history | 5 min |
| GET | `/api/sports/live?league=` | Recent & live scores | 60 s |
| GET | `/api/sports/upcoming?league=` | Next 7 days fixtures | 5 min |
| GET | `/api/weather/current?city=` | Current conditions | 5 min |
| GET | `/api/weather/forecast?city=` | 5-day forecast | 30 min |
| WS | `/ws` | Live crypto price stream | push / 30 s |

### Query parameter options

- `range` — `1D` \| `1W` \| `1M` \| `1Y` (default `1M`)
- `league` — `NBA` \| `NFL` \| `EPL` \| `MLB`
- `coin` — CoinGecko ID e.g. `bitcoin`, `ethereum` (not the ticker symbol)
- `days` — integer, e.g. `7`, `30`, `90`, `365`

---

## Error format

All errors return JSON with a single `error` key:

```json
{ "error": "symbol is required" }
```

| HTTP code | Meaning |
|-----------|---------|
| 400 | Missing or invalid query parameter |
| 429 | Rate limit exceeded (100 req / 15 min per IP) |
| 502 | Upstream API error or key not configured |

---

## Project structure

```
src/
  index.ts              Entry point — Express app + HTTP server
  cache.ts              In-memory TTL cache
  types/
    index.ts            Shared TypeScript interfaces
  services/
    alphaVantage.ts     Stock quotes & history (Alpha Vantage)
    coinGecko.ts        Crypto prices & history (CoinGecko)
    sportsApi.ts        Scores & fixtures (ESPN public API)
    openWeather.ts      Weather current & forecast (OpenWeatherMap)
  routes/
    health.ts
    stocks.ts
    crypto.ts
    sports.ts
    weather.ts
  websocket/
    wsServer.ts         WebSocket server — broadcasts crypto prices every 30 s
```

---

## Connecting from the React frontend

**1. Vite proxy (development)**

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': { target: 'http://localhost:5000', changeOrigin: true },
    '/ws':  { target: 'ws://localhost:5000',  ws: true },
  },
},
```

**2. Shared fetch client**

```ts
// src/services/api/client.ts
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
```
