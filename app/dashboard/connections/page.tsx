import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { getProviderConnectionSummary } from "@/lib/integrations/connections";
import { getProviderDataSummary } from "@/lib/integrations/provider-data";
import { isWahooWebhookConfigured } from "@/lib/integrations/wahoo/config";
import type { AppLocale } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { getUiMessages } from "@/lib/i18n/ui";

export const metadata = { title: "Connections" };

function syncTime(value: Date, locale: AppLocale): string {
  return `${new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(value)} UTC`;
}

export default async function ConnectionsPage() {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const user = await requireAuthUser();
  const locale = await getRequestLocale();
  const messages = getUiMessages(locale);
  const m = messages.connections;
  const [connectionResult, dataResult] = await Promise.allSettled([
    getProviderConnectionSummary(user.id, "wahoo"),
    getProviderDataSummary(user.id, "wahoo"),
  ]);
  const connection = connectionResult.status === "fulfilled" ? connectionResult.value : null;
  const data = dataResult.status === "fulfilled" ? dataResult.value : null;
  const storageReady = connectionResult.status === "fulfilled";
  const connected = connection?.status === "connected";

  return <div className="dashboard-content">
    <header className="dashboard-hero compact"><div><p className="section-index">{messages.nav.connections.toUpperCase()}</p><h1>{m.title}</h1></div><p>{m.intro}</p></header>
    <section className="connection-card">
      <div className="connection-identity"><span className={`connection-dot ${connected ? "connected" : ""}`} /><div><small>{m.available}</small><h2>Wahoo</h2></div><b>{connected ? m.connected : connection?.status === "reconnect_required" ? m.reconnect : m.notConnected}</b></div>
      <div className="connection-details">
        {connected ? <><p>{m.connectedAs} <b>{connection.displayName ?? `Wahoo · ${connection.providerUserId}`}</b>.</p><dl><div><dt>{m.storedWorkouts}</dt><dd>{data?.storedActivityCount ?? "—"}</dd></div><div><dt>{m.lastSync}</dt><dd>{data ? syncTime(data.lastSyncedAt, locale) : m.notAvailable}</dd></div><div><dt>{m.automatic}</dt><dd>{isWahooWebhookConfigured() ? m.enabled : m.manual}</dd></div></dl><div className="connection-actions"><form action="/api/integrations/wahoo/sync" method="post"><button className="button black" type="submit">{m.sync}</button></form><form action="/api/integrations/wahoo/disconnect" method="post"><button className="button outline" type="submit">{m.disconnect}</button></form></div></> : <><p>{connection?.status === "reconnect_required" ? m.expired : m.import}</p>{storageReady ? <a className="button black" href="/api/integrations/wahoo/connect">{connection?.status === "reconnect_required" ? m.reconnect : m.connect}</a> : <p className="panel-empty">{m.storageMissing}</p>}</>}
      </div>
    </section>
    <section className="planned-sources"><p className="section-index">{m.roadmap}</p><div><article><b>Garmin</b><span>{m.planned}</span></article><article><b>Sleep · HRV · Recovery</b><span>{m.noRecovery}</span></article></div></section>
  </div>;
}
