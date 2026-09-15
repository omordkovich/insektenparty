import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { parties } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/slug";
import { THEME_PRESETS, type ThemeKey } from "@/lib/theme-presets";

const THEME_KEYS = Object.keys(THEME_PRESETS) as ThemeKey[];

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

    const preset = THEME_PRESETS[theme as ThemeKey];
    const slug = generateSlug(preset.title);

    const db = getDb();
    const [created] = await db
      .insert(parties)
      .values({
        ownerId: userId,
        slug,
        theme,
        kicker: preset.kicker,
        title: preset.title,
        greeting: preset.greeting,
        dateLabel: preset.dateLabel,
        timeLabel: preset.timeLabel,
        locationLabel: preset.locationLabel,
        defaultArrivalTime: preset.defaultArrivalTime,
        eventDate: preset.eventDate,
        eventStartTime: preset.eventStartTime,
        eventEndTime: preset.eventEndTime,
        contactName: preset.contact.name,
        contactPhone: preset.contact.phone,
        contactEmail: preset.contact.email,
      })
      .returning({ slug: parties.slug });

    return NextResponse.json({ slug: created.slug }, { status: 201 });
  } catch (error) {
    console.error("POST /api/parties failed:", error);
    return NextResponse.json(
      { error: "Die Party konnte nicht erstellt werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
