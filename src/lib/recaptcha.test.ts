import { describe, expect, it } from "vitest";
import { getRecaptchaToken } from "@/lib/recaptcha";

describe("getRecaptchaToken", () => {
  it("returns the trimmed token", () => {
    expect(getRecaptchaToken({ recaptchaToken: " abc " })).toBe("abc");
  });

  it("returns null when the token is missing, empty or not a string", () => {
    expect(getRecaptchaToken({})).toBeNull();
    expect(getRecaptchaToken({ recaptchaToken: " " })).toBeNull();
    expect(getRecaptchaToken({ recaptchaToken: 42 })).toBeNull();
    expect(getRecaptchaToken(null)).toBeNull();
    expect(getRecaptchaToken(["abc"])).toBeNull();
  });
});
