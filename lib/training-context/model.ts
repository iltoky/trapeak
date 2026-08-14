import type { McpActivityDetails, McpAthleteProfile } from "../mcp/data";
import type { NutritionEntry } from "../nutrition/data";
import {
  calculateProfileCompleteness,
  isProfileFieldComplete,
  type UserProfileRecord,
} from "../profile/model.ts";

const DAY_MS = 24 * 60 * 60 * 1000;
export const HIGH_LOAD_TSS_THRESHOLD = 80;

export type TrainingContextActivity = McpActivityDetails & Readonly<{
  localDate: string;
}>;

export type TrainingLoadTypeSummary = Readonly<{
  provider: McpActivityDetails["provider"];
  activityTypeId: string | null;
  activityTypeName: string | null;
  activityCount: number;
  durationSeconds: number;
  distanceMeters: number;
  trainingStressScore: number | null;
}>;

export type TrainingLoadWindow = Readonly<{
  label: "last7Days" | "previous7Days" | "history";
  from: string;
  to: string;
  activityCount: number;
  trainingDayCount: number;
  durationSeconds: number;
  activeDurationSeconds: number;
  distanceMeters: number;
  caloriesKilocalories: number;
  trainingStressScore: number | null;
  activitiesWithTrainingStressScore: number;
  byActivityType: readonly TrainingLoadTypeSummary[];
}>;

export type NutritionContextDay = Readonly<{
  date: string;
  entryCount: number;
  caloriesKilocalories: number;
  proteinGrams: number;
  carbohydratesGrams: number;
  fatGrams: number;
}>;

export type TrainingContext = Readonly<{
  asOf: string;
  utcOffsetMinutes: number;
  historyDays: number;
  profiles: readonly McpAthleteProfile[];
  userProfile: UserProfileRecord | null;
  recentActivities: readonly TrainingContextActivity[];
  loadWindows: readonly TrainingLoadWindow[];
  sequence: Readonly<{
    latestTrainingDate: string | null;
    daysSinceLastActivity: number | null;
    consecutiveTrainingDays: number;
    activitiesLast72Hours: number;
    highLoadTssThreshold: number;
    highLoadActivitiesLast72Hours: number;
    latestHighLoadActivityStreak: number;
  }>;
  comparison: Readonly<{
    sevenDayDurationChangePercent: number | null;
    sevenDayDistanceChangePercent: number | null;
    sevenDayTrainingStressChangePercent: number | null;
  }>;
  nutrition: Readonly<{
    today: NutritionContextDay | null;
    recentDays: readonly NutritionContextDay[];
    loggedDayCount: number;
  }>;
  dataAvailability: Readonly<{
    activityHistoryTruncated: boolean;
    nutritionHistoryTruncated: boolean;
    activitiesWithHeartRate: number;
    activitiesWithTrainingStressScore: number;
    providerProfileAvailable: boolean;
    userProfileAvailable: boolean;
    profileCompletenessPercent: number;
    goalsAndRestrictionsAvailable: boolean;
    healthAndMedicationContextAvailable: boolean;
    sleepAvailable: false;
    recoveryAvailable: false;
    limitations: readonly string[];
  }>;
}>;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function toLocalDate(value: Date, utcOffsetMinutes: number): string {
  return new Date(value.getTime() + utcOffsetMinutes * 60_000)
    .toISOString()
    .slice(0, 10);
}

function localDayStart(value: Date, utcOffsetMinutes: number): Date {
  const local = new Date(value.getTime() + utcOffsetMinutes * 60_000);
  return new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate())
      - utcOffsetMinutes * 60_000,
  );
}

function dateKeyToEpochDay(value: string): number {
  return Math.floor(new Date(`${value}T00:00:00.000Z`).getTime() / DAY_MS);
}

function sum(
  activities: readonly McpActivityDetails[],
  select: (activity: McpActivityDetails) => number | null,
): number {
  return round(activities.reduce((total, activity) => total + (select(activity) ?? 0), 0));
}

