import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { CONSENT_BANNER_SCRIPT } from "@/lib/cookie-consent";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import React from "react";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Resolves relative canonical/Open Graph URLs against the main domain.
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the inline script below may add an attribute
    // to <html> before React hydrates.
    <html lang="de" className={`${nunito.variable} ${fredoka.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        {/* First in <body> (no own <head> needed): it runs while parsing,
            before the cookie banner further down is painted. */}
        <script dangerouslySetInnerHTML={{ __html: CONSENT_BANNER_SCRIPT }} />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
