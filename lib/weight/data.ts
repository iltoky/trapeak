import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { getDatabase } from "../db/client";
import { toUtcDayStart, toUtcNextDayStart } from "../mcp/dates";
import {
  calculateWeightStatus,
  type WeightEntry,
  type WeightEntryInput,
  type WeightEntrySource,
  type WeightStatus,
} from "./model";

type WeightEntryRow = Readonly<{
  id: string;
  measured_at: string | Date;
  weight_kg: number | string;
  notes: string | null;
  source: WeightEntrySource;
}>;

export type CreateWeightEntryResult = Readonly<{
  id: string;
  created: boolean;
}>;

function toEntry(row: WeightEntryRow): WeightEntry {
  return {
    id: row.id,
    measuredAt: new Date(row.measured_at).toISOString(),
    weightKilograms: Number(row.weight_kg),
    notes: row.notes,
    source: row.source,
  };
}

function isMissingWeightTable(error: unknown): boolean {
  return Boolean(
    error
    && typeof error === "object"
    && "code" in error
    && (error as { code?: unknown }).code === "42P01",
  );
}

function createIdempotencyKey(input: WeightEntryInput): string {
  return createHash("sha256").update(JSON.stringify({
    measuredAt: input.measuredAt.toISOString(),
    weightKilograms: input.weightKilograms,
    notes: input.notes,
  })).digest("hex");
}

export async function createWeightEntry(
  userId: string,
  input: WeightEntryInput,
): Promise<CreateWeightEntryResult> {
  const sql = getDatabase();
  const id = randomUUID();
  const idempotencyKey = createIdempotencyKey(input);
  const inserted = await sql`
    INSERT INTO weight_entries (
      id, user_id, measured_at, weight_kg, notes, source, idempotency_key
    ) VALUES (
      ${id}, ${userId}, ${input.measuredAt.toISOString()},
      ${input.weightKilograms}, ${input.notes}, ${input.source}, ${idempotencyKey}
    )
    ON CONFLICT (user_id, idempotency_key) DO NOTHING
    RETURNING id
  ` as Array<{ id: string }>;
  if (inserted[0]) {
    return { id: inserted[0].id, created: true };
  }
  const existing = await sql`
    SELECT id
      FROM weight_entries
     WHERE user_id = ${userId}
       AND idempotency_key = ${idempotencyKey}
     LIMIT 1
  ` as Array<{ id: string }>;
  if (!existing[0]) {
    throw new Error("Weight entry was not created");
  }
  return { id: existing[0].id, created: false };
}

export async function listWeightEntries(input: Readonly<{
  userId: string;
  from?: string;
  to?: string;
  limit: number;
}>): Promise<readonly WeightEntry[]> {
  const sql = getDatabase();
  const from = toUtcDayStart(input.from);
  const toExclusive = toUtcNextDayStart(input.to);
  try {
    const rows = await sql`
      SELECT id, measured_at, weight_kg, notes, source
        FROM weight_entries
       WHERE user_id = ${input.userId}
         AND (${from}::timestamptz IS NULL OR measured_at >= ${from}::timestamptz)
         AND (${toExclusive}::timestamptz IS NULL OR measured_at < ${toExclusive}::timestamptz)
       ORDER BY measured_at DESC
       LIMIT ${input.limit}
    ` as WeightEntryRow[];
    return rows.map(toEntry);
  } catch (error) {
    if (isMissingWeightTable(error)) {
      return [];
    }
    throw error;
  }
}

export async function getWeightStatus(input: Readonly<{
  userId: string;
  asOf?: Date;
  goals?: readonly Readonly<{ type: string }>[] | null;
  configuredIntervalDays?: number | null;
}>): Promise<WeightStatus> {
  const entries = await listWeightEntries({ userId: input.userId, limit: 500 });
  return calculateWeightStatus({
    entries,
    asOf: input.asOf ?? new Date(),
    goals: input.goals,
    configuredIntervalDays: input.configuredIntervalDays,
  });
}

export async function deleteWeightEntry(userId: string, id: string): Promise<boolean> {
  const sql = getDatabase();
  const deleted = await sql`
    DELETE FROM weight_entries
     WHERE user_id = ${userId}
       AND id = ${id}
    RETURNING id
  ` as Array<{ id: string }>;
  return deleted.length > 0;
}
