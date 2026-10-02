import { describe, expect, it } from "vitest";
import { PASSWORD_MIN_LENGTH, PASSWORD_SYMBOLS, validateNewPassword } from "@/lib/password";

describe("validateNewPassword", () => {
  it("accepts a password with 10+ characters, lower- and uppercase, a digit and a symbol", () => {
    expect(validateNewPassword("Gastzilla2026!")).toBeNull();
  });

  it("requires the minimum length", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(10);
    expect(validateNewPassword("Abcdef12!")).toMatch(/mindestens 10 Zeichen/);
  });

  it("requires a lowercase letter", () => {
    expect(validateNewPassword("GASTZILLA2026!")).toMatch(/Kleinbuchstaben/);
  });

  it("requires an uppercase letter", () => {
    expect(validateNewPassword("gastzilla2026!")).toMatch(/Großbuchstaben/);
  });

  it("requires a digit", () => {
    expect(validateNewPassword("Gastzillaparty!")).toMatch(/Ziffer/);
  });

  it("requires a symbol", () => {
    expect(validateNewPassword("Gastzilla2026")).toMatch(/Sonderzeichen/);
  });

  it("accepts every symbol Supabase counts", () => {
    // The list shown to users must be exactly what the rule accepts.
    expect(PASSWORD_SYMBOLS).toBe("!@#$%^&*()_+-=[]{};':\"\\|<>?,./`~");
    for (const symbol of PASSWORD_SYMBOLS) {
      expect(validateNewPassword(`Gastzilla2026${symbol}`)).toBeNull();
    }
  });

  it("does not count spaces, umlauts or other letters/signs as a symbol (Supabase would reject it)", () => {
    for (const notSymbol of [" ", "ä", "ß", "€", "§"]) {
      expect(validateNewPassword(`Gastzilla2026${notSymbol}`)).toMatch(/Sonderzeichen/);
    }
  });

  it("checks letters like Supabase does (A–Z only, umlauts allowed but not counted)", () => {
    expect(validateNewPassword("Größenwahn2026!")).toBeNull();
    // Only uppercase letter is an umlaut - Supabase would reject it.
    expect(validateNewPassword("größenwahn2026Ä!")).toMatch(/Großbuchstaben/);
  });
});
