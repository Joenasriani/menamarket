import { NextResponse } from "next/server";
import { createPayoutRequest, listPayoutRequests } from "@menamarket/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const actorId = url.searchParams.get("actorId") ?? undefined;
    const items = await listPayoutRequests(actorId);
    return NextResponse.json({ items, count: items.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown payout request read error";
    return NextResponse.json({ error: "PAYOUT_REQUESTS_READ_FAILED", message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await createPayoutRequest(body);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown payout request create error";
    return NextResponse.json({ error: "PAYOUT_REQUEST_CREATE_FAILED", message }, { status: 400 });
  }
}
