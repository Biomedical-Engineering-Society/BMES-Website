import type { Metadata } from "next";
import Link from "next/link";
import EventsBrowser from "../components/EventsBrowser";
import { todayISO } from "@/lib/events";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Workshops, panels and conferences run by the Biomedical Engineering Society at Toronto Metropolitan University, in a list or on a calendar.",
};

/**
 * Whether an event is upcoming or past depends on today's date, so a page
 * prerendered once at deploy time would keep insisting an event is still coming
 * up long after it happened. Regenerate hourly instead.
 */
export const revalidate = 3600;

export default function EventsPage() {
  return (
    <>
      <EventsBrowser serverToday={todayISO()} />

      {/* Collaboration band */}
      <section className="border-t border-hairline bg-surface">
        <div className="shell band-sm flex flex-col items-start justify-between gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex flex-col gap-3">
            <h2 className="t-band">Running something with us?</h2>
            <p className="max-w-[600px] text-[16px] leading-[1.6] text-muted md:text-[17px]">
              We collaborate with course unions, faculty and industry partners across the year,
              including MUES, TMU Engineering and biotech firms across Toronto.
            </p>
          </div>
          <Link href="/contact" className="btn btn-primary">
            Get in touch →
          </Link>
        </div>
      </section>
    </>
  );
}
