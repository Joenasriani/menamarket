import test from "node:test";
import assert from "node:assert/strict";
import {
  getAnyMarketBySlug,
  getPublicMarketBySlug,
  validateMarketCatalog
} from "../packages/api/dist/markets.js";

test("validateMarketCatalog preserves a complete public record", () => {
  const catalog = validateMarketCatalog({
    markets: [
      {
        id: "mkt_1",
        slug: "uae-election-2028",
        question: "Will the example event resolve affirmatively by the specified date?",
        category: "Politics",
        description: "Example description for validation only.",
        resolutionSource: "Official gazette",
        closeTimeIso: "2028-01-10T18:00:00.000Z",
        status: "scheduled",
        jurisdiction: "UAE",
        visibility: "public",
        createdAtIso: "2026-04-07T00:00:00.000Z",
        updatedAtIso: "2026-04-07T00:00:00.000Z",
        rules: ["Resolve only according to the named source."],
        resolutionTitle: "Official gazette resolution",
        resolutionBasis: "Resolved per the official gazette publication.",
        outcomeType: "binary",
        outcomes: [
          { id: "yes", label: "Yes", probability: 0.5, price: 0.5 },
          { id: "no", label: "No", probability: 0.5, price: 0.5 }
        ]
      }
    ]
  });

  assert.equal(catalog.markets[0].slug, "uae-election-2028");
});

test("detail helpers return null when the repository catalog is empty", async () => {
  const publicRecord = await getPublicMarketBySlug("missing-slug");
  const internalRecord = await getAnyMarketBySlug("missing-slug");
  assert.equal(publicRecord, null);
  assert.equal(internalRecord, null);
});
