"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { assignableDataPermissions, type DataPermission } from "@/lib/access/permissions";
import type { UiMessages } from "@/lib/i18n/ui";

export function AccessManager({ messages }: { messages: UiMessages["access"] }) {
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
    if (!response.ok) { setError(messages.invitationError); return; }
    setInvitationUrl(result.invitationUrl); router.refresh();
  }
  function toggle(permission: DataPermission) { setPermissions((current) => current.includes(permission) ? current.filter((value) => value !== permission) : [...current, permission]); }
  const labels: Record<DataPermission, string> = { training: messages.training, nutrition: messages.nutrition, health: messages.health, recovery: messages.recoveryLegacy };
  const descriptions: Record<DataPermission, string> = { training: messages.trainingDescription, nutrition: messages.nutritionDescription, health: messages.healthDescription, recovery: messages.recoveryDescription };
  return <form className="access-grant-form" onSubmit={createGrant}>
    <label className="access-email">{messages.email}<input type="email" required placeholder="coach@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
    <fieldset><legend>{messages.categories}</legend>{assignableDataPermissions.map((permission) => <label key={permission}><input type="checkbox" checked={permissions.includes(permission)} onChange={() => toggle(permission)} /><span><b>{labels[permission]}</b><small>{descriptions[permission]}</small></span></label>)}</fieldset>
    {permissions.includes("health") && <p className="access-warning">{messages.healthWarning}</p>}
    <label className="access-period">{messages.period}<select value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={7}>{messages.days7}</option><option value={30}>{messages.days30}</option><option value={90}>{messages.days90}</option><option value={365}>{messages.year1}</option></select></label>
    <button className="button black" disabled={pending || permissions.length === 0} type="submit">{pending ? messages.creating : messages.create}</button>
    {error && <p className="access-error" role="alert">{error}</p>}
    {invitationUrl && <div className="access-invitation"><b>{messages.invitationLink}</b><input readOnly value={invitationUrl} onFocus={(event) => event.currentTarget.select()} /><small>{messages.linkHint}</small></div>}
  </form>;
}

export function RevokeAccessButton({ grantId, messages }: { grantId: string; messages: UiMessages["access"] }) {
  const router = useRouter(); const [pending, setPending] = useState(false);
  return <button className="text-link" disabled={pending} onClick={async () => { setPending(true); await fetch(`/api/access/grants/${grantId}`, { method: "DELETE" }); router.refresh(); }}>{pending ? messages.revoking : messages.revoke}</button>;
}
