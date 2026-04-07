import { NextResponse } from "next/server";
import { ACTOR_SESSION_COOKIE, createActor, createActorSessionToken } from "@menamarket/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await createActor(body);
    const token = createActorSessionToken(actor);

    const response = NextResponse.json({
      actor: {
        id: actor.id,
        username: actor.username,
        displayName: actor.displayName
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
