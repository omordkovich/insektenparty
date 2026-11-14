import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALES } from "./config";

// German stays without prefix (existing URLs unchanged), English lives
// under /en.
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
  localeCookie: { name: LOCALE_COOKIE, maxAge: LOCALE_COOKIE_MAX_AGE, sameSite: "lax" },
  // hreflang comes from pageMetadata only - the automatic Link header would
  // also point German-only pages at their noindex /en copies.
  alternateLinks: false,
});
