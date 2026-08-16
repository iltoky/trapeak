export const supportedLocales = [
  "en",
  "pt-BR",
  "es-419",
  "id",
  "vi",
  "hi",
  "bn",
] as const;

export type AppLocale = (typeof supportedLocales)[number];
export type MeasurementSystem = "metric" | "imperial";

export const defaultLocale: AppLocale = "en";
export const localeCookieName = "trapeak_locale";

export const localeSlugs: Readonly<Record<AppLocale, string>> = {
  en: "en",
  "pt-BR": "pt-br",
  "es-419": "es",
  id: "id",
  vi: "vi",
  hi: "hi",
  bn: "bn",
};

export const localeHtmlLang: Readonly<Record<AppLocale, string>> = {
  en: "en",
  "pt-BR": "pt-BR",
  "es-419": "es-419",
  id: "id",
  vi: "vi",
  hi: "hi",
  bn: "bn",
};

export const localeOpenGraph: Readonly<Record<AppLocale, string>> = {
  en: "en_US",
  "pt-BR": "pt_BR",
  "es-419": "es_419",
  id: "id_ID",
  vi: "vi_VN",
  hi: "hi_IN",
  bn: "bn_BD",
};

export const localeNames: Readonly<Record<AppLocale, string>> = {
  en: "English",
  "pt-BR": "Português (Brasil)",
  "es-419": "Español (Latinoamérica)",
  id: "Bahasa Indonesia",
  vi: "Tiếng Việt",
  hi: "हिन्दी",
  bn: "বাংলা",
};

const localeBySlug = new Map(
  Object.entries(localeSlugs).map(([locale, slug]) => [slug, locale as AppLocale]),
);

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && supportedLocales.includes(value as AppLocale);
}

export function localeFromSlug(value: string): AppLocale | null {
  return localeBySlug.get(value.toLowerCase()) ?? null;
}

export function localePath(locale: AppLocale, path = "/"): string {
  const suffix = path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  return `/${localeSlugs[locale]}${suffix}`;
}

export function resolveLocale(value: string | null | undefined): AppLocale {
  if (!value) return defaultLocale;
  if (isAppLocale(value)) return value;
  const normalized = value.trim().replace("_", "-").toLowerCase();
  if (normalized === "pt" || normalized.startsWith("pt-")) return "pt-BR";
  if (normalized === "es" || normalized.startsWith("es-")) return "es-419";
  if (normalized === "id" || normalized.startsWith("id-")) return "id";
  if (normalized === "vi" || normalized.startsWith("vi-")) return "vi";
  if (normalized === "hi" || normalized.startsWith("hi-")) return "hi";
  if (normalized === "bn" || normalized.startsWith("bn-")) return "bn";
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  return defaultLocale;
}

export function resolveAcceptLanguage(value: string | null): AppLocale {
  if (!value) return defaultLocale;
  const candidates = value
    .split(",")
    .map((part) => {
      const [tag, ...parameters] = part.trim().split(";");
      const quality = parameters
        .map((parameter) => parameter.trim())
        .find((parameter) => parameter.startsWith("q="));
      return { tag, quality: quality ? Number(quality.slice(2)) || 0 : 1 };
    })
    .filter(({ quality }) => quality > 0)
    .sort((left, right) => right.quality - left.quality);
  for (const { tag } of candidates) {
    const locale = resolveLocale(tag);
    if (locale !== defaultLocale || tag.toLowerCase().startsWith("en")) return locale;
  }
  return defaultLocale;
}

export const publicPagePaths = [
  "/",
  "/ai-guides",
  "/use-cases/ai-workout-recommendations",
  "/use-cases/log-nutrition-with-ai",
  "/use-cases/track-blood-tests-with-ai",
  "/use-cases/use-multiple-ai-assistants",
  "/use-cases/share-data-with-coach",
  "/wahoo-to-chatgpt",
  "/wahoo-to-claude",
  "/wahoo-mcp",
  "/garmin-to-chatgpt",
  "/garmin-to-claude",
  "/garmin-mcp",
  "/wearable-mcp",
  "/privacy",
  "/terms",
  "/data-deletion",
] as const;

export type PublicPagePath = (typeof publicPagePaths)[number];

export const indexablePublicPagePaths = publicPagePaths.filter(
  (path) => !path.startsWith("/garmin-"),
);

export function isPublicPagePath(path: string): path is PublicPagePath {
  return (publicPagePaths as readonly string[]).includes(path);
}
