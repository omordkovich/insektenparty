import { cache } from "react";
import { getTranslations } from "next-intl/server";
import { type LocaleParams, pageLocale } from "@/i18n/page-locale";
import { ContentPage } from "@/components/ContentPage";
import { JsonLd } from "@/components/JsonLd";
import { ReviewFigure } from "@/components/ReviewFigure";
import { reviewCardTexts } from "@/components/review-card-texts";
import { localizedPath, pageMetadata } from "@/lib/page-metadata";
import { EXAMPLE_REVIEWS } from "@/lib/example-reviews";
import { pickBannerReviews } from "@/lib/reviews-banner";
import { REVIEWS_PAGE_LIMIT, REVIEWS_PAGE_PATH } from "@/lib/reviews-page";
import { SITE_URL } from "@/lib/site";
import { reviewsPageStructuredData } from "@/lib/structured-data";
import { getApprovedReviews } from "@/repositories/review-repository";

// New reviews appear as soon as they are approved.
export const dynamic = "force-dynamic";

// Metadata and page share one query per request.
const loadReviews = cache(async () => {
  try {
    return await getApprovedReviews(REVIEWS_PAGE_LIMIT);
  } catch (error) {
    // Never break the page over the database: show the examples instead.
    console.error("Reviews page: loading reviews failed:", error);
    return [];
  }
});

export async function generateMetadata({ params }: LocaleParams) {
  const locale = await pageLocale(params);
  const t = await getTranslations({ locale, namespace: "reviewsPage" });
  const approved = await loadReviews();
  return {
    ...pageMetadata({
      title: t("metaTitle"),
      description: t("description"),
      path: REVIEWS_PAGE_PATH,
      locale,
      alternates: true,
    }),
    // Examples only: nothing a search engine should list as reviews.
    ...(approved.length === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

// All approved reviews, newest first - every language, each in its original
// text (the same list on /bewertungen, /en/... and /ru/...; only the frame
// follows the page language). Until the first one is approved it shows the
// labelled examples of the start page banner.
export default async function ReviewsPage({ params }: LocaleParams) {
  const locale = await pageLocale(params);
  const t = await getTranslations("reviewsPage");
  const tr = await getTranslations("reviews");
  const approved = await loadReviews();
  const cardTexts = await reviewCardTexts(locale);
  const { items, examples } = pickBannerReviews(approved, EXAMPLE_REVIEWS, cardTexts.fallbackName);

  return (
    <ContentPage title={t("title")}>
      <JsonLd
        data={reviewsPageStructuredData({
          locale,
          name: t("metaTitle"),
          url: `${SITE_URL}${localizedPath(REVIEWS_PAGE_PATH, locale)}`,
        })}
      />
      <p className="text-center text-lg text-muted">{t("intro")}</p>
      {examples ? (
        <p className="mt-6 rounded-2xl bg-honey/15 px-4 py-3 text-center text-sm">{t("examplesNote")}</p>
      ) : (
        <p className="mt-4 text-center text-sm font-bold text-leaf-dark">{t("count", { count: items.length })}</p>
      )}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((review, index) => (
          <li key={index}>
            <ReviewFigure
              review={review}
              texts={cardTexts.forReview(review)}
              date={examples ? null : approved[index]?.approvedAt}
            />
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center text-xs text-muted">{examples ? tr("examplesNote") : tr("verification")}</p>
    </ContentPage>
  );
}