function summarizeLoadWindow(
  label: TrainingLoadWindow["label"],
  from: Date,
  to: Date,
  activities: readonly TrainingContextActivity[],
): TrainingLoadWindow {
  const selected = activities.filter((activity) => {
    const startedAt = new Date(activity.startedAt).getTime();
    return startedAt >= from.getTime() && startedAt <= to.getTime();
  });
  const withTss = selected.filter((activity) => activity.trainingStressScore !== null);
  const byType = new Map<string, McpActivityDetails[]>();
  for (const activity of selected) {
    const key = `${activity.provider}:${activity.activityTypeId ?? "unknown"}`;
    byType.set(key, [...(byType.get(key) ?? []), activity]);
  }

  return {
    label,
    from: from.toISOString(),
    to: to.toISOString(),
    activityCount: selected.length,
    trainingDayCount: new Set(selected.map(({ localDate }) => localDate)).size,
    durationSeconds: sum(selected, ({ durationSeconds }) => durationSeconds),
    activeDurationSeconds: sum(selected, ({ activeDurationSeconds }) => activeDurationSeconds),
    distanceMeters: sum(selected, ({ distanceMeters }) => distanceMeters),
    caloriesKilocalories: sum(selected, ({ caloriesKilocalories }) => caloriesKilocalories),
    trainingStressScore: withTss.length > 0
      ? sum(withTss, ({ trainingStressScore }) => trainingStressScore)
      : null,
    activitiesWithTrainingStressScore: withTss.length,
    byActivityType: [...byType.values()].map((group) => ({
      provider: group[0].provider,
      activityTypeId: group[0].activityTypeId,
      activityTypeName: group[0].activityTypeName,
      activityCount: group.length,
      durationSeconds: sum(group, ({ durationSeconds }) => durationSeconds),
      distanceMeters: sum(group, ({ distanceMeters }) => distanceMeters),
      trainingStressScore: group.some(({ trainingStressScore }) => trainingStressScore !== null)
        ? sum(group, ({ trainingStressScore }) => trainingStressScore)
        : null,
    })).sort((left, right) => right.activityCount - left.activityCount),
  };
}

function percentChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) {
    return null;
  }
  return round(((current - previous) / previous) * 100);
}

function summarizeNutrition(
  entries: readonly NutritionEntry[],
  utcOffsetMinutes: number,
): readonly NutritionContextDay[] {
  const days = new Map<string, NutritionContextDay>();
  for (const entry of entries) {
    const date = toLocalDate(new Date(entry.consumedAt), utcOffsetMinutes);
    const current = days.get(date) ?? {
      date,
      entryCount: 0,
      caloriesKilocalories: 0,
      proteinGrams: 0,
      carbohydratesGrams: 0,
      fatGrams: 0,
    };
    days.set(date, {
      date,
      entryCount: current.entryCount + 1,
      caloriesKilocalories: round(current.caloriesKilocalories + entry.caloriesKilocalories),
      proteinGrams: round(current.proteinGrams + entry.proteinGrams),
      carbohydratesGrams: round(current.carbohydratesGrams + entry.carbohydratesGrams),
      fatGrams: round(current.fatGrams + entry.fatGrams),
    });
  }
  return [...days.values()].sort((left, right) => left.date.localeCompare(right.date));
}

