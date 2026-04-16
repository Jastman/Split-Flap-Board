import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/share — return current share settings */
export async function GET() {
  const db = getDb();
  const row = db
    .prepare('SELECT share_token, share_enabled, share_hide_location, share_hide_calendar FROM app_config WHERE id = 1')
    .get() as {
      share_token: string | null;
      share_enabled: number;
      share_hide_location: number;
      share_hide_calendar: number;
    } | undefined;

  return NextResponse.json({
    token: row?.share_token ?? null,
    enabled: Boolean(row?.share_enabled),
    hideLocation: Boolean(row?.share_hide_location),
    hideCalendar: Boolean(row?.share_hide_calendar),
  });
}

/** POST /api/share — generate a new share token and update settings */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    enabled?: boolean;
    hideLocation?: boolean;
    hideCalendar?: boolean;
    regenerate?: boolean;
  };

  const db = getDb();

  const current = db
    .prepare('SELECT share_token FROM app_config WHERE id = 1')
    .get() as { share_token: string | null } | undefined;

  // Generate a new token if none exists or regeneration requested
  let token = current?.share_token ?? null;
  if (!token || body.regenerate) {
    token = crypto.randomUUID();
  }

  const updates: string[] = ['share_token = ?', 'updated_at = unixepoch()'];
  const values: unknown[] = [token];

  if (body.enabled !== undefined) { updates.push('share_enabled = ?'); values.push(body.enabled ? 1 : 0); }
  if (body.hideLocation !== undefined) { updates.push('share_hide_location = ?'); values.push(body.hideLocation ? 1 : 0); }
  if (body.hideCalendar !== undefined) { updates.push('share_hide_calendar = ?'); values.push(body.hideCalendar ? 1 : 0); }

  values.push(1); // WHERE id = 1
  db.prepare(`UPDATE app_config SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  return NextResponse.json({ token, ok: true });
}

/** DELETE /api/share — disable sharing */
export async function DELETE() {
  const db = getDb();
  db.prepare('UPDATE app_config SET share_enabled = 0, updated_at = unixepoch() WHERE id = 1').run();
  return NextResponse.json({ ok: true });
}
