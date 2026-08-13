import { getAuthUser } from "@/lib/auth/current-user";
import { readAppUrl } from "@/lib/config/app";
import {
  getProviderTokens,
  markProviderDisconnected,
} from "@/lib/integrations/connections";
import { getWahooAdapter } from "@/lib/integrations/wahoo/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin || requestOrigin !== appUrl.origin) {
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  }

  try {
    const tokens = await getProviderTokens(user.id, "wahoo");
    if (tokens) {
      await getWahooAdapter().revokeAccess(tokens);
      await markProviderDisconnected(user.id, "wahoo");
    }
  } catch {
    const errorUrl = new URL("/dashboard", appUrl);
    errorUrl.searchParams.set("wahoo", "disconnect_error");
    return Response.redirect(errorUrl);
  }

  const successUrl = new URL("/dashboard", appUrl);
  successUrl.searchParams.set("wahoo", "disconnected");
  return Response.redirect(successUrl, 303);
}
