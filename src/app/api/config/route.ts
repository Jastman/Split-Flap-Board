import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { AppConfig } from '@/types/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();
  const row = db.prepare('SELECT * FROM app_config WHERE id = 1').get() as Record<string, unknown>;
  return NextResponse.json(dbRowToConfig(row));
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Partial<AppConfig>;
  const db = getDb();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (body.latitude !== undefined) { updates.push('latitude = ?'); values.push(body.latitude); }
  if (body.longitude !== undefined) { updates.push('longitude = ?'); values.push(body.longitude); }
  if (body.timezone !== undefined) { updates.push('timezone = ?'); values.push(body.timezone); }
  if (body.cols !== undefined) { updates.push('cols = ?'); values.push(body.cols); }
  if (body.rows !== undefined) { updates.push('rows = ?'); values.push(body.rows); }
  if (body.flipSpeed !== undefined) { updates.push('flip_speed = ?'); values.push(body.flipSpeed); }
  if (body.waveDelay !== undefined) { updates.push('wave_delay = ?'); values.push(body.waveDelay); }
  if (body.audioEnabled !== undefined) { updates.push('audio_enabled = ?'); values.push(body.audioEnabled ? 1 : 0); }
  if (body.audioVolume !== undefined) { updates.push('audio_volume = ?'); values.push(body.audioVolume); }
  if (body.brightness !== undefined) { updates.push('brightness = ?'); values.push(body.brightness); }
  if (body.accentColor !== undefined) { updates.push('accent_color = ?'); values.push(body.accentColor); }
  if (body.boardBg !== undefined) { updates.push('board_bg = ?'); values.push(body.boardBg); }
  if (body.cellBg !== undefined) { updates.push('cell_bg = ?'); values.push(body.cellBg); }
  if (body.charColor !== undefined) { updates.push('char_color = ?'); values.push(body.charColor); }
  if (body.fontFamily !== undefined) { updates.push('font_family = ?'); values.push(body.fontFamily); }
  if (body.cellWidth !== undefined) { updates.push('cell_width = ?'); values.push(body.cellWidth); }
  if (body.cellHeight !== undefined) { updates.push('cell_height = ?'); values.push(body.cellHeight); }
  if (body.presetId !== undefined) { updates.push('preset_id = ?'); values.push(body.presetId); }
  if (body.rotationInterval !== undefined) { updates.push('rotation_interval = ?'); values.push(body.rotationInterval); }

  if (updates.length > 0) {
    updates.push('updated_at = unixepoch()');
    values.push(1);
    db.prepare(`UPDATE app_config SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  const updated = db.prepare('SELECT * FROM app_config WHERE id = 1').get() as Record<string, unknown>;
  return NextResponse.json(dbRowToConfig(updated));
}

function dbRowToConfig(row: Record<string, unknown>): AppConfig {
  return {
    id: 1,
    latitude: (row.latitude as number) ?? 40.7128,
    longitude: (row.longitude as number) ?? -74.006,
    timezone: (row.timezone as string) ?? 'America/New_York',
    cols: (row.cols as number) ?? 26,
    rows: (row.rows as number) ?? 3,
    fontSize: (row.font_size as number) ?? 1.0,
    flipSpeed: (row.flip_speed as number) ?? 80,
    waveDelay: (row.wave_delay as number) ?? 40,
    audioEnabled: Boolean(row.audio_enabled),
    audioVolume: (row.audio_volume as number) ?? 0.7,
    brightness: (row.brightness as number) ?? 1.0,
    accentColor: (row.accent_color as string) ?? '#e85d04',
    boardBg: (row.board_bg as string) ?? '#1a1a1a',
    cellBg: (row.cell_bg as string) ?? '#111111',
    charColor: (row.char_color as string) ?? '#f5f0e8',
    fontFamily: (row.font_family as string) ?? "'Courier Prime', monospace",
    cellWidth: (row.cell_width as string) ?? '2.4rem',
    cellHeight: (row.cell_height as string) ?? '4rem',
    presetId: (row.preset_id as string) ?? 'twa',
    rotationInterval: (row.rotation_interval as number) ?? 30,
  };
}
