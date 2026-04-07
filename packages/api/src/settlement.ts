import fs from "node:fs/promises";
import path from "node:path";
import { getResolutionByMarketSlug } from "./lifecycle.js";
import { listLedgerAccounts, applyLedgerAdjustment } from "./ledger.js";
import { getPublicMarketBySlug } from "./markets.js";

export type SettlementRecord = {
  id: string;
  marketSlug: string;
  actorId: string;
  winningOutcomeId: string;
  payoutAmount: number;
  createdAtIso: string;
};

export type SettlementCatalog = { settlements: SettlementRecord[] };

function isIsoDateTime(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && value.includes("T");
}

export function validateSettlementCatalog(input: unknown): SettlementCatalog {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Settlement catalog must be an object.");
  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.settlements)) throw new Error("Settlement catalog must contain a settlements array.");

  const settlements = value.settlements.map((item) => {
    const settlement = item as Record<string, unknown>;
    if (
      typeof settlement.id !== "string" ||
      typeof settlement.marketSlug !== "string" ||
      typeof settlement.actorId !== "string" ||
      typeof settlement.winningOutcomeId !== "string" ||
      typeof settlement.payoutAmount !== "number" || settlement.payoutAmount < 0 ||
      typeof settlement.createdAtIso !== "string" || !isIsoDateTime(settlement.createdAtIso)
    ) throw new Error("Invalid settlement record.");
    return settlement as SettlementRecord;
  });

  return { settlements };
}

async function readSettlementCatalog(): Promise<SettlementCatalog> {
  const filePath = path.resolve(process.cwd(), "data/settlements.json");
  return validateSettlementCatalog(JSON.parse(await fs.readFile(filePath, "utf-8")));
}

async function writeSettlementCatalog(next: SettlementCatalog): Promise<void> {
  const filePath = path.resolve(process.cwd(), "data/settlements.json");
  await fs.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf-8");
}

export async function listSettlements(filters: { marketSlug?: string; actorId?: string } = {}): Promise<SettlementRecord[]> {
  const catalog = await readSettlementCatalog();
  return [...catalog.settlements]
    .filter((settlement) => !filters.marketSlug || settlement.marketSlug === filters.marketSlug)
    .filter((settlement) => !filters.actorId || settlement.actorId === filters.actorId)
    .sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso))
    .reverse();
}

function normalizeWinningOutcome(outcome: string, market: { outcomes: { id: string; label: string }[] }) {
  const normalized = outcome.trim().toLowerCase();
  const byId = market.outcomes.find((item) => item.id.toLowerCase() === normalized);
  if (byId) return byId.id;
  const byLabel = market.outcomes.find((item) => item.label.trim().toLowerCase() === normalized);
  if (byLabel) return byLabel.id;
  return null;
}

export async function settleMarketBySlug(marketSlug: string): Promise<{ settlements: SettlementRecord[]; winningOutcomeId: string }> {
  const market = await getPublicMarketBySlug(marketSlug);
  if (!market) throw new Error("Market not found.");
  if (market.status !== "resolved") throw new Error("Market must be resolved before settlement.");

  const resolution = await getResolutionByMarketSlug(marketSlug);
  if (!resolution) throw new Error("Resolution record not found.");

  const winningOutcomeId = normalizeWinningOutcome(resolution.outcome, market);
  if (!winningOutcomeId) throw new Error("Could not map resolved outcome to a market outcome.");

  const existing = await listSettlements({ marketSlug });
  if (existing.length > 0) {
    return { settlements: existing, winningOutcomeId };
  }

  const accounts = await listLedgerAccounts();
  const created: SettlementRecord[] = [];
  const now = new Date().toISOString();

  for (const account of accounts) {
    const winningHolding = account.holdings.find((holding) => holding.marketSlug === marketSlug && holding.outcomeId === winningOutcomeId);
    const payoutAmount = winningHolding ? winningHolding.quantity : 0;
    if (payoutAmount <= 0) continue;

    await applyLedgerAdjustment({
      actorId: account.actorId,
      type: "deposit",
      amount: payoutAmount
    });

    created.push({
      id: `settlement_${Math.random().toString(36).slice(2, 10)}`,
      marketSlug,
      actorId: account.actorId,
      winningOutcomeId,
      payoutAmount,
      createdAtIso: now
    });
  }

  const catalog = await readSettlementCatalog();
  await writeSettlementCatalog({ settlements: [...catalog.settlements, ...created] });
  return { settlements: created, winningOutcomeId };
}
