import { NextResponse } from "next/server";
import { cancelOrder, listOrders, placeOrder } from "@menamarket/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orders = await listOrders({
      marketSlug: url.searchParams.get("marketSlug") ?? undefined,
      actorId: url.searchParams.get("actorId") ?? undefined,
      status: (url.searchParams.get("status") as "open" | "cancelled" | null) ?? undefined
    });
    return NextResponse.json({ orders, count: orders.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown order list error";
    return NextResponse.json({ error: "ORDER_LIST_FAILED", message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = await placeOrder(body);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown order placement error";
    return NextResponse.json({ error: "ORDER_CREATE_FAILED", message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const order = await cancelOrder(body);
    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown order cancel error";
    return NextResponse.json({ error: "ORDER_CANCEL_FAILED", message }, { status: 400 });
  }
}
