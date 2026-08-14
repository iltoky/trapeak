import "server-only";

import { randomUUID } from "node:crypto";

import { getDatabase } from "../db/client";
import {
  createInvitationSecret,
  hashInvitationToken,
  isGrantActive,
  normalizePermissions,
  normalizeRecipientEmail,
  parseGrantExpiry,
  type DataAccessGrant,
  type DataAccessGrantStatus,
  type DataPermission,
} from "./model";

type GrantRow = Readonly<{
  id: string;
  owner_user_id: string;
  recipient_email: string;
  recipient_user_id: string | null;
  permissions: string[];
  status: DataAccessGrantStatus;
  expires_at: Date | string;
  accepted_at: Date | string | null;
  revoked_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}>;

export type DataAccessAuditEvent = Readonly<{
  id: string;
  grantId: string;
  recipientEmail: string;
  action: "created" | "accepted" | "rejected" | "revoked" | "read";
  permission: DataPermission | null;
  resourceType: string | null;
  createdAt: string;
}>;

function iso(value: Date | string): string {
  return new Date(value).toISOString();
}

function mapGrant(row: GrantRow): DataAccessGrant {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    recipientEmail: row.recipient_email,
    recipientUserId: row.recipient_user_id,
    permissions: normalizePermissions(row.permissions),
    status: row.status,
    expiresAt: iso(row.expires_at),
    acceptedAt: row.accepted_at ? iso(row.accepted_at) : null,
    revokedAt: row.revoked_at ? iso(row.revoked_at) : null,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

async function writeAudit(input: Readonly<{
  grantId: string;
  actorUserId: string;
  action: "created" | "accepted" | "rejected" | "revoked" | "read";
  permission?: DataPermission;
  resourceType?: string;
  oauthClientId?: string;
}>): Promise<void> {
  const sql = getDatabase();
  await sql`
    INSERT INTO data_access_audit_events (
      id, grant_id, actor_user_id, action, permission, resource_type, oauth_client_id
    ) VALUES (
      ${randomUUID()}, ${input.grantId}, ${input.actorUserId}, ${input.action},
      ${input.permission ?? null}, ${input.resourceType ?? null},
      ${input.oauthClientId ?? null}
    )
  `;
}

export async function createDataAccessGrant(input: Readonly<{
  ownerUserId: string;
  ownerEmail: string | null;
  recipientEmail: string;
  permissions: readonly string[];
  expiresAt: string;
}>): Promise<Readonly<{ grant: DataAccessGrant; invitationToken: string }>> {
  const sql = getDatabase();
  const recipientEmail = normalizeRecipientEmail(input.recipientEmail);
  if (input.ownerEmail && normalizeRecipientEmail(input.ownerEmail) === recipientEmail) {
    throw new Error("Access cannot be granted to the owner's own email");
  }
  const permissions = normalizePermissions(input.permissions);
  const expiresAt = parseGrantExpiry(input.expiresAt);
  const invitation = createInvitationSecret();
  const rows = await sql`
    INSERT INTO data_access_grants (
      id, owner_user_id, recipient_email, permissions,
      invitation_token_hash, expires_at
    ) VALUES (
      ${invitation.id}, ${input.ownerUserId}, ${recipientEmail}, ${permissions},
      ${invitation.tokenHash}, ${expiresAt.toISOString()}
    )
    RETURNING *
  ` as GrantRow[];
  await writeAudit({
    grantId: invitation.id,
    actorUserId: input.ownerUserId,
    action: "created",
  });
  return { grant: mapGrant(rows[0]), invitationToken: invitation.token };
}

export async function listOwnedDataAccessGrants(ownerUserId: string): Promise<readonly DataAccessGrant[]> {
  const sql = getDatabase();
  const rows = await sql`
    SELECT * FROM data_access_grants
     WHERE owner_user_id = ${ownerUserId}
     ORDER BY created_at DESC
  ` as GrantRow[];
  return rows.map(mapGrant);
}

export async function listReceivedDataAccessGrants(recipientUserId: string): Promise<readonly DataAccessGrant[]> {
  const sql = getDatabase();
  const rows = await sql`
    SELECT * FROM data_access_grants
     WHERE recipient_user_id = ${recipientUserId}
       AND status = 'active'
       AND expires_at > NOW()
     ORDER BY accepted_at DESC
  ` as GrantRow[];
  return rows.map(mapGrant);
}

export async function listOwnedDataAccessAuditEvents(
  ownerUserId: string,
  limit = 50,
): Promise<readonly DataAccessAuditEvent[]> {
  const sql = getDatabase();
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const rows = await sql`
    SELECT e.id, e.grant_id, g.recipient_email, e.action, e.permission,
           e.resource_type, e.created_at
      FROM data_access_audit_events e
      JOIN data_access_grants g ON g.id = e.grant_id
     WHERE g.owner_user_id = ${ownerUserId}
     ORDER BY e.created_at DESC
     LIMIT ${safeLimit}
  ` as Array<{
    id: string;
    grant_id: string;
    recipient_email: string;
    action: DataAccessAuditEvent["action"];
    permission: DataPermission | null;
    resource_type: string | null;
    created_at: Date | string;
  }>;
  return rows.map((row) => ({
    id: row.id,
    grantId: row.grant_id,
    recipientEmail: row.recipient_email,
    action: row.action,
    permission: row.permission,
    resourceType: row.resource_type,
    createdAt: iso(row.created_at),
  }));
}

export async function acceptDataAccessInvitation(input: Readonly<{
  token: string;
  recipientUserId: string;
  recipientEmail: string | null;
}>): Promise<DataAccessGrant | null> {
  if (!input.recipientEmail) {
    throw new Error("A verified primary email is required to accept access");
  }
  const sql = getDatabase();
  const rows = await sql`
    UPDATE data_access_grants
       SET recipient_user_id = ${input.recipientUserId},
           status = 'active', accepted_at = NOW(), updated_at = NOW()
     WHERE invitation_token_hash = ${hashInvitationToken(input.token)}
       AND recipient_email = ${normalizeRecipientEmail(input.recipientEmail)}
       AND status = 'pending'
       AND expires_at > NOW()
       AND owner_user_id <> ${input.recipientUserId}
    RETURNING *
  ` as GrantRow[];
  if (!rows[0]) return null;
  await writeAudit({
    grantId: rows[0].id,
    actorUserId: input.recipientUserId,
    action: "accepted",
  });
  return mapGrant(rows[0]);
}

export async function rejectDataAccessInvitation(input: Readonly<{
  token: string;
  recipientUserId: string;
  recipientEmail: string | null;
}>): Promise<boolean> {
  if (!input.recipientEmail) {
    throw new Error("A verified primary email is required to reject access");
  }
  const sql = getDatabase();
  const rows = await sql`
    UPDATE data_access_grants
       SET recipient_user_id = ${input.recipientUserId},
           status = 'rejected', updated_at = NOW()
     WHERE invitation_token_hash = ${hashInvitationToken(input.token)}
       AND recipient_email = ${normalizeRecipientEmail(input.recipientEmail)}
       AND status = 'pending'
       AND expires_at > NOW()
       AND owner_user_id <> ${input.recipientUserId}
    RETURNING id
  ` as Array<{ id: string }>;
  if (!rows[0]) return false;
  await writeAudit({
    grantId: rows[0].id,
    actorUserId: input.recipientUserId,
    action: "rejected",
  });
  return true;
}

export async function revokeDataAccessGrant(ownerUserId: string, grantId: string): Promise<boolean> {
  const sql = getDatabase();
  const rows = await sql`
    UPDATE data_access_grants
       SET status = 'revoked', revoked_at = NOW(), updated_at = NOW()
     WHERE id = ${grantId}
       AND owner_user_id = ${ownerUserId}
       AND status IN ('pending', 'active')
    RETURNING id
  ` as Array<{ id: string }>;
  if (!rows[0]) return false;
  await writeAudit({ grantId, actorUserId: ownerUserId, action: "revoked" });
  return true;
}

export async function authorizeDelegatedRead(input: Readonly<{
  grantId: string;
  recipientUserId: string;
  permission: DataPermission;
  resourceType: string;
  oauthClientId?: string;
}>): Promise<Readonly<{ ownerUserId: string; grant: DataAccessGrant }> | null> {
  const sql = getDatabase();
  const rows = await sql`
    SELECT * FROM data_access_grants
     WHERE id = ${input.grantId}
       AND recipient_user_id = ${input.recipientUserId}
       AND status = 'active'
       AND expires_at > NOW()
       AND ${input.permission} = ANY(permissions)
     LIMIT 1
  ` as GrantRow[];
  if (!rows[0]) return null;
  const grant = mapGrant(rows[0]);
  if (!isGrantActive(grant)) return null;
  await writeAudit({
    grantId: grant.id,
    actorUserId: input.recipientUserId,
    action: "read",
    permission: input.permission,
    resourceType: input.resourceType,
    oauthClientId: input.oauthClientId,
  });
  return { ownerUserId: grant.ownerUserId, grant };
}
