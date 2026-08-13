import assert from "node:assert/strict";
import test from "node:test";

import { WahooApiError, WahooProviderAdapter } from "./adapter.ts";

const config = { clientId: "client-id", clientSecret: "client-secret" };
const redirectUri = new URL("https://trapeak.com/api/integrations/wahoo/callback");

test("creates a scoped Wahoo authorization URL with CSRF state", async () => {
  const adapter = new WahooProviderAdapter(config);
  const url = await adapter.createAuthorizationUrl({
    state: "one-time-state",
    redirectUri,
  });

  assert.equal(url.origin, "https://api.wahooligan.com");
  assert.equal(url.pathname, "/oauth/authorize");
  assert.equal(url.searchParams.get("client_id"), "client-id");
  assert.equal(url.searchParams.get("redirect_uri"), redirectUri.toString());
  assert.equal(url.searchParams.get("scope"), "user_read workouts_read offline_data");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("state"), "one-time-state");
  assert.equal(url.searchParams.has("client_secret"), false);
});

test("exchanges an authorization code without putting secrets in the URL", async () => {
  let requestUrl: URL | undefined;
  let requestInit: RequestInit | undefined;
  const fetcher: typeof fetch = async (input, init) => {
    requestUrl = new URL(input.toString());
    requestInit = init;
    return Response.json({
      access_token: "access-token",
      refresh_token: "refresh-token",
      expires_in: 7200,
    });
  };
  const now = Date.parse("2026-08-13T08:00:00.000Z");
  const adapter = new WahooProviderAdapter(config, { fetch: fetcher, clock: () => now });

  const tokens = await adapter.exchangeAuthorizationCode({
    code: "authorization-code",
    redirectUri,
  });

  assert.equal(requestUrl?.toString(), "https://api.wahooligan.com/oauth/token");
  assert.equal(requestInit?.method, "POST");
  const body = requestInit?.body as URLSearchParams;
  assert.equal(body.get("client_secret"), "client-secret");
  assert.equal(body.get("code"), "authorization-code");
  assert.deepEqual(tokens, {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: new Date("2026-08-13T10:00:00.000Z"),
    scopes: ["user_read", "workouts_read", "offline_data"],
  });
});

test("loads the authenticated Wahoo account", async () => {
  const fetcher: typeof fetch = async (_input, init) => {
    assert.deepEqual(init?.headers, { Authorization: "Bearer access-token" });
    return Response.json({ id: 60462, first: "Test", last: "Athlete" });
  };
  const adapter = new WahooProviderAdapter(config, { fetch: fetcher });

  assert.deepEqual(await adapter.getAccount({
    accessToken: "access-token",
    scopes: ["user_read"],
  }), {
    providerUserId: "60462",
    displayName: "Test Athlete",
  });
});

test("normalizes the Wahoo athlete profile without requiring the email scope", async () => {
  const adapter = new WahooProviderAdapter(config, {
    fetch: async () => Response.json({
      id: 60462,
      first: "Test",
      last: "Athlete",
      height: "1.85",
      weight: "94.0",
      birth: "1992-05-03",
      gender: 0,
      created_at: "2025-08-13T08:00:00.000Z",
      updated_at: "2026-08-13T08:00:00.000Z",
    }),
  });

  const profile = await adapter.getProfile({
    accessToken: "access-token",
    scopes: ["user_read"],
  });

  assert.equal(profile.providerUserId, "60462");
  assert.equal(profile.displayName, "Test Athlete");
  assert.equal(profile.heightMeters, 1.85);
  assert.equal(profile.weightKilograms, 94);
  assert.equal(profile.birthDate, "1992-05-03");
  assert.equal(profile.genderCode, 0);
  assert.equal(profile.providerUpdatedAt?.toISOString(), "2026-08-13T08:00:00.000Z");
  assert.equal("email" in profile.rawData, false);
});

