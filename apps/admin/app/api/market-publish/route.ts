import { NextResponse } from "next/server";
import { publishDraftBySlug } from "@menamarket/api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { slug?: string };
    if (!body.slug || typeof body.slug !== "string") {
      return NextResponse.json(
        { error: "PUBLISH_FAILED", message: "A valid slug is required." },
        { status: 400 }
      );
    }
    const result = await publishDraftBySlug(body.slug);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown publish error";
    return NextResponse.json(
      { error: "PUBLISH_FAILED", message },
      { status: 400 }
    );
  }
}
