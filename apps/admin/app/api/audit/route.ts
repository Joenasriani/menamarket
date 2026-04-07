import { NextResponse } from "next/server";
import { auditFacetSummary, listAuditEntries } from "@menamarket/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filters = {
      ...(url.searchParams.get("action") !== null && { action: url.searchParams.get("action")! }),
      ...(url.searchParams.get("targetType") !== null && { targetType: url.searchParams.get("targetType")! }),
      ...(url.searchParams.get("targetId") !== null && { targetId: url.searchParams.get("targetId")! }),
      ...(url.searchParams.get("q") !== null && { q: url.searchParams.get("q")! })
    };

    const [entries, summary] = await Promise.all([
      listAuditEntries(filters),
      auditFacetSummary()
    ]);

    return NextResponse.json(
      {
        entries,
        count: entries.length,
        summary
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown audit error";
    return NextResponse.json(
      { error: "AUDIT_READ_FAILED", message },
      { status: 500 }
    );
  }
}
