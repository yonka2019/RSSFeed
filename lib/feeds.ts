import { config, feedUrls } from "./config";
import type { NewsItem } from "./repository";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function permalink(item: NewsItem): string {
  return `${config.siteUrl}/news/${item.id}`;
}

function itemDate(item: NewsItem): Date {
  return new Date(item.published_at ?? item.created_at);
}

export function buildRss(items: NewsItem[]): string {
  const urls = feedUrls();
  const lastBuild =
    items.length > 0
      ? new Date(
          Math.max(...items.map((i) => itemDate(i).getTime())),
        ).toUTCString()
      : new Date().toUTCString();

  const entries = items
    .map((item) => {
      const link = permalink(item);
      return `    <item>
      <title>${esc(item.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <pubDate>${itemDate(item).toUTCString()}</pubDate>
      ${item.author ? `<dc:creator>${esc(item.author)}</dc:creator>` : ""}
      <description>${esc(item.body_html)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(config.siteTitle)}</title>
    <link>${esc(config.siteUrl)}</link>
    <description>${esc(config.siteDescription)}</description>
    <atom:link href="${esc(urls.rss)}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${lastBuild}</lastBuildDate>
${entries}
  </channel>
</rss>
`;
}

export function buildAtom(items: NewsItem[]): string {
  const urls = feedUrls();
  const updated =
    items.length > 0
      ? new Date(
          Math.max(...items.map((i) => itemDate(i).getTime())),
        ).toISOString()
      : new Date().toISOString();

  const entries = items
    .map((item) => {
      const link = permalink(item);
      return `  <entry>
    <title>${esc(item.title)}</title>
    <id>${esc(link)}</id>
    <link href="${esc(link)}" rel="alternate" type="text/html" />
    ${item.author ? `<author><name>${esc(item.author)}</name></author>` : ""}
    <published>${itemDate(item).toISOString()}</published>
    <updated>${new Date(item.updated_at).toISOString()}</updated>
    <content type="html">${esc(item.body_html)}</content>
  </entry>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(config.siteTitle)}</title>
  <subtitle>${esc(config.siteDescription)}</subtitle>
  <id>${esc(config.siteUrl)}/</id>
  <link href="${esc(urls.atom)}" rel="self" type="application/atom+xml" />
  <link href="${esc(config.siteUrl)}" rel="alternate" type="text/html" />
  <author><name>${esc(config.siteAuthor)}</name></author>
  <updated>${updated}</updated>
${entries}
</feed>
`;
}

export function buildJson(items: NewsItem[]): object {
  const urls = feedUrls();
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: config.siteTitle,
    home_page_url: config.siteUrl,
    feed_url: urls.json,
    description: config.siteDescription,
    authors: [{ name: config.siteAuthor }],
    items: items.map((item) => ({
      id: permalink(item),
      url: permalink(item),
      title: item.title,
      content_html: item.body_html,
      date_published: itemDate(item).toISOString(),
      date_modified: new Date(item.updated_at).toISOString(),
      ...(item.author ? { authors: [{ name: item.author }] } : {}),
    })),
  };
}
