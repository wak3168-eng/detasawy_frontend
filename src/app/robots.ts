import type { MetadataRoute } from "next";

/** The story is public; the portal behind the login is not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/contribute", "/onboarding", "/login", "/signup"],
    },
    sitemap: "https://detasawy.com/sitemap.xml",
    host: "https://detasawy.com",
  };
}
