import fs from "node:fs/promises";
import path from "node:path";
import { getPublicMarketBySlug } from "./markets.js";

export type OrderSide = "buy" | "sell";
export type OrderStatus = "open" | "cancelled";

export type OrderRecord = {
  id: string;
  marketSlug: string;
  actorId: string;
  outcomeId: string;
  side: OrderSide;
  quantity: number;
  limitPrice: number;
  status: OrderStatus;
  createdAtIso: string;
  updatedAtIso: string;
};

export type OrderCatalog = { orders: OrderRecord[] };

export type NewOrderInput = {
  marketSlug: string;
  actorId: string;
  outcomeId: string;
  side: OrderSide;
  quantity: number;
  limitPrice: number;
};

function isIsoDateTime(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && value.includes("T");
}

export function validateOrderCatalog(input: unknown): OrderCatalog {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Order catalog must be an object.");
  }
  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.orders)) {
    throw new Error("Order catalog must contain an orders array.");
  }

  const orders = value.orders.map((item) => {
    const order = item as Record<string, unknown>;
    if (
      typeof order.id !== "string" ||
      typeof order.marketSlug !== "string" ||
      typeof order.actorId !== "string" ||
      typeof order.outcomeId !== "string" ||
      (order.side !== "buy" && order.side !== "sell") ||
      typeof order.quantity !== "number" ||
      order.quantity <= 0 ||
      typeof order.limitPrice !== "number" ||
      order.limitPrice < 0 ||
      order.limitPrice > 1 ||
      (order.status !== "open" && order.status !== "cancelled") ||
      typeof order.createdAtIso !== "string" ||
      !isIsoDateTime(order.createdAtIso) ||
      typeof order.updatedAtIso !== "string" ||
      !isIsoDateTime(order.updatedAtIso)
    ) {
      throw new Error("Invalid order record.");
    }

    return order as OrderRecord;
  });

  return { orders };
}

async function readOrderCatalog(): Promise<OrderCatalog> {
  const filePath = path.resolve(process.cwd(), "data/orders.json");
  const contents = await fs.readFile(filePath, "utf-8");
  return validateOrderCatalog(JSON.parse(contents));
}

async function writeOrderCatalog(next: OrderCatalog): Promise<void> {
  const filePath = path.resolve(process.cwd(), "data/orders.json");
  try {
    await fs.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf-8");
  } catch (err) {
    const isReadOnly = err instanceof Error &&
      (err.message.includes("EROFS") || err.message.includes("read-only") || err.message.includes("ENOENT"));
    throw new Error(
      isReadOnly
        ? "Persistent writes are unavailable in this deployment. Connect a database to enable trading."
        : (err instanceof Error ? err.message : "Write failed.")
    );
  }
}

export function validateNewOrderInput(input: unknown): NewOrderInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Order input must be an object.");
  }
  const value = input as Record<string, unknown>;
  if (typeof value.marketSlug !== "string" || value.marketSlug.trim().length === 0) throw new Error("Invalid field: marketSlug");
  if (typeof value.actorId !== "string" || value.actorId.trim().length === 0) throw new Error("Invalid field: actorId");
  if (typeof value.outcomeId !== "string" || value.outcomeId.trim().length === 0) throw new Error("Invalid field: outcomeId");
  if (value.side !== "buy" && value.side !== "sell") throw new Error("Invalid field: side");
  if (typeof value.quantity !== "number" || value.quantity <= 0) throw new Error("Invalid field: quantity");
  if (typeof value.limitPrice !== "number" || value.limitPrice < 0 || value.limitPrice > 1) throw new Error("Invalid field: limitPrice");

  return {
    marketSlug: value.marketSlug,
    actorId: value.actorId,
    outcomeId: value.outcomeId,
    side: value.side,
    quantity: value.quantity,
    limitPrice: value.limitPrice
  };
}

