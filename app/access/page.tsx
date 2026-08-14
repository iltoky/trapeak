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
import { AccountHeader } from "../account-header";
import { DashboardNav } from "../dashboard/dashboard-nav";
import { AccessManager, RevokeAccessButton } from "./access-manager";

export const metadata: Metadata = { title: "Shared access", robots: { index: false, follow: false } };

const labels: Record<DataPermission, string> = {
  training: "Training",
  nutrition: "Nutrition",
  health: "Health",
  recovery: "Recovery (legacy)",
};

function expires(value: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default async function AccessPage() {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const user = await requireAuthUser();
  const [owned, received, auditEvents] = await Promise.all([
    listOwnedDataAccessGrants(user.id),
    listReceivedDataAccessGrants(user.id),
    listOwnedDataAccessAuditEvents(user.id),
  ]);

  return <>
    <AccountHeader />
    <main className="dashboard-page"><div className="dashboard-shell shell"><DashboardNav />
      <div className="dashboard-content access-dashboard">
        <header className="dashboard-hero compact"><div><p className="section-index">SHARED ACCESS</p><h1>Your data.<br />Your permission.</h1></div><p>Invite a coach, doctor, dietitian or another person by email. There are no roles: choose the exact categories, set an expiry and revoke access at any time.</p></header>
        <div className="access-layout">
          <section className="access-create"><div><p className="section-index">NEW INVITATION</p><h2>Choose what to share.</h2><p>Access is read-only. The recipient must sign in with the same email address before accepting.</p></div><AccessManager /></section>
          <aside className="access-principles"><small>ACCESS RULES</small><ol><li><b>01</b><p>Training, Nutrition and Health are independent categories.</p></li><li><b>02</b><p>No category grants access to another category.</p></li><li><b>03</b><p>Every read is checked against the active grant and written to the audit trail.</p></li></ol></aside>
        </div>
        <section className="access-section"><div className="panel-heading"><div><p className="section-index">OUTGOING</p><h2>People with access.</h2></div><span>{owned.length} total</span></div>{owned.length === 0 ? <p className="panel-empty">No invitations yet.</p> : <div className="access-cards">{owned.map((grant) => <article key={grant.id}><div><b>{grant.recipientEmail}</b><ul>{grant.permissions.map((permission) => <li key={permission}>{labels[permission]}</li>)}</ul></div><small>{grant.status} · expires {expires(grant.expiresAt)}</small>{(grant.status === "pending" || grant.status === "active") ? <RevokeAccessButton grantId={grant.id} /> : null}</article>)}</div>}</section>
        <section className="access-section"><div className="panel-heading"><div><p className="section-index">INCOMING</p><h2>Data shared with you.</h2></div><span>{received.length} active</span></div>{received.length === 0 ? <p className="panel-empty">No active shared access.</p> : <div className="access-cards">{received.map((grant) => <article key={grant.id}><div><b>Shared TRAPEAK user</b><ul>{grant.permissions.map((permission) => <li key={permission}>{labels[permission]}</li>)}</ul></div><small>expires {expires(grant.expiresAt)}</small></article>)}</div>}</section>
        <details className="audit-section"><summary><span>Access activity</span><b>{auditEvents.length} events</b><i>+</i></summary>{auditEvents.length === 0 ? <p className="panel-empty">No access activity yet.</p> : <div className="audit-list">{auditEvents.map((event) => <article key={event.id}><b>{event.recipientEmail}</b><span>{event.action}{event.permission ? ` · ${labels[event.permission]}` : ""}{event.resourceType ? ` · ${event.resourceType}` : ""}</span><time>{new Date(event.createdAt).toLocaleString("en-GB")}</time></article>)}</div>}</details>
      </div>
    </div></main>
  </>;
}
