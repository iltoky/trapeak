import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://trapeak.com";
  const lastModified = new Date("2026-08-12");

  return [
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/garmin-to-chatgpt`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/garmin-to-claude`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/garmin-mcp`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/wearable-mcp`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/data-deletion`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
