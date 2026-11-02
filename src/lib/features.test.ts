import { describe, expect, it } from "vitest";
import {
  canCreateEvent,
  canUseTheme,
  FREE_EVENT_FEATURE,
  isThemeSelectable,
  nextEventPlan,
  PAID_EVENT_FEATURE,
  resolveEntitlements,
  themeFeatureKey,
  unlockedThemesFor,
} from "@/lib/features";
import { formatPrice, PRODUCTS } from "@/lib/products";
import { PREMIUM_THEMES, THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";

const ALL_THEMES = Object.keys(THEME_LABELS) as ThemeKey[];
const FREE_THEMES = ALL_THEMES.filter((t) => !PREMIUM_THEMES.includes(t));

const row = (feature: string, consumedAt: Date | null = null, quantity = 1) => ({
  feature,
  quantity,
  consumedAt,
});

describe("themeFeatureKey", () => {
  it("prefixes the theme key", () => {
    expect(themeFeatureKey("natur")).toBe("theme:natur");
  });
});

describe("feature constants", () => {
  it("names the ledger features", () => {
    expect(PAID_EVENT_FEATURE).toBe("paid_event");
    expect(FREE_EVENT_FEATURE).toBe("free_event");
  });
});

describe("resolveEntitlements", () => {
  it("without rows: free event available, no credits, only non-premium themes", () => {
    const result = resolveEntitlements([]);
    expect(result.freeEventAvailable).toBe(true);
    expect(result.eventCredits).toBe(0);
    expect(result.unlockedThemes).toEqual(FREE_THEMES);
    expect(result.unlockedThemes).not.toContain("natur");
    expect(result.unlockedThemes).not.toContain("ballons");
  });

  it("free event is gone once a free_event row exists (consumed or not)", () => {
    expect(resolveEntitlements([row(FREE_EVENT_FEATURE, new Date())]).freeEventAvailable).toBe(false);
    expect(resolveEntitlements([row(FREE_EVENT_FEATURE)]).freeEventAvailable).toBe(false);
  });

  it("counts only unconsumed paid_event rows as credits", () => {
    const result = resolveEntitlements([
      row(PAID_EVENT_FEATURE),
      row(PAID_EVENT_FEATURE),
      row(PAID_EVENT_FEATURE, new Date()),
    ]);
    expect(result.eventCredits).toBe(2);
  });

  it("unlocks a premium theme only when its row exists", () => {
    const result = resolveEntitlements([row("theme:natur")]);
    expect(result.unlockedThemes).toContain("natur");
    expect(result.unlockedThemes).not.toContain("ballons");
  });

  it("keeps theme order of THEME_LABELS", () => {
    const result = resolveEntitlements([row("theme:natur"), row("theme:ballons")]);
    expect(result.unlockedThemes).toEqual(ALL_THEMES);
  });

  it("ignores unknown features and theme quantity", () => {
    const result = resolveEntitlements([
      row("theme:gibtsnicht"),
      row("something_else", null, 4),
      row("event_slot"),
    ]);
    expect(result.unlockedThemes).toEqual(FREE_THEMES);
    expect(result.freeEventAvailable).toBe(true);
    expect(result.eventCredits).toBe(0);
  });
});

describe("canUseTheme", () => {
  it("reflects unlockedThemes", () => {
    expect(canUseTheme({ unlockedThemes: ["weiss"] }, "weiss")).toBe(true);
    expect(canUseTheme({ unlockedThemes: ["weiss"] }, "natur")).toBe(false);
  });
});

describe("canCreateEvent", () => {
  it("allows creating with the free event", () => {
    expect(canCreateEvent({ freeEventAvailable: true, eventCredits: 0 })).toBe(true);
  });

  it("allows creating with a credit only", () => {
    expect(canCreateEvent({ freeEventAvailable: false, eventCredits: 1 })).toBe(true);
  });

  it("blocks with neither free event nor credit", () => {
    expect(canCreateEvent({ freeEventAvailable: false, eventCredits: 0 })).toBe(false);
  });
});

describe("nextEventPlan", () => {
  const e = (freeEventAvailable: boolean, eventCredits: number) => ({
    freeEventAvailable,
    eventCredits,
  });

  it("free first when both are available and paid is not requested", () => {
    expect(nextEventPlan(e(true, 2), false)).toBe("free");
  });

  it("paid when requested and a credit exists", () => {
    expect(nextEventPlan(e(true, 1), true)).toBe("paid");
    expect(nextEventPlan(e(false, 1), true)).toBe("paid");
  });

  it("paid requested without credit: null even if free is available", () => {
    expect(nextEventPlan(e(true, 0), true)).toBeNull();
  });

  it("falls back to a credit when the free event is used", () => {
    expect(nextEventPlan(e(false, 1), false)).toBe("paid");
  });

  it("free only", () => {
    expect(nextEventPlan(e(true, 0), false)).toBe("free");
  });

  it("null when nothing is left", () => {
    expect(nextEventPlan(e(false, 0), false)).toBeNull();
  });
});

describe("unlockedThemesFor", () => {
  it("paid unlocks every theme without any row", () => {
    const entitlements = resolveEntitlements([]);
    const themes = unlockedThemesFor(entitlements, "paid");
    expect(themes).toContain("natur");
    expect(themes).toContain("ballons");
    expect(themes).toEqual(ALL_THEMES);
  });

  it("free keeps only the owned themes", () => {
    const entitlements = resolveEntitlements([]);
    const themes = unlockedThemesFor(entitlements, "free");
    expect(themes).not.toContain("natur");
    expect(themes).not.toContain("ballons");
    expect(themes).toEqual(FREE_THEMES);
    expect(unlockedThemesFor(resolveEntitlements([row("theme:natur")]), "free")).toContain("natur");
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

describe("products", () => {
  it("formats cents as German euro price", () => {
    expect(formatPrice(299)).toBe("2,99 €");
    expect(formatPrice(99)).toBe("0,99 €");
    expect(formatPrice(500)).toBe("5,00 €");
  });

  it("lists the catalog prices", () => {
    expect(PRODUCTS.paid_event).toEqual({ label: "Event freischalten", priceCents: 299 });
    expect(PRODUCTS.theme).toEqual({ label: "Design freischalten", priceCents: 99 });
    expect(PRODUCTS.no_badge).toEqual({ label: "Ohne GASTZILLA-Hinweis", priceCents: 99 });
  });
});
