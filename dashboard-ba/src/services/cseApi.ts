import { DataPoint, CSEQuote } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: The Colombo Stock Exchange does not provide a public free API.
// Yahoo Finance no longer carries live .CM data; the CSE website requires auth.
//
// This module provides a REALISTIC SIMULATION:  real companies, real ticker
// symbols, LKR prices anchored to approximate 2025 historical levels, and a
// random walk that mimics CSE intraday volatility (~0.5-2% daily large caps).
// The WS broadcast reuses the same engine to push price ticks every 30 s.
// ─────────────────────────────────────────────────────────────────────────────

interface CSESpec {
  symbol:    string;
  name:      string;
  seed:      number;   // approximate mid-2025 price in LKR
  marketCap: number;   // approximate market cap in LKR
  volatility: number;  // daily σ as fraction (e.g. 0.012 = 1.2 %)
}

const SPECS: CSESpec[] = [
  { symbol: 'JKH',  name: 'John Keells Holdings', seed: 142.50, marketCap: 142_000_000_000, volatility: 0.013 },
  { symbol: 'DIAL', name: 'Dialog Axiata',         seed:  11.60, marketCap:  90_000_000_000, volatility: 0.010 },
  { symbol: 'COMB', name: 'Commercial Bank',       seed:  98.00, marketCap:  64_000_000_000, volatility: 0.011 },
  { symbol: 'SAMP', name: 'Sampath Bank',          seed:  79.50, marketCap:  28_000_000_000, volatility: 0.014 },
  { symbol: 'LOLC', name: 'LOLC Holdings',         seed: 101.25, marketCap:  50_000_000_000, volatility: 0.018 },
  { symbol: 'HNB',  name: 'Hatton National Bank',  seed: 196.00, marketCap:  45_000_000_000, volatility: 0.012 },
  { symbol: 'EXPO', name: 'Expolanka Holdings',    seed:  66.00, marketCap:  59_000_000_000, volatility: 0.021 },
  { symbol: 'HAYL', name: 'Hayleys PLC',           seed:  92.75, marketCap:  18_000_000_000, volatility: 0.015 },
  { symbol: 'CARS', name: 'Carsons Cumberbatch',   seed: 302.00, marketCap:  15_000_000_000, volatility: 0.016 },
  { symbol: 'LION', name: 'Lion Brewery (Ceylon)', seed: 648.00, marketCap:  10_000_000_000, volatility: 0.020 },
];

// ── Seeded random walk  ──────────────────────────────────────────────────────
// Current "live" prices stored in memory — drift every ~30 s call cycle
const live: Record<string, { price: number; open: number; prevClose: number }> = {};

function initLive() {
  if (Object.keys(live).length === 0) {
    for (const s of SPECS) {
      // randomise starting price ±3 % around the seed
      const p = s.seed * (1 + (Math.random() - 0.5) * 0.06);
      live[s.symbol] = { price: p, open: p, prevClose: p * (1 + (Math.random() - 0.5) * 0.015) };
    }
  }
}

function tick(symbol: string, volatility: number): void {
  const state = live[symbol];
  if (!state) return;
  // intraday tick:  tiny step ≈ σ/20  (simulates ~5-min bar out of a 4.5 h session)
  const step = (Math.random() - 0.5) * 2 * volatility * state.price / 20;
  state.price = Math.max(state.price + step, state.price * 0.92);
}

export function fetchCSEQuotes(): Promise<CSEQuote[]> {
  initLive();
  SPECS.forEach(s => tick(s.symbol, s.volatility));          // advance simulation

  const quotes: CSEQuote[] = SPECS.map(s => {
    const state  = live[s.symbol];
    const price  = Number(state.price.toFixed(2));
    const change = Number((price - state.prevClose).toFixed(2));
    const pct    = Number(((change / state.prevClose) * 100).toFixed(4));
    // Simulate CSE trading volume — mid/small caps have 100k-5M shares traded
    const volume = Math.floor(50_000 + Math.random() * 4_000_000);
    const spread = price * 0.003;
    return {
      symbol:     s.symbol,
      fullSymbol: `${s.symbol}.N0000`,
      name:       s.name,
      price,
      change,
      pct,
      volume,
      high:       Number((Math.max(state.open, price) * (1 + Math.random() * s.volatility * 0.3)).toFixed(2)),
      low:        Number((Math.min(state.open, price) * (1 - Math.random() * s.volatility * 0.3)).toFixed(2)),
      prevClose:  Number(state.prevClose.toFixed(2)),
      marketCap:  Math.round(s.marketCap * (price / s.seed)),
    };
    void spread; // suppress unused var
  });

  return Promise.resolve(quotes);
}

export const CSE_SYMBOLS = SPECS.map(s => s.symbol);

export function fetchCSEHistory(symbol: string, range = '1M'): Promise<DataPoint[]> {
  initLive();
  const spec = SPECS.find(s => s.symbol === symbol.replace('.N0000', '').toUpperCase());
  const base  = spec ? (live[spec.symbol]?.price ?? spec.seed) : 100;
  const vol   = spec?.volatility ?? 0.015;

  // Number of data points and label format per range
  const config: Record<string, { n: number; fmt: (i: number) => string }> = {
    '1D': { n: 54,  fmt: i => { const h = 9 + Math.floor((i * 5) / 60); const m = (i * 5) % 60; return `${h}:${m.toString().padStart(2,'0')}`; } },
    '1W': { n: 5,   fmt: i => { const d = new Date(); d.setDate(d.getDate() - (4 - i)); return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); } },
    '1M': { n: 22,  fmt: i => { const d = new Date(); d.setDate(d.getDate() - (21 - i)); return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); } },
    '3M': { n: 65,  fmt: i => { const d = new Date(); d.setDate(d.getDate() - (64 - i)); return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); } },
    '1Y': { n: 52,  fmt: i => { const d = new Date(); d.setDate(d.getDate() - (51 - i) * 7); return d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); } },
  };

  const cfg    = config[range] ?? config['1M'];
  // Build random walk in reverse from current price
  const prices: number[] = [base];
  for (let i = 1; i < cfg.n; i++) {
    const prev = prices[0];
    // daily step σ, scaled for range granularity
    const step = (Math.random() - 0.5) * 2 * vol * prev;
    prices.unshift(Math.max(prev + step, prev * 0.7));
  }

  const points: DataPoint[] = prices.map((v, i) => ({
    date: cfg.fmt(i), value: Number(v.toFixed(2)),
  }));

  return Promise.resolve(points);
}

