import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isProtectedAdminPath, verifyAdminSessionToken } from "@menamarket/api";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!isProtectedAdminPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/market-ops/:path*", "/api/market-drafts", "/api/market-publish", "/api/market-actions"]
};
