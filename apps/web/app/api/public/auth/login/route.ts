import { NextResponse } from "next/server";
import { ACTOR_SESSION_COOKIE, authenticateActor, createActorSessionToken } from "@menamarket/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await authenticateActor(body);
    const token = createActorSessionToken(actor);

    const response = NextResponse.json({
      actor: {
        id: actor.id,
        username: actor.username,
        displayName: actor.displayName
      }
    }, { status: 200 });

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
    const message = error instanceof Error ? error.message : "Unknown login error";
    return NextResponse.json({ error: "ACTOR_LOGIN_FAILED", message }, { status: 400 });
  }
}
