import type { FeedResult } from '@/types/feeds';
import { padRow, sanitize } from './formatter';

interface ESPNEvent {
  name: string;
  shortName: string;
  status: {
    type: {
      name: string; // 'STATUS_FINAL', 'STATUS_IN_PROGRESS', 'STATUS_SCHEDULED'
      shortDetail: string;
    };
  };
  competitions: Array<{
    competitors: Array<{
      homeAway: string;
      team: { abbreviation: string; displayName: string };
      score: string;
    }>;
  }>;
}

interface ESPNScoreboard {
  events?: ESPNEvent[];
}

function formatGame(event: ESPNEvent, cols: number): string[] {
  const comp = event.competitions[0];
  if (!comp) return [];

  const home = comp.competitors.find((c) => c.homeAway === 'home');
  const away = comp.competitors.find((c) => c.homeAway === 'away');
  if (!home || !away) return [];

  const status = event.status.type.name;
  const detail = event.status.type.shortDetail.toUpperCase().slice(0, 12);

  const awayAbbr = (away.team.abbreviation ?? '???').toUpperCase().slice(0, 3);
  const homeAbbr = (home.team.abbreviation ?? '???').toUpperCase().slice(0, 3);

  if (status === 'STATUS_SCHEDULED') {
    const line = `${awayAbbr} @ ${homeAbbr}  ${detail}`;
    return [padRow(sanitize(line), cols)];
  }

  const awayScore = away.score ?? '0';
  const homeScore = home.score ?? '0';
  const line = `${awayAbbr} ${awayScore.padStart(2)} @ ${homeAbbr} ${homeScore.padStart(2)}  ${detail}`;
  return [padRow(sanitize(line), cols)];
}

export async function fetchSports(
  sport: string,
  league: string,
  cols: number,
): Promise<FeedResult> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'FlipFlap/1.0' },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    return {
      rows: [padRow(`${league.toUpperCase()} SCORES UNAVAILABLE`, cols)],
      feedName: league.toUpperCase(),
      feedIcon: '⚾',
      accentCols: [],
      validUntil: Date.now() + 60_000,
      isRelevant: false,
    };
  }

  const data = (await res.json()) as ESPNScoreboard;
  const events = data.events ?? [];

  if (events.length === 0) {
    return {
      rows: [padRow(`NO ${league.toUpperCase()} GAMES TODAY`, cols)],
      feedName: league.toUpperCase(),
      feedIcon: '⚾',
      accentCols: [],
      validUntil: Date.now() + 300_000,
      isRelevant: false,
    };
  }

  // Prefer live/recent games; sort: in-progress first, then final, then scheduled
  const sorted = [...events].sort((a, b) => {
    const rank = (e: ESPNEvent) => {
      if (e.status.type.name === 'STATUS_IN_PROGRESS') return 0;
      if (e.status.type.name === 'STATUS_FINAL') return 1;
      return 2;
    };
    return rank(a) - rank(b);
  });

  const leagueLabel = league.toUpperCase();
  const icon = league === 'mlb' ? '⚾' : league === 'nba' ? '🏀' : league === 'nfl' ? '🏈' : '🏆';

  const rows: string[] = [padRow(`${leagueLabel} SCORES`, cols)];

  for (const event of sorted.slice(0, 3)) {
    const lines = formatGame(event, cols);
    rows.push(...lines);
  }

  return {
    rows: rows.slice(0, 4),
    feedName: leagueLabel,
    feedIcon: icon,
    accentCols: [0, 1, 2],
    validUntil: Date.now() + 300_000,
    isRelevant: true,
  };
}
