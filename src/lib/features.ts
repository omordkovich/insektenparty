import type { EventPlan } from "@/lib/event-plan";
import { PREMIUM_THEMES, THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";

// Pure entitlement rules, shared by the server (event-service) and the
// client (EventList/EventDialog). The server is the source of truth; the
// client only mirrors these rules to disable locked options.

// Ledger features: one `free_event` row marks the free event as used (it
// survives deleting the event); each `paid_event` row is one credit, used up
// once `consumedAt` is set.
export const PAID_EVENT_FEATURE = "paid_event";
export const FREE_EVENT_FEATURE = "free_event";
// One row per event whose "made with GASTZILLA" badge is removed.
export const NO_BADGE_FEATURE = "no_badge";

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];

export function themeFeatureKey(theme: ThemeKey): string {
  return `theme:${theme}`;
}

export type EntitlementRow = { feature: string; quantity: number; consumedAt: Date | null };

export type UserEntitlements = {
  unlockedThemes: ThemeKey[];
  freeEventAvailable: boolean;
  eventCredits: number;
};

export function resolveEntitlements(rows: EntitlementRow[]): UserEntitlements {
  const features = new Set(rows.map((row) => row.feature));

  const unlockedThemes = THEME_KEYS.filter(
    (theme) => !PREMIUM_THEMES.includes(theme) || features.has(themeFeatureKey(theme)),
  );

  const freeEventAvailable = !features.has(FREE_EVENT_FEATURE);
  const eventCredits = rows.filter(
    (row) => row.feature === PAID_EVENT_FEATURE && row.consumedAt === null,
  ).length;

  return { unlockedThemes, freeEventAvailable, eventCredits };
}

// The plan the next event gets: a requested paid event needs a credit;
// otherwise the free event goes first, then a credit. null = nothing left.
export function nextEventPlan(
  entitlements: Pick<UserEntitlements, "freeEventAvailable" | "eventCredits">,
  wantPaid: boolean,
): EventPlan | null {
  if (wantPaid) return entitlements.eventCredits > 0 ? "paid" : null;
  if (entitlements.freeEventAvailable) return "free";
  return entitlements.eventCredits > 0 ? "paid" : null;
}

// A paid event can use every theme; a free one only the themes the user owns.
export function unlockedThemesFor(
  entitlements: Pick<UserEntitlements, "unlockedThemes">,
  plan: EventPlan,
): ThemeKey[] {
  return plan === "paid" ? THEME_KEYS : entitlements.unlockedThemes;
}

export function canUseTheme(
  entitlements: Pick<UserEntitlements, "unlockedThemes">,
  theme: ThemeKey,
): boolean {
  return entitlements.unlockedThemes.includes(theme);
}

export function canCreateEvent(
  entitlements: Pick<UserEntitlements, "freeEventAvailable" | "eventCredits">,
): boolean {
  return entitlements.freeEventAvailable || entitlements.eventCredits > 0;
}

// In edit mode the event's current theme stays selectable even when locked
// (grandfathered) - the server only checks a theme that actually changes.
export function isThemeSelectable(
  unlockedThemes: readonly ThemeKey[],
  theme: ThemeKey,
  originalTheme?: ThemeKey,
): boolean {
  return theme === originalTheme || unlockedThemes.includes(theme);
}
