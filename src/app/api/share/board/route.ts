import { NextRequest, NextResponse } from 'next/server';
import { getCurrentBoardState } from '@/lib/feeds/scheduler';
import { getDb } from '@/lib/db';
import type { BoardState } from '@/types/board';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const db = getDb();
  const row = db
    .prepare('SELECT share_token, share_enabled, share_hide_location FROM app_config WHERE id = 1')
    .get() as {
      share_token: string | null;
      share_enabled: number;
      share_hide_location: number;
    } | undefined;

  if (!row?.share_enabled || row.share_token !== token) {
    return NextResponse.json({ error: 'Invalid or disabled share link' }, { status: 403 });
  }

  try {
    const { result, revision, config } = await getCurrentBoardState();

    // Strip location if owner chose privacy
    const publicConfig = row.share_hide_location
      ? { ...config, latitude: 0, longitude: 0 }
      : config;

    const state: BoardState & { config: typeof publicConfig } = {
      rows: result.rows,
      feedName: result.feedName,
      feedIcon: result.feedIcon,
      accentCols: result.accentCols ?? [],
      nextRotationAt: result.validUntil,
      revision,
      config: publicConfig,
    };

    return NextResponse.json(state, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('Share board API error:', err);
    return NextResponse.json({ error: 'Failed to fetch board state' }, { status: 500 });
  }
}
