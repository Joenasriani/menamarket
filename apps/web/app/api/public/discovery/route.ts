import { NextResponse } from "next/server";
import { getPublicDiscoveryApi } from "@menamarket/api";

export async function GET() {
  try {
    const summary = await getPublicDiscoveryApi();
    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown public discovery error";
    return NextResponse.json({ error: "PUBLIC_DISCOVERY_FAILED", message }, { status: 500 });
  }
}
