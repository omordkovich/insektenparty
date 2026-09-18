import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { events } from "@/db/schema";
import { formatDateLabel, formatTimeLabel } from "@/lib/calendar";
import { createClient } from "@/lib/supabase/server";
import { THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";
import {
  isEventFieldKey,
  isUuid,
  validateEventDate,
  validateEventField,
  validateEventTime,
  type EventFieldKey,
} from "@/lib/validation";

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

// Partial update: the body may contain any subset of the known event fields
// plus an optional "theme" (in practice either one field from the inline
// EditableField save, or {theme, title} together from EventDialog's edit
// mode). Unknown keys are ignored.
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const updates: Partial<Record<EventFieldKey, string>> = {};
    let themeUpdate: ThemeKey | undefined;
    let eventDateUpdate: string | null | undefined;
    let eventStartTimeUpdate: string | null | undefined;
    let eventEndTimeUpdate: string | null | undefined;

    for (const [key, rawValue] of Object.entries(body as Record<string, unknown>)) {
      if (key === "theme") {
        if (typeof rawValue !== "string" || !THEME_KEYS.includes(rawValue as ThemeKey)) {
          return NextResponse.json({ error: "Ungültiges Theme." }, { status: 400 });
        }
        themeUpdate = rawValue as ThemeKey;
        continue;
      }
      if (key === "eventDate") {
        const validation = validateEventDate(rawValue);
        if (!validation.ok) {
          return NextResponse.json({ error: validation.error }, { status: 400 });
        }
        eventDateUpdate = validation.value;
        continue;
      }
      if (key === "eventStartTime" || key === "eventEndTime") {
        const validation = validateEventTime(rawValue);
        if (!validation.ok) {
          return NextResponse.json({ error: validation.error }, { status: 400 });
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
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      updates[key] = validation.value;
    }

    // Start/end time are edited together as one "Uhrzeit" field (see
    // EditableTimeRangeField) and the derived label below needs both, so a
    // request touching only one of them is rejected rather than guessed at.
    if (
      (eventStartTimeUpdate !== undefined) !== (eventEndTimeUpdate !== undefined)
    ) {
      return NextResponse.json(
        { error: "Start- und Endzeit müssen gemeinsam angegeben werden." },
        { status: 400 },
      );
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
      return NextResponse.json({ error: "Kein gültiges Feld angegeben." }, { status: 400 });
    }

    const db = getDb();
    const [updated] = await db
      .update(events)
      .set({
        ...updates,
        ...(themeUpdate ? { theme: themeUpdate } : {}),
        ...(eventDateUpdate !== undefined ? { eventDate: eventDateUpdate } : {}),
        ...(eventStartTimeUpdate !== undefined ? { eventStartTime: eventStartTimeUpdate } : {}),
        ...(eventEndTimeUpdate !== undefined ? { eventEndTime: eventEndTimeUpdate } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(events.id, eventId), eq(events.ownerId, userId)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Event wurde nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/events/[eventId] failed:", error);
    return NextResponse.json(
      { error: "Das Event konnte nicht gespeichert werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
    }

    const db = getDb();
    const [deleted] = await db
      .delete(events)
      .where(and(eq(events.id, eventId), eq(events.ownerId, userId)))
      .returning({ id: events.id });

    if (!deleted) {
      return NextResponse.json({ error: "Event wurde nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/events/[eventId] failed:", error);
    return NextResponse.json(
      { error: "Das Event konnte nicht gelöscht werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
