import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthUser } from "@/lib/auth/current-user";
import { readAppUrl } from "@/lib/config/app";
import { localeCookieName } from "@/lib/i18n/config";
import { updateUserProfile } from "@/lib/profile/data";

const inputSchema = z.object({
  locale: z.enum(["en", "pt-BR", "es-419", "id", "vi", "hi", "bn"]).optional(),
  timeZone: z.string().trim().min(1).max(100).optional(),
  measurementSystem: z.enum(["metric", "imperial"]).optional(),
}).refine((value) => Object.keys(value).length > 0, { message: "empty_patch" });

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === readAppUrl().origin;
  } catch {
    return false;
  }
}

export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_preferences" }, { status: 400 });
  const result = await updateUserProfile({ userId: user.id, patch: parsed.data });
  const response = NextResponse.json({
    locale: result.record?.profile.locale ?? null,
    timeZone: result.record?.profile.timeZone ?? null,
    measurementSystem: result.record?.profile.measurementSystem ?? null,
  });
  if (parsed.data.locale) response.cookies.set(localeCookieName, parsed.data.locale, { path: "/", maxAge: 31_536_000, sameSite: "lax", secure: true });
  return response;
}
