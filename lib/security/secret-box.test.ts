import assert from "node:assert/strict";
import test from "node:test";

import { decryptSecret, encryptSecret, SecretDecryptionError } from "./secret-box.ts";

const masterKey = Buffer.alloc(32, 7);

test("encrypts provider secrets with randomized authenticated encryption", () => {
  const first = encryptSecret("access-token", masterKey, "wahoo:user-1:access");
  const second = encryptSecret("access-token", masterKey, "wahoo:user-1:access");

  assert.notEqual(first, second);
  assert.equal(
    decryptSecret(first, masterKey, "wahoo:user-1:access"),
    "access-token",
  );
});

test("rejects ciphertext tampering and a different ownership context", () => {
  const encrypted = encryptSecret(
    "refresh-token",
    masterKey,
    "wahoo:user-1:refresh",
  );

  assert.throws(
    () => decryptSecret(`${encrypted}x`, masterKey, "wahoo:user-1:refresh"),
    SecretDecryptionError,
  );
  assert.throws(
    () => decryptSecret(encrypted, masterKey, "wahoo:user-2:refresh"),
    SecretDecryptionError,
  );
});

