import { NextResponse, type NextRequest } from "next/server";
import { finishGoogleSignIn } from "@/lib/admin/google";
import { recordSignIn, resolveAccess } from "@/lib/admin/access";
import {
  IDENTITY_COOKIE,
  OAUTH_COOKIE,
  SESSION_COOKIE,
  SESSION_HOURS,
  cookieOptions,
  signIdentity,
  signSession,
  verifyHandshake,
} from "@/lib/admin/sessionToken";

/**
 * Google sends the visitor back here. Verify who they are, then either sign
 * them in with their role or, if they are not on the list, let them request access.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const { origin, searchParams } = request.nextUrl;
  const back = (error: string) => {
    const response = NextResponse.redirect(`${origin}/admin/login?error=${error}`);
    response.cookies.delete({ name: OAUTH_COOKIE, path: "/api/admin/auth" });
    return response;
  };

  // They pressed cancel on Google's screen.
  if (searchParams.get("error")) return back("cancelled");

  const handshake = await verifyHandshake(request.cookies.get(OAUTH_COOKIE)?.value);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  if (!handshake || !code || !state) return back("expired");

  let identity;
  try {
    identity = await finishGoogleSignIn({ code, state, origin, handshake });
  } catch (error) {
    console.error(error);
    return back("google");
  }

  const access = await resolveAccess(identity.email);
  if (access === "error") return back("access-check");

  let response: NextResponse;
  if (access === "none") {
    response = NextResponse.redirect(`${origin}/admin/no-access`);
    response.cookies.set(IDENTITY_COOKIE, await signIdentity(identity), cookieOptions(60 * 60));
  } else {
    response = NextResponse.redirect(`${origin}/admin`);
    const session = await signSession({ ...identity, role: access, method: "google" });
    response.cookies.set(SESSION_COOKIE, session, cookieOptions(SESSION_HOURS * 60 * 60));
    response.cookies.delete(IDENTITY_COOKIE);
    await recordSignIn(identity.email, identity.name);
  }
  response.cookies.delete({ name: OAUTH_COOKIE, path: "/api/admin/auth" });
  return response;
}
