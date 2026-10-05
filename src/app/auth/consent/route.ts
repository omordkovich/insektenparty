import { NextResponse } from "next/server";
import { DISPLAY_NAME_KEY, getAccountName } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { consentMetadata, hasAcceptedTerms } from "@/lib/terms-consent";
import { validatePersonName } from "@/lib/validation";

// Completes the registration of the signed-in user: AGB/privacy/age consent
// and, if the account has none yet, the display name. Used by the
// ConsentDialog for accounts created through Google's login tab, which skips
// the form. Timestamp and versions are set here, not by the client.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  }

  const update: Record<string, unknown> = {};
  if (!hasAcceptedTerms(claims.user_metadata)) Object.assign(update, consentMetadata());

  if (!getAccountName(claims.user_metadata)) {
    const body = (await request.json().catch(() => null)) as { displayName?: unknown } | null;
    const name = validatePersonName(body?.displayName);
    if (!name.ok) {
      return NextResponse.json({ error: name.error }, { status: 400 });
    }
    update[DISPLAY_NAME_KEY] = name.value;
  }

  if (Object.keys(update).length > 0) {
    const { error } = await supabase.auth.updateUser({ data: update });
    if (error) {
      return NextResponse.json(
        { error: "Die Angaben konnten nicht gespeichert werden. Bitte versuche es erneut." },
        { status: 500 },
      );
    }
    // Make the new metadata visible in the session's JWT right away.
    await supabase.auth.refreshSession();
  }

  return NextResponse.json({ ok: true });
}
