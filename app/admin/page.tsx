import Link from "next/link";
import { accessListConfigured, pendingRequestCount } from "@/lib/admin/access";
import { requireAdmin } from "@/lib/admin/session";
import { getStore } from "@/lib/admin/store";
import StoreNotice from "./components/StoreNotice";

type Tool = { title: string; body: string; href: string | null; badge?: number; ownerOnly?: boolean };

/**
 * The admin hub. Events is the first content tool; the others are placeholders
 * so the layout is ready for them. Access is for owners only.
 */
const TOOLS: Tool[] = [
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
  {
    title: "Access",
    body: "Approve access requests and choose who can use the admin.",
    href: "/admin/access",
    ownerOnly: true,
  },
];

export default async function AdminHome() {
  const admin = await requireAdmin();
  const store = getStore();
  const isOwner = admin.role === "owner";
  const pending = isOwner && accessListConfigured() ? await pendingRequestCount().catch(() => 0) : 0;
  const tools = TOOLS.filter((tool) => !tool.ownerOnly || isOwner);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Hi {admin.name}.</h1>
        <p className="mt-2 text-muted">What would you like to update?</p>
      </div>

      <StoreNotice kind={store?.kind ?? null} />

      <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {tools.map((tool) => (
          <li key={tool.title} className="card flex flex-col gap-3 p-6">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
              {tool.title}
              {tool.title === "Access" && pending > 0 && (
                <span className="rounded-full bg-crimson px-2 py-0.5 text-xs font-bold text-white">{pending} waiting</span>
              )}
            </h2>
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
