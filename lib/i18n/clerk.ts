import { bnIN, enUS, esMX, hiIN, idID, ptBR, viVN } from "@clerk/localizations";
import type { AppLocale } from "./config";

export const clerkLocalizations = {
  en: enUS,
  "pt-BR": ptBR,
  "es-419": esMX,
  id: idID,
  vi: viVN,
  hi: hiIN,
  bn: bnIN,
} as const satisfies Record<AppLocale, typeof enUS>;
