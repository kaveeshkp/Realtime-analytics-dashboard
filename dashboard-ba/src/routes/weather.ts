import { Router, Request, Response, NextFunction } from 'express';
import { cache } from '../cache';
import { fetchCurrentWeather, fetchWeatherForecast } from '../services/openWeather';

const router = Router();

// GET /api/weather/current?city=London
router.get('/current', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = req.query.city as string | undefined;
    if (!city) {
      res.status(400).json({ error: 'city is required' });
      return;
    }

    const cacheKey = `weather:current:${city.toLowerCase()}`;
    const cached   = cache.get(cacheKey);
    if (cached) { res.json(cached); return; }

    const data = await fetchCurrentWeather(city);
    cache.set(cacheKey, data, 300);   // 5 minutes
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/weather/forecast?city=London
router.get('/forecast', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const city = req.query.city as string | undefined;
    if (!city) {
      res.status(400).json({ error: 'city is required' });
      return;
    }

    const cacheKey = `weather:forecast:${city.toLowerCase()}`;
    const cached   = cache.get(cacheKey);
    if (cached) { res.json(cached); return; }

    const data = await fetchWeatherForecast(city);
    cache.set(cacheKey, data, 1800);  // 30 minutes
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
