import { formatDateRangeLabel, formatTimeLabel } from "@/lib/calendar";
import { todayInBerlin } from "@/lib/date-poll";
import { buildSlug, generateSlug, slugKeyOf, slugNamePart } from "@/lib/slug";
import type { ThemeKey } from "@/lib/theme-presets";
import {
  isEventFieldKey,
  normalizeArrivalTime,
  validateAccessPassword,
  validateEventDate,
  validateEventField,
  validateEventSchedule,
  validateEventTime,
  validateNewEventTitle,
  validateTheme,
  type EventFieldKey,
  type EventSchedule,
} from "@/lib/validation";
import {
  createEvent,
  deleteEvent,
  getEventAddress,
  getEventSchedule,
  getEventTheme,
  updateEvent,
  type EventRow,
} from "@/repositories/event-repository";
import { applyDateModeChange, getEventDateMode } from "@/repositories/date-poll-repository";
import { getUserDisplayName } from "@/repositories/user-repository";
import { parseDateModeRequest } from "@/services/date-mode-service";
import { canCreateEvent, canUseTheme } from "@/lib/features";
import { getUserEntitlements } from "@/services/entitlement-service";

const EVENT_LIMIT_ERROR = "Du hast dein Event-Kontingent erreicht.";
const THEME_LOCKED_ERROR = "Dieses Design ist noch nicht freigeschaltet.";

// A taken address only happens on a (very unlikely) suffix collision, so a
// few fresh suffixes are plenty; more failures mean something else is wrong.
const SLUG_ATTEMPTS = 5;

// Postgres "unique_violation" - drizzle wraps the driver error in `cause`.
function isUniqueViolation(error: unknown): boolean {
  const codeOf = (value: unknown) =>
    typeof value === "object" && value !== null && "code" in value ? value.code : undefined;
  const cause = typeof error === "object" && error !== null && "cause" in error ? error.cause : undefined;
  return codeOf(error) === "23505" || codeOf(cause) === "23505";
}

export type EventServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export async function createEventForOwner(
  ownerId: string,
  input: { theme: unknown; title: unknown; accessPassword?: unknown; date?: unknown },
): Promise<EventServiceResult<{ slug: string }>> {
  const themeValidation = validateTheme(input.theme);
  if (!themeValidation.ok) {
    return { ok: false, status: 400, error: themeValidation.error };
  }
  const theme = themeValidation.value;

  const titleValidation = validateNewEventTitle(input.title);
  if (!titleValidation.ok) {
    return { ok: false, status: 400, error: titleValidation.error };
  }

  const passwordValidation = validateAccessPassword(input.accessPassword ?? null);
  if (!passwordValidation.ok) {
    return { ok: false, status: 400, error: passwordValidation.error };
  }

  // The event starts without a date; the chosen mode is applied right after
  // creating it (nothing can be lost on a brand-new event).
  const dateValidation = parseDateModeRequest(input.date, [], todayInBerlin());
  if (!dateValidation.ok) {
    return { ok: false, status: 400, error: dateValidation.error };
  }

  const entitlements = await getUserEntitlements(ownerId);
  if (!canCreateEvent(entitlements)) {
    return { ok: false, status: 403, error: EVENT_LIMIT_ERROR };
  }
  if (!canUseTheme(entitlements, theme)) {
    return { ok: false, status: 403, error: THEME_LOCKED_ERROR };
  }

  const ownerName = await getUserDisplayName(ownerId);
  let created: { id: string; slug: string } | null = null;
  for (let attempt = 1; created === null; attempt++) {
    try {
      const { slug, key, namePart } = generateSlug({ title: titleValidation.value, ownerName });
      created = await createEvent({
        ownerId,
        slug,
        slugKey: key,
        slugName: namePart,
        theme,
        title: titleValidation.value,
        accessPassword: passwordValidation.value,
        dateMode: "unknown",
      });
    } catch (error) {
      if (!isUniqueViolation(error) || attempt >= SLUG_ATTEMPTS) throw error;
    }
  }

  const { request, schedule } = dateValidation.value;
  if (request.mode !== "unknown") {
    await applyDateModeChange(created.id, ownerId, {
      mode: request.mode,
      schedule,
      plan: {
        clearGuests: false,
        clearPoll: false,
        newOptions: request.mode === "poll" && "proposals" in request ? request.proposals : [],
        transferOptionId: null,
        lostGuests: 0,
        lostVotes: 0,
      },
      transferGuests: [],
    });
  }
  return { ok: true, data: { slug: created.slug } };
}

