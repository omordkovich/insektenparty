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

// "none": never accepted (account created through Google's login tab).
// "outdated": accepted an older AGB version - AGB § 12 binds existing
// accounts to a change only once they agree to it. Only the AGB count: the
// privacy policy is information, not something to agree to.
export type TermsConsentState = "none" | "outdated" | "current";

function metadataRecord(userMetadata: unknown): Record<string, unknown> {
  return typeof userMetadata === "object" && userMetadata !== null
    ? (userMetadata as Record<string, unknown>)
    : {};
}

export function termsConsentState(userMetadata: unknown): TermsConsentState {
  const { terms_accepted_at: acceptedAt, terms_version: version } = metadataRecord(userMetadata);
  if (typeof acceptedAt !== "string" || acceptedAt === "") return "none";
  return version === TERMS_VERSION ? "current" : "outdated";
}

export function hasAcceptedTerms(userMetadata: unknown): boolean {
  return termsConsentState(userMetadata) === "current";
}

// The metadata to store when the user agrees now (null: nothing to do). A
// first consent records everything; agreeing to changed AGB renews the
// versions and the time, keeps the age confirmation from the registration
// and remembers when the very first consent was given.
export function consentUpdate(userMetadata: unknown, now: Date = new Date()) {
  const state = termsConsentState(userMetadata);
  if (state === "current") return null;
  if (state === "none") return consentMetadata(now);

  const metadata = metadataRecord(userMetadata);
  return {
    terms_accepted_at: now.toISOString(),
    terms_version: TERMS_VERSION,
    privacy_version: PRIVACY_VERSION,
    terms_first_accepted_at: metadata.terms_first_accepted_at ?? metadata.terms_accepted_at,
  };
}

// Error for API routes that need the current AGB (creating events, buying).
export function consentRequiredError(userMetadata: unknown): string | null {
  switch (termsConsentState(userMetadata)) {
    case "none":
      return "Bitte bestätige zuerst die AGB und dein Alter.";
    case "outdated":
      return "Bitte stimme zuerst den geänderten AGB zu.";
    case "current":
      return null;
  }
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
