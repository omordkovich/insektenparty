import { NextIntlClientProvider } from "next-intl";
import { Fredoka, Nunito } from "next/font/google";
import type { ReactNode } from "react";
import { ConsentBannerScript } from "@/components/ConsentBannerScript";
import { CookieBanner } from "@/components/CookieBanner";
import type { Locale } from "@/i18n/config";
import { MESSAGES } from "@/i18n/messages";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

type HtmlShellProps = {
  locale: Locale;
  children: ReactNode;
  /** Event pages: the theme wrapper. Portalled dialogs (data-theme-root)
   *  and the cookie banner live inside it so they take the event's theme. */
  themeClassName?: string;
};

// <html>/<body> for both root layouts: the site ([locale]) and event pages
// (whose language comes from the event, not the URL).
export function HtmlShell({ locale, children, themeClassName }: HtmlShellProps) {
  return (
    // suppressHydrationWarning: the inline script below may add an attribute
    // to <html> before React hydrates.
    <html lang={locale} className={`${nunito.variable} ${fredoka.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        {/* First in <body> (no own <head> needed): it runs while parsing,
            before the cookie banner further down is painted. */}
        <ConsentBannerScript />
        <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Europe/Berlin">
          {themeClassName !== undefined ? (
            <div className={themeClassName} data-theme-root>
              {children}
              <CookieBanner insideEvent />
            </div>
          ) : (
            <>
              {children}
              <CookieBanner />
            </>
          )}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
