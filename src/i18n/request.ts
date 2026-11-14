import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale } from "./config";
import { MESSAGES } from "./messages";

// Per request: the [locale] segment (or setRequestLocale on event pages),
// otherwise German.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
  return { locale, messages: MESSAGES[locale], timeZone: "Europe/Berlin" };
});
