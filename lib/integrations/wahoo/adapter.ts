import type {
  AuthorizationCallback,
  AuthorizationRequest,
  ProviderAccount,
  ProviderActivity,
  ProviderActivityPage,
  ProviderAthleteProfile,
  ProviderTokenSet,
  WearableProviderAdapter,
} from "../provider";
import type { WahooConfig } from "./config";

const WAHOO_API_BASE_URL = "https://api.wahooligan.com";
const WAHOO_SCOPES = ["user_read", "workouts_read", "offline_data"] as const;

type Fetcher = typeof fetch;
type Clock = () => number;

const WAHOO_WORKOUT_TYPE_NAMES: Readonly<Record<string, string>> = {
  "0": "Biking",
  "1": "Running",
  "2": "Fitness equipment",
  "3": "Track running",
  "4": "Trail running",
  "5": "Treadmill running",
  "6": "Walking",
  "7": "Speed walking",
  "8": "Nordic walking",
  "9": "Hiking",
  "10": "Mountaineering",
  "11": "Cyclocross",
  "12": "Indoor biking",
  "13": "Mountain biking",
  "14": "Recumbent biking",
  "15": "Road biking",
  "16": "Track biking",
  "17": "Motorcycling",
  "18": "Indoor workout",
  "19": "Treadmill workout",
  "20": "Elliptical",
  "21": "Exercise bike",
  "22": "Indoor rowing",
  "23": "Climber",
  "25": "Lap swimming",
  "26": "Open-water swimming",
  "27": "Snowboarding",
  "28": "Skiing",
  "29": "Downhill skiing",
  "30": "Cross-country skiing",
  "31": "Skating",
  "32": "Ice skating",
  "33": "Inline skating",
  "34": "Longboarding",
  "35": "Sailing",
  "36": "Windsurfing",
  "37": "Canoeing",
  "38": "Kayaking",
  "39": "Rowing",
  "40": "Kiteboarding",
  "41": "Stand-up paddleboarding",
  "42": "Workout",
  "43": "Cardio class",
  "44": "Stair climber",
  "45": "Wheelchair",
  "46": "Golf",
  "47": "Other",
  "49": "Indoor cycling class",
  "56": "Treadmill walking",
  "61": "Indoor cycling trainer",
  "62": "Multisport",
  "63": "Transition",
  "64": "E-biking",
  "65": "TICKR offline",
  "66": "Yoga",
  "67": "Running race",
  "68": "Virtual indoor biking",
  "69": "Mental strength",
  "70": "Handcycling",
  "71": "Virtual indoor running",
  "255": "Unknown",
};

export function getWahooWorkoutTypeName(
  activityTypeId: string,
): string | undefined {
  return WAHOO_WORKOUT_TYPE_NAMES[activityTypeId];
}

type WahooTokenResponse = Readonly<{
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
}>;

type WahooUserResponse = Readonly<{
  id?: unknown;
  first?: unknown;
  last?: unknown;
  height?: unknown;
  weight?: unknown;
  birth?: unknown;
  gender?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
}>;

type WahooWorkoutPageResponse = Readonly<{
  workouts?: unknown;
  total?: unknown;
  page?: unknown;
  per_page?: unknown;
}>;

export class WahooApiError extends Error {
  readonly status: number;

  constructor(operation: string, status: number) {
    super(`Wahoo ${operation} failed with status ${status}`);
    this.name = "WahooApiError";
    this.status = status;
  }
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid Wahoo response: missing ${field}`);
  }

  return value;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function optionalDate(value: unknown): Date | undefined {
  const source = optionalString(value);
  if (!source) {
    return undefined;
  }

  const parsed = new Date(source);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function optionalDateOnly(value: unknown): string | undefined {
  const source = optionalString(value);
  if (!source || !/^\d{4}-\d{2}-\d{2}$/.test(source)) {
    return undefined;
  }

  const parsed = new Date(`${source}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : source;
}

