import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { getStore } from "@/lib/admin/store";
import StoreNotice from "./components/StoreNotice";

/**
 * The admin hub. Events is the first tool; the others are placeholders so the
 * layout is ready for them.
 */
const TOOLS = [
  {
    title: "Events",
    body: "Add, edit or remove events and upload their photos. Photos are converted, trimmed and resized for you.",
    href: "/admin/events",
  },
  {
    title: "Team members",
    body: "Update the executive team and their headshots.",
    href: null,
  },
  {
    title: "Chatbot knowledge",
    body: "Upload documents for the Pulse assistant to learn from.",
    href: null,
  },
];

export default async function AdminHome() {
  const admin = await requireAdmin();
  const store = getStore();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Hi {admin.name}.</h1>
        <p className="mt-2 text-muted">What would you like to update?</p>
      </div>

      <StoreNotice kind={store?.kind ?? null} />

      <ul className="grid gap-6 md:grid-cols-3">
        {TOOLS.map((tool) => (
          <li key={tool.title} className="card flex flex-col gap-3 p-6">
            <h2 className="font-display text-xl font-semibold text-ink">{tool.title}</h2>
            <p className="flex-1 text-[15px] leading-[1.6] text-muted">{tool.body}</p>
            {tool.href ? (
              <Link href={tool.href} className="btn btn-primary btn-sm self-start">
                Open →
              </Link>
            ) : (
              <span className="self-start rounded-full bg-placeholder px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-muted">
                Coming soon
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
