import { NextResponse } from "next/server";
import { listFills } from "@menamarket/api";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const fills = await listFills({ marketSlug: slug });
    return NextResponse.json({ fills, count: fills.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown fill read error";
    return NextResponse.json({ error: "FILLS_READ_FAILED", message }, { status: 500 });
  }
}
