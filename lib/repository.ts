import { getDb } from "./db";
import { renderBody } from "./markdown";

export type Status = "draft" | "published";
export type Priority = "low" | "normal" | "high";

export interface NewsItem {
  id: number;
  title: string;
  body_markdown: string;
  body_html: string;
  author: string;
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
  priority: Priority,
  status: Status,
): number {
  const ts = now();
  const html = renderBody(body);
  const publishedAt = status === "published" ? ts : null;
  const info = getDb()
    .prepare(
      `INSERT INTO news_item
         (title, body_markdown, body_html, author, priority, status, created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(title, body, html, author, priority, status, ts, ts, publishedAt);
  return Number(info.lastInsertRowid);
}

export function updateItem(
  id: number,
  title: string,
  body: string,
  author: string,
  priority: Priority,
  status: Status,
): boolean {
  const existing = getItem(id);
  if (!existing) return false;
  const ts = now();
  const html = renderBody(body);
  let publishedAt = existing.published_at;
  if (status === "published" && !publishedAt) publishedAt = ts;
  getDb()
    .prepare(
      `UPDATE news_item
         SET title = ?, body_markdown = ?, body_html = ?, author = ?, priority = ?,
             status = ?, updated_at = ?, published_at = ?
       WHERE id = ?`,
    )
    .run(title, body, html, author, priority, status, ts, publishedAt, id);
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
