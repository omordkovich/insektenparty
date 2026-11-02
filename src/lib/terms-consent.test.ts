import { describe, expect, it } from "vitest";
import { MIN_REGISTRATION_AGE, PRIVACY_VERSION, TERMS_VERSION } from "./legal-info";
import {
  consentMetadata,
  consentRequiredError,
  consentUpdate,
  hasAcceptedTerms,
  termsConsentState,
} from "./terms-consent";

const NOW = new Date("2026-12-01T09:00:00.000Z");
const CURRENT = { terms_accepted_at: "2026-11-05T12:00:00.000Z", terms_version: TERMS_VERSION };
const OUTDATED = {
  terms_accepted_at: "2026-10-05T12:00:00.000Z",
  terms_version: "2026-09-30",
  privacy_version: "2026-09-30",
  min_age_confirmed: MIN_REGISTRATION_AGE,
};

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

describe("termsConsentState", () => {
  it("is current once the current AGB version was accepted", () => {
    expect(termsConsentState(CURRENT)).toBe("current");
  });

  it("is outdated when an older AGB version (or none) was recorded with the timestamp", () => {
    expect(termsConsentState(OUTDATED)).toBe("outdated");
    expect(termsConsentState({ terms_accepted_at: "2026-10-05T12:00:00.000Z" })).toBe("outdated");
  });

  it("is none for accounts without consent data (e.g. first Google login)", () => {
    expect(termsConsentState({ name: "Max", full_name: "Max" })).toBe("none");
    expect(termsConsentState({ terms_accepted_at: "", terms_version: TERMS_VERSION })).toBe("none");
    expect(termsConsentState({ terms_accepted_at: 123 })).toBe("none");
    expect(termsConsentState(undefined)).toBe("none");
    expect(termsConsentState(null)).toBe("none");
  });

  it("ignores a newer privacy policy (no consent needed for it)", () => {
    expect(termsConsentState({ ...CURRENT, privacy_version: "2020-01-01" })).toBe("current");
  });
});

describe("hasAcceptedTerms", () => {
  it("is true only for the current AGB version", () => {
    expect(hasAcceptedTerms(CURRENT)).toBe(true);
    expect(hasAcceptedTerms(OUTDATED)).toBe(false);
    expect(hasAcceptedTerms({})).toBe(false);
  });
});

describe("consentUpdate", () => {
  it("records the full first consent for an account without one", () => {
    expect(consentUpdate({ name: "Max" }, NOW)).toEqual(consentMetadata(NOW));
  });

  it("re-records an outdated consent, keeping the first acceptance and the age confirmation", () => {
    expect(consentUpdate(OUTDATED, NOW)).toEqual({
      terms_accepted_at: "2026-12-01T09:00:00.000Z",
      terms_version: TERMS_VERSION,
      privacy_version: PRIVACY_VERSION,
      terms_first_accepted_at: "2026-10-05T12:00:00.000Z",
    });
  });

  it("keeps an already stored first acceptance on later changes", () => {
    const update = consentUpdate({ ...OUTDATED, terms_first_accepted_at: "2026-01-01T00:00:00.000Z" }, NOW);

    expect(update).toMatchObject({ terms_first_accepted_at: "2026-01-01T00:00:00.000Z" });
  });

  it("is null when the current version is already accepted", () => {
    expect(consentUpdate(CURRENT, NOW)).toBeNull();
  });
});

describe("consentRequiredError", () => {
  it("asks for AGB and age when there is no consent yet", () => {
    expect(consentRequiredError({})).toBe("Bitte bestätige zuerst die AGB und dein Alter.");
  });

  it("asks for the changed AGB when an older version was accepted", () => {
    expect(consentRequiredError(OUTDATED)).toBe("Bitte stimme zuerst den geänderten AGB zu.");
  });

  it("is null when the current version is accepted", () => {
    expect(consentRequiredError(CURRENT)).toBeNull();
  });
});
