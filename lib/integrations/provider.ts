export const providerIds = ["garmin", "suunto", "wahoo"] as const;

export type ProviderId = (typeof providerIds)[number];

export type ProviderCapabilities = Readonly<{
  activities: "read";
  offlineAccess: boolean;
  webhooks: boolean;
}>;

export type ProviderTokenSet = Readonly<{
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: readonly string[];
}>;

export type ProviderAccount = Readonly<{
  providerUserId: string;
  displayName?: string;
}>;

export type AuthorizationRequest = Readonly<{
  state: string;
  redirectUri: URL;
  codeChallenge?: string;
}>;

export type AuthorizationCallback = Readonly<{
  code: string;
  redirectUri: URL;
  codeVerifier?: string;
}>;

export interface WearableProviderAdapter {
  readonly id: ProviderId;
  readonly capabilities: ProviderCapabilities;

  createAuthorizationUrl(input: AuthorizationRequest): Promise<URL>;
  exchangeAuthorizationCode(
    input: AuthorizationCallback,
  ): Promise<ProviderTokenSet>;
  getAccount(tokens: ProviderTokenSet): Promise<ProviderAccount>;
  refreshTokens?(tokens: ProviderTokenSet): Promise<ProviderTokenSet>;
  revokeAccess?(tokens: ProviderTokenSet): Promise<void>;
}
