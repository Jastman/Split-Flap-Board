import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const slots = db
    .prepare('SELECT * FROM schedule_slots ORDER BY position')
    .all();
  return NextResponse.json(slots);
}

export async function PUT(req: NextRequest) {
  const body = await req.json() as Array<{
    feed_id?: string;
    message_id?: number;
    duration: number;
    enabled: boolean;
  }>;

  const db = getDb();
  const replace = db.transaction(() => {
    db.prepare('DELETE FROM schedule_slots').run();
    for (let i = 0; i < body.length; i++) {
      const slot = body[i];
      db.prepare(`
        INSERT INTO schedule_slots (position, feed_id, message_id, duration, enabled)
        VALUES (?, ?, ?, ?, ?)
      `).run(i, slot.feed_id ?? null, slot.message_id ?? null, slot.duration, slot.enabled ? 1 : 0);
    }
  });
  replace();

  return NextResponse.json({ success: true });
}
