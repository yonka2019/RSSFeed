import TickerMarquee from "@/components/TickerMarquee";
import { listPublished } from "@/lib/repository";

const MAX_ITEMS = 5; // the 5 most recent published posts

/**
 * "Latest" headline bar under the nav: the 5 most recent published posts,
 * handed to a client marquee that loops them seamlessly with no empty space.
 * Renders nothing when there's no news. The home/article pages are
 * force-dynamic and auto-refresh, so this updates when a teammate publishes.
 */
export default async function NewsTicker() {
  const recent = await listPublished(MAX_ITEMS); // newest first, capped at 5
  if (recent.length === 0) return null;

  const items = recent.map((i) => ({ id: i.id, title: i.title }));

  return (
    <div className="ticker" aria-label="Latest 5 news headlines">
      <span className="ticker-label">
        <span className="ticker-pulse" aria-hidden="true" />
        Latest
      </span>
      <TickerMarquee items={items} />
    </div>
  );
}