export async function updateEventForOwner(
  id: string,
  ownerId: string,
  body: Record<string, unknown>,
): Promise<EventServiceResult<EventRow>> {
  const updates: Partial<Record<EventFieldKey, string>> = {};
  let themeUpdate: ThemeKey | undefined;
  // undefined = not part of this request; null = protection switched off.
  let passwordUpdate: string | null | undefined;
  // Only the date/time fields present in the request; merged with the
  // stored ones below so the rules between them can be checked.
  const scheduleChanges: Partial<EventSchedule> = {};

  for (const [key, rawValue] of Object.entries(body)) {
    if (key === "accessPassword") {
      const validation = validateAccessPassword(rawValue);
      if (!validation.ok) {
        return { ok: false, status: 400, error: validation.error };
      }
      passwordUpdate = validation.value;
      continue;
    }
    if (key === "theme") {
      const validation = validateTheme(rawValue);
      if (!validation.ok) {
        return { ok: false, status: 400, error: validation.error };
      }
      themeUpdate = validation.value;
      continue;
    }
    if (key === "eventDate" || key === "eventEndDate") {
      const validation = validateEventDate(rawValue);
      if (!validation.ok) {
        return { ok: false, status: 400, error: validation.error };
      }
      scheduleChanges[key] = validation.value;
      continue;
    }
    if (key === "eventStartTime" || key === "eventEndTime") {
      const validation = validateEventTime(rawValue);
      if (!validation.ok) {
        return { ok: false, status: 400, error: validation.error };
      }
      scheduleChanges[key] = validation.value;
      continue;
    }
    if (!isEventFieldKey(key)) continue;
    const validation = validateEventField(key, rawValue);
    if (!validation.ok) {
      return { ok: false, status: 400, error: validation.error };
    }
    updates[key] = validation.value;
  }

  // Date and time are checked as a whole ("bis" never before "von", an
  // earlier end time only on a later end date), so the stored values fill in
  // whatever this request doesn't change. Both labels are derived from the
  // resulting schedule.
  // While the date is open or being voted on, it is set in the dialog.
  if (Object.keys(scheduleChanges).length > 0 && (await getEventDateMode(id)) !== "fixed") {
    return { ok: false, status: 409, error: "Datum und Uhrzeit legst du in den Event-Einstellungen fest." };
  }

  let schedule: EventSchedule | undefined;
  if (Object.keys(scheduleChanges).length > 0) {
    const stored = await getEventSchedule(id, ownerId);
    if (!stored) {
      return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
    }
    const validation = validateEventSchedule({
      eventDate: stored.eventDate,
      eventEndDate: stored.eventEndDate,
      eventStartTime: stored.eventStartTime ? normalizeArrivalTime(stored.eventStartTime) : null,
      eventEndTime: stored.eventEndTime ? normalizeArrivalTime(stored.eventEndTime) : null,
      ...scheduleChanges,
    });
    if (!validation.ok) {
      return { ok: false, status: 400, error: validation.error };
    }
    schedule = validation.value;
    updates.dateLabel = formatDateRangeLabel(schedule.eventDate, schedule.eventEndDate);
    updates.timeLabel = formatTimeLabel(schedule.eventStartTime, schedule.eventEndTime);
  }

  const hasAnyUpdate =
    Object.keys(updates).length > 0 || themeUpdate !== undefined || passwordUpdate !== undefined;

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

  // A new title moves the address along - same key, so old links still find
  // the event and get redirected (see getEventByAddress), and the same name
  // part as at creation, so renaming the account never changes links.
  let addressUpdate: { slug: string; slugKey: string; slugName: string } | undefined;
  if (updates.title !== undefined) {
    const current = await getEventAddress(id, ownerId);
    if (!current) {
      return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
    }
    const key = current.slugKey ?? slugKeyOf(current.slug);
    // Events from before slug_name existed get the current name once.
    const namePart = current.slugName ?? slugNamePart(await getUserDisplayName(ownerId));
    addressUpdate = {
      slug: buildSlug({ namePart, title: updates.title, key }),
      slugKey: key,
      slugName: namePart,
    };
  }

  const updated = await updateEvent(id, ownerId, {
    ...updates,
    ...(addressUpdate ?? {}),
    ...(themeUpdate ? { theme: themeUpdate } : {}),
    ...(schedule ?? {}),
    ...(passwordUpdate !== undefined ? { accessPassword: passwordUpdate } : {}),
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
