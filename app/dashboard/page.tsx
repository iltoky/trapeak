import Link from "next/link";
import { redirect } from "next/navigation";

import { listOwnedDataAccessGrants } from "@/lib/access/data";
import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { getProviderConnectionSummary } from "@/lib/integrations/connections";
import { getProviderDataSummary } from "@/lib/integrations/provider-data";
import { listLabReports } from "@/lib/labs/data";
import { getTrainingContext } from "@/lib/training-context/data";
import { getRequestLocale } from "@/lib/i18n/server";
import { getUiMessages, interpolate } from "@/lib/i18n/ui";
import type { AppLocale } from "@/lib/i18n/config";

function valueOf<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}

function compactDate(value: string, locale: AppLocale): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(value));
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default async function DashboardPage({ searchParams }: {
  searchParams: Promise<{ wahoo?: string; received?: string; created?: string; updated?: string }>;
}) {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const user = await requireAuthUser();
  const locale = await getRequestLocale();
  const messages = getUiMessages(locale);
  const m = messages.dashboard;
  const notices: Readonly<Record<string, string>> = { connected: messages.status.connected, disconnected: messages.status.disconnected, denied: messages.status.denied, invalid_state: messages.status.invalidState, already_linked: messages.status.alreadyLinked, error: messages.status.error, disconnect_error: messages.status.disconnectError, not_connected: messages.status.notConnected, reconnect_required: messages.status.reconnectRequired, sync_error: messages.status.syncError };
  const now = new Date();
  const [contextResult, labsResult, connectionResult, dataResult, grantsResult] = await Promise.allSettled([
    getTrainingContext({ userId: user.id, asOf: now, utcOffsetMinutes: 0, historyDays: 28 }),
    listLabReports({ userId: user.id, limit: 1 }),
    getProviderConnectionSummary(user.id, "wahoo"),
    getProviderDataSummary(user.id, "wahoo"),
    listOwnedDataAccessGrants(user.id),
  ]);
  const context = valueOf(contextResult);
  const labs = valueOf(labsResult);
  const connection = valueOf(connectionResult);
  const data = valueOf(dataResult);
  const grants = valueOf(grantsResult);
  const latestWorkout = context?.recentActivities[0] ?? null;
  const last7 = context?.loadWindows.find(({ label }) => label === "last7Days") ?? null;
  const todayNutrition = context?.nutrition.today ?? null;
  const latestLab = labs?.[0] ?? null;
  const activeGrantCount = grants?.filter(({ status, expiresAt }) =>
    (status === "active" || status === "pending") && Date.parse(expiresAt) > now.getTime(),
  ).length ?? 0;
  const params = await searchParams;
  const notice = params.wahoo === "synced"
    ? interpolate(messages.status.syncSuccess, { received: Number(params.received) || 0, created: Number(params.created) || 0, updated: Number(params.updated) || 0 })
    : params.wahoo ? notices[params.wahoo] : null;

  return <div className="dashboard-content">
    <header className="dashboard-hero">
      <div><p className="section-index">{m.overview}</p><h1>{m.title}</h1></div>
      <p>{m.intro}</p>
    </header>
    {notice ? <p className="dashboard-notice" role="status">{notice}</p> : null}

    <section className="summary-grid" aria-label={m.dataOverview}>
      <Link href="/dashboard/training" className="summary-card feature-card">
        <small>{messages.nav.training.toUpperCase()}</small><strong>{latestWorkout ? latestWorkout.activityTypeName ?? latestWorkout.name ?? m.workout : m.noWorkouts}</strong>
        <p>{latestWorkout ? `${compactDate(latestWorkout.startedAt, locale)} · ${latestWorkout.durationSeconds ? formatDuration(latestWorkout.durationSeconds) : m.durationUnavailable}` : m.connectWahoo}</p>
        <span>{last7 ? `${last7.activityCount} · ${formatDuration(last7.durationSeconds)} · ${m.activities7}` : m.openTraining}</span>
      </Link>
      <Link href="/dashboard/nutrition" className="summary-card">
        <small>{m.nutritionToday}</small><strong>{todayNutrition ? `${todayNutrition.caloriesKilocalories} kcal` : m.nothingLogged}</strong>
        <p>{todayNutrition ? `${todayNutrition.proteinGrams} g · ${todayNutrition.carbohydratesGrams} g · ${todayNutrition.fatGrams} g` : m.recordFood}</p><span>{m.openNutrition}</span>
      </Link>
      <Link href="/dashboard/health" className="summary-card">
        <small>{messages.nav.health.toUpperCase()}</small><strong>{latestLab ? latestLab.title : m.noLabs}</strong>
        <p>{latestLab ? `${latestLab.resultCount} · ${compactDate(latestLab.collectedAt, locale)}` : m.healthSeparate}</p><span>{m.openHealth}</span>
      </Link>
      <article className="summary-card">
        <small>{m.profileContext}</small><strong>{context ? `${context.dataAvailability.profileCompletenessPercent}%` : messages.common.unavailable}</strong>
        <p>{m.goalsContext}</p><span>{m.updateWithAi}</span>
      </article>
      <Link href="/access" className="summary-card">
        <small>{messages.nav.sharedAccess.toUpperCase()}</small><strong>{activeGrantCount || m.noGrants}</strong>
        <p>{activeGrantCount ? `${activeGrantCount} ${messages.nav.sharedAccess.toLowerCase()}` : m.shareByEmail}</p><span>{m.manageAccess}</span>
      </Link>
      <Link href="/dashboard/connections" className="summary-card">
        <small>{messages.nav.connections.toUpperCase()}</small><strong>{connection?.status === "connected" ? `Wahoo · ${messages.connections.connected}` : connection?.status === "reconnect_required" ? messages.connections.reconnect : m.noWearable}</strong>
        <p>{data ? `${data.storedActivityCount} ${m.workoutsStored}` : m.otherDataWithAi}</p><span>{m.manageConnections}</span>
      </Link>
    </section>

    <section className="dashboard-boundary">
      <div><p className="section-index light">{m.boundaries}</p><h2>{m.boundaryTitle}</h2></div>
      <ol><li><b>01</b><span>{messages.nav.training}</span><p>{m.trainingDescription}</p></li><li><b>02</b><span>{messages.nav.nutrition}</span><p>{m.nutritionDescription}</p></li><li><b>03</b><span>{messages.nav.health}</span><p>{m.healthDescription}</p></li></ol>
    </section>
  </div>;
}
