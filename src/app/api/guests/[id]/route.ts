import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { guests } from "@/db/schema";
import {
  isUuid,
  normalizeArrivalTime,
  validateGuestInput,
} from "@/lib/validation";
import type { GuestDto } from "@/lib/types";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Ungültige Gast-ID." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Ungültige Anfragedaten." },
        { status: 400 },
      );
    }

    const validation = validateGuestInput(body);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const db = getDb();
    const [updated] = await db
      .update(guests)
      .set({
        name: validation.data.name,
        additionalGuests: validation.data.additionalGuests,
        arrivalTime: validation.data.arrivalTime,
        updatedAt: new Date(),
      })
      .where(eq(guests.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Gast wurde nicht gefunden." },
        { status: 404 },
      );
    }

    return NextResponse.json(toGuestDto(updated));
  } catch (error) {
    console.error("PATCH /api/guests/[id] failed:", error);
    return NextResponse.json(
      {
        error:
          "Der Gast konnte nicht gespeichert werden. Bitte versuche es erneut.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Ungültige Gast-ID." }, { status: 400 });
    }

    const db = getDb();
    const [deleted] = await db
      .delete(guests)
      .where(eq(guests.id, id))
      .returning({ id: guests.id });

    if (!deleted) {
      return NextResponse.json(
        { error: "Gast wurde nicht gefunden." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/guests/[id] failed:", error);
    return NextResponse.json(
      {
        error:
          "Der Gast konnte nicht gelöscht werden. Bitte versuche es erneut.",
      },
      { status: 500 },
    );
  }
}
