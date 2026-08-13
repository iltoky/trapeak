import { getAuthUser } from "@/lib/auth/current-user";
import { readAppUrl } from "@/lib/config/app";
import { createNutritionEntry } from "@/lib/nutrition/data";
import {
  NutritionValidationError,
  parseNutritionEntryInput,
} from "@/lib/nutrition/model";

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let appUrl: URL;
  try {
    appUrl = readAppUrl();
  } catch {
    return Response.json({ error: "Application URL is not configured" }, { status: 503 });
  }
  if (request.headers.get("origin") !== appUrl.origin) {
    return Response.json({ error: "Invalid request origin" }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const input = parseNutritionEntryInput({
      consumedAt: form.get("consumedAt"),
      mealType: form.get("mealType"),
      description: form.get("description"),
      caloriesKilocalories: form.get("caloriesKilocalories"),
      proteinGrams: form.get("proteinGrams"),
      carbohydratesGrams: form.get("carbohydratesGrams"),
      fatGrams: form.get("fatGrams"),
      notes: form.get("notes"),
      estimated: form.get("estimated"),
      estimationNotes: form.get("estimationNotes"),
      source: "manual",
    });
    await createNutritionEntry(user.id, input);
    return Response.redirect(new URL("/dashboard?nutrition=created", appUrl), 303);
  } catch (error) {
    const result = error instanceof NutritionValidationError
      ? "invalid"
      : "storage_error";
    return Response.redirect(new URL(`/dashboard?nutrition=${result}`, appUrl), 303);
  }
}
