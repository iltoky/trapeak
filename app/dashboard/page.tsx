import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { getProviderConnectionSummary } from "@/lib/integrations/connections";
import { getProviderDataSummary } from "@/lib/integrations/provider-data";
import { SiteHeader } from "../site-header";

export const metadata = { title: "Account" };

const wahooMessages: Readonly<Record<string, string>> = {
  connected: "Wahoo connected successfully.",
  disconnected: "Wahoo disconnected.",
  denied: "Wahoo authorization was cancelled.",
  invalid_state: "The connection request expired. Please try again.",
  already_linked: "This Wahoo account is already linked to another TRAPEAK account.",
  error: "Wahoo could not be connected. Please try again.",
  disconnect_error: "Wahoo could not be disconnected. Please try again.",
  not_connected: "Connect Wahoo before synchronizing workout data.",
  reconnect_required: "Wahoo access expired. Reconnect Wahoo to continue syncing.",
  sync_error: "Wahoo data could not be synchronized. Please try again.",
};

function formatSyncTime(value: Date): string {
  return `${new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value)} UTC`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    wahoo?: string;
    received?: string;
    created?: string;
    updated?: string;
  }>;
}) {
  if (!isAuthConfigured()) {
    redirect("/sign-in?setup=required");
  }

  const user = await requireAuthUser();
  const {
    wahoo: result,
    received,
    created,
    updated,
  } = await searchParams;
  let storageReady = true;
  let connection = null;
  try {
    connection = await getProviderConnectionSummary(user.id, "wahoo");
  } catch {
    storageReady = false;
  }
  let dataStorageReady = true;
  let dataSummary = null;
  if (connection?.status === "connected") {
    try {
      dataSummary = await getProviderDataSummary(user.id, "wahoo");
    } catch {
      dataStorageReady = false;
    }
  }
  const notice = result === "synced"
    ? `Wahoo synchronized successfully. ${Number(received) || 0} received; ${Number(created) || 0} new; ${Number(updated) || 0} updated; ${dataSummary?.storedActivityCount ?? 0} stored.`
    : result
      ? wahooMessages[result]
      : undefined;

  return (
    <main className="account-page">
      <SiteHeader />
      <section className="account shell">
        <div>
          <p className="section-index">YOUR ACCOUNT</p>
          <h1>Connections.</h1>
          <p>
            Signed in as {user.email ?? "a verified TRAPEAK user"}.
          </p>
        </div>
        <UserButton />
        {notice ? (
          <p className="account-notice" role="status">
            {notice}
          </p>
        ) : null}
        <div className="account-empty">
          <span>01</span>
          <div>
            <h2>
              {connection?.status === "connected"
                ? "Wahoo connected"
                : connection?.status === "reconnect_required"
                  ? "Reconnect Wahoo"
                  : "Connect Wahoo"}
            </h2>
            {connection?.status === "connected" ? (
              <>
                <p>
                  Connected as {connection.displayName ?? `Wahoo user ${connection.providerUserId}`}.
                </p>
                {dataSummary ? (
                  <p className="account-sync-status">
                    {dataSummary.storedActivityCount} completed workouts stored.
                    Last sync: {formatSyncTime(dataSummary.lastSyncedAt)}.
                  </p>
                ) : null}
                {dataStorageReady ? (
                  <form action="/api/integrations/wahoo/sync" method="post">
                    <button className="button black" type="submit">
                      Sync Wahoo data
                    </button>
                  </form>
                ) : (
                  <p className="account-setup">
                    Workout sync storage is not configured yet.
                  </p>
                )}
                <form action="/api/integrations/wahoo/disconnect" method="post">
                  <button className="button black" type="submit">
                    Disconnect Wahoo
                  </button>
                </form>
              </>
            ) : (
              <>
                <p>
                  {connection?.status === "reconnect_required"
                    ? "Reconnect to restore workout synchronization."
                    : "Import authorized workout data from Wahoo for MCP-compatible AI assistants."}
                </p>
                {storageReady ? (
                  <a className="button black" href="/api/integrations/wahoo/connect">
                    Connect Wahoo
                  </a>
                ) : (
                  <p className="account-setup">Integration storage is not configured yet.</p>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
