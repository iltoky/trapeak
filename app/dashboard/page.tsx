import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { getProviderConnectionSummary } from "@/lib/integrations/connections";
import { getProviderDataSummary } from "@/lib/integrations/provider-data";
import { isWahooWebhookConfigured } from "@/lib/integrations/wahoo/config";
import { listLabReports, type LabReportSummary } from "@/lib/labs/data";
import {
  getNutritionDaySummaries,
  listNutritionEntries,
  type NutritionDaySummary,
  type NutritionEntry,
} from "@/lib/nutrition/data";
import { SiteHeader } from "../site-header";
import { DeleteForm } from "./delete-form";

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

const nutritionMessages: Readonly<Record<string, string>> = {
  created: "Nutrition entry saved.",
  deleted: "Nutrition entry deleted.",
  not_found: "Nutrition entry was not found or was already deleted.",
  invalid: "Check the nutrition fields and try again.",
  storage_error: "Nutrition storage is not available yet.",
};

const labMessages: Readonly<Record<string, string>> = {
  deleted: "Laboratory report and its results were deleted.",
  not_found: "Laboratory report was not found or was already deleted.",
  storage_error: "Laboratory storage is not available yet.",
};

function formatSyncTime(value: Date): string {
  return `${new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value)} UTC`;
}

function formatRecordTime(value: string): string {
  return `${new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value))} UTC`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    wahoo?: string;
    received?: string;
    created?: string;
    updated?: string;
    nutrition?: string;
    labs?: string;
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
    nutrition,
    labs,
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
  const automaticSyncEnabled = isWahooWebhookConfigured();
  const today = new Date().toISOString().slice(0, 10);
  let nutritionStorageReady = true;
  let nutritionEntries: readonly NutritionEntry[] | null = null;
  let todayNutrition: NutritionDaySummary | null = null;
  let labStorageReady = true;
  let labReports: readonly LabReportSummary[] | null = null;
  const [nutritionResult, labResult] = await Promise.allSettled([
    Promise.all([
      listNutritionEntries({ userId: user.id, limit: 10 }),
      getNutritionDaySummaries({ userId: user.id, from: today, to: today }),
    ]),
    listLabReports({ userId: user.id, limit: 10 }),
  ]);
  if (nutritionResult.status === "fulfilled") {
    nutritionEntries = nutritionResult.value[0];
    todayNutrition = nutritionResult.value[1][0] ?? null;
  } else {
    nutritionStorageReady = false;
  }
  if (labResult.status === "fulfilled") {
    labReports = labResult.value;
  } else {
    labStorageReady = false;
  }
  const nutritionNotice = nutrition ? nutritionMessages[nutrition] : undefined;
  const labNotice = labs ? labMessages[labs] : undefined;
  const accountNotice = labNotice ?? nutritionNotice ?? notice;

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
        {accountNotice ? (
          <p className="account-notice" role="status">
            {accountNotice}
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
                    {automaticSyncEnabled ? " New completed workouts sync automatically." : ""}
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
        <div className="account-empty nutrition-section">
          <span>02</span>
          <div>
            <h2>Nutrition</h2>
            <p>
              Ask your connected AI assistant to calculate and save meals. TRAPEAK keeps the description, total calories, macros, and estimation assumptions.
            </p>
            {nutritionStorageReady ? (
              <>
                {todayNutrition ? (
                  <div className="nutrition-summary" aria-label="Today's nutrition totals">
                    <b>{todayNutrition.caloriesKilocalories} kcal</b>
                    <span>{todayNutrition.proteinGrams} g protein</span>
                    <span>{todayNutrition.carbohydratesGrams} g carbs</span>
                    <span>{todayNutrition.fatGrams} g fat</span>
                  </div>
                ) : (
                  <p className="account-sync-status">No meals logged today.</p>
                )}
                <p className="account-sync-status">
                  Example: “Save breakfast: 2 eggs, 2 sausages and an avocado.”
                </p>
                {nutritionEntries && nutritionEntries.length > 0 ? (
                  <div className="nutrition-list">
                    <h3>Recent entries</h3>
                    {nutritionEntries.map((entry) => (
                      <article key={entry.id}>
                        <div>
                          <b>{entry.description}</b>
                          <small>{entry.mealType} · {formatRecordTime(entry.consumedAt)}</small>
                          <span>
                            {entry.caloriesKilocalories} kcal · P {entry.proteinGrams} g · C {entry.carbohydratesGrams} g · F {entry.fatGrams} g
                          </span>
                          {entry.estimated && entry.estimationNotes ? (
                            <small>Estimated: {entry.estimationNotes}</small>
                          ) : null}
                        </div>
                        <DeleteForm
                          action={`/api/nutrition/${entry.id}/delete`}
                          confirmation={`Permanently delete “${entry.description}”?`}
                        />
                      </article>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="account-setup">Run the Nutrition database migration to enable meal logging.</p>
            )}
          </div>
        </div>
        <div className="account-empty nutrition-section">
          <span>03</span>
          <div>
            <h2>Laboratory reports</h2>
            <p>
              Ask your connected AI assistant to save structured laboratory results. Deleting a report also permanently deletes all indicators stored inside it.
            </p>
            {labStorageReady ? (
              labReports && labReports.length > 0 ? (
                <div className="nutrition-list">
                  <h3>Recent reports</h3>
                  {labReports.map((report) => (
                    <article key={report.id}>
                      <div>
                        <b>{report.title}</b>
                        <small>{report.testType} · {formatRecordTime(report.collectedAt)}</small>
                        <span>
                          {report.resultCount} results
                          {report.laboratory ? ` · ${report.laboratory}` : ""}
                        </span>
                      </div>
                      <DeleteForm
                        action={`/api/labs/${report.id}/delete`}
                        confirmation={`Permanently delete “${report.title}” and all ${report.resultCount} stored results?`}
                      />
                    </article>
                  ))}
                </div>
              ) : (
                <p className="account-sync-status">No laboratory reports stored yet.</p>
              )
            ) : (
              <p className="account-setup">Run the Labs database migration to enable laboratory reports.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
