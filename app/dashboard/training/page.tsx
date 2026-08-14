import Link from "next/link";
import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { getTrainingContext } from "@/lib/training-context/data";

export const metadata = { title: "Training" };

function duration(seconds: number | null): string {
  if (seconds === null) return "Duration unavailable";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function distance(meters: number | null): string | null {
  return meters === null ? null : `${(meters / 1000).toFixed(1)} km`;
}

function dateTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value));
}

export default async function TrainingPage() {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const user = await requireAuthUser();
  let context = null;
  try {
    context = await getTrainingContext({ userId: user.id, asOf: new Date(), utcOffsetMinutes: 0, historyDays: 28 });
  } catch {
    // Render the category boundary even when its storage is unavailable.
  }
  const current = context?.loadWindows.find(({ label }) => label === "last7Days") ?? null;
  const previous = context?.loadWindows.find(({ label }) => label === "previous7Days") ?? null;

  return <div className="dashboard-content">
    <header className="dashboard-hero compact">
      <div><p className="section-index">TRAINING</p><h1>Workouts and<br />load context.</h1></div>
      <p>Completed sessions, recent patterns and source coverage. TRAPEAK supplies context—not a readiness score or an automatic prescription.</p>
    </header>
    {!context ? <section className="data-panel empty-panel"><h2>Training data is not available.</h2><p>Connect Wahoo or finish configuring storage, then return here.</p><Link className="button black" href="/dashboard/connections">Open connections</Link></section> : <>
      <section className="metric-grid" aria-label="Training summary">
        <article><small>LAST 7 DAYS</small><strong>{current?.activityCount ?? 0}</strong><span>activities</span></article>
        <article><small>TRAINING TIME</small><strong>{duration(current?.durationSeconds ?? 0)}</strong><span>last 7 days</span></article>
        <article><small>PREVIOUS 7 DAYS</small><strong>{previous?.activityCount ?? 0}</strong><span>activities</span></article>
        <article><small>CONSECUTIVE DAYS</small><strong>{context.sequence.consecutiveTrainingDays}</strong><span>training days</span></article>
      </section>
      <section className="data-panel">
        <div className="panel-heading"><div><p className="section-index">RECENT HISTORY</p><h2>Completed workouts.</h2></div><span>{context.recentActivities.length} in the last 28 days</span></div>
        {context.recentActivities.length === 0 ? <p className="panel-empty">No completed workouts stored for this period.</p> : <div className="record-list">{context.recentActivities.map((activity) => <article key={activity.id}>
          <time>{dateTime(activity.startedAt)}</time>
          <div><b>{activity.name ?? activity.activityTypeName ?? "Workout"}</b><small>{activity.provider.toUpperCase()} · {activity.activityTypeName ?? "Activity"}</small></div>
          <p>{[duration(activity.durationSeconds), distance(activity.distanceMeters), activity.trainingStressScore !== null ? `TSS ${activity.trainingStressScore}` : null].filter(Boolean).join(" · ")}</p>
        </article>)}</div>}
      </section>
      <section className="context-callout"><div><small>ASK AN AI</small><p>“Compare my last two weeks and suggest the purpose of today&apos;s session. Ask for a current check-in before making a recommendation.”</p></div><Link href="/use-cases/ai-workout-recommendations">Read the guide →</Link></section>
      <section className="coverage-panel"><div><p className="section-index">SOURCE COVERAGE</p><h2>Known limitations.</h2></div><ul>{context.dataAvailability.limitations.map((item) => <li key={item}>{item}</li>)}</ul></section>
    </>}
  </div>;
}