export async function listOrders(filters: { marketSlug?: string; actorId?: string; status?: OrderStatus } = {}): Promise<OrderRecord[]> {
  const catalog = await readOrderCatalog();
  return [...catalog.orders]
    .filter((order) => !filters.marketSlug || order.marketSlug === filters.marketSlug)
    .filter((order) => !filters.actorId || order.actorId === filters.actorId)
    .filter((order) => !filters.status || order.status === filters.status)
    .sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso))
    .reverse();
}

export async function placeOrder(input: unknown): Promise<OrderRecord> {
  const validated = validateNewOrderInput(input);
  const market = await getPublicMarketBySlug(validated.marketSlug);
  if (!market) throw new Error("Market not found.");
  if (!(market.status === "open" || market.status === "scheduled")) throw new Error("Orders are not allowed for this market state.");

  const outcomeExists = market.outcomes.some((outcome) => outcome.id === validated.outcomeId);
  if (!outcomeExists) throw new Error("Outcome not found for market.");

  const catalog = await readOrderCatalog();
  const now = new Date().toISOString();
  const order: OrderRecord = {
    id: `order_${Math.random().toString(36).slice(2, 10)}`,
    marketSlug: validated.marketSlug,
    actorId: validated.actorId,
    outcomeId: validated.outcomeId,
    side: validated.side,
    quantity: validated.quantity,
    limitPrice: validated.limitPrice,
    status: "open",
    createdAtIso: now,
    updatedAtIso: now
  };

  await writeOrderCatalog({ orders: [...catalog.orders, order] });
  return order;
}

export async function cancelOrder(input: unknown): Promise<OrderRecord> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Cancel input must be an object.");
  }
  const value = input as Record<string, unknown>;
  if (typeof value.orderId !== "string" || value.orderId.trim().length === 0) throw new Error("Invalid field: orderId");
  if (typeof value.actorId !== "string" || value.actorId.trim().length === 0) throw new Error("Invalid field: actorId");

  const catalog = await readOrderCatalog();
  const index = catalog.orders.findIndex((order) => order.id === value.orderId);
  if (index === -1) throw new Error("Order not found.");

  const order = catalog.orders[index]!;
  if (order.actorId !== value.actorId) throw new Error("Only the owning actor can cancel this order.");
  if (order.status !== "open") throw new Error("Only open orders can be cancelled.");

  const updated = { ...order, status: "cancelled" as const, updatedAtIso: new Date().toISOString() } as OrderRecord;
  await writeOrderCatalog({
    orders: catalog.orders.map((item, itemIndex) => itemIndex === index ? updated : item)
  });
  return updated;
}

export async function getOrderBook(marketSlug: string) {
  const orders = await listOrders({ marketSlug, status: "open" });
  const buys = orders.filter((order) => order.side === "buy").sort((a, b) => b.limitPrice - a.limitPrice || a.createdAtIso.localeCompare(b.createdAtIso));
  const sells = orders.filter((order) => order.side === "sell").sort((a, b) => a.limitPrice - b.limitPrice || a.createdAtIso.localeCompare(b.createdAtIso));
  return { marketSlug, buys, sells, updatedAtIso: new Date().toISOString() };
}

export async function getActorPositions(actorId: string) {
  const openOrders = await listOrders({ actorId, status: "open" });
  const positions = new Map<string, { marketSlug: string; outcomeId: string; openBuyQuantity: number; openSellQuantity: number }>();

  for (const order of openOrders) {
    const key = `${order.marketSlug}:${order.outcomeId}`;
    const current = positions.get(key) ?? {
      marketSlug: order.marketSlug,
      outcomeId: order.outcomeId,
      openBuyQuantity: 0,
      openSellQuantity: 0
    };
    if (order.side === "buy") current.openBuyQuantity += order.quantity;
    if (order.side === "sell") current.openSellQuantity += order.quantity;
    positions.set(key, current);
  }

  return [...positions.values()];
}
