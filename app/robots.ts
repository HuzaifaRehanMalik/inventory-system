import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/guide",
      disallow: ["/api/", "/profile", "/settings", "/change-password"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
