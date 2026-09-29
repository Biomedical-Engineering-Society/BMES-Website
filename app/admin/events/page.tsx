import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { getStore } from "@/lib/admin/store";
import { readEvents } from "@/lib/admin/eventsRepo";
import { formatLongDate, todayISO } from "@/lib/events";
import StoreNotice from "../components/StoreNotice";
import PublishBanner from "../components/PublishBanner";
import DeleteEventButton from "../components/DeleteEventButton";

export const metadata: Metadata = { title: "Events" };

type PageProps = { searchParams: Promise<{ saved?: string; did?: string }> };

export default async function AdminEventsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { saved, did } = await searchParams;
  const store = getStore();

  // Read from the repo, not the deployed build, so a save shows up before its deploy finishes.
  const events = store ? (await readEvents(store)).events : [];
  const today = todayISO();
  const sorted = events.slice().sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm font-semibold text-muted hover:text-ink">
            ← Admin
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Events</h1>
          <p className="mt-1 text-muted">
            {events.length} events. Newest first. Past events without photos are flagged.
          </p>
        </div>
        {store && (
          <Link href="/admin/events/new" className="btn btn-primary">
            + New event
          </Link>
        )}
      </div>

      <StoreNotice kind={store?.kind ?? null} />
      {saved && <PublishBanner sha={saved} what={did ?? "Your change"} />}

      <ul className="card divide-y divide-hairline overflow-hidden">
        {sorted.map((event) => {
          const photos = event.images?.length ?? 0;
          const past = event.date < today;
          return (
            <li key={event.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 md:px-6">
              <div className="min-w-[220px] flex-1">
                <p className="font-semibold text-ink">{event.title}</p>
                <p className="text-sm text-muted">
                  {formatLongDate(event.date)} · {event.category}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  photos === 0 && past ? "bg-crimson/10 text-crimson" : "bg-brand-tint text-brand"
                }`}
              >
                {photos === 0 ? (past ? "Needs photos" : "No photos") : `${photos} photo${photos === 1 ? "" : "s"}`}
              </span>
              <span className="w-[74px] text-xs font-bold uppercase tracking-[0.1em] text-muted">
                {past ? "Past" : "Upcoming"}
              </span>
              <div className="flex items-center gap-2">
                <Link href={`/admin/events/${event.id}`} className="btn btn-outline btn-sm">
                  Edit
                </Link>
                <DeleteEventButton id={event.id} title={event.title} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
