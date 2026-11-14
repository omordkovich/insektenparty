import Link from "next/link";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { serverTranslator } from "@/i18n/translator";

const t = serverTranslator(DEFAULT_LOCALE, "common");

export const metadata = { title: t("notFoundTitle") };

// Unknown paths outside [locale] (e.g. an unknown /event/<slug>): no layout
// renders <html> there, so this page brings its own. Deliberately minimal
// and free of next-intl's request state: Next.js renders it along with
// every page, and setRequestLocale or a message provider here would
// override the page's language and bloat every response.
export default function GlobalNotFound() {
  return (
    <html lang={DEFAULT_LOCALE} className="h-full">
      <body className="flex min-h-full flex-col items-center justify-center gap-6 px-6 py-16 text-center antialiased">
        <h1 className="font-display text-3xl text-leaf-dark sm:text-4xl">{t("notFoundHeading")}</h1>
        <p className="max-w-xl text-lg text-muted">{t("notFoundText")}</p>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-button-primary px-6 text-base font-bold text-button-primary-text transition hover:brightness-90"
        >
          {t("backHome")}
        </Link>
      </body>
    </html>
  );
}
