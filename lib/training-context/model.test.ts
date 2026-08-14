import assert from "node:assert/strict";
import test from "node:test";

import { buildTrainingContext } from "./model.ts";
import { emptyUserProfile } from "../profile/model.ts";

function activity(input: Readonly<{
  id: string;
  startedAt: string;
  durationSeconds?: number;
  distanceMeters?: number;
  trainingStressScore?: number;
  averageHeartRateBpm?: number;
}>) {
  return {
    id: input.id,
    provider: "wahoo" as const,
    name: "Run",
    activityTypeId: "1",
    activityTypeName: "Running",
    startedAt: input.startedAt,
    durationSeconds: input.durationSeconds ?? 3600,
    activeDurationSeconds: input.durationSeconds ?? 3600,
    pausedDurationSeconds: 0,
    distanceMeters: input.distanceMeters ?? 10_000,
    elevationGainMeters: 0,
    caloriesKilocalories: 700,
    averageHeartRateBpm: input.averageHeartRateBpm ?? null,
    averageCadenceRpm: null,
    averageSpeedMetersPerSecond: null,
    averagePowerWatts: null,
    normalizedPowerWatts: null,
    trainingStressScore: input.trainingStressScore ?? null,
    workJoules: null,
    timeZone: "Europe/Warsaw",
    isManual: false,
    isEdited: false,
    syncedAt: "2026-08-14T07:00:00.000Z",
  };
}

test("builds historical load windows and consecutive workout signals", () => {
  const context = buildTrainingContext({
    asOf: new Date("2026-08-14T08:00:00.000Z"),
    utcOffsetMinutes: 120,
    historyDays: 28,
    profiles: [],
    userProfile: null,
    activities: [
      activity({
        id: "00000000-0000-4000-8000-000000000001",
        startedAt: "2026-08-14T05:00:00.000Z",
        trainingStressScore: 95,
      }),
      activity({
        id: "00000000-0000-4000-8000-000000000002",
        startedAt: "2026-08-13T05:00:00.000Z",
        trainingStressScore: 90,
      }),
      activity({
        id: "00000000-0000-4000-8000-000000000003",
        startedAt: "2026-08-12T05:00:00.000Z",
        trainingStressScore: 40,
      }),
      activity({
        id: "00000000-0000-4000-8000-000000000004",
        startedAt: "2026-08-04T05:00:00.000Z",
        durationSeconds: 1800,
        distanceMeters: 5_000,
        trainingStressScore: 40,
      }),
    ],
    nutritionEntries: [],
  });

  assert.equal(context.recentActivities[0].localDate, "2026-08-14");
  assert.equal(context.sequence.consecutiveTrainingDays, 3);
  assert.equal(context.sequence.activitiesLast72Hours, 3);
  assert.equal(context.sequence.highLoadActivitiesLast72Hours, 2);
  assert.equal(context.sequence.latestHighLoadActivityStreak, 2);
  assert.equal(context.loadWindows[0].activityCount, 3);
  assert.equal(context.loadWindows[1].activityCount, 1);
  assert.equal(context.comparison.sevenDayDurationChangePercent, 500);
  assert.equal(context.decisionSupport.interpretation, "context_only");
  assert.equal(context.decisionSupport.readinessScoreAvailable, false);
  assert.equal(context.decisionSupport.freshUserCheckInRequired, true);
  assert.match(context.decisionSupport.principles[0], /one input rather than a decision rule/);
});

test("groups nutrition by the user's local date and reports missing sources", () => {
  const context = buildTrainingContext({
    asOf: new Date("2026-08-14T08:00:00.000Z"),
    utcOffsetMinutes: 120,
    historyDays: 28,
    profiles: [],
    userProfile: null,
    activities: [activity({
      id: "00000000-0000-4000-8000-000000000001",
      startedAt: "2026-08-13T20:00:00.000Z",
      averageHeartRateBpm: 150,
    })],
    nutritionEntries: [{
      id: "00000000-0000-4000-8000-000000000010",
      consumedAt: "2026-08-13T22:30:00.000Z",
      mealType: "breakfast",
      description: "Eggs",
      caloriesKilocalories: 300,
      proteinGrams: 20,
      carbohydratesGrams: 5,
      fatGrams: 20,
      notes: null,
      estimated: true,
      estimationNotes: "Estimated portion",
      source: "ai",
    }],
  });

  assert.equal(context.nutrition.today?.date, "2026-08-14");
  assert.equal(context.nutrition.today?.caloriesKilocalories, 300);
  assert.equal(context.dataAvailability.activitiesWithHeartRate, 1);
  assert.equal(context.dataAvailability.activitiesWithTrainingStressScore, 0);
  assert.equal(context.dataAvailability.sleepAvailable, false);
  assert.equal(context.dataAvailability.dailyActivityAvailable, false);
  assert.equal(context.dataAvailability.stressAvailable, false);
  assert.equal(context.dataAvailability.subjectiveCheckInAvailable, false);
  assert.match(context.dataAvailability.limitations.at(-1) ?? "", /no provider TSS/);
});

test("does not turn an empty nutrition log into zero calorie intake", () => {
  const context = buildTrainingContext({
    asOf: new Date("2026-08-14T08:00:00.000Z"),
    utcOffsetMinutes: 0,
    historyDays: 28,
    profiles: [],
    userProfile: null,
    activities: [],
    nutritionEntries: [],
  });

  assert.equal(context.nutrition.today, null);
  assert.equal(context.sequence.daysSinceLastActivity, null);
  assert.equal(context.comparison.sevenDayTrainingStressChangePercent, null);
});

test("includes custom goals, health context, and medications", () => {
  const context = buildTrainingContext({
    asOf: new Date("2026-08-14T08:00:00.000Z"),
    utcOffsetMinutes: 120,
    historyDays: 28,
    profiles: [],
    userProfile: {
      profile: {
        ...emptyUserProfile,
        goals: [{
          type: "running_distance",
          description: "Run 10 km comfortably",
          priority: "primary",
        }],
        injuries: [],
        healthConditions: [],
        contraindications: [],
        medications: [{
          name: "Example medication",
          dosage: "10 mg",
        }],
      },
      fieldStatuses: {},
      createdAt: "2026-08-14T07:00:00.000Z",
      updatedAt: "2026-08-14T07:00:00.000Z",
    },
    profileDerived: { ageYears: 34 },
    weight: {
      latest: {
        id: "00000000-0000-4000-8000-000000000020",
        measuredAt: "2026-08-14T06:00:00.000Z",
        weightKilograms: 90,
        notes: null,
        source: "ai",
      },
      changesKilograms: { days7: -0.5, days30: -2, days90: null },
      reminderIntervalDays: 30,
      daysSinceLastMeasurement: 0,
      nextSuggestedMeasurementAt: "2026-09-13T06:00:00.000Z",
      weightUpdateDue: false,
    },
    activities: [],
    nutritionEntries: [],
  });

  assert.equal(context.userProfile?.profile.medications?.[0]?.dosage, "10 mg");
  assert.equal(context.profileDerived.ageYears, 34);
  assert.equal(context.weight.latest?.weightKilograms, 90);
  assert.equal(context.dataAvailability.userProfileAvailable, true);
  assert.equal(context.dataAvailability.goalsAndRestrictionsAvailable, true);
  assert.equal(context.dataAvailability.healthAndMedicationContextAvailable, true);
  assert.ok(context.dataAvailability.profileCompletenessPercent > 0);
});
