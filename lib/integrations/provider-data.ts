import "server-only";

import { randomUUID } from "node:crypto";

import { getDatabase } from "../db/client";
import type {
  ProviderActivityPage,
  ProviderAthleteProfile,
  ProviderId,
} from "./provider";

export type ProviderDataSummary = Readonly<{
  lastSyncedAt: Date;
  providerTotal: number;
  lastImportedCount: number;
  storedActivityCount: number;
}>;

export type ProviderSnapshotResult = Readonly<{
  receivedCount: number;
  createdCount: number;
  updatedCount: number;
}>;

type ProviderDataSummaryRow = Readonly<{
  last_synced_at: string | Date;
  provider_total: number | string;
  last_imported_count: number | string;
  stored_activity_count: number | string;
}>;

type ExistingActivityRow = Readonly<{
  provider_activity_id: string;
}>;

export async function saveProviderSnapshot(input: Readonly<{
  userId: string;
  provider: ProviderId;
  profile: ProviderAthleteProfile;
  activityPage: ProviderActivityPage;
}>): Promise<ProviderSnapshotResult> {
  const sql = getDatabase();
  const profilePayload = JSON.stringify(input.profile.rawData);
  const existingRows = await sql`
    SELECT provider_activity_id
      FROM fitness_activities
     WHERE user_id = ${input.userId}
       AND provider = ${input.provider}
  ` as ExistingActivityRow[];
  const existingActivityIds = new Set(
    existingRows.map(({ provider_activity_id }) => provider_activity_id),
  );
  const updatedCount = input.activityPage.activities.reduce(
    (count, activity) =>
      count + Number(existingActivityIds.has(activity.providerActivityId)),
    0,
  );

  await sql.transaction((transaction) => [
    transaction`
      INSERT INTO provider_profiles (
        id, user_id, provider, provider_user_id, display_name,
        height_meters, weight_kilograms, birth_date, gender_code,
        provider_created_at, provider_updated_at, raw_payload, synced_at
      ) VALUES (
        ${randomUUID()}, ${input.userId}, ${input.provider},
        ${input.profile.providerUserId}, ${input.profile.displayName ?? null},
        ${input.profile.heightMeters ?? null}, ${input.profile.weightKilograms ?? null},
        ${input.profile.birthDate ?? null}, ${input.profile.genderCode ?? null},
        ${input.profile.providerCreatedAt?.toISOString() ?? null},
        ${input.profile.providerUpdatedAt?.toISOString() ?? null},
        ${profilePayload}::jsonb, NOW()
      )
      ON CONFLICT (user_id, provider) DO UPDATE SET
        provider_user_id = EXCLUDED.provider_user_id,
        display_name = EXCLUDED.display_name,
        height_meters = EXCLUDED.height_meters,
        weight_kilograms = EXCLUDED.weight_kilograms,
        birth_date = EXCLUDED.birth_date,
        gender_code = EXCLUDED.gender_code,
        provider_created_at = EXCLUDED.provider_created_at,
        provider_updated_at = EXCLUDED.provider_updated_at,
        raw_payload = EXCLUDED.raw_payload,
        synced_at = NOW(),
        updated_at = NOW()
    `,
    ...input.activityPage.activities.map((activity) => {
      const rawPayload = JSON.stringify(activity.rawData);
      return transaction`
        INSERT INTO fitness_activities (
          id, user_id, provider, provider_activity_id, name, activity_type_id,
          started_at, duration_seconds, active_duration_seconds,
          paused_duration_seconds, distance_meters, elevation_gain_meters,
          calories_kilocalories, average_heart_rate_bpm, average_cadence_rpm,
          average_speed_meters_per_second, average_power_watts,
          normalized_power_watts, training_stress_score, work_joules,
          time_zone, is_manual, is_edited, source_app_id,
          provider_created_at, provider_updated_at, raw_payload, synced_at
        ) VALUES (
          ${randomUUID()}, ${input.userId}, ${input.provider},
          ${activity.providerActivityId}, ${activity.name ?? null},
          ${activity.activityTypeId ?? null}, ${activity.startedAt.toISOString()},
          ${activity.durationSeconds ?? null}, ${activity.activeDurationSeconds ?? null},
          ${activity.pausedDurationSeconds ?? null}, ${activity.distanceMeters ?? null},
          ${activity.elevationGainMeters ?? null},
          ${activity.caloriesKilocalories ?? null},
          ${activity.averageHeartRateBpm ?? null},
          ${activity.averageCadenceRpm ?? null},
          ${activity.averageSpeedMetersPerSecond ?? null},
          ${activity.averagePowerWatts ?? null},
          ${activity.normalizedPowerWatts ?? null},
          ${activity.trainingStressScore ?? null}, ${activity.workJoules ?? null},
          ${activity.timeZone ?? null}, ${activity.isManual ?? null},
          ${activity.isEdited ?? null}, ${activity.sourceAppId ?? null},
          ${activity.providerCreatedAt?.toISOString() ?? null},
          ${activity.providerUpdatedAt?.toISOString() ?? null},
          ${rawPayload}::jsonb, NOW()
        )
        ON CONFLICT (user_id, provider, provider_activity_id) DO UPDATE SET
          name = EXCLUDED.name,
          activity_type_id = EXCLUDED.activity_type_id,
          started_at = EXCLUDED.started_at,
          duration_seconds = EXCLUDED.duration_seconds,
          active_duration_seconds = EXCLUDED.active_duration_seconds,
          paused_duration_seconds = EXCLUDED.paused_duration_seconds,
          distance_meters = EXCLUDED.distance_meters,
          elevation_gain_meters = EXCLUDED.elevation_gain_meters,
          calories_kilocalories = EXCLUDED.calories_kilocalories,
          average_heart_rate_bpm = EXCLUDED.average_heart_rate_bpm,
          average_cadence_rpm = EXCLUDED.average_cadence_rpm,
          average_speed_meters_per_second = EXCLUDED.average_speed_meters_per_second,
          average_power_watts = EXCLUDED.average_power_watts,
          normalized_power_watts = EXCLUDED.normalized_power_watts,
          training_stress_score = EXCLUDED.training_stress_score,
          work_joules = EXCLUDED.work_joules,
          time_zone = EXCLUDED.time_zone,
          is_manual = EXCLUDED.is_manual,
          is_edited = EXCLUDED.is_edited,
          source_app_id = EXCLUDED.source_app_id,
          provider_created_at = EXCLUDED.provider_created_at,
          provider_updated_at = EXCLUDED.provider_updated_at,
          raw_payload = EXCLUDED.raw_payload,
          synced_at = NOW(),
          updated_at = NOW()
      `;
    }),
    transaction`
      INSERT INTO provider_sync_state (
        user_id, provider, last_synced_at, provider_total,
        last_imported_count, last_error_code
      ) VALUES (
        ${input.userId}, ${input.provider}, NOW(), ${input.activityPage.total},
        ${input.activityPage.activities.length}, NULL
      )
      ON CONFLICT (user_id, provider) DO UPDATE SET
        last_synced_at = NOW(),
        provider_total = EXCLUDED.provider_total,
        last_imported_count = EXCLUDED.last_imported_count,
        last_error_code = NULL,
        updated_at = NOW()
    `,
  ]);

  return {
    receivedCount: input.activityPage.activities.length,
    createdCount: input.activityPage.activities.length - updatedCount,
    updatedCount,
  };
}

