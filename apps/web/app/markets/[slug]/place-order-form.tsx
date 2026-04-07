"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card } from "@menamarket/ui";

type Outcome = { id: string; label: string };

type Session = {
  actorId: string;
  username: string;
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(125, 161, 196, 0.18)",
  background: "rgba(255,255,255,0.03)",
  color: "#edf3fb"
};

const selectStyle: React.CSSProperties = {
  ...fieldStyle,
  appearance: "none",
  cursor: "pointer"
};

export function PlaceOrderForm({ marketSlug, outcomes }: { marketSlug: string; outcomes: Outcome[] }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [outcomeId, setOutcomeId] = useState(outcomes[0]?.id ?? "");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("10");
  const [limitPrice, setLimitPrice] = useState("0.50");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/public/auth/session")
      .then((res) => res.json())
      .then((data: { session?: Session | null }) => {
        setSession(data.session ?? null);
      })
      .catch(() => setSession(null))
      .finally(() => setSessionLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    const qty = Number(quantity);
    const price = Number(limitPrice);

    if (!Number.isFinite(qty) || qty <= 0) {
      setResult({ ok: false, message: "Quantity must be a positive number." });
      return;
    }
    if (!Number.isFinite(price) || price < 0 || price > 1) {
      setResult({ ok: false, message: "Limit price must be between 0.00 and 1.00." });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          marketSlug,
          actorId: session.actorId,
          outcomeId,
          side,
          quantity: qty,
          limitPrice: price
        })
      });
      const data = await response.json() as { order?: { id: string }; message?: string };
      if (!response.ok) throw new Error(data.message ?? "Order placement failed.");
      setResult({ ok: true, message: `Order placed: ${data.order?.id ?? "unknown"}` });
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Order placement failed." });
    } finally {
      setSubmitting(false);
    }
  }

  if (sessionLoading) {
    return (
      <Card title="Place an order" eyebrow="Order entry">
        <div style={{ color: "#94a9c0" }}>Checking session…</div>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card title="Place an order" eyebrow="Order entry">
        <div className="stack" style={{ gap: 12 }}>
          <div style={{ color: "#94a9c0" }}>Sign in to place buy or sell orders on this market.</div>
          <a href="/login">Sign in →</a>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Place an order" eyebrow="Order entry">
      <form onSubmit={handleSubmit} className="stack" style={{ gap: 14 }}>
        <div className="inline">
          <Badge tone="accent">Signed in as @{session.username}</Badge>
        </div>

        <label className="stack">
          <span>Outcome</span>
          <select style={selectStyle} value={outcomeId} onChange={(e) => setOutcomeId(e.target.value)}>
            {outcomes.map((outcome) => (
              <option key={outcome.id} value={outcome.id}>{outcome.label}</option>
            ))}
          </select>
        </label>

        <label className="stack">
          <span>Side</span>
          <select style={selectStyle} value={side} onChange={(e) => setSide(e.target.value as "buy" | "sell")}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </label>

        <label className="stack">
          <span>Quantity</span>
          <input
            style={fieldStyle}
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </label>

        <label className="stack">
          <span>Limit price (0.00 – 1.00)</span>
          <input
            style={fieldStyle}
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            required
          />
        </label>

        <div className="inline">
          <Button disabled={submitting}>{submitting ? "Placing…" : `Place ${side} order`}</Button>
          <Badge tone="warning">Records only — no payment processing</Badge>
        </div>

        {result ? (
          <div style={{ color: result.ok ? "#8ce6d6" : "#ffb2b2" }}>{result.message}</div>
        ) : null}
      </form>
    </Card>
  );
}
