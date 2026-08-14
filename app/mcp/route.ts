import { verifyClerkToken } from "@clerk/mcp-tools/next";
import { auth } from "@clerk/nextjs/server";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";

import { requireMcpUserId } from "@/lib/mcp/auth";
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
import {
  createNutritionEntry,
  deleteNutritionEntry,
  getNutritionDaySummaries,
  listNutritionEntries,
} from "@/lib/nutrition/data";
import { nutritionMealTypes, parseNutritionEntryInput } from "@/lib/nutrition/model";
import { deletionConfirmationSchema } from "@/lib/mcp/deletion";

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
    serverInfo: { name: "trapeak", version: "0.7.0" },
    instructions:
      "TRAPEAK stores authenticated fitness, nutrition, and laboratory data. Call create tools only after the user explicitly asks to save data. Call deletion tools only after the user explicitly asks to permanently delete a specific record, and pass confirm=true only for that explicit request. Nutrition estimates must include assumptions. Laboratory tools preserve reported values, units, ranges, and flags without inventing missing data or diagnosing conditions. Read and deletion tools may act only on records owned by the authenticated user.",
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
