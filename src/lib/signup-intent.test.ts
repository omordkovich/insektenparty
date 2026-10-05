import { describe, expect, it } from "vitest";
import { parseSignupIntent, serializeSignupIntent } from "./signup-intent";

describe("signup intent cookie", () => {
  it("round-trips a display name, including umlauts and special characters", () => {
    for (const name of ["Max", "Jörg Müller-Lüdenscheidt", "100% Party", "名前 😀"]) {
      expect(parseSignupIntent(serializeSignupIntent(name))).toEqual({ displayName: name });
    }
  });

  it("only uses characters that survive any cookie handling", () => {
    expect(serializeSignupIntent("Jörg 100% / + =")).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("rejects missing, garbled or invalid values", () => {
    expect(parseSignupIntent(undefined)).toBeNull();
    expect(parseSignupIntent("")).toBeNull();
    expect(parseSignupIntent("%%%not-base64")).toBeNull();
    expect(parseSignupIntent(btoa("not json"))).toBeNull();
    expect(parseSignupIntent(serializeSignupIntent("   "))).toBeNull();
    expect(parseSignupIntent(serializeSignupIntent("x".repeat(500)))).toBeNull();
  });
});
