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

export type ProviderAthleteProfile = Readonly<{
  providerUserId: string;
  displayName?: string;
  heightMeters?: number;
  weightKilograms?: number;
  birthDate?: string;
  genderCode?: number;
  providerCreatedAt?: Date;
  providerUpdatedAt?: Date;
  rawData: Readonly<Record<string, unknown>>;
}>;

export type ProviderActivity = Readonly<{
  providerActivityId: string;
  name?: string;
  activityTypeId?: string;
  activityTypeName?: string;
  startedAt: Date;
  durationSeconds?: number;
  activeDurationSeconds?: number;
  pausedDurationSeconds?: number;
  distanceMeters?: number;
  elevationGainMeters?: number;
  caloriesKilocalories?: number;
  averageHeartRateBpm?: number;
  averageCadenceRpm?: number;
  averageSpeedMetersPerSecond?: number;
  averagePowerWatts?: number;
  normalizedPowerWatts?: number;
  trainingStressScore?: number;
  workJoules?: number;
  timeZone?: string;
  isManual?: boolean;
  isEdited?: boolean;
  sourceAppId?: string;
  providerCreatedAt?: Date;
  providerUpdatedAt?: Date;
  rawData: Readonly<Record<string, unknown>>;
}>;

export type ProviderActivityPage = Readonly<{
  activities: readonly ProviderActivity[];
  total: number;
  page: number;
  perPage: number;
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
  getProfile?(tokens: ProviderTokenSet): Promise<ProviderAthleteProfile>;
  listActivities?(
    tokens: ProviderTokenSet,
    input?: Readonly<{ page?: number; perPage?: number }>,
  ): Promise<ProviderActivityPage>;
  refreshTokens?(tokens: ProviderTokenSet): Promise<ProviderTokenSet>;
  revokeAccess?(tokens: ProviderTokenSet): Promise<void>;
}
