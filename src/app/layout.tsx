import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
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
    <html lang="de" className={`${nunito.variable} ${fredoka.variable} h-full`}>
      <body className="min-h-full antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
