"use client";

import { useEffect, useState } from "react";

const LOCALE = "en-GB";

function relative(d: Date): string {
  const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return absolute(d, false);
}

function absolute(d: Date, withTime: boolean): string {
  const date = d.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (!withTime) return date;
  const time = d.toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date}, ${time}`;
}

/**
 * Renders a timestamp in the viewer's local timezone (24-hour). The exact ISO
 * timestamp is shown on hover via the title attribute.
 */
export default function LocalTime({
  iso,
  mode = "datetime",
}: {
  iso: string;
  mode?: "relative" | "date" | "datetime";
}) {
  const compute = () => {
    const d = new Date(iso);
    return mode === "relative" ? relative(d) : absolute(d, mode === "datetime");
  };

  const [text, setText] = useState(compute);

  useEffect(() => {
    setText(compute());
    if (mode === "relative") {
      const id = setInterval(() => setText(compute()), 60_000);
      return () => clearInterval(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso, mode]);

  return (
    <time dateTime={iso} title={iso} dir="auto" suppressHydrationWarning>
      {text}
    </time>
  );
}
