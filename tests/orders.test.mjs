import test from "node:test";
import assert from "node:assert/strict";
import { validateNewOrderInput, validateOrderCatalog } from "../packages/api/dist/orders.js";

test("validateNewOrderInput accepts a valid order", () => {
  const result = validateNewOrderInput({
    marketSlug: "sample-market",
    actorId: "user_1",
    outcomeId: "yes",
    side: "buy",
    quantity: 10,
    limitPrice: 0.6
  });

  assert.equal(result.side, "buy");
  assert.equal(result.limitPrice, 0.6);
});

test("validateNewOrderInput rejects invalid price", () => {
  assert.throws(
    () => validateNewOrderInput({
      marketSlug: "sample-market",
      actorId: "user_1",
      outcomeId: "yes",
      side: "buy",
      quantity: 10,
      limitPrice: 1.5
    }),
    /Invalid field: limitPrice/
  );
});

test("validateOrderCatalog accepts an empty order catalog", () => {
  const result = validateOrderCatalog({ orders: [] });
  assert.equal(result.orders.length, 0);
});
