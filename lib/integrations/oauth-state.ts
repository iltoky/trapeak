import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import type { ProviderId } from "./provider";
import { deriveKey } from "../security/master-key.ts";

const STATE_VERSION = 1;
const DEFAULT_TTL_MS = 10 * 60 * 1_000;

type OAuthStatePayload = Readonly<{
  version: 1;
  provider: ProviderId;
  userId: string;
  nonce: string;
  expiresAt: number;
}>;

export class InvalidOAuthStateError extends Error {
  constructor() {
    super("Invalid or expired OAuth state");
    this.name = "InvalidOAuthStateError";
  }
}

function sign(payload: string, masterKey: Buffer): string {
  return createHmac(
    "sha256",
    deriveKey(masterKey, "oauth-state-signing"),
  ).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export function createOAuthState(
  input: Readonly<{ provider: ProviderId; userId: string }>,
  masterKey: Buffer,
  options: Readonly<{ now?: number; ttlMs?: number }> = {},
): string {
  const payload: OAuthStatePayload = {
    version: STATE_VERSION,
    provider: input.provider,
    userId: input.userId,
    nonce: randomBytes(24).toString("base64url"),
    expiresAt: (options.now ?? Date.now()) + (options.ttlMs ?? DEFAULT_TTL_MS),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded, masterKey)}`;
}

export function verifyOAuthState(
  state: string,
  expected: Readonly<{ provider: ProviderId; userId: string }>,
  masterKey: Buffer,
  now = Date.now(),
): OAuthStatePayload {
  const [encoded, signature, extra] = state.split(".");
  if (!encoded || !signature || extra || !safeEqual(signature, sign(encoded, masterKey))) {
    throw new InvalidOAuthStateError();
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as Partial<OAuthStatePayload>;
    if (
      payload.version !== STATE_VERSION ||
      payload.provider !== expected.provider ||
      payload.userId !== expected.userId ||
      typeof payload.nonce !== "string" ||
      payload.nonce.length < 32 ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= now
    ) {
      throw new InvalidOAuthStateError();
    }

    return payload as OAuthStatePayload;
  } catch (error) {
    if (error instanceof InvalidOAuthStateError) {
      throw error;
    }
    throw new InvalidOAuthStateError();
  }
}

export function matchesOAuthStateCookie(state: string, cookie: string | undefined): boolean {
  return Boolean(cookie && safeEqual(state, cookie));
}
