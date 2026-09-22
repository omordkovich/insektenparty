import Link from "next/link";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { SiteHeader } from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-leaf/20 bg-[var(--surface)] p-5 shadow-(--shadow) sm:p-8">
          <h1 className="text-center font-display text-2xl text-leaf-dark sm:text-3xl">
            Neues Passwort festlegen
          </h1>

          <div className="mt-6">
            {data?.claims ? (
              <ResetPasswordForm />
            ) : (
              <div className="space-y-4 text-center">
                <p>
                  Dieser Link ist ungültig oder abgelaufen. Bitte fordere über
                  „Passwort vergessen?&rdquo; beim Login einen neuen Link an.
                </p>
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-leaf px-4 font-bold text-white transition hover:bg-leaf-dark"
                >
                  Zur Startseite
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
