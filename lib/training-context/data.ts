import "server-only";

import {
  getMcpAthleteProfiles,
  listMcpActivityDetailsBetween,
} from "../mcp/data";
import { listNutritionEntriesBetween } from "../nutrition/data";
import { getUserProfile } from "../profile/data";
import { buildTrainingContext, type TrainingContext } from "./model";

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVITY_LIMIT = 100;
const NUTRITION_LIMIT = 500;

export async function getTrainingContext(input: Readonly<{
  userId: string;
  asOf: Date;
  utcOffsetMinutes: number;
  historyDays: number;
}>): Promise<TrainingContext> {
  const historyFrom = new Date(input.asOf.getTime() - input.historyDays * DAY_MS);
  const nutritionFrom = new Date(input.asOf.getTime() - 7 * DAY_MS);
  const [profiles, userProfileResult, activityRows, nutritionRows] = await Promise.all([
    getMcpAthleteProfiles(input.userId),
    getUserProfile(input.userId, input.asOf),
    listMcpActivityDetailsBetween({
      userId: input.userId,
      from: historyFrom,
      to: input.asOf,
      limit: ACTIVITY_LIMIT + 1,
    }),
    listNutritionEntriesBetween({
      userId: input.userId,
      from: nutritionFrom,
      to: input.asOf,
      limit: NUTRITION_LIMIT + 1,
    }),
  ]);

  return buildTrainingContext({
    asOf: input.asOf,
    utcOffsetMinutes: input.utcOffsetMinutes,
    historyDays: input.historyDays,
    profiles,
    userProfile: userProfileResult.record,
    profileDerived: userProfileResult.derived,
    weight: userProfileResult.weight,
    activities: activityRows.slice(0, ACTIVITY_LIMIT),
    nutritionEntries: nutritionRows.slice(0, NUTRITION_LIMIT),
    activityHistoryTruncated: activityRows.length > ACTIVITY_LIMIT,
    nutritionHistoryTruncated: nutritionRows.length > NUTRITION_LIMIT,
  });
}
