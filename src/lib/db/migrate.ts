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

  const migrate = db.transaction(() => {
    db.exec(CREATE_APP_CONFIG);
    db.exec(CREATE_FEEDS);
    db.exec(CREATE_FEED_CACHE);
    db.exec(CREATE_MESSAGES);
    db.exec(CREATE_SCHEDULE_SLOTS);
    db.exec(CREATE_BOARD_LOG);

    // Seed default config
    db.prepare(`
      INSERT OR IGNORE INTO app_config (id) VALUES (1)
    `).run();

    // Seed default feeds
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

    // Seed default messages (preset quotes)
    for (const msg of DEFAULT_MESSAGES) {
      db.prepare(`
        INSERT OR IGNORE INTO messages (label, body, category, enabled)
        VALUES (?, ?, ?, ?)
      `).run(msg.label, msg.body, msg.category, msg.enabled ? 1 : 0);
    }

    // Seed default schedule
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

    db.prepare(`
      INSERT OR REPLACE INTO _meta (key, value) VALUES ('schema_version', ?)
    `).run(String(SCHEMA_VERSION));
  });

  migrate();
}
