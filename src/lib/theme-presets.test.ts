import { describe, expect, it } from "vitest";
import { FREE_THEMES, PREMIUM_THEMES, THEME_LABELS, themeLabel, type ThemeKey } from "./theme-presets";

const GERMAN_NAMES = [
  "Hochzeit",
  "Fußball",
  "Einschulung",
  "Weltall",
  "Dinosaurier",
  "Brettspiele",
  "Natur",
  "Karneval",
  "Weiß",
  "Grün",
  "Schaumparty",
  "Halloween-Friedhof",
  "Silvester",
  "Zauberei",
  "Piraten",
  "Kino",
  "Spielzeugautos",
  "Teddybär",
  "Prinzessin",
  "Rollenspiel",
];

describe("premium designs", () => {
  it("keeps exactly the colour designs free", () => {
    expect([...FREE_THEMES].sort()).toEqual(["blau", "gelb", "gruen", "orange", "pink", "rot", "schwarz", "weiss"]);
    expect(PREMIUM_THEMES).toHaveLength(Object.keys(THEME_LABELS).length - 8);
    expect(PREMIUM_THEMES).toContain("halloweengraveyard");
  });
});

describe("German design names", () => {
  it("names every design in German", () => {
    expect(themeLabel("halloweengraveyard", "de")).toBe("Halloween-Friedhof");
    expect(themeLabel("toycars", "de")).toBe("Spielzeugautos");
    expect(themeLabel("newyear", "de")).toBe("Silvester");
    expect(themeLabel("karnaval", "de")).toBe("Karneval");
  });

  it("keeps the English names", () => {
    expect(themeLabel("halloweengraveyard", "en")).toBe("Halloween Graveyard");
    expect(themeLabel("toycars", "en")).toBe("Toy Cars");
    expect(themeLabel("karnaval", "en")).toBe("Carnival");
  });
});

describe("themeLabel", () => {
  it("names every theme in English", () => {
    for (const key of Object.keys(THEME_LABELS) as ThemeKey[]) {
      const label = themeLabel(key, "en");
      expect(label, key).not.toMatch(/[äöüÄÖÜß]/);
      expect(GERMAN_NAMES, key).not.toContain(label);
    }
    expect(themeLabel("hochzeit", "en")).toBe("Wedding");
    expect(themeLabel("hochzeit", "de")).toBe("Hochzeit");
  });
});
