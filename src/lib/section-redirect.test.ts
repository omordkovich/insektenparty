import { describe, expect, it } from "vitest";
import { sectionRedirect } from "@/lib/section-redirect";

describe("sectionRedirect", () => {
  it("leaves a section under its own language alone", () => {
    expect(sectionRedirect("/einladung/hochzeit")).toBeNull();
    expect(sectionRedirect("/en/invitations/wedding")).toBeNull();
    expect(sectionRedirect("/designs/halloween-friedhof")).toBeNull();
    expect(sectionRedirect("/en/designs/halloween-graveyard")).toBeNull();
    expect(sectionRedirect("/ru/dizajny")).toBeNull();
    expect(sectionRedirect("/about")).toBeNull();
  });

  it("adds the missing language prefix", () => {
    expect(sectionRedirect("/invitations/wedding")).toBe("/en/invitations/wedding");
    expect(sectionRedirect("/dizajny")).toBe("/ru/dizajny");
    expect(sectionRedirect("/dizajny/khellouin-kladbishche")).toBe("/ru/dizajny/khellouin-kladbishche");
  });

  it("translates a section put under another language's prefix", () => {
    expect(sectionRedirect("/en/einladung/hochzeit")).toBe("/en/invitations/wedding");
    expect(sectionRedirect("/en/dizajny/khellouin-kladbishche")).toBe("/en/designs/halloween-graveyard");
    expect(sectionRedirect("/ru/designs/halloween-friedhof")).toBe("/ru/dizajny/khellouin-kladbishche");
  });
});

describe("sectionRedirect with a shared section name", () => {
  // German and English both use /designs: next-intl sends a visitor with the
  // English cookie from /designs/<german slug> to /en/designs/<german slug>.
  it("swaps in the slug of the prefix's language", () => {
    expect(sectionRedirect("/en/designs/halloween-friedhof")).toBe("/en/designs/halloween-graveyard");
    expect(sectionRedirect("/designs/halloween-graveyard")).toBe("/designs/halloween-friedhof");
  });

  it("leaves unknown slugs to the 404 page", () => {
    expect(sectionRedirect("/en/designs/gibt-es-nicht")).toBeNull();
  });
});
