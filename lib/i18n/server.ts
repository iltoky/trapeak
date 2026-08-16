import "server-only";

import { cookies } from "next/headers";

import {
  defaultLocale,
  isAppLocale,
  localeCookieName,
  type AppLocale,
} from "./config";

export async function getRequestLocale(): Promise<AppLocale> {
  const value = (await cookies()).get(localeCookieName)?.value;
  return isAppLocale(value) ? value : defaultLocale;
}
