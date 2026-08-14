import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard/", "/access/", "/mcp", "/sign-in", "/sign-up"] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/api/", "/dashboard/", "/access/", "/mcp", "/sign-in", "/sign-up"] },
      { userAgent: "ChatGPT-User", allow: "/", disallow: ["/api/", "/dashboard/", "/access/", "/mcp", "/sign-in", "/sign-up"] },
    ],
    sitemap: "https://trapeak.com/sitemap.xml",
    host: "https://trapeak.com",
  };
}
