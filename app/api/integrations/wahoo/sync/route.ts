import { getAuthUser } from "@/lib/auth/current-user";
import { readAppUrl } from "@/lib/config/app";
import {
  WahooNotConnectedError,
  WahooReconnectRequiredError,
} from "@/lib/integrations/wahoo/service";
import { syncWahooData } from "@/lib/integrations/wahoo/sync";

export const dynamic = "force-dynamic";

function dashboardRedirect(
  appUrl: URL,
  result: string,
  count?: number,
): Response {
  const url = new URL("/dashboard", appUrl);
  url.searchParams.set("wahoo", result);
  if (count !== undefined) {
    url.searchParams.set("count", String(count));
  }
  return Response.redirect(url, 303);
}

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
    const result = await syncWahooData(user.id);
    return dashboardRedirect(appUrl, "synced", result.importedCount);
  } catch (error) {
    if (error instanceof WahooNotConnectedError) {
      return dashboardRedirect(appUrl, "not_connected");
    }
    if (error instanceof WahooReconnectRequiredError) {
      return dashboardRedirect(appUrl, "reconnect_required");
    }
    return dashboardRedirect(appUrl, "sync_error");
  }
}
