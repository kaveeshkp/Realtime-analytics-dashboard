import { Router, Request, Response, NextFunction } from 'express';
import { fetchCSEQuotes, fetchCSEHistory, CSE_SYMBOLS } from '../services/cseApi';

const router = Router();

// GET /api/cse/quotes — all tracked CSE stocks
router.get('/quotes', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const quotes = await fetchCSEQuotes();
    res.json(quotes);
  } catch (err) {
    next(err);
  }
});

// GET /api/cse/history?symbol=JKH&range=1M
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const symbol = (req.query.symbol as string | undefined)?.toUpperCase().trim();
    const range  = (req.query.range  as string | undefined) ?? '1M';

    if (!symbol) {
      return res.status(400).json({ error: 'symbol query param is required' });
    }

    const validRanges = ['1D', '1W', '1M', '3M', '1Y'];
    if (!validRanges.includes(range)) {
      return res.status(400).json({ error: `range must be one of: ${validRanges.join(', ')}` });
    }

    const history = await fetchCSEHistory(symbol, range);
    res.json(history);
  } catch (err) {
    next(err);
  }
});

// GET /api/cse/symbols — list of tracked symbols
router.get('/symbols', (_req: Request, res: Response) => {
  res.json(CSE_SYMBOLS.map(s => s.replace('.CM', '')));
});

export default router;
