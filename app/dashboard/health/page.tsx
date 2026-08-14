import Link from "next/link";
import { redirect } from "next/navigation";

import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { listLabReports } from "@/lib/labs/data";
import { getUserProfile } from "@/lib/profile/data";
import { DeleteForm } from "../delete-form";

export const metadata = { title: "Health" };

function dateTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}

function TextItems({ values, empty }: Readonly<{ values: readonly string[] | null | undefined; empty: string }>) {
  return values?.length ? <ul className="tag-list">{values.map((value) => <li key={value}>{value}</li>)}</ul> : <p className="panel-empty">{empty}</p>;
}

export default async function HealthPage() {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const user = await requireAuthUser();
  const [labsResult, profileResult] = await Promise.allSettled([
    listLabReports({ userId: user.id, limit: 30 }),
    getUserProfile(user.id),
  ]);
  const labs = labsResult.status === "fulfilled" ? labsResult.value : null;
  const profile = profileResult.status === "fulfilled" ? profileResult.value.record?.profile : null;

  return <div className="dashboard-content">
    <header className="dashboard-hero compact"><div><p className="section-index">HEALTH</p><h1>Sensitive context,<br />kept separate.</h1></div><p>Laboratory history, conditions, injuries, contraindications and medications. Health access is never implied by training access.</p></header>
    <div className="health-grid">
      <section className="data-panel health-labs">
        <div className="panel-heading"><div><p className="section-index">LABORATORY</p><h2>Stored reports.</h2></div><span>{labs?.length ?? 0} reports</span></div>
        {labs === null ? <p className="panel-empty">Laboratory storage is unavailable.</p> : labs.length === 0 ? <div className="panel-empty"><p>No laboratory reports stored.</p><p>Ask your AI to extract exact values, units and reference ranges from a report before saving.</p></div> : <div className="lab-list">{labs.map((report) => <article key={report.id}><div><b>{report.title}</b><small>{report.testType} · collected {dateTime(report.collectedAt)}</small><span>{report.resultCount} results{report.laboratory ? ` · ${report.laboratory}` : ""}</span></div><DeleteForm action={`/api/labs/${report.id}/delete`} confirmation={`Permanently delete “${report.title}” and all ${report.resultCount} stored results?`} /></article>)}</div>}
      </section>
      <aside className="health-context">
        <section><p className="section-index">CONDITIONS</p><TextItems values={profile?.healthConditions} empty="No conditions recorded." /></section>
        <section><p className="section-index">INJURIES</p>{profile?.injuries?.length ? <ul className="tag-list">{profile.injuries.map((injury) => <li key={`${injury.name}-${injury.status}`}>{injury.name} · {injury.status}</li>)}</ul> : <p className="panel-empty">No injuries recorded.</p>}</section>
        <section><p className="section-index">CONTRAINDICATIONS</p><TextItems values={profile?.contraindications} empty="No contraindications recorded." /></section>
        <section><p className="section-index">MEDICATIONS</p>{profile?.medications?.length ? <ul className="medication-list">{profile.medications.map((medication) => <li key={`${medication.name}-${medication.dosage}`}><b>{medication.name}</b><span>{[medication.dosage, medication.frequency].filter(Boolean).join(" · ") || "Details not recorded"}</span></li>)}</ul> : <p className="panel-empty">No medications recorded.</p>}</section>
      </aside>
    </div>
    <section className="health-warning"><b>Not medical advice.</b><p>TRAPEAK stores user-provided facts and reported laboratory values. A connected AI can help organize questions, but it must not invent missing values or replace a qualified clinician.</p><Link href="/use-cases/track-blood-tests-with-ai">Read the laboratory guide →</Link></section>
  </div>;
}
