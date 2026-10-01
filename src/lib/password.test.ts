import { describe, expect, it } from "vitest";
import { PASSWORD_MIN_LENGTH, validateNewPassword } from "@/lib/password";

describe("validateNewPassword", () => {
  it("accepts a password with 10+ characters, lower- and uppercase and a digit", () => {
    expect(validateNewPassword("Gastzilla2026")).toBeNull();
  });

  it("requires the minimum length", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(10);
    expect(validateNewPassword("Abcdefg12")).toMatch(/mindestens 10 Zeichen/);
  });

  it("requires a lowercase letter", () => {
    expect(validateNewPassword("GASTZILLA2026")).toMatch(/Kleinbuchstaben/);
  });

  it("requires an uppercase letter", () => {
    expect(validateNewPassword("gastzilla2026")).toMatch(/Großbuchstaben/);
  });

  it("requires a digit", () => {
    expect(validateNewPassword("Gastzillaparty")).toMatch(/Ziffer/);
  });

  it("checks letters like Supabase does (A–Z only, umlauts allowed but not counted)", () => {
    expect(validateNewPassword("Größenwahn2026")).toBeNull();
    // Only uppercase letter is an umlaut - Supabase would reject it.
    expect(validateNewPassword("größenwahn2026Ä")).toMatch(/Großbuchstaben/);
  });
});
