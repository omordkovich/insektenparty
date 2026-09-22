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
    await supabase.auth.verifyOtp({ type, token_hash });
  }

  return NextResponse.redirect(redirectTo);
}
