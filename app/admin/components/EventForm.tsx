"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  EVENT_CATEGORIES,
  validateEventFields,
  type EventFieldErrors,
  type EventFields,
} from "@/lib/events";
import PhotoManager, { existingPhotos, type PhotoItem } from "./PhotoManager";
import { errorClass, fieldClass, labelClass } from "./formStyles";

type PhotoRef = { path: string } | { blob: string };

const BLANK: EventFields = {
  title: "",
  date: "",
  time: "",
  location: "",
  description: "",
  category: "",
  link: "",
};

type Props = { id?: number; initial?: EventFields; images?: string[] };

export default function EventForm({ id, initial, images = [] }: Props) {
  const router = useRouter();
  const [fields, setFields] = useState<EventFields>({ ...BLANK, ...initial, link: initial?.link === "#" ? "" : initial?.link ?? "" });
  const [photos, setPhotos] = useState<PhotoItem[]>(() => existingPhotos(images));
  const [errors, setErrors] = useState<EventFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const processing = photos.some((photo) => photo.kind === "new" && photo.status === "working");
  const failed = photos.filter((photo) => photo.kind === "new" && photo.status === "error").length;

  const set = (key: keyof EventFields) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields((current) => ({ ...current, [key]: event.target.value }));

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    const checked = validateEventFields(fields);
    if (!checked.ok) {
      setErrors(checked.errors);
      setFormError("Some fields need fixing.");
      return;
    }
    setErrors({});
    setSaving(true);

    const photoRefs = photos.flatMap<PhotoRef>((photo) =>
      photo.kind === "existing" ? [{ path: photo.path }] : photo.status === "ready" && photo.blob ? [{ blob: photo.blob }] : [],
    );

    const response = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { op: "update", id, fields, photos: photoRefs } : { op: "create", fields, photos: photoRefs }),
    }).catch(() => null);
    const body = response ? await response.json().catch(() => ({})) : {};

    if (!response?.ok) {
      setSaving(false);
      setErrors(body.fieldErrors ?? {});
      setFormError(body.error ?? "The save did not go through. Check your connection and try again.");
      return;
    }

    const did = `${id ? "Your changes to" : "Adding"} "${checked.fields.title}"`;
    router.push(`/admin/events?saved=${body.sha}&did=${encodeURIComponent(did)}`);
    router.refresh();
  }

  const field = (key: keyof EventFields, label: string, control: React.ReactNode, hint?: string) => (
    <label className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      {control}
      {errors[key] ? <span className={errorClass}>{errors[key]}</span> : hint && <span className="text-sm text-muted">{hint}</span>}
    </label>
  );

  return (
    <form onSubmit={save} noValidate className="flex flex-col gap-8">
      <div className="card grid gap-6 p-6 md:grid-cols-2 md:p-8">
        <div className="md:col-span-2">
          {field("title", "Title", <input value={fields.title} onChange={set("title")} className={fieldClass} maxLength={120} />)}
        </div>
        {field("date", "Date", <input type="date" value={fields.date} onChange={set("date")} className={fieldClass} />)}
        {field(
          "time",
          "Time",
          <input value={fields.time} onChange={set("time")} className={fieldClass} placeholder="6:00 PM - 8:00 PM EST" />,
        )}
        {field(
          "location",
          "Location",
          <input
            value={fields.location}
            onChange={set("location")}
            className={fieldClass}
            placeholder="George Vari Engineering and Computing Centre (ENG 101)"
          />,
          "Spell out the building name, with the room code in brackets.",
        )}
        {field(
          "category",
          "Category",
          <select value={fields.category} onChange={set("category")} className={fieldClass}>
            <option value="">Choose one…</option>
            {EVENT_CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>,
        )}
        <div className="md:col-span-2">
          {field(
            "description",
            "Description",
            <textarea value={fields.description} onChange={set("description")} rows={4} className={fieldClass} maxLength={1000} />,
            `${fields.description.length}/1000`,
          )}
        </div>
        <div className="md:col-span-2">
          {field(
            "link",
            "Registration link (optional)",
            <input value={fields.link} onChange={set("link")} className={fieldClass} placeholder="https://www.eventbrite.ca/…" />,
            "Leave empty if there is none. Visitors are sent to the contact page instead.",
          )}
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold text-ink">Photos</h2>
        <PhotoManager items={photos} setItems={setPhotos} />
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 border-t border-hairline bg-surface/95 px-4 py-4 backdrop-blur">
        <button type="submit" disabled={saving || processing} className="btn btn-primary disabled:opacity-60">
          {saving ? "Saving…" : processing ? "Processing photos…" : id ? "Save changes" : "Add event"}
        </button>
        <button type="button" onClick={() => router.push("/admin/events")} className="btn btn-outline">
          Cancel
        </button>
        {failed > 0 && !formError && (
          <span className="text-sm text-muted">
            {failed} photo{failed === 1 ? "" : "s"} failed and will be left out.
          </span>
        )}
        {formError && (
          <span role="alert" className={errorClass}>
            {formError}
          </span>
        )}
      </div>
    </form>
  );
}
