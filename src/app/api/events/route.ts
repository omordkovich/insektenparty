import { NextResponse } from "next/server";
import { createEventForOwner } from "@/services/event-service";
import { createClient } from "@/lib/supabase/server";

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

    const result = await createEventForOwner(userId, {
      theme: (body as { theme?: unknown })?.theme,
      title: (body as { title?: unknown })?.title,
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
