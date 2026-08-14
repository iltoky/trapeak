import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { auth } from "@clerk/nextjs/server";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";

import { requireMcpUserId } from "@/lib/mcp/auth";
import { getIsoUtcOffsetMinutes } from "@/lib/mcp/dates";
import {
  createLabReport,
  deleteLabReport,
  getLabReport,
  getLabResultHistory,
  listLabReports,
} from "@/lib/labs/data";
import {
  labResultFlags,
  labTestTypes,
  parseLabReportInput,
} from "@/lib/labs/model";
import {
  getMcpActivity,
  getMcpAthleteProfiles,
  listMcpActivities,
} from "@/lib/mcp/data";
import { getTrainingContext } from "@/lib/training-context/data";
import {
  createNutritionEntry,
  deleteNutritionEntry,
  getNutritionDaySummaries,
  listNutritionEntries,
} from "@/lib/nutrition/data";
import { nutritionMealTypes, parseNutritionEntryInput } from "@/lib/nutrition/model";
import { deletionConfirmationSchema } from "@/lib/mcp/deletion";
import {
  deleteUserProfile,
  getUserProfile,
  updateUserProfile,
} from "@/lib/profile/data";
import {
  profileFieldKeys,
  profileFieldStatusUpdateSchema,
  profileFieldStatusValues,
  profileSectionKeys,
  userProfilePatchSchema,
  userProfileSchema,
} from "@/lib/profile/model";
import {
  createWeightEntry,
  deleteWeightEntry,
  listWeightEntries,
} from "@/lib/weight/data";
import {
  parseWeightEntryInput,
  weightEntrySources,
} from "@/lib/weight/model";

