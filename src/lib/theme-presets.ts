import type { PartyConfig } from "@/lib/party-config";

export type ThemeKey = "insekten" | "helden";

export const THEME_LABELS: Record<ThemeKey, string> = {
  insekten: "Insekten",
  helden: "Helden",
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
    plantsLeft: "/theme-insekten/plants-left.png",
    plantsRight: "/theme-insekten/plants-right.png",
    accentOne: "/theme-insekten/accent-1.png",
    accentTwo: "/theme-insekten/accent-2.png",
  },
  helden: {
    logo: "/theme-helden/logo.png",
    plantsLeft: "/theme-helden/plants-left.png",
    plantsRight: "/theme-helden/plants-right.png",
    accentOne: "/theme-helden/accent-1.png",
    accentTwo: "/theme-helden/accent-2.png",
  },
};
