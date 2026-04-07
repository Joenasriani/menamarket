import { NextResponse } from "next/server";
import { getPublicMarketPricing } from "@menamarket/api";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const pricing = await getPublicMarketPricing(slug);

    if (!pricing) {
      return NextResponse.json(
        { error: "PRICING_NOT_FOUND", message: "No public market matches this slug." },
        { status: 404 }
      );
    }

    return NextResponse.json(pricing, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown pricing error";
    return NextResponse.json({ error: "PUBLIC_PRICING_FAILED", message }, { status: 500 });
  }
}
