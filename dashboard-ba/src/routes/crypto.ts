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
    const rawCoin = (req.query.coin as string | undefined) ?? 'bitcoin';
    // Whitelist: only lowercase letters, digits, and hyphens (CoinGecko coin IDs)
    if (!/^[a-z0-9-]{1,64}$/.test(rawCoin)) {
      res.status(400).json({ error: 'invalid coin identifier' });
      return;
    }
    const coin    = rawCoin;
    const daysRaw = req.query.days as string | undefined;
    const days    = daysRaw ? parseInt(daysRaw, 10) : 30;

    if (isNaN(days) || days < 1 || days > 365) {
      res.status(400).json({ error: 'days must be an integer between 1 and 365' });
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
