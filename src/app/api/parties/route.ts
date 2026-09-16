import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { parties } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/slug";
import { THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";
import { validatePartyField } from "@/lib/validation";

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];

export async function POST(request: Request) {
  try {
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

    const theme = (body as { theme?: unknown })?.theme;
    if (typeof theme !== "string" || !THEME_KEYS.includes(theme as ThemeKey)) {
      return NextResponse.json({ error: "Ungültiges Theme." }, { status: 400 });
    }

    const rawTitle = (body as { title?: unknown })?.title;
    const titleValidation = validatePartyField("title", rawTitle);
    if (!titleValidation.ok) {
      return NextResponse.json({ error: titleValidation.error }, { status: 400 });
    }
    if (!titleValidation.value) {
      return NextResponse.json(
        { error: "Bitte gib einen Namen für dein Event ein." },
        { status: 400 },
      );
    }

    // Every other field starts empty - the owner fills them in via the
    // inline-editable fields on the event page (placeholders guide them
    // there); only name and theme are picked up front.
    const slug = generateSlug(titleValidation.value);

    const db = getDb();
    const [created] = await db
      .insert(parties)
      .values({
        ownerId: userId,
        slug,
        theme,
        kicker: "",
        title: titleValidation.value,
        greeting: "",
        dateLabel: "",
        timeLabel: "",
        locationLabel: "",
        defaultArrivalTime: "",
        eventDate: null,
        eventStartTime: null,
        eventEndTime: null,
        contactName: "",
        contactPhone: "",
        contactEmail: "",
      })
      .returning({ slug: parties.slug });

    return NextResponse.json({ slug: created.slug }, { status: 201 });
  } catch (error) {
    console.error("POST /api/parties failed:", error);
    return NextResponse.json(
      { error: "Das Event konnte nicht erstellt werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
