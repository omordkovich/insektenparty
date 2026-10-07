import type { MetadataRoute } from "next";
import { LEGAL_DOCUMENTS, type LegalDocument } from "@/lib/legal-documents";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal-info";
import { SITE_URL } from "@/lib/site";
import { latestOccasionUpdate, OCCASIONS, OCCASIONS_PATH, occasionPath } from "@/lib/occasions";

// Date of the last real content change per page - search engines only
// trust lastModified while it stays accurate, so bump these by hand when a
// page's text changes (privacy policy and terms follow their versions).
const HOME_UPDATED = "2026-10-07";
const ABOUT_UPDATED = "2026-10-06";
const LEGAL_UPDATED: Record<LegalDocument, string> = {
  imprint: "2026-09-30",
  privacy: PRIVACY_VERSION,
  terms: TERMS_VERSION,
  withdrawal: TERMS_VERSION,
};

// Only public, indexable pages - never event pages (/event/...).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: HOME_UPDATED, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: ABOUT_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    ...(Object.keys(LEGAL_DOCUMENTS) as LegalDocument[]).map((doc) => ({
      url: `${SITE_URL}${LEGAL_DOCUMENTS[doc].href}`,
      lastModified: LEGAL_UPDATED[doc],
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
    {
      url: `${SITE_URL}${OCCASIONS_PATH}`,
      lastModified: latestOccasionUpdate(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...OCCASIONS.map((occasion) => ({
      url: `${SITE_URL}${occasionPath(occasion)}`,
      lastModified: occasion.updated,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
