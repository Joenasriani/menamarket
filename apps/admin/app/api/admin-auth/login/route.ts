import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, authenticateAdmin, createAdminSessionToken } from "@menamarket/api";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { next?: string };
    const result = authenticateAdmin(body);
    const token = createAdminSessionToken(result.username);
    const redirectTo = typeof body.next === "string" && body.next.startsWith("/") ? body.next : "/";

    const response = NextResponse.json({ ok: true, redirectTo }, { status: 200 });
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/"
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown login error";
    return NextResponse.json(
      { error: "ADMIN_LOGIN_FAILED", message },
      { status: 400 }
    );
  }
}
