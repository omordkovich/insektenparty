// The one public address of GASTZILLA. Used for canonical URLs, the
// sitemap, Open Graph previews, share links and links in e-mails - so
// search engines and shared links never point at mordkovich.vercel.app.
// Deliberately not read from an env var: every environment (local dev,
// preview deployments) must still advertise the production domain.
export const SITE_URL = "https://gastzilla.de";

export const SITE_NAME = "GASTZILLA";

// Link preview images (Open Graph): the size WhatsApp, Facebook & X expect.
export const OG_SIZE = { width: 1200, height: 630 };

export const SITE_DESCRIPTION =
  "Erstelle in wenigen Minuten eine digitale Einladung für Geburtstag, Hochzeit oder Firmenfeier. Link teilen, Gäste sagen selbst zu oder ab – ohne Konto, werbefrei.";
