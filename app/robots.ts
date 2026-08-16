import type { MetadataRoute } from "next";
import { localeSlugs, supportedLocales } from "@/lib/i18n/config";

export default function robots(): MetadataRoute.Robots {
  const allow = supportedLocales.map((locale) => `/${localeSlugs[locale]}/`);
  const disallow = [
    "/api/", "/dashboard/", "/access/", "/mcp", "/sign-in", "/sign-up",
    ...supportedLocales.map((locale) => `/${localeSlugs[locale]}/garmin-`),
  ];
  return {
    rules: [
      { userAgent: "*", allow, disallow },
      { userAgent: "OAI-SearchBot", allow, disallow },
      { userAgent: "ChatGPT-User", allow, disallow },
    ],
    sitemap: "https://trapeak.com/sitemap.xml",
    host: "https://trapeak.com",
  };
}
