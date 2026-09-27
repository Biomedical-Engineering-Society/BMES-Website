"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Delete with an inline "are you sure" step, since the site has no confirm dialogs. */
export default function DeleteEventButton({ id, title }: { id: number; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "delete", id }),
    }).catch(() => null);
    const body = response ? await response.json().catch(() => ({})) : {};

    if (!response?.ok) {
      setBusy(false);
      setError(body.error ?? "The delete did not go through.");
      return;
    }
    setConfirming(false);
    setBusy(false);
    router.push(`/admin/events?saved=${body.sha}&did=${encodeURIComponent(`Deleting "${title}"`)}`);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="btn btn-sm text-crimson hover:bg-crimson/5">
        Delete
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-crimson">Delete it and its photos?</span>
      <button type="button" onClick={remove} disabled={busy} className="btn btn-sm bg-crimson text-white disabled:opacity-60">
        {busy ? "Deleting…" : "Yes, delete"}
      </button>
      <button type="button" onClick={() => setConfirming(false)} disabled={busy} className="btn btn-outline btn-sm">
        Cancel
      </button>
      {error && <span className="w-full text-sm text-crimson">{error}</span>}
    </span>
  );
}
