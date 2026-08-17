import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ALL_EVENTS,
  eventCoverImage,
  formatLongDate,
  isPastEvent,
  todayISO,
} from "@/lib/events";

type PageProps = { params: Promise<{ id: string }> };

/** The Upcoming / Archive badge is date dependent, so refresh the page hourly. */
export const revalidate = 3600;

function findEvent(id: string) {
  return ALL_EVENTS.find((event) => String(event.id) === id) ?? null;
}

export function generateStaticParams() {
  return ALL_EVENTS.map((event) => ({ id: String(event.id) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = findEvent(id);
  if (!event) return { title: "Event not found" };

  return {
    title: event.title,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = findEvent(id);
  if (!event) notFound();

  const today = todayISO();
  const past = isPastEvent(event, today);
  const hasLink = Boolean(event.link) && event.link !== "#";
  const photos = event.images ?? [];

  return (
    <>
      {/* ================================================================
          Header
          ================================================================ */}
      <section className="relative overflow-hidden bg-navy text-white">
        <Image
          src={eventCoverImage(event)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(100deg,rgba(7,27,51,0.95)_0%,rgba(7,27,51,0.82)_45%,rgba(9,38,74,0.62)_100%)]"
          aria-hidden="true"
        />

        <div className="shell relative z-10 py-14 md:py-20">
          <Link
            href="/events"
            className="mb-8 inline-flex items-center gap-2.5 text-sm font-semibold text-on-navy transition-colors hover:text-white"
          >
            <span aria-hidden="true">←</span> Back to events
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start lg:gap-16">
            <div className="flex flex-col gap-5">
              <span className="inline-flex self-start rounded-full bg-crimson px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] md:text-xs">
                {past ? "Archive" : "Upcoming"} · {event.category}
              </span>
              <h1 className="t-page-sm">{event.title}</h1>
              <p className="max-w-[640px] text-[17px] leading-[1.6] text-on-navy text-pretty md:text-[19px]">
                {event.description}
              </p>
            </div>

            <div className="rounded-[18px] border border-white/15 bg-white/8 p-6 backdrop-blur-sm md:p-7">
              <dl className="flex flex-col gap-4 text-[15px]">
                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-navy-muted">
                    Date and time
                  </dt>
                  <dd className="font-semibold">{formatLongDate(event.date)}</dd>
                  <dd className="text-on-navy">{event.time}</dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-navy-muted">
                    Location
                  </dt>
                  <dd className="font-semibold">{event.location}</dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-white/15 pt-6">
                {hasLink ? (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-white w-full"
                  >
                    {past ? "View details →" : "Registration details →"}
                  </a>
                ) : (
                  <Link href="/contact" className="btn btn-white w-full">
                    Ask us about this →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          Archive gallery
          ================================================================ */}
      <section className="shell band">
        <div className="mb-8 flex flex-col gap-4">
          <span className="eyebrow">{past ? "Event archive" : "Preview"}</span>
          <h2 className="t-section-sm">
            {past ? "Moments from the day." : "What it usually looks like."}
          </h2>
        </div>

        {photos.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <li
                key={photo}
                className="card card-hover group relative aspect-[4/3] overflow-hidden"
                data-reveal=""
              >
                <Image
                  src={photo}
                  alt={`${event.title}, photo ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
            <h3 className="t-card">No photos yet</h3>
            <p className="max-w-sm text-[15px] leading-relaxed text-muted">
              We are still gathering photos for this event. Check back soon, or send yours to{" "}
              <a href="mailto:bmes@torontomu.ca" className="font-semibold text-brand hover:underline">
                bmes@torontomu.ca
              </a>
              .
            </p>
          </div>
        )}
      </section>

      {/* ================================================================
          Next step
          ================================================================ */}
      <section className="border-t border-hairline bg-surface">
        <div className="shell band-sm flex flex-col items-start justify-between gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex flex-col gap-3">
            <h2 className="t-band">See what else is coming up.</h2>
            <p className="max-w-[600px] text-[16px] leading-[1.6] text-muted md:text-[17px]">
              Workshops, panels and conferences run right across the academic year.
            </p>
          </div>
          <Link href="/events" className="btn btn-primary">
            All events →
          </Link>
        </div>
      </section>
    </>
  );
}
