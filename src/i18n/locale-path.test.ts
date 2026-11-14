import { describe, expect, it } from "vitest";
import { splitLocalePrefix } from "./locale-path";

describe("splitLocalePrefix", () => {
  it("takes a language prefix off the path", () => {
    expect(splitLocalePrefix("/en/impressum")).toEqual({ locale: "en", path: "/impressum", prefixed: true });
    expect(splitLocalePrefix("/en")).toEqual({ locale: "en", path: "/", prefixed: true });
    expect(splitLocalePrefix("/de/about")).toEqual({ locale: "de", path: "/about", prefixed: true });
  });

  it("treats a path without prefix as the default language", () => {
    expect(splitLocalePrefix("/impressum")).toEqual({ locale: "de", path: "/impressum", prefixed: false });
    expect(splitLocalePrefix("/")).toEqual({ locale: "de", path: "/", prefixed: false });
  });

  it("leaves look-alike first segments alone", () => {
    expect(splitLocalePrefix("/english")).toEqual({ locale: "de", path: "/english", prefixed: false });
    expect(splitLocalePrefix("/event/en")).toEqual({ locale: "de", path: "/event/en", prefixed: false });
  });
});
