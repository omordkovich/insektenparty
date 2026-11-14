"use client";

import { useSyncExternalStore } from "react";
import { CONSENT_BANNER_SCRIPT } from "@/lib/cookie-consent";

const noSubscription = () => () => {};

// The inline consent check (see CONSENT_BANNER_SCRIPT) only does its job in
// the server HTML, where it runs while the page is parsed. A client-side
// switch between the two root layouts (site <-> event page, 404 pages)
// rebuilds <html>: a script created there would never run, and React warns
// about it ("Encountered a script tag"). So it renders only while the
// server HTML is hydrated; the banner itself takes over from there
// (CookieBanner).
export function ConsentBannerScript() {
  const fromServerHtml = useSyncExternalStore(
    noSubscription,
    () => false,
    () => true,
  );
  return fromServerHtml ? <script dangerouslySetInnerHTML={{ __html: CONSENT_BANNER_SCRIPT }} /> : null;
}
