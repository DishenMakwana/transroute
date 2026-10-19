import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://transroute.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/export"],
      },
      {
        userAgent: ["GPTBot", "Claude-Web", "PerplexityBot", "Google-Extended"],
        allow: [
          "/",
          "/analytics",
          "/transports/",
          "/llms.txt",
          "/llms-full.txt",
        ],
        disallow: ["/api/export"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
