import { createHash, randomBytes, randomUUID } from "node:crypto";

import { dataPermissions, type DataPermission } from "./permissions.ts";

export { dataPermissions, type DataPermission } from "./permissions.ts";
export type DataAccessGrantStatus = "pending" | "active" | "rejected" | "revoked";

export type DataAccessGrant = Readonly<{
  id: string;
  ownerUserId: string;
  recipientEmail: string;
  recipientUserId: string | null;
  permissions: readonly DataPermission[];
  status: DataAccessGrantStatus;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;

const permissionSet = new Set<string>(dataPermissions);

export function normalizeRecipientEmail(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 320) {
    throw new Error("A valid recipient email is required");
  }
  return normalized;
}

export function normalizePermissions(values: readonly string[]): readonly DataPermission[] {
  const normalized = [...new Set(values)];
  if (normalized.length === 0 || normalized.some((value) => !permissionSet.has(value))) {
    throw new Error("Select at least one supported data permission");
  }
  return dataPermissions.filter((permission) => normalized.includes(permission));
}

export function parseGrantExpiry(value: string, now = new Date()): Date {
  const expiresAt = new Date(value);
  const maximum = new Date(now.getTime() + 366 * 24 * 60 * 60 * 1000);
  if (
    Number.isNaN(expiresAt.getTime())
    || expiresAt.getTime() <= now.getTime()
    || expiresAt.getTime() > maximum.getTime()
  ) {
    throw new Error("Access expiry must be within the next 366 days");
  }
  return expiresAt;
}

export function createInvitationSecret(): Readonly<{
  id: string;
  token: string;
  tokenHash: string;
}> {
  const token = randomBytes(32).toString("base64url");
  return { id: randomUUID(), token, tokenHash: hashInvitationToken(token) };
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isGrantActive(
  grant: Pick<DataAccessGrant, "status" | "expiresAt">,
  now = new Date(),
): boolean {
  return grant.status === "active" && Date.parse(grant.expiresAt) > now.getTime();
}
