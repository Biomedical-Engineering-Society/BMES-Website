import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { getStore } from "@/lib/admin/store";
import { readEvents } from "@/lib/admin/eventsRepo";
import EventForm from "../../components/EventForm";

export const metadata: Metadata = { title: "Edit event" };

type PageProps = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const store = getStore();
  if (!store) notFound();

  const { events } = await readEvents(store);
  const event = events.find((candidate) => String(candidate.id) === id);
  if (!event) notFound();

  const { id: eventId, images, ...fields } = event;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/events" className="text-sm font-semibold text-muted hover:text-ink">
          ← Events
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Edit “{event.title}”</h1>
      </div>
      <EventForm id={eventId} initial={fields} images={images ?? []} />
    </div>
  );
}
