import assert from "node:assert/strict";
import test from "node:test";

import {
  NutritionValidationError,
  parseNutritionEntryInput,
} from "./model.ts";

const validInput = {
  consumedAt: "2026-08-13T12:30:00.000Z",
  mealType: "lunch",
  title: "Rice and chicken",
  caloriesKilocalories: "640",
  proteinGrams: "48.5",
  carbohydratesGrams: "72",
  fatGrams: "14",
  notes: "After training",
};

test("normalizes a manual nutrition entry", () => {
  const entry = parseNutritionEntryInput(validInput);

  assert.equal(entry.mealType, "lunch");
  assert.equal(entry.title, "Rice and chicken");
  assert.equal(entry.consumedAt.toISOString(), "2026-08-13T12:30:00.000Z");
  assert.equal(entry.caloriesKilocalories, 640);
  assert.equal(entry.proteinGrams, 48.5);
  assert.equal(entry.notes, "After training");
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
});
