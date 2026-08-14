import { z } from "zod";

const DAY_MS = 24 * 60 * 60 * 1000;

export const weightEntrySources = [
  "ai",
  "manual",
  "provider",
  "profile_migration",
] as const;

export type WeightEntrySource = (typeof weightEntrySources)[number];

export const weightEntryInputSchema = z.object({
  measuredAt: z.string().datetime({ offset: true }),
  weightKilograms: z.number().min(20).max(500),
  notes: z.string().trim().min(1).max(1000).nullable().optional(),
});

export type WeightEntryInput = Readonly<{
  measuredAt: Date;
  weightKilograms: number;
  notes: string | null;
  source: WeightEntrySource;
}>;

export type WeightEntry = Readonly<{
  id: string;
  measuredAt: string;
  weightKilograms: number;
  notes: string | null;
  source: WeightEntrySource;
}>;

export type WeightStatus = Readonly<{
  latest: WeightEntry | null;
  changesKilograms: Readonly<{
    days7: number | null;
    days30: number | null;
    days90: number | null;
  }>;
  reminderIntervalDays: number;
  daysSinceLastMeasurement: number | null;
  nextSuggestedMeasurementAt: string | null;
  weightUpdateDue: boolean;
}>;

export function parseWeightEntryInput(
  value: Readonly<Record<string, unknown>>,
  source: WeightEntrySource = "ai",
): WeightEntryInput {
  const parsed = weightEntryInputSchema.parse(value);
  return {
    measuredAt: new Date(parsed.measuredAt),
    weightKilograms: parsed.weightKilograms,
    notes: parsed.notes?.trim() || null,
    source,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function changeForWindow(
  entriesNewestFirst: readonly WeightEntry[],
  latest: WeightEntry,
  days: number,
): number | null {
  const cutoff = Date.parse(latest.measuredAt) - days * DAY_MS;
  const baseline = entriesNewestFirst.find(
    ({ measuredAt }) => Date.parse(measuredAt) <= cutoff,
  );
  return baseline
    ? round(latest.weightKilograms - baseline.weightKilograms)
    : null;
}

export function getWeightReminderIntervalDays(input: Readonly<{
  goals?: readonly Readonly<{ type: string }>[] | null;
  configuredIntervalDays?: number | null;
}>): number {
  if (input.configuredIntervalDays !== null && input.configuredIntervalDays !== undefined) {
    return input.configuredIntervalDays;
  }
  return input.goals?.some(({ type }) => type === "weight_loss") ? 14 : 30;
}

export function calculateWeightStatus(input: Readonly<{
  entries: readonly WeightEntry[];
  asOf: Date;
  goals?: readonly Readonly<{ type: string }>[] | null;
  configuredIntervalDays?: number | null;
}>): WeightStatus {
  const entries = [...input.entries]
    .sort((left, right) => Date.parse(right.measuredAt) - Date.parse(left.measuredAt));
  const latest = entries[0] ?? null;
  const reminderIntervalDays = getWeightReminderIntervalDays(input);

  if (!latest) {
    return {
      latest: null,
      changesKilograms: { days7: null, days30: null, days90: null },
      reminderIntervalDays,
      daysSinceLastMeasurement: null,
      nextSuggestedMeasurementAt: null,
      weightUpdateDue: true,
    };
  }

  const latestAt = Date.parse(latest.measuredAt);
  const nextSuggestedAt = latestAt + reminderIntervalDays * DAY_MS;
  const elapsedDays = Math.max(0, Math.floor((input.asOf.getTime() - latestAt) / DAY_MS));
  return {
    latest,
    changesKilograms: {
      days7: changeForWindow(entries, latest, 7),
      days30: changeForWindow(entries, latest, 30),
      days90: changeForWindow(entries, latest, 90),
    },
    reminderIntervalDays,
    daysSinceLastMeasurement: elapsedDays,
    nextSuggestedMeasurementAt: new Date(nextSuggestedAt).toISOString(),
    weightUpdateDue: input.asOf.getTime() >= nextSuggestedAt,
  };
}
