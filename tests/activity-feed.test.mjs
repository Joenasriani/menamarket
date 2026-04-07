import test from "node:test";
import assert from "node:assert/strict";

const { listActivityFeed } = await import("../packages/api/dist/activityFeed.js");

test("listActivityFeed returns an array", async () => {
  const result = await listActivityFeed({ limit: 5 });
  assert.equal(Array.isArray(result), true);
});
