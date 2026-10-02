import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const redirectTo = request.nextUrl.clone();
  // `next` only trusted when it's a same-site relative path (starts with a
  // single "/") - otherwise it could be used for an open redirect.
  const isSafeRelativePath = (value: string) => value.startsWith("/") && !value.startsWith("//");
  redirectTo.pathname =
    next && isSafeRelativePath(next)
      ? next
      : type === "recovery"
        ? "/auth/reset-password"
        : "/";
  redirectTo.search = "";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    // Expired, already used or unknown (e.g. the unconfirmed account was
    // cleaned up in the meantime): land on the start page with a notice
    // instead of silently pretending it worked.
    if (error) {
      redirectTo.pathname = "/";
      redirectTo.search = `?link_expired=${type === "recovery" ? "recovery" : "signup"}`;
      return NextResponse.redirect(redirectTo);
    }
  }

  return NextResponse.redirect(redirectTo);
}