function requireObject(
  value: unknown,
  operation: string,
): Readonly<Record<string, unknown>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid Wahoo response during ${operation}`);
  }

  return value as Readonly<Record<string, unknown>>;
}

export function normalizeWahooWorkout(value: unknown): ProviderActivity | null {
  const workout = requireObject(value, "workout list");
  const summaryValue = workout.workout_summary;
  if (!summaryValue || typeof summaryValue !== "object" || Array.isArray(summaryValue)) {
    return null;
  }

  const summary = summaryValue as Readonly<Record<string, unknown>>;
  const providerActivityId = String(workout.id ?? "");
  const startedAt = optionalDate(workout.starts);
  if (!providerActivityId || !startedAt) {
    throw new Error("Invalid Wahoo response: missing workout id or starts");
  }

  const workoutMinutes = optionalNumber(workout.minutes);
  const durationSeconds = optionalNumber(summary.duration_total_accum)
    ?? (workoutMinutes !== undefined ? workoutMinutes * 60 : undefined);
  const name = optionalString(workout.name);
  const activityTypeId = workout.workout_type_id === null
    || workout.workout_type_id === undefined
    ? undefined
    : String(workout.workout_type_id);
  const activityTypeName = activityTypeId
    ? getWahooWorkoutTypeName(activityTypeId)
    : undefined;
  const activeDurationSeconds = optionalNumber(summary.duration_active_accum);
  const pausedDurationSeconds = optionalNumber(summary.duration_paused_accum);
  const distanceMeters = optionalNumber(summary.distance_accum);
  const elevationGainMeters = optionalNumber(summary.ascent_accum);
  const caloriesKilocalories = optionalNumber(summary.calories_accum);
  const averageHeartRateBpm = optionalNumber(summary.heart_rate_avg);
  const averageCadenceRpm = optionalNumber(summary.cadence_avg);
  const averageSpeedMetersPerSecond = optionalNumber(summary.speed_avg);
  const averagePowerWatts = optionalNumber(summary.power_avg);
  const normalizedPowerWatts = optionalNumber(summary.power_bike_np_last);
  const trainingStressScore = optionalNumber(summary.power_bike_tss_last);
  const workJoules = optionalNumber(summary.work_accum);
  const timeZone = optionalString(summary.time_zone);
  const providerCreatedAt = optionalDate(workout.created_at);
  const providerUpdatedAt = optionalDate(summary.updated_at)
    ?? optionalDate(workout.updated_at);
  const sourceAppId = summary.fitness_app_id === null
    || summary.fitness_app_id === undefined
    ? undefined
    : String(summary.fitness_app_id);

  return {
    providerActivityId,
    ...(name ? { name } : {}),
    ...(activityTypeId ? { activityTypeId } : {}),
    ...(activityTypeName ? { activityTypeName } : {}),
    startedAt,
    ...(durationSeconds !== undefined ? { durationSeconds } : {}),
    ...(activeDurationSeconds !== undefined ? { activeDurationSeconds } : {}),
    ...(pausedDurationSeconds !== undefined ? { pausedDurationSeconds } : {}),
    ...(distanceMeters !== undefined ? { distanceMeters } : {}),
    ...(elevationGainMeters !== undefined ? { elevationGainMeters } : {}),
    ...(caloriesKilocalories !== undefined ? { caloriesKilocalories } : {}),
    ...(averageHeartRateBpm !== undefined ? { averageHeartRateBpm } : {}),
    ...(averageCadenceRpm !== undefined ? { averageCadenceRpm } : {}),
    ...(averageSpeedMetersPerSecond !== undefined
      ? { averageSpeedMetersPerSecond }
      : {}),
    ...(averagePowerWatts !== undefined ? { averagePowerWatts } : {}),
    ...(normalizedPowerWatts !== undefined ? { normalizedPowerWatts } : {}),
    ...(trainingStressScore !== undefined ? { trainingStressScore } : {}),
    ...(workJoules !== undefined ? { workJoules } : {}),
    ...(timeZone ? { timeZone } : {}),
    ...(typeof summary.manual === "boolean" ? { isManual: summary.manual } : {}),
    ...(typeof summary.edited === "boolean" ? { isEdited: summary.edited } : {}),
    ...(sourceAppId ? { sourceAppId } : {}),
    ...(providerCreatedAt ? { providerCreatedAt } : {}),
    ...(providerUpdatedAt ? { providerUpdatedAt } : {}),
    rawData: workout,
  };
}

async function readJson(response: Response, operation: string): Promise<unknown> {
  if (!response.ok) {
    throw new WahooApiError(operation, response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new Error(`Invalid Wahoo response during ${operation}`);
  }
}

export class WahooProviderAdapter implements WearableProviderAdapter {
  readonly id = "wahoo" as const;
  readonly capabilities = {
    activities: "read",
    offlineAccess: true,
    webhooks: true,
  } as const;

  readonly #config: WahooConfig;
  readonly #fetch: Fetcher;
  readonly #clock: Clock;

  constructor(
    config: WahooConfig,
    dependencies: Readonly<{ fetch?: Fetcher; clock?: Clock }> = {},
  ) {
    this.#config = config;
    this.#fetch = dependencies.fetch ?? fetch;
    this.#clock = dependencies.clock ?? Date.now;
  }

  async createAuthorizationUrl(input: AuthorizationRequest): Promise<URL> {
    const url = new URL("/oauth/authorize", WAHOO_API_BASE_URL);
    url.searchParams.set("client_id", this.#config.clientId);
    url.searchParams.set("redirect_uri", input.redirectUri.toString());
    url.searchParams.set("scope", WAHOO_SCOPES.join(" "));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", input.state);
    return url;
  }

  async exchangeAuthorizationCode(
    input: AuthorizationCallback,
  ): Promise<ProviderTokenSet> {
    return this.#requestTokens(new URLSearchParams({
      client_id: this.#config.clientId,
      client_secret: this.#config.clientSecret,
      code: input.code,
      redirect_uri: input.redirectUri.toString(),
      grant_type: "authorization_code",
    }));
  }

  async getAccount(tokens: ProviderTokenSet): Promise<ProviderAccount> {
    const profile = await this.getProfile(tokens);
    return {
      providerUserId: profile.providerUserId,
      ...(profile.displayName ? { displayName: profile.displayName } : {}),
    };
  }

  async getProfile(tokens: ProviderTokenSet): Promise<ProviderAthleteProfile> {
    const response = await this.#fetch(
      new URL("/v1/user", WAHOO_API_BASE_URL),
      { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
    );
    const payload = requireObject(
      await readJson(response, "user lookup"),
      "user lookup",
    ) as WahooUserResponse & Readonly<Record<string, unknown>>;
    const providerUserId = String(payload.id ?? "");
    if (!providerUserId) {
      throw new Error("Invalid Wahoo response: missing user id");
    }

    const displayName = [payload.first, payload.last]
      .filter((part): part is string => typeof part === "string" && part.length > 0)
      .join(" ");

    const heightMeters = optionalNumber(payload.height);
    const weightKilograms = optionalNumber(payload.weight);
    const birthDate = optionalDateOnly(payload.birth);
    const genderCode = optionalNumber(payload.gender);
    const providerCreatedAt = optionalDate(payload.created_at);
    const providerUpdatedAt = optionalDate(payload.updated_at);

    return {
      providerUserId,
      ...(displayName ? { displayName } : {}),
      ...(heightMeters !== undefined ? { heightMeters } : {}),
      ...(weightKilograms !== undefined ? { weightKilograms } : {}),
      ...(birthDate ? { birthDate } : {}),
      ...(genderCode !== undefined ? { genderCode } : {}),
      ...(providerCreatedAt ? { providerCreatedAt } : {}),
      ...(providerUpdatedAt ? { providerUpdatedAt } : {}),
      rawData: payload,
    };
  }

  async listActivities(
    tokens: ProviderTokenSet,
    input: Readonly<{ page?: number; perPage?: number }> = {},
  ): Promise<ProviderActivityPage> {
    const page = input.page ?? 1;
    const perPage = input.perPage ?? 30;
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(perPage) || perPage < 1) {
      throw new Error("Invalid Wahoo workout pagination");
    }

    const url = new URL("/v1/workouts", WAHOO_API_BASE_URL);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(perPage));
    const response = await this.#fetch(url, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    const payload = requireObject(
      await readJson(response, "workout list"),
      "workout list",
    ) as WahooWorkoutPageResponse;
    if (!Array.isArray(payload.workouts)) {
      throw new Error("Invalid Wahoo response: missing workouts");
    }

    const activities = payload.workouts
      .map(normalizeWahooWorkout)
      .filter((activity): activity is ProviderActivity => activity !== null);
    const total = optionalNumber(payload.total);
    const responsePage = optionalNumber(payload.page);
    const responsePerPage = optionalNumber(payload.per_page);

    return {
      activities,
      total: total !== undefined ? Math.max(0, Math.trunc(total)) : activities.length,
      page: responsePage !== undefined ? Math.max(1, Math.trunc(responsePage)) : page,
      perPage: responsePerPage !== undefined
        ? Math.max(1, Math.trunc(responsePerPage))
        : perPage,
    };
  }

  async refreshTokens(tokens: ProviderTokenSet): Promise<ProviderTokenSet> {
    if (!tokens.refreshToken) {
      throw new Error("Cannot refresh Wahoo tokens without a refresh token");
    }

    return this.#requestTokens(new URLSearchParams({
      client_id: this.#config.clientId,
      client_secret: this.#config.clientSecret,
      refresh_token: tokens.refreshToken,
      grant_type: "refresh_token",
    }));
  }

  async revokeAccess(tokens: ProviderTokenSet): Promise<void> {
    const response = await this.#fetch(
      new URL("/v1/permissions", WAHOO_API_BASE_URL),
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      },
    );

    if (!response.ok) {
      throw new WahooApiError("deauthorization", response.status);
    }
  }

  async #requestTokens(body: URLSearchParams): Promise<ProviderTokenSet> {
    const response = await this.#fetch(
      new URL("/oauth/token", WAHOO_API_BASE_URL),
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    const payload = await readJson(response, "token exchange") as WahooTokenResponse;
    const accessToken = requireString(payload.access_token, "access_token");
    const refreshToken = requireString(payload.refresh_token, "refresh_token");
    const expiresIn = Number(payload.expires_in);
    if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
      throw new Error("Invalid Wahoo response: missing expires_in");
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(this.#clock() + expiresIn * 1_000),
      scopes: WAHOO_SCOPES,
    };
  }
}
