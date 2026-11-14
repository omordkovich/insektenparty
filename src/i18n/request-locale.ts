import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";

type CookieSource = {
  cookies: { get(name: string): { value: string } | undefined };
  headers?: { get(name: string): string | null };
};

// First supported language of an Accept-Language header ("en-US,en;q=0.9").
function browserLocale(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { language: tag.split("-")[0].toLowerCase(), q: q ? Number(q.slice(2)) : 1 };
    })
    .filter((entry) => entry.language && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);
  return ranked.map((entry) => entry.language).find(isLocale) ?? null;
}

// Language of an event (stored value; anything unexpected counts as German).
export function eventLocale(event: { language: string }): Locale {
  return isLocale(event.language) ? event.language : DEFAULT_LOCALE;
}

// The visitor's language for requests outside an event (API calls from the
// site, the OAuth callback): their choice (cookie), else the browser's
// language - next-intl sets no cookie when the browser already matches.
export function cookieLocale(request: CookieSource): Locale {
  const value = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(value)) return value;
  return browserLocale(request.headers?.get("accept-language")) ?? DEFAULT_LOCALE;
}
