import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { getProviderConnectionSummary } from "@/lib/integrations/connections";
import { getProviderDataSummary } from "@/lib/integrations/provider-data";
import { isWahooWebhookConfigured } from "@/lib/integrations/wahoo/config";

export const metadata = { title: "Connections" };

function syncTime(value: Date): string {
  return `${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(value)} UTC`;
}

export default async function ConnectionsPage() {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const user = await requireAuthUser();
  const [connectionResult, dataResult] = await Promise.allSettled([
    getProviderConnectionSummary(user.id, "wahoo"),
    getProviderDataSummary(user.id, "wahoo"),
  ]);
  const connection = connectionResult.status === "fulfilled" ? connectionResult.value : null;
  const data = dataResult.status === "fulfilled" ? dataResult.value : null;
  const storageReady = connectionResult.status === "fulfilled";
  const connected = connection?.status === "connected";

  return <div className="dashboard-content">
    <header className="dashboard-hero compact"><div><p className="section-index">CONNECTIONS</p><h1>Your sources.</h1></div><p>Connected sources contribute dated facts to your TRAPEAK history. Missing measurements stay missing—they are never replaced with estimates.</p></header>
    <section className="connection-card">
      <div className="connection-identity"><span className={`connection-dot ${connected ? "connected" : ""}`} /><div><small>AVAILABLE NOW</small><h2>Wahoo</h2></div><b>{connected ? "CONNECTED" : connection?.status === "reconnect_required" ? "RECONNECT" : "NOT CONNECTED"}</b></div>
      <div className="connection-details">
        {connected ? <><p>Connected as <b>{connection.displayName ?? `Wahoo user ${connection.providerUserId}`}</b>.</p><dl><div><dt>Stored workouts</dt><dd>{data?.storedActivityCount ?? "—"}</dd></div><div><dt>Last synchronization</dt><dd>{data ? syncTime(data.lastSyncedAt) : "Not available"}</dd></div><div><dt>Automatic updates</dt><dd>{isWahooWebhookConfigured() ? "Enabled" : "Manual synchronization"}</dd></div></dl><div className="connection-actions"><form action="/api/integrations/wahoo/sync" method="post"><button className="button black" type="submit">Sync Wahoo data</button></form><form action="/api/integrations/wahoo/disconnect" method="post"><button className="button outline" type="submit">Disconnect</button></form></div></> : <><p>{connection?.status === "reconnect_required" ? "Wahoo access expired. Reconnect to restore workout synchronization." : "Import authorized completed workouts into your personal TRAPEAK history."}</p>{storageReady ? <a className="button black" href="/api/integrations/wahoo/connect">{connection?.status === "reconnect_required" ? "Reconnect Wahoo" : "Connect Wahoo"}</a> : <p className="panel-empty">Integration storage is not configured.</p>}</>}
      </div>
    </section>
    <section className="planned-sources"><p className="section-index">SOURCE ROADMAP</p><div><article><b>Garmin</b><span>Planned · pending provider approval</span></article><article><b>Sleep, HRV and recovery</b><span>No supported source yet</span></article></div></section>
  </div>;
}
