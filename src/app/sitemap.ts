import type { MetadataRoute } from "next";
import { LEGAL_DOCUMENTS } from "@/lib/legal-documents";
import { SITE_URL } from "@/lib/site";

// Only public, indexable pages - never event pages (/p/...).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    ...Object.values(LEGAL_DOCUMENTS).map((doc) => ({
      url: `${SITE_URL}${doc.href}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
