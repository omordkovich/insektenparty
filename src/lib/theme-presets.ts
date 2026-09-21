import type { EventConfig } from "@/lib/event-config";

export type ThemeKey = "insekten" | "ballons";

export const THEME_LABELS: Record<ThemeKey, string> = {
  insekten: "Insekten",
  ballons: "Ballons",
};

// Maps to the CSS theme classes defined in globals.css.
export const THEME_CLASS_NAMES: Record<ThemeKey, string> = {
  insekten: "event-theme",
  ballons: "event-theme-ballons",
};

export const THEME_ASSETS: Record<ThemeKey, EventConfig["assets"]> = {
  insekten: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1789985451/ins_logo.webp",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642266/plants-left.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642267/plants-right.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1789756199/ins_accent-1.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1789756201/ins_accent-2.webp",
  },
  ballons: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790013301/logo_ballons.webp",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1790013007/baloons-left.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1789993865/baloons-right.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1789741690/accent-1.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1789741691/accent-2.webp",
  },
};
