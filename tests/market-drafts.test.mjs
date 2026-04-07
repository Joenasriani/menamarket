import test from "node:test";
import assert from "node:assert/strict";
import {
  validateMarketDraftCatalog,
  validateNewMarketDraftInput
} from "../packages/api/dist/marketDrafts.js";

test("validateMarketDraftCatalog accepts an empty draft catalog", () => {
  const result = validateMarketDraftCatalog({ drafts: [] });
  assert.equal(Array.isArray(result.drafts), true);
  assert.equal(result.drafts.length, 0);
});

test("validateNewMarketDraftInput rejects invalid slug", () => {
  assert.throws(
    () => validateNewMarketDraftInput({
      question: "Will this resolve by the stated date?",
      slug: "Invalid Slug",
      category: "Politics",
      resolutionSource: "Official source",
      closeTimeIso: "2026-12-31T20:00:00.000Z",
      jurisdiction: "UAE",
      visibility: "internal",
      draftStatus: "draft"
    }),
    /Invalid field: slug/
  );
});

test("validateNewMarketDraftInput accepts a strict valid payload", () => {
  const result = validateNewMarketDraftInput({
    question: "Will this resolve by the stated date?",
    slug: "will-this-resolve-by-date",
    category: "Politics",
    resolutionSource: "Official source",
    closeTimeIso: "2026-12-31T20:00:00.000Z",
    jurisdiction: "UAE",
    visibility: "internal",
    draftStatus: "draft"
  });

  assert.equal(result.slug, "will-this-resolve-by-date");
});
