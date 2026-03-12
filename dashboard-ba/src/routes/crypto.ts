import { Router, Request, Response, NextFunction } from 'express';
import { cache } from '../cache';
import { fetchCryptoPrices, fetchCryptoHistory } from '../services/coinGecko';

const router = Router();

// GET /api/crypto/prices
router.get('/prices', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'crypto:prices';
    const cached   = cache.get(cacheKey);
    if (cached) { res.json(cached); return; }

    const data = await fetchCryptoPrices();
    cache.set(cacheKey, data, 30);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/crypto/history?coin=bitcoin&days=30
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coin    = (req.query.coin as string | undefined) ?? 'bitcoin';
    const daysRaw = req.query.days as string | undefined;
    const days    = daysRaw ? parseInt(daysRaw, 10) : 30;

    if (isNaN(days) || days < 1) {
      res.status(400).json({ error: 'days must be a positive integer' });
      return;
    }

    const cacheKey = `crypto:history:${coin}:${days}`;
    const cached   = cache.get(cacheKey);
    if (cached) { res.json(cached); return; }

    const data = await fetchCryptoHistory(coin, days);
    cache.set(cacheKey, data, 300);   // 5-minute cache
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