const providerSchema = z.enum(["garmin", "suunto", "wahoo"]);
const nullableNumber = z.number().nullable();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const mealTypeSchema = z.enum(nutritionMealTypes);
const labTestTypeSchema = z.enum(labTestTypes);
const labResultFlagSchema = z.enum(labResultFlags);
const activitySummarySchema = z.object({
  id: z.string().uuid(),
  provider: providerSchema,
  name: z.string().nullable(),
  activityTypeId: z.string().nullable(),
  activityTypeName: z.string().nullable(),
  startedAt: z.string(),
  durationSeconds: nullableNumber,
  distanceMeters: nullableNumber,
  caloriesKilocalories: nullableNumber,
  averageHeartRateBpm: nullableNumber,
});
const activityDetailsSchema = activitySummarySchema.extend({
  activeDurationSeconds: nullableNumber,
  pausedDurationSeconds: nullableNumber,
  elevationGainMeters: nullableNumber,
  averageCadenceRpm: nullableNumber,
  averageSpeedMetersPerSecond: nullableNumber,
  averagePowerWatts: nullableNumber,
  normalizedPowerWatts: nullableNumber,
  trainingStressScore: nullableNumber,
  workJoules: nullableNumber,
  timeZone: z.string().nullable(),
  isManual: z.boolean().nullable(),
  isEdited: z.boolean().nullable(),
  syncedAt: z.string(),
});
const athleteProfileSchema = z.object({
  provider: providerSchema,
  displayName: z.string().nullable(),
  heightMeters: nullableNumber,
  weightKilograms: nullableNumber,
  birthDate: z.string().nullable(),
  genderCode: z.number().nullable(),
  syncedAt: z.string(),
});
const trainingContextActivitySchema = activityDetailsSchema.extend({
  localDate: dateSchema,
});
const trainingLoadTypeSchema = z.object({
  provider: providerSchema,
  activityTypeId: z.string().nullable(),
  activityTypeName: z.string().nullable(),
  activityCount: z.number().int(),
  durationSeconds: z.number(),
  distanceMeters: z.number(),
  trainingStressScore: nullableNumber,
});
const trainingLoadWindowSchema = z.object({
  label: z.enum(["last7Days", "previous7Days", "history"]),
  from: z.string(),
  to: z.string(),
  activityCount: z.number().int(),
  trainingDayCount: z.number().int(),
  durationSeconds: z.number(),
  activeDurationSeconds: z.number(),
  distanceMeters: z.number(),
  caloriesKilocalories: z.number(),
  trainingStressScore: nullableNumber,
  activitiesWithTrainingStressScore: z.number().int(),
  byActivityType: z.array(trainingLoadTypeSchema),
});
const trainingNutritionDaySchema = z.object({
  date: dateSchema,
  entryCount: z.number().int(),
  caloriesKilocalories: z.number(),
  proteinGrams: z.number(),
  carbohydratesGrams: z.number(),
  fatGrams: z.number(),
});
const weightEntrySchema = z.object({
  id: z.string().uuid(),
  measuredAt: z.string(),
  weightKilograms: z.number(),
  notes: z.string().nullable(),
  source: z.enum(weightEntrySources),
});
const weightStatusSchema = z.object({
  latest: weightEntrySchema.nullable(),
  changesKilograms: z.object({
    days7: nullableNumber,
    days30: nullableNumber,
    days90: nullableNumber,
  }),
  reminderIntervalDays: z.number().int().min(7).max(90),
  daysSinceLastMeasurement: z.number().int().nullable(),
  nextSuggestedMeasurementAt: z.string().nullable(),
  weightUpdateDue: z.boolean(),
});
const profileDerivedSchema = z.object({ ageYears: z.number().int().nullable() });
const trainingContextSchema = z.object({
  asOf: z.string(),
  utcOffsetMinutes: z.number().int(),
  historyDays: z.number().int(),
  profiles: z.array(athleteProfileSchema),
  userProfile: z.object({
    profile: userProfileSchema,
    fieldStatuses: z.partialRecord(
      z.enum(profileFieldKeys),
      z.enum(profileFieldStatusValues),
    ),
    createdAt: z.string(),
    updatedAt: z.string(),
  }).nullable(),
  profileDerived: profileDerivedSchema,
  weight: weightStatusSchema,
  recentActivities: z.array(trainingContextActivitySchema),
  loadWindows: z.array(trainingLoadWindowSchema),
  sequence: z.object({
    latestTrainingDate: dateSchema.nullable(),
    daysSinceLastActivity: z.number().int().nullable(),
    consecutiveTrainingDays: z.number().int(),
    activitiesLast72Hours: z.number().int(),
    highLoadTssThreshold: z.number(),
    highLoadActivitiesLast72Hours: z.number().int(),
    latestHighLoadActivityStreak: z.number().int(),
  }),
  comparison: z.object({
    sevenDayDurationChangePercent: nullableNumber,
    sevenDayDistanceChangePercent: nullableNumber,
    sevenDayTrainingStressChangePercent: nullableNumber,
  }),
  decisionSupport: z.object({
    interpretation: z.literal("context_only"),
    readinessScoreAvailable: z.literal(false),
    freshUserCheckInRequired: z.boolean(),
    checkInTopics: z.array(z.string()),
    principles: z.array(z.string()),
  }),
  nutrition: z.object({
    today: trainingNutritionDaySchema.nullable(),
    recentDays: z.array(trainingNutritionDaySchema),
    loggedDayCount: z.number().int(),
  }),
  dataAvailability: z.object({
    activityHistoryTruncated: z.boolean(),
    nutritionHistoryTruncated: z.boolean(),
    activitiesWithHeartRate: z.number().int(),
    activitiesWithTrainingStressScore: z.number().int(),
    providerProfileAvailable: z.boolean(),
    userProfileAvailable: z.boolean(),
    profileCompletenessPercent: z.number().int().min(0).max(100),
    goalsAndRestrictionsAvailable: z.boolean(),
    healthAndMedicationContextAvailable: z.boolean(),
    sleepAvailable: z.literal(false),
    dailyActivityAvailable: z.literal(false),
    stressAvailable: z.literal(false),
    recoveryAvailable: z.literal(false),
    subjectiveCheckInAvailable: z.literal(false),
    limitations: z.array(z.string()),
  }),
});
const nutritionEntrySchema = z.object({
  id: z.string().uuid(),
  consumedAt: z.string(),
  mealType: mealTypeSchema,
  description: z.string(),
  caloriesKilocalories: z.number(),
  proteinGrams: z.number(),
  carbohydratesGrams: z.number(),
  fatGrams: z.number(),
  notes: z.string().nullable(),
  estimated: z.boolean(),
  estimationNotes: z.string().nullable(),
  source: z.enum(["manual", "ai"]),
});
const nutritionDaySummarySchema = z.object({
  date: dateSchema,
  entryCount: z.number().int(),
  caloriesKilocalories: z.number(),
  proteinGrams: z.number(),
  carbohydratesGrams: z.number(),
  fatGrams: z.number(),
});
const labResultSchema = z.object({
  id: z.string().uuid(),
  analyteName: z.string(),
  valueText: z.string(),
  valueNumeric: z.number().nullable(),
  unit: z.string().nullable(),
  referenceRange: z.string().nullable(),
  referenceMin: z.number().nullable(),
  referenceMax: z.number().nullable(),
  flag: labResultFlagSchema,
});
const labReportSummarySchema = z.object({
  id: z.string().uuid(),
  collectedAt: z.string(),
  testType: labTestTypeSchema,
  title: z.string(),
  laboratory: z.string().nullable(),
  notes: z.string().nullable(),
  resultCount: z.number().int(),
});
const labReportSchema = labReportSummarySchema.extend({ results: z.array(labResultSchema) });
const labHistoryPointSchema = labResultSchema.extend({
  reportId: z.string().uuid(),
  collectedAt: z.string(),
  testType: labTestTypeSchema,
  reportTitle: z.string(),
});
const profileCompletenessSectionSchema = z.object({
  key: z.enum(profileSectionKeys),
  title: z.string(),
  percent: z.number().int().min(0).max(100),
  completedWeight: z.number().int().min(0),
  totalWeight: z.number().int().positive(),
  missingFields: z.array(z.enum(profileFieldKeys)),
});
const profileCompletenessSchema = z.object({
  percent: z.number().int().min(0).max(100),
  completedWeight: z.number().int().min(0).max(100),
  totalWeight: z.literal(100),
  stage: z.enum(["initial", "progressive", "complete"]),
  sections: z.array(profileCompletenessSectionSchema),
  suggestedNextSections: z.array(profileCompletenessSectionSchema.pick({
    key: true,
    title: true,
    percent: true,
    missingFields: true,
  })),
});
const userProfileRecordSchema = z.object({
  profile: userProfileSchema,
  fieldStatuses: z.partialRecord(
    z.enum(profileFieldKeys),
    z.enum(profileFieldStatusValues),
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
});
const userProfileResultSchema = z.object({
  userProfile: userProfileRecordSchema.nullable(),
  completeness: profileCompletenessSchema,
  derived: profileDerivedSchema,
  weight: weightStatusSchema,
});

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_athlete_profile",
      {
        title: "Get athlete profile",
        description:
          "Use this to read the authenticated TRAPEAK user's normalized athlete profile from connected wearable providers.",
        outputSchema: z.object({
          profiles: z.array(athleteProfileSchema),
        }),
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      async (context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const profiles = await getMcpAthleteProfiles(userId);
        const result = { profiles: [...profiles] };
        return {
          content: [{
            type: "text",
            text: profiles.length > 0
              ? `Found ${profiles.length} athlete profile.`
              : "No synchronized athlete profile is available.",
          }],
          structuredContent: result,
        };
      },
    );

    server.registerTool(
      "get_user_profile",
      {
        title: "Get TRAPEAK user profile",
        description:
          "Read the authenticated user's own TRAPEAK profile, completion percentage, missing fields, and suggested onboarding topics. Use this at the start of profile onboarding and before asking follow-up profile questions. The percentage measures data completeness only, never health or fitness quality.",
        outputSchema: userProfileResultSchema,
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      async (context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const result = await getUserProfile(userId);
        return {
          content: [{
            type: "text",
            text: result.record
              ? `The user profile is ${result.completeness.percent}% complete. Offer the user a choice of the suggested next topics without implying that this is a health score.${result.weight.weightUpdateDue ? " A new exact weight measurement is due; briefly offer to record it." : ""}`
              : "No TRAPEAK user profile exists yet. Ask one short grouped questionnaire: (1) primary goal, (2) date of birth, height and current weight, (3) usual activities and training experience, (4) active injuries, health restrictions or contraindications, (5) current medications with name, dose and schedule—or an explicit answer that there are none, and (6) available training days, preferred time and maximum duration. Save Profile answers with update_user_profile and save an exact current weight separately with create_weight_entry.",
          }],
          structuredContent: {
            userProfile: result.record,
            completeness: result.completeness,
            derived: result.derived,
            weight: result.weight,
          },
        };
      },
    );

    server.registerTool(
      "update_user_profile",
      {
        title: "Save or update TRAPEAK user profile",
        description:
          "Create or partially update the authenticated user's own profile only after the user explicitly provides or asks to save the facts. Send only fields discussed in the current request: omitted fields remain unchanged, null clears a field, and an empty list explicitly means none. Store date of birth, never a fixed age. Save weight separately with create_weight_entry so its dated history is preserved. workActivityContext is only qualitative work context that a wearable cannot reliably infer, such as seated, standing, physical, shift, or night work. Do not store manual sleep, daily activity, stress, caffeine, or alcohol fields in Profile. Never infer medical conditions, contraindications, injuries, medication names, dosages, or schedules. Use fieldStatuses when a field is not applicable or the user prefers not to answer, so AI will not ask it repeatedly.",
        inputSchema: z.object({
          profile: userProfilePatchSchema.describe(
            "Only the profile fields explicitly supplied or changed by the user.",
          ),
          fieldStatuses: z.array(profileFieldStatusUpdateSchema).max(profileFieldKeys.length)
            .optional().describe(
              "Fields explicitly marked not applicable or prefer not to answer. Do not use this merely because a field was not discussed yet.",
            ),
        }),
        outputSchema: userProfileResultSchema,
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
          idempotentHint: true,
        },
      },
      async (input, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const result = await updateUserProfile({
          userId,
          patch: input.profile,
          fieldStatuses: input.fieldStatuses,
        });
        const topics = result.completeness.suggestedNextSections
          .map(({ title }) => title)
          .join(", ");
        return {
          content: [{
            type: "text",
            text: result.completeness.percent === 100
              ? "Profile saved and 100% complete. This percentage measures data completeness only."
              : `Profile saved and ${result.completeness.percent}% complete. This is data completeness, not a health score. Offer optional next topics: ${topics}.`,
          }],
          structuredContent: {
            userProfile: result.record,
            completeness: result.completeness,
            derived: result.derived,
            weight: result.weight,
          },
        };
      },
    );

    server.registerTool(
      "create_weight_entry",
      {
        title: "Save a weight measurement",
        description:
          "Save one exact, dated weight measurement for the authenticated user after an explicit request to record it. Use the user's stated measurement time, or the current time only when the user says it was measured now. Never estimate weight. Repeating identical input returns the existing record instead of creating a duplicate.",
        inputSchema: z.object({
          measuredAt: z.string().datetime({ offset: true }).describe(
            "Measurement time as ISO 8601 with offset.",
          ),
          weightKilograms: z.number().min(20).max(500),
          notes: z.string().trim().min(1).max(1000).nullable().optional(),
        }),
        outputSchema: z.object({
          id: z.string().uuid(),
          created: z.boolean(),
          weight: weightStatusSchema,
        }),
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
          idempotentHint: true,
        },
      },
      async (input, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const saved = await createWeightEntry(
          userId,
          parseWeightEntryInput(input, "ai"),
        );
        const profile = await getUserProfile(userId);
        return {
          content: [{
            type: "text",
            text: saved.created
              ? "Weight measurement saved."
              : "The identical weight measurement was already saved; no duplicate was created.",
          }],
          structuredContent: { ...saved, weight: profile.weight },
        };
      },
    );

    server.registerTool(
      "list_weight_entries",
      {
        title: "List weight history",
        description:
          "Read the authenticated user's dated weight history for trends and graphs. Optional dates are inclusive. The summary includes the latest measurement, changes using the most recent baseline at or before 7, 30, and 90 days, and whether a new measurement is due.",
        inputSchema: z.object({
          from: dateSchema.optional(),
          to: dateSchema.optional(),
          limit: z.number().int().min(1).max(500).default(100),
        }),
        outputSchema: z.object({
          entries: z.array(weightEntrySchema),
          count: z.number().int(),
          weight: weightStatusSchema,
        }),
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      async (input, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const [entries, profile] = await Promise.all([
          listWeightEntries({ userId, ...input }),
          getUserProfile(userId),
        ]);
        return {
          content: [{
            type: "text",
            text: `Found ${entries.length} weight measurements.`,
          }],
          structuredContent: {
            entries: [...entries],
            count: entries.length,
            weight: profile.weight,
          },
        };
      },
    );

    server.registerTool(
      "delete_weight_entry",
      {
        title: "Delete a weight measurement",
        description:
          "Permanently delete one dated weight measurement owned by the authenticated user. Use only after an explicit request to delete that specific record.",
        inputSchema: z.object({
          id: z.string().uuid(),
          confirm: deletionConfirmationSchema,
        }),
        outputSchema: z.object({ id: z.string().uuid(), deleted: z.boolean() }),
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          openWorldHint: false,
          idempotentHint: true,
        },
      },
      async ({ id }, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const deleted = await deleteWeightEntry(userId, id);
        return {
          content: [{
            type: "text",
            text: deleted
              ? "Weight measurement permanently deleted."
              : "No weight measurement with that ID is available to this user; nothing was deleted.",
          }],
          structuredContent: { id, deleted },
        };
      },
    );

    server.registerTool(
      "delete_user_profile",
      {
        title: "Delete TRAPEAK user profile",
        description:
          "Permanently delete the authenticated user's custom TRAPEAK profile, including goals, health context, medications, work context, and onboarding progress. This does not delete wearable activities, nutrition, laboratory reports, or the separate weight history. Use only after an explicit request to delete the entire profile.",
        inputSchema: z.object({ confirm: deletionConfirmationSchema }),
        outputSchema: z.object({ deleted: z.boolean() }),
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          openWorldHint: false,
          idempotentHint: true,
        },
      },
      async (_, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const deleted = await deleteUserProfile(userId);
        return {
          content: [{
            type: "text",
            text: deleted
              ? "The custom TRAPEAK user profile was permanently deleted. Other TRAPEAK data was not changed."
              : "No custom TRAPEAK user profile existed; nothing was deleted.",
          }],
          structuredContent: { deleted },
        };
      },
    );

    server.registerTool(
      "get_training_context",
      {
        title: "Get context for today's workout",
        description:
          "Call this before selecting or building today's workout. It returns the authenticated user's chronological workout history, 7-day versus previous-7-day load, longer history, recent nutrition, Profile, weight trends, decision-support principles and data limitations. It provides context, not a readiness score or automatic prescription. Interpret workload relative to the individual and obtain a fresh subjective check-in when requested.",
        inputSchema: z.object({
          asOf: z.string().datetime({ offset: true }).optional().describe(
            "Decision time as an ISO 8601 timestamp with offset. Defaults to the current server time.",
          ),
          utcOffsetMinutes: z.number().int().min(-720).max(840).optional().describe(
            "Optional override for the user's current UTC offset in minutes. Otherwise it is inferred from asOf, or UTC is used when asOf is omitted.",
          ),
          historyDays: z.number().int().min(14).max(56).default(28).describe(
            "How many previous days of workouts to include. Use 28 unless a different horizon is needed.",
          ),
        }),
        outputSchema: z.object({ context: trainingContextSchema }),
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      async (input, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const trainingContext = await getTrainingContext({
          userId,
          asOf: input.asOf ? new Date(input.asOf) : new Date(),
          utcOffsetMinutes: input.utcOffsetMinutes
            ?? getIsoUtcOffsetMinutes(input.asOf),
          historyDays: input.historyDays,
        });
        return {
          content: [{
            type: "text",
            text: `Prepared ${trainingContext.historyDays}-day training context with ${trainingContext.recentActivities.length} activities. This is decision context, not a readiness score. Review the full picture, data limitations, and requested user check-in before recommending today's session.`,
          }],
          structuredContent: { context: trainingContext },
        };
      },
    );

    server.registerTool(
      "list_activities",
      {
        title: "List fitness activities",
        description:
          "Use this to list the authenticated TRAPEAK user's recent workouts, optionally filtered by provider, inclusive date range, or exact provider activity type ID.",
        inputSchema: z.object({
          provider: providerSchema.optional().describe(
            "Optional wearable provider filter.",
          ),
          from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe(
            "Inclusive start date in YYYY-MM-DD format.",
          ),
          to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe(
            "Inclusive end date in YYYY-MM-DD format.",
          ),
          activityTypeId: z.string().min(1).optional().describe(
            "Exact provider activity type ID returned by a previous call.",
          ),
          limit: z.number().int().min(1).max(100).default(30).describe(
            "Maximum number of newest activities to return.",
          ),
        }),
        outputSchema: z.object({
          activities: z.array(activitySummarySchema),
          count: z.number().int(),
        }),
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      async (input, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const activities = await listMcpActivities({ userId, ...input });
        const result = {
          activities: [...activities],
          count: activities.length,
        };
        return {
          content: [{
            type: "text",
            text: `Found ${activities.length} fitness activities.`,
          }],
          structuredContent: result,
        };
      },
    );

    server.registerTool(
      "get_activity",
      {
        title: "Get fitness activity",
        description:
          "Use this after list_activities to read all normalized metrics stored for one authenticated TRAPEAK user activity. It never returns the raw provider payload.",
        inputSchema: z.object({
          id: z.string().uuid().describe(
            "TRAPEAK activity ID returned by list_activities.",
          ),
        }),
        outputSchema: z.object({
          activity: activityDetailsSchema.nullable(),
        }),
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      async ({ id }, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const activity = await getMcpActivity(userId, id);
        return {
          content: [{
            type: "text",
            text: activity
              ? "Fitness activity found."
              : "No fitness activity with that ID is available to this user.",
          }],
          structuredContent: { activity },
        };
      },
    );

    server.registerTool(
      "create_nutrition_entry",
      {
        title: "Save a nutrition entry",
        description:
          "Use this only when the authenticated user explicitly asks to save, add, log, or record a meal. Save the user's food description with total calories and macronutrients that the AI has already calculated. Mark estimates and state the portion assumptions used. Do not call this tool for hypothetical meals or analysis-only requests.",
        inputSchema: z.object({
          consumedAt: z.string().datetime({ offset: true }).describe(
            "When the meal was consumed as an ISO 8601 timestamp with timezone offset.",
          ),
          mealType: mealTypeSchema,
          description: z.string().min(1).max(2000).describe(
            "Concise description of what the user ate, preserving useful quantities from the request.",
          ),
          caloriesKilocalories: z.number().min(0).max(20000),
          proteinGrams: z.number().min(0).max(2000),
          carbohydratesGrams: z.number().min(0).max(2000),
          fatGrams: z.number().min(0).max(2000),
          estimated: z.boolean().describe(
            "True when any calories or macronutrients were estimated rather than supplied exactly.",
          ),
          estimationNotes: z.string().min(1).max(1000).nullable().describe(
            "Portion and product assumptions used for an estimate; null only when values were supplied exactly.",
          ),
          notes: z.string().max(1000).nullable().optional(),
        }),
        outputSchema: z.object({ entry: nutritionEntrySchema, created: z.boolean() }),
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
          idempotentHint: true,
        },
      },
      async (input, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const normalized = parseNutritionEntryInput({ ...input, source: "ai" });
        const result = await createNutritionEntry(userId, normalized);
        const entry = {
          id: result.id,
          consumedAt: normalized.consumedAt.toISOString(),
          mealType: normalized.mealType,
          description: normalized.description,
          caloriesKilocalories: normalized.caloriesKilocalories,
          proteinGrams: normalized.proteinGrams,
          carbohydratesGrams: normalized.carbohydratesGrams,
          fatGrams: normalized.fatGrams,
          notes: normalized.notes,
          estimated: normalized.estimated,
          estimationNotes: normalized.estimationNotes,
          source: normalized.source,
        };
        return {
          content: [{ type: "text", text: result.created
            ? "Nutrition entry saved."
            : "This nutrition entry was already saved; no duplicate was created." }],
          structuredContent: { entry, created: result.created },
        };
      },
    );

    server.registerTool(
      "list_nutrition_entries",
      {
        title: "List nutrition entries",
        description:
          "Use this to read the authenticated TRAPEAK user's saved meal descriptions, calories, macronutrients, and estimation assumptions, optionally filtered by inclusive UTC date range or meal type.",
        inputSchema: z.object({
          from: dateSchema.optional().describe(
            "Inclusive UTC start date in YYYY-MM-DD format.",
          ),
          to: dateSchema.optional().describe(
            "Inclusive UTC end date in YYYY-MM-DD format.",
          ),
          mealType: mealTypeSchema.optional(),
          limit: z.number().int().min(1).max(100).default(30),
        }),
        outputSchema: z.object({
          entries: z.array(nutritionEntrySchema),
          count: z.number().int(),
        }),
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      async (input, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const entries = await listNutritionEntries({ userId, ...input });
        return {
          content: [{
            type: "text",
            text: `Found ${entries.length} nutrition entries.`,
          }],
          structuredContent: {
            entries: [...entries],
            count: entries.length,
          },
        };
      },
    );

    server.registerTool(
      "delete_nutrition_entry",
      {
        title: "Delete a nutrition entry",
        description:
          "Permanently delete one nutrition entry owned by the authenticated user. Use this only after the user explicitly asks to delete the specific entry ID. Never infer deletion from a correction, replacement, or general cleanup request. If the user has not identified a record, call list_nutrition_entries first.",
        inputSchema: z.object({
          id: z.string().uuid().describe(
            "TRAPEAK nutrition entry ID returned by list_nutrition_entries.",
          ),
          confirm: deletionConfirmationSchema,
        }),
        outputSchema: z.object({
          id: z.string().uuid(),
          deleted: z.boolean(),
        }),
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          openWorldHint: false,
          idempotentHint: true,
        },
      },
      async ({ id }, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const deleted = await deleteNutritionEntry(userId, id);
        return {
          content: [{
            type: "text",
            text: deleted
              ? "Nutrition entry permanently deleted."
              : "No nutrition entry with that ID is available to this user; nothing was deleted.",
          }],
          structuredContent: { id, deleted },
        };
      },
    );

    server.registerTool(
      "get_nutrition_summary",
      {
        title: "Get nutrition summary",
        description:
          "Use this to calculate daily calories and macronutrient totals from the authenticated TRAPEAK user's nutrition log over an inclusive UTC date range.",
        inputSchema: z.object({
          from: dateSchema.describe("Inclusive UTC start date in YYYY-MM-DD format."),
          to: dateSchema.describe("Inclusive UTC end date in YYYY-MM-DD format."),
        }),
        outputSchema: z.object({
          days: z.array(nutritionDaySummarySchema),
          count: z.number().int(),
        }),
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          openWorldHint: false,
        },
      },
      async (input, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const days = await getNutritionDaySummaries({ userId, ...input });
        return {
          content: [{
            type: "text",
            text: `Calculated nutrition totals for ${days.length} logged days.`,
          }],
          structuredContent: { days: [...days], count: days.length },
        };
      },
    );

    server.registerTool(
      "create_lab_report",
      {
        title: "Save laboratory results",
        description:
          "Use this only when the authenticated user explicitly asks to save laboratory results from blood, urine, stool, saliva, or another specimen. Preserve the reported analyte names, values, units, reference ranges, and laboratory flags. Do not invent missing measurements, ranges, or medical interpretations.",
        inputSchema: z.object({
          collectedAt: z.string().datetime({ offset: true }),
          testType: labTestTypeSchema,
          title: z.string().min(1).max(200),
          laboratory: z.string().max(200).nullable().optional(),
          notes: z.string().max(2000).nullable().optional(),
          results: z.array(z.object({
            analyteName: z.string().min(1).max(200),
            valueText: z.string().min(1).max(200),
            valueNumeric: z.number().nullable().optional(),
            unit: z.string().max(100).nullable().optional(),
            referenceRange: z.string().max(200).nullable().optional(),
            referenceMin: z.number().nullable().optional(),
            referenceMax: z.number().nullable().optional(),
            flag: labResultFlagSchema.default("unknown"),
          })).min(1).max(200),
        }),
        outputSchema: z.object({
          reportId: z.string().uuid(), created: z.boolean(), resultCount: z.number().int(),
        }),
        annotations: {
          readOnlyHint: false, destructiveHint: false, openWorldHint: false, idempotentHint: true,
        },
      },
      async (input, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const result = await createLabReport(userId, parseLabReportInput(input));
        return {
          content: [{ type: "text", text: result.created
            ? `Laboratory report saved with ${result.resultCount} results.`
            : "This laboratory report was already saved; no duplicate was created." }],
          structuredContent: {
            reportId: result.id, created: result.created, resultCount: result.resultCount,
          },
        };
      },
    );

    server.registerTool(
      "list_lab_reports",
      {
        title: "List laboratory reports",
        description:
          "Use this to list the authenticated user's saved blood, urine, stool, saliva, or other laboratory reports, optionally filtered by date or test type.",
        inputSchema: z.object({
          from: dateSchema.optional(), to: dateSchema.optional(),
          testType: labTestTypeSchema.optional(),
          limit: z.number().int().min(1).max(100).default(30),
        }),
        outputSchema: z.object({ reports: z.array(labReportSummarySchema), count: z.number().int() }),
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      },
      async (input, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const reports = await listLabReports({ userId, ...input });
        return {
          content: [{ type: "text", text: `Found ${reports.length} laboratory reports.` }],
          structuredContent: { reports: [...reports], count: reports.length },
        };
      },
    );

    server.registerTool(
      "delete_lab_report",
      {
        title: "Delete a laboratory report",
        description:
          "Permanently delete one laboratory report and all of its stored results. Use this only after the user explicitly asks to delete the specific report ID. Never infer deletion from a corrected PDF, replacement report, or general cleanup request. If the user has not identified a report, call list_lab_reports first.",
        inputSchema: z.object({
          id: z.string().uuid().describe(
            "TRAPEAK laboratory report ID returned by list_lab_reports.",
          ),
          confirm: deletionConfirmationSchema,
        }),
        outputSchema: z.object({
          id: z.string().uuid(),
          deleted: z.boolean(),
        }),
        annotations: {
          readOnlyHint: false,
          destructiveHint: true,
          openWorldHint: false,
          idempotentHint: true,
        },
      },
      async ({ id }, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const deleted = await deleteLabReport(userId, id);
        return {
          content: [{
            type: "text",
            text: deleted
              ? "Laboratory report and its results permanently deleted."
              : "No laboratory report with that ID is available to this user; nothing was deleted.",
          }],
          structuredContent: { id, deleted },
        };
      },
    );

    server.registerTool(
      "get_lab_report",
      {
        title: "Get a laboratory report",
        description:
          "Use this after list_lab_reports to read every stored result, unit, reference range, and laboratory flag from one report owned by the authenticated user.",
        inputSchema: z.object({ id: z.string().uuid() }),
        outputSchema: z.object({ report: labReportSchema.nullable() }),
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      },
      async ({ id }, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const report = await getLabReport(userId, id);
        return {
          content: [{ type: "text", text: report
            ? "Laboratory report found." : "Laboratory report not found." }],
          structuredContent: { report },
        };
      },
    );

    server.registerTool(
      "get_lab_result_history",
      {
        title: "Get laboratory indicator history",
        description:
          "Use this to retrieve an authenticated user's saved history for one exact analyte name, such as ALT or AST. Return the original value, unit, reference range, and flag for each date; do not compare numeric values across incompatible units.",
        inputSchema: z.object({
          analyteName: z.string().min(1).max(200), from: dateSchema.optional(),
          to: dateSchema.optional(), limit: z.number().int().min(1).max(200).default(100),
        }),
        outputSchema: z.object({
          analyteName: z.string(), points: z.array(labHistoryPointSchema), count: z.number().int(),
        }),
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      },
      async (input, context) => {
        const userId = requireMcpUserId(context.http?.authInfo);
        const points = await getLabResultHistory({ userId, ...input });
        return {
          content: [{ type: "text", text:
            `Found ${points.length} saved results for ${input.analyteName}.` }],
          structuredContent: {
            analyteName: input.analyteName, points: [...points], count: points.length,
          },
        };
      },
    );
  },
  {
    serverInfo: { name: "trapeak", version: "0.9.2" },
    instructions:
      "TRAPEAK stores authenticated fitness, nutrition, laboratory, dated weight, and custom profile data. For profile onboarding, call get_user_profile first, ask a short grouped questionnaire, and save only facts explicitly provided by the user. Store birthDate rather than fixed age; save exact weight measurements with create_weight_entry, never estimate them. Keep only qualitative workActivityContext in Profile. Sleep, daily activity, stress, HRV, readiness, and recovery must come from connected wearable sources when available; do not infer them or store manual substitutes in Profile. Caffeine and alcohol are not permanent Profile fields; a specific consumed drink may be logged as nutrition only after an explicit request. When weightUpdateDue is true, briefly offer to record a new measurement, especially every 14 days for weight-loss goals or every 30 days otherwise. After each profile update, say that the returned percentage is profile completeness rather than a health score and offer the suggested topic groups as optional follow-ups. Never infer medical conditions, contraindications, injuries, medications, dosage, or schedule. Before recommending today's workout, call get_training_context. Treat it as decision context rather than a readiness score: consider the user's goals and medical constraints, individual training history, recent sequence and load, activity type, available recovery data, nutrition and weight context together. A pair of demanding sessions, a TSS threshold, or a week-over-week change is only one signal and must not determine the recommendation by itself. When decisionSupport requests a fresh check-in, ask briefly about current fatigue or energy, soreness or pain, illness symptoms, last night's sleep, willingness to train, and available time before prescribing intensity. Treat availability flags and limitations as part of the answer, distinguish measurements from uncertainty, and explain the main factors behind the recommendation. Call create or update tools only after the user explicitly asks to save data. Call deletion tools only after the user explicitly asks to permanently delete the relevant record or entire profile, and pass confirm=true only for that explicit request. Nutrition estimates must include assumptions. Laboratory tools preserve reported values, units, ranges, and flags without inventing missing data or diagnosing conditions. Read and deletion tools may act only on records owned by the authenticated user.",
  },
);

const authHandler = withMcpAuth(
  handler,
  async (_, token) => {
    const clerkAuth = await auth({ acceptsToken: "oauth_token" });
    const verified = verifyClerkToken(clerkAuth, token);
    return verified
      ? {
          token: verified.token,
          clientId: verified.clientId,
          scopes: [...verified.scopes],
          expiresAt: verified.expiresAt,
          resource: verified.resource,
          extra: verified.extra,
        }
      : undefined;
  },
  {
    required: true,
    resourceMetadataPath: "/.well-known/oauth-protected-resource/mcp",
  },
);

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export { authHandler as POST };
