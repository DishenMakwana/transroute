import type { MetadataRoute } from "next";
import { getAllTransportsWithDetails } from "@/db/storage";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://transroute.in";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/analytics`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    const transports = await getAllTransportsWithDetails();
    const transportRoutes: MetadataRoute.Sitemap = transports.map((t) => ({
      url: `${baseUrl}/transports/${t.id}`,
      lastModified: t.updatedAt ? new Date(t.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    return [...staticRoutes, ...transportRoutes];
  } catch {
    return staticRoutes;
  }
}
