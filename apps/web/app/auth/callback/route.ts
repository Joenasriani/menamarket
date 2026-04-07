import { NextResponse } from "next/server";
import { ACTOR_SESSION_COOKIE, createActorSessionToken, upsertActorFromSupabase } from "@menamarket/api";
import { createServerSupabaseClient } from "../../lib/supabase/server";

/**
 * Auth callback route — handles Supabase redirects for:
 *   - Email confirmation after signup
 *   - Password recovery (magic link from "Forgot password")
 *
 * Supabase redirects here with ?code=<pkce_code> after email actions.
 * We exchange the code for a session, create/fetch the actor record,
 * and set the actor session cookie before forwarding to the app.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = type === "recovery" ? "/reset-password" : "/portfolio";

  if (code) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data.session?.user) {
        const user = data.session.user;

        if (user.email) {
          const actor = await upsertActorFromSupabase({ id: user.id, email: user.email });
          const token = createActorSessionToken(actor);

          const response = NextResponse.redirect(`${origin}${next}`);
          response.cookies.set({
            name: ACTOR_SESSION_COOKIE,
            value: token,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/"
          });
          return response;
        }
      }
    } catch {
      // Fall through to error redirect
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
