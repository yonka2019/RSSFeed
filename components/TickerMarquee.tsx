"use client";

import { useEffect, useRef, useState } from "react";

type Item = { id: string; title: string };

const SPEED = 55; // px per second — constant regardless of how much content

/**
 * Seamless, gap-free marquee. The headlines are rendered as one "group", then
 * repeated enough times to always overflow the viewport (so there's never empty
 * space), and the track is shifted left by exactly one group width per loop —
 * because every group is identical, the reset is invisible. Re-measures on
 * resize and whenever the headline set changes.
 */
export default function TickerMarquee({ items }: { items: Item[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [groupW, setGroupW] = useState(0);
  const [repeat, setRepeat] = useState(2);

  useEffect(() => {
    const measure = () => {
      const vp = viewportRef.current;
      const grp = groupRef.current;
      if (!vp || !grp) return;
      const gw = grp.scrollWidth;
      if (gw === 0) return;
      setGroupW(gw);
      // Enough groups so the viewport stays covered even at the loop's end:
      // need total width >= viewport + one group.
      setRepeat(Math.max(2, Math.ceil(vp.clientWidth / gw) + 1));
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (groupRef.current) ro.observe(groupRef.current);
    return () => ro.disconnect();
  }, [items]);

  const pieces = (decorative: boolean) =>
    items.map((item) => (
      <span className="ticker-piece" key={item.id}>
        <a
          className="ticker-title"
          href={`/news/${item.id}`}
          dir="auto"
          tabIndex={decorative ? -1 : undefined}
          aria-hidden={decorative || undefined}
        >
          {item.title}
        </a>
        <span className="ticker-dot" aria-hidden="true">
          ·
        </span>
      </span>
    ));

  const duration = Math.max(6, Math.round(groupW / SPEED));
  const trackStyle = {
    "--ticker-shift": `${groupW}px`,
    animationDuration: `${duration}s`,
  } as React.CSSProperties;

  return (
    <div className="ticker-viewport" ref={viewportRef}>
      <div className="ticker-track" style={trackStyle}>
        <div className="ticker-group" ref={groupRef}>
          {pieces(false)}
        </div>
        {Array.from({ length: Math.max(1, repeat - 1) }).map((_, i) => (
          <div className="ticker-group" key={i} aria-hidden="true">
            {pieces(true)}
          </div>
        ))}
      </div>
    </div>
  );
}
