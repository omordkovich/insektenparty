import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/config";
import { languageAlternates, localizedPath } from "@/lib/page-metadata";
import { LEGAL_DOCUMENTS, type LegalDocument } from "@/lib/legal-documents";
import { PRIVACY_VERSION, TERMS_VERSION, WITHDRAWAL_VERSION } from "@/lib/legal-info";
import { COMPARISON } from "@/lib/comparison";
import { ABOUT_UPDATED, SITE_URL } from "@/lib/site";
import { latestOccasionUpdate, occasionAlternates, occasionPath, occasionsFor, occasionsPath } from "@/lib/occasions";
import { OCCASION_SECTION } from "@/lib/occasion-slugs";

// Date of the last real content change per page - search engines only
// trust lastModified while it stays accurate, so bump these by hand when a
// page's text changes (privacy policy and terms follow their versions).
const HOME_UPDATED = "2026-11-02";
const LEGAL_UPDATED: Record<LegalDocument, string> = {
  imprint: "2026-09-30",
  privacy: PRIVACY_VERSION,
  terms: TERMS_VERSION,
  withdrawal: WITHDRAWAL_VERSION,
};

function absolute(paths: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(paths).map(([lang, path]) => [lang, `${SITE_URL}${path}`]));
}

// Only public, indexable pages - never event pages (/event/...).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...LOCALES.map((locale) => ({
      url: `${SITE_URL}${localizedPath("/", locale)}`,
      lastModified: HOME_UPDATED,
      changeFrequency: "weekly" as const,
      priority: 1,
      alternates: { languages: absolute(languageAlternates("/")) },
    })),
    { url: `${SITE_URL}/about`, lastModified: ABOUT_UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}${COMPARISON.path}`, lastModified: COMPARISON.updated, changeFrequency: "monthly", priority: 0.8 },
    // Legal texts exist in every language (the German one is binding).
    ...(Object.keys(LEGAL_DOCUMENTS) as LegalDocument[]).flatMap((doc) =>
      LOCALES.map((locale) => ({
        url: `${SITE_URL}${localizedPath(LEGAL_DOCUMENTS[doc].href, locale)}`,
        lastModified: LEGAL_UPDATED[doc],
        changeFrequency: "yearly" as const,
        priority: 0.2,
        alternates: { languages: absolute(languageAlternates(LEGAL_DOCUMENTS[doc].href)) },
      })),
    ),
    ...LOCALES.flatMap((locale) => [
      {
        url: `${SITE_URL}${localizedPath(occasionsPath(locale), locale)}`,
        lastModified: latestOccasionUpdate(locale),
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates: { languages: absolute(languageAlternates(OCCASION_SECTION)) },
      },
      ...occasionsFor(locale).map((occasion) => ({
        url: `${SITE_URL}${localizedPath(occasionPath(occasion), locale)}`,
        lastModified: occasion.updated,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates: { languages: absolute(languageAlternates(occasionAlternates(occasion.id))) },
      })),
    ]),
  ];
}
