import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

import { deriveKey } from "./master-key.ts";

const VERSION = "v1";

export class SecretDecryptionError extends Error {
  constructor() {
    super("Encrypted provider secret could not be decrypted");
    this.name = "SecretDecryptionError";
  }
}

export function encryptSecret(
  plaintext: string,
  masterKey: Buffer,
  context: string,
): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(
    "aes-256-gcm",
    deriveKey(masterKey, "provider-token-encryption"),
    iv,
  );
  cipher.setAAD(Buffer.from(context));
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [VERSION, iv, ciphertext, tag]
    .map((part) => typeof part === "string" ? part : part.toString("base64url"))
    .join(".");
}

export function decryptSecret(
  encoded: string,
  masterKey: Buffer,
  context: string,
): string {
  const [version, ivPart, ciphertextPart, tagPart, extra] = encoded.split(".");
  if (version !== VERSION || !ivPart || !ciphertextPart || !tagPart || extra) {
    throw new SecretDecryptionError();
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      deriveKey(masterKey, "provider-token-encryption"),
      Buffer.from(ivPart, "base64url"),
    );
    decipher.setAAD(Buffer.from(context));
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextPart, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    throw new SecretDecryptionError();
  }
}