test("loads and normalizes completed Wahoo workouts", async () => {
  let requestUrl: URL | undefined;
  const adapter = new WahooProviderAdapter(config, {
    fetch: async (input) => {
      requestUrl = new URL(input.toString());
      return Response.json({
        workouts: [
          {
            id: 56519,
            starts: "2026-08-12T09:00:00.000Z",
            minutes: 45,
            name: "Morning Run",
            workout_type_id: 1,
            created_at: "2026-08-12T10:00:00.000Z",
            updated_at: "2026-08-12T10:05:00.000Z",
            workout_summary: {
              distance_accum: "7025.5",
              duration_active_accum: "2680.0",
              duration_paused_accum: "20.0",
              duration_total_accum: "2700.0",
              heart_rate_avg: "148.0",
              cadence_avg: "172.0",
              calories_accum: "612.0",
              speed_avg: "2.62",
              ascent_accum: "54.0",
              time_zone: "Europe/Warsaw",
              manual: false,
              edited: true,
              fitness_app_id: 6,
            },
          },
          {
            id: 56520,
            starts: "2026-08-14T09:00:00.000Z",
            minutes: 30,
            name: "Planned Run",
            workout_type_id: 1,
            workout_summary: null,
          },
        ],
        total: 2,
        page: 1,
        per_page: 30,
      });
    },
  });

  const page = await adapter.listActivities({
    accessToken: "access-token",
    scopes: ["workouts_read"],
  });

  assert.equal(requestUrl?.searchParams.get("page"), "1");
  assert.equal(requestUrl?.searchParams.get("per_page"), "30");
  assert.equal(page.total, 2);
  assert.equal(page.activities.length, 1);
  assert.deepEqual(page.activities[0], {
    providerActivityId: "56519",
    name: "Morning Run",
    activityTypeId: "1",
    activityTypeName: "Running",
    startedAt: new Date("2026-08-12T09:00:00.000Z"),
    durationSeconds: 2700,
    activeDurationSeconds: 2680,
    pausedDurationSeconds: 20,
    distanceMeters: 7025.5,
    elevationGainMeters: 54,
    caloriesKilocalories: 612,
    averageHeartRateBpm: 148,
    averageCadenceRpm: 172,
    averageSpeedMetersPerSecond: 2.62,
    timeZone: "Europe/Warsaw",
    isManual: false,
    isEdited: true,
    sourceAppId: "6",
    providerCreatedAt: new Date("2026-08-12T10:00:00.000Z"),
    providerUpdatedAt: new Date("2026-08-12T10:05:00.000Z"),
    rawData: page.activities[0]?.rawData,
  });
});

test("refreshes Wahoo tokens using the rotating refresh token", async () => {
  const fetcher: typeof fetch = async (_input, init) => {
    const body = init?.body as URLSearchParams;
    assert.equal(body.get("grant_type"), "refresh_token");
    assert.equal(body.get("refresh_token"), "old-refresh-token");
    return Response.json({
      access_token: "new-access-token",
      refresh_token: "new-refresh-token",
      expires_in: 7200,
    });
  };
  const adapter = new WahooProviderAdapter(config, { fetch: fetcher, clock: () => 0 });

  const tokens = await adapter.refreshTokens({
    accessToken: "old-access-token",
    refreshToken: "old-refresh-token",
    scopes: ["user_read", "workouts_read", "offline_data"],
  });

  assert.equal(tokens.accessToken, "new-access-token");
  assert.equal(tokens.refreshToken, "new-refresh-token");
});

test("returns a safe error without exposing Wahoo response bodies", async () => {
  const adapter = new WahooProviderAdapter(config, {
    fetch: async () => new Response("provider details", { status: 401 }),
  });

  await assert.rejects(
    adapter.exchangeAuthorizationCode({ code: "bad-code", redirectUri }),
    (error: unknown) => error instanceof WahooApiError
      && error.status === 401
      && !error.message.includes("provider details"),
  );
});

test("revokes Wahoo permissions with the authenticated access token", async () => {
  let requestUrl: URL | undefined;
  let requestInit: RequestInit | undefined;
  const adapter = new WahooProviderAdapter(config, {
    fetch: async (input, init) => {
      requestUrl = new URL(input.toString());
      requestInit = init;
      return new Response(null, { status: 204 });
    },
  });

  await adapter.revokeAccess({
    accessToken: "access-token",
    scopes: ["user_read"],
  });

  assert.equal(requestUrl?.toString(), "https://api.wahooligan.com/v1/permissions");
  assert.equal(requestInit?.method, "DELETE");
  assert.deepEqual(requestInit?.headers, { Authorization: "Bearer access-token" });
});
