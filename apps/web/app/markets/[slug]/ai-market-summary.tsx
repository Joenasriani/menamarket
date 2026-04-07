"use client";

import { useState } from "react";
import { Button, Card } from "@menamarket/ui";

type SummaryPayload = {
  summary?: string;
  model?: string;
  provider?: string;
  verified?: boolean;
  message?: string;
};

export function AiMarketSummary({ slug, question, description, outcomes }: { slug: string; question: string; description?: string; outcomes: { id: string; label: string }[] }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateSummary() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/public/ai/market-summary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, question, description, outcomes })
      });
      const data = await response.json() as SummaryPayload;
      if (!response.ok) throw new Error(data.message ?? "AI summary failed.");
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI summary failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="AI market summary" eyebrow="OpenRouter-ready">
      <div className="stack">
        <p style={{ margin: 0 }}>Generates a compact market brief using your configured OpenRouter API key at deploy time.</p>
        <div>
          <Button type="button" onClick={generateSummary} disabled={loading}>{loading ? "Generating..." : "Generate AI summary"}</Button>
        </div>
        {summary?.summary ? (
          <div className="stack" style={{ gap: 8 }}>
            <div>{summary.summary}</div>
            <div style={{ fontSize: 12, color: "#94a9c0" }}>
              Model: {summary.model ?? "unknown"} · Provider: {summary.provider ?? "OpenRouter"} · Verification: {summary.verified ? "Generated from provided market fields only" : "Unavailable"}
            </div>
          </div>
        ) : null}
        {error ? <div style={{ color: "#ffb2b2" }}>{error}</div> : null}
      </div>
    </Card>
  );
}
