import dotenv from 'dotenv';
dotenv.config();

const NODE_ENV = process.env.NODE_ENV ?? 'development';

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
];

function parseOrigins(raw: string | undefined): string[] {
  if (!raw) {
    if (NODE_ENV === 'production') {
      throw new Error('ALLOWED_ORIGIN must be set in production');
    }
    return DEFAULT_ORIGINS;
  }
  return raw.split(',').map(o => o.trim());
}

function parsePort(raw: string | undefined): number {
  const n = Number(raw ?? 5000);
  if (!Number.isInteger(n) || n <= 0 || n > 65535) {
    throw new Error(`Invalid PORT value: ${raw ?? ''}`);
  }
  return n;
}

export const env = {
  NODE_ENV,
  PORT:            parsePort(process.env.PORT),
  ALLOWED_ORIGINS: parseOrigins(process.env.ALLOWED_ORIGIN),

  ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY ?? '',
  COINGECKO_API_KEY:     process.env.COINGECKO_API_KEY ?? '',
  OPENWEATHER_API_KEY:   process.env.OPENWEATHER_API_KEY ?? '',
} as const;
