import test from "node:test";
import assert from "node:assert/strict";
import { validateFillCatalog } from "../packages/api/dist/matching.js";

test("validateFillCatalog accepts empty fills", () => {
  const result = validateFillCatalog({ fills: [] });
  assert.equal(result.fills.length, 0);
});
