import type { ProviderTokenSet } from "./provider";

export const TOKEN_REFRESH_WINDOW_MS = 60_000;

export function shouldRefreshProviderTokens(
  tokens: ProviderTokenSet,
  now = Date.now(),
  refreshWindowMs = TOKEN_REFRESH_WINDOW_MS,
): boolean {
  return Boolean(
    tokens.expiresAt
      && tokens.expiresAt.getTime() <= now + refreshWindowMs,
  );
}
