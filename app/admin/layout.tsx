import type { Metadata } from "next";
import Link from "next/link";
import { getAdmin } from "@/lib/admin/session";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · BMES Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-hairline bg-white">
        <div className="shell flex flex-wrap items-center justify-between gap-4 py-4">
          <Link href="/admin" className="font-display text-lg font-semibold text-ink">
            BMES <span className="text-brand">Admin</span>
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/" className="font-semibold text-muted hover:text-ink">
              View site ↗
            </Link>
            {admin && (
              <>
                <span className="text-muted">
                  Signed in as <strong className="text-ink">{admin.name}</strong>
                </span>
                <form action={logout}>
                  <button type="submit" className="btn btn-outline btn-sm">
                    Sign out
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="shell py-10 md:py-14">{children}</div>
    </div>
  );
}
