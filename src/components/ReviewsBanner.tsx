import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { EXAMPLE_REVIEWS } from "@/lib/example-reviews";
import { BANNER_MAX_REVIEWS, bannerLoops, pickBannerReviews, type BannerReview } from "@/lib/reviews-banner";
import { getApprovedReviews } from "@/repositories/review-repository";
import { Link } from "@/i18n/navigation";
import { REVIEWS_PAGE_PATH } from "@/lib/reviews-page";
import { buttonClassName } from "./Button";
import { cardClass } from "./card";
import { ReviewFigure } from "./ReviewFigure";
import { reviewCardTexts, type ReviewCardTexts } from "./review-card-texts";
import { ReviewsCarousel } from "./ReviewsCarousel";

async function approvedReviews() {
  try {
    return await getApprovedReviews(BANNER_MAX_REVIEWS);
  } catch (error) {
    // Never break the start page over the banner: fall back to the examples.
    console.error("ReviewsBanner: loading reviews failed:", error);
    return [];
  }
}

function ReviewCard({ review, texts, repeat }: { review: BannerReview; texts: ReviewCardTexts; repeat: boolean }) {
  return (
    <li className="w-64 shrink-0 px-2 sm:w-72" aria-hidden={repeat || undefined}>
      <ReviewFigure review={review} texts={texts} />
    </li>
  );
}

// Bottom of the start page: host reviews in an endless, slowly moving strip
// (ReviewsCarousel) - all languages, each in its original text, the same on
// every language version of the site. Until the first review
// is approved it shows clearly labelled examples. Rendered on the server, so
// the texts are in the HTML for search engines; the second copy of the
// endless strip is hidden from screen readers.
export async function ReviewsBanner() {
  const t = await getTranslations("reviews");
  const cardTexts = await reviewCardTexts((await getLocale()) as Locale);
  const { items, examples } = pickBannerReviews(
    await approvedReviews(),
    EXAMPLE_REVIEWS,
    cardTexts.fallbackName,
  );
  // Endless strip: the list twice in a row, it wraps by one copy without a
  // seam. Fewer reviews: each exactly once, standing still.
  const loop = bannerLoops(items.length);
  const strip = loop ? [...items, ...items] : items;

  return (
    <section aria-labelledby="reviews-title" className={`${cardClass} overflow-hidden px-0 sm:px-0`}>
      <h2 id="reviews-title" className="px-5 text-center font-display text-2xl text-leaf-dark">
        {t("title")}
        {examples ? <span className="ml-2 align-middle text-sm font-normal text-muted">{t("examplesLabel")}</span> : null}
      </h2>
      <div className="mt-2">
        <ReviewsCarousel
          loop={loop}
          perCopy={items.length}
          labelledBy="reviews-title"
          prevLabel={t("prev")}
          nextLabel={t("next")}
        >
          {strip.map((review, index) => (
            <ReviewCard
              key={index}
              review={review}
              texts={cardTexts.forReview(review)}
              repeat={index >= items.length}
            />
          ))}
        </ReviewsCarousel>
      </div>
      <p className="px-5 text-center text-xs text-muted">
        {examples ? t("examplesNote") : t("verification")}
      </p>
      <div className="mt-5 px-5 text-center">
        <Link href={REVIEWS_PAGE_PATH} className={buttonClassName("outline", "lg")}>
          {t("showAll")}
        </Link>
      </div>
    </section>
  );
}
