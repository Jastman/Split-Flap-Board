import type { FeedResult } from '@/types/feeds';
import { padRow } from './formatter';

interface YahooQuote {
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketPreviousClose?: number;
  symbol?: string;
}

interface YahooResponse {
  quoteResponse?: {
    result?: YahooQuote[];
  };
}

function formatTicker(q: YahooQuote, cols: number): string {
  const sym = (q.symbol ?? '???').toUpperCase().slice(0, 5).padEnd(5);
  const price = (q.regularMarketPrice ?? 0).toFixed(2).padStart(8);
  const chg = q.regularMarketChange ?? 0;
  const pct = q.regularMarketChangePercent ?? 0;
  const arrow = chg >= 0 ? '↑' : '↓';
  const pctStr = `${arrow}${Math.abs(pct).toFixed(1)}%`.padStart(7);
  const line = `${sym} ${price} ${pctStr}`;
  return padRow(line, cols);
}

export async function fetchStocks(
  symbols: string[],
  cols: number,
): Promise<FeedResult> {
  if (symbols.length === 0) {
    return {
      rows: [padRow('NO SYMBOLS CONFIGURED', cols)],
      feedName: 'STOCKS',
      feedIcon: '↑',
      accentCols: [],
      validUntil: Date.now() + 300_000,
      isRelevant: false,
    };
  }

  const symList = symbols.slice(0, 6).join(',');
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symList)}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,symbol`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as YahooResponse;
    const quotes = data.quoteResponse?.result ?? [];

    if (quotes.length === 0) {
      return {
        rows: [padRow('MARKET DATA UNAVAILABLE', cols)],
        feedName: 'STOCKS',
        feedIcon: '↑',
        accentCols: [],
        validUntil: Date.now() + 60_000,
        isRelevant: false,
      };
    }

    const rows: string[] = [padRow('MARKET', cols)];
    for (const q of quotes.slice(0, 3)) {
      rows.push(formatTicker(q, cols));
    }

    // Accent columns for header row
    const isMarketUp = (quotes[0]?.regularMarketChange ?? 0) >= 0;

    return {
      rows: rows.slice(0, 4),
      feedName: 'STOCKS',
      feedIcon: isMarketUp ? '↑' : '↓',
      accentCols: [0, 1, 2, 3, 4, 5],
      validUntil: Date.now() + 300_000,
      isRelevant: true,
    };
  } catch {
    return {
      rows: [padRow('MARKET DATA UNAVAILABLE', cols)],
      feedName: 'STOCKS',
      feedIcon: '↑',
      accentCols: [],
      validUntil: Date.now() + 60_000,
      isRelevant: false,
    };
  }
}
