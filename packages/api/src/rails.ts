import fs from "node:fs/promises";
import path from "node:path";

export type RailRecord = {
  id: string;
  label: string;
  direction: "funding" | "payout" | "both";
  status: "active" | "disabled";
  notes?: string;
};

export type FundingIntentRecord = {
  id: string;
  actorId: string;
  railId: string;
  amount: number;
  status: "requested" | "cancelled" | "completed";
  createdAtIso: string;
  notes?: string;
};

export type PayoutRequestRecord = {
  id: string;
  actorId: string;
  railId: string;
  amount: number;
  status: "requested" | "cancelled" | "completed";
  createdAtIso: string;
  notes?: string;
};

export type RailsCatalog = {
  rails: RailRecord[];
  fundingIntents: FundingIntentRecord[];
  payoutRequests: PayoutRequestRecord[];
};

function isIsoDateTime(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && value.includes("T");
}

function getRequiredEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function validateRailsCatalog(input: unknown): RailsCatalog {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Rails catalog must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.rails) || !Array.isArray(value.fundingIntents) || !Array.isArray(value.payoutRequests)) {
    throw new Error("Rails catalog must contain rails, fundingIntents, and payoutRequests arrays.");
  }

  const rails = value.rails.map((item) => {
    const rail = item as Record<string, unknown>;
    if (
      typeof rail.id !== "string" ||
      typeof rail.label !== "string" ||
      (rail.direction !== "funding" && rail.direction !== "payout" && rail.direction !== "both") ||
      (rail.status !== "active" && rail.status !== "disabled") ||
      (rail.notes !== undefined && typeof rail.notes !== "string")
    ) {
      throw new Error("Invalid rail record.");
    }
    return rail as RailRecord;
  });

  const parseMoneyRecord = (item: unknown, kind: "funding" | "payout") => {
    const record = item as Record<string, unknown>;
    if (
      typeof record.id !== "string" ||
      typeof record.actorId !== "string" ||
      typeof record.railId !== "string" ||
      typeof record.amount !== "number" ||
      record.amount <= 0 ||
      (record.status !== "requested" && record.status !== "cancelled" && record.status !== "completed") ||
      typeof record.createdAtIso !== "string" ||
      !isIsoDateTime(record.createdAtIso) ||
      (record.notes !== undefined && typeof record.notes !== "string")
    ) {
      throw new Error(`Invalid ${kind} record.`);
    }
    return record as FundingIntentRecord | PayoutRequestRecord;
  };

  return {
    rails,
    fundingIntents: value.fundingIntents.map((item) => parseMoneyRecord(item, "funding") as FundingIntentRecord),
    payoutRequests: value.payoutRequests.map((item) => parseMoneyRecord(item, "payout") as PayoutRequestRecord)
  };
}

async function readRailsCatalog(): Promise<RailsCatalog> {
  const filePath = path.resolve(process.cwd(), "data/rails.json");
  return validateRailsCatalog(JSON.parse(await fs.readFile(filePath, "utf-8")));
}

async function writeRailsCatalog(next: RailsCatalog): Promise<void> {
  const filePath = path.resolve(process.cwd(), "data/rails.json");
  try {
    await fs.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf-8");
  } catch (err) {
    const isReadOnly = err instanceof Error &&
      (err.message.includes("EROFS") || err.message.includes("read-only"));
    throw new Error(
      isReadOnly
        ? "Persistent writes are unavailable in this deployment. Connect a database to enable trading."
        : (err instanceof Error ? err.message : "Write failed.")
    );
  }
}

export async function listRails(direction?: "funding" | "payout"): Promise<RailRecord[]> {
  const catalog = await readRailsCatalog();
  return catalog.rails.filter((rail) => {
    if (rail.status !== "active") return false;
    if (!direction) return true;
    return rail.direction === direction || rail.direction === "both";
  });
}

export async function listFundingIntents(actorId?: string): Promise<FundingIntentRecord[]> {
  const catalog = await readRailsCatalog();
  return [...catalog.fundingIntents]
    .filter((item) => !actorId || item.actorId === actorId)
    .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
}

