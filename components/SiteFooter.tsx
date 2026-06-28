import { config } from "@/lib/config";

export default function SiteFooter() {
  const year = new Date().getUTCFullYear();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>
          {config.siteTitle} · © {year}
        </span>
        <span>
          <a href="/feed/rss.xml">RSS</a> · <a href="/feed/atom.xml">Atom</a> ·{" "}
          <a href="/feed/feed.json">JSON</a>
        </span>
      </div>
    </footer>
  );
}
