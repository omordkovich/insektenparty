import { NextResponse } from "next/server";
import { isUuid } from "@/lib/validation";
import { requestEventPassword } from "@/services/password-request-service";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

// Locked event page: "Passwort anfragen" - mails the request to the owner.
export async function POST(request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const result = await requestEventPassword(eventId, body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("POST /api/events/[eventId]/password-request failed:", error);
    return NextResponse.json(
      { error: "Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
