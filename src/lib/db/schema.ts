export const SCHEMA_VERSION = 2;

export const CREATE_META = `
CREATE TABLE IF NOT EXISTS _meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

export const CREATE_APP_CONFIG = `
CREATE TABLE IF NOT EXISTS app_config (
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  latitude         REAL    NOT NULL DEFAULT 40.7128,
  longitude        REAL    NOT NULL DEFAULT -74.0060,
  timezone         TEXT    NOT NULL DEFAULT 'America/New_York',
  cols             INTEGER NOT NULL DEFAULT 32,
  rows             INTEGER NOT NULL DEFAULT 4,
  font_size        REAL    NOT NULL DEFAULT 1.0,
  flip_speed       INTEGER NOT NULL DEFAULT 150,
  wave_delay       INTEGER NOT NULL DEFAULT 40,
  audio_enabled    INTEGER NOT NULL DEFAULT 1,
  audio_volume     REAL    NOT NULL DEFAULT 0.7,
  brightness       REAL    NOT NULL DEFAULT 1.0,
  accent_color     TEXT    NOT NULL DEFAULT '#e85d04',
  board_bg         TEXT    NOT NULL DEFAULT '#1a1a1a',
  cell_bg          TEXT    NOT NULL DEFAULT '#111111',
  char_color       TEXT    NOT NULL DEFAULT '#f5f0e8',
  font_family      TEXT    NOT NULL DEFAULT '''Courier Prime'', ''Courier New'', monospace',
  cell_width       TEXT    NOT NULL DEFAULT '2.4rem',
  cell_height      TEXT    NOT NULL DEFAULT '4rem',
  preset_id        TEXT    NOT NULL DEFAULT 'twa',
  rotation_interval INTEGER NOT NULL DEFAULT 30,
  share_token      TEXT,
  share_enabled    INTEGER NOT NULL DEFAULT 0,
  share_hide_location INTEGER NOT NULL DEFAULT 0,
  share_hide_calendar INTEGER NOT NULL DEFAULT 0,
  updated_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
`;

export const CREATE_FEEDS = `
CREATE TABLE IF NOT EXISTS feeds (
  id          TEXT    PRIMARY KEY,
  type        TEXT    NOT NULL,
  label       TEXT    NOT NULL,
  enabled     INTEGER NOT NULL DEFAULT 1,
  config_json TEXT    NOT NULL DEFAULT '{}',
  cache_ttl   INTEGER NOT NULL DEFAULT 300,
  priority    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);
`;

export const CREATE_FEED_CACHE = `
CREATE TABLE IF NOT EXISTS feed_cache (
  feed_id    TEXT    PRIMARY KEY REFERENCES feeds(id) ON DELETE CASCADE,
  data_json  TEXT    NOT NULL,
  fetched_at INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at INTEGER NOT NULL,
  error      TEXT
);
`;

export const CREATE_MESSAGES = `
CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  label      TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  category   TEXT    NOT NULL DEFAULT 'custom',
  enabled    INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
`;

export const CREATE_SCHEDULE_SLOTS = `
CREATE TABLE IF NOT EXISTS schedule_slots (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  position   INTEGER NOT NULL,
  feed_id    TEXT    REFERENCES feeds(id) ON DELETE SET NULL,
  message_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
  duration   INTEGER NOT NULL DEFAULT 30,
  enabled    INTEGER NOT NULL DEFAULT 1,
  start_hour INTEGER,
  end_hour   INTEGER
);
`;

export const CREATE_BOARD_LOG = `
CREATE TABLE IF NOT EXISTS board_log (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_type      TEXT    NOT NULL,
  slot_ref       TEXT    NOT NULL,
  displayed_text TEXT    NOT NULL,
  shown_at       INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_board_log_time ON board_log(shown_at DESC);
`;
