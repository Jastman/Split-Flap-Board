import type { FeedResult } from '@/types/feeds';
import { padRow, center, wordWrap } from './formatter';
import { QUOTES } from './quotes-data';

let quoteIndex = 0;

export function fetchQuote(categories: string[], cols: number): FeedResult {
  const filtered = QUOTES.filter((q) =>
    categories.length === 0 || categories.includes(q.category),
  );

  if (filtered.length === 0) {
    return {
      rows: [padRow('NO QUOTES CONFIGURED', cols)],
      feedName: 'QUOTES',
      feedIcon: 'quote',
      validUntil: Date.now() + 30_000,
      isRelevant: true,
    };
  }

  const quote = filtered[quoteIndex % filtered.length];
  quoteIndex = (quoteIndex + 1) % filtered.length;

  const lines = wordWrap(quote.text, cols);
  const attribution = `— ${quote.author}`;

  const row1 = padRow(center(lines[0] ?? '', cols), cols);
  const row2 = lines[1]
    ? padRow(center(lines[1], cols), cols)
    : padRow(center(attribution, cols), cols);
  const row3 = lines[1]
    ? padRow(center(attribution, cols), cols)
    : undefined;

  return {
    rows: row3 ? [row1, row2, row3] : [row1, row2],
    feedName: 'QUOTE',
    feedIcon: 'quote',
    accentCols: [],
    validUntil: Date.now() + 30_000,
    isRelevant: true,
  };
}
