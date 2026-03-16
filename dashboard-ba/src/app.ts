import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import { env } from './config/env';

import healthRouter  from './routes/health';
import stocksRouter  from './routes/stocks';
import cryptoRouter  from './routes/crypto';
import sportsRouter  from './routes/sports';
import weatherRouter from './routes/weather';
import cseRouter     from './routes/cse';

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET'],
}));

app.use(express.json());

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: 'Too many requests — slow down polling or reduce request frequency.' },
});

app.use('/api', limiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api',         healthRouter);
app.use('/api/stocks',  stocksRouter);
app.use('/api/crypto',  cryptoRouter);
app.use('/api/sports',  sportsRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/cse',     cseRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (axios.isAxiosError(err)) {
    const upstreamStatus = err.response?.status ?? 0;
    const message =
      (err.response?.data as Record<string, unknown>)?.message as string
      ?? err.message;
    console.error('[UPSTREAM]', upstreamStatus, message);
    res.status(502).json({ error: message });
    return;
  }
  // Don't return raw err.message — it may contain internal paths, URLs, or key fragments.
  const isRateLimit = err.message?.includes('rate limit');
  console.error('[ERROR]', err.message);
  res.status(isRateLimit ? 503 : 500).json({
    error: isRateLimit ? 'Upstream API rate limit reached — try again shortly.' : 'Internal server error',
  });
});

export default app;
