import { NextResponse } from "next/server";
import { purchase } from "@/services/purchase-service";
import { createClient } from "@/lib/supabase/server";
import { consentRequiredError } from "@/lib/terms-consent";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
    }

    const consentError = consentRequiredError(data.claims.user_metadata);
    if (consentError) {
      return NextResponse.json({ error: consentError }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const result = await purchase(userId, body);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("POST /api/purchases failed:", error);
    return NextResponse.json(
      { error: "Der Kauf konnte nicht abgeschlossen werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
