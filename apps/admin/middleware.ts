import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge-compatible middleware for admin auth.
 *
 * This file intentionally avoids importing from "@menamarket/api" because the
 * barrel re-export pulls in modules that use Node.js-only APIs (node:crypto,
 * node:fs/promises, node:path) which are incompatible with the Edge runtime
 * used by Next.js middleware.
 *
 * The constants and helpers below mirror the server-side implementations in
 * packages/api/src/adminAuth.ts but use the Web Crypto API so they work on Edge.
 */

const ADMIN_SESSION_COOKIE = "menamarket_admin_session";

function isProtectedAdminPath(pathname: string): boolean {
  // Allow the login page and admin-auth API endpoints through without a session.
  // Every other route in this app is an admin-only surface and requires auth.
  if (pathname === "/login") return false;
  if (pathname.startsWith("/api/admin-auth/")) return false;
  return true;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return atob(base64);
}

type SessionPayload = { username: string; issuedAtIso: string };

async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;

  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex <= 0 || separatorIndex === token.length - 1) return null;

  const raw = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  if (!raw || !signature) return null;

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;

  const expected = await hmacSign(raw, secret);
  if (signature !== expected) return null;

  try {
    const parsed = JSON.parse(base64urlDecode(raw)) as SessionPayload;
    if (!parsed.username || !parsed.issuedAtIso) return null;

    const issued = Date.parse(parsed.issuedAtIso);
    if (!Number.isFinite(issued)) return null;

    const maxAge = Number.parseInt(process.env.ADMIN_SESSION_MAX_AGE_SECONDS ?? "43200", 10);
    const ageSeconds = Math.floor((Date.now() - issued) / 1000);
    if (ageSeconds > maxAge) return null;

    return parsed;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!isProtectedAdminPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets.
     * The isProtectedAdminPath function above decides whether each matched
     * path requires an authenticated session.
     * Excluded: _next/static, _next/image, favicon.ico, and files with
     * common static extensions (images, fonts, icons, robots, sitemap).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"
  ]
};
