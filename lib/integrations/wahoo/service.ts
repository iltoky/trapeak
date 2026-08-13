import "server-only";

import {
  getProviderTokens,
  markProviderReconnectRequired,
  saveProviderTokens,
} from "../connections";
import type { ProviderTokenSet } from "../provider";
import { shouldRefreshProviderTokens } from "../token-lifecycle";
import { WahooApiError, WahooProviderAdapter } from "./adapter";
import { readWahooConfig } from "./config";

export class WahooNotConnectedError extends Error {
  constructor() {
    super("Wahoo is not connected");
    this.name = "WahooNotConnectedError";
  }
}

export class WahooReconnectRequiredError extends Error {
  constructor() {
    super("Wahoo must be reconnected");
    this.name = "WahooReconnectRequiredError";
  }
}

export function getWahooAdapter(): WahooProviderAdapter {
  return new WahooProviderAdapter(readWahooConfig());
}

function isCredentialRefreshError(error: unknown): boolean {
  return error instanceof WahooApiError
    ? [400, 401, 403].includes(error.status)
    : error instanceof Error
      && error.message.includes("without a refresh token");
}

export async function getUsableWahooTokens(
  userId: string,
): Promise<ProviderTokenSet> {
  const tokens = await getProviderTokens(userId, "wahoo");
  if (!tokens) {
    throw new WahooNotConnectedError();
  }
  if (!shouldRefreshProviderTokens(tokens)) {
    return tokens;
  }

  try {
    const refreshedTokens = await getWahooAdapter().refreshTokens(tokens);
    await saveProviderTokens(userId, "wahoo", refreshedTokens);
    return refreshedTokens;
  } catch (error) {
    if (isCredentialRefreshError(error)) {
      await markProviderReconnectRequired(
        userId,
        "wahoo",
        "token_refresh_rejected",
      );
      throw new WahooReconnectRequiredError();
    }
    throw error;
  }
}