export async function markProviderSyncError(
  userId: string,
  provider: ProviderId,
  errorCode: string,
): Promise<void> {
  const sql = getDatabase();
  await sql`
    INSERT INTO provider_sync_state (
      user_id, provider, provider_total, last_imported_count, last_error_code
    ) VALUES (${userId}, ${provider}, 0, 0, ${errorCode})
    ON CONFLICT (user_id, provider) DO UPDATE SET
      last_error_code = EXCLUDED.last_error_code,
      updated_at = NOW()
  `;
}

export async function getProviderDataSummary(
  userId: string,
  provider: ProviderId,
): Promise<ProviderDataSummary | null> {
  const sql = getDatabase();
  const rows = await sql`
    SELECT state.last_synced_at, state.provider_total,
           state.last_imported_count,
           (
             SELECT COUNT(*)
               FROM fitness_activities activity
              WHERE activity.user_id = ${userId}
                AND activity.provider = ${provider}
           ) AS stored_activity_count
      FROM provider_sync_state state
     WHERE state.user_id = ${userId}
       AND state.provider = ${provider}
       AND state.last_synced_at IS NOT NULL
     LIMIT 1
  ` as ProviderDataSummaryRow[];
  const row = rows[0];
  if (!row) {
    return null;
  }

  return {
    lastSyncedAt: new Date(row.last_synced_at),
    providerTotal: Number(row.provider_total),
    lastImportedCount: Number(row.last_imported_count),
    storedActivityCount: Number(row.stored_activity_count),
  };
}
