import { NextResponse } from "next/server";
import { listRails } from "@menamarket/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const direction = url.searchParams.get("direction");
    const rails = await listRails(
      direction === "funding" || direction === "payout" ? direction : undefined
    );
    return NextResponse.json({ rails, count: rails.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown rails error";
    return NextResponse.json({ error: "RAILS_READ_FAILED", message }, { status: 500 });
  }
}
