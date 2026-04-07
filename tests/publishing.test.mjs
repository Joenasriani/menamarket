import test from "node:test";
import assert from "node:assert/strict";
import { validateMarketDraftCatalog } from "../packages/api/dist/marketDrafts.js";
import { validateMarketCatalog } from "../packages/api/dist/markets.js";

test("draft catalog accepts published status in persisted records", () => {
  const result = validateMarketDraftCatalog({
    drafts: [
      {
        id: "draft_1",
        slug: "published-example",
        question: "Will the record pass review and be published on the stated date?",
        category: "Politics",
        resolutionSource: "Official source",
        closeTimeIso: "2026-12-31T20:00:00.000Z",
        jurisdiction: "UAE",
        visibility: "public",
        draftStatus: "published",
        createdAtIso: "2026-04-07T00:00:00.000Z",
        updatedAtIso: "2026-04-07T00:00:00.000Z"
      }
    ]
  });
  assert.equal(result.drafts[0].draftStatus, "published");
});

test("market catalog accepts a scheduled record shaped like a published draft conversion", () => {
  const result = validateMarketCatalog({
    markets: [
      {
        id: "market_1",
        slug: "public-market-example",
        question: "Will the public market remain schema valid after conversion?",
        category: "Politics",
        resolutionSource: "Official source",
        closeTimeIso: "2026-12-31T20:00:00.000Z",
        status: "scheduled",
        jurisdiction: "UAE",
        visibility: "public",
        createdAtIso: "2026-04-07T00:00:00.000Z",
        updatedAtIso: "2026-04-07T00:00:00.000Z"
      }
    ]
  });
  assert.equal(result.markets[0].status, "scheduled");
});
