import { NextResponse } from "next/server";
import { createMarketDraft, listMarketDrafts } from "@menamarket/api";

export async function GET() {
  try {
    const drafts = await listMarketDrafts();
    return NextResponse.json({ drafts, count: drafts.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown draft catalog error";
    return NextResponse.json({ error: "DRAFT_CATALOG_READ_FAILED", message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const draft = await createMarketDraft(body);
    return NextResponse.json({ draft }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown draft creation error";
    return NextResponse.json(
      { error: "DRAFT_CREATE_FAILED", message },
      { status: 400 }
    );
  }
}
