import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, runSimpleMatchingForMarket, verifyAdminSessionToken } from "@menamarket/api";

type Context = { params: Promise<{ slug: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const token = cookieHeader
      .split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(`${ADMIN_SESSION_COOKIE}=`))
      ?.slice(`${ADMIN_SESSION_COOKIE}=`.length);

    const session = verifyAdminSessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "UNAUTHORIZED", message: "Admin session required." }, { status: 401 });
    }

    const { slug } = await context.params;
    const result = await runSimpleMatchingForMarket(slug);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown matching error";
    return NextResponse.json({ error: "MATCHING_FAILED", message }, { status: 400 });
  }
}
