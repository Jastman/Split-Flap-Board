import { getDb } from '@/lib/db';
import type { FeedResult } from '@/types/feeds';

export function getCachedFeed(feedId: string): FeedResult | null {
  const db = getDb();
  const row = db
    .prepare(
      'SELECT data_json, expires_at FROM feed_cache WHERE feed_id = ?',
    )
    .get(feedId) as { data_json: string; expires_at: number } | undefined;

  if (!row) return null;
  if (Date.now() / 1000 > row.expires_at) return null;

  try {
    return JSON.parse(row.data_json) as FeedResult;
  } catch {
    return null;
  }
}

export function getStaleCache(feedId: string): FeedResult | null {
  const db = getDb();
  const row = db
    .prepare('SELECT data_json FROM feed_cache WHERE feed_id = ?')
    .get(feedId) as { data_json: string } | undefined;

  if (!row) return null;
  try {
    return JSON.parse(row.data_json) as FeedResult;
  } catch {
    return null;
  }
}

export function setCachedFeed(feedId: string, result: FeedResult, ttlSeconds: number): void {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  db.prepare(`
    INSERT OR REPLACE INTO feed_cache (feed_id, data_json, fetched_at, expires_at, error)
    VALUES (?, ?, ?, ?, NULL)
  `).run(feedId, JSON.stringify(result), now, now + ttlSeconds);
}

export function setFeedError(feedId: string, error: string): void {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  db.prepare(`
    INSERT INTO feed_cache (feed_id, data_json, fetched_at, expires_at, error)
    VALUES (?, '{}', ?, ?, ?)
    ON CONFLICT(feed_id) DO UPDATE SET error = excluded.error, fetched_at = excluded.fetched_at
  `).run(feedId, now, now + 60, error);
}

export function invalidateCache(feedId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM feed_cache WHERE feed_id = ?').run(feedId);
}
