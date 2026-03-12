import { Router, Request, Response, NextFunction } from 'express';
import { cache } from '../cache';
import { fetchLiveScores, fetchUpcoming } from '../services/sportsApi';

const router       = Router();
const VALID_LEAGUES = ['NBA', 'NFL', 'EPL', 'MLB'];

// GET /api/sports/live?league=NBA
router.get('/live', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const league = ((req.query.league as string | undefined) ?? 'NBA').toUpperCase();
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

// GET /api/sports/upcoming?league=NFL
router.get('/upcoming', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const league = ((req.query.league as string | undefined) ?? 'NFL').toUpperCase();
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

export default router;
