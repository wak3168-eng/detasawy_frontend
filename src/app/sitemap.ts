import type { MetadataRoute } from "next";

/** Only the pages a stranger should land on. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: "https://detasawy.com",
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://detasawy.com/leaderboard",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
