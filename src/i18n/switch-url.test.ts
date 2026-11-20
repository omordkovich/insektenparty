import { describe, expect, it } from "vitest";
import { languageSwitchHref } from "./switch-url";

describe("languageSwitchHref", () => {
  it("puts the page under the other language's prefix", () => {
    expect(languageSwitchHref("/about", "", "en")).toBe("/en/about");
    expect(languageSwitchHref("/about", "", "de")).toBe("/about");
    expect(languageSwitchHref("/", "", "en")).toBe("/en");
    expect(languageSwitchHref("/", "", "de")).toBe("/");
  });

  it("goes to the same occasion under its translated URL", () => {
    expect(languageSwitchHref("/einladung/hochzeit", "", "en")).toBe("/en/invitations/wedding");
    expect(languageSwitchHref("/invitations/wedding", "", "de")).toBe("/einladung/hochzeit");
  });

  it("keeps query string and hash", () => {
    expect(languageSwitchHref("/auth/reset-password", "?code=abc#form", "en")).toBe(
      "/en/auth/reset-password?code=abc#form",
    );
  });
});

describe("languageSwitchHref on design pages", () => {
  it("goes to the same design under its translated URL", () => {
    expect(languageSwitchHref("/designs/halloween-friedhof", "", "ru")).toBe("/ru/dizajny/khellouin-kladbishche");
    expect(languageSwitchHref("/designs/halloween-friedhof", "", "en")).toBe("/en/designs/halloween-graveyard");
    expect(languageSwitchHref("/dizajny/khellouin-kladbishche", "", "de")).toBe("/designs/halloween-friedhof");
    expect(languageSwitchHref("/designs", "", "ru")).toBe("/ru/dizajny");
  });
});
