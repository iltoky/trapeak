import type { MetadataRoute } from "next";
import { indexablePublicPagePaths, localePath, supportedLocales } from "@/lib/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://trapeak.com";
  const lastModified = new Date("2026-08-16");
  return supportedLocales.flatMap((locale) => indexablePublicPagePaths.map((path) => ({
    url: `${baseUrl}${localePath(locale, path)}`,
    lastModified,
    changeFrequency: path === "/privacy" || path === "/terms" || path === "/data-deletion" ? "yearly" as const : "weekly" as const,
    priority: path === "/" ? 1 : path === "/privacy" || path === "/terms" || path === "/data-deletion" ? 0.2 : 0.8,
    alternates: { languages: { ...Object.fromEntries(supportedLocales.map((item) => [item, `${baseUrl}${localePath(item, path)}`])), "x-default": `${baseUrl}${localePath("en", path)}` } },
  })));
}
