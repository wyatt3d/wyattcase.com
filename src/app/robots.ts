import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/hidden",
    },
    sitemap: "https://wyattcase.com/sitemap.xml",
  };
}
