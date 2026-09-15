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

// Default content copied into a new party's DB row when it's created from
// this theme - editing party details isn't built yet, so every party of a
// given theme starts out identical to these values (see plan Phase 2).
export const THEME_PRESETS: Record<ThemeKey, Omit<PartyConfig, "assets">> = {
  insekten: {
    kicker: "Kindergeburtstag",
    title: "Milans 7. Geburtstag",
    greeting:
      "Willkommen zur Insektenparty! Wir freuen uns riesig, mit euch zu krabbeln, flattern und toben.",
    dateLabel: "Sonntag, 13. September 2026",
    timeLabel: "ab 09:30 (Frühstücksbuffet bis 11:30)",
    locationLabel: "Spielscheune, Krewelshof 1, 53797 Lohmar",
    defaultArrivalTime: "09:00",
    eventDate: "2026-09-13",
    eventStartTime: "09:00",
    eventEndTime: "11:30",
    contact: {
      name: "Familie Mordkovich",
      phone: "+49(0)15254267014",
      email: "o.mordkovich@hotmail.com",
    },
  },
  helden: {
    kicker: "WIR BLEIBEN JUNG UND WILD!",
    title: "Happy Birthday!",
    greeting:
      "Willkommen zur Jugendidolen-Party! Wir freuen uns riesig, mit euch zu feiern.",
    dateLabel: "Freitag, 4. September 2026",
    timeLabel: "ab 17:00 Uhr",
    locationLabel: "Am Mutzbach 24, 51969 Köln",
    defaultArrivalTime: "17:00",
    eventDate: "2026-09-04",
    eventStartTime: "17:00",
    eventEndTime: "21:00",
    contact: {
      name: "Familie Mordkovich",
      phone: "+49(0)15254267014",
      email: "o.mordkovich@hotmail.com",
    },
  },
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
