// Seed a few sample posts so the feed isn't empty on first run.
// Usage: npm run seed
import Database from "better-sqlite3";

const db = new Database(process.env.DATABASE ?? "news.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS news_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body_markdown TEXT NOT NULL DEFAULT '',
    body_html TEXT NOT NULL DEFAULT '',
    author TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    published_at TEXT
  );
`);

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderBody(text) {
  return (text || "")
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => `<p>${escapeHtml(b).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

const count = db.prepare("SELECT COUNT(*) AS n FROM news_item").get().n;
if (count > 0) {
  console.log(`Skipped — ${count} item(s) already exist.`);
  process.exit(0);
}

const posts = [
  {
    title: "Welcome to RSSFeed",
    author: "Editor",
    body: "RSSFeed is a small, modern news feed.\n\nWrite a post in plain text, save it as a draft, and publish when it's ready. Everything you publish is available as RSS, Atom and JSON.",
  },
  {
    title: "How to publish a post",
    author: "Editor",
    body: "Open the desk, sign in, and create a new post.\n\nType a title, your name, and the text — then publish. Drafts never appear on the site or in the feeds.",
  },
  {
    title: "Built to be pulled",
    author: "Editor",
    body: "Every published post is available in three feed formats the moment it goes live, with permalinks back to the site.\n\nPoint any reader — or Grafana and Confluence — at a feed URL and it stays in sync.",
  },
];

const stmt = db.prepare(
  `INSERT INTO news_item
     (title, body_markdown, body_html, author, status, created_at, updated_at, published_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
);

posts.forEach((p, i) => {
  const ts = new Date(Date.now() - (posts.length - 1 - i) * 3600_000).toISOString();
  stmt.run(p.title, p.body, renderBody(p.body), p.author, "published", ts, ts, ts);
});

console.log(`Seeded ${posts.length} posts.`);
