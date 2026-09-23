import type { EventConfig } from "@/lib/event-config";

export type ThemeKey =
  | "natur"
  | "ballons"
  | "schwarz"
  | "weiss"
  | "gruen"
  | "blau"
  | "rot"
  | "gelb"
  | "orange"
  | "pink";

// Order here drives the theme-picker order in EventDialog (THEME_KEYS is
// derived from Object.keys(THEME_LABELS)).
export const THEME_LABELS: Record<ThemeKey, string> = {
  weiss: "Weiß",
  schwarz: "Schwarz",
  gruen: "Grün",
  blau: "Blau",
  rot: "Rot",
  pink: "Pink",
  orange: "Orange",
  gelb: "Gelb",
  ballons: "Ballons",
  natur: "Natur",
};

// Maps to the CSS theme classes defined in globals.css.
export const THEME_CLASS_NAMES: Record<ThemeKey, string> = {
  weiss: "event-theme-weiss",
  schwarz: "event-theme-schwarz",
  gruen: "event-theme-gruen",
  blau: "event-theme-blau",
  rot: "event-theme-rot",
  pink: "event-theme-pink",
  orange: "event-theme-orange",
  gelb: "event-theme-gelb",
  ballons: "event-theme-ballons",
  natur: "event-theme",
};

export const THEME_ASSETS: Record<ThemeKey, EventConfig["assets"]> = {
  weiss: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790148387/logo_white.webp",
  },
  schwarz: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790110957/logo_black.webp",
  },
  gruen: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790155721/logo_green.webp",
  },
  blau: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790155524/logo_blue.webp",
  },
  rot: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790155236/logo_red.webp",
  },
  pink: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790154843/logo_pink.webp",
  },
  orange: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790154536/logo_orange.webp",
  },
  gelb: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790156281/logo_yellow.webp",
  },
  ballons: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790013301/logo_ballons.webp",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1790013007/baloons-left.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1789993865/baloons-right.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1789741690/accent-1.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1789741691/accent-2.webp",
  },
  natur: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790020058/ins_logo.webp",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642266/plants-left.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642267/plants-right.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1789756199/ins_accent-1.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1789756201/ins_accent-2.webp",
  },
};
