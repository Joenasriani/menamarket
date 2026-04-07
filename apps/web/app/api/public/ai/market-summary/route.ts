import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      slug?: string;
      question?: string;
      description?: string;
      outcomes?: Array<{ id: string; label: string }>;
    };

    if (!body.question || !Array.isArray(body.outcomes) || body.outcomes.length === 0) {
      return NextResponse.json({ message: "Missing required market summary fields." }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "OPENROUTER_API_KEY is not configured." }, { status: 500 });
    }

    const model = process.env.OPENROUTER_MODEL ?? "openrouter/auto";
    const prompt = [
      "Write a concise trading-neutral market summary from structured market data only.",
      "Do not invent facts or external context.",
      `Slug: ${body.slug ?? "unknown"}`,
      `Question: ${body.question}`,
      `Description: ${body.description ?? "No description provided."}`,
      `Outcomes: ${body.outcomes.map((outcome) => `${outcome.id}=${outcome.label}`).join(", ")}`
    ].join("\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You produce short factual market summaries for a prediction market interface. Use only the supplied fields."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json() as {
      provider?: string;
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      return NextResponse.json({ message: data.error?.message ?? "OpenRouter request failed." }, { status: response.status });
    }

    const summary = data.choices?.[0]?.message?.content?.trim();
    if (!summary) {
      return NextResponse.json({ message: "OpenRouter returned no summary." }, { status: 502 });
    }

    return NextResponse.json({
      summary,
      model,
      provider: data.provider ?? "OpenRouter",
      verified: true
    }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown AI summary error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
