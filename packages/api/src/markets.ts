import fs from "node:fs/promises";
import path from "node:path";

export const MARKET_STATUSES = [
  "draft","review","scheduled","open","halted","closed","awaiting_resolution","resolved","cancelled"
] as const;

export type MarketStatus = typeof MARKET_STATUSES[number];
export type OutcomeType = "binary" | "categorical";

export type MarketOutcomeRecord = {
  id: string;
  label: string;
  probability: number;
  price: number;
};

export type MarketCatalogRecord = {
  id: string;
  slug: string;
  question: string;
  category: string;
  description?: string;
  resolutionSource: string;
  closeTimeIso: string;
  status: MarketStatus;
  jurisdiction: string;
  visibility: "internal" | "public";
  createdAtIso: string;
  updatedAtIso: string;
  notes?: string;
  rules: string[];
  resolutionTitle: string;
  resolutionBasis: string;
  resolutionExamples?: string[];
  outcomeType: OutcomeType;
  sourceLink?: string;
  outcomes: MarketOutcomeRecord[];
  priceUpdatedAtIso?: string;
};

export type MarketCatalog = { markets: MarketCatalogRecord[] };

function isIsoDateTime(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && value.includes("T");
}

function assertString(value: unknown, field: string, minLength = 1): asserts value is string {
  if (typeof value !== "string" || value.trim().length < minLength) throw new Error(`Invalid field: ${field}`);
}

function assertStringArray(value: unknown, field: string, minItems = 0): asserts value is string[] {
  if (!Array.isArray(value) || value.length < minItems || value.some((item) => typeof item !== "string" || item.trim().length === 0)) {
    throw new Error(`Invalid field: ${field}`);
  }
}

function assertOutcomeArray(value: unknown, field: string): asserts value is MarketOutcomeRecord[] {
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error(`Invalid field: ${field}`);
  }
  let totalProbability = 0;
  for (const [index, item] of value.entries()) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`Invalid field: ${field}[${index}]`);
    }
    const outcome = item as Record<string, unknown>;
    assertString(outcome.id, `${field}[${index}].id`);
    assertString(outcome.label, `${field}[${index}].label`);
    if (typeof outcome.probability !== "number" || outcome.probability < 0 || outcome.probability > 1) {
      throw new Error(`Invalid field: ${field}[${index}].probability`);
    }
    if (typeof outcome.price !== "number" || outcome.price < 0 || outcome.price > 1) {
      throw new Error(`Invalid field: ${field}[${index}].price`);
    }
    totalProbability += outcome.probability;
  }
  if (totalProbability > 1.0001 && totalProbability < 1.9999) {
    throw new Error(`Invalid field: ${field}.probabilitySum`);
  }
}

