import { NextResponse } from "next/server";
import {
  ACTOR_SESSION_COOKIE,
  createFundingIntent,
  listFundingIntents,
  paymentRailsEnabled,
  verifyActorSessionToken
} from "@menamarket/api";

function getActorSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((value) => value.startsWith(`${ACTOR_SESSION_COOKIE}=`))
    ?.slice(`${ACTOR_SESSION_COOKIE}=`.length);

  return verifyActorSessionToken(token);
}

function disabledResponse() {
  return NextResponse.json(
    { error: "PAYMENT_RAILS_DISABLED", message: "Funding and payout rails are disabled in this deployment." },
    { status: 503 }
  );
}

function unauthorizedResponse() {
  return NextResponse.json(
    { error: "AUTH_REQUIRED", message: "An authenticated actor session is required." },
    { status: 401 }
  );
}

export async function GET(request: Request) {
  try {
    if (!paymentRailsEnabled()) return disabledResponse();

    const session = getActorSession(request);
    if (!session) return unauthorizedResponse();

    const items = await listFundingIntents(session.actorId);
    return NextResponse.json({ items, count: items.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown funding intent read error";
    return NextResponse.json({ error: "FUNDING_INTENTS_READ_FAILED", message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!paymentRailsEnabled()) return disabledResponse();

    const session = getActorSession(request);
    if (!session) return unauthorizedResponse();

    const raw = await request.json();
    const body = raw && typeof raw === "object" && !Array.isArray(raw)
      ? raw as Record<string, unknown>
      : {};

    const item = await createFundingIntent({ ...body, actorId: session.actorId });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown funding intent create error";
    return NextResponse.json({ error: "FUNDING_INTENT_CREATE_FAILED", message }, { status: 400 });
  }
}
