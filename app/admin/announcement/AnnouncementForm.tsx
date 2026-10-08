"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Ticker from "@/app/components/Ticker";
import {
  ANNOUNCEMENT_QUICK_DAYS,
  MAX_ANNOUNCEMENT_DAYS,
  expiryFor,
  splitMessage,
  validateAnnouncement,
  type Announcement,
  type AnnouncementErrors,
  type BannerContent,
} from "@/lib/announcement";
import { formatLongDate } from "@/lib/events";
import { errorClass, fieldClass, labelClass } from "../components/formStyles";

type Props = {
  current: Announcement | null;
  /** What the home page shows right now, and when a posted message runs out. */
  showing: BannerContent;
  status: string | null;
};

export default function AnnouncementForm({ current, showing, status }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState(current?.message ?? "");
  const [link, setLink] = useState(current?.link ?? "");
  const [days, setDays] = useState("3");
  const [errors, setErrors] = useState<AnnouncementErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<"set" | "clear" | null>(null);

  async function send(body: object, did: string) {
    const response = await fetch("/api/admin/announcement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    const result = response ? await response.json().catch(() => ({})) : {};

    if (!response?.ok) {
      setSaving(null);
      setErrors(result.fieldErrors ?? {});
      setFormError(result.error ?? "The save did not go through. Check your connection and try again.");
      return;
    }
    router.push(`/admin/announcement?saved=${result.sha}&did=${encodeURIComponent(did)}`);
    router.refresh();
    setSaving(null);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const checked = validateAnnouncement({ message, link, days });
    if (!checked.ok) {
      setErrors(checked.errors);
      setFormError("Some fields need fixing.");
      return;
    }
    setErrors({});
    setSaving("set");
    await send({ op: "set", ...checked.fields }, "Your banner message");
  }

  async function clear() {
    setFormError(null);
    setSaving("clear");
    await send({ op: "clear" }, "Clearing the banner message");
  }

  const preview = splitMessage(message.replace(/\s+/g, " "));
  // Once the admin has typed something new, preview that instead of what is live.
  const editing = preview.length > 0 && message.trim() !== (current?.message ?? "");
  const dayCount = Number(days);
  const validDays = Number.isInteger(dayCount) && dayCount >= 1 && dayCount <= MAX_ANNOUNCEMENT_DAYS;
  const until = validDays ? formatLongDate(expiryFor(dayCount)) : null;

  return (
    <>
      <section className="card flex flex-col gap-4 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-ink">Preview</h2>
          {editing && (
            <span className="rounded-full bg-salmon/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-crimson">
              Not posted yet
            </span>
          )}
        </div>
        {(editing || status) && (
          <p className="text-[15px] text-muted">
            {editing ? `This is how your message will scroll${until ? `, through ${until}` : ""}, once you post it.` : status}
          </p>
        )}
        {/* Navy behind it, the way the strip sits over the dark hero video on the site. */}
        <div className="overflow-hidden rounded-xl bg-navy">
          <Ticker items={editing ? preview : showing.items} source={editing ? "message" : showing.source} />
        </div>
      </section>

      <form onSubmit={save} noValidate className="card flex flex-col gap-6 p-6 md:p-8">
        <h2 className="font-display text-xl font-semibold text-ink">{current ? "Change the message" : "Post a message"}</h2>

        <label className="flex flex-col gap-2">
          <span className={labelClass}>Message</span>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className={fieldClass}
            maxLength={160}
            placeholder="Exam care packages · Free in POD 377 · This week only"
          />
          {errors.message ? (
            <span className={errorClass}>{errors.message}</span>
          ) : (
            <span className="text-sm text-muted">
              Separate parts with · to scroll them as separate items. {message.length}/160
              {preview.length > 1 && ` · ${preview.length} items`}
            </span>
          )}
        </label>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <label className="flex flex-col gap-2">
            <span className={labelClass}>Link (optional)</span>
            <input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              className={fieldClass}
              placeholder="https://www.instagram.com/…"
            />
            {errors.link ? (
              <span className={errorClass}>{errors.link}</span>
            ) : (
              <span className="text-sm text-muted">Where clicking the banner goes. Leave empty for none.</span>
            )}
          </label>

          <div className="flex flex-col gap-2">
            <label htmlFor="announcement-days" className={labelClass}>
              Show it for
            </label>
            <div className="flex items-center gap-3">
              <input
                id="announcement-days"
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={days}
                onChange={(event) => setDays(event.target.value.replace(/\D/g, ""))}
                className={`${fieldClass} w-24`}
              />
              <span className="text-[15px] text-ink">{dayCount === 1 ? "day" : "days"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ANNOUNCEMENT_QUICK_DAYS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setDays(String(count))}
                  className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                    dayCount === count
                      ? "border-brand bg-brand-tint text-brand"
                      : "border-hairline-strong bg-white text-muted hover:border-brand hover:text-brand"
                  }`}
                >
                  {count === 1 ? "Today only" : `${count} days`}
                </button>
              ))}
            </div>
            {errors.days ? (
              <span className={errorClass}>{errors.days}</span>
            ) : (
              <span className="text-sm text-muted">
                {until ? `Counting today, so it shows through ${until}.` : `From 1 to ${MAX_ANNOUNCEMENT_DAYS} days.`}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={saving !== null} className="btn btn-primary disabled:opacity-60">
            {saving === "set" ? "Saving…" : current ? "Save changes" : "Post message"}
          </button>
          {current && (
            <button type="button" onClick={clear} disabled={saving !== null} className="btn btn-outline disabled:opacity-60">
              {saving === "clear" ? "Clearing…" : "Clear message now"}
            </button>
          )}
          {formError && (
            <span role="alert" className={errorClass}>
              {formError}
            </span>
          )}
        </div>
      </form>
    </>
  );
}
