import test from "node:test";
import assert from "node:assert/strict";
import { validateSettlementCatalog } from "../packages/api/dist/settlement.js";

test("validateSettlementCatalog accepts empty settlements", () => {
  const result = validateSettlementCatalog({ settlements: [] });
  assert.equal(result.settlements.length, 0);
});