function parseMarketRecord(input: unknown, index: number): MarketCatalogRecord {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error(`Invalid market record at index ${index}`);
  const record = input as Record<string, unknown>;

  assertString(record.id, `markets[${index}].id`);
  assertString(record.slug, `markets[${index}].slug`);
  assertString(record.question, `markets[${index}].question`, 10);
  assertString(record.category, `markets[${index}].category`);
  assertString(record.resolutionSource, `markets[${index}].resolutionSource`);
  assertString(record.closeTimeIso, `markets[${index}].closeTimeIso`);
  assertString(record.jurisdiction, `markets[${index}].jurisdiction`);
  assertString(record.createdAtIso, `markets[${index}].createdAtIso`);
  assertString(record.updatedAtIso, `markets[${index}].updatedAtIso`);
  assertStringArray(record.rules, `markets[${index}].rules`, 1);
  assertString(record.resolutionTitle, `markets[${index}].resolutionTitle`);
  assertString(record.resolutionBasis, `markets[${index}].resolutionBasis`);
  assertOutcomeArray(record.outcomes, `markets[${index}].outcomes`);

  if (!isIsoDateTime(record.closeTimeIso)) throw new Error(`Invalid ISO datetime: markets[${index}].closeTimeIso`);
  if (!isIsoDateTime(record.createdAtIso)) throw new Error(`Invalid ISO datetime: markets[${index}].createdAtIso`);
  if (!isIsoDateTime(record.updatedAtIso)) throw new Error(`Invalid ISO datetime: markets[${index}].updatedAtIso`);
  if (!MARKET_STATUSES.includes(record.status as MarketStatus)) throw new Error(`Invalid status: markets[${index}].status`);
  if (record.visibility !== "internal" && record.visibility !== "public") throw new Error(`Invalid visibility: markets[${index}].visibility`);
  if (record.description !== undefined && typeof record.description !== "string") throw new Error(`Invalid field: markets[${index}].description`);
  if (record.notes !== undefined && typeof record.notes !== "string") throw new Error(`Invalid field: markets[${index}].notes`);
  if (record.resolutionExamples !== undefined) assertStringArray(record.resolutionExamples, `markets[${index}].resolutionExamples`);
  if (record.sourceLink !== undefined && typeof record.sourceLink !== "string") throw new Error(`Invalid field: markets[${index}].sourceLink`);
  if (record.outcomeType !== "binary" && record.outcomeType !== "categorical") throw new Error(`Invalid field: markets[${index}].outcomeType`);
  if (record.priceUpdatedAtIso !== undefined && !isIsoDateTime(record.priceUpdatedAtIso as string)) throw new Error(`Invalid ISO datetime: markets[${index}].priceUpdatedAtIso`);

  return {
    id: record.id,
    slug: record.slug,
    question: record.question,
    category: record.category,
    ...(record.description !== undefined && { description: record.description as string }),
    resolutionSource: record.resolutionSource,
    closeTimeIso: record.closeTimeIso,
    status: record.status as MarketStatus,
    jurisdiction: record.jurisdiction,
    visibility: record.visibility,
    createdAtIso: record.createdAtIso,
    updatedAtIso: record.updatedAtIso,
    ...(record.notes !== undefined && { notes: record.notes as string }),
    rules: record.rules as string[],
    resolutionTitle: record.resolutionTitle,
    resolutionBasis: record.resolutionBasis,
    ...(record.resolutionExamples !== undefined && { resolutionExamples: record.resolutionExamples as string[] }),
    outcomeType: record.outcomeType as OutcomeType,
    ...(record.sourceLink !== undefined && { sourceLink: record.sourceLink as string }),
    outcomes: record.outcomes as MarketOutcomeRecord[],
    ...(record.priceUpdatedAtIso !== undefined && { priceUpdatedAtIso: record.priceUpdatedAtIso as string })
  };
}

export function validateMarketCatalog(input: unknown): MarketCatalog {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Market catalog must be an object.");
  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.markets)) throw new Error("Market catalog must contain a markets array.");
  return { markets: value.markets.map((market, index) => parseMarketRecord(market, index)) };
}

export async function readMarketCatalog(): Promise<MarketCatalog> {
  const filePath = path.resolve(process.cwd(), "data/markets.json");
  const raw = JSON.parse(await fs.readFile(filePath, "utf-8")) as unknown;
  return validateMarketCatalog(raw);
}

export async function listPublicMarkets(): Promise<MarketCatalogRecord[]> {
  const catalog = await readMarketCatalog();
  return catalog.markets.filter((market) => market.visibility === "public").sort((a, b) => a.closeTimeIso.localeCompare(b.closeTimeIso));
}

export async function listAllMarkets(): Promise<MarketCatalogRecord[]> {
  const catalog = await readMarketCatalog();
  return [...catalog.markets].sort((a, b) => a.updatedAtIso.localeCompare(b.updatedAtIso)).reverse();
}

export async function getPublicMarketBySlug(slug: string): Promise<MarketCatalogRecord | null> {
  const markets = await listPublicMarkets();
  return markets.find((market) => market.slug === slug) ?? null;
}

export async function getAnyMarketBySlug(slug: string): Promise<MarketCatalogRecord | null> {
  const markets = await listAllMarkets();
  return markets.find((market) => market.slug === slug) ?? null;
}
