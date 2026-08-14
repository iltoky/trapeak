import Link from "next/link";
import { redirect } from "next/navigation";

import { listOwnedDataAccessGrants } from "@/lib/access/data";
import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { getProviderConnectionSummary } from "@/lib/integrations/connections";
import { getProviderDataSummary } from "@/lib/integrations/provider-data";
import { listLabReports } from "@/lib/labs/data";
import { getTrainingContext } from "@/lib/training-context/data";

const notices: Readonly<Record<string, string>> = {
  connected: "Wahoo connected successfully.",
  disconnected: "Wahoo disconnected.",
  denied: "Wahoo authorization was cancelled.",
  invalid_state: "The connection request expired. Please try again.",
  already_linked: "This Wahoo account is already linked to another TRAPEAK account.",
  error: "Wahoo could not be connected. Please try again.",
  disconnect_error: "Wahoo could not be disconnected. Please try again.",
  not_connected: "Connect Wahoo before synchronizing workout data.",
  reconnect_required: "Wahoo access expired. Reconnect to continue syncing.",
  sync_error: "Wahoo data could not be synchronized. Please try again.",
};

function valueOf<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}

function compactDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(value));
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
    ? `Wahoo synchronized: ${Number(params.received) || 0} received, ${Number(params.created) || 0} new, ${Number(params.updated) || 0} updated.`
    : params.wahoo ? notices[params.wahoo] : null;

  return <div className="dashboard-content">
    <header className="dashboard-hero">
      <div><p className="section-index">OVERVIEW</p><h1>Your data,<br />organized.</h1></div>
      <p>See the context that a connected AI—or a person you authorize—can use. Detailed records stay inside their own category.</p>
    </header>
    {notice ? <p className="dashboard-notice" role="status">{notice}</p> : null}

    <section className="summary-grid" aria-label="Data overview">
      <Link href="/dashboard/training" className="summary-card feature-card">
        <small>TRAINING</small><strong>{latestWorkout ? latestWorkout.activityTypeName ?? latestWorkout.name ?? "Workout" : "No workouts"}</strong>
        <p>{latestWorkout ? `${compactDate(latestWorkout.startedAt)} · ${latestWorkout.durationSeconds ? formatDuration(latestWorkout.durationSeconds) : "duration unavailable"}` : "Connect Wahoo to start a structured training history."}</p>
        <span>{last7 ? `${last7.activityCount} activities · ${formatDuration(last7.durationSeconds)} in 7 days` : "Open training →"}</span>
      </Link>
      <Link href="/dashboard/nutrition" className="summary-card">
        <small>NUTRITION · TODAY</small><strong>{todayNutrition ? `${todayNutrition.caloriesKilocalories} kcal` : "Nothing logged"}</strong>
        <p>{todayNutrition ? `${todayNutrition.proteinGrams} g protein · ${todayNutrition.carbohydratesGrams} g carbs · ${todayNutrition.fatGrams} g fat` : "Record food by voice or text through your connected AI."}</p><span>Open nutrition →</span>
      </Link>
      <Link href="/dashboard/health" className="summary-card">
        <small>HEALTH</small><strong>{latestLab ? latestLab.title : "No lab reports"}</strong>
        <p>{latestLab ? `${latestLab.resultCount} stored results · ${compactDate(latestLab.collectedAt)}` : "Health stays separate from training and nutrition access."}</p><span>Open health →</span>
      </Link>
      <article className="summary-card">
        <small>PROFILE CONTEXT</small><strong>{context ? `${context.dataAvailability.profileCompletenessPercent}%` : "Unavailable"}</strong>
        <p>Goals, constraints and preferences make later AI analysis more relevant.</p><span>Update through your connected AI</span>
      </article>
      <Link href="/access" className="summary-card">
        <small>SHARED ACCESS</small><strong>{activeGrantCount || "No active grants"}</strong>
        <p>{activeGrantCount ? `${activeGrantCount} current invitation${activeGrantCount === 1 ? "" : "s"} or grant${activeGrantCount === 1 ? "" : "s"}.` : "Share selected categories by email, with an expiry."}</p><span>Manage access →</span>
      </Link>
      <Link href="/dashboard/connections" className="summary-card">
        <small>CONNECTIONS</small><strong>{connection?.status === "connected" ? "Wahoo connected" : connection?.status === "reconnect_required" ? "Reconnect Wahoo" : "No wearable"}</strong>
        <p>{data ? `${data.storedActivityCount} workouts stored.` : "Nutrition, weight, profile and labs can still be saved through AI."}</p><span>Manage connections →</span>
      </Link>
    </section>

    <section className="dashboard-boundary">
      <div><p className="section-index light">DATA BOUNDARIES</p><h2>Three categories.<br />No hidden bundle.</h2></div>
      <ol><li><b>01</b><span>Training</span><p>Workouts, training load, goals and practical training constraints.</p></li><li><b>02</b><span>Nutrition</span><p>Meals, macros, dietary context and dated weight history.</p></li><li><b>03</b><span>Health</span><p>Laboratory results, conditions, injuries, contraindications and medications.</p></li></ol>
    </section>
  </div>;
}