export function buildTrainingContext(input: Readonly<{
  asOf: Date;
  utcOffsetMinutes: number;
  historyDays: number;
  profiles: readonly McpAthleteProfile[];
  userProfile: UserProfileRecord | null;
  activities: readonly McpActivityDetails[];
  nutritionEntries: readonly NutritionEntry[];
  activityHistoryTruncated?: boolean;
  nutritionHistoryTruncated?: boolean;
}>): TrainingContext {
  const asOfMs = input.asOf.getTime();
  const historyFrom = new Date(asOfMs - input.historyDays * DAY_MS);
  const last7From = new Date(asOfMs - 7 * DAY_MS);
  const previous7From = new Date(asOfMs - 14 * DAY_MS);
  const activities = input.activities
    .filter(({ startedAt }) => {
      const timestamp = new Date(startedAt).getTime();
      return timestamp >= historyFrom.getTime() && timestamp <= asOfMs;
    })
    .sort((left, right) => Date.parse(right.startedAt) - Date.parse(left.startedAt))
    .map((activity) => ({
      ...activity,
      localDate: toLocalDate(new Date(activity.startedAt), input.utcOffsetMinutes),
    }));

  const last7Days = summarizeLoadWindow("last7Days", last7From, input.asOf, activities);
  const previous7Days = summarizeLoadWindow(
    "previous7Days",
    previous7From,
    new Date(last7From.getTime() - 1),
    activities,
  );
  const history = summarizeLoadWindow("history", historyFrom, input.asOf, activities);

  const trainingDates = [...new Set(activities.map(({ localDate }) => localDate))]
    .sort((left, right) => right.localeCompare(left));
  let consecutiveTrainingDays = trainingDates.length > 0 ? 1 : 0;
  for (let index = 1; index < trainingDates.length; index += 1) {
    if (dateKeyToEpochDay(trainingDates[index - 1]) - dateKeyToEpochDay(trainingDates[index]) !== 1) {
      break;
    }
    consecutiveTrainingDays += 1;
  }

  const seventyTwoHoursAgo = asOfMs - 72 * 60 * 60 * 1000;
  const last72Hours = activities.filter(
    ({ startedAt }) => Date.parse(startedAt) >= seventyTwoHoursAgo,
  );
  let latestHighLoadActivityStreak = 0;
  for (const activity of activities) {
    if (
      activity.trainingStressScore === null
      || activity.trainingStressScore < HIGH_LOAD_TSS_THRESHOLD
    ) {
      break;
    }
    latestHighLoadActivityStreak += 1;
  }

  const todayDate = toLocalDate(input.asOf, input.utcOffsetMinutes);
  const nutritionDays = summarizeNutrition(input.nutritionEntries, input.utcOffsetMinutes);
  const latestTrainingDate = trainingDates[0] ?? null;
  const daysSinceLastActivity = latestTrainingDate
    ? dateKeyToEpochDay(todayDate) - dateKeyToEpochDay(latestTrainingDate)
    : null;
  const profileCompleteness = calculateProfileCompleteness(input.userProfile);
  const goalsAvailable = input.userProfile
    ? isProfileFieldComplete(input.userProfile, "goals")
    : false;
  const healthProfileFields = [
    "injuries",
    "healthConditions",
    "contraindications",
    "medications",
  ] as const;
  const healthAndMedicationContextAvailable = input.userProfile
    ? healthProfileFields.every(
      (field) => isProfileFieldComplete(input.userProfile!, field),
    )
    : false;
  const goalsAndRestrictionsAvailable = goalsAvailable && healthAndMedicationContextAvailable;
  const limitations = [
    "Connected sleep, HRV, readiness, and recovery measurements are not available yet; a profile sleep schedule is not a current recovery measurement.",
    "High-load signals use provider TSS >= 80 and do not by themselves classify a workout as anaerobic.",
  ];
  if (!input.userProfile) {
    limitations.unshift(
      "No custom TRAPEAK user profile is stored; goals, schedule, health context, and medications are unavailable.",
    );
  } else if (!goalsAndRestrictionsAvailable) {
    limitations.unshift(
      `The custom user profile is ${profileCompleteness.percent}% complete; goals or health and medication context is incomplete.`,
    );
  }
  if (history.activitiesWithTrainingStressScore < history.activityCount) {
    limitations.push(
      "Some activities have no provider TSS; use their type, name, duration, heart rate, and sequence as supporting context.",
    );
  }

  return {
    asOf: input.asOf.toISOString(),
    utcOffsetMinutes: input.utcOffsetMinutes,
    historyDays: input.historyDays,
    profiles: [...input.profiles],
    userProfile: input.userProfile,
    recentActivities: activities,
    loadWindows: [last7Days, previous7Days, history],
    sequence: {
      latestTrainingDate,
      daysSinceLastActivity,
      consecutiveTrainingDays,
      activitiesLast72Hours: last72Hours.length,
      highLoadTssThreshold: HIGH_LOAD_TSS_THRESHOLD,
      highLoadActivitiesLast72Hours: last72Hours.filter(
        ({ trainingStressScore }) =>
          trainingStressScore !== null && trainingStressScore >= HIGH_LOAD_TSS_THRESHOLD,
      ).length,
      latestHighLoadActivityStreak,
    },
    comparison: {
      sevenDayDurationChangePercent: percentChange(
        last7Days.durationSeconds,
        previous7Days.durationSeconds,
      ),
      sevenDayDistanceChangePercent: percentChange(
        last7Days.distanceMeters,
        previous7Days.distanceMeters,
      ),
      sevenDayTrainingStressChangePercent: percentChange(
        last7Days.trainingStressScore,
        previous7Days.trainingStressScore,
      ),
    },
    nutrition: {
      today: nutritionDays.find(({ date }) => date === todayDate) ?? null,
      recentDays: nutritionDays,
      loggedDayCount: nutritionDays.length,
    },
    dataAvailability: {
      activityHistoryTruncated: input.activityHistoryTruncated ?? false,
      nutritionHistoryTruncated: input.nutritionHistoryTruncated ?? false,
      activitiesWithHeartRate: activities.filter(
        ({ averageHeartRateBpm }) => averageHeartRateBpm !== null,
      ).length,
      activitiesWithTrainingStressScore: history.activitiesWithTrainingStressScore,
      providerProfileAvailable: input.profiles.length > 0,
      userProfileAvailable: input.userProfile !== null,
      profileCompletenessPercent: profileCompleteness.percent,
      goalsAndRestrictionsAvailable,
      healthAndMedicationContextAvailable,
      sleepAvailable: false,
      recoveryAvailable: false,
      limitations,
    },
  };
}
