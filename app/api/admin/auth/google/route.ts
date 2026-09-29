import { NextResponse } from "next/server";
import { beginGoogleSignIn } from "@/lib/admin/google";
import { OAUTH_COOKIE, cookieOptions, googleConfigured, signHandshake } from "@/lib/admin/sessionToken";

/** Start "Sign in with Google": remember the handshake, then hand over to Google. */
export async function GET(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin;
  if (!googleConfigured()) return NextResponse.redirect(`${origin}/admin/login?error=google-off`);

  const { url, handshake } = beginGoogleSignIn(origin);
  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_COOKIE, await signHandshake(handshake), cookieOptions(10 * 60, "/api/admin/auth"));
  return response;
}
