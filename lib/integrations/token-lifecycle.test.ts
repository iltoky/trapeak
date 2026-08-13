import assert from "node:assert/strict";
import test from "node:test";

import { shouldRefreshProviderTokens } from "./token-lifecycle.ts";

const now = Date.parse("2026-08-13T08:00:00.000Z");

test("refreshes an expired provider token", () => {
  assert.equal(shouldRefreshProviderTokens({
    accessToken: "expired",
    expiresAt: new Date(now - 1),
    scopes: [],
  }, now), true);
});

test("refreshes a provider token inside the safety window", () => {
  assert.equal(shouldRefreshProviderTokens({
    accessToken: "nearly-expired",
    expiresAt: new Date(now + 30_000),
    scopes: [],
  }, now), true);
});

test("keeps a provider token that has enough lifetime left", () => {
  assert.equal(shouldRefreshProviderTokens({
    accessToken: "active",
    expiresAt: new Date(now + 120_000),
    scopes: [],
  }, now), false);
});
