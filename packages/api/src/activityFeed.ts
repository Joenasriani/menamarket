import { listAuditEntries, listFills, listOrders, listSettlements } from "./index.js";

export type ActivityFeedItem = {
  id: string;
  type: "audit" | "order" | "fill" | "settlement";
  marketSlug?: string;
  actorId?: string;
  title: string;
  detail: string;
  timestampIso: string;
};

export type ActivityFeedFilters = {
  marketSlug?: string;
  actorId?: string;
  limit?: number;
};

export async function listActivityFeed(filters: ActivityFeedFilters = {}): Promise<ActivityFeedItem[]> {
  const [auditEntries, orders, fills, settlements] = await Promise.all([
    listAuditEntries(filters.marketSlug ? { q: filters.marketSlug } : {}),
    listOrders({
      ...(filters.marketSlug !== undefined && { marketSlug: filters.marketSlug }),
      ...(filters.actorId !== undefined && { actorId: filters.actorId })
    }),
    listFills({
      ...(filters.marketSlug !== undefined && { marketSlug: filters.marketSlug }),
      ...(filters.actorId !== undefined && { actorId: filters.actorId })
    }),
    listSettlements({
      ...(filters.marketSlug !== undefined && { marketSlug: filters.marketSlug }),
      ...(filters.actorId !== undefined && { actorId: filters.actorId })
    })
  ]);

  const auditItems: ActivityFeedItem[] = auditEntries.map((entry) => {
    const marketSlug = typeof entry.metadata.slug === "string" ? entry.metadata.slug : undefined;
    return {
      id: `audit:${entry.id}`,
      type: "audit" as const,
      ...(marketSlug !== undefined && { marketSlug }),
      title: entry.action,
      detail: `Target ${entry.targetType}:${entry.targetId}`,
      timestampIso: entry.timestampIso
    };
  });

  const orderItems: ActivityFeedItem[] = orders.map((order) => ({
    id: `order:${order.id}`,
    type: "order",
    marketSlug: order.marketSlug,
    actorId: order.actorId,
    title: `${order.side.toUpperCase()} ${order.outcomeId}`,
    detail: `qty ${order.quantity} @ ${order.limitPrice.toFixed(2)} (${order.status})`,
    timestampIso: order.updatedAtIso
  }));

  const fillItems: ActivityFeedItem[] = fills.map((fill) => ({
    id: `fill:${fill.id}`,
    type: "fill",
    marketSlug: fill.marketSlug,
    title: `Matched ${fill.outcomeId}`,
    detail: `qty ${fill.quantity} @ ${fill.price.toFixed(2)} | buyer ${fill.buyActorId} seller ${fill.sellActorId}`,
    timestampIso: fill.createdAtIso
  }));

  const settlementItems: ActivityFeedItem[] = settlements.map((settlement) => ({
    id: `settlement:${settlement.id}`,
    type: "settlement",
    marketSlug: settlement.marketSlug,
    actorId: settlement.actorId,
    title: `Settlement ${settlement.winningOutcomeId}`,
    detail: `payout ${settlement.payoutAmount.toFixed(2)} to ${settlement.actorId}`,
    timestampIso: settlement.createdAtIso
  }));

  const merged = [...auditItems, ...orderItems, ...fillItems, ...settlementItems]
    .filter((item) => !filters.marketSlug || item.marketSlug === filters.marketSlug)
    .filter((item) => !filters.actorId || item.actorId === filters.actorId)
    .sort((a, b) => b.timestampIso.localeCompare(a.timestampIso));

  const limit = filters.limit && filters.limit > 0 ? Math.min(filters.limit, 200) : 50;
  return merged.slice(0, limit);
}
