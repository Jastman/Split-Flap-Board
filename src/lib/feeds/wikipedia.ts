import type { FeedResult } from '@/types/feeds';
import { sanitize, padRow, wordWrap } from './formatter';

interface WikiEvent {
  text: string;
  year: number;
}

interface WikiResponse {
  events: WikiEvent[];
}

export async function fetchWikipediaOnThisDay(cols: number): Promise<FeedResult> {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Flipflap/1.0 (open-source split-flap board)' },
    next: { revalidate: 86400 },
  });

  if (!res.ok) throw new Error(`Wikipedia ${res.status}`);

  const data: WikiResponse = await res.json();
  const events = data.events ?? [];

  if (events.length === 0) {
    return {
      rows: [padRow('ON THIS DAY', cols), padRow('NO EVENTS FOUND', cols)],
      feedName: 'ON THIS DAY',
      feedIcon: 'book',
      accentCols: [],
      validUntil: Date.now() + 86400_000,
      isRelevant: true,
    };
  }

  // Pick a random event (seeded by day so it stays consistent within a day)
  const seed = now.getDate() + now.getMonth() * 31;
  const idx = seed % events.length;
  const event = events[idx];

  const text = sanitize(event.text ?? '').slice(0, cols * 2);
  const lines = wordWrap(text, cols);

  const row1 = padRow(`ON THIS DAY  ${event.year}`, cols);
  const row2 = padRow(lines[0] ?? '', cols);
  const rows: string[] = lines[1]
    ? [row1, row2, padRow(lines[1], cols)]
    : [row1, row2];

  return {
    rows,
    feedName: 'ON THIS DAY',
    feedIcon: 'book',
    accentCols: [],
    validUntil: Date.now() + 86400_000,
    isRelevant: true,
  };
}
