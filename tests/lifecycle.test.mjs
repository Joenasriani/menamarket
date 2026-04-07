import test from "node:test";
import assert from "node:assert/strict";
import { allowedLifecycleActions, validateLifecycleActionInput } from "../packages/api/dist/lifecycle.js";

test("allowedLifecycleActions returns strict transitions", () => {
  assert.deepEqual(allowedLifecycleActions("scheduled"), ["open", "cancel"]);
  assert.deepEqual(allowedLifecycleActions("open"), ["halt", "close", "cancel"]);
  assert.deepEqual(allowedLifecycleActions("awaiting_resolution"), ["resolve", "cancel"]);
});

test("validateLifecycleActionInput requires resolution fields for resolve", () => {
  assert.throws(
    () => validateLifecycleActionInput({
      slug: "market-slug",
      action: "resolve"
    }),
    /Invalid field: outcome/
  );
});

test("validateLifecycleActionInput accepts valid resolve payload", () => {
  const result = validateLifecycleActionInput({
    slug: "market-slug",
    action: "resolve",
    outcome: "yes",
    evidence: "Official source confirms the event.",
    sourceLink: "https://example.com/source",
    resolvedAtIso: "2026-12-31T20:00:00.000Z"
  });

  assert.equal(result.action, "resolve");
  assert.equal(result.outcome, "yes");
});
