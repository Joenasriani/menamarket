import test from "node:test";
import assert from "node:assert/strict";
import { isDiscoveryStatus } from "../packages/api/dist/discovery.js";

test("isDiscoveryStatus accepts valid market statuses", () => {
  assert.equal(isDiscoveryStatus("scheduled"), true);
  assert.equal(isDiscoveryStatus("resolved"), true);
});

test("isDiscoveryStatus rejects unknown values", () => {
  assert.equal(isDiscoveryStatus("fake_status"), false);
  assert.equal(isDiscoveryStatus(undefined), false);
});
