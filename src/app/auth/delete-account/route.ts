import { apiErrors } from "@/i18n/api-errors";
import { err } from "@/i18n/errors";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteUser } from "@/repositories/user-repository";

// Deletes the signed-in user's account including everything that hangs off it
// (events, guest lists, unlocks - see deleteUser). Only accepts a JSON body
// with `confirm: true`: a plain cross-site form post can't send that, which
// doubles as CSRF protection.
export async function POST(request: Request) {
  const fail = apiErrors();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    return fail(err("signInRequired"), 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  if ((body as { confirm?: unknown } | null)?.confirm !== true) {
    return fail(err("deleteConfirmRequired"), 400);
  }

  try {
    await deleteUser(userId);
  } catch (error) {
    console.error("POST /auth/delete-account failed:", error);
    return fail(err("accountDeleteFailed"), 500);
  }

  // Clears the session cookies. The user no longer exists, so Supabase may
  // refuse the logout call - irrelevant, the account is gone either way.
  try {
    await supabase.auth.signOut();
  } catch {}

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
