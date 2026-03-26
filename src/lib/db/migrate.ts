import type Database from 'better-sqlite3';
import {
  SCHEMA_VERSION,
  CREATE_META,
  CREATE_APP_CONFIG,
  CREATE_FEEDS,
  CREATE_FEED_CACHE,
  CREATE_MESSAGES,
  CREATE_SCHEDULE_SLOTS,
  CREATE_BOARD_LOG,
} from './schema';
import { DEFAULT_FEEDS, DEFAULT_SCHEDULE, DEFAULT_MESSAGES } from './seeds';

export function runMigrations(db: Database.Database): void {
  db.exec(CREATE_META);

  const row = db
    .prepare('SELECT value FROM _meta WHERE key = ?')
    .get('schema_version') as { value: string } | undefined;

  const current = row ? parseInt(row.value, 10) : 0;

  if (current >= SCHEMA_VERSION) return;

  // ── v1: initial schema ───────────────────────────────────────────────────
  if (current < 1) {
    const migrate1 = db.transaction(() => {
      db.exec(CREATE_APP_CONFIG);
      db.exec(CREATE_FEEDS);
      db.exec(CREATE_FEED_CACHE);
      db.exec(CREATE_MESSAGES);
      db.exec(CREATE_SCHEDULE_SLOTS);
      db.exec(CREATE_BOARD_LOG);

      db.prepare(`INSERT OR IGNORE INTO app_config (id) VALUES (1)`).run();

      for (const feed of DEFAULT_FEEDS) {
        db.prepare(`
          INSERT OR IGNORE INTO feeds (id, type, label, enabled, config_json, cache_ttl, priority)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          feed.id,
          feed.type,
          feed.label,
          feed.enabled ? 1 : 0,
          JSON.stringify(feed.config),
          feed.cacheTtl,
          feed.priority,
        );
      }

      for (const msg of DEFAULT_MESSAGES) {
        db.prepare(`
          INSERT OR IGNORE INTO messages (label, body, category, enabled)
          VALUES (?, ?, ?, ?)
        `).run(msg.label, msg.body, msg.category, msg.enabled ? 1 : 0);
      }

      for (const slot of DEFAULT_SCHEDULE) {
        db.prepare(`
          INSERT OR IGNORE INTO schedule_slots (position, feed_id, message_id, duration, enabled)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          slot.position,
          slot.feedId ?? null,
          slot.messageId ?? null,
          slot.duration,
          slot.enabled ? 1 : 0,
        );
      }

      db.prepare(`INSERT OR REPLACE INTO _meta (key, value) VALUES ('schema_version', '1')`).run();
    });
    migrate1();
  }

  // ── v2: share system + time-of-day scheduling ────────────────────────────
  if (current < 2) {
    const migrate2 = db.transaction(() => {
      // Add share columns to app_config (ignore if already exist)
      const appCols = (db.prepare(`PRAGMA table_info(app_config)`).all() as { name: string }[]).map(
        (r) => r.name,
      );
      if (!appCols.includes('share_token')) {
        db.exec(`ALTER TABLE app_config ADD COLUMN share_token TEXT`);
      }
      if (!appCols.includes('share_enabled')) {
        db.exec(`ALTER TABLE app_config ADD COLUMN share_enabled INTEGER NOT NULL DEFAULT 0`);
      }
      if (!appCols.includes('share_hide_location')) {
        db.exec(`ALTER TABLE app_config ADD COLUMN share_hide_location INTEGER NOT NULL DEFAULT 0`);
      }
      if (!appCols.includes('share_hide_calendar')) {
        db.exec(`ALTER TABLE app_config ADD COLUMN share_hide_calendar INTEGER NOT NULL DEFAULT 0`);
      }

      // Add time-of-day columns to schedule_slots
      const slotCols = (
        db.prepare(`PRAGMA table_info(schedule_slots)`).all() as { name: string }[]
      ).map((r) => r.name);
      if (!slotCols.includes('start_hour')) {
        db.exec(`ALTER TABLE schedule_slots ADD COLUMN start_hour INTEGER`);
      }
      if (!slotCols.includes('end_hour')) {
        db.exec(`ALTER TABLE schedule_slots ADD COLUMN end_hour INTEGER`);
      }

      // Seed new feeds (countdown, sports, stocks)
      for (const feed of DEFAULT_FEEDS) {
        if (['countdown', 'sports', 'stocks'].includes(feed.type)) {
          db.prepare(`
            INSERT OR IGNORE INTO feeds (id, type, label, enabled, config_json, cache_ttl, priority)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
            feed.id,
            feed.type,
            feed.label,
            feed.enabled ? 1 : 0,
            JSON.stringify(feed.config),
            feed.cacheTtl,
            feed.priority,
          );
        }
      }

      db.prepare(`INSERT OR REPLACE INTO _meta (key, value) VALUES ('schema_version', '2')`).run();
    });
    migrate2();
  }
}
