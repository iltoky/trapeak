import { redirect } from "next/navigation";
import {
  listOwnedDataAccessAuditEvents,
  listOwnedDataAccessGrants,
  listReceivedDataAccessGrants,
} from "@/lib/access/data";
import { isAuthConfigured } from "@/lib/auth/config";
import { requireAuthUser } from "@/lib/auth/current-user";
import { SiteHeader } from "../site-header";
import { AccessManager, RevokeAccessButton } from "./access-manager";

export const metadata = { title: "Shared access", robots: { index: false, follow: false } };
export default async function AccessPage() {
  if (!isAuthConfigured()) redirect("/sign-in?setup=required");
  const user = await requireAuthUser();
  const [owned, received, auditEvents] = await Promise.all([
    listOwnedDataAccessGrants(user.id),
    listReceivedDataAccessGrants(user.id),
    listOwnedDataAccessAuditEvents(user.id),
  ]);
  return <><SiteHeader /><main className="access-page shell"><header><p className="section-index">SHARED ACCESS</p><h1>Share selected data.</h1><p>Give another registered TRAPEAK user temporary read-only access. You can revoke it at any time.</p></header>
    <section><h2>Create access</h2><AccessManager /></section>
    <section><h2>People with access</h2>{owned.length === 0 ? <p>No invitations yet.</p> : <div className="access-cards">{owned.map((grant) => <article key={grant.id}><b>{grant.recipientEmail}</b><p>{grant.permissions.join(" · ")}</p><small>{grant.status} · expires {new Date(grant.expiresAt).toLocaleDateString("en-GB")}</small>{(grant.status === "pending" || grant.status === "active") && <RevokeAccessButton grantId={grant.id} />}</article>)}</div>}</section>
    <section><h2>Data shared with you</h2>{received.length === 0 ? <p>No active shared access.</p> : <div className="access-cards">{received.map((grant) => <article key={grant.id}><b>Shared TRAPEAK user</b><p>{grant.permissions.join(" · ")}</p><small>expires {new Date(grant.expiresAt).toLocaleDateString("en-GB")}</small></article>)}</div>}</section>
    <section><h2>Access activity</h2>{auditEvents.length === 0 ? <p>No access activity yet.</p> : <div className="access-cards">{auditEvents.map((event) => <article key={event.id}><b>{event.recipientEmail}</b><p>{event.action}{event.permission ? ` · ${event.permission}` : ""}{event.resourceType ? ` · ${event.resourceType}` : ""}</p><small>{new Date(event.createdAt).toLocaleString("en-GB")}</small></article>)}</div>}</section>
  </main></>;
}
