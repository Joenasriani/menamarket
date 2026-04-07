import { NextResponse } from "next/server";
import { cancelOrder, listOrders, placeOrder } from "@menamarket/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orders = await listOrders({
      ...(url.searchParams.get("marketSlug") !== null && { marketSlug: url.searchParams.get("marketSlug")! }),
      ...(url.searchParams.get("actorId") !== null && { actorId: url.searchParams.get("actorId")! }),
      ...(url.searchParams.get("status") !== null && { status: url.searchParams.get("status")! as "open" | "cancelled" })
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
