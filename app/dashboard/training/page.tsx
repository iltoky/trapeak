import Link from "next/link";
import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { getTrainingContext } from "@/lib/training-context/data";
import type { AppLocale } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { getUiMessages } from "@/lib/i18n/ui";

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

function dateTime(value: string, locale: AppLocale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value));
}

export default async function TrainingPage() {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const user = await requireAuthUser();
  const locale = await getRequestLocale();
  const messages = getUiMessages(locale);
  const m = messages.training;
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
      <div><p className="section-index">{messages.nav.training.toUpperCase()}</p><h1>{m.title}</h1></div>
      <p>{m.intro}</p>
    </header>
    {!context ? <section className="data-panel empty-panel"><h2>{m.unavailable}</h2><p>{m.unavailableHint}</p><Link className="button black" href="/dashboard/connections">{m.openConnections}</Link></section> : <>
      <section className="metric-grid" aria-label={messages.nav.training}>
        <article><small>{m.last7}</small><strong>{current?.activityCount ?? 0}</strong><span>{m.activities}</span></article>
        <article><small>{m.trainingTime}</small><strong>{duration(current?.durationSeconds ?? 0)}</strong><span>{m.last7}</span></article>
        <article><small>{m.previous7}</small><strong>{previous?.activityCount ?? 0}</strong><span>{m.activities}</span></article>
        <article><small>{m.consecutive}</small><strong>{context.sequence.consecutiveTrainingDays}</strong><span>{m.days}</span></article>
      </section>
      <section className="data-panel">
        <div className="panel-heading"><div><p className="section-index">{m.recent}</p><h2>{m.completed}</h2></div><span>{context.recentActivities.length} {m.in28}</span></div>
        {context.recentActivities.length === 0 ? <p className="panel-empty">{m.noCompleted}</p> : <div className="record-list">{context.recentActivities.map((activity) => <article key={activity.id}>
          <time>{dateTime(activity.startedAt, locale)}</time>
          <div><b>{activity.name ?? activity.activityTypeName ?? messages.dashboard.workout}</b><small>{activity.provider.toUpperCase()} · {activity.activityTypeName ?? m.activity}</small></div>
          <p>{[duration(activity.durationSeconds), distance(activity.distanceMeters), activity.trainingStressScore !== null ? `TSS ${activity.trainingStressScore}` : null].filter(Boolean).join(" · ")}</p>
        </article>)}</div>}
      </section>
      <section className="context-callout"><div><small>{m.askAi}</small><p>“{m.prompt}”</p></div><Link href="/use-cases/ai-workout-recommendations">{messages.common.readGuide}</Link></section>
      <section className="coverage-panel"><div><p className="section-index">{m.coverage}</p><h2>{m.limitations}</h2></div><ul>{context.dataAvailability.limitations.map((item) => <li key={item}>{item}</li>)}</ul></section>
    </>}
  </div>;
}
