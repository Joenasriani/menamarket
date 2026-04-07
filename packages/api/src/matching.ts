import fs from "node:fs/promises";
import path from "node:path";
import { listOrders } from "./orders.js";
import { transferMatchedOutcome } from "./ledger.js";

export type FillRecord = {
  id: string;
  marketSlug: string;
  outcomeId: string;
  buyOrderId: string;
  sellOrderId: string;
  buyActorId: string;
  sellActorId: string;
  quantity: number;
  price: number;
  createdAtIso: string;
};

export type FillCatalog = { fills: FillRecord[] };

function isIsoDateTime(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && value.includes("T");
}

export function validateFillCatalog(input: unknown): FillCatalog {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Fill catalog must be an object.");
  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.fills)) throw new Error("Fill catalog must contain a fills array.");

  const fills = value.fills.map((item) => {
    const fill = item as Record<string, unknown>;
    if (
      typeof fill.id !== "string" ||
      typeof fill.marketSlug !== "string" ||
      typeof fill.outcomeId !== "string" ||
      typeof fill.buyOrderId !== "string" ||
      typeof fill.sellOrderId !== "string" ||
      typeof fill.buyActorId !== "string" ||
      typeof fill.sellActorId !== "string" ||
      typeof fill.quantity !== "number" || fill.quantity <= 0 ||
      typeof fill.price !== "number" || fill.price < 0 || fill.price > 1 ||
      typeof fill.createdAtIso !== "string" || !isIsoDateTime(fill.createdAtIso)
    ) throw new Error("Invalid fill record.");
    return fill as FillRecord;
  });

  return { fills };
}

async function readFillCatalog(): Promise<FillCatalog> {
  const filePath = path.resolve(process.cwd(), "data/fills.json");
  return validateFillCatalog(JSON.parse(await fs.readFile(filePath, "utf-8")));
}

async function writeFillCatalog(next: FillCatalog): Promise<void> {
  const filePath = path.resolve(process.cwd(), "data/fills.json");
  await fs.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf-8");
}

async function readOrderCatalogRaw(): Promise<{ orders: any[] }> {
  const filePath = path.resolve(process.cwd(), "data/orders.json");
  return JSON.parse(await fs.readFile(filePath, "utf-8")) as { orders: any[] };
}

async function writeOrderCatalogRaw(next: { orders: any[] }): Promise<void> {
  const filePath = path.resolve(process.cwd(), "data/orders.json");
  await fs.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf-8");
}

export async function listFills(filters: { marketSlug?: string; actorId?: string } = {}): Promise<FillRecord[]> {
  const catalog = await readFillCatalog();
  return [...catalog.fills]
    .filter((fill) => !filters.marketSlug || fill.marketSlug === filters.marketSlug)
    .filter((fill) => !filters.actorId || fill.buyActorId === filters.actorId || fill.sellActorId === filters.actorId)
    .sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso))
    .reverse();
}

export async function runSimpleMatchingForMarket(marketSlug: string): Promise<{ fills: FillRecord[] }> {
  const allOpen = await listOrders({ marketSlug, status: "open" });
  const buys = allOpen.filter((order) => order.side === "buy").sort((a, b) => b.limitPrice - a.limitPrice || a.createdAtIso.localeCompare(b.createdAtIso));
  const sells = allOpen.filter((order) => order.side === "sell").sort((a, b) => a.limitPrice - b.limitPrice || a.createdAtIso.localeCompare(b.createdAtIso));

  const orderCatalog = await readOrderCatalogRaw();
  const fillCatalog = await readFillCatalog();
  const created: FillRecord[] = [];

  for (const buy of buys) {
    for (const sell of sells) {
      if (buy.status !== "open" || sell.status !== "open") continue;
      if (buy.outcomeId !== sell.outcomeId) continue;
      if (buy.actorId === sell.actorId) continue;
      if (buy.limitPrice < sell.limitPrice) continue;

      const buyRaw = orderCatalog.orders.find((order) => order.id === buy.id);
      const sellRaw = orderCatalog.orders.find((order) => order.id === sell.id);
      if (!buyRaw || !sellRaw) continue;
      if (buyRaw.status !== "open" || sellRaw.status !== "open") continue;
      if (buyRaw.quantity <= 0 || sellRaw.quantity <= 0) continue;

      const matchedQuantity = Math.min(buyRaw.quantity, sellRaw.quantity);
      const matchedPrice = sellRaw.limitPrice;

      await transferMatchedOutcome(buy.actorId, sell.actorId, marketSlug, buy.outcomeId, matchedQuantity, matchedPrice);

      buyRaw.quantity = Number((buyRaw.quantity - matchedQuantity).toFixed(8));
      sellRaw.quantity = Number((sellRaw.quantity - matchedQuantity).toFixed(8));
      buyRaw.updatedAtIso = new Date().toISOString();
      sellRaw.updatedAtIso = new Date().toISOString();
      if (buyRaw.quantity === 0) buyRaw.status = "cancelled";
      if (sellRaw.quantity === 0) sellRaw.status = "cancelled";

      const fill: FillRecord = {
        id: `fill_${Math.random().toString(36).slice(2, 10)}`,
        marketSlug,
        outcomeId: buy.outcomeId,
        buyOrderId: buy.id,
        sellOrderId: sell.id,
        buyActorId: buy.actorId,
        sellActorId: sell.actorId,
        quantity: matchedQuantity,
        price: matchedPrice,
        createdAtIso: new Date().toISOString()
      };
      fillCatalog.fills.push(fill);
      created.push(fill);
    }
  }

  await writeOrderCatalogRaw(orderCatalog);
  await writeFillCatalog(fillCatalog);
  return { fills: created };
}
