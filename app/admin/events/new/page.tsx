import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import EventForm from "../../components/EventForm";

export const metadata: Metadata = { title: "New event" };

export default async function NewEventPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/events" className="text-sm font-semibold text-muted hover:text-ink">
          ← Events
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">New event</h1>
      </div>
      <EventForm />
    </div>
  );
}
