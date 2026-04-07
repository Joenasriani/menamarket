"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, PageHeader } from "@menamarket/ui";

type Rail = {
  id: string;
  label: string;
  direction: "funding" | "payout" | "both";
  status: "active" | "disabled";
  notes?: string;
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(125, 161, 196, 0.18)",
  background: "rgba(255,255,255,0.03)",
  color: "#edf3fb"
};

export default function FundingPage() {
  const [rails, setRails] = useState<Rail[]>([]);
  const [railsError, setRailsError] = useState("");
  const [actorId, setActorId] = useState("");
  const [amount, setAmount] = useState("100");
  const [fundingResult, setFundingResult] = useState("");
  const [payoutResult, setPayoutResult] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/rails")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load rails (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setRails(data.rails ?? []);
          setRailsError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setRails([]);
          setRailsError(err instanceof Error ? err.message : "Failed to load rails.");
        }
      });
    return () => { cancelled = true; };
  }, []);

  function validateInputs(): string | null {
    if (!actorId.trim()) return "Actor ID is required.";
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount < 0.01) return "Amount must be at least 0.01.";
    return null;
  }

  async function createFundingIntent() {
    const error = validateInputs();
    if (error) {
      setFundingResult(error);
      return;
    }
    try {
      const response = await fetch("/api/public/funding-intents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          actorId: actorId.trim(),
          amount: Number(amount)
        })
      });
      const data = await response.json() as { item?: { id: string }, message?: string };
      if (!response.ok) throw new Error(data.message ?? "Funding request failed.");
      setFundingResult(`Funding intent created: ${data.item?.id ?? "unknown"}`);
    } catch (err) {
      setFundingResult(err instanceof Error ? err.message : "Funding request failed.");
    }
  }

  async function createPayoutRequest() {
    const error = validateInputs();
    if (error) {
      setPayoutResult(error);
      return;
    }
    try {
      const response = await fetch("/api/public/payout-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          actorId: actorId.trim(),
          amount: Number(amount)
        })
      });
      const data = await response.json() as { item?: { id: string }, message?: string };
      if (!response.ok) throw new Error(data.message ?? "Payout request failed.");
      setPayoutResult(`Payout request created: ${data.item?.id ?? "unknown"}`);
    } catch (err) {
      setPayoutResult(err instanceof Error ? err.message : "Payout request failed.");
    }
  }

  return (
    <div className="section stack">
      <PageHeader
        eyebrow="Funding"
        title="Wallet rails abstraction"
        description="This page captures funding and payout requests through active rails. Payment processing is currently in record-only mode."
      />

      <div className="card-grid">
        <Card title="Active rails" eyebrow="Available">
          <div className="stack" style={{ gap: 10 }}>
            {railsError ? (
              <div style={{ color: "#ffb2b2" }}>{railsError}</div>
            ) : rails.length === 0 ? "No active rails." : rails.map((rail) => (
              <div key={rail.id}>
                <strong>{rail.label}</strong> — {rail.direction}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Current mode" eyebrow="Operational state">
          Requests are captured as records. Payment provider integration (Stripe, crypto, bank rail) is a future module.
        </Card>
        <Card title="Next integration layer" eyebrow="Coming Soon">
          Provider integration will be added after reconciliation, compliance, and provider logic modules are ready.
        </Card>
      </div>

      <Card title="Create funding or payout request" eyebrow="Rail request">
        <div className="stack" style={{ gap: 14 }}>
          <label className="stack">
            <span>Actor ID</span>
            <input style={fieldStyle} value={actorId} onChange={(event) => setActorId(event.target.value)} placeholder="actor_..." required />
          </label>
          <label className="stack">
            <span>Amount</span>
            <input style={fieldStyle} type="number" min="0.01" step="any" value={amount} onChange={(event) => setAmount(event.target.value)} required />
          </label>
          <div className="inline">
            <Button type="button" onClick={createFundingIntent}>Create funding intent</Button>
            <Button type="button" onClick={createPayoutRequest} variant="secondary">Create payout request</Button>
            <Badge tone="warning">Records only</Badge>
          </div>
          {fundingResult ? <div style={{ color: fundingResult.startsWith("Funding intent created") ? "#8ce6d6" : "#ffb2b2" }}>{fundingResult}</div> : null}
          {payoutResult ? <div style={{ color: payoutResult.startsWith("Payout request created") ? "#8ce6d6" : "#ffb2b2" }}>{payoutResult}</div> : null}
        </div>
      </Card>
    </div>
  );
}
