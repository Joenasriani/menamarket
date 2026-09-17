import { NextResponse } from "next/server";
import {
  ACTOR_SESSION_COOKIE,
  createPayoutRequest,
  listPayoutRequests,
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

    const items = await listPayoutRequests(session.actorId);
    return NextResponse.json({ items, count: items.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown payout request read error";
    return NextResponse.json({ error: "PAYOUT_REQUESTS_READ_FAILED", message }, { status: 500 });
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

    const item = await createPayoutRequest({ ...body, actorId: session.actorId });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown payout request create error";
    return NextResponse.json({ error: "PAYOUT_REQUEST_CREATE_FAILED", message }, { status: 400 });
  }
}
