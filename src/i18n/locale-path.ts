import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

// The reverse of localizedPath (src/lib/page-metadata.ts): which language a
// public URL is in, and the path without its prefix. "/en/impressum" ->
// en + "/impressum"; no prefix -> the default language. Client-safe.
export function splitLocalePrefix(pathname: string): { locale: Locale; path: string; prefixed: boolean } {
  const match = /^\/([^/]+)(\/.*)?$/.exec(pathname);
  if (match && isLocale(match[1])) return { locale: match[1], path: match[2] ?? "/", prefixed: true };
  return { locale: DEFAULT_LOCALE, path: pathname, prefixed: false };
}
