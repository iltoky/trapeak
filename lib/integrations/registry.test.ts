import assert from "node:assert/strict";
import test from "node:test";

import type { WearableProviderAdapter } from "./provider.ts";
import {
  ProviderAdapterRegistry,
  ProviderNotConfiguredError,
} from "./registry.ts";

const wahooAdapter = {
  id: "wahoo",
  capabilities: {
    activities: "read",
    offlineAccess: true,
    webhooks: false,
  },
  async createAuthorizationUrl() {
    return new URL("https://example.com/authorize");
  },
  async exchangeAuthorizationCode() {
    return { accessToken: "test", scopes: ["workouts_read"] };
  },
  async getAccount() {
    return { providerUserId: "provider-user" };
  },
} satisfies WearableProviderAdapter;

test("registers and resolves a provider adapter", () => {
  const registry = new ProviderAdapterRegistry();
  registry.register(wahooAdapter);

  assert.equal(registry.get("wahoo"), wahooAdapter);
  assert.deepEqual(registry.configuredProviders(), ["wahoo"]);
});

test("rejects duplicate provider registrations", () => {
  const registry = new ProviderAdapterRegistry();
  registry.register(wahooAdapter);

  assert.throws(
    () => registry.register(wahooAdapter),
    /already registered/,
  );
});

test("fails closed for an unconfigured provider", () => {
  const registry = new ProviderAdapterRegistry();

  assert.throws(
    () => registry.get("suunto"),
    ProviderNotConfiguredError,
  );
});
