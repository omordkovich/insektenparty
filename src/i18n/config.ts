// Supported languages. Adding one: docs/neue-sprache.md - after the entry
// here, `npx tsc --noEmit` names every per-language table that still lacks
// it (all of them are typed Record<Locale, ...>).
export const LOCALES = ["de", "en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

// Remembers the chosen language (technically necessary, no consent needed).
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const LOCALE_COOKIE_MAX_AGE = 31536000; // 1 year in seconds

// Locale tag for Intl date/number formatting.
export const INTL_FORMAT_LOCALE: Record<Locale, string> = { de: "de-DE", en: "en-GB", ru: "ru-RU" };

// Open Graph og:locale (link previews).
export const OG_LOCALE: Record<Locale, string> = { de: "de_DE", en: "en_GB", ru: "ru_RU" };

// Shown in the language menu, each in its own language.
export const LOCALE_NAMES: Record<Locale, string> = { de: "Deutsch", en: "English", ru: "Русский" };
