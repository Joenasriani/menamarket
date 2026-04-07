import fs from "node:fs/promises";
import path from "node:path";
import { getMarketDraftBySlug, markDraftPublished, type MarketDraftRecord } from "./marketDrafts.js";
import { readMarketCatalog, type MarketCatalog, type MarketCatalogRecord } from "./markets.js";

type AuditLogEntry = {
  id: string;
  action: "draft_published";
  targetType: "market_draft";
  targetId: string;
  timestampIso: string;
  metadata: Record<string, unknown>;
};

type AuditLog = { entries: AuditLogEntry[] };

function assertAuditLog(input: unknown): AuditLog {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Audit log must be an object.");
  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.entries)) throw new Error("Audit log must contain an entries array.");
  return { entries: value.entries as AuditLogEntry[] };
}

async function readAuditLog(): Promise<AuditLog> {
  const filePath = path.resolve(process.cwd(), "data/audit-log.json");
  return assertAuditLog(JSON.parse(await fs.readFile(filePath, "utf-8")));
}

async function appendAuditLogEntry(entry: AuditLogEntry): Promise<void> {
  const filePath = path.resolve(process.cwd(), "data/audit-log.json");
  const current = await readAuditLog();
  await fs.writeFile(filePath, JSON.stringify({ entries: [...current.entries, entry] }, null, 2) + "\n", "utf-8");
}

function defaultRulesFromDraft(draft: MarketDraftRecord): string[] {
  return [
    `This market resolves using the named source: ${draft.resolutionSource}.`,
    "If the source does not clearly confirm the event by the close time, the market does not resolve affirmatively.",
    "Only the exact wording of the market question governs the outcome."
  ];
}

function defaultOutcomesForDraft(): MarketCatalogRecord["outcomes"] {
  return [
    { id: "yes", label: "Yes", probability: 0.5, price: 0.5 },
    { id: "no", label: "No", probability: 0.5, price: 0.5 }
  ];
}

function convertDraftToMarket(draft: MarketDraftRecord): MarketCatalogRecord {
  return {
    id: draft.id.replace("draft_", "market_"),
    slug: draft.slug,
    question: draft.question,
    category: draft.category,
    ...(draft.description !== undefined && { description: draft.description }),
    resolutionSource: draft.resolutionSource,
    closeTimeIso: draft.closeTimeIso,
    status: "scheduled" as const,
    jurisdiction: draft.jurisdiction,
    visibility: draft.visibility,
    createdAtIso: draft.createdAtIso,
    updatedAtIso: new Date().toISOString(),
    ...(draft.notes !== undefined && { notes: draft.notes }),
    rules: defaultRulesFromDraft(draft),
    resolutionTitle: "Default resolution basis",
    resolutionBasis: "Resolve strictly according to the named official or primary source and the exact market wording.",
    resolutionExamples: [
      "If the named source explicitly confirms the event within scope and time, resolve accordingly.",
      "If the source is ambiguous or outside scope, do not infer beyond the written question."
    ],
    outcomeType: "binary" as const,
    outcomes: defaultOutcomesForDraft(),
    priceUpdatedAtIso: new Date().toISOString()
  };
}

async function appendPublishedMarket(record: MarketCatalogRecord): Promise<void> {
  const current = await readMarketCatalog();
  if (current.markets.some((market) => market.slug === record.slug)) throw new Error("Market slug already exists in public catalog.");
  const next: MarketCatalog = { markets: [...current.markets, record] };
  const filePath = path.resolve(process.cwd(), "data/markets.json");
  await fs.writeFile(filePath, JSON.stringify(next, null, 2) + "\n", "utf-8");
}

export async function publishDraftBySlug(slug: string): Promise<{ market: MarketCatalogRecord; draft: MarketDraftRecord }> {
  const draft = await getMarketDraftBySlug(slug);
  if (!draft) throw new Error("Draft not found.");
  if (draft.draftStatus !== "review_ready") throw new Error("Draft must be review_ready before publishing.");
  const market = convertDraftToMarket(draft);
  await appendPublishedMarket(market);
  const updatedDraft = await markDraftPublished(slug);
  await appendAuditLogEntry({
    id: `audit_${Math.random().toString(36).slice(2, 10)}`,
    action: "draft_published",
    targetType: "market_draft",
    targetId: updatedDraft.id,
    timestampIso: new Date().toISOString(),
    metadata: { slug, publicMarketId: market.id, publicVisibility: market.visibility }
  });
  return { market, draft: updatedDraft };
}
