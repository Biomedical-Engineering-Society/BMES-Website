import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { resolveAccess } from "./access";
import {
  IDENTITY_COOKIE,
  SESSION_COOKIE,
  SESSION_HOURS,
  cookieOptions,
  passwordEnabled,
  signSession,
  verifyIdentity,
  verifySession,
  type AdminSession,
} from "./sessionToken";

/**
 * Who is signed in to the admin tool, if anyone, and with what role.
 *
 * `proxy.ts` already bounces signed-out visitors, but only as a first pass. Every
 * admin page, action and route checks again through here before doing anything.
 *
 * Google sessions are re-checked against the access list on every request, so
 * removing someone takes effect on their next click rather than when their
 * cookie runs out. Password sessions end the moment the password is turned off.
 */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  if (session.method === "password") return passwordEnabled() ? { ...session, role: "editor" } : null;

  const role = await resolveAccess(session.email ?? "");
  // "none" and "error" both lock the door: fail closed.
  return role === "owner" || role === "editor" ? { ...session, role } : null;
});

/** For admin pages: send anyone signed out to the login screen. */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** For owner-only pages, like managing access. */
export async function requireOwner(): Promise<AdminSession> {
  const admin = await requireAdmin();
  if (admin.role !== "owner") redirect("/admin");
  return admin;
}

export async function startSession(session: AdminSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await signSession(session), cookieOptions(SESSION_HOURS * 60 * 60));
  cookieStore.delete(IDENTITY_COOKIE);
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(IDENTITY_COOKIE);
}

/** The Google identity of someone signed in but not on the access list. */
export async function getPendingIdentity() {
  const cookieStore = await cookies();
  return verifyIdentity(cookieStore.get(IDENTITY_COOKIE)?.value);
}

/** How a change is signed in commit messages: the Google email, or a marked typed name. */
export function actorLabel(admin: AdminSession): string {
  const name = admin.name.replace(/[\r\n"]/g, " ");
  return admin.email ? `${name} <${admin.email}>` : `${name} (password)`;
}

/** For admin API routes, which answer 401 rather than redirecting. */
export function unauthorizedResponse(): Response {
  return Response.json({ error: "Your admin session has ended. Sign in again." }, { status: 401 });
}
