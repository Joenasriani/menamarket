"use client";

import { useEffect, useState } from "react";
import { Badge, Card, PageHeader } from "@menamarket/ui";

type ActivityItem = {
  id: string;
  type: "audit" | "order" | "fill" | "settlement";
  marketSlug?: string;
  actorId?: string;
  title: string;
  detail: string;
  timestampIso: string;
};

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/public/activity?limit=50", { cache: "no-store" });
        const data = await response.json() as { items?: ActivityItem[]; generatedAtIso?: string; message?: string };
        if (!response.ok) throw new Error(data.message ?? "Failed to load activity feed.");
        if (!cancelled) {
          setItems(data.items ?? []);
          setLastUpdated(data.generatedAtIso ?? "");
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load activity feed.");
        }
      }
    }

    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="section stack">
      <PageHeader
        eyebrow="Activity"
        title="Live activity surface"
        description="This page refreshes periodically from real file-backed data. It does not simulate websocket streaming."
      />
      <div className="inline">
        <Badge tone="accent">Auto-refresh: 5s</Badge>
        <Badge>{lastUpdated ? `Updated: ${new Date(lastUpdated).toLocaleTimeString()}` : "Not loaded yet"}</Badge>
      </div>
      {error ? (
        <Card title="Feed error" eyebrow="Client state">{error}</Card>
      ) : null}
      <div className="stack" style={{ gap: 16 }}>
        {items.length === 0 ? (
          <Card title="No recent activity" eyebrow="Truthful state">
            No orders, fills, settlements, or audit events are currently available in the activity feed.
          </Card>
        ) : items.map((item) => (
          <Card key={item.id} title={item.title} eyebrow={item.type}>
            <div className="stack" style={{ gap: 10 }}>
              <div>{item.detail}</div>
              <div style={{ color: "#94a9c0" }}>
                {item.marketSlug ? `market: ${item.marketSlug} · ` : ""}
                {item.actorId ? `actor: ${item.actorId} · ` : ""}
                {new Date(item.timestampIso).toLocaleString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
