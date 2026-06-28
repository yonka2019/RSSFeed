// Runtime configuration, read from environment variables with dev defaults.

export const config = {
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin",
  secret: process.env.SECRET_KEY ?? "dev-secret-change-me",
  dbPath: process.env.DATABASE ?? "news.db",
  siteTitle: process.env.SITE_TITLE ?? "RSSFeed",
  siteDescription:
    process.env.SITE_DESCRIPTION ?? "A modern news feed with RSS, Atom and JSON.",
  siteUrl: (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, ""),
  siteAuthor: process.env.SITE_AUTHOR ?? "RSSFeed",
};

export function feedUrls() {
  return {
    rss: `${config.siteUrl}/feed/rss.xml`,
    atom: `${config.siteUrl}/feed/atom.xml`,
    json: `${config.siteUrl}/feed/feed.json`,
  };
}
