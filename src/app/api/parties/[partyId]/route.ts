import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { parties } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";
import {
  isPartyFieldKey,
  isUuid,
  validatePartyField,
  type PartyFieldKey,
} from "@/lib/validation";

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];

type RouteContext = {
  params: Promise<{ partyId: string }>;
};

// Partial update: the body may contain any subset of the known party fields
// plus an optional "theme" (in practice either one field from the inline
// EditableField save, or {theme, title} together from EventDialog's edit
// mode). Unknown keys are ignored.
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { partyId } = await context.params;
    if (!isUuid(partyId)) {
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

    const updates: Partial<Record<PartyFieldKey, string>> = {};
    let themeUpdate: ThemeKey | undefined;
    for (const [key, rawValue] of Object.entries(body as Record<string, unknown>)) {
      if (key === "theme") {
        if (typeof rawValue !== "string" || !THEME_KEYS.includes(rawValue as ThemeKey)) {
          return NextResponse.json({ error: "Ungültiges Theme." }, { status: 400 });
        }
        themeUpdate = rawValue as ThemeKey;
        continue;
      }
      if (!isPartyFieldKey(key)) continue;
      const validation = validatePartyField(key, rawValue);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      updates[key] = validation.value;
    }

    if (Object.keys(updates).length === 0 && !themeUpdate) {
      return NextResponse.json({ error: "Kein gültiges Feld angegeben." }, { status: 400 });
    }

    const db = getDb();
    const [updated] = await db
      .update(parties)
      .set({
        ...updates,
        ...(themeUpdate ? { theme: themeUpdate } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(parties.id, partyId), eq(parties.ownerId, userId)))
      .returning({ slug: parties.slug, title: parties.title, theme: parties.theme });

    if (!updated) {
      return NextResponse.json({ error: "Event wurde nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/parties/[partyId] failed:", error);
    return NextResponse.json(
      { error: "Das Event konnte nicht gespeichert werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { partyId } = await context.params;
    if (!isUuid(partyId)) {
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
      .delete(parties)
      .where(and(eq(parties.id, partyId), eq(parties.ownerId, userId)))
      .returning({ id: parties.id });

    if (!deleted) {
      return NextResponse.json({ error: "Event wurde nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/parties/[partyId] failed:", error);
    return NextResponse.json(
      { error: "Das Event konnte nicht gelöscht werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
