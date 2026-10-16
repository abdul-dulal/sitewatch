import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

// Optimistic auth check: send signed-out visitors to the login page before the
// dashboard renders. The dashboard re-checks the session itself as well.
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (pathname === "/admin/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/login"],
};
