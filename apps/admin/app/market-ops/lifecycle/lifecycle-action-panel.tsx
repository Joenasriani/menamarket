"use client";

import { useState } from "react";
import { Button } from "@menamarket/ui";

type Action = "open" | "halt" | "close" | "resolve" | "cancel";

export default function LifecycleActionPanel({
  slug,
  currentStatus,
  allowedActions
}: {
  slug: string;
  currentStatus: string;
  allowedActions: Action[];
}) {
  const [result, setResult] = useState<string>("");
  const [submitting, setSubmitting] = useState<Action | null>(null);
  const [outcome, setOutcome] = useState("yes");
  const [evidence, setEvidence] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [resolvedAtIso, setResolvedAtIso] = useState("");

  async function run(action: Action) {
    setSubmitting(action);
    setResult("");
    try {
      const payload: Record<string, string> = { slug, action };
      if (action === "resolve") {
        payload.outcome = outcome;
        payload.evidence = evidence;
        payload.sourceLink = sourceLink;
        payload.resolvedAtIso = resolvedAtIso;
      }

      const response = await fetch("/api/market-actions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as { after?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? "Lifecycle action failed.");
      }
      setResult(`Updated to ${data.after ?? "unknown"}`);
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Lifecycle action failed.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div style={{display: "flex", flexDirection: "column", gap: 10, minWidth: 280}}>
      <div style={{color: "#94a9c0"}}>Allowed from {currentStatus}: {allowedActions.length ? allowedActions.join(", ") : "none"}</div>

      {allowedActions.includes("resolve") ? (
        <div style={{display: "flex", flexDirection: "column", gap: 8, padding: 12, borderRadius: 12, border: "1px solid rgba(125, 161, 196, 0.18)"}}>
          <input value={outcome} onChange={(event) => setOutcome(event.target.value)} placeholder="Outcome" style={{padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(125, 161, 196, 0.18)", background: "rgba(255,255,255,0.03)", color: "#edf3fb"}} />
          <textarea value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="Evidence" style={{padding: "10px 12px", minHeight: 90, borderRadius: 10, border: "1px solid rgba(125, 161, 196, 0.18)", background: "rgba(255,255,255,0.03)", color: "#edf3fb"}} />
          <input value={sourceLink} onChange={(event) => setSourceLink(event.target.value)} placeholder="Source link" style={{padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(125, 161, 196, 0.18)", background: "rgba(255,255,255,0.03)", color: "#edf3fb"}} />
          <input value={resolvedAtIso} onChange={(event) => setResolvedAtIso(event.target.value)} placeholder="2026-12-31T20:00:00.000Z" style={{padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(125, 161, 196, 0.18)", background: "rgba(255,255,255,0.03)", color: "#edf3fb"}} />
        </div>
      ) : null}

      <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
        {allowedActions.map((action) => (
          <Button key={action} onClick={() => run(action)} disabled={submitting !== null}>
            {submitting === action ? "Working..." : action}
          </Button>
        ))}
      </div>

      {result ? <div style={{color: result.startsWith("Updated") ? "#8ce6d6" : "#ffb2b2"}}>{result}</div> : null}
    </div>
  );
}
