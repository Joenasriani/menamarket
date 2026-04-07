import { NextResponse } from "next/server";
import { listPublicMarketsApi, parsePageNumber } from "@menamarket/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const result = await listPublicMarketsApi({
      q: url.searchParams.get("q") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
      jurisdiction: url.searchParams.get("jurisdiction") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      page: parsePageNumber(url.searchParams.get("page"), 1),
      pageSize: parsePageNumber(url.searchParams.get("pageSize"), 20)
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown public markets API error";
    return NextResponse.json({ error: "PUBLIC_MARKETS_FAILED", message }, { status: 500 });
  }
}
