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
