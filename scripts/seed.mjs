// Seed a few sample posts so the feed isn't empty on first run.
// Usage: npm run seed
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB ?? "rssfeed";

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

const client = new MongoClient(uri);
try {
  await client.connect();
  const col = client.db(dbName).collection("news_item");

  const count = await col.countDocuments();
  if (count > 0) {
    console.log(`Skipped — ${count} item(s) already exist.`);
    process.exit(0);
  }

  const docs = posts.map((p, i) => {
    const ts = new Date(
      Date.now() - (posts.length - 1 - i) * 3600_000,
    ).toISOString();
    return {
      title: p.title,
      body_markdown: p.body,
      body_html: renderBody(p.body),
      author: p.author,
      label: "",
      priority: "normal",
      status: "published",
      created_at: ts,
      updated_at: ts,
      published_at: ts,
    };
  });

  await col.insertMany(docs);
  console.log(`Seeded ${docs.length} posts.`);
} finally {
  await client.close();
}
