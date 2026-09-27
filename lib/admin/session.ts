import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_HOURS, signSession, verifySession, type AdminSession } from "./sessionToken";

/**
 * Who is signed in to the admin tool, if anyone.
 *
 * `proxy.ts` already bounces signed-out visitors, but only as a first pass. Every
 * admin page, action and route checks again through here before doing anything.
 */
export async function getAdmin(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

/** For admin pages: send anyone signed out to the login screen. */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function startSession(session: AdminSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, await signSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax still keeps the cookie off cross-site POSTs, and unlike Strict it lets
    // a link to /admin pasted in a group chat open signed in.
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** For admin API routes, which answer 401 rather than redirecting. */
export function unauthorizedResponse(): Response {
  return Response.json({ error: "Your admin session has ended. Sign in again." }, { status: 401 });
}
