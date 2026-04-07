import fs from "node:fs/promises";
import path from "node:path";

export const DRAFT_STATUSES = ["draft", "review_ready", "published"] as const;
export type DraftStatus = typeof DRAFT_STATUSES[number];

export type MarketDraftRecord = {
  id: string;
  slug: string;
  question: string;
  category: string;
  description?: string;
  resolutionSource: string;
  closeTimeIso: string;
  jurisdiction: string;
  visibility: "internal" | "public";
  draftStatus: DraftStatus;
  createdAtIso: string;
  updatedAtIso: string;
  notes?: string;
};

export type MarketDraftCatalog = {
  drafts: MarketDraftRecord[];
};

export type NewMarketDraftInput = {
  question: string;
  slug: string;
  category: string;
  description?: string;
  resolutionSource: string;
  closeTimeIso: string;
  jurisdiction: string;
  visibility: "internal" | "public";
  draftStatus: "draft" | "review_ready";
  notes?: string;
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

function assertOptionalString(value: unknown, field: string): void {
  if (value !== undefined && typeof value !== "string") {
    throw new Error(`Invalid field: ${field}`);
  }
}

function parseDraftRecord(input: unknown, index: number): MarketDraftRecord {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error(`Invalid draft record at index ${index}`);
  }

  const record = input as Record<string, unknown>;
  assertString(record.id, `drafts[${index}].id`);
  assertString(record.slug, `drafts[${index}].slug`);
  assertString(record.question, `drafts[${index}].question`, 10);
  assertString(record.category, `drafts[${index}].category`);
  assertString(record.resolutionSource, `drafts[${index}].resolutionSource`);
  assertString(record.closeTimeIso, `drafts[${index}].closeTimeIso`);
  assertString(record.jurisdiction, `drafts[${index}].jurisdiction`);
  assertString(record.createdAtIso, `drafts[${index}].createdAtIso`);
  assertString(record.updatedAtIso, `drafts[${index}].updatedAtIso`);

  if (!isIsoDateTime(record.closeTimeIso)) throw new Error(`Invalid ISO datetime: drafts[${index}].closeTimeIso`);
  if (!isIsoDateTime(record.createdAtIso)) throw new Error(`Invalid ISO datetime: drafts[${index}].createdAtIso`);
  if (!isIsoDateTime(record.updatedAtIso)) throw new Error(`Invalid ISO datetime: drafts[${index}].updatedAtIso`);
  if (record.visibility !== "internal" && record.visibility !== "public") throw new Error(`Invalid visibility: drafts[${index}].visibility`);
  if (!DRAFT_STATUSES.includes(record.draftStatus as DraftStatus)) throw new Error(`Invalid draft status: drafts[${index}].draftStatus`);

  assertOptionalString(record.description, `drafts[${index}].description`);
  assertOptionalString(record.notes, `drafts[${index}].notes`);

  return {
    id: record.id,
    slug: record.slug,
    question: record.question,
    category: record.category,
    description: record.description as string | undefined,
    resolutionSource: record.resolutionSource,
    closeTimeIso: record.closeTimeIso,
    jurisdiction: record.jurisdiction,
    visibility: record.visibility,
    draftStatus: record.draftStatus as DraftStatus,
    createdAtIso: record.createdAtIso,
    updatedAtIso: record.updatedAtIso,
    notes: record.notes as string | undefined
  };
}

export function validateMarketDraftCatalog(input: unknown): MarketDraftCatalog {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Market draft catalog must be an object.");
  }
  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.drafts)) {
    throw new Error("Market draft catalog must contain a drafts array.");
  }
  return {
    drafts: value.drafts.map((draft, index) => parseDraftRecord(draft, index))
  };
}

