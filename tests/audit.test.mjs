import test from "node:test";
import assert from "node:assert/strict";
import { validateAuditLog } from "../packages/api/dist/audit.js";
import { verifyAdminSessionToken, createAdminSessionToken } from "../packages/api/dist/adminAuth.js";

process.env.ADMIN_SESSION_SECRET = "super-long-test-secret";
process.env.ADMIN_SESSION_MAX_AGE_SECONDS = "43200";

test("validateAuditLog accepts a valid audit payload", () => {
  const result = validateAuditLog({
    entries: [
      {
        id: "audit_1",
        action: "draft_published",
        targetType: "market_draft",
        targetId: "draft_1",
        timestampIso: "2026-04-07T00:00:00.000Z",
        metadata: {
          slug: "sample-slug"
        }
      }
    ]
  });

  assert.equal(result.entries.length, 1);
  assert.equal(result.entries[0].action, "draft_published");
});

test("verifyAdminSessionToken rejects tampered token", () => {
  const token = createAdminSessionToken("admin");
  const tampered = token + "tamper";
  assert.equal(verifyAdminSessionToken(tampered), null);
});
