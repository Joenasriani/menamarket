import test from "node:test";
import assert from "node:assert/strict";

process.env.ACTOR_SESSION_SECRET = "another-super-long-test-secret";
process.env.ACTOR_SESSION_MAX_AGE_SECONDS = "2592000";

const {
  validateActorCatalog,
  validateSignupInput,
  validateLoginInput
} = await import("../packages/api/dist/actors.js");

const {
  createActorSessionToken,
  verifyActorSessionToken
} = await import("../packages/api/dist/actorAuth.js");

test("validateActorCatalog accepts empty actors", () => {
  const result = validateActorCatalog({ actors: [] });
  assert.equal(result.actors.length, 0);
});

test("validateSignupInput rejects short password", () => {
  assert.throws(
    () => validateSignupInput({ username: "joe", password: "short" }),
    /Invalid field: password/
  );
});

test("validateLoginInput accepts valid payload", () => {
  const result = validateLoginInput({ username: "joe", password: "longenough" });
  assert.equal(result.username, "joe");
});

test("actor session token round-trips", () => {
  const token = createActorSessionToken({ id: "actor_1", username: "joe" });
  const session = verifyActorSessionToken(token);
  assert.equal(session?.username, "joe");
});
