import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const db = getDb();
  const feeds = db.prepare('SELECT * FROM feeds ORDER BY priority DESC').all();
  const caches = db.prepare('SELECT feed_id, expires_at, error FROM feed_cache').all() as {
    feed_id: string;
    expires_at: number;
    error: string | null;
  }[];

  const cacheMap = Object.fromEntries(caches.map((c) => [c.feed_id, c]));

  const result = (feeds as Record<string, unknown>[]).map((f) => ({
    id: f.id,
    type: f.type,
    label: f.label,
    enabled: Boolean(f.enabled),
    config: JSON.parse((f.config_json as string) ?? '{}'),
    cacheTtl: f.cache_ttl,
    priority: f.priority,
    lastFetched: cacheMap[f.id as string]?.expires_at
      ? (cacheMap[f.id as string].expires_at as number) * 1000 - (f.cache_ttl as number) * 1000
      : null,
    error: cacheMap[f.id as string]?.error ?? null,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    id: string;
    type: string;
    label: string;
    enabled?: boolean;
    config?: Record<string, unknown>;
    cacheTtl?: number;
    priority?: number;
  };

  const db = getDb();
  db.prepare(`
    INSERT INTO feeds (id, type, label, enabled, config_json, cache_ttl, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    body.id,
    body.type,
    body.label,
    body.enabled !== false ? 1 : 0,
    JSON.stringify(body.config ?? {}),
    body.cacheTtl ?? 300,
    body.priority ?? 5,
  );

  return NextResponse.json({ success: true });
}
