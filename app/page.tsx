import { Fragment } from "react";

import FeedChannels from "@/components/FeedChannels";
import Icon from "@/components/Icon";
import LocalTime from "@/components/LocalTime";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { config, feedUrls } from "@/lib/config";
import { dayKey, dayLabel, excerptFromHtml, isRecent } from "@/lib/format";
import { listPublished, type NewsItem } from "@/lib/repository";

export const dynamic = "force-dynamic";

function thumbStyle(id: number) {
  const hue = (id * 57) % 360;
  return {
    background: `linear-gradient(135deg, hsl(${hue} 55% 42%), hsl(${(hue + 45) % 360} 60% 28%))`,
  };
}

type Props = {
  searchParams: Promise<{ q?: string; date?: string; sort?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const date = (sp.date ?? "").trim();
  const sort = sp.sort === "oldest" ? "oldest" : "newest";
  const filtering = Boolean(q || date);

  const urls = feedUrls();
  let items = listPublished(); // newest first

  if (q) {
    const needle = q.toLowerCase();
    items = items.filter((i) =>
      `${i.title} ${i.body_markdown} ${i.author}`.toLowerCase().includes(needle),
    );
  }
  if (date) {
    items = items.filter(
      (i) => (i.published_at ?? i.created_at).slice(0, 10) === date,
    );
  }
  if (sort === "oldest") items = [...items].reverse();

  // Group by day, preserving order.
  const groups: { key: string; label: string; items: NewsItem[] }[] = [];
  for (const item of items) {
    const iso = item.published_at ?? item.created_at;
    const k = dayKey(iso);
    let group = groups[groups.length - 1];
    if (!group || group.key !== k) {
      group = { key: k, label: dayLabel(iso), items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }

  return (
    <div className="shell">
      <SiteHeader />
      <main className="main">
        <div className="page">
          <form className="controls" method="get">
            <input
              className="field-search"
              type="search"
              name="q"
              placeholder="Search posts…"
              defaultValue={q}
              aria-label="Search posts"
            />
            <input
              type="date"
              name="date"
              defaultValue={date}
              aria-label="Filter by date"
            />
            <select name="sort" defaultValue={sort} aria-label="Sort by date">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
            <button className="btn btn-tonal" type="submit">
              Search
            </button>
            {filtering && (
              <a className="controls-clear" href="/">
                Clear
              </a>
            )}
          </form>

          <div className="feed">
            {items.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">
                  <Icon name="inbox" />
                </div>
                <div className="empty-title">
                  {filtering ? "No posts found" : "No stories yet"}
                </div>
                <p className="empty-note">
                  {filtering
                    ? "Try a different search or date."
                    : "Published stories will appear here."}
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <Fragment key={group.key}>
                  <div className="feed-day label">{group.label}</div>
                  {group.items.map((item) => {
                    const iso = item.published_at ?? item.created_at;
                    return (
                      <a
                        key={item.id}
                        className="feed-item"
                        href={`/news/${item.id}`}
                      >
                        <span
                          className="feed-thumb"
                          style={thumbStyle(item.id)}
                          aria-hidden="true"
                        >
                          {item.title.trim().charAt(0).toUpperCase()}
                        </span>
                        <div className="feed-body">
                          <div className="feed-source">
                            <span dir="auto">
                              {item.author || config.siteTitle}
                            </span>
                            <span className="sep">·</span>
                            <LocalTime iso={iso} mode="relative" />
                            {isRecent(iso) && (
                              <span className="feed-new">New</span>
                            )}
                            {item.priority === "high" && (
                              <span className="prio prio-high">High</span>
                            )}
                          </div>
                          <div className="feed-title" dir="auto">
                            {item.title}
                          </div>
                          <div className="feed-snippet" dir="auto">
                            {excerptFromHtml(item.body_html, 160)}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </Fragment>
              ))
            )}

            <FeedChannels rss={urls.rss} atom={urls.atom} json={urls.json} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
