import type { Locale } from "@/i18n/config";

// The one public address of GASTZILLA. Used for canonical URLs, the
// sitemap, Open Graph previews, share links and links in e-mails - so
// search engines and shared links never point at mordkovich.vercel.app.
// Deliberately not read from an env var: every environment (local dev,
// preview deployments) must still advertise the production domain.
export const SITE_URL = "https://gastzilla.de";

export const SITE_NAME = "GASTZILLA";

// Official profiles - linked in the footer and "Über uns", and listed as
// sameAs in the Organization schema so search engines and AI assistants
// connect them with gastzilla.de.
export const INSTAGRAM_HANDLE = "@gastzilla";
export const INSTAGRAM_URL = "https://www.instagram.com/gastzilla/";

// Link preview images (Open Graph): the size WhatsApp, Facebook & X expect.
export const OG_SIZE = { width: 1200, height: 630 };

export const SITE_DESCRIPTION =
  "Digitale Einladung für Geburtstag, Hochzeit oder Firmenfeier in Minuten: Termin abstimmen, Link teilen, Gäste sagen selbst zu oder ab – ohne Konto, werbefrei.";

// The start page's description per language (meta description, schema,
// llms.txt).
export const SITE_DESCRIPTIONS: Record<Locale, string> = {
  de: SITE_DESCRIPTION,
  en: "Online invitation for a birthday, wedding or office party in minutes: agree on a date, share the link, guests reply yes or no themselves – no account, no ads.",
  ru: "Онлайн-приглашение на день рождения, свадьбу или корпоратив за пару минут: выберите дату вместе с гостями, отправьте ссылку – гости сами ответят, придут или нет. Без регистрации гостей и без рекламы.",
};

// Last real text change of "Über uns" (sitemap, schema, visible date).
export const ABOUT_UPDATED = "2026-10-14";
