import { describe, expect, it } from "vitest";
import { MIN_REGISTRATION_AGE, PRIVACY_VERSION, TERMS_VERSION } from "./legal-info";
import { consentMetadata, hasAcceptedTerms } from "./terms-consent";

describe("consentMetadata", () => {
  it("records the accepted versions, the age confirmation and the time", () => {
    const now = new Date("2026-10-05T12:00:00.000Z");

    expect(consentMetadata(now)).toEqual({
      terms_accepted_at: "2026-10-05T12:00:00.000Z",
      terms_version: TERMS_VERSION,
      privacy_version: PRIVACY_VERSION,
      min_age_confirmed: MIN_REGISTRATION_AGE,
    });
  });
});

describe("hasAcceptedTerms", () => {
  it("is true once a timestamp is stored", () => {
    expect(hasAcceptedTerms({ terms_accepted_at: "2026-10-05T12:00:00.000Z" })).toBe(true);
  });

  it("is false for accounts without consent data (e.g. first Google login)", () => {
    expect(hasAcceptedTerms({ name: "Max", full_name: "Max" })).toBe(false);
    expect(hasAcceptedTerms({ terms_accepted_at: "" })).toBe(false);
    expect(hasAcceptedTerms({ terms_accepted_at: 123 })).toBe(false);
    expect(hasAcceptedTerms(undefined)).toBe(false);
    expect(hasAcceptedTerms(null)).toBe(false);
  });
});
