import announcementRaw from "@/data/announcement.json";
import { eventCta, formatShortDate, todayISO, upcomingEvents } from "@/lib/events";
import { TICKER_FALLBACK } from "@/lib/site";

/**
 * The scrolling banner under the home page hero.
 *
 * An admin can post a message for a set number of days. Otherwise it shows the
 * next event, from a week before through the day of it, and the rest of the
 * time a few general lines about the club.
 */

export type Announcement = {
  message: string;
  link: string;
  /** Last day it shows, YYYY-MM-DD in Toronto time. */
  expiresOn: string;
};

/** An event starts showing this many days ahead, and stays up through its day. */
export const EVENT_LEAD_DAYS = 7;

/** Shortcuts on the admin form. Any whole number of days up to the maximum also works. */
export const ANNOUNCEMENT_QUICK_DAYS = [1, 3, 7] as const;

/** Anything longer tends to be forgotten and go stale. */
export const MAX_ANNOUNCEMENT_DAYS = 60;

const MESSAGE_LIMIT = 160;
const LINK_LIMIT = 500;

export type AnnouncementInput = { message: string; link: string; days: number };

export type AnnouncementErrors = Partial<Record<keyof AnnouncementInput, string>>;

/** Shared by the admin form, for instant feedback, and the admin API, which never trusts the form. */
export function validateAnnouncement(
  input: Partial<Record<keyof AnnouncementInput, unknown>>,
): { ok: true; fields: AnnouncementInput } | { ok: false; errors: AnnouncementErrors } {
  const text = (value: unknown) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");
  const fields: AnnouncementInput = {
    message: text(input.message),
    link: text(input.link),
    days: Number(input.days),
  };

  const errors: AnnouncementErrors = {};
  if (!fields.message) errors.message = "Write the message to show.";
  else if (fields.message.length > MESSAGE_LIMIT) errors.message = `Keep it under ${MESSAGE_LIMIT} characters.`;

  if (fields.link && !/^https:\/\/\S+$/.test(fields.link)) errors.link = "Links must start with https://";
  else if (fields.link.length > LINK_LIMIT) errors.link = "That link is too long.";

  if (!Number.isInteger(fields.days) || fields.days < 1 || fields.days > MAX_ANNOUNCEMENT_DAYS) {
    errors.days = `Pick a whole number of days, from 1 to ${MAX_ANNOUNCEMENT_DAYS}.`;
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, fields };
}

/** Calendar arithmetic on YYYY-MM-DD, in UTC so daylight saving never shifts the day. */
export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** "1 day" means through the end of today. */
export function expiryFor(days: number, today = todayISO()): string {
  return addDays(today, days - 1);
}

/** Read what is stored, tolerating the empty `{}` that means "no message". */
export function parseAnnouncement(value: unknown): Announcement | null {
  const data = value as Partial<Announcement> | null;
  if (!data || typeof data.message !== "string" || !data.message || typeof data.expiresOn !== "string") return null;
  return { message: data.message, link: typeof data.link === "string" ? data.link : "", expiresOn: data.expiresOn };
}

export function isActive(announcement: Announcement | null, today = todayISO()): announcement is Announcement {
  return Boolean(announcement) && today <= announcement!.expiresOn;
}

/** "Exam kits · POD 377 · Free" scrolls as three items. */
export function splitMessage(message: string): string[] {
  return message
    .split(/\s*[·•|]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export type BannerContent = {
  source: "message" | "event" | "fallback";
  items: string[];
  href?: string;
  external?: boolean;
};

export function bannerContent(announcement = parseAnnouncement(announcementRaw), today = todayISO()): BannerContent {
  if (isActive(announcement, today)) {
    const { link } = announcement;
    return { source: "message", items: splitMessage(announcement.message), ...(link ? { href: link, external: true } : {}) };
  }

  const next = upcomingEvents(today)[0];
  if (next && next.date <= addDays(today, EVENT_LEAD_DAYS)) {
    const when =
      next.date === today ? "Today" : next.date === addDays(today, 1) ? "Tomorrow" : formatShortDate(next.date);
    // Point straight at registration when there is one; the event page otherwise.
    const cta = eventCta(next, today);
    return {
      source: "event",
      items: [`Next up: ${next.title}`, when, next.time, next.location, cta.external ? "Register now ↗" : "Details ↗"].filter(
        Boolean,
      ),
      href: cta.href,
      external: cta.external,
    };
  }

  return { source: "fallback", items: [...TICKER_FALLBACK] };
}
