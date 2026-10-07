import { describe, expect, it } from "vitest";
import {
  buildSlug,
  generateSlug as generate,
  SLUG_ALPHABET,
  SLUG_SUFFIX_LENGTH,
  slugKeyOf,
  slugNamePart,
} from "@/lib/slug";

// Most tests only care about the address itself.
const generateSlug = (input: Parameters<typeof generate>[0]) => generate(input).slug;

// Splits "<readable part>-<suffix>" so tests can check both halves.
function parts(slug: string) {
  const index = slug.lastIndexOf("-");
  return { readable: slug.slice(0, index), suffix: slug.slice(index + 1) };
}

describe("generateSlug", () => {
  it("combines the owner's first name, the title and a random suffix", () => {
    const { readable, suffix } = parts(generateSlug({ title: "Sommerfest", ownerName: "Anna Müller" }));
    expect(readable).toBe("anna-sommerfest");
    expect(suffix).toHaveLength(SLUG_SUFFIX_LENGTH);
  });

  it("uses only unambiguous characters in the suffix", () => {
    for (let i = 0; i < 50; i++) {
      const { suffix } = parts(generateSlug({ title: "x", ownerName: null }));
      for (const char of suffix) expect(SLUG_ALPHABET).toContain(char);
    }
    expect(SLUG_ALPHABET).not.toMatch(/[01ilo]/);
  });

  it("produces different slugs for the same input", () => {
    const slugs = new Set(
      Array.from({ length: 20 }, () => generateSlug({ title: "Party", ownerName: "Anna" })),
    );
    expect(slugs.size).toBe(20);
  });

  it("writes German umlauts and ß out and turns & into und", () => {
    expect(parts(generateSlug({ title: "Müllers Gartenfest & Grillen", ownerName: "Jörg" })).readable).toBe(
      "joerg-muellers-gartenfest-und-grillen",
    );
    expect(parts(generateSlug({ title: "Großer Spaß", ownerName: null })).readable).toBe("grosser-spass");
  });

  it("transliterates other scripts into Latin letters", () => {
    expect(parts(generateSlug({ title: "Праздник", ownerName: "Олег Иванов" })).readable).toBe(
      "oleg-prazdnik",
    );
    expect(parts(generateSlug({ title: "Γιορτή", ownerName: "Łukasz" })).readable).toBe("lukasz-giorti");
  });

  it("leaves out the name when there is none or it has no usable letters", () => {
    expect(parts(generateSlug({ title: "Sommerfest", ownerName: null })).readable).toBe("sommerfest");
    expect(parts(generateSlug({ title: "Sommerfest", ownerName: "  " })).readable).toBe("sommerfest");
    expect(parts(generateSlug({ title: "Sommerfest", ownerName: "小明" })).readable).toBe("sommerfest");
  });

  it('falls back to "event" when the title has no usable letters', () => {
    expect(parts(generateSlug({ title: "生日派对", ownerName: null })).readable).toBe("event");
    expect(parts(generateSlug({ title: "!!!", ownerName: "Anna" })).readable).toBe("anna-event");
  });

  it("caps the length of name and title", () => {
    const { readable } = parts(
      generateSlug({ title: "a".repeat(100), ownerName: "Maximilianusbartholomaeus Meier" }),
    );
    const [name, title] = readable.split("-");
    expect(name.length).toBeLessThanOrEqual(20);
    expect(title.length).toBeLessThanOrEqual(40);
  });

  it("never ends a capped part with a dash", () => {
    const slug = generateSlug({ title: `${"wort ".repeat(7)}ende`, ownerName: null });
    expect(slug).not.toMatch(/--/);
  });
});

describe("generateSlug – key", () => {
  it("returns the random suffix as the event's permanent key", () => {
    const { slug, key } = generate({ title: "Sommerfest", ownerName: "Anna" });
    expect(slug).toBe(`anna-sommerfest-${key}`);
    expect(key).toHaveLength(SLUG_SUFFIX_LENGTH);
  });

  it("returns the name part so it can be kept for later renames", () => {
    expect(generate({ title: "Sommerfest", ownerName: "Anna Müller" }).namePart).toBe("anna");
    expect(generate({ title: "Sommerfest", ownerName: null }).namePart).toBe("");
  });
});

describe("buildSlug", () => {
  it("rebuilds the readable part around an existing name part and key", () => {
    expect(buildSlug({ namePart: "anna", title: "Gartenparty", key: "k7q2xm" })).toBe(
      "anna-gartenparty-k7q2xm",
    );
  });

  it("keeps old keys exactly as they are and works without a name part", () => {
    expect(buildSlug({ namePart: "", title: "Gartenparty", key: "milans7BD" })).toBe(
      "gartenparty-milans7BD",
    );
  });
});

describe("slugNamePart", () => {
  it("is the transliterated first name, capped", () => {
    expect(slugNamePart("Jörg Meier")).toBe("joerg");
    expect(slugNamePart("Олег")).toBe("oleg");
    expect(slugNamePart(null)).toBe("");
    expect(slugNamePart("Maximilianusbartholomaeus").length).toBeLessThanOrEqual(20);
  });
});

describe("slugKeyOf", () => {
  it("reads the key from the end of an address", () => {
    expect(slugKeyOf("anna-sommerfest-k7q2xm")).toBe("k7q2xm");
    expect(slugKeyOf("sommerfest-k3x9qa")).toBe("k3x9qa");
  });

  it("treats an old address without dash as the key itself", () => {
    expect(slugKeyOf("milans7BD")).toBe("milans7BD");
  });
});
