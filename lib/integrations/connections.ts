import "server-only";

import { randomUUID } from "node:crypto";

import { getDatabase } from "../db/client";
import { readMasterKey } from "../security/master-key";
import { decryptSecret, encryptSecret } from "../security/secret-box";
import type { ProviderAccount, ProviderId, ProviderTokenSet } from "./provider";

export type ProviderConnectionStatus =
  | "connected"
  | "reconnect_required"
  | "disconnected"
  | "error";

export type ProviderConnectionSummary = Readonly<{
  provider: ProviderId;
  providerUserId: string;
  displayName?: string;
  status: ProviderConnectionStatus;
}>;

type ProviderConnectionRow = Readonly<{
  provider: ProviderId;
  provider_user_id: string;
  provider_display_name: string | null;
  status: ProviderConnectionStatus;
  access_token_ciphertext: string | null;
  refresh_token_ciphertext: string | null;
  token_expires_at: string | Date | null;
  scopes: string[];
}>;

export class ProviderAccountAlreadyLinkedError extends Error {
  constructor() {
    super("Provider account is already linked");
    this.name = "ProviderAccountAlreadyLinkedError";
  }
}

function encryptionContext(
  provider: ProviderId,
  userId: string,
  tokenType: "access" | "refresh",
): string {
  return `${provider}:${userId}:${tokenType}`;
}

function isUniqueViolation(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505",
  );
}

export async function saveProviderConnection(input: Readonly<{
  userId: string;
  provider: ProviderId;
  account: ProviderAccount;
  tokens: ProviderTokenSet;
}>): Promise<void> {
  const sql = getDatabase();
  const masterKey = readMasterKey();
  const accessToken = encryptSecret(
    input.tokens.accessToken,
    masterKey,
    encryptionContext(input.provider, input.userId, "access"),
  );
  const refreshToken = input.tokens.refreshToken
    ? encryptSecret(
        input.tokens.refreshToken,
        masterKey,
        encryptionContext(input.provider, input.userId, "refresh"),
      )
    : null;

  try {
    const rows = await sql`
      INSERT INTO provider_connections (
        id, user_id, provider, provider_user_id, provider_display_name,
        status, access_token_ciphertext, refresh_token_ciphertext,
        token_expires_at, scopes, disconnected_at, last_error_code
      ) VALUES (
        ${randomUUID()}, ${input.userId}, ${input.provider},
        ${input.account.providerUserId}, ${input.account.displayName ?? null},
        'connected', ${accessToken}, ${refreshToken},
        ${input.tokens.expiresAt?.toISOString() ?? null},
        ${input.tokens.scopes}, NULL, NULL
      )
      ON CONFLICT (user_id, provider) DO UPDATE SET
        provider_user_id = EXCLUDED.provider_user_id,
        provider_display_name = EXCLUDED.provider_display_name,
        status = 'connected',
        access_token_ciphertext = EXCLUDED.access_token_ciphertext,
        refresh_token_ciphertext = EXCLUDED.refresh_token_ciphertext,
        token_expires_at = EXCLUDED.token_expires_at,
        scopes = EXCLUDED.scopes,
        disconnected_at = NULL,
        last_error_code = NULL,
        updated_at = NOW()
      WHERE provider_connections.provider_user_id = EXCLUDED.provider_user_id
         OR provider_connections.status = 'disconnected'
      RETURNING id
    `;

    if (rows.length !== 1) {
      throw new ProviderAccountAlreadyLinkedError();
    }
  } catch (error) {
    if (error instanceof ProviderAccountAlreadyLinkedError || isUniqueViolation(error)) {
      throw new ProviderAccountAlreadyLinkedError();
    }
    throw error;
  }
}

export async function getProviderConnectionSummary(
  userId: string,
  provider: ProviderId,
): Promise<ProviderConnectionSummary | null> {
  const sql = getDatabase();
  const rows = await sql`
    SELECT provider, provider_user_id, provider_display_name, status,
           access_token_ciphertext, refresh_token_ciphertext,
           token_expires_at, scopes
      FROM provider_connections
     WHERE user_id = ${userId} AND provider = ${provider}
     LIMIT 1
  ` as ProviderConnectionRow[];
  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    provider: row.provider,
    providerUserId: row.provider_user_id,
    ...(row.provider_display_name ? { displayName: row.provider_display_name } : {}),
    status: row.status,
  };
}

export async function getProviderTokens(
  userId: string,
  provider: ProviderId,
): Promise<ProviderTokenSet | null> {
  const sql = getDatabase();
  const rows = await sql`
    SELECT provider, provider_user_id, provider_display_name, status,
           access_token_ciphertext, refresh_token_ciphertext,
           token_expires_at, scopes
      FROM provider_connections
     WHERE user_id = ${userId}
       AND provider = ${provider}
       AND status = 'connected'
     LIMIT 1
  ` as ProviderConnectionRow[];
  const row = rows[0];
  if (!row?.access_token_ciphertext) {
    return null;
  }

  const masterKey = readMasterKey();
  return {
    accessToken: decryptSecret(
      row.access_token_ciphertext,
      masterKey,
      encryptionContext(provider, userId, "access"),
    ),
    ...(row.refresh_token_ciphertext
      ? {
          refreshToken: decryptSecret(
            row.refresh_token_ciphertext,
            masterKey,
            encryptionContext(provider, userId, "refresh"),
          ),
        }
      : {}),
    ...(row.token_expires_at
      ? { expiresAt: new Date(row.token_expires_at) }
      : {}),
    scopes: row.scopes,
  };
}

export async function saveProviderTokens(
  userId: string,
  provider: ProviderId,
  tokens: ProviderTokenSet,
): Promise<void> {
  const sql = getDatabase();
  const masterKey = readMasterKey();
  const accessToken = encryptSecret(
    tokens.accessToken,
    masterKey,
    encryptionContext(provider, userId, "access"),
  );
  const refreshToken = tokens.refreshToken
    ? encryptSecret(
        tokens.refreshToken,
        masterKey,
        encryptionContext(provider, userId, "refresh"),
      )
    : null;
  const rows = await sql`
    UPDATE provider_connections
       SET status = 'connected',
           access_token_ciphertext = ${accessToken},
           refresh_token_ciphertext = ${refreshToken},
           token_expires_at = ${tokens.expiresAt?.toISOString() ?? null},
           scopes = ${tokens.scopes},
           last_error_code = NULL,
           updated_at = NOW()
     WHERE user_id = ${userId}
       AND provider = ${provider}
       AND status <> 'disconnected'
     RETURNING id
  `;

  if (rows.length !== 1) {
    throw new Error("Provider connection is not available for token refresh");
  }
}

export async function markProviderReconnectRequired(
  userId: string,
  provider: ProviderId,
  errorCode: string,
): Promise<void> {
  const sql = getDatabase();
  await sql`
    UPDATE provider_connections
       SET status = 'reconnect_required',
           last_error_code = ${errorCode},
           updated_at = NOW()
     WHERE user_id = ${userId} AND provider = ${provider}
  `;
}

export async function markProviderDisconnected(
  userId: string,
  provider: ProviderId,
): Promise<void> {
  const sql = getDatabase();
  await sql`
    UPDATE provider_connections
       SET status = 'disconnected',
           access_token_ciphertext = NULL,
           refresh_token_ciphertext = NULL,
           token_expires_at = NULL,
           disconnected_at = NOW(),
           updated_at = NOW(),
           last_error_code = NULL
     WHERE user_id = ${userId} AND provider = ${provider}
  `;
}
