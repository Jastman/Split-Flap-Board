import { NextResponse } from 'next/server';
import { getCurrentBoardState } from '@/lib/feeds/scheduler';
import type { BoardState } from '@/types/board';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { result, revision, config } = await getCurrentBoardState();

    const state: BoardState & { config: typeof config } = {
      rows: result.rows,
      feedName: result.feedName,
      feedIcon: result.feedIcon,
      accentCols: result.accentCols ?? [],
      nextRotationAt: result.validUntil,
      revision,
      config,
    };

    return NextResponse.json(state);
  } catch (err) {
    console.error('Board API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch board state' },
      { status: 500 },
    );
  }
}
