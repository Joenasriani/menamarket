import test from "node:test";
import assert from "node:assert/strict";

process.env.DEFAULT_FUNDING_RAIL = "manual";
process.env.DEFAULT_PAYOUT_RAIL = "manual";

const {
  paymentRailsEnabled,
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

test("payment rails default to disabled", () => {
  const previous = process.env.PAYMENT_RAILS_ENABLED;
  delete process.env.PAYMENT_RAILS_ENABLED;
  assert.equal(paymentRailsEnabled(), false);
  if (previous === undefined) delete process.env.PAYMENT_RAILS_ENABLED;
  else process.env.PAYMENT_RAILS_ENABLED = previous;
});

test("payment rails enable only with explicit true", () => {
  const previous = process.env.PAYMENT_RAILS_ENABLED;
  process.env.PAYMENT_RAILS_ENABLED = "true";
  assert.equal(paymentRailsEnabled(), true);
  process.env.PAYMENT_RAILS_ENABLED = "false";
  assert.equal(paymentRailsEnabled(), false);
  if (previous === undefined) delete process.env.PAYMENT_RAILS_ENABLED;
  else process.env.PAYMENT_RAILS_ENABLED = previous;
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
