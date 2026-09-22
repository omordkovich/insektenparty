import type { EventConfig } from "@/lib/event-config";

export type ThemeKey = "natur" | "ballons" | "schwarz";

export const THEME_LABELS: Record<ThemeKey, string> = {
  natur: "Natur",
  ballons: "Ballons",
  schwarz: "Schwarz",
};

// Maps to the CSS theme classes defined in globals.css.
export const THEME_CLASS_NAMES: Record<ThemeKey, string> = {
  natur: "event-theme",
  ballons: "event-theme-ballons",
  schwarz: "event-theme-schwarz",
};

export const THEME_ASSETS: Record<ThemeKey, EventConfig["assets"]> = {
  natur: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790020058/ins_logo.webp",
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
  // No plantsLeft/plantsRight/accentOne/accentTwo - this theme has no
  // decorative side or floating graphics.
  schwarz: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790110957/logo_black.webp",
  },
};
