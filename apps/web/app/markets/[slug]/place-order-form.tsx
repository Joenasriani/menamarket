"use client";

import { Badge, Card } from "@menamarket/ui";

type Outcome = { id: string; label: string };

/**
 * PlaceOrderForm — public preview mode.
 *
 * Order placement is disabled in the current public preview.
 * This component renders a read-only notice in place of the order form.
 * Once user accounts and trading infrastructure are live, this will be replaced
 * with the full order entry form.
 */
export function PlaceOrderForm({
  marketStatus,
}: {
  marketSlug: string;
  marketStatus: string;
  outcomes: Outcome[];
}) {
  if (marketStatus !== "open") {
    return (
      <Card title="Order entry" eyebrow="Unavailable">
        <div style={{ color: "#94a9c0" }}>This market is not open for trading.</div>
      </Card>
    );
  }

  return (
    <Card title="Order entry" eyebrow="Read-only preview">
      <div className="stack" style={{ gap: 12 }}>
        <div className="inline">
          <Badge tone="warning">Read-only preview</Badge>
        </div>
        <div style={{ color: "#94a9c0", lineHeight: 1.7 }}>
          Order placement is not available in the current public preview.
          Sign-in and live trading will be enabled in a future release.
        </div>
        <a href="/about" style={{ color: "#8ce6d6", fontSize: 13 }}>Learn about MENAMarket →</a>
      </div>
    </Card>
  );
}

