import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://trapeak.com";
  const lastModified = new Date("2026-08-14");

  return [
    { url: baseUrl, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/ai-guides`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/use-cases/ai-workout-recommendations`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/use-cases/log-nutrition-with-ai`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/use-cases/track-blood-tests-with-ai`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/use-cases/use-multiple-ai-assistants`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/use-cases/share-data-with-coach`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/wahoo-to-chatgpt`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/wahoo-to-claude`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/wahoo-mcp`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/wearable-mcp`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/data-deletion`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
