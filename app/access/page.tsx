import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  listOwnedDataAccessAuditEvents,
  listOwnedDataAccessGrants,
  listReceivedDataAccessGrants,
} from "@/lib/access/data";
import type { DataPermission } from "@/lib/access/permissions";
import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { getRequestLocale } from "@/lib/i18n/server";
import type { AppLocale } from "@/lib/i18n/config";
import { getUiMessages } from "@/lib/i18n/ui";
import { AccountHeader } from "../account-header";
import { DashboardNav } from "../dashboard/dashboard-nav";
import { AccessManager, RevokeAccessButton } from "./access-manager";

export const metadata: Metadata = { title: "Shared access", robots: { index: false, follow: false } };

function expires(value: string, locale: AppLocale): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function AccessPage() {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const user = await requireAuthUser();
  const locale = await getRequestLocale();
  const messages = getUiMessages(locale);
  const m = messages.access;
  const labels: Record<DataPermission, string> = { training: m.training, nutrition: m.nutrition, health: m.health, recovery: m.recoveryLegacy };
  const [owned, received, auditEvents] = await Promise.all([
    listOwnedDataAccessGrants(user.id),
    listReceivedDataAccessGrants(user.id),
    listOwnedDataAccessAuditEvents(user.id),
  ]);

  return <>
    <AccountHeader />
    <main className="dashboard-page"><div className="dashboard-shell shell"><DashboardNav locale={locale} />
      <div className="dashboard-content access-dashboard">
        <header className="dashboard-hero compact"><div><p className="section-index">{m.eyebrow}</p><h1>{m.title}</h1></div><p>{m.intro}</p></header>
        <div className="access-layout">
          <section className="access-create"><div><p className="section-index">{m.newInvitation}</p><h2>{m.chooseShare}</h2><p>{m.readonlyNotice}</p></div><AccessManager messages={m} /></section>
          <aside className="access-principles"><small>{m.rules}</small><ol><li><b>01</b><p>{m.rule1}</p></li><li><b>02</b><p>{m.rule2}</p></li><li><b>03</b><p>{m.rule3}</p></li></ol></aside>
        </div>
        <section className="access-section"><div className="panel-heading"><div><p className="section-index">{m.outgoing}</p><h2>{m.peopleAccess}</h2></div><span>{owned.length} {m.total}</span></div>{owned.length === 0 ? <p className="panel-empty">{m.none}</p> : <div className="access-cards">{owned.map((grant) => <article key={grant.id}><div><b>{grant.recipientEmail}</b><ul>{grant.permissions.map((permission) => <li key={permission}>{labels[permission]}</li>)}</ul></div><small>{grant.status} · {m.expires} {expires(grant.expiresAt, locale)}</small>{(grant.status === "pending" || grant.status === "active") ? <RevokeAccessButton grantId={grant.id} messages={m} /> : null}</article>)}</div>}</section>
        <section className="access-section"><div className="panel-heading"><div><p className="section-index">{m.incoming}</p><h2>{m.sharedWithYou}</h2></div><span>{received.length} {m.active}</span></div>{received.length === 0 ? <p className="panel-empty">{m.noneIncoming}</p> : <div className="access-cards">{received.map((grant) => <article key={grant.id}><div><b>{m.sharedUser}</b><ul>{grant.permissions.map((permission) => <li key={permission}>{labels[permission]}</li>)}</ul></div><small>{m.expires} {expires(grant.expiresAt, locale)}</small></article>)}</div>}</section>
        <details className="audit-section"><summary><span>{m.activity}</span><b>{auditEvents.length} {m.events}</b><i>+</i></summary>{auditEvents.length === 0 ? <p className="panel-empty">{m.noneEvents}</p> : <div className="audit-list">{auditEvents.map((event) => <article key={event.id}><b>{event.recipientEmail}</b><span>{event.action}{event.permission ? ` · ${labels[event.permission]}` : ""}{event.resourceType ? ` · ${event.resourceType}` : ""}</span><time>{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.createdAt))}</time></article>)}</div>}</details>
      </div>
    </div></main>
  </>;
}
