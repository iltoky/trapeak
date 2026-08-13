import assert from "node:assert/strict";
import test from "node:test";

import { readWahooConfig, WahooConfigurationError } from "./config.ts";

test("reads Wahoo credentials from server environment", () => {
  assert.deepEqual(readWahooConfig({
    WAHOO_CLIENT_ID: "client-id",
    WAHOO_CLIENT_SECRET: "client-secret",
  }), {
    clientId: "client-id",
    clientSecret: "client-secret",
  });
});

test("fails closed when Wahoo credentials are missing", () => {
  assert.throws(
    () => readWahooConfig({ WAHOO_CLIENT_ID: "client-id" }),
    WahooConfigurationError,
  );
});
