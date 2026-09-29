import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { accessListConfigured, hasPendingRequest } from "@/lib/admin/access";
import { getAdmin, getPendingIdentity } from "@/lib/admin/session";
import RequestAccessForm from "./RequestAccessForm";
import { switchAccount } from "./actions";

export const metadata: Metadata = { title: "Request access" };

/** Where someone lands after signing in with Google when they are not on the access list. */
export default async function NoAccessPage() {
  if (await getAdmin()) redirect("/admin");
  const identity = await getPendingIdentity();
  if (!identity) redirect("/admin/login");

  const canRequest = accessListConfigured();
  const pending = canRequest ? await hasPendingRequest(identity.email).catch(() => false) : false;

  return (
    <div className="mx-auto max-w-[480px]">
      <div className="card p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">You don&apos;t have access yet</h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-muted">
          Signed in as <strong className="text-ink">{identity.email}</strong>.
        </p>

        {!canRequest ? (
          <p className="mt-5 text-[15px] text-muted">Ask a BMES admin owner to add this email.</p>
        ) : pending ? (
          <p className="mt-5 rounded-lg bg-brand-tint px-4 py-3 text-sm font-semibold text-brand">
            Your request is waiting for an owner to approve it. Sign in again once they have.
          </p>
        ) : (
          <RequestAccessForm />
        )}

        <form action={switchAccount} className="mt-6 border-t border-hairline pt-5">
          <button type="submit" className="text-sm font-semibold text-muted hover:text-ink">
            Use a different Google account
          </button>
        </form>
      </div>
    </div>
  );
}
