import { getTranslations } from "next-intl/server";
import { LOCALES, type Locale } from "@/i18n/config";
import type { BannerReview } from "@/lib/reviews-banner";

export type ReviewCardTexts = {
  /** Language of everything shown on the card. */
  lang: Locale;
  starsLabel: string;
  quote: string;
  fallbackName: string;
  /** Month and year, for a date (the approval). */
  formatDate: (date: Date) => string;
};

// Texts of a review card. A real review is shown entirely in the language
// it was written in - quote marks, "no name" label, date, star label - so it
// looks exactly the same on every language version of the site. Examples
// (no language of their own) use the page language.
export async function reviewCardTexts(pageLocale: Locale) {
  const translators = Object.fromEntries(
    await Promise.all(
      LOCALES.map(async (locale) => [locale, await getTranslations({ locale, namespace: "reviews" })] as const),
    ),
  ) as Record<Locale, Awaited<ReturnType<typeof getTranslations<"reviews">>>>;

  return {
    fallbackName: (language: Locale) => translators[language]("fallbackName"),
    forReview(review: BannerReview): ReviewCardTexts {
      const lang = review.language ?? pageLocale;
      const t = translators[lang];
      const dateFormat = new Intl.DateTimeFormat(lang, { month: "long", year: "numeric", timeZone: "Europe/Berlin" });
      return {
        lang,
        starsLabel: t("starsLabel", { n: review.rating }),
        quote: t("quote", { text: review.text }),
        fallbackName: t("fallbackName"),
        formatDate: (date) => dateFormat.format(date),
      };
    },
  };
}
