import { NextResponse } from "next/server";
import { createEventForOwner } from "@/services/event-service";
import { createClient } from "@/lib/supabase/server";
import { hasAcceptedTerms } from "@/lib/terms-consent";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
    }

    // Accounts created via Google's login tab have no consent yet (the start
    // page asks for it); they must not be able to skip that dialog.
    if (!hasAcceptedTerms(data.claims.user_metadata)) {
      return NextResponse.json(
        { error: "Bitte bestätige zuerst die AGB und dein Alter." },
        { status: 403 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const result = await createEventForOwner(userId, {
      theme: (body as { theme?: unknown })?.theme,
      title: (body as { title?: unknown })?.title,
      accessPassword: (body as { accessPassword?: unknown })?.accessPassword,
      date: (body as { date?: unknown })?.date,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("POST /api/events failed:", error);
    return NextResponse.json(
      { error: "Das Event konnte nicht erstellt werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
