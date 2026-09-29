"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  parseConsent,
  readStoredConsent,
  subscribeConsent,
  type CookieConsent,
} from "@/lib/cookie-consent";

type CookieConsentState =
  // Server render / before hydration: the stored choice is not known yet,
  // so nothing consent-dependent may render (avoids hydration mismatches
  // and a banner flash for visitors who already decided).
  | { loaded: false; consent: null }
  | { loaded: true; consent: CookieConsent | null };

// Every consumer re-renders as soon as the choice changes - in this tab via
// saveConsent's custom event, in other tabs via the storage event.
export function useCookieConsent(): CookieConsentState {
  const raw = useSyncExternalStore<string | null | undefined>(
    subscribeConsent,
    readStoredConsent,
    () => undefined,
  );

  return useMemo(
    () =>
      raw === undefined
        ? { loaded: false, consent: null }
        : { loaded: true, consent: parseConsent(raw) },
    [raw],
  );
}
