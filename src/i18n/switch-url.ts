import type { Locale } from "@/i18n/config";
import { translateOccasionPath } from "@/lib/occasion-slugs";
import { localizedPath } from "@/lib/page-metadata";

// Where the language switcher goes: the same page in the other language.
// `pathname` is without locale prefix (next-intl's usePathname); occasion
// pages have their own URL per language (/einladung/hochzeit ->
// /en/invitations/wedding). `suffix`: query string and hash, kept as they
// are (e.g. ?code=... on the password reset page).
export function languageSwitchHref(pathname: string, suffix: string, next: Locale): string {
  const target = translateOccasionPath(pathname, next) ?? pathname;
  return `${localizedPath(target, next)}${suffix}`;
}
