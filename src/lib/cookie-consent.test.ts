import { describe, expect, it } from "vitest";
import { CONSENT_VERSION, createConsent, parseConsent } from "@/lib/cookie-consent";

describe("createConsent", () => {
  it("stores the current version, the choice and the decision time", () => {
    const now = new Date("2026-09-29T10:00:00.000Z");
    expect(createConsent(true, now)).toEqual({
      version: CONSENT_VERSION,
      recaptcha: true,
      decidedAt: "2026-09-29T10:00:00.000Z",
    });
  });
});

describe("parseConsent", () => {
  it("round-trips a stored consent", () => {
    const consent = createConsent(false, new Date("2026-09-29T10:00:00.000Z"));
    expect(parseConsent(JSON.stringify(consent))).toEqual(consent);
  });

  it("returns null when nothing is stored", () => {
    expect(parseConsent(null)).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(parseConsent("{not json")).toBeNull();
  });

  it("returns null for a consent from an older version", () => {
    const outdated = { ...createConsent(true), version: CONSENT_VERSION - 1 };
    expect(parseConsent(JSON.stringify(outdated))).toBeNull();
  });

  it("returns null when fields have the wrong type", () => {
    expect(
      parseConsent(
        JSON.stringify({ version: CONSENT_VERSION, recaptcha: "yes", decidedAt: "x" }),
      ),
    ).toBeNull();
    expect(parseConsent(JSON.stringify([1, 2]))).toBeNull();
    expect(parseConsent("null")).toBeNull();
  });
});
