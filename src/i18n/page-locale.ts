import { setRequestLocale } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

export type LocaleParams = { params: Promise<{ locale: string }> };

// Reads the [locale] segment and registers it for this request, so the
// page can render statically. Every page/layout under [locale] calls it
// before translating anything.
export async function pageLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  setRequestLocale(resolved);
  return resolved;
}
