import axios from 'axios';
import { MatchScore, Fixture } from '../types';

// ESPN public scoreboard API — no API key required
const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const CRICKET_RSS_URL = 'https://static.cricinfo.com/rss/livescores.xml';

interface LeagueConfig {
  sport:  string;
  league: string;
  label:  string;
}

const LEAGUE_GROUPS: Record<string, LeagueConfig[]> = {
  RUGBY: [
    { sport: 'rugby', league: '282', label: 'RUGBY' },
    { sport: 'rugby', league: '283', label: 'RUGBY' },
    { sport: 'rugby-league', league: '3', label: 'RUGBY' },
  ],
  FOOTBALL: [
    { sport: 'soccer', league: 'fifa.world', label: 'FOOTBALL' },
    { sport: 'soccer', league: 'uefa.champions', label: 'FOOTBALL' },
    { sport: 'soccer', league: 'eng.1', label: 'FOOTBALL' },
  ],
  BASKETBALL: [
    { sport: 'basketball', league: 'fiba', label: 'BASKETBALL' },
    { sport: 'basketball', league: 'mens-olympics-basketball', label: 'BASKETBALL' },
    { sport: 'basketball', league: 'nba', label: 'BASKETBALL' },
  ],
};

function decodeXml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function cricketTitleToTeams(title: string): { home: string; away: string } {
  const head = title.split(',')[0]?.trim() ?? title;
  const split = head.split(/\s+v\s+|\s+vs\s+/i);
  if (split.length >= 2) {
    return { home: split[0].trim(), away: split[1].trim() };
  }
  return { home: head, away: 'Opponent' };
}

function getLeagueConfigs(league: string): LeagueConfig[] {
  if (league === 'ALL') {
    return [...LEAGUE_GROUPS.RUGBY, ...LEAGUE_GROUPS.FOOTBALL, ...LEAGUE_GROUPS.BASKETBALL];
  }
  return LEAGUE_GROUPS[league] ?? [];
}

async function fetchCricketLiveScores(): Promise<MatchScore[]> {
  const { data } = await axios.get<string>(CRICKET_RSS_URL, { timeout: 10_000 });
  const xml = typeof data === 'string' ? data : '';
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);

  return items.slice(0, 20).map((item) => {
    const title = decodeXml(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? 'Cricket Match');
    const pubDate = decodeXml(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? '');
    const { home, away } = cricketTitleToTeams(title);

    return {
      league: 'CRICKET',
      home,
      away,
      homeScore: 0,
      awayScore: 0,
      status: 'LIVE' as const,
      time: pubDate,
      date: new Date(pubDate || Date.now()).toISOString().split('T')[0],
    } satisfies MatchScore;
  });
}

async function fetchEspnLiveScores(cfg: LeagueConfig): Promise<MatchScore[]> {
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
        league: cfg.label,
        home:      teamName(home),
        away:      teamName(away),
        homeScore: parseInt(home?.score ?? '0', 10),
        awayScore: parseInt(away?.score ?? '0', 10),
        status:    mapStatus(e.status?.type?.name ?? 'STATUS_FINAL'),
        time:      e.status?.displayClock ?? '',
        date:      (e.date as string | undefined)?.split('T')[0] ?? '',
      } satisfies MatchScore;
    });
}

async function fetchEspnUpcomingFixtures(cfg: LeagueConfig): Promise<Fixture[]> {
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
        league: cfg.label,
        home:   teamName(home),
        away:   teamName(away),
        status: 'UP' as const,
        time:   (e.date as string | undefined) ?? '',
      } satisfies Fixture;
    });
}

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
  const configs = getLeagueConfigs(league);
  if (league !== 'CRICKET' && league !== 'ALL' && configs.length === 0) {
    throw new Error(`Unknown league: ${league}`);
  }

  const tasks: Promise<MatchScore[]>[] = configs.map(cfg => fetchEspnLiveScores(cfg));
  if (league === 'CRICKET' || league === 'ALL') {
    tasks.push(fetchCricketLiveScores());
  }

  const settled = await Promise.allSettled(tasks);
  return settled
    .filter((r): r is PromiseFulfilledResult<MatchScore[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function fetchUpcoming(league: string): Promise<Fixture[]> {
  const configs = getLeagueConfigs(league);
  if (league !== 'CRICKET' && league !== 'ALL' && configs.length === 0) {
    throw new Error(`Unknown league: ${league}`);
  }
  if (league === 'CRICKET') {
    return [];
  }

  const settled = await Promise.allSettled(configs.map(cfg => fetchEspnUpcomingFixtures(cfg)));
  return settled
    .filter((r): r is PromiseFulfilledResult<Fixture[]> => r.status === 'fulfilled')
    .flatMap(r => r.value);
}
