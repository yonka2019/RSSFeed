import { getDb } from "./db";
import { parseLabels } from "./format";
import { renderBody } from "./markdown";

export type Status = "draft" | "published";
export type Priority = "low" | "normal" | "high";

export interface NewsItem {
  id: number;
  title: string;
  body_markdown: string;
  body_html: string;
  author: string;
  label: string;
  priority: Priority;
  status: Status;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

const now = () => new Date().toISOString();

export function createItem(
  title: string,
  body: string,
  author: string,
  label: string,
  priority: Priority,
  status: Status,
): number {
  ensureLabelColors(parseLabels(label));
  const ts = now();
  const html = renderBody(body);
  const publishedAt = status === "published" ? ts : null;
  const info = getDb()
    .prepare(
      `INSERT INTO news_item
         (title, body_markdown, body_html, author, label, priority, status, created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(title, body, html, author, label, priority, status, ts, ts, publishedAt);
  return Number(info.lastInsertRowid);
}

export function updateItem(
  id: number,
  title: string,
  body: string,
  author: string,
  label: string,
  priority: Priority,
  status: Status,
): boolean {
  const existing = getItem(id);
  if (!existing) return false;
  ensureLabelColors(parseLabels(label));
  const ts = now();
  const html = renderBody(body);
  let publishedAt = existing.published_at;
  if (status === "published" && !publishedAt) publishedAt = ts;
  getDb()
    .prepare(
      `UPDATE news_item
         SET title = ?, body_markdown = ?, body_html = ?, author = ?, label = ?, priority = ?,
             status = ?, updated_at = ?, published_at = ?
       WHERE id = ?`,
    )
    .run(title, body, html, author, label, priority, status, ts, publishedAt, id);
  return true;
}

export function setStatus(id: number, status: Status): boolean {
  const existing = getItem(id);
  if (!existing) return false;
  const ts = now();
  let publishedAt = existing.published_at;
  if (status === "published" && !publishedAt) publishedAt = ts;
  getDb()
    .prepare(
      `UPDATE news_item SET status = ?, updated_at = ?, published_at = ? WHERE id = ?`,
    )
    .run(status, ts, publishedAt, id);
  return true;
}

export function deleteItem(id: number): void {
  getDb().prepare(`DELETE FROM news_item WHERE id = ?`).run(id);
}

export function getItem(id: number): NewsItem | undefined {
  return getDb()
    .prepare(`SELECT * FROM news_item WHERE id = ?`)
    .get(id) as NewsItem | undefined;
}

export function getPublishedItem(id: number): NewsItem | undefined {
  return getDb()
    .prepare(`SELECT * FROM news_item WHERE id = ? AND status = 'published'`)
    .get(id) as NewsItem | undefined;
}

/** The author of the most recent post, to prefill the editor. */
export function lastAuthor(): string {
  const row = getDb()
    .prepare(
      `SELECT author FROM news_item WHERE author <> '' ORDER BY created_at DESC LIMIT 1`,
    )
    .get() as { author: string } | undefined;
  return row?.author ?? "";
}

export function listPublished(): NewsItem[] {
  return getDb()
    .prepare(
      `SELECT * FROM news_item WHERE status = 'published' ORDER BY published_at DESC`,
    )
    .all() as NewsItem[];
}

export function listAll(): NewsItem[] {
  return getDb()
    .prepare(`SELECT * FROM news_item ORDER BY created_at DESC, id DESC`)
    .all() as NewsItem[];
}

/**
 * Assign a remembered random color (hue) to any label seen for the first time.
 * Existing labels keep their color — INSERT OR IGNORE never overwrites.
 */
export function ensureLabelColors(labels: string[]): void {
  const insert = getDb().prepare(
    `INSERT OR IGNORE INTO label_color (label, hue) VALUES (?, ?)`,
  );
  for (const l of labels) {
    insert.run(l, Math.floor(Math.random() * 360));
  }
}

/** Map of label -> hue for every label that has a remembered color. */
export function getLabelColors(): Record<string, number> {
  const rows = getDb()
    .prepare(`SELECT label, hue FROM label_color`)
    .all() as { label: string; hue: number }[];
  const map: Record<string, number> = {};
  for (const r of rows) map[r.label] = r.hue;
  return map;
}

/** Distinct non-empty labels across published items, for the feed filter row. */
export function listLabels(): string[] {
  const rows = getDb()
    .prepare(
      `SELECT label FROM news_item WHERE status = 'published' AND label <> ''`,
    )
    .all() as { label: string }[];
  const set = new Set<string>();
  for (const row of rows) for (const l of parseLabels(row.label)) set.add(l);
  return [...set].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}
