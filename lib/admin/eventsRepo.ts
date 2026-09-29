import {
  MAX_EVENT_PHOTOS,
  validateEventFields,
  type BmesEvent,
  type EventFieldErrors,
} from "@/lib/events";
import { SaveConflict, type ContentStore, type FileChange } from "./store";

/**
 * Adding, editing and deleting events through the admin tool.
 *
 * Every save re-reads the latest events.json, applies just the one change and
 * commits it together with its photos, so two admins saving at once cannot
 * overwrite each other.
 */

const EVENTS_FILE = "data/events.json";
const PHOTO_ROOT = "/media/events/";
const MAX_ATTEMPTS = 3;

/** A photo in the order the admin arranged: one already published, or one just uploaded. */
export type PhotoRef = { path: string } | { blob: string };

export type EventOp =
  | { op: "create"; fields: unknown; photos: PhotoRef[] }
  | { op: "update"; id: number; fields: unknown; photos: PhotoRef[] }
  | { op: "delete"; id: number };

export class EventOpError extends Error {
  constructor(
    message: string,
    public status = 400,
    public fieldErrors?: EventFieldErrors,
  ) {
    super(message);
  }
}

export async function readEvents(store: ContentStore): Promise<{ events: BmesEvent[]; version: string }> {
  const { text, version } = await store.readText(EVENTS_FILE);
  return { events: JSON.parse(text) as BmesEvent[], version };
}

export async function applyEventOp(
  store: ContentStore,
  op: EventOp,
  actor: string,
): Promise<{ sha: string; id: number; title: string }> {
  for (let attempt = 1; ; attempt++) {
    const { events, version } = await readEvents(store);
    const { changes, message, id, title } = await planChange(store, events, version, op, actor);

    try {
      const { sha } = await store.commit({ message, baseVersion: version, changes });
      return { sha, id, title };
    } catch (error) {
      if (!(error instanceof SaveConflict) || attempt >= MAX_ATTEMPTS) {
        if (error instanceof SaveConflict) {
          throw new EventOpError("The site was busy with other saves. Try again in a moment.", 409);
        }
        throw error;
      }
    }
  }
}

async function planChange(store: ContentStore, events: BmesEvent[], version: string, op: EventOp, actor: string) {
  const byName = ` (via admin, by ${actor})`;

  if (op.op === "delete") {
    const index = events.findIndex((event) => event.id === op.id);
    if (index === -1) throw new EventOpError("That event no longer exists.", 404);
    const [removed] = events.splice(index, 1);

    // Its photo folders go too, unless another event still points into them.
    const changes: FileChange[] = [];
    for (const folder of photoFolders(removed)) {
      if (events.some((event) => photoFolders(event).includes(folder))) continue;
      for (const file of await store.listDir(`public${PHOTO_ROOT}${folder}`, version)) {
        changes.push({ path: file, remove: true });
      }
    }
    changes.push({ path: EVENTS_FILE, text: serialize(events) });
    return { changes, message: `events: delete "${removed.title}"${byName}`, id: removed.id, title: removed.title };
  }

  const checked = validateEventFields((op.fields ?? {}) as Record<string, unknown>);
  if (!checked.ok) throw new EventOpError("Some fields need fixing.", 400, checked.errors);
  if (op.photos.length > MAX_EVENT_PHOTOS) throw new EventOpError(`Keep it to ${MAX_EVENT_PHOTOS} photos or fewer.`);

  const existing = op.op === "update" ? events.find((event) => event.id === op.id) : undefined;
  if (op.op === "update" && !existing) throw new EventOpError("That event no longer exists.", 404);

  const id = existing?.id ?? Math.max(0, ...events.map((event) => event.id)) + 1;
  const folder = existing ? photoFolders(existing)[0] : undefined;
  const photoFolder = folder ?? freeFolder(events, checked.fields.title, checked.fields.date, id);

  // Numbers only ever go up, so a replaced photo never reuses a cached URL.
  const taken = await store.listDir(`public${PHOTO_ROOT}${photoFolder}`, version);
  let next = Math.max(0, ...[...taken, ...(existing?.images ?? [])].map(photoNumber)) + 1;

  const changes: FileChange[] = [];
  const images: string[] = [];
  for (const photo of op.photos) {
    if ("path" in photo) {
      // Only photos this event already has can be kept, never an arbitrary path.
      if (!existing?.images?.includes(photo.path)) throw new EventOpError("A photo in the list is not part of this event.");
      images.push(photo.path);
    } else {
      if (typeof photo.blob !== "string" || !/^[0-9a-f]{40}$/.test(photo.blob)) throw new EventOpError("A photo upload was not recognised.");
      const publicPath = `${PHOTO_ROOT}${photoFolder}/${String(next++).padStart(2, "0")}.jpg`;
      changes.push({ path: `public${publicPath}`, blob: photo.blob });
      images.push(publicPath);
    }
  }

  // Photos the admin removed are deleted, but only ones the tool manages.
  for (const old of existing?.images ?? []) {
    if (!images.includes(old) && old.startsWith(PHOTO_ROOT)) changes.push({ path: `public${old}`, remove: true });
  }

  const event: BmesEvent = { id, ...checked.fields, ...(images.length > 0 ? { images } : {}) };
  if (existing) events[events.indexOf(existing)] = event;
  else events.push(event);

  changes.push({ path: EVENTS_FILE, text: serialize(events) });
  const verb = existing ? "update" : "add";
  return { changes, message: `events: ${verb} "${event.title}"${byName}`, id, title: event.title };
}

/** The tool-managed folders an event's photos live in, e.g. "cpr-workshop-2025". */
function photoFolders(event: BmesEvent): string[] {
  const folders = (event.images ?? [])
    .filter((image) => image.startsWith(PHOTO_ROOT))
    .map((image) => image.slice(PHOTO_ROOT.length).split("/")[0]);
  return [...new Set(folders)];
}

function photoNumber(filePath: string): number {
  const match = /\/(\d+)\.jpg$/.exec(filePath);
  return match ? Number(match[1]) : 0;
}

/** "Rewind Before the Grind" on 2026-04-02 becomes "rewind-before-the-grind-2026". */
export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/, "") || "event";
}

function freeFolder(events: BmesEvent[], title: string, date: string, id: number): string {
  const slug = slugify(title);
  const year = date.slice(0, 4);
  const folder = slug.endsWith(`-${year}`) ? slug : `${slug}-${year}`;
  const inUse = events.some((event) => photoFolders(event).includes(folder));
  return inUse ? `${folder}-${id}` : folder;
}

function serialize(events: BmesEvent[]): string {
  return `${JSON.stringify(events, null, 2)}\n`;
}
