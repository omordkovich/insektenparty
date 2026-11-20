import type { BannerReview } from "@/lib/reviews-banner";

// Example reviews, shown (clearly labelled) until the first real review is
// approved. Like real reviews, each exists exactly once, in the language it
// is written in, and looks the same on every language version of the site -
// never translated, so they live here and not in messages/*.json. Only
// features GASTZILLA really has (skill optimizing-seo-aeo-geo, project-map.md).
export const EXAMPLE_REVIEWS: BannerReview[] = [
  {
    rating: 5,
    text: "Link in die WhatsApp-Gruppe, fertig. Alle haben ohne Konto zugesagt, und ich wusste endlich, wer kommt.",
    name: "Julia",
    language: "de",
  },
  {
    rating: 5,
    text: "Die Mitbringsel-Liste war Gold wert: Diesmal gab es nicht drei Nudelsalate und keinen Nachtisch.",
    name: "Markus",
    language: "de",
  },
  {
    rating: 4,
    text: "Handy that plus-ones are counted straight away. Made the food shop much easier.",
    name: "Priya",
    language: "en",
  },
  {
    rating: 5,
    text: "I got an email with every new reply, so I didn’t have to keep checking.",
    name: "Oliver",
    language: "en",
  },
  {
    rating: 5,
    text: "Гости указали время прихода — для детского дня рождения это было идеально.",
    name: "Мария",
    language: "ru",
  },
  {
    rating: 4,
    text: "Настроил за пять минут, и все сразу добавили дату в свой календарь.",
    name: "Алексей",
    language: "ru",
  },
];
