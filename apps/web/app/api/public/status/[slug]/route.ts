import { NextResponse } from "next/server";
import { getPublicStatusApi } from "@menamarket/api";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const result = await getPublicStatusApi(slug);

    if (!result) {
      return NextResponse.json(
        { error: "STATUS_NOT_FOUND", message: "No public market matches this slug." },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown public status error";
    return NextResponse.json({ error: "PUBLIC_STATUS_FAILED", message }, { status: 500 });
  }
}
