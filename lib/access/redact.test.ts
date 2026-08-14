import assert from "node:assert/strict";
import test from "node:test";

import type { TrainingContext } from "../training-context/model.ts";
import { redactDelegatedTrainingContext } from "./redact.ts";

function contextFixture(): TrainingContext {
  return {
    userProfile: {
      profile: {
        injuries: "knee",
        healthConditions: "asthma",
        contraindications: "no sprints",
        medications: "inhaler",
        dietaryRestrictions: "vegetarian",
        nutritionNotes: "high protein",
      },
      fieldStatuses: {
        injuries: "complete",
        healthConditions: "complete",
        contraindications: "complete",
        medications: "complete",
        dietaryRestrictions: "complete",
        nutritionNotes: "complete",
        weightHistory: "complete",
        goals: "complete",
      },
    },
    weight: { latest: { kilograms: 72 } },
    nutrition: { today: { caloriesKilocalories: 2_400 }, recentDays: [{}], loggedDayCount: 1 },
    dataAvailability: {
      limitations: [],
      nutritionHistoryTruncated: true,
      healthAndMedicationContextAvailable: true,
      goalsAndRestrictionsAvailable: true,
    },
  } as unknown as TrainingContext;
}

test("training-only grants redact health, nutrition, and weight data", () => {
  const result = redactDelegatedTrainingContext(contextFixture(), ["training"]);

  assert.equal(result.userProfile?.profile.injuries, null);
  assert.equal(result.userProfile?.profile.medications, null);
  assert.equal(result.userProfile?.profile.dietaryRestrictions, null);
  assert.equal(result.userProfile?.fieldStatuses.injuries, undefined);
  assert.equal(result.userProfile?.fieldStatuses.weightHistory, undefined);
  assert.equal(result.weight.latest, null);
  assert.equal(result.nutrition.today, null);
  assert.equal(result.dataAvailability.healthAndMedicationContextAvailable, false);
  assert.equal(result.dataAvailability.nutritionHistoryTruncated, false);
});

test("explicit health and nutrition permissions preserve sensitive context", () => {
  const source = contextFixture();
  const result = redactDelegatedTrainingContext(source, ["training", "nutrition", "health"]);

  assert.equal(result.userProfile?.profile.injuries, "knee");
  assert.equal(result.userProfile?.profile.dietaryRestrictions, "vegetarian");
  assert.deepEqual(result.weight, source.weight);
  assert.deepEqual(result.nutrition, source.nutrition);
});
