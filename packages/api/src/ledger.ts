import fs from "node:fs/promises";
import path from "node:path";

export type HoldingRecord = {
  marketSlug: string;
  outcomeId: string;
  quantity: number;
  reservedQuantity: number;
};

export type LedgerAccount = {
  actorId: string;
  cashBalance: number;
  cashReserved: number;
  holdings: HoldingRecord[];
  updatedAtIso: string;
};

export type LedgerCatalog = { accounts: LedgerAccount[] };

function isIsoDateTime(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && value.includes("T");
}

export function validateLedgerCatalog(input: unknown): LedgerCatalog {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Ledger catalog must be an object.");
  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.accounts)) throw new Error("Ledger catalog must contain an accounts array.");

  const accounts = value.accounts.map((item) => {
    const account = item as Record<string, unknown>;
    if (
      typeof account.actorId !== "string" ||
      typeof account.cashBalance !== "number" || account.cashBalance < 0 ||
      typeof account.cashReserved !== "number" || account.cashReserved < 0 ||
      !Array.isArray(account.holdings) ||
      typeof account.updatedAtIso !== "string" || !isIsoDateTime(account.updatedAtIso)
    ) throw new Error("Invalid ledger account.");

    const holdings = account.holdings.map((holding) => {
      const value = holding as Record<string, unknown>;
      if (
        typeof value.marketSlug !== "string" ||
        typeof value.outcomeId !== "string" ||
        typeof value.quantity !== "number" || value.quantity < 0 ||
        typeof value.reservedQuantity !== "number" || value.reservedQuantity < 0
      ) throw new Error("Invalid holding record.");
      return value as HoldingRecord;
    });

    return {
      actorId: account.actorId,
      cashBalance: account.cashBalance,
      cashReserved: account.cashReserved,
      holdings,
      updatedAtIso: account.updatedAtIso
    } as LedgerAccount;
  });

  return { accounts };
}

async function readLedgerCatalog(): Promise<LedgerCatalog> {
  const filePath = path.resolve(process.cwd(), "data/ledger.json");
  return validateLedgerCatalog(JSON.parse(await fs.readFile(filePath, "utf-8")));
}

async function writeLedgerCatalog(next: LedgerCatalog): Promise<void> {
  const filePath = path.resolve(process.cwd(), "data/ledger.json");
  await fs.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf-8");
}

function upsertHolding(account: LedgerAccount, marketSlug: string, outcomeId: string, updater: (holding: HoldingRecord) => HoldingRecord): LedgerAccount {
  const index = account.holdings.findIndex((holding) => holding.marketSlug === marketSlug && holding.outcomeId === outcomeId);
  const current = index >= 0 ? account.holdings[index] : { marketSlug, outcomeId, quantity: 0, reservedQuantity: 0 };
  const nextHolding = updater(current);
  const holdings = index >= 0
    ? account.holdings.map((holding, holdingIndex) => holdingIndex === index ? nextHolding : holding)
    : [...account.holdings, nextHolding];
  return { ...account, holdings, updatedAtIso: new Date().toISOString() };
}

export async function transferMatchedOutcome(buyActorId: string, sellActorId: string, marketSlug: string, outcomeId: string, quantity: number, price: number): Promise<void> {
  const catalog = await readLedgerCatalog();
  const buyIndex = catalog.accounts.findIndex((account) => account.actorId === buyActorId);
  const sellIndex = catalog.accounts.findIndex((account) => account.actorId === sellActorId);
  if (buyIndex === -1 || sellIndex === -1) throw new Error("Ledger account not found.");

  const buyAccountBase = catalog.accounts[buyIndex];
  const sellAccountBase = catalog.accounts[sellIndex];

  if (buyAccountBase.cashReserved < quantity * price) throw new Error("Buyer reserved cash underflow.");

  const buyAccount = upsertHolding(
    { ...buyAccountBase, cashReserved: buyAccountBase.cashReserved - quantity * price, updatedAtIso: new Date().toISOString() },
    marketSlug,
    outcomeId,
    (holding) => ({ ...holding, quantity: holding.quantity + quantity })
  );

  const sellAccountAfterReserve = upsertHolding(sellAccountBase, marketSlug, outcomeId, (holding) => {
    if (holding.reservedQuantity < quantity || holding.quantity < quantity) throw new Error("Seller holding underflow.");
    return {
      ...holding,
      quantity: holding.quantity - quantity,
      reservedQuantity: holding.reservedQuantity - quantity
    };
  });

  const sellAccount = {
    ...sellAccountAfterReserve,
    cashBalance: sellAccountAfterReserve.cashBalance + quantity * price,
    updatedAtIso: new Date().toISOString()
  };

  const nextAccounts = catalog.accounts.map((account, index) => {
    if (index === buyIndex) return buyAccount;
    if (index === sellIndex) return sellAccount;
    return account;
  });

  await writeLedgerCatalog({ accounts: nextAccounts });
}
