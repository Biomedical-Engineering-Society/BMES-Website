import { SignJWT, jwtVerify } from "jose";

/**
 * Signing and checking the admin session token.
 *
 * Kept apart from `session.ts` because `proxy.ts` needs it too, and the proxy
 * cannot use the `next/headers` cookie helpers that file is built on.
 */

export const SESSION_COOKIE = "bmes_admin";
export const SESSION_HOURS = 8;

export type AdminSession = { name: string };

function secretKey(): Uint8Array | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  // A short secret can be brute forced offline from any cookie, so refuse it.
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

/** Both env vars have to be set before anyone can sign in. */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && secretKey() !== null;
}

export async function signSession(session: AdminSession): Promise<string> {
  const key = secretKey();
  if (!key) throw new Error("ADMIN_SESSION_SECRET is missing or shorter than 32 characters.");

  return new SignJWT({ name: session.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key);
}

export async function verifySession(token: string | undefined): Promise<AdminSession | null> {
  const key = secretKey();
  if (!token || !key) return null;

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return typeof payload.name === "string" ? { name: payload.name } : null;
  } catch {
    return null;
  }
}
