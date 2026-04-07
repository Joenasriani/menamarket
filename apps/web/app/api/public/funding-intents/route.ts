import { NextResponse } from "next/server";
import { createFundingIntent, listFundingIntents } from "@menamarket/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const actorId = url.searchParams.get("actorId") ?? undefined;
    const items = await listFundingIntents(actorId);
    return NextResponse.json({ items, count: items.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown funding intent read error";
    return NextResponse.json({ error: "FUNDING_INTENTS_READ_FAILED", message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await createFundingIntent(body);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown funding intent create error";
    return NextResponse.json({ error: "FUNDING_INTENT_CREATE_FAILED", message }, { status: 400 });
  }
}
