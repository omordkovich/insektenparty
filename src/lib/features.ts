import { PREMIUM_THEMES, THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";

// Pure entitlement rules, shared by the server (event-service) and the
// client (EventList/EventDialog). The server is the source of truth; the
// client only mirrors these rules to disable locked options.

export const FREE_EVENT_LIMIT = 1;
export const EVENT_SLOT_FEATURE = "event_slot";

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];

export function themeFeatureKey(theme: ThemeKey): string {
  return `theme:${theme}`;
}

export type EntitlementRow = { feature: string; quantity: number };

export type UserEntitlements = {
  unlockedThemes: ThemeKey[];
  eventLimit: number;
  eventCount: number;
};

export function resolveEntitlements(
  rows: EntitlementRow[],
  eventCount: number,
): UserEntitlements {
  const features = new Set(rows.map((row) => row.feature));

  const unlockedThemes = THEME_KEYS.filter(
    (theme) => !PREMIUM_THEMES.includes(theme) || features.has(themeFeatureKey(theme)),
  );

  const extraSlots = rows
    .filter((row) => row.feature === EVENT_SLOT_FEATURE)
    .reduce((sum, row) => sum + row.quantity, 0);

  return { unlockedThemes, eventLimit: FREE_EVENT_LIMIT + extraSlots, eventCount };
}

export function canUseTheme(
  entitlements: Pick<UserEntitlements, "unlockedThemes">,
  theme: ThemeKey,
): boolean {
  return entitlements.unlockedThemes.includes(theme);
}

export function canCreateEvent(
  entitlements: Pick<UserEntitlements, "eventLimit" | "eventCount">,
): boolean {
  return entitlements.eventCount < entitlements.eventLimit;
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
