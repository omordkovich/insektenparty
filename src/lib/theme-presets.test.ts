import { describe, expect, it } from "vitest";
import { THEME_LABELS, themeLabel, type ThemeKey } from "./theme-presets";

const GERMAN_NAMES = ["Hochzeit", "Fußball", "Einschulung", "Weltall", "Dinosaurier", "Brettspiele", "Natur", "Karnaval", "Weiß", "Grün"];

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
