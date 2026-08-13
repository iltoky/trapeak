export const nutritionMealTypes = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
] as const;

export type NutritionMealType = (typeof nutritionMealTypes)[number];

export type NutritionEntryInput = Readonly<{
  consumedAt: Date;
  mealType: NutritionMealType;
  title: string;
  caloriesKilocalories: number;
  proteinGrams: number;
  carbohydratesGrams: number;
  fatGrams: number;
  notes: string | null;
}>;

export class NutritionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NutritionValidationError";
  }
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new NutritionValidationError(`${field} is required`);
  }

  return value.trim();
}

function requireNumber(
  value: unknown,
  field: string,
  maximum: number,
): number {
  const text = requireString(value, field);
  if (!text) {
    throw new NutritionValidationError(`${field} is required`);
  }

  const number = Number(text);
  if (!Number.isFinite(number) || number < 0 || number > maximum) {
    throw new NutritionValidationError(`${field} is outside the allowed range`);
  }

  return number;
}

export function parseNutritionEntryInput(
  value: Readonly<Record<string, unknown>>,
): NutritionEntryInput {
  const title = requireString(value.title, "title");
  if (!title || title.length > 120) {
    throw new NutritionValidationError("title must contain 1 to 120 characters");
  }

  const mealType = requireString(value.mealType, "mealType");
  if (!nutritionMealTypes.includes(mealType as NutritionMealType)) {
    throw new NutritionValidationError("mealType is not supported");
  }

  const consumedAtText = requireString(value.consumedAt, "consumedAt");
  const consumedAt = new Date(consumedAtText);
  if (!consumedAtText || Number.isNaN(consumedAt.getTime())) {
    throw new NutritionValidationError("consumedAt must be a valid date and time");
  }

  const notesText = typeof value.notes === "string" ? value.notes.trim() : "";
  if (notesText.length > 1000) {
    throw new NutritionValidationError("notes must not exceed 1000 characters");
  }

  return {
    consumedAt,
    mealType: mealType as NutritionMealType,
    title,
    caloriesKilocalories: requireNumber(
      value.caloriesKilocalories,
      "caloriesKilocalories",
      20000,
    ),
    proteinGrams: requireNumber(value.proteinGrams, "proteinGrams", 2000),
    carbohydratesGrams: requireNumber(
      value.carbohydratesGrams,
      "carbohydratesGrams",
      2000,
    ),
    fatGrams: requireNumber(value.fatGrams, "fatGrams", 2000),
    notes: notesText || null,
  };
}
