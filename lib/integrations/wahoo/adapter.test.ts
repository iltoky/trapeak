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
