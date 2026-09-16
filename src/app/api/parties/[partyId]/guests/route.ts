import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { guests, parties } from "@/db/schema";
import { getRecaptchaToken, verifyRecaptchaToken } from "@/lib/recaptcha";
import { isUuid, normalizeArrivalTime, validateGuestInput } from "@/lib/validation";
import type { GuestDto } from "@/lib/types";

type RouteContext = {
  params: Promise<{ partyId: string }>;
};

function toGuestDto(row: typeof guests.$inferSelect): GuestDto {
  return {
    id: row.id,
    name: row.name,
    additionalGuests: row.additionalGuests,
    additionalGuestNames: row.additionalGuestNames,
    arrivalTime: normalizeArrivalTime(String(row.arrivalTime)),
    bringingSomething: row.bringingSomething,
    bringingDescription: row.bringingDescription,
    hasMessage: row.hasMessage,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { partyId } = await context.params;
    if (!isUuid(partyId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    const db = getDb();
    const rows = await db
      .select()
      .from(guests)
      .where(eq(guests.partyId, partyId))
      .orderBy(asc(guests.arrivalTime), asc(guests.name));

    return NextResponse.json(rows.map(toGuestDto));
  } catch (error) {
    console.error("GET /api/parties/[partyId]/guests failed:", error);
    return NextResponse.json(
      { error: "Die Gästeliste konnte nicht geladen werden." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { partyId } = await context.params;
    if (!isUuid(partyId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const recaptcha = await verifyRecaptchaToken(getRecaptchaToken(body));
    if (!recaptcha.ok) {
      return NextResponse.json({ error: recaptcha.error }, { status: recaptcha.status });
    }

    const validation = validateGuestInput(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const db = getDb();

    const [party] = await db
      .select({ id: parties.id })
      .from(parties)
      .where(eq(parties.id, partyId));
    if (!party) {
      return NextResponse.json({ error: "Event wurde nicht gefunden." }, { status: 404 });
    }

    const [created] = await db
      .insert(guests)
      .values({
        partyId,
        name: validation.data.name,
        additionalGuests: validation.data.additionalGuests,
        additionalGuestNames: validation.data.additionalGuestNames,
        arrivalTime: validation.data.arrivalTime,
        bringingSomething: validation.data.bringingSomething,
        bringingDescription: validation.data.bringingDescription,
        hasMessage: validation.data.hasMessage,
        message: validation.data.message,
      })
      .returning();

    return NextResponse.json(toGuestDto(created), { status: 201 });
  } catch (error) {
    console.error("POST /api/parties/[partyId]/guests failed:", error);
    return NextResponse.json(
      {
        error: "Der Gast konnte nicht gespeichert werden. Bitte versuche es erneut.",
      },
      { status: 500 },
    );
  }
}
