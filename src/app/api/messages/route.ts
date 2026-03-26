import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const db = getDb();
  const messages = db.prepare('SELECT * FROM messages ORDER BY category, id').all();
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    label: string;
    body: string;
    category?: string;
    enabled?: boolean;
  };

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO messages (label, body, category, enabled) VALUES (?, ?, ?, ?)
  `).run(body.label, body.body, body.category ?? 'custom', body.enabled !== false ? 1 : 0);

  return NextResponse.json({ id: result.lastInsertRowid });
}
