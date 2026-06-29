"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const POLL_MS = 15_000;

/**
 * Polls a lightweight version endpoint and, when the published feed changes
 * elsewhere (a teammate adds or edits a story on another machine), pulls the
 * fresh server-rendered content in via router.refresh(). Existing DOM is
 * reconciled in place, so scroll position and any open state are preserved —
 * only new items animate in.
 *
 * Polling pauses while the tab is hidden and fires an immediate check when the
 * tab regains focus, so a backgrounded tab updates the moment you return to it.
 */
export default function AutoRefresh({ version }: { version: string }) {
  const router = useRouter();
  const known = useRef(version);
  const [updated, setUpdated] = useState(false);

  // After a refresh re-renders the page, re-baseline to the new version and
  // clear the toast.
  useEffect(() => {
    known.current = version;
    setUpdated(false);
  }, [version]);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/api/feed-version", { cache: "no-store" });
        if (!res.ok) return;
        const data: { version?: string } = await res.json();
        if (!cancelled && data.version && data.version !== known.current) {
          known.current = data.version;
          setUpdated(true);
          router.refresh();
        }
      } catch {
        // Transient network error — the next tick will retry.
      }
    }

    const id = setInterval(check, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, [router]);

  if (!updated) return null;
  return (
    <div className="live-toast" role="status">
      <span className="live-dot" aria-hidden="true" />
      New stories
    </div>
  );
}
