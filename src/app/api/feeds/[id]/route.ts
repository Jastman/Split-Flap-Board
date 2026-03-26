import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const db = getDb();
  const feed = db.prepare('SELECT * FROM feeds WHERE id = ?').get(params.id);
  if (!feed) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(feed);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await req.json() as Record<string, unknown>;
  const db = getDb();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.label !== undefined) { updates.push('label = ?'); values.push(body.label); }
  if (body.enabled !== undefined) { updates.push('enabled = ?'); values.push(body.enabled ? 1 : 0); }
  if (body.config !== undefined) { updates.push('config_json = ?'); values.push(JSON.stringify(body.config)); }
  if (body.cacheTtl !== undefined) { updates.push('cache_ttl = ?'); values.push(body.cacheTtl); }
  if (body.priority !== undefined) { updates.push('priority = ?'); values.push(body.priority); }

  if (updates.length > 0) {
    updates.push('updated_at = unixepoch()');
    values.push(params.id);
    db.prepare(`UPDATE feeds SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const db = getDb();
  db.prepare('DELETE FROM feeds WHERE id = ?').run(params.id);
  return NextResponse.json({ success: true });
}
