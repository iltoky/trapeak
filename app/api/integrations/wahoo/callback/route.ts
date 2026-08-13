import { cookies } from "next/headers";

import { getAuthUser } from "@/lib/auth/current-user";
import { readAppUrl } from "@/lib/config/app";
import {
  matchesOAuthStateCookie,
  verifyOAuthState,
} from "@/lib/integrations/oauth-state";
import {
  ProviderAccountAlreadyLinkedError,
  saveProviderConnection,
} from "@/lib/integrations/connections";
import { getWahooAdapter } from "@/lib/integrations/wahoo/service";
import {
  WAHOO_STATE_COOKIE,
  WAHOO_STATE_COOKIE_PATH,
} from "@/lib/integrations/wahoo/oauth-cookie";
import { readMasterKey } from "@/lib/security/master-key";

export const dynamic = "force-dynamic";

function dashboardRedirect(appUrl: URL, result: string): Response {
  const url = new URL("/dashboard", appUrl);
  url.searchParams.set("wahoo", result);
  return Response.redirect(url);
}

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let appUrl: URL;
  try {
    appUrl = readAppUrl();
  } catch {
    return Response.json(
      { error: "Wahoo integration is not configured" },
      { status: 503 },
    );
  }

  const requestUrl = new URL(request.url);
  const cookieStore = await cookies();
  const cookieState = cookieStore.get(WAHOO_STATE_COOKIE)?.value;
  cookieStore.set(WAHOO_STATE_COOKIE, "", {
    httpOnly: true,
    secure: appUrl.protocol === "https:",
    sameSite: "lax",
    path: WAHOO_STATE_COOKIE_PATH,
    maxAge: 0,
  });

  if (requestUrl.searchParams.has("error")) {
    return dashboardRedirect(appUrl, "denied");
  }

  const state = requestUrl.searchParams.get("state");
  const code = requestUrl.searchParams.get("code");
  if (!state || !code || !matchesOAuthStateCookie(state, cookieState)) {
    return dashboardRedirect(appUrl, "invalid_state");
  }

  try {
    verifyOAuthState(
      state,
      { provider: "wahoo", userId: user.id },
      readMasterKey(),
    );
    const callbackUrl = new URL("/api/integrations/wahoo/callback", appUrl);
    const adapter = getWahooAdapter();
    const tokens = await adapter.exchangeAuthorizationCode({
      code,
      redirectUri: callbackUrl,
    });
    const account = await adapter.getAccount(tokens);
    await saveProviderConnection({
      userId: user.id,
      provider: "wahoo",
      account,
      tokens,
    });
    return dashboardRedirect(appUrl, "connected");
  } catch (error) {
    if (error instanceof ProviderAccountAlreadyLinkedError) {
      return dashboardRedirect(appUrl, "already_linked");
    }
    return dashboardRedirect(appUrl, "error");
  }
}
