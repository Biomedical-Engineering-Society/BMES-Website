import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { OAuthHandshake, PendingIdentity } from "./sessionToken";

/**
 * "Sign in with Google", as a plain OpenID Connect authorization-code flow with
 * PKCE. Small enough to own outright rather than pull in an auth framework:
 * send the visitor to Google, take the code back, swap it for an ID token and
 * check Google signed it for us.
 */

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_KEYS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

export class GoogleSignInError extends Error {}

const random = () => randomBytes(32).toString("base64url");

export function callbackUrl(origin: string): string {
  return `${origin}/api/admin/auth/callback`;
}

/** Where to send the visitor, and the values to hold on to until they come back. */
export function beginGoogleSignIn(origin: string): { url: string; handshake: OAuthHandshake } {
  const handshake = { state: random(), nonce: random(), verifier: random() };
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: callbackUrl(origin),
    response_type: "code",
    scope: "openid email profile",
    state: handshake.state,
    nonce: handshake.nonce,
    code_challenge: createHash("sha256").update(handshake.verifier).digest("base64url"),
    code_challenge_method: "S256",
    // Always ask which account, so someone signed into a personal Gmail can pick their TMU one.
    prompt: "select_account",
  });
  return { url: `${AUTH_URL}?${params}`, handshake };
}

/** Swap Google's code for a verified identity. Throws if anything does not check out. */
export async function finishGoogleSignIn(options: {
  code: string;
  state: string;
  origin: string;
  handshake: OAuthHandshake;
}): Promise<PendingIdentity> {
  const { code, state, origin, handshake } = options;
  if (state !== handshake.state) throw new GoogleSignInError("The sign-in link was stale or tampered with.");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: callbackUrl(origin),
      grant_type: "authorization_code",
      code_verifier: handshake.verifier,
    }),
    cache: "no-store",
  });
  const tokens = (await response.json().catch(() => ({}))) as { id_token?: string; error?: string };
  if (!response.ok || !tokens.id_token) {
    throw new GoogleSignInError(`Google did not complete the sign-in (${tokens.error ?? response.status}).`);
  }

  let claims;
  try {
    ({ payload: claims } = await jwtVerify(tokens.id_token, GOOGLE_KEYS, {
      issuer: GOOGLE_ISSUERS,
      audience: process.env.GOOGLE_CLIENT_ID!,
    }));
  } catch (error) {
    throw new GoogleSignInError(`Google's sign-in token did not verify: ${(error as Error).message}`);
  }

  if (claims.nonce !== handshake.nonce) throw new GoogleSignInError("The sign-in token was not issued for this attempt.");
  if (claims.email_verified !== true || typeof claims.email !== "string") {
    throw new GoogleSignInError("That Google account has no verified email address.");
  }

  const email = claims.email.toLowerCase();
  const name = typeof claims.name === "string" && claims.name.trim() ? claims.name.trim() : email;
  return { email, name: name.replace(/\s+/g, " ").slice(0, 60) };
}
