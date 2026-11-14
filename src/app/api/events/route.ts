import { apiErrors } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
import { NextResponse } from "next/server";
import { createEventForOwner } from "@/services/event-service";
import { createClient } from "@/lib/supabase/server";
import { consentRequiredError } from "@/lib/terms-consent";

export async function POST(request: Request) {
  const fail = apiErrors();
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return fail(err("signInRequired"), 401);
    }

    // Accounts created via Google's login tab have no consent yet, older
    // accounts may still have to agree to changed AGB (the start page asks
    // for both); they must not be able to skip that dialog.
    const consentError = consentRequiredError(data.claims.user_metadata);
    if (consentError) {
      return fail(consentError, 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(err("invalidRequest"), 400);
    }

    const result = await createEventForOwner(userId, {
      theme: (body as { theme?: unknown })?.theme,
      title: (body as { title?: unknown })?.title,
      accessPassword: (body as { accessPassword?: unknown })?.accessPassword,
      date: (body as { date?: unknown })?.date,
      paid: (body as { paid?: unknown })?.paid,
      language: (body as { language?: unknown })?.language,
    });

    if (!result.ok) {
      return fail(result.error, result.status);
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("POST /api/events failed:", error);
    return fail(err("eventCreateFailed"), 500);
  }
}
