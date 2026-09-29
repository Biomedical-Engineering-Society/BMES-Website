import type { Metadata } from "next";
import Link from "next/link";
import {
  accessListConfigured,
  listMembers,
  listPendingRequests,
  ownerEmails,
  type AccessRequest,
  type Member,
} from "@/lib/admin/access";
import { requireOwner } from "@/lib/admin/session";
import AccessManager from "./AccessManager";

export const metadata: Metadata = { title: "Access" };

export default async function AccessPage() {
  const admin = await requireOwner();

  let members: Member[] = [];
  let requests: AccessRequest[] = [];
  let loadError: string | null = null;
  if (accessListConfigured()) {
    try {
      [members, requests] = await Promise.all([listMembers(), listPendingRequests()]);
    } catch (error) {
      console.error(error);
      loadError = "The access list could not be loaded. Check the Supabase setup.";
    }
  } else {
    loadError = "The access list is not set up yet (SUPABASE_SERVICE_ROLE_KEY). Only backup owners can sign in.";
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin" className="text-sm font-semibold text-muted hover:text-ink">
          ← Admin
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Access</h1>
        <p className="mt-1 max-w-[640px] text-muted">
          Who can sign in to the admin with Google. <strong className="text-ink">Editors</strong> can update
          content. <strong className="text-ink">Owners</strong> can also manage this list.
        </p>
      </div>

      {loadError && (
        <p className="rounded-xl border border-crimson/30 bg-crimson/5 px-5 py-4 text-sm text-crimson">{loadError}</p>
      )}

      <AccessManager
        requests={requests}
        members={members}
        backupOwners={ownerEmails()}
        currentEmail={admin.email}
        canEdit={!loadError}
      />
    </div>
  );
}
