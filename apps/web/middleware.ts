import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for apps/web — the PUBLIC prediction market site.
 *
 * Route access levels:
 *   PUBLIC  (no auth required):
 *     /                       Homepage
 *     /markets                Market listing
 *     /markets/[slug]         Market detail
 *     /activity               Activity feed
 *     /compliance             Compliance page
 *     /about                  About page
 *     /login                  User sign-in
 *     /signup                 User sign-up
 *     /forgot-password        Password reset request
 *     /reset-password         Password reset confirmation
 *     /auth/callback          Supabase OAuth / email callback
 *     /api/public/**          All public API endpoints
 *     /api/markets/**         Market data API
 *     /api/discovery/**       Discovery API
 *
 *   USER-PROTECTED (actor session required — pages show an inline empty-state
 *   with a login link rather than a hard redirect, preserving link sharing):
 *     /portfolio              Actor positions and open orders
 *     /funding                Funding and payout requests
 *
 * ADMIN routes live exclusively in apps/admin (separate Next.js app,
 * separate Vercel project, separate URL).  They are NOT part of this app.
 * The admin gate (apps/admin/middleware.ts) never runs here.
 *
 * This middleware only refreshes the Supabase auth session so Server
 * Components and Route Handlers always receive a valid, non-expired token.
 * It intentionally avoids importing from @menamarket/api because that barrel
 * pulls in Node.js-only modules incompatible with the Edge runtime.
 */
export async function middleware(request: NextRequest) {
  // If Supabase is not configured (e.g. local dev without .env), skip session
  // refresh and allow all requests through — the site is public by default.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          }
        }
      }
    );

    // Refresh session if expired — required for Server Components.
    // This never blocks access; the public site is always reachable.
    await supabase.auth.getUser();
  } catch (err) {
    // Session refresh failure is non-fatal — the public site remains accessible.
    // Log to console so misconfiguration is visible in server logs without blocking requests.
    console.warn("[middleware] Supabase session refresh failed:", err instanceof Error ? err.message : String(err));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - any path with a file extension (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)"
  ]
};
