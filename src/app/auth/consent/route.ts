import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consentMetadata, hasAcceptedTerms } from "@/lib/terms-consent";

// Records AGB/privacy/age consent for the signed-in user. Used by the
// ConsentDialog for accounts created through Google's login tab, which skips
// the checkboxes. Timestamp and versions are set here, not by the client.
export async function POST() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  }

  if (!hasAcceptedTerms(claims.user_metadata)) {
    const { error } = await supabase.auth.updateUser({ data: consentMetadata() });
    if (error) {
      return NextResponse.json(
        { error: "Die Zustimmung konnte nicht gespeichert werden. Bitte versuche es erneut." },
        { status: 500 },
      );
    }
    // Make the new metadata visible in the session's JWT right away.
    await supabase.auth.refreshSession();
  }

  return NextResponse.json({ ok: true });
}
