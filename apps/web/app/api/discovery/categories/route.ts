import { NextResponse } from "next/server";
import { listDiscoverySummary } from "@menamarket/api";

export async function GET() {
  try {
    const summary = await listDiscoverySummary();
    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown discovery error";
    return NextResponse.json(
      { error: "DISCOVERY_SUMMARY_FAILED", message },
      { status: 500 }
    );
  }
}
