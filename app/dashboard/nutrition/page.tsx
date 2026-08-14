import Link from "next/link";
import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { getNutritionDaySummaries, listNutritionEntries, type NutritionEntry } from "@/lib/nutrition/data";
import { getUserProfile } from "@/lib/profile/data";
import { DeleteForm } from "../delete-form";

export const metadata = { title: "Nutrition" };

function dayKey(value: string): string { return value.slice(0, 10); }
function displayDay(value: string): string { return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)); }
function displayTime(value: string): string { return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date(value)); }

export default async function NutritionPage() {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const user = await requireAuthUser();
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
  const summaryByDay = new Map(summaries.map((summary) => [summary.date, summary]));
  const grouped = new Map<string, NutritionEntry[]>();
  for (const entry of entries ?? []) {
    const date = dayKey(entry.consumedAt);
    grouped.set(date, [...(grouped.get(date) ?? []), entry]);
  }
  const todaySummary = summaryByDay.get(today) ?? null;

  return <div className="dashboard-content">
    <header className="dashboard-hero compact"><div><p className="section-index">NUTRITION</p><h1>Daily totals,<br />meals on demand.</h1></div><p>Start with the day-level picture. Open individual days only when you need meal details and estimation assumptions.</p></header>
    <section className="metric-grid" aria-label="Nutrition summary">
      <article><small>TODAY</small><strong>{todaySummary ? `${todaySummary.caloriesKilocalories}` : "—"}</strong><span>kilocalories</span></article>
      <article><small>PROTEIN</small><strong>{todaySummary ? `${todaySummary.proteinGrams} g` : "—"}</strong><span>today</span></article>
      <article><small>CARBOHYDRATES</small><strong>{todaySummary ? `${todaySummary.carbohydratesGrams} g` : "—"}</strong><span>today</span></article>
      <article><small>LATEST WEIGHT</small><strong>{profile?.weight.latest ? `${profile.weight.latest.weightKilograms} kg` : "—"}</strong><span>{profile?.weight.latest ? displayDay(dayKey(profile.weight.latest.measuredAt)) : "no measurement"}</span></article>
    </section>
    {entries === null ? <section className="data-panel empty-panel"><h2>Nutrition storage is unavailable.</h2><p>Finish configuring the database migration, then return here.</p></section> : <section className="data-panel">
      <div className="panel-heading"><div><p className="section-index">HISTORY</p><h2>Nutrition by day.</h2></div><span>{entries.length} recent entries</span></div>
      {grouped.size === 0 ? <div className="panel-empty"><p>No nutrition records yet.</p><p>Try: “Save breakfast: an omelette, avocado and two crispbreads.”</p></div> : <div className="day-groups">{[...grouped.entries()].map(([date, dayEntries]) => {
        const summary = summaryByDay.get(date);
        return <details key={date} open={date === today}>
          <summary><div><b>{date === today ? "Today" : displayDay(date)}</b><span>{dayEntries.length} entries</span></div><p>{summary ? `${summary.caloriesKilocalories} kcal · P ${summary.proteinGrams} · C ${summary.carbohydratesGrams} · F ${summary.fatGrams}` : "Open details"}</p><i aria-hidden="true">+</i></summary>
          <div className="meal-list">{dayEntries.map((entry) => <article key={entry.id}><time>{displayTime(entry.consumedAt)}</time><div><b>{entry.description}</b><small>{entry.mealType}{entry.estimated ? " · estimated" : ""}</small>{entry.estimationNotes ? <p>Assumptions: {entry.estimationNotes}</p> : null}</div><span>{entry.caloriesKilocalories} kcal<br />P {entry.proteinGrams} · C {entry.carbohydratesGrams} · F {entry.fatGrams}</span><DeleteForm action={`/api/nutrition/${entry.id}/delete`} confirmation={`Permanently delete “${entry.description}”?`} /></article>)}</div>
        </details>;
      })}</div>}
    </section>}
    <section className="context-callout"><div><small>RECORD NATURALLY</small><p>Use voice, text or an image in your chosen AI. Ask it to state assumptions before saving estimated calories and macros.</p></div><Link href="/use-cases/log-nutrition-with-ai">Read the guide →</Link></section>
  </div>;
}
