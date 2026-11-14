import type { Metadata } from "next";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  // Resolves relative canonical/Open Graph URLs against the main domain.
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
};

// <html> is rendered one level down - by app/[locale]/layout.tsx for the
// site and app/event/[slug]/layout.tsx for events (their language comes
// from the event) - so each can set its own `lang`.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
