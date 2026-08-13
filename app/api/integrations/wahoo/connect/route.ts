import { cookies } from "next/headers";

import { getAuthUser } from "@/lib/auth/current-user";
import { readAppUrl } from "@/lib/config/app";
import { createOAuthState } from "@/lib/integrations/oauth-state";
import {
  WAHOO_STATE_COOKIE,
  WAHOO_STATE_COOKIE_PATH,
} from "@/lib/integrations/wahoo/oauth-cookie";
import { getWahooAdapter } from "@/lib/integrations/wahoo/service";
import { readMasterKey } from "@/lib/security/master-key";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appUrl = readAppUrl();
    const callbackUrl = new URL("/api/integrations/wahoo/callback", appUrl);
    const state = createOAuthState(
      { provider: "wahoo", userId: user.id },
      readMasterKey(),
    );
    const authorizationUrl = await getWahooAdapter().createAuthorizationUrl({
      state,
      redirectUri: callbackUrl,
    });

    const cookieStore = await cookies();
    cookieStore.set(WAHOO_STATE_COOKIE, state, {
      httpOnly: true,
      secure: appUrl.protocol === "https:",
      sameSite: "lax",
      path: WAHOO_STATE_COOKIE_PATH,
      maxAge: 10 * 60,
    });

    return Response.redirect(authorizationUrl);
  } catch {
    return Response.json(
      { error: "Wahoo integration is not configured" },
      { status: 503 },
    );
  }
}
