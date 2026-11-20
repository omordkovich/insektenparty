import { describe, expect, it } from "vitest";
import { LOCALES } from "@/i18n/config";
import { MESSAGES } from "@/i18n/messages";
import {
  BANNER_MIN_CARDS,
  STRIP_SPEED_PX_PER_S,
  centerOn,
  bannerLoops,
  nearestCard,
  pickBannerReviews,
  stripAdvance,
} from "@/lib/reviews-banner";
import { EXAMPLE_REVIEWS } from "@/lib/example-reviews";

const examples = [
  { rating: 5, text: "Beispiel eins", name: "Anna" },
  { rating: 4, text: "Beispiel zwei", name: "Ben" },
];

const fallbackNames = { de: "Gastgeber:in", en: "Host", ru: "Организатор" } as const;
const fallbackName = (language: keyof typeof fallbackNames) => fallbackNames[language];

describe("pickBannerReviews", () => {
  it("shows the examples while there is no approved review", () => {
    expect(pickBannerReviews([], examples, fallbackName)).toEqual({ items: examples, examples: true });
  });

  it("shows only real reviews once there is one", () => {
    expect(
      pickBannerReviews([{ rating: 4, text: "Prima", displayName: "Mia", language: "de" }], examples, fallbackName),
    ).toEqual({ items: [{ rating: 4, text: "Prima", name: "Mia", language: "de" }], examples: false });
  });

  it("keeps every review in the language it was written in", () => {
    const { items } = pickBannerReviews(
      [
        { rating: 5, text: "Great tool", displayName: "Sam", language: "en" },
        { rating: 5, text: "Отлично", displayName: "Оля", language: "ru" },
      ],
      examples,
      fallbackName,
    );
    expect(items.map((item) => [item.text, item.language])).toEqual([
      ["Great tool", "en"],
      ["Отлично", "ru"],
    ]);
  });

  it("names a review without first name in its own language, whatever the page language", () => {
    const { items } = pickBannerReviews(
      [
        { rating: 5, text: "Great tool", displayName: null, language: "en" },
        { rating: 5, text: "Отлично", displayName: null, language: "ru" },
      ],
      examples,
      fallbackName,
    );
    expect(items.map((item) => item.name)).toEqual(["Host", "Организатор"]);
  });
});

describe("bannerLoops", () => {
  it("runs as an endless strip only from six reviews on", () => {
    expect(bannerLoops(6)).toBe(true);
    expect(bannerLoops(20)).toBe(true);
  });
  it("shows fewer reviews each exactly once, standing still", () => {
    expect(bannerLoops(5)).toBe(false);
    expect(bannerLoops(1)).toBe(false);
    expect(bannerLoops(0)).toBe(false);
  });
  it("needs at least six cards for the endless strip", () => {
    expect(BANNER_MIN_CARDS).toBe(6);
  });
});

describe("stripAdvance", () => {
  it("moves at a constant speed", () => {
    expect(stripAdvance(100, 0.5, 20, 1000)).toBe(110);
  });
  it("wraps by one copy so the endless strip has no seam", () => {
    expect(stripAdvance(995, 0.5, 20, 1000)).toBe(5);
  });
  it("stays put without a measured copy", () => {
    expect(stripAdvance(100, 0.5, 20, 0)).toBe(100);
  });
  it("is slow enough to read: about 25 px per second", () => {
    expect(STRIP_SPEED_PX_PER_S).toBe(25);
  });
});

describe("nearestCard", () => {
  it("finds the card whose middle is closest", () => {
    expect(nearestCard([100, 400, 700], 380)).toBe(1);
    expect(nearestCard([100, 400, 700], 0)).toBe(0);
    expect(nearestCard([100, 400, 700], 9999)).toBe(2);
  });
});

describe("centerOn", () => {
  it("returns the scroll position that puts the card in the middle", () => {
    // card 600-888 (middle 744) in a 766 px wide strip
    expect(centerOn(600, 288, 766)).toBe(361);
  });
});

describe("example reviews", () => {
  it("are six valid reviews, each written once in its own language", () => {
    expect(EXAMPLE_REVIEWS).toHaveLength(6);
    for (const example of EXAMPLE_REVIEWS) {
      expect(Number.isInteger(example.rating) && example.rating >= 1 && example.rating <= 5).toBe(true);
      expect(example.text.length).toBeGreaterThanOrEqual(20);
      expect(example.text.length).toBeLessThanOrEqual(200);
      expect(example.name.trim()).not.toBe("");
      expect(LOCALES).toContain(example.language);
    }
    expect(new Set(EXAMPLE_REVIEWS.map((example) => example.text)).size).toBe(6);
  });

  it("show every site language", () => {
    expect(new Set(EXAMPLE_REVIEWS.map((example) => example.language))).toEqual(new Set(LOCALES));
  });

  it.each(LOCALES)("are never translated: no example texts in the %s language file", (locale) => {
    expect(MESSAGES[locale].reviews).not.toHaveProperty("examples");
  });
});
