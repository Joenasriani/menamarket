import { NextResponse } from "next/server";
import { getOrderBook } from "@menamarket/api";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const book = await getOrderBook(slug);
    return NextResponse.json(book, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown orderbook error";
    return NextResponse.json({ error: "ORDERBOOK_FAILED", message }, { status: 500 });
  }
}
