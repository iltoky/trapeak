import "server-only";

import { getDatabase } from "../db/client";
import type { ProviderId } from "../integrations/provider";
import { toUtcDayStart, toUtcNextDayStart } from "./dates";

export type McpAthleteProfile = Readonly<{
  provider: ProviderId;
  displayName: string | null;
  heightMeters: number | null;
  weightKilograms: number | null;
  birthDate: string | null;
  genderCode: number | null;
  syncedAt: string;
}>;

export type McpActivitySummary = Readonly<{
  id: string;
  provider: ProviderId;
  name: string | null;
  activityTypeId: string | null;
  startedAt: string;
  durationSeconds: number | null;
  distanceMeters: number | null;
  caloriesKilocalories: number | null;
  averageHeartRateBpm: number | null;
}>;

export type McpActivityDetails = McpActivitySummary & Readonly<{
  activeDurationSeconds: number | null;
  pausedDurationSeconds: number | null;
  elevationGainMeters: number | null;
  averageCadenceRpm: number | null;
  averageSpeedMetersPerSecond: number | null;
  averagePowerWatts: number | null;
  normalizedPowerWatts: number | null;
  trainingStressScore: number | null;
  workJoules: number | null;
  timeZone: string | null;
  isManual: boolean | null;
  isEdited: boolean | null;
  syncedAt: string;
}>;

type ProfileRow = Readonly<{
  provider: ProviderId;
  display_name: string | null;
  height_meters: number | null;
  weight_kilograms: number | null;
  birth_date: string | Date | null;
  gender_code: number | null;
  synced_at: string | Date;
}>;

type ActivityRow = Readonly<{
  id: string;
  provider: ProviderId;
  name: string | null;
  activity_type_id: string | null;
  started_at: string | Date;
  duration_seconds: number | null;
  active_duration_seconds: number | null;
  paused_duration_seconds: number | null;
  distance_meters: number | null;
  elevation_gain_meters: number | null;
  calories_kilocalories: number | null;
  average_heart_rate_bpm: number | null;
  average_cadence_rpm: number | null;
  average_speed_meters_per_second: number | null;
  average_power_watts: number | null;
  normalized_power_watts: number | null;
  training_stress_score: number | null;
  work_joules: number | null;
  time_zone: string | null;
  is_manual: boolean | null;
  is_edited: boolean | null;
  synced_at: string | Date;
}>;

function toIsoString(value: string | Date): string {
  return new Date(value).toISOString();
}

function toDateString(value: string | Date | null): string | null {
  return value ? toIsoString(value).slice(0, 10) : null;
}

function toNumber(value: number | null): number | null {
  return value === null ? null : Number(value);
}

function toActivitySummary(row: ActivityRow): McpActivitySummary {
  return {
    id: row.id,
    provider: row.provider,
    name: row.name,
    activityTypeId: row.activity_type_id,
    startedAt: toIsoString(row.started_at),
    durationSeconds: toNumber(row.duration_seconds),
    distanceMeters: toNumber(row.distance_meters),
    caloriesKilocalories: toNumber(row.calories_kilocalories),
    averageHeartRateBpm: toNumber(row.average_heart_rate_bpm),
  };
}

function toActivityDetails(row: ActivityRow): McpActivityDetails {
  return {
    ...toActivitySummary(row),
    activeDurationSeconds: toNumber(row.active_duration_seconds),
    pausedDurationSeconds: toNumber(row.paused_duration_seconds),
    elevationGainMeters: toNumber(row.elevation_gain_meters),
    averageCadenceRpm: toNumber(row.average_cadence_rpm),
    averageSpeedMetersPerSecond: toNumber(
      row.average_speed_meters_per_second,
    ),
    averagePowerWatts: toNumber(row.average_power_watts),
    normalizedPowerWatts: toNumber(row.normalized_power_watts),
    trainingStressScore: toNumber(row.training_stress_score),
    workJoules: toNumber(row.work_joules),
    timeZone: row.time_zone,
    isManual: row.is_manual,
    isEdited: row.is_edited,
    syncedAt: toIsoString(row.synced_at),
  };
}

export async function getMcpAthleteProfiles(
  userId: string,
): Promise<readonly McpAthleteProfile[]> {
  const sql = getDatabase();
  const rows = await sql`
    SELECT provider, display_name, height_meters, weight_kilograms,
           birth_date, gender_code, synced_at
      FROM provider_profiles
     WHERE user_id = ${userId}
     ORDER BY provider ASC
  ` as ProfileRow[];

  return rows.map((row) => ({
    provider: row.provider,
    displayName: row.display_name,
    heightMeters: toNumber(row.height_meters),
    weightKilograms: toNumber(row.weight_kilograms),
    birthDate: toDateString(row.birth_date),
    genderCode: row.gender_code === null ? null : Number(row.gender_code),
    syncedAt: toIsoString(row.synced_at),
  }));
}

export async function listMcpActivities(input: Readonly<{
  userId: string;
  provider?: ProviderId;
  from?: string;
  to?: string;
  activityTypeId?: string;
  limit: number;
}>): Promise<readonly McpActivitySummary[]> {
  const sql = getDatabase();
  const from = toUtcDayStart(input.from);
  const toExclusive = toUtcNextDayStart(input.to);
  const provider = input.provider ?? null;
  const activityTypeId = input.activityTypeId ?? null;
  const rows = await sql`
    SELECT id, provider, name, activity_type_id, started_at,
           duration_seconds, active_duration_seconds, paused_duration_seconds,
           distance_meters, elevation_gain_meters, calories_kilocalories,
           average_heart_rate_bpm, average_cadence_rpm,
           average_speed_meters_per_second, average_power_watts,
           normalized_power_watts, training_stress_score, work_joules,
           time_zone, is_manual, is_edited, synced_at
      FROM fitness_activities
     WHERE user_id = ${input.userId}
       AND (${provider}::text IS NULL OR provider = ${provider})
       AND (${from}::timestamptz IS NULL OR started_at >= ${from}::timestamptz)
       AND (${toExclusive}::timestamptz IS NULL OR started_at < ${toExclusive}::timestamptz)
       AND (${activityTypeId}::text IS NULL OR activity_type_id = ${activityTypeId})
     ORDER BY started_at DESC
     LIMIT ${input.limit}
  ` as ActivityRow[];

  return rows.map(toActivitySummary);
}

export async function getMcpActivity(
  userId: string,
  activityId: string,
): Promise<McpActivityDetails | null> {
  const sql = getDatabase();
  const rows = await sql`
    SELECT id, provider, name, activity_type_id, started_at,
           duration_seconds, active_duration_seconds, paused_duration_seconds,
           distance_meters, elevation_gain_meters, calories_kilocalories,
           average_heart_rate_bpm, average_cadence_rpm,
           average_speed_meters_per_second, average_power_watts,
           normalized_power_watts, training_stress_score, work_joules,
           time_zone, is_manual, is_edited, synced_at
      FROM fitness_activities
     WHERE user_id = ${userId}
       AND id = ${activityId}
     LIMIT 1
  ` as ActivityRow[];

  return rows[0] ? toActivityDetails(rows[0]) : null;
}
