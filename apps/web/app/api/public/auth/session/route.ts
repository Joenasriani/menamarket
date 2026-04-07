import { NextResponse } from "next/server";
import { ACTOR_SESSION_COOKIE, verifyActorSessionToken } from "@menamarket/api";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const token = cookieHeader
      .split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(`${ACTOR_SESSION_COOKIE}=`))
      ?.slice(`${ACTOR_SESSION_COOKIE}=`.length);

    const session = verifyActorSessionToken(token);
    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown session error";
    return NextResponse.json({ error: "ACTOR_SESSION_FAILED", message }, { status: 500 });
  }
}
