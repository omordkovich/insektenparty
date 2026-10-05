import { MIN_REGISTRATION_AGE, PRIVACY_VERSION, TERMS_VERSION } from "./legal-info";

// Proof of which AGB/privacy policy version was accepted, that the minimum
// age was confirmed - and when. Stored in the user's metadata, both at email
// signup and after a Google signup (see /auth/callback and /auth/consent).
export function consentMetadata(now: Date = new Date()) {
  return {
    terms_accepted_at: now.toISOString(),
    terms_version: TERMS_VERSION,
    privacy_version: PRIVACY_VERSION,
    min_age_confirmed: MIN_REGISTRATION_AGE,
  };
}

export function hasAcceptedTerms(userMetadata: unknown): boolean {
  if (typeof userMetadata !== "object" || userMetadata === null) return false;
  const acceptedAt = (userMetadata as Record<string, unknown>).terms_accepted_at;
  return typeof acceptedAt === "string" && acceptedAt !== "";
}

// The register tab tells /auth/callback that the AGB/age checkboxes were
// ticked by setting this cookie right before the redirect to Google. It is a
// cookie and not a `?consent=1` on the redirect URL because Supabase only
// accepts redirect URLs that match its allow-list exactly: a query string made
// it fall back to the Site URL, and the callback never ran. The cookie is only
// sent to the callback path and holds no personal data.
export const GOOGLE_CONSENT_COOKIE = "gz_google_consent";
export const GOOGLE_CONSENT_COOKIE_PATH = "/auth/callback";
export const GOOGLE_CONSENT_COOKIE_MAX_AGE_SECONDS = 600;
