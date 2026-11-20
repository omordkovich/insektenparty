import type { Locale } from "@/i18n/config";

// Start page review banner: which cards it shows. Pure helpers (tested).

// `language`: the language the review was written in - it is always shown
// in that original text, on every language version of the site. Examples
// have none (they are page copy in the page language).
export type BannerReview = { rating: number; text: string; name: string; language?: Locale };

// From this many cards on the strip runs endlessly (see bannerLoops).
export const BANNER_MIN_CARDS = 6;
export const BANNER_MAX_REVIEWS = 20;

// Real (approved) reviews in every language; none yet → the labelled examples.
export function pickBannerReviews(
  approved: { rating: number; text: string; displayName: string | null; language: string }[],
  examples: BannerReview[],
  // Name for a review without first name - in the review's own language, so
  // it looks the same on every language version of the site.
  fallbackName: (language: Locale) => string,
): { items: BannerReview[]; examples: boolean } {
  if (approved.length === 0) return { items: examples, examples: true };
  return {
    items: approved.map((review) => ({
      rating: review.rating,
      text: review.text,
      name: review.displayName ?? fallbackName(review.language as Locale),
      language: review.language as Locale,
    })),
    examples: false,
  };
}

// The endless strip shows the list twice in a row; with fewer than
// BANNER_MIN_CARDS reviews that would put the same card on screen more than
// once, so the strip then shows each review exactly once and stands still.
export function bannerLoops(count: number): boolean {
  return count >= BANNER_MIN_CARDS;
}

// Constant speed of the strip - slow enough to read along.
export const STRIP_SPEED_PX_PER_S = 25;

// Endless strip (the track is rendered twice): the position after `seconds`
// at `speed`, wrapped back by one copy width - both copies look the same,
// so the jump is invisible.
export function stripAdvance(pos: number, seconds: number, speed: number, copyWidth: number): number {
  if (copyWidth <= 0) return pos;
  let next = pos + seconds * speed;
  while (next >= copyWidth) next -= copyWidth;
  return next;
}

// Index of the card whose middle is closest to `middle`.
export function nearestCard(middles: number[], middle: number): number {
  let best = 0;
  for (let i = 1; i < middles.length; i++) {
    if (Math.abs(middles[i] - middle) < Math.abs(middles[best] - middle)) best = i;
  }
  return best;
}

// Scroll position that puts a card (left edge, width) in the middle of the strip.
export function centerOn(cardLeft: number, cardWidth: number, stripWidth: number): number {
  return cardLeft + cardWidth / 2 - stripWidth / 2;
}
