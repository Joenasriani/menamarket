import { NextResponse } from "next/server";
import { getActorPositions } from "@menamarket/api";

type Context = { params: Promise<{ actorId: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { actorId } = await context.params;
    const positions = await getActorPositions(actorId);
    return NextResponse.json({ actorId, positions }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown positions error";
    return NextResponse.json({ error: "POSITIONS_FAILED", message }, { status: 500 });
  }
}