export function validateNewMarketDraftInput(input: unknown): NewMarketDraftInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Draft input must be an object.");
  }
  const value = input as Record<string, unknown>;
  assertString(value.question, "question", 10);
  assertString(value.slug, "slug");
  assertString(value.category, "category");
  assertString(value.resolutionSource, "resolutionSource");
  assertString(value.closeTimeIso, "closeTimeIso");
  assertString(value.jurisdiction, "jurisdiction");
  if (!/^[a-z0-9-]+$/.test(value.slug)) throw new Error("Invalid field: slug");
  if (!isIsoDateTime(value.closeTimeIso)) throw new Error("Invalid ISO datetime: closeTimeIso");
  if (value.visibility !== "internal" && value.visibility !== "public") throw new Error("Invalid field: visibility");
  if (value.draftStatus !== "draft" && value.draftStatus !== "review_ready") throw new Error("Invalid field: draftStatus");
  assertOptionalString(value.description, "description");
  assertOptionalString(value.notes, "notes");
  return {
    question: value.question,
    slug: value.slug,
    category: value.category,
    description: value.description as string | undefined,
    resolutionSource: value.resolutionSource,
    closeTimeIso: value.closeTimeIso,
    jurisdiction: value.jurisdiction,
    visibility: value.visibility,
    draftStatus: value.draftStatus,
    notes: value.notes as string | undefined
  };
}

async function readDraftFileRaw(): Promise<unknown> {
  const filePath = path.resolve(process.cwd(), "data/market-drafts.json");
  const fileContents = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContents) as unknown;
}

export async function readMarketDraftCatalog(): Promise<MarketDraftCatalog> {
  return validateMarketDraftCatalog(await readDraftFileRaw());
}

export async function listMarketDrafts(): Promise<MarketDraftRecord[]> {
  const catalog = await readMarketDraftCatalog();
  return [...catalog.drafts].sort((a, b) => a.updatedAtIso.localeCompare(b.updatedAtIso)).reverse();
}

export async function listReviewReadyDrafts(): Promise<MarketDraftRecord[]> {
  const drafts = await listMarketDrafts();
  return drafts.filter((draft) => draft.draftStatus === "review_ready");
}

export async function getMarketDraftBySlug(slug: string): Promise<MarketDraftRecord | null> {
  const drafts = await listMarketDrafts();
  return drafts.find((draft) => draft.slug === slug) ?? null;
}

export async function createMarketDraft(input: unknown): Promise<MarketDraftRecord> {
  const validated = validateNewMarketDraftInput(input);
  const catalog = await readMarketDraftCatalog();
  if (catalog.drafts.some((draft) => draft.slug === validated.slug)) {
    throw new Error("Draft slug already exists.");
  }
  const now = new Date().toISOString();
  const newRecord: MarketDraftRecord = {
    id: `draft_${Math.random().toString(36).slice(2, 10)}`,
    slug: validated.slug,
    question: validated.question,
    category: validated.category,
    description: validated.description,
    resolutionSource: validated.resolutionSource,
    closeTimeIso: validated.closeTimeIso,
    jurisdiction: validated.jurisdiction,
    visibility: validated.visibility,
    draftStatus: validated.draftStatus,
    createdAtIso: now,
    updatedAtIso: now,
    notes: validated.notes
  };
  const nextCatalog: MarketDraftCatalog = { drafts: [...catalog.drafts, newRecord] };
  const filePath = path.resolve(process.cwd(), "data/market-drafts.json");
  await fs.writeFile(filePath, JSON.stringify(nextCatalog, null, 2) + "\n", "utf-8");
  return newRecord;
}

export async function markDraftPublished(slug: string): Promise<MarketDraftRecord> {
  const catalog = await readMarketDraftCatalog();
  const draftIndex = catalog.drafts.findIndex((draft) => draft.slug === slug);
  if (draftIndex === -1) {
    throw new Error("Draft not found.");
  }
  const draft = catalog.drafts[draftIndex];
  if (draft.draftStatus !== "review_ready") {
    throw new Error("Only review_ready drafts can be published.");
  }
  const updated: MarketDraftRecord = {
    ...draft,
    draftStatus: "published",
    updatedAtIso: new Date().toISOString()
  };
  const nextCatalog: MarketDraftCatalog = {
    drafts: catalog.drafts.map((item, index) => index === draftIndex ? updated : item)
  };
  const filePath = path.resolve(process.cwd(), "data/market-drafts.json");
  await fs.writeFile(filePath, JSON.stringify(nextCatalog, null, 2) + "\n", "utf-8");
  return updated;
}
