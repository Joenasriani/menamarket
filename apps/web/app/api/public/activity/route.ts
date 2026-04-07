import { NextResponse } from "next/server";
import { listActivityFeed } from "@menamarket/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limitRaw = url.searchParams.get("limit");
    const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;

    const items = await listActivityFeed({
      ...(url.searchParams.get("marketSlug") !== null && { marketSlug: url.searchParams.get("marketSlug")! }),
      ...(url.searchParams.get("actorId") !== null && { actorId: url.searchParams.get("actorId")! }),
      ...(limit !== undefined && { limit })
    });

    return NextResponse.json(
      {
        items,
        count: items.length,
        generatedAtIso: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown activity feed error";
    return NextResponse.json({ error: "ACTIVITY_FEED_FAILED", message }, { status: 500 });
  }
}
