import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { guests } from "@/db/schema";
import { getRecaptchaToken, verifyRecaptchaToken } from "@/lib/recaptcha";
import { normalizeArrivalTime, validateGuestInput } from "@/lib/validation";
import type { GuestDto } from "@/lib/types";

function toGuestDto(row: typeof guests.$inferSelect): GuestDto {
  return {
    id: row.id,
    name: row.name,
    additionalGuests: row.additionalGuests,
    arrivalTime: normalizeArrivalTime(String(row.arrivalTime)),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(guests)
      .orderBy(asc(guests.arrivalTime), asc(guests.name));

    return NextResponse.json(rows.map(toGuestDto));
  } catch (error) {
    console.error("GET /api/guests failed:", error);
    return NextResponse.json(
      { error: "Die Gästeliste konnte nicht geladen werden." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Ungültige Anfragedaten." },
        { status: 400 },
      );
    }

    const recaptcha = await verifyRecaptchaToken(getRecaptchaToken(body));
    if (!recaptcha.ok) {
      return NextResponse.json(
        { error: recaptcha.error },
        { status: recaptcha.status },
      );
    }

    const validation = validateGuestInput(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const db = getDb();
    const [created] = await db
      .insert(guests)
      .values({
        name: validation.data.name,
        additionalGuests: validation.data.additionalGuests,
        arrivalTime: validation.data.arrivalTime,
      })
      .returning();

    return NextResponse.json(toGuestDto(created), { status: 201 });
  } catch (error) {
    console.error("POST /api/guests failed:", error);
    return NextResponse.json(
      {
        error:
          "Der Gast konnte nicht gespeichert werden. Bitte versuche es erneut.",
      },
      { status: 500 },
    );
  }
}
