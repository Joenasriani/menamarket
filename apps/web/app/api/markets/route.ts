import { NextResponse } from "next/server";
import { listPublicMarkets } from "@menamarket/api";

export async function GET() {
  try {
    const markets = await listPublicMarkets();
    return NextResponse.json(
      {
        markets,
        count: markets.length,
        generatedAtIso: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown catalog error";
    return NextResponse.json(
      {
        error: "MARKET_CATALOG_READ_FAILED",
        message
      },
      { status: 500 }
    );
  }
}
