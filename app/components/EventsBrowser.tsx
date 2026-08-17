"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import EventModal from "./EventModal";
import { ClockIcon, PinIcon } from "./BrandIcons";
import {
  ALL_EVENTS,
  type BmesEvent,
  eventCoverImage,
  eventCta,
  formatDayOfMonth,
  formatLongDate,
  formatMonthAbbr,
  isPastEvent,
  pastEvents,
  todayISO,
  upcomingEvents,
} from "@/lib/events";

type View = "list" | "calendar";
type Filter = "Upcoming" | "Past" | "All";

const FILTERS: Filter[] = ["Upcoming", "Past", "All"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SECTION_LABEL: Record<Filter, string> = {
  Upcoming: "More this term",
  Past: "Past events",
  All: "All events",
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** The date never changes mid-session, so there is nothing to subscribe to. */
function subscribeToNothing() {
  return () => {};
}

/* ------------------------------------------------------------------ */

function EventCard({ event, today }: { event: BmesEvent; today: string }) {
  const cta = eventCta(event, today);
  const past = isPastEvent(event, today);

  return (
    <li className="card card-hover flex flex-col overflow-hidden" data-reveal="">
      <div className="relative h-[200px] shrink-0 bg-placeholder">
        <Image
          src={eventCoverImage(event)}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        <span className="absolute left-[18px] top-[18px] inline-flex flex-col items-center rounded-[10px] bg-white/95 px-3.5 py-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-crimson">
            {formatMonthAbbr(event.date)}
          </span>
          <span className="t-num text-[22px] leading-none text-ink">
            {formatDayOfMonth(event.date)}
          </span>
        </span>
        <span className="absolute right-[18px] top-[18px] rounded-full bg-[rgba(7,27,51,0.82)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
          {event.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6 pb-[26px]">
        <h3 className="font-display text-[21px] font-semibold leading-[1.2] tracking-[-0.02em] text-pretty">
          {event.title}
        </h3>
        <p className="flex-1 text-[15px] leading-[1.55] text-muted">{event.description}</p>

        <div className="flex flex-col gap-1.5 border-t border-hairline pt-3.5 text-sm text-muted">
          <span className="flex items-center gap-2">
            <ClockIcon size={15} className="shrink-0 text-muted" />
            {event.time}
          </span>
          <span className="flex items-center gap-2">
            <PinIcon size={15} className="shrink-0 text-muted" />
            {event.location}
          </span>
        </div>

        {cta.external ? (
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline mt-1 text-[15px]"
          >
            {cta.label} →
          </a>
        ) : (
          <Link href={cta.href} className="link-underline mt-1 text-[15px]">
            {past ? "View archive" : cta.label} →
          </Link>
        )}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */

export default function EventsBrowser({ serverToday }: { serverToday: string }) {
  // The page is prerendered, so the date baked into its HTML is the build date.
  // useSyncExternalStore lets the server snapshot drive the markup that gets
  // hydrated and the client snapshot take over immediately afterwards, so the
  // page can never disagree with its own HTML and never shows a stale date.
  const today = useSyncExternalStore(subscribeToNothing, todayISO, () => serverToday);

  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<BmesEvent | null>(null);

  const upcoming = useMemo(() => upcomingEvents(today), [today]);
  const past = useMemo(() => pastEvents(today), [today]);

  // Between terms there is nothing upcoming, and defaulting to that filter would
  // land visitors on an empty page. Show everything instead until the next
  // event is announced.
  const [filter, setFilter] = useState<Filter>(() => (upcoming.length > 0 ? "Upcoming" : "All"));

  /** The soonest upcoming event headlines the page. Falls back to the most recent one. */
  const featured = upcoming[0] ?? past[0] ?? null;

  const [cursor, setCursor] = useState(() => {
    const [year, month] = today.split("-").map(Number);
    return { year, month: month - 1 };
  });

  const filtered = useMemo(() => {
    if (filter === "Past") return past;
    if (filter === "All") return [...upcoming, ...past];
    return upcoming;
  }, [filter, upcoming, past]);

  // Whatever fills the featured panel must not appear again in the grid below it.
  const gridEvents = useMemo(
    () => filtered.filter((event) => event.id !== featured?.id),
    [filtered, featured],
  );

  const calendar = useMemo(() => {
    const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();
    const dayCount = new Date(cursor.year, cursor.month + 1, 0).getDate();

    const cells: Array<{ iso: string | null; day: number | null; events: BmesEvent[] }> = [];
    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push({ iso: null, day: null, events: [] });
    }
    for (let day = 1; day <= dayCount; day += 1) {
      const iso = `${cursor.year}-${pad(cursor.month + 1)}-${pad(day)}`;
      cells.push({ iso, day, events: ALL_EVENTS.filter((event) => event.date === iso) });
    }
    return cells;
  }, [cursor]);

  const shiftMonth = (delta: number) =>
    setCursor((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  // Send visitors to a month that actually has something in it: the next event
  // if there is one, otherwise the most recent one.
  const jumpTarget = upcoming[0] ?? past[0];
  const jumpLabel = upcoming[0]
    ? "Jump to the next event"
    : past[0]
      ? "Jump to the latest event"
      : "Jump to today";

  const jumpToTarget = () => {
    const [year, month] = (jumpTarget?.date ?? today).split("-").map(Number);
    setCursor({ year, month: month - 1 });
  };

  const switchView = (next: View) => {
    setView(next);
    setSelected(null);
  };

  return (
    <>
      {/* ================================================================
          Header and view toggle
          ================================================================ */}
      <section className="shell flex flex-col justify-between gap-8 pb-10 pt-14 md:pt-[76px] lg:flex-row lg:items-end lg:gap-12">
        <div className="flex max-w-[700px] flex-col gap-4">
          <span className="eyebrow">Events</span>
          <h1 className="t-page">Workshops, panels and conferences.</h1>
          <p className="max-w-[600px] text-[17px] leading-[1.6] text-muted text-pretty md:text-[19px]">
            Everything BMES runs across the academic year, open to every biomedical engineering
            student at TMU and often to the wider faculty too.
          </p>
        </div>

        <div
          className="flex shrink-0 gap-1.5 self-start rounded-[10px] border border-hairline bg-track p-[5px]"
          role="group"
          aria-label="Choose how to view events"
        >
          {(["list", "calendar"] as View[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => switchView(option)}
              aria-pressed={view === option}
              className={`rounded-[7px] px-4 py-3 text-sm font-bold transition-colors md:px-5 ${
                view === option ? "bg-white text-brand shadow-sm" : "text-body hover:text-ink"
              }`}
            >
              {option === "list" ? "List view" : "Calendar view"}
            </button>
          ))}
        </div>
      </section>

      {view === "list" ? (
        <>
          {/* ============================================================
              Featured next event
              ============================================================ */}
          {featured && (
            <section className="shell pb-5" aria-label="Next event">
              <div
                className="grid overflow-hidden rounded-[18px] bg-navy text-white lg:min-h-[440px] lg:grid-cols-[1.15fr_1fr]"
                data-reveal=""
              >
                <div className="relative h-[220px] lg:h-auto">
                  <Image
                    src={eventCoverImage(featured)}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,27,51,0.2)_40%,rgba(7,27,51,0.9)_100%)] lg:bg-[linear-gradient(90deg,rgba(7,27,51,0.35)_0%,rgba(7,27,51,0.1)_55%,rgba(7,27,51,0.85)_100%)]"
                    aria-hidden="true"
                  />
                </div>

                <div className="flex flex-col justify-center gap-4 p-7 md:p-[52px]">
                  <span className="inline-flex self-start rounded-full bg-crimson px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] md:text-xs">
                    {isPastEvent(featured, today) ? "Most recent" : "Next up"} · {featured.category}
                  </span>
                  <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.5rem)] font-bold leading-[1.06] tracking-[-0.03em] text-pretty">
                    {featured.title}
                  </h2>
                  <p className="max-w-[480px] text-[16px] leading-[1.6] text-on-navy-2 text-pretty md:text-[17px]">
                    {featured.description}
                  </p>

                  <dl className="mt-1.5 flex flex-col gap-2.5 border-t border-white/18 pt-5 text-[15px] font-semibold">
                    <div className="flex gap-3">
                      <dt className="w-[76px] shrink-0 text-on-navy-muted">Date</dt>
                      <dd>{formatLongDate(featured.date)}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-[76px] shrink-0 text-on-navy-muted">Time</dt>
                      <dd>{featured.time}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="w-[76px] shrink-0 text-on-navy-muted">Where</dt>
                      <dd>{featured.location}</dd>
                    </div>
                  </dl>

                  {(() => {
                    const cta = eventCta(featured, today);
                    return cta.external ? (
                      <a
                        href={cta.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-white mt-3.5 self-start"
                      >
                        {cta.label} →
                      </a>
                    ) : (
                      <Link href={cta.href} className="btn btn-white mt-3.5 self-start">
                        {cta.label} →
                      </Link>
                    );
                  })()}
                </div>
              </div>
            </section>
          )}

          {/* ============================================================
              Card grid
              ============================================================ */}
          <section className="shell flex flex-col gap-6 pb-16 pt-10 md:pb-24">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-8">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
                {SECTION_LABEL[filter]}
              </h2>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter events">
                {FILTERS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    aria-pressed={filter === option}
                    className={`rounded-full border px-4.5 py-2.5 text-[13px] font-bold transition-colors ${
                      filter === option
                        ? "border-brand bg-brand text-white"
                        : "border-hairline-strong bg-white text-body hover:border-brand hover:text-brand"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {gridEvents.length > 0 ? (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gridEvents.map((event) => (
                  <EventCard key={event.id} event={event} today={today} />
                ))}
              </ul>
            ) : (
              <p className="card flex items-center justify-center px-6 py-14 text-center text-[15px] text-muted">
                {filter === "Past"
                  ? "The archive is still filling up. Past events will show here once they wrap."
                  : "Nothing else on the calendar just yet. Follow us on Instagram for the next announcement."}
              </p>
            )}
          </section>
        </>
      ) : (
        /* ==============================================================
           Calendar
           ============================================================== */
        <section className="shell pb-16 md:pb-24" aria-label="Events calendar">
          <div className="card p-5 md:p-[30px] md:pb-[34px]" data-reveal="">
            <div className="mb-6 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="btn btn-outline px-4 py-3 text-sm md:px-5"
              >
                <span aria-hidden="true">←</span>
                <span className="hidden sm:inline">Prev</span>
                <span className="sr-only">Previous month</span>
              </button>

              <div className="flex flex-col items-center gap-1.5 text-center">
                <span className="t-num text-[20px] md:text-[26px]" aria-live="polite">
                  {MONTH_NAMES[cursor.month]} {cursor.year}
                </span>
                <button
                  type="button"
                  onClick={jumpToTarget}
                  className="text-[13px] font-bold text-brand transition-colors hover:text-crimson"
                >
                  {jumpLabel}
                </button>
              </div>

              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="btn btn-outline px-4 py-3 text-sm md:px-5"
              >
                <span className="hidden sm:inline">Next</span>
                <span aria-hidden="true">→</span>
                <span className="sr-only">Next month</span>
              </button>
            </div>

            {/* Below ~900px the seven columns stop fitting, so the grid scrolls sideways. */}
            <div className="scrollbar-slim -mx-1 overflow-x-auto px-1 pb-2">
              <div className="min-w-[720px]">
                <div className="mb-2.5 grid grid-cols-7 gap-2">
                  {WEEKDAYS.map((weekday) => (
                    <span
                      key={weekday}
                      className="text-center text-xs font-bold uppercase tracking-[0.12em] text-muted"
                    >
                      {weekday}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendar.map((cell, index) => {
                    if (!cell.day) {
                      return (
                        <div
                          key={`blank-${index}`}
                          className="min-h-[122px] rounded-[10px] border border-dashed border-hairline bg-surface-2"
                        />
                      );
                    }

                    const hasEvents = cell.events.length > 0;
                    const isToday = cell.iso === today;

                    return (
                      <div
                        key={cell.iso}
                        className={`flex min-h-[122px] flex-col gap-1.5 rounded-[10px] border p-2 pb-2.5 ${
                          hasEvents
                            ? "border-brand-border bg-brand-tint-2"
                            : "border-hairline bg-white"
                        }`}
                      >
                        <span
                          className={`text-[13px] font-bold ${
                            hasEvents ? "text-brand" : "text-muted"
                          } ${isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-crimson text-white" : ""}`}
                        >
                          {cell.day}
                        </span>

                        {cell.events.map((event) => (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => setSelected(event)}
                            title={event.title}
                            className="block rounded-md bg-brand px-2 py-1.5 text-left text-[11px] font-bold leading-[1.25] text-white transition-colors hover:bg-brand-hover"
                          >
                            {event.title}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-hairline pt-5">
              <span className="flex items-center gap-2.5 text-[13px] font-semibold text-muted">
                <span className="h-[15px] w-[15px] rounded bg-brand" aria-hidden="true" />
                BMES event, click for details
              </span>
              <span className="flex items-center gap-2.5 text-[13px] font-semibold text-muted">
                <span
                  className="h-[15px] w-[15px] rounded border border-brand-border bg-brand-tint-2"
                  aria-hidden="true"
                />
                Day with programming
              </span>
              <span className="flex items-center gap-2.5 text-[13px] font-semibold text-muted">
                <span className="h-[15px] w-[15px] rounded-full bg-crimson" aria-hidden="true" />
                Today
              </span>
            </div>
          </div>
        </section>
      )}

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </>
  );
}
