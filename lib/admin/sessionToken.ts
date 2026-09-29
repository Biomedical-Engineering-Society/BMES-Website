import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * Signed tokens for the admin tool: the session itself, the short-lived Google
 * sign-in handshake, and the "signed in but not on the list" identity used to
 * request access.
 *
 * Kept apart from `session.ts` because `proxy.ts` needs it too, and the proxy
 * cannot use the `next/headers` cookie helpers that file is built on.
 */

export const SESSION_COOKIE = "bmes_admin";
export const IDENTITY_COOKIE = "bmes_admin_identity";
export const OAUTH_COOKIE = "bmes_admin_oauth";
export const SESSION_HOURS = 8;

export type AdminRole = "owner" | "editor";

export type AdminSession = {
  name: string;
  /** Null for the shared-password fallback, which only knows a typed name. */
  email: string | null;
  role: AdminRole;
  method: "google" | "password";
};

/** Someone Google vouched for who is not on the access list (yet). */
export type PendingIdentity = { email: string; name: string };

/** The Google handshake values we have to see again on the way back. */
export type OAuthHandshake = { state: string; nonce: string; verifier: string };

type Purpose = "session" | "identity" | "oauth";

function secretKey(): Uint8Array | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  // A short secret can be brute forced offline from any cookie, so refuse it.
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/** The shared password is a fallback that only exists while ADMIN_PASSWORD is set. */
export function passwordEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** Someone can sign in only with a signing secret and at least one way in. */
export function adminConfigured(): boolean {
  return secretKey() !== null && (googleConfigured() || passwordEnabled());
}

/** Each token is stamped with its purpose, so one kind can never be replayed as another. */
async function sign(payload: JWTPayload, purpose: Purpose, lifetime: string): Promise<string> {
  const key = secretKey();
  if (!key) throw new Error("ADMIN_SESSION_SECRET is missing or shorter than 32 characters.");
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(`bmes-admin:${purpose}`)
    .setIssuedAt()
    .setExpirationTime(lifetime)
    .sign(key);
}

async function verify(token: string | undefined, purpose: Purpose): Promise<JWTPayload | null> {
  const key = secretKey();
  if (!token || !key) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"], audience: `bmes-admin:${purpose}` });
    return payload;
  } catch {
    return null;
  }
}

const str = (value: unknown) => (typeof value === "string" ? value : null);

export function signSession(session: AdminSession): Promise<string> {
  return sign({ ...session }, "session", `${SESSION_HOURS}h`);
}

export async function verifySession(token: string | undefined): Promise<AdminSession | null> {
  const payload = await verify(token, "session");
  if (!payload) return null;
  const name = str(payload.name);
  const role = payload.role === "owner" || payload.role === "editor" ? payload.role : null;
  const method = payload.method === "google" || payload.method === "password" ? payload.method : null;
  if (!name || !role || !method) return null;
  return { name, email: str(payload.email), role, method };
}

export function signIdentity(identity: PendingIdentity): Promise<string> {
  return sign({ ...identity }, "identity", "1h");
}

export async function verifyIdentity(token: string | undefined): Promise<PendingIdentity | null> {
  const payload = await verify(token, "identity");
  const email = str(payload?.email);
  return payload && email ? { email, name: str(payload.name) ?? email } : null;
}

export function signHandshake(handshake: OAuthHandshake): Promise<string> {
  return sign({ ...handshake }, "oauth", "10m");
}

export async function verifyHandshake(token: string | undefined): Promise<OAuthHandshake | null> {
  const payload = await verify(token, "oauth");
  const [state, nonce, verifier] = [str(payload?.state), str(payload?.nonce), str(payload?.verifier)];
  return state && nonce && verifier ? { state, nonce, verifier } : null;
}

/** Cookie settings shared by every admin cookie. */
export function cookieOptions(maxAgeSeconds: number, path = "/") {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax still keeps the cookie off cross-site POSTs, and lets Google's
    // redirect back to us (a top-level GET) carry the handshake cookie.
    sameSite: "lax" as const,
    path,
    maxAge: maxAgeSeconds,
  };
}
