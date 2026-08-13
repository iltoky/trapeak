import assert from "node:assert/strict";
import test from "node:test";

import {
  readMasterKey,
  TokenEncryptionConfigurationError,
} from "./master-key.ts";

test("reads a base64-encoded 32-byte master key", () => {
  const expected = Buffer.alloc(32, 9);
  assert.deepEqual(
    readMasterKey({ TOKEN_ENCRYPTION_KEY: expected.toString("base64") }),
    expected,
  );
});

test("rejects missing and incorrectly sized master keys", () => {
  assert.throws(() => readMasterKey({}), TokenEncryptionConfigurationError);
  assert.throws(
    () => readMasterKey({ TOKEN_ENCRYPTION_KEY: Buffer.alloc(16).toString("base64") }),
    TokenEncryptionConfigurationError,
  );
});
