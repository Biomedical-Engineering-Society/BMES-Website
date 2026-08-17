"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "./BrandIcons";
import {
  type BmesEvent,
  eventCoverImage,
  formatMonthAbbr,
  formatDayOfMonth,
  formatShortDate,
} from "@/lib/events";

/**
 * The home page events showcase: one large crossfading panel driven by the
 * selectable rows beside it and by the arrow buttons above it.
 *
 * All covers are rendered up front and toggled with opacity rather than swapping
 * a single `src`, so the crossfade is real and no image is ever fetched late.
 */
export default function FeaturedEvents({
  events,
  heading,
}: {
  events: BmesEvent[];
  heading: string;
}) {
  const [index, setIndex] = useState(0);

  if (events.length === 0) return null;

  const active = events[index];
  const step = (delta: number) =>
    setIndex((current) => (current + delta + events.length) % events.length);

  return (
    <>
      <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end sm:gap-10">
        <div className="flex flex-col gap-4" data-reveal="">
          <span className="eyebrow">Featured events</span>
          <h2 className="t-section">{heading}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous event"
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-hairline-strong bg-white text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next event"
            className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-hairline-strong bg-white text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <ArrowRightIcon />
          </button>
          <Link
            href="/events"
            className="ml-2 text-[15px] font-bold text-brand transition-colors hover:text-crimson"
          >
            All events →
          </Link>
        </div>
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-[1.35fr_1fr]" data-reveal="">
        {/* Stage */}
        <div className="relative min-h-[440px] overflow-hidden rounded-[18px] bg-navy md:min-h-[470px]">
          {events.map((event, i) => (
            <Image
              key={event.id}
              src={eventCoverImage(event)}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority={i === 0}
              className="object-cover transition-opacity duration-[400ms] ease-out"
              style={{ opacity: i === index ? 1 : 0 }}
            />
          ))}

          {/* On narrow screens the caption fills more of the panel, so the scrim
              has to start earlier to keep it readable. */}
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,27,51,0.1)_8%,rgba(7,27,51,0.95)_100%)] md:bg-[linear-gradient(180deg,rgba(7,27,51,0.12)_34%,rgba(7,27,51,0.93)_100%)]"
            aria-hidden="true"
          />

          <div className="absolute inset-x-6 bottom-7 flex flex-col gap-3.5 md:inset-x-9 md:bottom-[34px]">
            <span className="inline-flex self-start rounded-full bg-crimson px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-white">
              {active.category}
            </span>
            <h3 className="font-display max-w-[620px] text-[clamp(1.6rem,3vw,2.375rem)] font-bold leading-[1.08] tracking-[-0.03em] text-white text-pretty">
              {active.title}
            </h3>
            <p className="line-clamp-3 max-w-[600px] text-[15px] leading-relaxed text-on-navy sm:line-clamp-none md:text-base">
              {active.description}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm font-semibold text-white">
              <span>{formatShortDate(active.date)}</span>
              <span className="text-on-navy-soft">{active.time}</span>
              <span className="text-on-navy-soft">{active.location}</span>
            </div>
          </div>
        </div>

        {/* Selectable rows */}
        <div className="flex flex-col gap-3.5">
          {events.map((event, i) => {
            const selected = i === index;
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-pressed={selected}
                className={`card card-hover flex flex-1 items-center gap-5 p-5 text-left md:px-6 ${
                  selected ? "border-brand bg-brand-tint" : ""
                }`}
              >
                <span
                  className={`flex w-[72px] shrink-0 flex-col items-center gap-0.5 rounded-[10px] py-3 md:w-[84px] ${
                    selected ? "bg-brand" : "bg-track"
                  }`}
                >
                  <span
                    className={`text-xs font-bold uppercase tracking-[0.14em] ${
                      selected ? "text-white" : "text-brand"
                    }`}
                  >
                    {formatMonthAbbr(event.date)}
                  </span>
                  <span
                    className={`t-num text-[26px] leading-none md:text-[28px] ${
                      selected ? "text-white" : "text-brand"
                    }`}
                  >
                    {formatDayOfMonth(event.date)}
                  </span>
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="font-display text-[18px] font-semibold tracking-[-0.015em] text-ink text-pretty md:text-[19px]">
                    {event.title}
                  </span>
                  <span className="text-sm text-muted">{event.location}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
