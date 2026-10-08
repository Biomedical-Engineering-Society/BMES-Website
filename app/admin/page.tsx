import Link from "next/link";
import { accessListConfigured, pendingRequestCount } from "@/lib/admin/access";
import { requireAdmin } from "@/lib/admin/session";
import { getStore } from "@/lib/admin/store";
import StoreNotice from "./components/StoreNotice";

type Tool = { title: string; body: string; href: string | null };

/**
 * The admin hub. Content tools are cards; the rest are placeholders so the layout
 * is ready for them. Access is a small button beside the greeting, for owners only.
 */
const TOOLS: Tool[] = [
  {
    title: "Events",
    body: "Add, edit or remove events and upload their photos. Photos are converted, trimmed and resized for you.",
    href: "/admin/events",
  },
  {
    title: "Banner",
    body: "Post a short message to the scrolling strip on the home page for a few days. Otherwise it shows events in the week before they happen.",
    href: "/admin/announcement",
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
  const isOwner = admin.role === "owner";
  const pending = isOwner && accessListConfigured() ? await pendingRequestCount().catch(() => 0) : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Hi {admin.name}.</h1>
          <p className="mt-2 text-muted">What would you like to update?</p>
        </div>
        {isOwner && (
          <Link href="/admin/access" className="btn btn-outline btn-sm flex items-center gap-2">
            Manage access
            {pending > 0 && (
              <span className="rounded-full bg-crimson px-2 py-0.5 text-xs font-bold text-white">{pending} waiting</span>
            )}
          </Link>
        )}
      </div>

      <StoreNotice kind={store?.kind ?? null} />

      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
