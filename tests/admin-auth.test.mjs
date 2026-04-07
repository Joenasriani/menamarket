import test from "node:test";
import assert from "node:assert/strict";

process.env.ADMIN_LOGIN_USERNAME = "admin";
process.env.ADMIN_LOGIN_PASSWORD = "secret";
process.env.ADMIN_SESSION_SECRET = "super-long-test-secret";

const {
  authenticateAdmin,
  createAdminSessionToken,
  verifyAdminSessionToken,
  isProtectedAdminPath
} = await import("../packages/api/dist/adminAuth.js");

test("authenticateAdmin accepts valid credentials", () => {
  const result = authenticateAdmin({ username: "admin", password: "secret" });
  assert.equal(result.username, "admin");
});

test("authenticateAdmin rejects invalid credentials", () => {
  assert.throws(
    () => authenticateAdmin({ username: "admin", password: "wrong" }),
    /Invalid admin credentials/
  );
});

test("createAdminSessionToken and verifyAdminSessionToken round-trip", () => {
  const token = createAdminSessionToken("admin");
  const session = verifyAdminSessionToken(token);
  assert.equal(session?.username, "admin");
  assert.equal(typeof session?.issuedAtIso, "string");
});

test("isProtectedAdminPath protects admin surfaces but not login endpoints", () => {
  assert.equal(isProtectedAdminPath("/"), true);
  assert.equal(isProtectedAdminPath("/market-ops/create"), true);
  assert.equal(isProtectedAdminPath("/api/market-actions"), true);
  assert.equal(isProtectedAdminPath("/login"), false);
  assert.equal(isProtectedAdminPath("/api/admin-auth/login"), false);
});
