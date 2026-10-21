import { describe, expect, it } from "vitest";
import {
  CONSENT_BANNER_SCRIPT,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  createConsent,
  parseConsent,
  SHOW_BANNER_ATTRIBUTE,
} from "@/lib/cookie-consent";

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

describe("CONSENT_BANNER_SCRIPT", () => {
  // Runs the inline script against a fake localStorage/document and reports
  // whether it revealed the banner.
  function showsBanner(stored: string | null | (() => never)): boolean {
    const attributes = new Set<string>();
    const localStorage = {
      getItem: (key: string) => {
        if (typeof stored === "function") stored();
        return key === CONSENT_STORAGE_KEY ? stored : null;
      },
    };
    const document = {
      documentElement: { setAttribute: (name: string) => attributes.add(name) },
    };
    new Function("localStorage", "document", CONSENT_BANNER_SCRIPT)(localStorage, document);
    return attributes.has(SHOW_BANNER_ATTRIBUTE);
  }

  it("keeps the banner hidden for a valid stored consent", () => {
    expect(showsBanner(JSON.stringify(createConsent(true)))).toBe(false);
    expect(showsBanner(JSON.stringify(createConsent(false)))).toBe(false);
  });

  it("shows the banner whenever parseConsent would not accept the entry", () => {
    expect(showsBanner(null)).toBe(true);
    expect(showsBanner("{not json")).toBe(true);
    expect(showsBanner("null")).toBe(true);
    expect(showsBanner(JSON.stringify([1, 2]))).toBe(true);
    expect(showsBanner(JSON.stringify({ ...createConsent(true), version: CONSENT_VERSION - 1 }))).toBe(true);
    expect(
      showsBanner(JSON.stringify({ version: CONSENT_VERSION, recaptcha: "yes", decidedAt: "x" })),
    ).toBe(true);
  });

  it("shows the banner when localStorage is blocked", () => {
    expect(
      showsBanner(() => {
        throw new Error("SecurityError");
      }),
    ).toBe(true);
  });
});
