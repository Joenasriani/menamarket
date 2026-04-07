import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ACTOR_SESSION_COOKIE, createActorSessionToken, upsertActorFromSupabase } from "@menamarket/api";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { access_token?: unknown; username?: unknown };
    const { access_token, username } = body;

    if (!access_token || typeof access_token !== "string") {
      return NextResponse.json({ error: "MISSING_TOKEN", message: "access_token required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(access_token);
    if (error || !user || !user.email) {
      return NextResponse.json({ error: "INVALID_TOKEN", message: "Invalid or expired token." }, { status: 401 });
    }

    const actor = await upsertActorFromSupabase({
      id: user.id,
      email: user.email,
      ...(typeof username === "string" && username.trim().length > 0 && { username: username.trim() })
    });
    const token = createActorSessionToken(actor);

    const response = NextResponse.json({
      actor: {
        id: actor.id,
        username: actor.username,
        ...(actor.displayName !== undefined && { displayName: actor.displayName })
      }
    }, { status: 201 });

    response.cookies.set({
      name: ACTOR_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown signup error";
    return NextResponse.json({ error: "ACTOR_SIGNUP_FAILED", message }, { status: 400 });
  }
}
