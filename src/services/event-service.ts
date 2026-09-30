import { formatDateLabel, formatTimeLabel } from "@/lib/calendar";
import { generateSlug } from "@/lib/slug";
import { THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";
import {
  isEventFieldKey,
  validateEventDate,
  validateEventField,
  validateEventTime,
  type EventFieldKey,
} from "@/lib/validation";
import {
  createEvent,
  deleteEvent,
  getEventTheme,
  updateEvent,
  type EventRow,
} from "@/repositories/event-repository";
import { canCreateEvent, canUseTheme } from "@/lib/features";
import { getUserEntitlements } from "@/services/entitlement-service";

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];
const EVENT_LIMIT_ERROR = "Du hast dein Event-Kontingent erreicht.";
const THEME_LOCKED_ERROR = "Dieses Design ist noch nicht freigeschaltet.";

export type EventServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export async function createEventForOwner(
  ownerId: string,
  input: { theme: unknown; title: unknown },
): Promise<EventServiceResult<{ slug: string }>> {
  const { theme, title } = input;

  if (typeof theme !== "string" || !THEME_KEYS.includes(theme as ThemeKey)) {
    return { ok: false, status: 400, error: "Ungültiges Theme." };
  }

  const titleValidation = validateEventField("title", title);
  if (!titleValidation.ok) {
    return { ok: false, status: 400, error: titleValidation.error };
  }
  if (!titleValidation.value) {
    return {
      ok: false,
      status: 400,
      error: "Bitte gib einen Namen für dein Event ein.",
    };
  }

  const entitlements = await getUserEntitlements(ownerId);
  if (!canCreateEvent(entitlements)) {
    return { ok: false, status: 403, error: EVENT_LIMIT_ERROR };
  }
  if (!canUseTheme(entitlements, theme as ThemeKey)) {
    return { ok: false, status: 403, error: THEME_LOCKED_ERROR };
  }

  const slug = generateSlug(titleValidation.value);
  const created = await createEvent({
    ownerId,
    slug,
    theme,
    title: titleValidation.value,
  });

  return { ok: true, data: { slug: created.slug } };
}

export async function updateEventForOwner(
  id: string,
  ownerId: string,
  body: Record<string, unknown>,
): Promise<EventServiceResult<EventRow>> {
  const updates: Partial<Record<EventFieldKey, string>> = {};
  let themeUpdate: ThemeKey | undefined;
  let eventDateUpdate: string | null | undefined;
  let eventStartTimeUpdate: string | null | undefined;
  let eventEndTimeUpdate: string | null | undefined;

  for (const [key, rawValue] of Object.entries(body)) {
    if (key === "theme") {
      if (typeof rawValue !== "string" || !THEME_KEYS.includes(rawValue as ThemeKey)) {
        return { ok: false, status: 400, error: "Ungültiges Theme." };
      }
      themeUpdate = rawValue as ThemeKey;
      continue;
    }
    if (key === "eventDate") {
      const validation = validateEventDate(rawValue);
      if (!validation.ok) {
        return { ok: false, status: 400, error: validation.error };
      }
      eventDateUpdate = validation.value;
      continue;
    }
    if (key === "eventStartTime" || key === "eventEndTime") {
      const validation = validateEventTime(rawValue);
      if (!validation.ok) {
        return { ok: false, status: 400, error: validation.error };
      }
      if (key === "eventStartTime") {
        eventStartTimeUpdate = validation.value;
      } else {
        eventEndTimeUpdate = validation.value;
      }
      continue;
    }
    if (!isEventFieldKey(key)) continue;
    const validation = validateEventField(key, rawValue);
    if (!validation.ok) {
      return { ok: false, status: 400, error: validation.error };
    }
    updates[key] = validation.value;
  }

  // Start/end time are edited together as one "Uhrzeit" field (see
  // EditableTimeRangeField) and the derived label below needs both, so a
  // request touching only one of them is rejected rather than guessed at.
  if ((eventStartTimeUpdate !== undefined) !== (eventEndTimeUpdate !== undefined)) {
    return {
      ok: false,
      status: 400,
      error: "Start- und Endzeit müssen gemeinsam angegeben werden.",
    };
  }

  if (eventDateUpdate !== undefined) {
    updates.dateLabel = formatDateLabel(eventDateUpdate);
  }
  if (eventStartTimeUpdate !== undefined) {
    updates.timeLabel = formatTimeLabel(eventStartTimeUpdate, eventEndTimeUpdate ?? null);
  }

  const hasAnyUpdate =
    Object.keys(updates).length > 0 ||
    themeUpdate !== undefined ||
    eventDateUpdate !== undefined ||
    eventStartTimeUpdate !== undefined;

  if (!hasAnyUpdate) {
    return { ok: false, status: 400, error: "Kein gültiges Feld angegeben." };
  }

  // Only a theme that actually changes is checked, so grandfathered events
  // keep their (now premium) theme even if a client re-sends it unchanged.
  if (themeUpdate !== undefined) {
    const currentTheme = await getEventTheme(id, ownerId);
    if (currentTheme === undefined) {
      return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
    }
    if (themeUpdate !== currentTheme) {
      const entitlements = await getUserEntitlements(ownerId);
      if (!canUseTheme(entitlements, themeUpdate)) {
        return { ok: false, status: 403, error: THEME_LOCKED_ERROR };
      }
    }
  }

  const updated = await updateEvent(id, ownerId, {
    ...updates,
    ...(themeUpdate ? { theme: themeUpdate } : {}),
    ...(eventDateUpdate !== undefined ? { eventDate: eventDateUpdate } : {}),
    ...(eventStartTimeUpdate !== undefined ? { eventStartTime: eventStartTimeUpdate } : {}),
    ...(eventEndTimeUpdate !== undefined ? { eventEndTime: eventEndTimeUpdate } : {}),
  });

  if (!updated) {
    return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
  }

  return { ok: true, data: updated };
}

export async function deleteEventForOwner(
  id: string,
  ownerId: string,
): Promise<EventServiceResult<{ ok: true }>> {
  const deleted = await deleteEvent(id, ownerId);
  if (!deleted) {
    return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
  }
  return { ok: true, data: { ok: true } };
}
