import test from "node:test";
import assert from "node:assert/strict";
import { parsePageNumber } from "../packages/api/dist/publicApi.js";

test("parsePageNumber falls back safely", () => {
  assert.equal(parsePageNumber(undefined, 20), 20);
  assert.equal(parsePageNumber("0", 20), 20);
  assert.equal(parsePageNumber("5", 20), 5);
});
