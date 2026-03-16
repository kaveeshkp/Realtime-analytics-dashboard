import { Router, Request, Response, NextFunction } from 'express';
import { cache } from '../cache';
import { fetchLiveScores, fetchUpcoming, fetchCricketHistory } from '../services/sportsApi';

const router       = Router();
const VALID_LEAGUES = ['ALL', 'CRICKET', 'RUGBY', 'FOOTBALL', 'BASKETBALL'];

// GET /api/sports/live?league=ALL
router.get('/live', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const league = ((req.query.league as string | undefined) ?? 'ALL').toUpperCase();
    if (!VALID_LEAGUES.includes(league)) {
      res.status(400).json({ error: `league must be one of: ${VALID_LEAGUES.join(', ')}` });
      return;
    }

    const cacheKey = `sports:live:${league}`;
    const cached   = cache.get(cacheKey);
    if (cached) { res.json(cached); return; }

    const data = await fetchLiveScores(league);
    cache.set(cacheKey, data, 60);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/sports/upcoming?league=ALL
router.get('/upcoming', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const league = ((req.query.league as string | undefined) ?? 'ALL').toUpperCase();
    if (!VALID_LEAGUES.includes(league)) {
      res.status(400).json({ error: `league must be one of: ${VALID_LEAGUES.join(', ')}` });
      return;
    }

    const cacheKey = `sports:upcoming:${league}`;
    const cached   = cache.get(cacheKey);
    if (cached) { res.json(cached); return; }

    const data = await fetchUpcoming(league);
    cache.set(cacheKey, data, 300);   // 5-minute cache
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/sports/history?league=CRICKET&days=60
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const league = ((req.query.league as string | undefined) ?? 'CRICKET').toUpperCase();
    if (league !== 'CRICKET') {
      res.status(400).json({ error: 'history currently supports league=CRICKET only' });
      return;
    }

    const daysRaw = req.query.days as string | undefined;
    const days = daysRaw ? parseInt(daysRaw, 10) : 60;
    if (!Number.isInteger(days) || days < 1 || days > 90) {
      res.status(400).json({ error: 'days must be an integer between 1 and 90' });
      return;
    }

    const cacheKey = `sports:history:${league}:${days}`;
    const cached   = cache.get(cacheKey);
    if (cached) { res.json(cached); return; }

    const data = await fetchCricketHistory(days);
    cache.set(cacheKey, data, 600); // 10 minutes
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
