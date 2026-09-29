import eventsDataRaw from "@/data/events.json";

export type BmesEvent = {
  id: number;
  title: string;
  /** ISO calendar date, YYYY-MM-DD. */
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  link: string;
  images?: string[];
};

/** The admin tool offers these in a dropdown, so the site's labels stay consistent. */
export const EVENT_CATEGORIES = [
  "Social",
  "Career",
  "Networking",
  "Workshop",
  "Science & Tech",
  "Competition",
  "Wellness",
] as const;

/** Photos per event. The gallery and the detail grid stop being browsable past this. */
export const MAX_EVENT_PHOTOS = 15;

/** Everything about an event an admin can type in. The id and photos are assigned on save. */
export type EventFields = Omit<BmesEvent, "id" | "images">;

export type EventFieldErrors = Partial<Record<keyof EventFields, string>>;

const FIELD_LIMITS = { title: 120, time: 60, location: 160, description: 1000, link: 500 };

function isRealDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/**
 * Check and tidy what an admin typed. Shared by the admin form, for instant
 * feedback, and the admin API, which never trusts the form.
 */
export function validateEventFields(
  input: Partial<Record<keyof EventFields, unknown>>,
): { ok: true; fields: EventFields } | { ok: false; errors: EventFieldErrors } {
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  const fields: EventFields = {
    title: text(input.title),
    date: text(input.date),
    time: text(input.time),
    location: text(input.location),
    description: text(input.description),
    category: text(input.category),
    link: text(input.link) || "#",
  };

  const errors: EventFieldErrors = {};
  if (!fields.title) errors.title = "Give the event a title.";
  else if (fields.title.length > FIELD_LIMITS.title) errors.title = `Keep the title under ${FIELD_LIMITS.title} characters.`;

  if (!isRealDate(fields.date)) errors.date = "Pick the date the event happens on.";

  if (!fields.time) errors.time = 'Add a time, like "6:00 PM - 8:00 PM EST".';
  else if (fields.time.length > FIELD_LIMITS.time) errors.time = `Keep the time under ${FIELD_LIMITS.time} characters.`;

  if (!fields.location) errors.location = "Add where it happens.";
  else if (fields.location.length > FIELD_LIMITS.location) errors.location = `Keep the location under ${FIELD_LIMITS.location} characters.`;

  if (!fields.description) errors.description = "Add a short description.";
  else if (fields.description.length > FIELD_LIMITS.description) errors.description = `Keep the description under ${FIELD_LIMITS.description} characters.`;

  if (!(EVENT_CATEGORIES as readonly string[]).includes(fields.category)) errors.category = "Pick a category.";

  if (fields.link !== "#" && !/^https:\/\/\S+$/.test(fields.link)) errors.link = "Links must start with https://";
  else if (fields.link.length > FIELD_LIMITS.link) errors.link = "That link is too long.";

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, fields };
}

/** The club runs on Toronto time, so every "is it past yet" question resolves there. */
const TIME_ZONE = "America/Toronto";

const ISO_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Today as YYYY-MM-DD in Toronto.
 *
 * Pinned to the timezone on purpose. The server runs in UTC and the browser in
 * the visitor's zone; an unpinned date makes the two disagree for part of every
 * day, which breaks hydration and flips tonight's event into the past.
 */
export function todayISO(): string {
  return ISO_FORMATTER.format(new Date());
}

/**
 * Parse YYYY-MM-DD into a Date at local midnight.
 *
 * `new Date("2026-02-14")` parses as UTC midnight and then displays a day early
 * for anyone west of Greenwich, so build the date from its parts instead.
 */
export function parseEventDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatLongDate(iso: string): string {
  return parseEventDate(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(iso: string): string {
  return parseEventDate(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatMonthAbbr(iso: string): string {
  return parseEventDate(iso).toLocaleDateString("en-US", { month: "short" });
}

export function formatDayOfMonth(iso: string): string {
  return String(parseEventDate(iso).getDate()).padStart(2, "0");
}

export const ALL_EVENTS: BmesEvent[] = (eventsDataRaw as BmesEvent[])
  .slice()
  .sort((a, b) => a.date.localeCompare(b.date));

export function isPastEvent(event: BmesEvent, today = todayISO()): boolean {
  return event.date < today;
}

/** Soonest first. The next thing happening is always index 0. */
export function upcomingEvents(today = todayISO()): BmesEvent[] {
  return ALL_EVENTS.filter((event) => event.date >= today);
}

/** Most recent first. */
export function pastEvents(today = todayISO()): BmesEvent[] {
  return ALL_EVENTS.filter((event) => event.date < today).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
}

/**
 * What the primary action on an event should say and point at.
 *
 * Events without a real registration link fall back to the contact page rather
 * than to a dead "#", which is what the old cards did.
 */
export function eventCta(event: BmesEvent, today = todayISO()) {
  const hasLink = Boolean(event.link) && event.link !== "#";

  if (isPastEvent(event, today)) {
    return { label: "View archive", href: `/events/${event.id}`, external: false };
  }
  if (hasLink) {
    return { label: "Registration details", href: event.link, external: true };
  }
  return { label: "Event details", href: `/events/${event.id}`, external: false };
}

export function eventCoverImage(event: BmesEvent): string {
  return event.images?.[0] ?? "/media/Group_photo.jpg";
}

/** Cover images for the three events the home page rotates through. */
export function featuredEvents(count = 3, today = todayISO()): BmesEvent[] {
  const upcoming = upcomingEvents(today);
  if (upcoming.length >= count) return upcoming.slice(0, count);
  return [...upcoming, ...pastEvents(today)].slice(0, count);
}
