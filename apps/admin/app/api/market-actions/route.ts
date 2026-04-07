import { NextResponse } from "next/server";
import { applyLifecycleAction } from "@menamarket/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await applyLifecycleAction(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown lifecycle error";
    return NextResponse.json(
      { error: "MARKET_ACTION_FAILED", message },
      { status: 400 }
    );
  }
}
