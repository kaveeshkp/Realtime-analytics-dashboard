import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

import healthRouter  from './routes/health';
import stocksRouter  from './routes/stocks';
import cryptoRouter  from './routes/crypto';
import sportsRouter  from './routes/sports';
import weatherRouter from './routes/weather';
import cseRouter     from './routes/cse';
import { initWebSocket } from './websocket/wsServer';

const app  = express();
const PORT = process.env.PORT ?? 5000;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .concat(['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173']);

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET'],
}));

app.use(express.json());

// ── Rate limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs:        15 * 60 * 1000,   // 15 minutes
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: 'Too many requests — slow down polling or reduce request frequency.' },
});

app.use('/api', limiter);

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api',         healthRouter);
app.use('/api/stocks',  stocksRouter);
app.use('/api/crypto',  cryptoRouter);
app.use('/api/sports',  sportsRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/cse',     cseRouter);

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
// Intentional 4-parameter signature required by Express for error middleware.
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
  console.error('[ERROR]', err.message);
  res.status(502).json({ error: err.message ?? 'Internal server error' });
});

// ── Server ───────────────────────────────────────────────────────────────────
const server = createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Backend running  →  http://localhost:${PORT}`);
  console.log(`WebSocket live   →  ws://localhost:${PORT}/ws`);
});
