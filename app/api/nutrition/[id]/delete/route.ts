import { getAuthUser } from "@/lib/auth/current-user";
import { readAppUrl } from "@/lib/config/app";
import { deleteNutritionEntry } from "@/lib/nutrition/data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;
  try {
    await deleteNutritionEntry(user.id, id);
    return Response.redirect(new URL("/dashboard?nutrition=deleted", appUrl), 303);
  } catch {
    return Response.redirect(new URL("/dashboard?nutrition=storage_error", appUrl), 303);
  }
}
