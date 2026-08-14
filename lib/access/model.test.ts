import assert from "node:assert/strict";
import test from "node:test";

import {
  createInvitationSecret,
  hashInvitationToken,
  isGrantActive,
  normalizePermissions,
  normalizeRecipientEmail,
  parseGrantExpiry,
} from "./model.ts";

test("normalizes recipient email and four permission categories", () => {
  assert.equal(normalizeRecipientEmail(" Person@Example.COM "), "person@example.com");
  assert.deepEqual(
    normalizePermissions(["health", "training", "health"]),
    ["training", "health"],
  );
  assert.throws(() => normalizePermissions([]));
  assert.throws(() => normalizePermissions(["medications"]));
});

test("limits grant expiry to a future date within one year", () => {
  const now = new Date("2026-08-14T12:00:00.000Z");
  assert.equal(
    parseGrantExpiry("2026-09-14T12:00:00.000Z", now).toISOString(),
    "2026-09-14T12:00:00.000Z",
  );
  assert.throws(() => parseGrantExpiry("2026-08-14T12:00:00.000Z", now));
  assert.throws(() => parseGrantExpiry("2028-01-01T00:00:00.000Z", now));
});

test("creates a one-time invitation secret stored only as a hash", () => {
  const invitation = createInvitationSecret();
  assert.equal(invitation.tokenHash, hashInvitationToken(invitation.token));
  assert.notEqual(invitation.token, invitation.tokenHash);
  assert.match(invitation.id, /^[0-9a-f-]{36}$/);
});

test("requires active status and non-expired access", () => {
  const now = new Date("2026-08-14T12:00:00.000Z");
  assert.equal(isGrantActive({ status: "active", expiresAt: "2026-08-15T00:00:00.000Z" }, now), true);
  assert.equal(isGrantActive({ status: "pending", expiresAt: "2026-08-15T00:00:00.000Z" }, now), false);
  assert.equal(isGrantActive({ status: "active", expiresAt: "2026-08-14T11:00:00.000Z" }, now), false);
});
