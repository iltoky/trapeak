import assert from "node:assert/strict";
import test from "node:test";

import {
  McpUnauthorizedError,
  requireMcpUserId,
} from "./auth.ts";

test("requireMcpUserId returns the Clerk user ID", () => {
  assert.equal(
    requireMcpUserId({ extra: { userId: "user_123" } }),
    "user_123",
  );
});

test("requireMcpUserId rejects missing or malformed identities", () => {
  assert.throws(() => requireMcpUserId(undefined), McpUnauthorizedError);
  assert.throws(
    () => requireMcpUserId({ extra: { userId: 123 } }),
    McpUnauthorizedError,
  );
});
