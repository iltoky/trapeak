import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateProfileCompleteness,
  calculateAgeYears,
  emptyUserProfile,
  normalizeUserProfile,
  profileMedicationSchema,
  type UserProfileRecord,
} from "./model.ts";

function record(
  profile: Partial<UserProfileRecord["profile"]>,
  fieldStatuses: UserProfileRecord["fieldStatuses"] = {},
): UserProfileRecord {
  return {
    profile: { ...emptyUserProfile, ...profile },
    fieldStatuses,
    createdAt: "2026-08-14T08:00:00.000Z",
    updatedAt: "2026-08-14T08:00:00.000Z",
  };
}

test("starts an empty profile at zero percent", () => {
  const completeness = calculateProfileCompleteness(null);

  assert.equal(completeness.percent, 0);
  assert.equal(completeness.stage, "initial");
  assert.equal(completeness.totalWeight, 100);
  assert.equal(completeness.suggestedNextSections[0]?.key, "healthAndMedications");
});

test("counts explicit empty lists and declined fields as completed", () => {
  const completeness = calculateProfileCompleteness(record({
    injuries: [],
    contraindications: [],
    medications: [],
  }, {
    healthConditions: "prefer_not_to_answer",
  }));

  const health = completeness.sections.find(({ key }) => key === "healthAndMedications");
  assert.equal(health?.percent, 100);
  assert.equal(completeness.percent, 30);
});

test("moves to progressive onboarding after the short critical profile is answered", () => {
  const completeness = calculateProfileCompleteness(record({
    birthDate: "1992-04-20",
    heightCentimeters: 185,
    goals: [{
      type: "running_distance",
      description: "Run 10 km comfortably",
      priority: "primary",
    }],
    trainingExperience: "returning",
    injuries: [],
    contraindications: [],
    medications: [],
    weeklyAvailability: [{
      day: "tuesday",
      preferredTime: "evening",
      maxDurationMinutes: 60,
    }],
  }), { hasWeightMeasurement: true });

  assert.equal(completeness.stage, "progressive");
  assert.ok(completeness.percent > 50);
  assert.ok(completeness.percent < 100);
});

test("normalizes a partial stored profile without inventing missing values", () => {
  const profile = normalizeUserProfile({ birthDate: "1992-04-20", medications: [] });

  assert.equal(profile.birthDate, "1992-04-20");
  assert.deepEqual(profile.medications, []);
  assert.equal(profile.goals, null);
});

test("derives age from birth date instead of storing a fixed age", () => {
  assert.equal(calculateAgeYears("1992-08-15", new Date("2026-08-14T12:00:00Z")), 33);
  assert.equal(calculateAgeYears("1992-08-14", new Date("2026-08-14T12:00:00Z")), 34);
});

test("validates medication dates and preserves dose details", () => {
  const medication = profileMedicationSchema.parse({
    name: "Example medication",
    dosage: "10 mg",
    frequency: "once daily",
    timing: "morning",
    startDate: "2026-08-01",
    endDate: null,
  });
  assert.equal(medication.dosage, "10 mg");

  assert.throws(() => profileMedicationSchema.parse({
    name: "Example medication",
    startDate: "2026-08-10",
    endDate: "2026-08-01",
  }));
});
