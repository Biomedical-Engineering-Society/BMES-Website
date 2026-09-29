import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AdminRole } from "./sessionToken";

/**
 * Who may use the admin tool.
 *
 * Kept in Supabase, not the repo, because the repo is public and this is a list
 * of people's emails. The tables have row level security on with no policies,
 * so only the server, holding the service role key, can read or write them.
 * See supabase/admin-access.sql.
 *
 * ADMIN_OWNER_EMAILS sits above the table: those people are always owners, so
 * nobody is ever locked out by an empty, paused or broken database.
 */

export type Member = {
  email: string;
  name: string | null;
  role: AdminRole;
  added_by: string | null;
  added_at: string;
  last_sign_in: string | null;
};

export type AccessRequest = {
  id: string;
  email: string;
  name: string | null;
  note: string | null;
  created_at: string;
};

export class AccessError extends Error {}

const normalise = (email: string) => email.trim().toLowerCase();

export function ownerEmails(): string[] {
  return (process.env.ADMIN_OWNER_EMAILS ?? "").split(",").map(normalise).filter(Boolean);
}

export function isBackupOwner(email: string | null): boolean {
  return Boolean(email) && ownerEmails().includes(normalise(email!));
}

export function accessListConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function db(): SupabaseClient {
  if (!accessListConfigured()) throw new AccessError("The access list is not set up (SUPABASE_SERVICE_ROLE_KEY).");
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * What someone signing in with this email is allowed to do.
 * "error" means the list could not be checked, which callers treat as no entry.
 */
export async function resolveAccess(email: string): Promise<AdminRole | "none" | "error"> {
  if (isBackupOwner(email)) return "owner";
  if (!accessListConfigured()) return "none";
  try {
    const { data, error } = await db().from("admin_users").select("role").eq("email", normalise(email)).maybeSingle();
    if (error) throw error;
    return data?.role === "owner" || data?.role === "editor" ? data.role : "none";
  } catch (error) {
    console.error("Could not check the admin access list:", error);
    return "error";
  }
}

/** Keep names current and show owners who is actually using the tool. Best effort. */
export async function recordSignIn(email: string, name: string): Promise<void> {
  if (!accessListConfigured()) return;
  await db()
    .from("admin_users")
    .update({ name, last_sign_in: new Date().toISOString() })
    .eq("email", normalise(email))
    .then(({ error }) => error && console.error("Could not record sign-in:", error));
}

export async function listMembers(): Promise<Member[]> {
  const { data, error } = await db().from("admin_users").select("*").order("added_at");
  if (error) throw new AccessError(error.message);
  return data as Member[];
}

export async function listPendingRequests(): Promise<AccessRequest[]> {
  const { data, error } = await db()
    .from("admin_access_requests")
    .select("id, email, name, note, created_at")
    .eq("status", "pending")
    .order("created_at");
  if (error) throw new AccessError(error.message);
  return data as AccessRequest[];
}

export async function pendingRequestCount(): Promise<number> {
  const { count, error } = await db()
    .from("admin_access_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) throw new AccessError(error.message);
  return count ?? 0;
}

export async function hasPendingRequest(email: string): Promise<boolean> {
  const { data, error } = await db()
    .from("admin_access_requests")
    .select("id")
    .eq("email", normalise(email))
    .eq("status", "pending")
    .maybeSingle();
  if (error) throw new AccessError(error.message);
  return Boolean(data);
}

export async function createRequest(email: string, name: string, note: string): Promise<"created" | "already-pending"> {
  const { error } = await db()
    .from("admin_access_requests")
    .insert({ email: normalise(email), name, note: note || null });
  // The partial unique index allows one pending request per email.
  if (error?.code === "23505") return "already-pending";
  if (error) throw new AccessError(error.message);
  return "created";
}

export async function approveRequest(id: string, role: AdminRole, by: string): Promise<void> {
  const client = db();
  const { data: request, error } = await client
    .from("admin_access_requests")
    .select("email, name")
    .eq("id", id)
    .eq("status", "pending")
    .maybeSingle();
  if (error) throw new AccessError(error.message);
  if (!request) throw new AccessError("That request was already handled.");

  const { error: upsertError } = await client
    .from("admin_users")
    .upsert({ email: request.email, name: request.name, role, added_by: by }, { onConflict: "email" });
  if (upsertError) throw new AccessError(upsertError.message);

  await decide(client, id, "approved", by);
}

export async function declineRequest(id: string, by: string): Promise<void> {
  await decide(db(), id, "declined", by);
}

async function decide(client: SupabaseClient, id: string, status: "approved" | "declined", by: string) {
  const { error } = await client
    .from("admin_access_requests")
    .update({ status, decided_by: by, decided_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw new AccessError(error.message);
}

/** Add someone directly, without waiting for them to request. */
export async function addMember(email: string, role: AdminRole, by: string): Promise<void> {
  const clean = normalise(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw new AccessError("That email address does not look right.");
  const { error } = await db().from("admin_users").upsert({ email: clean, role, added_by: by }, { onConflict: "email" });
  if (error) throw new AccessError(error.message);
}

export async function setRole(email: string, role: AdminRole): Promise<void> {
  if (role === "editor") await guardLastOwner(email);
  const { error } = await db().from("admin_users").update({ role }).eq("email", normalise(email));
  if (error) throw new AccessError(error.message);
}

export async function removeMember(email: string): Promise<void> {
  await guardLastOwner(email);
  const { error } = await db().from("admin_users").delete().eq("email", normalise(email));
  if (error) throw new AccessError(error.message);
}

/** Never leave the tool with nobody able to manage access. */
async function guardLastOwner(email: string): Promise<void> {
  if (ownerEmails().length > 0) return; // Backup owners always remain.
  const owners = (await listMembers()).filter((member) => member.role === "owner");
  if (owners.length === 1 && owners[0].email === normalise(email)) {
    throw new AccessError("That would leave nobody who can manage access. Make someone else an owner first.");
  }
}
