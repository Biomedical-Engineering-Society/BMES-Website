import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/admin/sessionToken";

/**
 * Keeps the admin tool out of sight.
 *
 * Signed-out visitors to an admin page go to the login screen, and nothing
 * under /admin is ever indexed. This is only the first check: every admin page
 * and API route verifies the session again itself.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");
  const isLogin = pathname === "/admin/login";

  let response: NextResponse;
  if (!isApi && !isLogin && !(await verifySession(request.cookies.get(SESSION_COOKIE)?.value))) {
    response = NextResponse.redirect(new URL("/admin/login", request.url));
  } else {
    response = NextResponse.next();
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
