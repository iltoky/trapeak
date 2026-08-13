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
  description: string;
  caloriesKilocalories: number;
  proteinGrams: number;
  carbohydratesGrams: number;
  fatGrams: number;
  notes: string | null;
  estimated: boolean;
  estimationNotes: string | null;
  source: "manual" | "ai";
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
  let number: number;
  if (typeof value === "number") {
    number = value;
  } else {
    const text = requireString(value, field);
    if (!text) {
      throw new NutritionValidationError(`${field} is required`);
    }
    number = Number(text);
  }
  if (!Number.isFinite(number) || number < 0 || number > maximum) {
    throw new NutritionValidationError(`${field} is outside the allowed range`);
  }

  return number;
}

function optionalString(value: unknown, field: string, maximum: number) {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length > maximum) {
    throw new NutritionValidationError(`${field} must not exceed ${maximum} characters`);
  }
  return text || null;
}

function readBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === "on";
}

export function parseNutritionEntryInput(
  value: Readonly<Record<string, unknown>>,
): NutritionEntryInput {
  const description = requireString(value.description, "description");
  if (!description || description.length > 2000) {
    throw new NutritionValidationError(
      "description must contain 1 to 2000 characters",
    );
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

  const notes = optionalString(value.notes, "notes", 1000);
  const estimated = readBoolean(value.estimated);
  const estimationNotes = optionalString(
    value.estimationNotes,
    "estimationNotes",
    1000,
  );
  if (estimated && !estimationNotes) {
    throw new NutritionValidationError(
      "estimationNotes are required when nutrition values are estimated",
    );
  }
  const source = value.source === "ai" ? "ai" : "manual";

  return {
    consumedAt,
    mealType: mealType as NutritionMealType,
    description,
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
    notes,
    estimated,
    estimationNotes,
    source,
  };
}
