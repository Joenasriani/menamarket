import { NextResponse } from "next/server";
import { listSettlements, settleMarketBySlug } from "@menamarket/api";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const settlements = await listSettlements({ marketSlug: slug });
    return NextResponse.json({ settlements, count: settlements.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown settlement read error";
    return NextResponse.json({ error: "SETTLEMENT_READ_FAILED", message }, { status: 500 });
  }
}

export async function POST(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const result = await settleMarketBySlug(slug);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown settlement execution error";
    return NextResponse.json({ error: "SETTLEMENT_EXECUTION_FAILED", message }, { status: 400 });
  }
}
