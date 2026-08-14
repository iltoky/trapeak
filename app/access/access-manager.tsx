"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { dataPermissions, type DataPermission } from "@/lib/access/permissions";

const labels: Record<DataPermission, string> = { training: "Training", nutrition: "Nutrition and weight", health: "Health and laboratory data", recovery: "Recovery" };

export function AccessManager() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<DataPermission[]>(["training"]);
  const [days, setDays] = useState(30);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function createGrant(event: React.FormEvent) {
    event.preventDefault(); setPending(true); setError(null); setInvitationUrl(null);
    const expiresAt = new Date(Date.now() + days * 86_400_000).toISOString();
    const response = await fetch("/api/access/grants", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ recipientEmail: email, permissions, expiresAt }) });
    const result = await response.json(); setPending(false);
    if (!response.ok) { setError(result.error ?? "Access invitation could not be created."); return; }
    setInvitationUrl(result.invitationUrl); router.refresh();
  }
  function toggle(permission: DataPermission) { setPermissions((current) => current.includes(permission) ? current.filter((value) => value !== permission) : [...current, permission]); }
  return <form className="access-grant-form" onSubmit={createGrant}>
    <label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
    <fieldset><legend>Data categories</legend>{dataPermissions.map((permission) => <label key={permission}><input type="checkbox" checked={permissions.includes(permission)} onChange={() => toggle(permission)} />{labels[permission]}</label>)}</fieldset>
    {permissions.includes("health") && <p className="access-warning">Health includes laboratory results, conditions, injuries, contraindications, and medications.</p>}
    <label>Access period<select value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option><option value={365}>1 year</option></select></label>
    <button className="button black" disabled={pending || permissions.length === 0} type="submit">{pending ? "Creating…" : "Create invitation"}</button>
    {error && <p className="access-error">{error}</p>}
    {invitationUrl && <div className="access-invitation"><b>Invitation link</b><input readOnly value={invitationUrl} onFocus={(event) => event.currentTarget.select()} /><small>Send this one-time link only to the specified email.</small></div>}
  </form>;
}

export function RevokeAccessButton({ grantId }: { grantId: string }) {
  const router = useRouter(); const [pending, setPending] = useState(false);
  return <button className="text-link" disabled={pending} onClick={async () => { setPending(true); await fetch(`/api/access/grants/${grantId}`, { method: "DELETE" }); router.refresh(); }}>{pending ? "Revoking…" : "Revoke"}</button>;
}
