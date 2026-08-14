import "server-only";

import { getDatabase } from "../db/client";
import {
  calculateProfileCompleteness,
  calculateAgeYears,
  normalizeFieldStatuses,
  normalizeUserProfile,
  type ProfileCompleteness,
  type ProfileFieldStatus,
  type ProfileFieldStatusUpdate,
  type ProfileFieldKey,
  type ProfileStoredFieldKey,
  type UserProfilePatch,
  type UserProfileRecord,
} from "./model";
import { getWeightStatus } from "../weight/data";
import type { WeightStatus } from "../weight/model";

type UserProfileRow = Readonly<{
  profile: unknown;
  field_statuses: unknown;
  created_at: string | Date;
  updated_at: string | Date;
}>;

export type UserProfileResult = Readonly<{
  record: UserProfileRecord | null;
  completeness: ProfileCompleteness;
  derived: Readonly<{ ageYears: number | null }>;
  weight: WeightStatus;
}>;

function toRecord(row: UserProfileRow): UserProfileRecord {
  return {
    profile: normalizeUserProfile(row.profile),
    fieldStatuses: normalizeFieldStatuses(row.field_statuses),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function isMissingProfileTable(error: unknown): boolean {
  return Boolean(
    error
    && typeof error === "object"
    && "code" in error
    && (error as { code?: unknown }).code === "42P01",
  );
}

export async function getUserProfile(
  userId: string,
  asOf: Date = new Date(),
): Promise<UserProfileResult> {
  const sql = getDatabase();
  let rows: UserProfileRow[];
  try {
    rows = await sql`
      SELECT profile, field_statuses, created_at, updated_at
        FROM user_profiles
       WHERE user_id = ${userId}
       LIMIT 1
    ` as UserProfileRow[];
  } catch (error) {
    if (isMissingProfileTable(error)) {
      const weight = await getWeightStatus({ userId, asOf });
      return {
        record: null,
        completeness: calculateProfileCompleteness(null, {
          hasWeightMeasurement: weight.latest !== null,
        }),
        derived: { ageYears: null },
        weight,
      };
    }
    throw error;
  }
  const record = rows[0] ? toRecord(rows[0]) : null;
  const weight = await getWeightStatus({
    userId,
    asOf,
    goals: record?.profile.goals,
    configuredIntervalDays: record?.profile.weightReminderIntervalDays,
  });
  return {
    record,
    completeness: calculateProfileCompleteness(record, {
      hasWeightMeasurement: weight.latest !== null,
    }),
    derived: {
      ageYears: record?.profile.birthDate
        ? calculateAgeYears(record.profile.birthDate, asOf)
        : null,
    },
    weight,
  };
}

export async function updateUserProfile(input: Readonly<{
  userId: string;
  patch: UserProfilePatch;
  fieldStatuses?: readonly ProfileFieldStatusUpdate[];
}>): Promise<UserProfileResult> {
  const sql = getDatabase();
  const normalizedPatch = normalizeUserProfile(input.patch);
  const explicitPatchKeys = Object.keys(input.patch) as ProfileStoredFieldKey[];
  const explicitPatchKeySet = new Set<string>(explicitPatchKeys);
  const submittedStatuses = Object.fromEntries(
    (input.fieldStatuses ?? [])
      .filter(({ field }) => !explicitPatchKeySet.has(field))
      .map(({ field, status }) => [field, status]),
  ) as Partial<Record<ProfileFieldKey, ProfileFieldStatus>>;
  const statusKeys = Object.keys(submittedStatuses) as ProfileFieldKey[];
  const updatedKeys = [...new Set([...explicitPatchKeys, ...statusKeys])];
  const storedStatusKeys = statusKeys.filter(
    (key): key is Exclude<ProfileFieldKey, "weightHistory"> => key !== "weightHistory",
  );
  const patchDocument = Object.fromEntries([
    ...explicitPatchKeys.map((key) => [key, normalizedPatch[key]]),
    ...storedStatusKeys.map((key) => [key, null]),
  ]);
  const rows = await sql`
    INSERT INTO user_profiles (user_id, profile, field_statuses)
    VALUES (
      ${input.userId},
      ${JSON.stringify(patchDocument)}::jsonb,
      ${JSON.stringify(submittedStatuses)}::jsonb
    )
    ON CONFLICT (user_id) DO UPDATE SET
      profile = user_profiles.profile || EXCLUDED.profile,
      field_statuses = (user_profiles.field_statuses - ${updatedKeys}::text[])
        || EXCLUDED.field_statuses,
      updated_at = NOW()
    RETURNING profile, field_statuses, created_at, updated_at
  ` as UserProfileRow[];
  return getUserProfile(input.userId);
}

export async function deleteUserProfile(userId: string): Promise<boolean> {
  const sql = getDatabase();
  const rows = await sql`
    DELETE FROM user_profiles
     WHERE user_id = ${userId}
    RETURNING user_id
  ` as Array<{ user_id: string }>;
  return rows.length > 0;
}
