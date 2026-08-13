import assert from "node:assert/strict";
import test from "node:test";

import {
  NutritionValidationError,
  parseNutritionEntryInput,
} from "./model.ts";

const validInput = {
  consumedAt: "2026-08-13T12:30:00.000Z",
  mealType: "lunch",
  description: "Rice and chicken",
  caloriesKilocalories: "640",
  proteinGrams: "48.5",
  carbohydratesGrams: "72",
  fatGrams: "14",
  notes: "After training",
  estimated: "true",
  estimationNotes: "Chicken 150 g and cooked rice 200 g.",
  source: "ai",
};

test("normalizes an AI nutrition entry with estimation assumptions", () => {
  const entry = parseNutritionEntryInput(validInput);

  assert.equal(entry.mealType, "lunch");
  assert.equal(entry.description, "Rice and chicken");
  assert.equal(entry.consumedAt.toISOString(), "2026-08-13T12:30:00.000Z");
  assert.equal(entry.caloriesKilocalories, 640);
  assert.equal(entry.proteinGrams, 48.5);
  assert.equal(entry.notes, "After training");
  assert.equal(entry.estimated, true);
  assert.equal(entry.estimationNotes, "Chicken 150 g and cooked rice 200 g.");
  assert.equal(entry.source, "ai");
});

test("rejects unsupported meals and invalid macro values", () => {
  assert.throws(
    () => parseNutritionEntryInput({ ...validInput, mealType: "brunch" }),
    NutritionValidationError,
  );
  assert.throws(
    () => parseNutritionEntryInput({ ...validInput, proteinGrams: "-1" }),
    NutritionValidationError,
  );
  assert.throws(
    () => parseNutritionEntryInput({ ...validInput, caloriesKilocalories: "" }),
    NutritionValidationError,
  );
  assert.throws(
    () => parseNutritionEntryInput({ ...validInput, estimationNotes: "" }),
    NutritionValidationError,
  );
});
