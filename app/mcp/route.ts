import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { auth } from "@clerk/nextjs/server";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";

import { requireMcpUserId } from "@/lib/mcp/auth";
import {
  getMcpActivity,
  getMcpAthleteProfiles,
  listMcpActivities,
} from "@/lib/mcp/data";
import {
  getNutritionDaySummaries,
  listNutritionEntries,
} from "@/lib/nutrition/data";
import { nutritionMealTypes } from "@/lib/nutrition/model";

const providerSchema = z.enum(["garmin", "suunto", "wahoo"]);
const nullableNumber = z.number().nullable();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const mealTypeSchema = z.enum(nutritionMealTypes);
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
const nutritionEntrySchema = z.object({
  id: z.string().uuid(),
  consumedAt: z.string(),
  mealType: mealTypeSchema,
  title: z.string(),
  caloriesKilocalories: z.number(),
  proteinGrams: z.number(),
  carbohydratesGrams: z.number(),
  fatGrams: z.number(),
  notes: z.string().nullable(),
});
const nutritionDaySummarySchema = z.object({
  date: dateSchema,
  entryCount: z.number().int(),
  caloriesKilocalories: z.number(),
  proteinGrams: z.number(),
  carbohydratesGrams: z.number(),
  fatGrams: z.number(),
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
          profiles: z.array(z.object({
            provider: providerSchema,
            displayName: z.string().nullable(),
            heightMeters: nullableNumber,
            weightKilograms: nullableNumber,
            birthDate: z.string().nullable(),
            genderCode: z.number().nullable(),
            syncedAt: z.string(),
          })),
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
      "list_nutrition_entries",
      {
        title: "List nutrition entries",
        description:
          "Use this to read the authenticated TRAPEAK user's manually logged meals and macronutrients, optionally filtered by inclusive UTC date range or meal type.",
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
      "get_nutrition_summary",
      {
        title: "Get nutrition summary",
        description:
          "Use this to calculate daily calories and macronutrient totals from the authenticated TRAPEAK user's manual nutrition log over an inclusive UTC date range.",
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
  },
  {
    serverInfo: { name: "trapeak", version: "0.5.0" },
    instructions:
      "TRAPEAK provides read-only access to the authenticated user's normalized fitness and manually logged nutrition data. Use get_athlete_profile for personal metrics, list_activities to find workouts, get_activity for full normalized workout metrics, list_nutrition_entries for meals, and get_nutrition_summary for daily macro totals. Never claim access to raw provider payloads or records that are not returned by these tools, and do not present nutrition data as medical advice.",
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
