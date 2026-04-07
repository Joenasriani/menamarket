import { NextResponse } from "next/server";
import { getPublicMarketBySlug } from "@menamarket/api";

type Context = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const market = await getPublicMarketBySlug(slug);

    if (!market) {
      return NextResponse.json(
        { error: "MARKET_NOT_FOUND", message: "No public market matches this slug." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        market,
        generatedAtIso: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown market detail error";
    return NextResponse.json(
      { error: "MARKET_DETAIL_READ_FAILED", message },
      { status: 500 }
    );
  }
}
