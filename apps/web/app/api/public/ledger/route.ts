import { NextResponse } from "next/server";
import { applyLedgerAdjustment, getLedgerAccount, listLedgerAccounts } from "@menamarket/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const actorId = url.searchParams.get("actorId");
    if (actorId) {
      const account = await getLedgerAccount(actorId);
      return NextResponse.json({ account }, { status: 200 });
    }
    const accounts = await listLedgerAccounts();
    return NextResponse.json({ accounts, count: accounts.length }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ledger read error";
    return NextResponse.json({ error: "LEDGER_READ_FAILED", message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const account = await applyLedgerAdjustment(body);
    return NextResponse.json({ account }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ledger write error";
    return NextResponse.json({ error: "LEDGER_WRITE_FAILED", message }, { status: 400 });
  }
}
