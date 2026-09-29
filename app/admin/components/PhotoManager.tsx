"use client";

/* Previews are local blob: URLs or not-yet-deployed repo files, which next/image cannot serve. */
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { MAX_EVENT_PHOTOS } from "@/lib/events";
import { PHOTO_ACCEPT, prepareImage } from "@/lib/admin/prepareImage";

export type PhotoItem =
  | { key: string; kind: "existing"; path: string }
  | { key: string; kind: "new"; name: string; status: "working" | "ready" | "error"; preview?: string; blob?: string; error?: string };

let counter = 0;
const nextKey = () => `photo-${Date.now()}-${counter++}`;

export function existingPhotos(paths: string[]): PhotoItem[] {
  return paths.map((path) => ({ key: nextKey(), kind: "existing", path }));
}

/**
 * Drop in photos, see them processed, put them in order. The first is the cover.
 *
 * Each photo is prepared in the browser (HEIC decoded, shrunk) and uploaded as
 * soon as it is added, so by the time the admin hits save the work is done.
 */
export default function PhotoManager({
  items,
  setItems,
}: {
  items: PhotoItem[];
  setItems: React.Dispatch<React.SetStateAction<PhotoItem[]>>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const update = (key: string, patch: Partial<Extract<PhotoItem, { kind: "new" }>>) =>
    setItems((current) => current.map((item) => (item.key === key && item.kind === "new" ? { ...item, ...patch } : item)));

  async function addFiles(files: File[]) {
    setNotice(null);
    const room = MAX_EVENT_PHOTOS - items.length;
    if (files.length > room) setNotice(`Only ${MAX_EVENT_PHOTOS} photos fit on an event, so ${files.length - Math.max(room, 0)} were left out.`);
    const accepted = files.slice(0, Math.max(room, 0));

    const added = accepted.map((file) => ({ key: nextKey(), kind: "new" as const, name: file.name, status: "working" as const }));
    setItems((current) => [...current, ...added]);

    // One at a time: phones produce big files and decoding HEIC is heavy.
    for (const [index, file] of accepted.entries()) {
      const { key } = added[index];
      try {
        const prepared = await prepareImage(file);
        update(key, { preview: URL.createObjectURL(prepared) });

        const form = new FormData();
        form.append("photo", prepared, "photo.jpg");
        const response = await fetch("/api/admin/photos", { method: "POST", body: form });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "Upload failed.");
        // Swap in the server's finished version, so trims and crops show before saving.
        setItems((current) =>
          current.map((item) => {
            if (item.key !== key || item.kind !== "new") return item;
            if (item.preview?.startsWith("blob:")) URL.revokeObjectURL(item.preview);
            return { ...item, status: "ready", blob: body.blob, preview: body.preview ?? item.preview };
          }),
        );
      } catch (error) {
        update(key, { status: "error", error: error instanceof Error ? error.message : "Upload failed." });
      }
    }
  }

  function move(index: number, delta: number) {
    setItems((current) => {
      const next = current.slice();
      const [item] = next.splice(index, 1);
      next.splice(Math.min(Math.max(index + delta, 0), next.length), 0, item);
      return next;
    });
  }

  function remove(key: string) {
    setItems((current) => {
      const gone = current.find((item) => item.key === key);
      if (gone?.kind === "new" && gone.preview?.startsWith("blob:")) URL.revokeObjectURL(gone.preview);
      return current.filter((item) => item.key !== key);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(Array.from(event.dataTransfer.files));
        }}
        className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragging ? "border-brand bg-brand-tint" : "border-hairline-strong bg-white"
        }`}
      >
        <p className="font-semibold text-ink">Drag photos here</p>
        <p className="text-sm text-muted">
          JPG, PNG, WebP or iPhone HEIC, up to {MAX_EVENT_PHOTOS} per event. They are resized and cleaned up
          automatically.
        </p>
        <button type="button" onClick={() => input.current?.click()} className="btn btn-outline btn-sm">
          Choose photos
        </button>
        <input
          ref={input}
          type="file"
          accept={PHOTO_ACCEPT}
          multiple
          hidden
          onChange={(event) => {
            addFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>

      {notice && <p className="text-sm font-semibold text-crimson">{notice}</p>}

      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, index) => {
            const src = item.kind === "existing" ? item.path : item.preview;
            return (
              <li key={item.key} className="card overflow-hidden">
                <div className="relative aspect-[4/3] bg-placeholder">
                  {src && <img src={src} alt="" className="h-full w-full object-cover" />}
                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                      Cover
                    </span>
                  )}
                  {item.kind === "new" && item.status !== "ready" && (
                    <span
                      className={`absolute inset-x-0 bottom-0 px-3 py-2 text-xs font-semibold ${
                        item.status === "error" ? "bg-crimson text-white" : "bg-navy/80 text-white"
                      }`}
                    >
                      {item.status === "error" ? item.error : "Processing…"}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 px-2 py-2">
                  <div className="flex gap-1">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move earlier" className="btn btn-sm px-2.5 disabled:opacity-30">
                      ←
                    </button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move later" className="btn btn-sm px-2.5 disabled:opacity-30">
                      →
                    </button>
                    {index !== 0 && (
                      <button type="button" onClick={() => move(index, -index)} className="btn btn-sm px-2.5 text-xs">
                        Make cover
                      </button>
                    )}
                  </div>
                  <button type="button" onClick={() => remove(item.key)} aria-label="Remove photo" className="btn btn-sm px-2.5 text-crimson">
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
