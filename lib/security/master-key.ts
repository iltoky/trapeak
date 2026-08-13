import { hkdfSync } from "node:crypto";

export class TokenEncryptionConfigurationError extends Error {
  constructor(reason = "is missing") {
    super(`Invalid token encryption configuration: TOKEN_ENCRYPTION_KEY ${reason}`);
    this.name = "TokenEncryptionConfigurationError";
  }
}

export function readMasterKey(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): Buffer {
  const encoded = environment.TOKEN_ENCRYPTION_KEY?.trim();
  if (!encoded) {
    throw new TokenEncryptionConfigurationError();
  }

  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new TokenEncryptionConfigurationError(
      "must be a base64-encoded 32-byte key",
    );
  }

  return key;
}

export function deriveKey(masterKey: Buffer, purpose: string): Buffer {
  return Buffer.from(
    hkdfSync(
      "sha256",
      masterKey,
      Buffer.from("trapeak-security-v1"),
      Buffer.from(purpose),
      32,
    ),
  );
}

