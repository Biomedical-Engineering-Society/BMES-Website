import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { getStore } from "@/lib/admin/store";
import { readAnnouncement } from "@/lib/admin/announcementRepo";
import { bannerContent, isActive } from "@/lib/announcement";
import { formatLongDate, todayISO } from "@/lib/events";
import StoreNotice from "../components/StoreNotice";
import PublishBanner from "../components/PublishBanner";
import AnnouncementForm from "./AnnouncementForm";

export const metadata: Metadata = { title: "Banner" };

type PageProps = { searchParams: Promise<{ saved?: string; did?: string }> };

export default async function AdminAnnouncementPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { saved, did } = await searchParams;
  const store = getStore();
  const today = todayISO();

  // Read from the repo, not the deployed build, so a save shows up before its deploy finishes.
  const announcement = store ? (await readAnnouncement(store)).announcement : null;
  const active = isActive(announcement, today) ? announcement : null;
  const showing = bannerContent(announcement, today);

  const status = active ? `Showing your message through ${formatLongDate(active.expiresOn)}.` : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin" className="text-sm font-semibold text-muted hover:text-ink">
          ← Admin
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Banner</h1>
        <p className="mt-1 text-muted">
          The scrolling strip under the home page video. Post a message for a few days, and when it runs out the
          banner goes back to its default: the next event during the week before it, and general lines about the
          club the rest of the time.
        </p>
      </div>

      <StoreNotice kind={store?.kind ?? null} />
      {saved && <PublishBanner sha={saved} what={did ?? "Your change"} />}

      <AnnouncementForm current={active} showing={showing} status={status} />
    </div>
  );
}
