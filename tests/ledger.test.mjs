import test from "node:test";
import assert from "node:assert/strict";
import {
  validateLedgerCatalog,
  validateLedgerAdjustmentInput
} from "../packages/api/dist/ledger.js";

test("validateLedgerCatalog accepts empty accounts", () => {
  const result = validateLedgerCatalog({ accounts: [] });
  assert.equal(result.accounts.length, 0);
});

test("validateLedgerAdjustmentInput rejects invalid amount", () => {
  assert.throws(
    () => validateLedgerAdjustmentInput({ actorId: "user_1", type: "deposit", amount: 0 }),
    /Invalid field: amount/
  );
});
