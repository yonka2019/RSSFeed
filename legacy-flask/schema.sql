CREATE TABLE IF NOT EXISTS news_item (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,
    body_markdown TEXT NOT NULL DEFAULT '',
    body_html     TEXT NOT NULL DEFAULT '',
    status        TEXT NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft', 'published')),
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL,
    published_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_news_status_published
    ON news_item (status, published_at);
