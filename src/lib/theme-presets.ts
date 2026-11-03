import type { EventConfig } from "@/lib/event-config";

export type ThemeKey =
  | "natur"
  | "ballons"
  | "foam"
  | "halloweenclay"
  | "halloweengraveyard"
  | "halloweenkids"
  | "christmaskids"
  | "christmassnow"
  | "artdeco"
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
  foam: "Foam",
  halloweenclay: "Halloween Clay",
  halloweengraveyard: "Halloween Graveyard",
  halloweenkids: "Halloween Kids",
  christmaskids: "Christmas Kids",
  christmassnow: "Christmas Snow",
  artdeco: "Art Deco",
  natur: "Natur",
};

// Themes that must be unlocked per user (see user_entitlements, feature key
// "theme:<key>"). Adding a paid theme later only needs a new entry here -
// the DB check constraint only enforces the "theme:%" pattern.
export const PREMIUM_THEMES: readonly ThemeKey[] = ["natur", "ballons"];

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
  foam: "event-theme-foam",
  halloweenclay: "event-theme-halloweenclay",
  halloweengraveyard: "event-theme-halloweengraveyard",
  halloweenkids: "event-theme-halloweenkids",
  christmaskids: "event-theme-christmaskids",
  christmassnow: "event-theme-christmassnow",
  artdeco: "event-theme-artdeco",
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
  foam: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793648356/foam_logo.webp",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1793693760/foam_bg_l.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1793693761/foam_bg_r.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1793648360/foam_accent_l.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793648361/foam_accent_r.webp",
  },
  halloweenclay: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793699235/halloweenclay_logo.webp",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1793695186/halloweenclay_bg_l.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1793695187/halloweenclay_bg_r.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1793699236/halloweenclay_accent_l.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793699238/halloweenclay_accent_r.webp",
  },
  halloweengraveyard: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793699058/halloweengraveyard_logo.webp",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1793696198/halloweengraveyard_bg_l.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1793696199/halloweengraveyard_bg_r.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1793698871/halloweengraveyard_accent_l.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793698873/halloweengraveyard_accent_r.webp",
  },
  halloweenkids: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793700790/halloweenkids_logo.webp",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1793700791/halloweenkids_bg_l.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1793700792/halloweenkids_bg_r.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1793700793/halloweenkids_accent_l.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793700794/halloweenkids_accent_r.webp",
  },
  christmaskids: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793701693/christmaskids_logo.webp",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1793701694/christmaskids_bg_l.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1793701696/christmaskids_bg_r.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1793701696/christmaskids_accent_l.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793701697/christmaskids_accent_r.webp",
  },
  christmassnow: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793703382/christmassnow_logo.webp",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1793703383/christmassnow_bg_l.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1793703384/christmassnow_bg_r.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1793703385/christmassnow_accent_l.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793703386/christmassnow_accent_r.webp",
  },
  artdeco: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793704033/artdeco_logo.webp",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1793704034/artdeco_bg_l.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1793704036/artdeco_bg_r.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1793704036/artdeco_accent_l.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1793704037/artdeco_accent_r.webp",
  },
  natur: {
    logo: "https://res.cloudinary.com/d6sufegz/image/upload/v1790020058/ins_logo.webp",
    plantsLeft: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642266/plants-left.webp",
    plantsRight: "https://res.cloudinary.com/d6sufegz/image/upload/v1789642267/plants-right.webp",
    accentOne: "https://res.cloudinary.com/d6sufegz/image/upload/v1789756199/ins_accent-1.webp",
    accentTwo: "https://res.cloudinary.com/d6sufegz/image/upload/v1789756201/ins_accent-2.webp",
  },
};
