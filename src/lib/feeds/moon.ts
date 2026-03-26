import type { FeedResult } from '@/types/feeds';
import { padRow } from './formatter';

function getMoonPhase(date: Date): { phase: string; illumination: number; emoji: string } {
  // Calculate Julian Date
  const JD =
    date.getTime() / 86400000 + 2440587.5;

  // Days since known New Moon (Jan 6, 2000 18:14 UTC)
  const knownNewMoon = 2451549.5;
  const synodicPeriod = 29.53058867;
  const daysSinceNew = ((JD - knownNewMoon) % synodicPeriod + synodicPeriod) % synodicPeriod;
  const illumination = Math.round(
    50 * (1 - Math.cos((2 * Math.PI * daysSinceNew) / synodicPeriod)),
  );

  let phase: string;
  let emoji: string;
  const p = daysSinceNew / synodicPeriod;

  if (p < 0.0337 || p >= 0.9663) {
    phase = 'NEW MOON';
    emoji = 'NEW';
  } else if (p < 0.2337) {
    phase = 'WAXING CRESCENT';
    emoji = 'WXG CRE';
  } else if (p < 0.2663) {
    phase = 'FIRST QUARTER';
    emoji = '1ST QTR';
  } else if (p < 0.4837) {
    phase = 'WAXING GIBBOUS';
    emoji = 'WXG GIB';
  } else if (p < 0.5163) {
    phase = 'FULL MOON';
    emoji = 'FULL';
  } else if (p < 0.7163) {
    phase = 'WANING GIBBOUS';
    emoji = 'WNG GIB';
  } else if (p < 0.7337) {
    phase = 'LAST QUARTER';
    emoji = 'LST QTR';
  } else {
    phase = 'WANING CRESCENT';
    emoji = 'WNG CRE';
  }

  return { phase, illumination, emoji };
}

export function fetchMoon(cols: number): FeedResult {
  const now = new Date();
  const { phase, illumination } = getMoonPhase(now);

  const row1 = padRow('MOON PHASE', cols);
  const row2 = padRow(`${phase}  ${illumination}% LIT`, cols);

  return {
    rows: [row1, row2],
    feedName: 'MOON',
    feedIcon: 'moon',
    accentCols: [],
    validUntil: Date.now() + 3600_000,
    isRelevant: true,
  };
}
