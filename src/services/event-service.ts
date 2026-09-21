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
  updateEvent,
  type EventRow,
} from "@/repositories/event-repository";

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];

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
