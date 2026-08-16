import Link from "next/link";
import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { getNutritionDaySummaries, listNutritionEntries, type NutritionEntry } from "@/lib/nutrition/data";
import { getUserProfile } from "@/lib/profile/data";
import type { AppLocale } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { getUiMessages } from "@/lib/i18n/ui";
import { formatWeight } from "@/lib/i18n/format";
import { DeleteForm } from "../delete-form";

export const metadata = { title: "Nutrition" };

function dayKey(value: string): string { return value.slice(0, 10); }
function displayDay(value: string, locale: AppLocale): string { return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
function displayTime(value: string, locale: AppLocale): string { return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date(value)); }

export default async function NutritionPage() {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const user = await requireAuthUser();
  const locale = await getRequestLocale();
  const messages = getUiMessages(locale);
  const m = messages.nutrition;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const from = new Date(now.getTime() - 6 * 86_400_000).toISOString().slice(0, 10);
  const [entriesResult, summariesResult, profileResult] = await Promise.allSettled([
    listNutritionEntries({ userId: user.id, limit: 60 }),
    getNutritionDaySummaries({ userId: user.id, from, to: today }),
    getUserProfile(user.id, now),
  ]);
  const entries = entriesResult.status === "fulfilled" ? entriesResult.value : null;
  const summaries = summariesResult.status === "fulfilled" ? summariesResult.value : [];
  const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
  const measurementSystem = profile?.record?.profile.measurementSystem ?? "metric";
  const summaryByDay = new Map(summaries.map((summary) => [summary.date, summary]));
  const grouped = new Map<string, NutritionEntry[]>();
  for (const entry of entries ?? []) {
    const date = dayKey(entry.consumedAt);
    grouped.set(date, [...(grouped.get(date) ?? []), entry]);
  }
  const todaySummary = summaryByDay.get(today) ?? null;

  return <div className="dashboard-content">
    <header className="dashboard-hero compact"><div><p className="section-index">{messages.nav.nutrition.toUpperCase()}</p><h1>{m.title}</h1></div><p>{m.intro}</p></header>
    <section className="metric-grid" aria-label={m.summary}>
      <article><small>{m.today}</small><strong>{todaySummary ? `${todaySummary.caloriesKilocalories}` : "—"}</strong><span>{m.kilocalories}</span></article>
      <article><small>{m.protein}</small><strong>{todaySummary ? `${todaySummary.proteinGrams} g` : "—"}</strong><span>{m.today}</span></article>
      <article><small>{m.carbohydrates}</small><strong>{todaySummary ? `${todaySummary.carbohydratesGrams} g` : "—"}</strong><span>{m.today}</span></article>
      <article><small>{m.latestWeight}</small><strong>{profile?.weight.latest ? formatWeight(profile.weight.latest.weightKilograms, locale, measurementSystem) : "—"}</strong><span>{profile?.weight.latest ? displayDay(dayKey(profile.weight.latest.measuredAt), locale) : m.noMeasurement}</span></article>
    </section>
    {entries === null ? <section className="data-panel empty-panel"><h2>{m.unavailable}</h2><p>{m.unavailableHint}</p></section> : <section className="data-panel">
      <div className="panel-heading"><div><p className="section-index">{m.history}</p><h2>{m.byDay}</h2></div><span>{entries.length} {m.recentEntries}</span></div>
      {grouped.size === 0 ? <div className="panel-empty"><p>{m.noRecords}</p><p>{m.example}</p></div> : <div className="day-groups">{[...grouped.entries()].map(([date, dayEntries]) => {
        const summary = summaryByDay.get(date);
        return <details key={date} open={date === today}>
          <summary><div><b>{date === today ? m.today : displayDay(date, locale)}</b><span>{dayEntries.length} {m.entries}</span></div><p>{summary ? `${summary.caloriesKilocalories} kcal · P ${summary.proteinGrams} · C ${summary.carbohydratesGrams} · F ${summary.fatGrams}` : m.openDetails}</p><i aria-hidden="true">+</i></summary>
          <div className="meal-list">{dayEntries.map((entry) => <article key={entry.id}><time>{displayTime(entry.consumedAt, locale)}</time><div><b>{entry.description}</b><small>{entry.mealType}{entry.estimated ? ` · ${m.estimated}` : ""}</small>{entry.estimationNotes ? <p>{m.assumptions}: {entry.estimationNotes}</p> : null}</div><span>{entry.caloriesKilocalories} kcal<br />P {entry.proteinGrams} · C {entry.carbohydratesGrams} · F {entry.fatGrams}</span><DeleteForm action={`/api/nutrition/${entry.id}/delete`} confirmation={m.confirmDelete} label={messages.common.delete} /></article>)}</div>
        </details>;
      })}</div>}
    </section>}
    <section className="context-callout"><div><small>{m.recordNaturally}</small><p>{m.recordHint}</p></div><Link href="/use-cases/log-nutrition-with-ai">{messages.common.readGuide}</Link></section>
  </div>;
}
