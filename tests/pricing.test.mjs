import test from "node:test";
import assert from "node:assert/strict";
import { validateMarketCatalog } from "../packages/api/dist/markets.js";

test("market catalog accepts outcomes and pricing fields", () => {
  const result = validateMarketCatalog({
    markets: [
      {
        id: "market_1",
        slug: "priced-market",
        question: "Will the market remain valid after adding outcomes?",
        category: "Politics",
        resolutionSource: "Official source",
        closeTimeIso: "2026-12-31T20:00:00.000Z",
        status: "scheduled",
        jurisdiction: "UAE",
        visibility: "public",
        createdAtIso: "2026-04-07T00:00:00.000Z",
        updatedAtIso: "2026-04-07T00:00:00.000Z",
        rules: ["Use the named source only."],
        resolutionTitle: "Source-led resolution",
        resolutionBasis: "Resolve only according to the named source.",
        outcomeType: "binary",
        outcomes: [
          { id: "yes", label: "Yes", probability: 0.55, price: 0.55 },
          { id: "no", label: "No", probability: 0.45, price: 0.45 }
        ]
      }
    ]
  });

  assert.equal(result.markets[0].outcomes.length, 2);
});
