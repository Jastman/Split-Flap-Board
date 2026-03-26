import type { FeedResult } from '@/types/feeds';
import { padRow } from './formatter';

export function fetchCountdown(
  label: string,
  targetDate: string,
  cols: number,
): FeedResult {
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return {
      rows: [padRow(label, cols), padRow('THE TIME IS NOW', cols)],
      feedName: 'COUNTDOWN',
      feedIcon: '⏱',
      accentCols: [],
      validUntil: now + 60_000,
      isRelevant: true,
    };
  }

  const totalSecs = Math.floor(diff / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}D`);
  if (days < 30) {
    parts.push(`${String(hours).padStart(2, '0')}H`);
    parts.push(`${String(mins).padStart(2, '0')}M`);
    if (days === 0) parts.push(`${String(secs).padStart(2, '0')}S`);
  }

  const countStr = parts.join(' ');
  const untilStr = `UNTIL ${label}`;

  return {
    rows: [padRow(untilStr, cols), padRow(countStr, cols)],
    feedName: 'COUNTDOWN',
    feedIcon: '⏱',
    accentCols: [],
    validUntil: now + 1000,
    isRelevant: true,
  };
}
