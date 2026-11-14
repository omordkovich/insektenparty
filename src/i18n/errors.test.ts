import { describe, expect, it } from "vitest";
import { isLocale } from "./config";
import { err, translateError } from "./errors";

describe("translateError", () => {
  it("returns the German text", () => {
    expect(translateError("de", err("invalidRequest"))).toBe("Ungültige Anfragedaten.");
  });

  it("returns the English text", () => {
    expect(translateError("en", err("invalidRequest"))).toBe("Invalid request data.");
  });
});

describe("translateError – values", () => {
  it("fills in ICU values and plurals", () => {
    expect(translateError("en", err("signInRequired"))).toBe("Please sign in.");
    expect(translateError("de", err("nameTooShort", { min: 2 }))).toBe("Name muss mindestens 2 Zeichen lang sein.");
    expect(translateError("en", err("seatsLeft", { free: 1 }))).toBe("There's only 1 place left.");
    expect(translateError("en", err("fieldTooLong", { field: "locationLabel", max: 200 }))).toBe(
      "Location can be at most 200 characters long.",
    );
  });
});

describe("isLocale", () => {
  it("accepts the supported languages only", () => {
    expect(isLocale("de")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
