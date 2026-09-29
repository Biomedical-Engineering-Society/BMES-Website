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
                <span className="text-muted" title={admin.email ?? "Signed in with the shared password"}>
                  Signed in as <strong className="text-ink">{admin.name}</strong>
                  <span className="ml-2 rounded-full bg-brand-tint px-2 py-0.5 text-xs font-bold text-brand">
                    {admin.method === "password" ? "Editor (password)" : admin.role === "owner" ? "Owner" : "Editor"}
                  </span>
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
