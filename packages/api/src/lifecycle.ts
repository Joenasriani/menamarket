import fs from "node:fs/promises";
import path from "node:path";
import {
  type MarketCatalog,
  type MarketCatalogRecord,
  type MarketStatus,
  readMarketCatalog
} from "./markets.js";

export type LifecycleAction = "open" | "halt" | "close" | "resolve" | "cancel";

export type ResolutionRecord = {
  id: string;
  marketId: string;
  marketSlug: string;
  outcome: string;
  evidence: string;
  sourceLink: string;
  resolvedAtIso: string;
  createdAtIso: string;
};

export type ResolutionCatalog = {
  resolutions: ResolutionRecord[];
};

export type LifecycleActionInput = {
  slug: string;
  action: LifecycleAction;
  outcome?: string;
  evidence?: string;
  sourceLink?: string;
  resolvedAtIso?: string;
};

const transitionMap: Record<LifecycleAction, MarketStatus[]> = {
  open: ["scheduled"],
  halt: ["open"],
  close: ["open", "halted"],
  resolve: ["closed", "awaiting_resolution"],
  cancel: ["scheduled", "open", "halted", "closed", "awaiting_resolution"]
};

function isIsoDateTime(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && value.includes("T");
}

function assertString(value: unknown, field: string, minLength = 1): asserts value is string {
  if (typeof value !== "string" || value.trim().length < minLength) {
    throw new Error(`Invalid field: ${field}`);
  }
}

function validateResolutionCatalog(input: unknown): ResolutionCatalog {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Resolution catalog must be an object.");
  }
  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.resolutions)) {
    throw new Error("Resolution catalog must contain a resolutions array.");
  }
  return {
    resolutions: value.resolutions as ResolutionRecord[]
  };
}

async function readResolutionCatalog(): Promise<ResolutionCatalog> {
  const filePath = path.resolve(process.cwd(), "data/resolutions.json");
  const contents = await fs.readFile(filePath, "utf-8");
  return validateResolutionCatalog(JSON.parse(contents));
}

async function writeResolutionCatalog(next: ResolutionCatalog): Promise<void> {
  const filePath = path.resolve(process.cwd(), "data/resolutions.json");
  await fs.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf-8");
}

async function writeMarketCatalog(next: MarketCatalog): Promise<void> {
  const filePath = path.resolve(process.cwd(), "data/markets.json");
  await fs.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf-8");
}

async function appendAuditEntry(entry: Record<string, unknown>): Promise<void> {
  const filePath = path.resolve(process.cwd(), "data/audit-log.json");
  const current = JSON.parse(await fs.readFile(filePath, "utf-8")) as { entries: Record<string, unknown>[] };
  const next = { entries: [...current.entries, entry] };
  await fs.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf-8");
}

function nextStatusForAction(action: LifecycleAction): MarketStatus {
  switch (action) {
    case "open":
      return "open";
    case "halt":
      return "halted";
    case "close":
      return "awaiting_resolution";
    case "resolve":
      return "resolved";
    case "cancel":
      return "cancelled";
  }
}

export function allowedLifecycleActions(status: MarketStatus): LifecycleAction[] {
  return (Object.keys(transitionMap) as LifecycleAction[]).filter((action) =>
    transitionMap[action].includes(status)
  );
}

export function validateLifecycleActionInput(input: unknown): LifecycleActionInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Lifecycle action input must be an object.");
  }
  const value = input as Record<string, unknown>;
  assertString(value.slug, "slug");
  assertString(value.action, "action");
  if (!["open", "halt", "close", "resolve", "cancel"].includes(value.action)) {
    throw new Error("Invalid field: action");
  }
  if (value.action === "resolve") {
    assertString(value.outcome, "outcome");
    assertString(value.evidence, "evidence");
    assertString(value.sourceLink, "sourceLink");
    assertString(value.resolvedAtIso, "resolvedAtIso");
    if (!isIsoDateTime(value.resolvedAtIso)) {
      throw new Error("Invalid ISO datetime: resolvedAtIso");
    }
  }
  return {
    slug: value.slug,
    action: value.action as LifecycleAction,
    ...(value.outcome !== undefined && { outcome: value.outcome as string }),
    ...(value.evidence !== undefined && { evidence: value.evidence as string }),
    ...(value.sourceLink !== undefined && { sourceLink: value.sourceLink as string }),
    ...(value.resolvedAtIso !== undefined && { resolvedAtIso: value.resolvedAtIso as string })
  };
}

export async function listResolutionRecords(): Promise<ResolutionRecord[]> {
  const catalog = await readResolutionCatalog();
  return [...catalog.resolutions].sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso)).reverse();
}

export async function getResolutionByMarketSlug(slug: string): Promise<ResolutionRecord | null> {
  const resolutions = await listResolutionRecords();
  return resolutions.find((item) => item.marketSlug === slug) ?? null;
}

export async function applyLifecycleAction(input: unknown): Promise<{ before: MarketStatus; after: MarketStatus; market: MarketCatalogRecord; resolution?: ResolutionRecord }> {
  const validated = validateLifecycleActionInput(input);
  const catalog = await readMarketCatalog();
  const marketIndex = catalog.markets.findIndex((market) => market.slug === validated.slug);

  if (marketIndex === -1) {
    throw new Error("Market not found.");
  }

  const market = catalog.markets[marketIndex]!
  const allowed = allowedLifecycleActions(market.status);

  if (!allowed.includes(validated.action)) {
    throw new Error(`Action '${validated.action}' is not allowed from state '${market.status}'.`);
  }

  const before = market.status;
  const after = nextStatusForAction(validated.action);

  let resolution: ResolutionRecord | undefined;

  if (validated.action === "resolve") {
    const resolutions = await readResolutionCatalog();
    if (resolutions.resolutions.some((item) => item.marketSlug === market.slug)) {
      throw new Error("Market already has a resolution record.");
    }

    resolution = {
      id: `resolution_${Math.random().toString(36).slice(2, 10)}`,
      marketId: market.id,
      marketSlug: market.slug,
      outcome: validated.outcome!,
      evidence: validated.evidence!,
      sourceLink: validated.sourceLink!,
      resolvedAtIso: validated.resolvedAtIso!,
      createdAtIso: new Date().toISOString()
    };

    await writeResolutionCatalog({
      resolutions: [...resolutions.resolutions, resolution]
    });
  }

  const updatedMarket = { ...market, status: after, updatedAtIso: new Date().toISOString() } as MarketCatalogRecord;

  const nextCatalog: MarketCatalog = {
    markets: catalog.markets.map((item, index) => index === marketIndex ? updatedMarket : item)
  };

  await writeMarketCatalog(nextCatalog);

  await appendAuditEntry({
    id: `audit_${Math.random().toString(36).slice(2, 10)}`,
    action: `market_${validated.action}`,
    targetType: "market",
    targetId: market.id,
    timestampIso: new Date().toISOString(),
    metadata: {
      slug: market.slug,
      beforeState: before,
      afterState: after,
      outcome: resolution?.outcome,
      sourceLink: resolution?.sourceLink
    }
  });

  return { before, after, market: updatedMarket, ...(resolution !== undefined && { resolution }) };
}
