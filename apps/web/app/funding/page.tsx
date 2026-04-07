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
  const [actorId, setActorId] = useState("");
  const [amount, setAmount] = useState("100");
  const [fundingResult, setFundingResult] = useState("");
  const [payoutResult, setPayoutResult] = useState("");

  useEffect(() => {
    fetch("/api/public/rails")
      .then((res) => res.json())
      .then((data) => setRails(data.rails ?? []))
      .catch(() => setRails([]));
  }, []);

  async function createFundingIntent() {
    try {
      const response = await fetch("/api/public/funding-intents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          actorId,
          amount: Number(amount)
        })
      });
      const data = await response.json() as { item?: { id: string }, message?: string };
      if (!response.ok) throw new Error(data.message ?? "Funding request failed.");
      setFundingResult(`Funding intent created: ${data.item?.id ?? "unknown"}`);
    } catch (error) {
      setFundingResult(error instanceof Error ? error.message : "Funding request failed.");
    }
  }

  async function createPayoutRequest() {
    try {
      const response = await fetch("/api/public/payout-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          actorId,
          amount: Number(amount)
        })
      });
      const data = await response.json() as { item?: { id: string }, message?: string };
      if (!response.ok) throw new Error(data.message ?? "Payout request failed.");
      setPayoutResult(`Payout request created: ${data.item?.id ?? "unknown"}`);
    } catch (error) {
      setPayoutResult(error instanceof Error ? error.message : "Payout request failed.");
    }
  }

  return (
    <div className="section stack">
      <PageHeader
        eyebrow="Funding"
        title="Wallet rails abstraction"
        description="This page captures funding and payout requests through active rails without pretending a live payment provider is wired yet."
      />

      <div className="card-grid">
        <Card title="Active rails" eyebrow="Available">
          <div className="stack" style={{ gap: 10 }}>
            {rails.length === 0 ? "No active rails." : rails.map((rail) => (
              <div key={rail.id}>
                <strong>{rail.label}</strong> — {rail.direction}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Current mode" eyebrow="Truthful state">
          Requests are captured as records only. No real Stripe, crypto, or bank rail is executed in this stage.
        </Card>
        <Card title="Next integration layer" eyebrow="Later module">
          Replace the manual rail with actual providers after reconciliation, compliance, and provider logic are ready.
        </Card>
      </div>

      <Card title="Create funding or payout request" eyebrow="Rail request">
        <div className="stack" style={{ gap: 14 }}>
          <label className="stack">
            <span>Actor ID</span>
            <input style={fieldStyle} value={actorId} onChange={(event) => setActorId(event.target.value)} placeholder="actor_..." />
          </label>
          <label className="stack">
            <span>Amount</span>
            <input style={fieldStyle} value={amount} onChange={(event) => setAmount(event.target.value)} />
          </label>
          <div className="inline">
            <Button onClick={createFundingIntent}>Create funding intent</Button>
            <Button onClick={createPayoutRequest} variant="secondary">Create payout request</Button>
            <Badge tone="warning">Records only</Badge>
          </div>
          {fundingResult ? <div style={{ color: fundingResult.startsWith("Funding intent created") ? "#8ce6d6" : "#ffb2b2" }}>{fundingResult}</div> : null}
          {payoutResult ? <div style={{ color: payoutResult.startsWith("Payout request created") ? "#8ce6d6" : "#ffb2b2" }}>{payoutResult}</div> : null}
        </div>
      </Card>
    </div>
  );
}
