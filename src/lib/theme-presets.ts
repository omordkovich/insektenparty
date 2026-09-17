import type { PartyConfig } from "@/lib/party-config";

export type ThemeKey = "insekten" | "helden";

export const THEME_LABELS: Record<ThemeKey, string> = {
  insekten: "Insekten",
  helden: "Baloons",
};

// Maps to the existing CSS theme classes in globals.css (kept as-is - a
// rename would be purely cosmetic and not worth the churn/risk).
export const THEME_CLASS_NAMES: Record<ThemeKey, string> = {
  insekten: "party-theme",
  helden: "party-theme-jugendidolen",
};

export const THEME_ASSETS: Record<ThemeKey, PartyConfig["assets"]> = {
  insekten: {
    logo: "/theme-insekten/logo.png",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642266/plants-left.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642267/plants-right.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642265/accent-1.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642266/accent-2.webp",
  },
  helden: {
    logo: "/theme-helden/logo.png",
    plantsLeft: "/theme-helden/plants-left.png",
    plantsRight: "/theme-helden/plants-right.png",
    accentOne: "/theme-helden/accent-1.png",
    accentTwo: "/theme-helden/accent-2.png",
  },
};
