import type { BannerReview } from "@/lib/reviews-banner";
import type { ReviewCardTexts } from "./review-card-texts";

type ReviewFigureProps = {
  review: BannerReview;
  /** From reviewCardTexts(): everything on the card in the review's language. */
  texts: ReviewCardTexts;
  /** Approval date - real reviews on the reviews page only. */
  date?: Date | null;
};

// One review card: stars, quote, name (and date). Shared by the start page
// banner and the reviews page. A real review is stored once, in the language
// it was written in, and its card is entirely in that language (marked with
// `lang`) - it looks exactly the same on every language version of the site.
export function ReviewFigure({ review, texts, date }: ReviewFigureProps) {
  return (
    <figure
      lang={texts.lang}
      className="flex h-full flex-col rounded-2xl border border-leaf/20 bg-[var(--surface)] p-4 text-left shadow-(--shadow)"
    >
      <p className="text-lg leading-none text-amber-500" role="img" aria-label={texts.starsLabel}>
        {"★".repeat(review.rating)}
        <span className="text-zinc-300">{"★".repeat(5 - review.rating)}</span>
      </p>
      <blockquote className="mt-3 flex-1 text-sm text-zinc-700">{texts.quote}</blockquote>
      <figcaption className="mt-3 text-sm">
        <span className="font-bold text-leaf-dark">– {review.name}</span>
        {date ? <span className="ml-2 text-xs text-muted">{texts.formatDate(date)}</span> : null}
      </figcaption>
    </figure>
  );
}