export async function listPayoutRequests(actorId?: string): Promise<PayoutRequestRecord[]> {
  const catalog = await readRailsCatalog();
  return [...catalog.payoutRequests]
    .filter((item) => !actorId || item.actorId === actorId)
    .sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
}

export function validateFundingIntentInput(input: unknown): { actorId: string; amount: number; railId?: string; notes?: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Funding intent input must be an object.");
  }
  const value = input as Record<string, unknown>;
  if (typeof value.actorId !== "string" || value.actorId.trim().length === 0) throw new Error("Invalid field: actorId");
  if (typeof value.amount !== "number" || value.amount <= 0) throw new Error("Invalid field: amount");
  if (value.railId !== undefined && typeof value.railId !== "string") throw new Error("Invalid field: railId");
  if (value.notes !== undefined && typeof value.notes !== "string") throw new Error("Invalid field: notes");

  return {
    actorId: value.actorId,
    amount: value.amount,
    ...(value.railId !== undefined && { railId: value.railId as string }),
    ...(value.notes !== undefined && { notes: value.notes as string })
  };
}

export function validatePayoutRequestInput(input: unknown): { actorId: string; amount: number; railId?: string; notes?: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Payout request input must be an object.");
  }
  const value = input as Record<string, unknown>;
  if (typeof value.actorId !== "string" || value.actorId.trim().length === 0) throw new Error("Invalid field: actorId");
  if (typeof value.amount !== "number" || value.amount <= 0) throw new Error("Invalid field: amount");
  if (value.railId !== undefined && typeof value.railId !== "string") throw new Error("Invalid field: railId");
  if (value.notes !== undefined && typeof value.notes !== "string") throw new Error("Invalid field: notes");

  return {
    actorId: value.actorId,
    amount: value.amount,
    ...(value.railId !== undefined && { railId: value.railId as string }),
    ...(value.notes !== undefined && { notes: value.notes as string })
  };
}

async function resolveRailId(requestedRailId: string | undefined, direction: "funding" | "payout"): Promise<string> {
  const defaultRail = getRequiredEnv(direction === "funding" ? "DEFAULT_FUNDING_RAIL" : "DEFAULT_PAYOUT_RAIL", "manual");
  const candidate = requestedRailId ?? defaultRail;
  const rails = await listRails(direction);
  if (!rails.some((rail) => rail.id === candidate)) {
    throw new Error("Requested rail is not active for this direction.");
  }
  return candidate;
}

export async function createFundingIntent(input: unknown): Promise<FundingIntentRecord> {
  const validated = validateFundingIntentInput(input);
  const railId = await resolveRailId(validated.railId, "funding");
  const catalog = await readRailsCatalog();

  const record: FundingIntentRecord = {
    id: `funding_${Math.random().toString(36).slice(2, 10)}`,
    actorId: validated.actorId,
    railId,
    amount: validated.amount,
    status: "requested",
    createdAtIso: new Date().toISOString(),
    ...(validated.notes !== undefined && { notes: validated.notes })
  };

  await writeRailsCatalog({
    ...catalog,
    fundingIntents: [...catalog.fundingIntents, record]
  });

  return record;
}

export async function createPayoutRequest(input: unknown): Promise<PayoutRequestRecord> {
  const validated = validatePayoutRequestInput(input);
  const railId = await resolveRailId(validated.railId, "payout");
  const catalog = await readRailsCatalog();

  const record: PayoutRequestRecord = {
    id: `payout_${Math.random().toString(36).slice(2, 10)}`,
    actorId: validated.actorId,
    railId,
    amount: validated.amount,
    status: "requested",
    createdAtIso: new Date().toISOString(),
    ...(validated.notes !== undefined && { notes: validated.notes })
  };

  await writeRailsCatalog({
    ...catalog,
    payoutRequests: [...catalog.payoutRequests, record]
  });

  return record;
}
