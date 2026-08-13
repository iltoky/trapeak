import type {
  AuthorizationCallback,
  AuthorizationRequest,
  ProviderAccount,
  ProviderTokenSet,
  WearableProviderAdapter,
} from "../provider";
import type { WahooConfig } from "./config";

const WAHOO_API_BASE_URL = "https://api.wahooligan.com";
const WAHOO_SCOPES = ["user_read", "workouts_read", "offline_data"] as const;

type Fetcher = typeof fetch;
type Clock = () => number;

type WahooTokenResponse = Readonly<{
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
}>;

type WahooUserResponse = Readonly<{
  id?: unknown;
  first?: unknown;
  last?: unknown;
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
    const response = await this.#fetch(
      new URL("/v1/user", WAHOO_API_BASE_URL),
      { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
    );
    const payload = await readJson(response, "user lookup") as WahooUserResponse;
    const providerUserId = String(payload.id ?? "");
    if (!providerUserId) {
      throw new Error("Invalid Wahoo response: missing user id");
    }

    const displayName = [payload.first, payload.last]
      .filter((part): part is string => typeof part === "string" && part.length > 0)
      .join(" ");

    return {
      providerUserId,
      ...(displayName ? { displayName } : {}),
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
