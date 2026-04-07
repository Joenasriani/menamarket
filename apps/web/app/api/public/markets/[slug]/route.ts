import { NextResponse } from "next/server";
import { getPublicMarketApi } from "@menamarket/api";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const result = await getPublicMarketApi(slug);

    if (!result.market) {
      return NextResponse.json(
        { error: "MARKET_NOT_FOUND", message: "No public market matches this slug." },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown public market detail error";
    return NextResponse.json({ error: "PUBLIC_MARKET_DETAIL_FAILED", message }, { status: 500 });
  }
}
