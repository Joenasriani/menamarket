import test from "node:test";
import assert from "node:assert/strict";
import { validateMarketCatalog } from "../packages/api/dist/markets.js";

test("market catalog requires rules and resolution fields", () => {
  const catalog = validateMarketCatalog({
    markets: [
      {
        id: "market_1",
        slug: "rule-aware-market",
        question: "Will the market remain valid after the rules extension?",
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
        outcomeType: "binary"
      }
    ]
  });

  assert.equal(catalog.markets[0].rules.length, 1);
  assert.equal(catalog.markets[0].outcomeType, "binary");
});

test("market catalog rejects missing rules", () => {
  assert.throws(
    () => validateMarketCatalog({
      markets: [
        {
          id: "market_2",
          slug: "missing-rules",
          question: "Will this fail validation when rules are missing?",
          category: "Politics",
          resolutionSource: "Official source",
          closeTimeIso: "2026-12-31T20:00:00.000Z",
          status: "scheduled",
          jurisdiction: "UAE",
          visibility: "public",
          createdAtIso: "2026-04-07T00:00:00.000Z",
          updatedAtIso: "2026-04-07T00:00:00.000Z",
          resolutionTitle: "Source-led resolution",
          resolutionBasis: "Resolve only according to the named source.",
          outcomeType: "binary"
        }
      ]
    }),
    /Invalid field: markets\[0\]\.rules/
  );
});
