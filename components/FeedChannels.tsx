"use client";

import { useState } from "react";

import Icon from "./Icon";

function FeedRow({ name, url }: { name: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable — the link still works */
    }
  }

  return (
    <div className="feed-row">
      <a className="feed-format chip" href={url}>
        {name}
      </a>
      <span className="feed-url">{url}</span>
      <button
        type="button"
        className="icon-btn"
        onClick={copy}
        aria-label={`Copy ${name} feed URL`}
        title={copied ? "Copied" : "Copy URL"}
      >
        <Icon name={copied ? "check" : "copy"} />
      </button>
    </div>
  );
}

export default function FeedChannels({
  rss,
  atom,
  json,
}: {
  rss: string;
  atom: string;
  json: string;
}) {
  return (
    <section className="subscribe">
      <h2>Subscribe</h2>
      <p>
        Pull these feeds into any reader, or wire them into Grafana&rsquo;s News
        panel or Confluence&rsquo;s RSS macro.
      </p>
      <FeedRow name="RSS" url={rss} />
      <FeedRow name="Atom" url={atom} />
      <FeedRow name="JSON" url={json} />
    </section>
  );
}
