import test from "node:test";
import assert from "node:assert/strict";

process.env.DEFAULT_FUNDING_RAIL = "manual";
process.env.DEFAULT_PAYOUT_RAIL = "manual";

const {
  validateRailsCatalog,
  validateFundingIntentInput,
  validatePayoutRequestInput
} = await import("../packages/api/dist/rails.js");

test("validateRailsCatalog accepts minimal active rail", () => {
  const result = validateRailsCatalog({
    rails: [
      { id: "manual", label: "Manual", direction: "both", status: "active" }
    ],
    fundingIntents: [],
    payoutRequests: []
  });
  assert.equal(result.rails.length, 1);
});

test("validateFundingIntentInput rejects invalid amount", () => {
  assert.throws(
    () => validateFundingIntentInput({ actorId: "actor_1", amount: 0 }),
    /Invalid field: amount/
  );
});

test("validatePayoutRequestInput accepts valid payload", () => {
  const result = validatePayoutRequestInput({ actorId: "actor_1", amount: 50 });
  assert.equal(result.actorId, "actor_1");
  assert.equal(result.amount, 50);
});
