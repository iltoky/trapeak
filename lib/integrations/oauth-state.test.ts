import assert from "node:assert/strict";
import test from "node:test";

import {
  createOAuthState,
  InvalidOAuthStateError,
  matchesOAuthStateCookie,
  verifyOAuthState,
} from "./oauth-state.ts";

const key = Buffer.alloc(32, 3);

test("creates a signed state bound to provider, user and expiry", () => {
  const state = createOAuthState(
    { provider: "wahoo", userId: "user-1" },
    key,
    { now: 1_000, ttlMs: 10_000 },
  );

  const payload = verifyOAuthState(
    state,
    { provider: "wahoo", userId: "user-1" },
    key,
    5_000,
  );
  assert.equal(payload.expiresAt, 11_000);
  assert.equal(matchesOAuthStateCookie(state, state), true);
});

test("rejects tampering, replay in another session and expired state", () => {
  const state = createOAuthState(
    { provider: "wahoo", userId: "user-1" },
    key,
    { now: 1_000, ttlMs: 1_000 },
  );

  assert.throws(
    () => verifyOAuthState(`${state}x`, { provider: "wahoo", userId: "user-1" }, key),
    InvalidOAuthStateError,
  );
  assert.throws(
    () => verifyOAuthState(state, { provider: "wahoo", userId: "user-2" }, key, 1_500),
    InvalidOAuthStateError,
  );
  assert.throws(
    () => verifyOAuthState(state, { provider: "wahoo", userId: "user-1" }, key, 2_001),
    InvalidOAuthStateError,
  );
  assert.equal(matchesOAuthStateCookie(state, "different"), false);
});

