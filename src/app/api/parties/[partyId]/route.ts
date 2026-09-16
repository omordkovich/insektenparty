import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { parties } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { isUuid, validatePartyInput } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ partyId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { partyId } = await context.params;
    if (!isUuid(partyId)) {
      return NextResponse.json({ error: "Ungültige Party-ID." }, { status: 400 });
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

    const validation = validatePartyInput(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const db = getDb();
    const [updated] = await db
      .update(parties)
      .set({
        kicker: validation.data.kicker,
        title: validation.data.title,
        greeting: validation.data.greeting,
        dateLabel: validation.data.dateLabel,
        timeLabel: validation.data.timeLabel,
        locationLabel: validation.data.locationLabel,
        defaultArrivalTime: validation.data.defaultArrivalTime,
        eventDate: validation.data.eventDate,
        eventStartTime: validation.data.eventStartTime,
        eventEndTime: validation.data.eventEndTime,
        contactName: validation.data.contactName,
        contactPhone: validation.data.contactPhone,
        contactEmail: validation.data.contactEmail,
        updatedAt: new Date(),
      })
      .where(and(eq(parties.id, partyId), eq(parties.ownerId, userId)))
      .returning({ slug: parties.slug });

    if (!updated) {
      return NextResponse.json({ error: "Party wurde nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json({ slug: updated.slug });
  } catch (error) {
    console.error("PATCH /api/parties/[partyId] failed:", error);
    return NextResponse.json(
      { error: "Die Party konnte nicht gespeichert werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { partyId } = await context.params;
    if (!isUuid(partyId)) {
      return NextResponse.json({ error: "Ungültige Party-ID." }, { status: 400 });
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
      return NextResponse.json({ error: "Party wurde nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/parties/[partyId] failed:", error);
    return NextResponse.json(
      { error: "Die Party konnte nicht gelöscht werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
