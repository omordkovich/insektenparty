import { describe, expect, it } from "vitest";
import {
  canCreateEvent,
  canUseTheme,
  EVENT_SLOT_FEATURE,
  FREE_EVENT_LIMIT,
  isThemeSelectable,
  resolveEntitlements,
  themeFeatureKey,
} from "@/lib/features";
import { PREMIUM_THEMES, THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";

const ALL_THEMES = Object.keys(THEME_LABELS) as ThemeKey[];
const FREE_THEMES = ALL_THEMES.filter((t) => !PREMIUM_THEMES.includes(t));

describe("themeFeatureKey", () => {
  it("prefixes the theme key", () => {
    expect(themeFeatureKey("natur")).toBe("theme:natur");
  });
});

describe("resolveEntitlements", () => {
  it("without rows: all non-premium themes unlocked, free event limit", () => {
    const result = resolveEntitlements([], 0);
    expect(result.unlockedThemes).toEqual(FREE_THEMES);
    expect(result.unlockedThemes).not.toContain("natur");
    expect(result.unlockedThemes).not.toContain("ballons");
    expect(result.eventLimit).toBe(FREE_EVENT_LIMIT);
    expect(result.eventCount).toBe(0);
  });

  it("unlocks a premium theme only when its row exists", () => {
    const result = resolveEntitlements([{ feature: "theme:natur", quantity: 1 }], 0);
    expect(result.unlockedThemes).toContain("natur");
    expect(result.unlockedThemes).not.toContain("ballons");
  });

  it("keeps theme order of THEME_LABELS", () => {
    const result = resolveEntitlements(
      [
        { feature: "theme:natur", quantity: 1 },
        { feature: "theme:ballons", quantity: 1 },
      ],
      0,
    );
    expect(result.unlockedThemes).toEqual(ALL_THEMES);
  });

  it("sums quantity over all event_slot rows", () => {
    const result = resolveEntitlements(
      [
        { feature: EVENT_SLOT_FEATURE, quantity: 1 },
        { feature: EVENT_SLOT_FEATURE, quantity: 2 },
      ],
      0,
    );
    expect(result.eventLimit).toBe(FREE_EVENT_LIMIT + 3);
  });

  it("ignores quantity on theme rows for the event limit", () => {
    const result = resolveEntitlements([{ feature: "theme:natur", quantity: 5 }], 0);
    expect(result.eventLimit).toBe(FREE_EVENT_LIMIT);
  });

  it("ignores unknown features", () => {
    const result = resolveEntitlements(
      [
        { feature: "theme:gibtsnicht", quantity: 1 },
        { feature: "something_else", quantity: 4 },
      ],
      2,
    );
    expect(result.unlockedThemes).toEqual(FREE_THEMES);
    expect(result.eventLimit).toBe(FREE_EVENT_LIMIT);
    expect(result.eventCount).toBe(2);
  });
});

describe("canUseTheme", () => {
  it("reflects unlockedThemes", () => {
    expect(canUseTheme({ unlockedThemes: ["weiss"] }, "weiss")).toBe(true);
    expect(canUseTheme({ unlockedThemes: ["weiss"] }, "natur")).toBe(false);
  });
});

describe("canCreateEvent", () => {
  it("allows creating while below the limit", () => {
    expect(canCreateEvent({ eventLimit: 1, eventCount: 0 })).toBe(true);
  });

  it("blocks at the limit", () => {
    expect(canCreateEvent({ eventLimit: 1, eventCount: 1 })).toBe(false);
  });

  it("blocks above the limit (grandfathered owners)", () => {
    expect(canCreateEvent({ eventLimit: 1, eventCount: 3 })).toBe(false);
  });
});

describe("isThemeSelectable", () => {
  it("unlocked theme is selectable", () => {
    expect(isThemeSelectable(["weiss"], "weiss")).toBe(true);
  });

  it("locked theme is not selectable", () => {
    expect(isThemeSelectable(["weiss"], "natur")).toBe(false);
  });

  it("the event's original (locked) theme stays selectable", () => {
    expect(isThemeSelectable(["weiss"], "natur", "natur")).toBe(true);
    expect(isThemeSelectable(["weiss"], "ballons", "natur")).toBe(false);
  });
});
