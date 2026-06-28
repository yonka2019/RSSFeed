import Database from "better-sqlite3";

import { config } from "./config";

// Cache the connection on globalThis so Next.js dev hot-reloads reuse it.
const globalForDb = globalThis as unknown as { __wireDb?: Database.Database };

export function getDb(): Database.Database {
  if (!globalForDb.__wireDb) {
    const db = new Database(config.dbPath);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS news_item (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        title         TEXT NOT NULL,
        body_markdown TEXT NOT NULL DEFAULT '',
        body_html     TEXT NOT NULL DEFAULT '',
        author        TEXT NOT NULL DEFAULT '',
        priority      TEXT NOT NULL DEFAULT 'normal',
        status        TEXT NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft', 'published')),
        created_at    TEXT NOT NULL,
        updated_at    TEXT NOT NULL,
        published_at  TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_news_status_published
        ON news_item (status, published_at);
    `);

    // Migrate older databases that predate the author column.
    const cols = db
      .prepare(`PRAGMA table_info(news_item)`)
      .all() as { name: string }[];
    if (!cols.some((c) => c.name === "author")) {
      db.exec(`ALTER TABLE news_item ADD COLUMN author TEXT NOT NULL DEFAULT ''`);
    }
    if (!cols.some((c) => c.name === "priority")) {
      db.exec(
        `ALTER TABLE news_item ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal'`,
      );
    }

    globalForDb.__wireDb = db;
  }
  return globalForDb.__wireDb;
}
