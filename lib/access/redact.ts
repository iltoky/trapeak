import type { TrainingContext } from "../training-context/model";
import type { DataPermission } from "./model";

const emptyWeight = {
  latest: null,
  changesKilograms: { days7: null, days30: null, days90: null },
  reminderIntervalDays: 30,
  daysSinceLastMeasurement: null,
  nextSuggestedMeasurementAt: null,
  weightUpdateDue: false,
} as const;

const healthFields = ["injuries", "healthConditions", "contraindications", "medications"];
const nutritionFields = ["dietaryRestrictions", "nutritionNotes", "weightHistory"];

export function redactDelegatedTrainingContext(
  context: TrainingContext,
  permissions: readonly DataPermission[],
): TrainingContext {
  const healthAllowed = permissions.includes("health");
  const nutritionAllowed = permissions.includes("nutrition");
  const profile = context.userProfile?.profile;
  const userProfile = context.userProfile && profile
    ? {
      ...context.userProfile,
      profile: {
        ...profile,
        injuries: healthAllowed ? profile.injuries : null,
        healthConditions: healthAllowed ? profile.healthConditions : null,
        contraindications: healthAllowed ? profile.contraindications : null,
        medications: healthAllowed ? profile.medications : null,
        dietaryRestrictions: nutritionAllowed ? profile.dietaryRestrictions : null,
        nutritionNotes: nutritionAllowed ? profile.nutritionNotes : null,
      },
      fieldStatuses: Object.fromEntries(
        Object.entries(context.userProfile.fieldStatuses).filter(([field]) =>
          (healthAllowed || !healthFields.includes(field))
          && (nutritionAllowed || !nutritionFields.includes(field))
        ),
      ),
    }
    : null;
  const limitations = [...context.dataAvailability.limitations];
  if (!healthAllowed) limitations.unshift("Health data is not included in this delegated grant.");
  if (!nutritionAllowed) limitations.unshift("Nutrition and weight data are not included in this delegated grant.");

  return {
    ...context,
    userProfile,
    weight: nutritionAllowed ? context.weight : emptyWeight,
    nutrition: nutritionAllowed
      ? context.nutrition
      : { today: null, recentDays: [], loggedDayCount: 0 },
    dataAvailability: {
      ...context.dataAvailability,
      nutritionHistoryTruncated: nutritionAllowed
        ? context.dataAvailability.nutritionHistoryTruncated
        : false,
      healthAndMedicationContextAvailable: healthAllowed
        ? context.dataAvailability.healthAndMedicationContextAvailable
        : false,
      goalsAndRestrictionsAvailable: healthAllowed
        ? context.dataAvailability.goalsAndRestrictionsAvailable
        : false,
      limitations,
    },
  };
}
