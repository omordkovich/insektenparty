// Cookie consent for optional third-party services. Strictly necessary
// cookies (Supabase login session, this consent entry itself) need no
// consent; Google reCAPTCHA does. The choice lives in localStorage so it
// never reaches the server. Bump CONSENT_VERSION whenever the categories
// or their description change - older entries are then ignored and the
// banner asks again.
export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = "gastzilla-cookie-consent";
const CONSENT_CHANGE_EVENT = "gastzilla:cookie-consent-change";

export type CookieConsent = {
  version: number;
  recaptcha: boolean;
  decidedAt: string;
};

export function createConsent(recaptcha: boolean, now: Date = new Date()): CookieConsent {
  return { version: CONSENT_VERSION, recaptcha, decidedAt: now.toISOString() };
}

export function parseConsent(raw: string | null): CookieConsent | null {
  if (raw === null) return null;

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { version, recaptcha, decidedAt } = value as Record<string, unknown>;
  if (version !== CONSENT_VERSION) return null;
  if (typeof recaptcha !== "boolean" || typeof decidedAt !== "string") return null;

  return { version, recaptcha, decidedAt };
}

// --- Browser-only helpers (used via useCookieConsent) ---

// localStorage can throw (blocked site data, some private modes). The
// in-memory copy keeps the choice for the current page in that case, so
// the banner does not reappear right after the visitor decided.
let memoryConsent: string | null = null;

export function readStoredConsent(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? memoryConsent;
  } catch {
    return memoryConsent;
  }
}

export function saveConsent(recaptcha: boolean): void {
  memoryConsent = JSON.stringify(createConsent(recaptcha));
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, memoryConsent);
  } catch {
    // Without storage the choice only lasts until the next page load.
  }
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

export function subscribeConsent(callback: () => void): () => void {
  function onStorage(event: StorageEvent) {
    if (event.key === CONSENT_STORAGE_KEY) callback();
  }

  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}
