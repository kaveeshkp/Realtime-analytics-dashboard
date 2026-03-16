import { Router, Request, Response, NextFunction } from 'express';
import { cache } from '../cache';
import { fetchStockQuote, fetchStockHistory } from '../services/alphaVantage';

const router = Router();

// GET /api/stocks/quote?symbol=AAPL
router.get('/quote', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const symbol = (req.query.symbol as string | undefined)?.toUpperCase();
    if (!symbol) {
      res.status(400).json({ error: 'symbol is required' });
      return;
    }

    const cacheKey = `stock:quote:${symbol}`;
    const cached   = cache.get(cacheKey);
    if (cached) { res.json(cached); return; }

    const data = await fetchStockQuote(symbol);
    cache.set(cacheKey, data, 30);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/stocks/batch?symbols=AAPL,MSFT,TSLA
router.get('/batch', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = req.query.symbols as string | undefined;
    if (!raw) {
      res.status(400).json({ error: 'symbols is required' });
      return;
    }

    const symbols  = raw.split(',').map(s => s.trim().toUpperCase()).slice(0, 10);
    const cacheKey = `stock:batch:${symbols.join(',')}`;
    const cached   = cache.get(cacheKey);
    if (cached) { res.json(cached); return; }

    const results = await Promise.all(symbols.map(s => fetchStockQuote(s)));
    cache.set(cacheKey, results, 30);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/stocks/history?symbol=AAPL&range=1M
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const symbol = (req.query.symbol as string | undefined)?.toUpperCase();
    if (!symbol) {
      res.status(400).json({ error: 'symbol is required' });
      return;
    }

    const range       = (req.query.range as string | undefined) ?? '1M';
    const validRanges = ['1D', '1W', '1M', '3M', '1Y'];
    if (!validRanges.includes(range)) {
      res.status(400).json({ error: `range must be one of: ${validRanges.join(', ')}` });
      return;
    }

    // Cache TTL scales with requested range — no point caching 1Y for only 30s
    const ttl: Record<string, number> = { '1D': 300, '1W': 900, '1M': 1800, '3M': 2700, '1Y': 3600 };
    const cacheKey = `stock:history:${symbol}:${range}`;
    const cached   = cache.get(cacheKey);
    if (cached) { res.json(cached); return; }

    const data = await fetchStockHistory(symbol, range);
    cache.set(cacheKey, data, ttl[range]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
