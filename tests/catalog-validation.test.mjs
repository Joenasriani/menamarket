import test from "node:test";
import assert from "node:assert/strict";
import { validateMarketCatalog } from "../packages/api/dist/markets.js";

test("validateMarketCatalog accepts an empty catalog", () => {
  const result = validateMarketCatalog({ markets: [] });
  assert.equal(Array.isArray(result.markets), true);
  assert.equal(result.markets.length, 0);
});

test("validateMarketCatalog rejects incomplete records", () => {
  assert.throws(
    () => validateMarketCatalog({ markets: [{ id: "m1" }] }),
    /Invalid field|must contain a markets array/
  );
});
