import axios from 'axios';
import { MatchScore, Fixture } from '../types';

// ESPN public scoreboard API — no API key required
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

interface LeagueConfig {
  sport:  string;
  league: string;
}

const LEAGUE_MAP: Record<string, LeagueConfig> = {
  NBA: { sport: 'basketball',      league: 'nba'   },
  NFL: { sport: 'football',        league: 'nfl'   },
  EPL: { sport: 'soccer',          league: 'eng.1' },
  MLB: { sport: 'baseball',        league: 'mlb'   },
};

function espnDateStr(date: Date): string {
  // YYYYMMDD format required by ESPN
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function mapStatus(typeName: string): 'FT' | 'LIVE' | 'UP' {
  if (typeName === 'STATUS_FINAL')       return 'FT';
  if (typeName === 'STATUS_IN_PROGRESS') return 'LIVE';
  return 'UP';
}

function teamName(competitor: any): string {
  return (
    competitor?.team?.shortDisplayName ??
    competitor?.team?.displayName ??
    'Unknown'
  );
}

export async function fetchLiveScores(league: string): Promise<MatchScore[]> {
  const cfg = LEAGUE_MAP[league];
  if (!cfg) throw new Error(`Unknown league: ${league}`);

  const { data } = await axios.get(
    `${ESPN_BASE}/${cfg.sport}/${cfg.league}/scoreboard`,
    { timeout: 10_000 },
  );

  const events: any[] = data.events ?? [];

  return events
    .filter(e => {
      const name: string = e.status?.type?.name ?? '';
      return name === 'STATUS_FINAL' || name === 'STATUS_IN_PROGRESS';
    })
    .map(e => {
      const comp = e.competitions?.[0];
      const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
      const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');

      return {
        league,
        home:      teamName(home),
        away:      teamName(away),
        homeScore: parseInt(home?.score ?? '0', 10),
        awayScore: parseInt(away?.score ?? '0', 10),
        status:    mapStatus(e.status?.type?.name ?? 'STATUS_FINAL'),
        time:      e.status?.displayClock ?? '',
        date:      (e.date as string | undefined)?.split('T')[0] ?? '',
      } satisfies MatchScore;
    })
    .reverse();   // most recent first
}

export async function fetchUpcoming(league: string): Promise<Fixture[]> {
  const cfg = LEAGUE_MAP[league];
  if (!cfg) throw new Error(`Unknown league: ${league}`);

  // Fetch the next 7 days using ESPN date-range parameter
  const today   = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 7);
  const dateRange = `${espnDateStr(today)}-${espnDateStr(endDate)}`;

  const { data } = await axios.get(
    `${ESPN_BASE}/${cfg.sport}/${cfg.league}/scoreboard`,
    { params: { dates: dateRange }, timeout: 10_000 },
  );

  const events: any[] = data.events ?? [];

  return events
    .filter(e => (e.status?.type?.name ?? '') === 'STATUS_SCHEDULED')
    .map(e => {
      const comp = e.competitions?.[0];
      const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
      const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');

      return {
        league,
        home:   teamName(home),
        away:   teamName(away),
        status: 'UP' as const,
        time:   (e.date as string | undefined) ?? '',
      } satisfies Fixture;
    });
}
