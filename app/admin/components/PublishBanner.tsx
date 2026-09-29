"use client";

import { useEffect, useState } from "react";

type State = "pending" | "success" | "failure" | "unknown";

const POLL_MS = 5000;
const GIVE_UP_MS = 6 * 60 * 1000;

/**
 * After a save, follow Vercel's deploy of it until the change is live.
 * In local mode there is no deploy, so it just confirms the save.
 */
export default function PublishBanner({ sha, what }: { sha: string; what: string }) {
  const [state, setState] = useState<State>("pending");
  const local = sha === "local";

  useEffect(() => {
    if (local) return;
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout>;

    const check = async () => {
      const response = await fetch(`/api/admin/status?sha=${encodeURIComponent(sha)}`).catch(() => null);
      const next: State = response?.ok ? (await response.json()).state : "unknown";
      setState(next);
      if ((next === "pending" || next === "unknown") && Date.now() - started < GIVE_UP_MS) {
        timer = setTimeout(check, POLL_MS);
      }
    };
    check();
    return () => clearTimeout(timer);
  }, [sha, local]);

  const [tone, message] = local
    ? ["ok", `${what} was saved to your local files.`]
    : state === "success"
      ? ["ok", `${what} is live on the site.`]
      : state === "failure"
        ? ["bad", `${what} was saved, but the site failed to rebuild. Ask the webmaster to check Vercel.`]
        : state === "unknown"
          ? ["wait", `${what} was saved. It usually appears on the site within a couple of minutes.`]
          : ["wait", `${what} was saved. Publishing to the site, usually 1–2 minutes…`];

  const styles = {
    ok: "border-brand/30 bg-brand-tint text-brand",
    bad: "border-crimson/30 bg-crimson/5 text-crimson",
    wait: "border-hairline-strong bg-white text-ink",
  }[tone];

  return (
    <p role="status" className={`rounded-xl border px-5 py-4 text-sm font-semibold ${styles}`}>
      {tone === "wait" && <span className="mr-2 inline-block animate-pulse">●</span>}
      {tone === "ok" && <span className="mr-2">✓</span>}
      {message}
    </p>
  );
}
