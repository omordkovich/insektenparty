import type { Locale } from "@/i18n/config";
import { canCreateEvent, type UserEntitlements } from "@/lib/features";
import { localizedPath } from "@/lib/page-metadata";
import { THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";

// "Mit diesem Design starten" on a design page: the start page opens the
// create dialog with that design (and, for the whole-event card, as a paid
// event). The wish travels in the URL (?design=<key>&event=paid) and in
// localStorage, because a login in between (Google, e-mail confirmation)
// lands on the start page without the URL parameters.

export type StartIntent = { theme: ThemeKey; paid: boolean };

const STORAGE_KEY = "gastzilla:start-intent";
// Long enough for a sign-up with e-mail confirmation, short enough that an
// old click does not open a dialog days later.
const MAX_AGE_MS = 60 * 60_000;

function isThemeKey(value: unknown): value is ThemeKey {
  return typeof value === "string" && Object.hasOwn(THEME_LABELS, value);
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseStartIntent(params: { design?: string | string[]; event?: string | string[] }): StartIntent | null {
  const theme = first(params.design);
  if (!isThemeKey(theme)) return null;
  return { theme, paid: first(params.event) === "paid" };
}

export function startHref(intent: StartIntent, locale: Locale): string {
  return `${localizedPath("/", locale)}?design=${intent.theme}${intent.paid ? "&event=paid" : ""}`;
}

export function saveStartIntent(intent: StartIntent, now = Date.now()): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...intent, savedAt: now }));
  } catch {
    // No storage (private mode, blocked): the URL parameters still work.
  }
}

export function readStartIntent(now = Date.now()): StartIntent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as { theme?: unknown; paid?: unknown; savedAt?: unknown };
    if (!isThemeKey(stored.theme) || typeof stored.savedAt !== "number") return null;
    if (now - stored.savedAt > MAX_AGE_MS) return null;
    return { theme: stored.theme, paid: stored.paid === true };
  } catch {
    return null;
  }
}

export function clearStartIntent(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

// What the start page opens for the wish: the create dialog, or first the
// "Event freischalten" dialog when the event cannot be created as asked
// (no event left, or a paid event without a credit).
export function startView(
  intent: StartIntent,
  entitlements: Pick<UserEntitlements, "freeEventAvailable" | "eventCredits">,
  creditBought: boolean,
): "create" | "unlock-credit" {
  if (creditBought) return "create";
  if (intent.paid) return entitlements.eventCredits > 0 ? "create" : "unlock-credit";
  return canCreateEvent(entitlements) ? "create" : "unlock-credit";
}
