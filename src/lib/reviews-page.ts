import { LOCALES, type Locale } from "@/i18n/config";

// The page listing all approved reviews (/bewertungen, /en/bewertungen,
// /ru/bewertungen - the same reviews, each in its original language, in a
// frame of the page language). Pure helpers (tested).

export const REVIEWS_PAGE_PATH = "/bewertungen";
export const REVIEWS_PAGE_LIMIT = 200;

// Sitemap: the page in every language once there is an approved review -
// while it shows nothing but examples it is noindex. Dated by the newest
// approval (YYYY-MM-DD).
export function reviewsSitemapEntries(latest: Date | null): { locale: Locale; lastModified: string }[] {
  if (!latest) return [];
  const lastModified = latest.toISOString().slice(0, 10);
  return LOCALES.map((locale) => ({ locale, lastModified }));
}
