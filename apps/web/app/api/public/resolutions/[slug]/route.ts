import { NextResponse } from "next/server";
import { getResolutionByMarketSlug } from "@menamarket/api";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const resolution = await getResolutionByMarketSlug(slug);

    if (!resolution) {
      return NextResponse.json(
        { error: "RESOLUTION_NOT_FOUND", message: "No resolution record exists for this market." },
        { status: 404 }
      );
    }

    return NextResponse.json({ resolution }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown public resolution error";
    return NextResponse.json({ error: "PUBLIC_RESOLUTION_FAILED", message }, { status: 500 });
  }
}
