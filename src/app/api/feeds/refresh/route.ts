import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/feeds/cache';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json() as { feedId: string };
  invalidateCache(body.feedId);
  return NextResponse.json({ success: true });
}
