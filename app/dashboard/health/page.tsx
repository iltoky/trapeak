import Link from "next/link";
import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { listLabReports } from "@/lib/labs/data";
import { getUserProfile } from "@/lib/profile/data";
import type { AppLocale } from "@/lib/i18n/config";
import { getRequestLocale } from "@/lib/i18n/server";
import { getUiMessages } from "@/lib/i18n/ui";
import { DeleteForm } from "../delete-form";

export const metadata = { title: "Health" };

function dateTime(value: string, locale: AppLocale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

function TextItems({ values, empty }: Readonly<{ values: readonly string[] | null | undefined; empty: string }>) {
  return values?.length ? <ul className="tag-list">{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p className="panel-empty">{empty}</p>;
}

export default async function HealthPage() {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const user = await requireAuthUser();
  const locale = await getRequestLocale();
  const messages = getUiMessages(locale);
  const m = messages.health;
  const [labsResult, profileResult] = await Promise.allSettled([
    listLabReports({ userId: user.id, limit: 30 }),
    getUserProfile(user.id),
  ]);
  const labs = labsResult.status === "fulfilled" ? labsResult.value : null;
  const profile = profileResult.status === "fulfilled" ? profileResult.value.record?.profile : null;

  return <div className="dashboard-content">
    <header className="dashboard-hero compact"><div><p className="section-index">{messages.nav.health.toUpperCase()}</p><h1>{m.title}</h1></div><p>{m.intro}</p></header>
    <div className="health-grid">
      <section className="data-panel health-labs">
        <div className="panel-heading"><div><p className="section-index">{m.laboratory}</p><h2>{m.reports}</h2></div><span>{labs?.length ?? 0} {m.results}</span></div>
        {labs === null ? <p className="panel-empty">{m.unavailable}</p> : labs.length === 0 ? <div className="panel-empty"><p>{m.noReports}</p><p>{m.saveHint}</p></div> : <div className="lab-list">{labs.map((report) => <article key={report.id}><div><b>{report.title}</b><small>{report.testType} · {m.collected} {dateTime(report.collectedAt, locale)}</small><span>{report.resultCount} {m.results}{report.laboratory ? ` · ${report.laboratory}` : ""}</span></div><DeleteForm action={`/api/labs/${report.id}/delete`} confirmation={m.confirmDelete} label={messages.common.delete} /></article>)}</div>}
      </section>
      <aside className="health-context">
        <section><p className="section-index">{m.conditions}</p><TextItems values={profile?.healthConditions} empty={m.noConditions} /></section>
        <section><p className="section-index">{m.injuries}</p>{profile?.injuries?.length ? <ul className="tag-list">{profile.injuries.map((injury) => <li key={`${injury.name}-${injury.status}`}>{injury.name} · {injury.status}</li>)}</ul> : <p className="panel-empty">{m.noInjuries}</p>}</section>
        <section><p className="section-index">{m.contraindications}</p><TextItems values={profile?.contraindications} empty={m.noContraindications} /></section>
        <section><p className="section-index">{m.medications}</p>{profile?.medications?.length ? <ul className="medication-list">{profile.medications.map((medication) => <li key={`${medication.name}-${medication.dosage}`}><b>{medication.name}</b><span>{[medication.dosage, medication.frequency].filter(Boolean).join(" · ") || m.detailsMissing}</span></li>)}</ul> : <p className="panel-empty">{m.noMedications}</p>}</section>
      </aside>
    </div>
    <section className="health-warning"><b>{m.adviceTitle}</b><p>{m.advice}</p><Link href="/use-cases/track-blood-tests-with-ai">{messages.common.readGuide}</Link></section>
  </div>;
}
