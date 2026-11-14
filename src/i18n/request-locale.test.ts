import { describe, expect, it } from "vitest";
import { cookieLocale, eventLocale } from "./request-locale";

function withCookie(value?: string, acceptLanguage?: string) {
  return {
    cookies: { get: (name: string) => (name === "NEXT_LOCALE" && value ? { value } : undefined) },
    headers: new Headers(acceptLanguage ? { "accept-language": acceptLanguage } : {}),
  };
}

describe("eventLocale", () => {
  it("uses the event's language", () => {
    expect(eventLocale({ language: "en" })).toBe("en");
  });

  it("falls back to German for unknown values", () => {
    expect(eventLocale({ language: "xx" })).toBe("de");
  });
});

describe("cookieLocale", () => {
  it("reads the language cookie", () => {
    expect(cookieLocale(withCookie("en"))).toBe("en");
  });

  it("falls back to German without or with an unsupported cookie", () => {
    expect(cookieLocale(withCookie())).toBe("de");
    expect(cookieLocale(withCookie("fr"))).toBe("de");
  });
});

describe("cookieLocale – browser language", () => {
  it("uses the browser language when no language was chosen", () => {
    expect(cookieLocale(withCookie(undefined, "en-US,en;q=0.9"))).toBe("en");
    expect(cookieLocale(withCookie(undefined, "fr-FR, de;q=0.5"))).toBe("de");
    expect(cookieLocale(withCookie(undefined, "fr-FR"))).toBe("de");
  });

  it("prefers the chosen language over the browser language", () => {
    expect(cookieLocale(withCookie("de", "en-US"))).toBe("de");
  });
});
