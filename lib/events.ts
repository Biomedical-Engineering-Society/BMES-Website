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
 * Deliberately timezone-pinned rather than using the runtime's local date: the
 * server renders in UTC and the browser renders in the visitor's zone, and an
 * unpinned date makes those two disagree for part of every day, which both
 * breaks hydration and flips tonight's event into the past.
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
