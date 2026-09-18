import type { EventConfig } from "@/lib/event-config";

export type ThemeKey = "insekten" | "baloons";

export const THEME_LABELS: Record<ThemeKey, string> = {
  insekten: "Insekten",
  baloons: "Baloons",
};

// Maps to the CSS theme classes defined in globals.css.
export const THEME_CLASS_NAMES: Record<ThemeKey, string> = {
  insekten: "event-theme",
  baloons: "event-theme-baloons",
};

export const THEME_ASSETS: Record<ThemeKey, EventConfig["assets"]> = {
  insekten: {
    logo: "/theme-insekten/logo.png",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642266/plants-left.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642267/plants-right.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642265/accent-1.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642266/accent-2.webp",
  },
  baloons: {
    logo: "/theme-baloons/logo.png",
    plantsLeft: "/theme-baloons/plants-left.png",
    plantsRight: "/theme-baloons/plants-right.png",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1789741690/accent-1.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1789741691/accent-2.webp",
  },
};
