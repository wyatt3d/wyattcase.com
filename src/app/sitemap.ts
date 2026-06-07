import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/content";

const base = "https://wyattcase.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, priority: 1 },
    ...caseStudies.map((c) => ({
      url: `${base}/work/${c.slug}`,
      priority: 0.7,
    })),
  ];
}
