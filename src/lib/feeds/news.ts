import Parser from 'rss-parser';
import type { FeedResult } from '@/types/feeds';
import { sanitize, padRow, wordWrap } from './formatter';

const parser = new Parser({ timeout: 8000 });

export async function fetchNews(
  rssUrl: string,
  source: string,
  cols: number,
): Promise<FeedResult[]> {
  const feed = await parser.parseURL(rssUrl);
  const items = feed.items.slice(0, 5);

  return items.map((item) => {
    const title = sanitize(item.title ?? 'NO TITLE');
    const lines = wordWrap(title, cols);
    const row1 = padRow(source.slice(0, cols), cols);
    const row2 = padRow(lines[0] ?? '', cols);
    const row3 = lines[1] ? padRow(lines[1], cols) : undefined;

    const rows = row3 ? [row1, row2, row3] : [row1, row2];

    return {
      rows,
      feedName: 'NEWS',
      feedIcon: 'newspaper',
      accentCols: [],
      validUntil: Date.now() + 900_000,
      isRelevant: true,
    };
  });
}
