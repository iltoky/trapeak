import "server-only";

import { randomUUID } from "node:crypto";

import { getDatabase } from "../db/client";
import { toUtcDayStart, toUtcNextDayStart } from "../mcp/dates";
import type { NutritionEntryInput, NutritionMealType } from "./model";

export type NutritionEntry = Readonly<{
  id: string;
  consumedAt: string;
  mealType: NutritionMealType;
  title: string;
  caloriesKilocalories: number;
  proteinGrams: number;
  carbohydratesGrams: number;
  fatGrams: number;
  notes: string | null;
}>;

export type NutritionDaySummary = Readonly<{
  date: string;
  entryCount: number;
  caloriesKilocalories: number;
  proteinGrams: number;
  carbohydratesGrams: number;
  fatGrams: number;
}>;

type NutritionEntryRow = Readonly<{
  id: string;
  consumed_at: string | Date;
  meal_type: NutritionMealType;
  title: string;
  calories_kilocalories: number | string;
  protein_grams: number | string;
  carbohydrates_grams: number | string;
  fat_grams: number | string;
  notes: string | null;
}>;

type NutritionSummaryRow = Readonly<{
  date: string | Date;
  entry_count: number | string;
  calories_kilocalories: number | string;
  protein_grams: number | string;
  carbohydrates_grams: number | string;
  fat_grams: number | string;
}>;

function toEntry(row: NutritionEntryRow): NutritionEntry {
  return {
    id: row.id,
    consumedAt: new Date(row.consumed_at).toISOString(),
    mealType: row.meal_type,
    title: row.title,
    caloriesKilocalories: Number(row.calories_kilocalories),
    proteinGrams: Number(row.protein_grams),
    carbohydratesGrams: Number(row.carbohydrates_grams),
    fatGrams: Number(row.fat_grams),
    notes: row.notes,
  };
}

export async function createNutritionEntry(
  userId: string,
  input: NutritionEntryInput,
): Promise<string> {
  const sql = getDatabase();
  const id = randomUUID();
  await sql`
    INSERT INTO nutrition_entries (
      id, user_id, consumed_at, meal_type, title,
      calories_kilocalories, protein_grams, carbohydrates_grams,
      fat_grams, notes
    ) VALUES (
      ${id}, ${userId}, ${input.consumedAt.toISOString()}, ${input.mealType},
      ${input.title}, ${input.caloriesKilocalories}, ${input.proteinGrams},
      ${input.carbohydratesGrams}, ${input.fatGrams}, ${input.notes}
    )
  `;
  return id;
}

export async function deleteNutritionEntry(userId: string, id: string) {
  const sql = getDatabase();
  await sql`
    DELETE FROM nutrition_entries
     WHERE user_id = ${userId}
       AND id = ${id}
  `;
}

export async function listNutritionEntries(input: Readonly<{
  userId: string;
  from?: string;
  to?: string;
  mealType?: NutritionMealType;
  limit: number;
}>): Promise<readonly NutritionEntry[]> {
  const sql = getDatabase();
  const from = toUtcDayStart(input.from);
  const toExclusive = toUtcNextDayStart(input.to);
  const mealType = input.mealType ?? null;
  const rows = await sql`
    SELECT id, consumed_at, meal_type, title, calories_kilocalories,
           protein_grams, carbohydrates_grams, fat_grams, notes
      FROM nutrition_entries
     WHERE user_id = ${input.userId}
       AND (${from}::timestamptz IS NULL OR consumed_at >= ${from}::timestamptz)
       AND (${toExclusive}::timestamptz IS NULL OR consumed_at < ${toExclusive}::timestamptz)
       AND (${mealType}::text IS NULL OR meal_type = ${mealType})
     ORDER BY consumed_at DESC
     LIMIT ${input.limit}
  ` as NutritionEntryRow[];
  return rows.map(toEntry);
}

export async function getNutritionDaySummaries(input: Readonly<{
  userId: string;
  from: string;
  to: string;
}>): Promise<readonly NutritionDaySummary[]> {
  const sql = getDatabase();
  const from = toUtcDayStart(input.from);
  const toExclusive = toUtcNextDayStart(input.to);
  const rows = await sql`
    SELECT (consumed_at AT TIME ZONE 'UTC')::date AS date,
           COUNT(*) AS entry_count,
           SUM(calories_kilocalories) AS calories_kilocalories,
           SUM(protein_grams) AS protein_grams,
           SUM(carbohydrates_grams) AS carbohydrates_grams,
           SUM(fat_grams) AS fat_grams
      FROM nutrition_entries
     WHERE user_id = ${input.userId}
       AND consumed_at >= ${from}::timestamptz
       AND consumed_at < ${toExclusive}::timestamptz
     GROUP BY (consumed_at AT TIME ZONE 'UTC')::date
     ORDER BY date ASC
  ` as NutritionSummaryRow[];

  return rows.map((row) => ({
    date: new Date(row.date).toISOString().slice(0, 10),
    entryCount: Number(row.entry_count),
    caloriesKilocalories: Number(row.calories_kilocalories),
    proteinGrams: Number(row.protein_grams),
    carbohydratesGrams: Number(row.carbohydrates_grams),
    fatGrams: Number(row.fat_grams),
  }));
}
