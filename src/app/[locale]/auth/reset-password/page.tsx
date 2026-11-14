import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { type LocaleParams, pageLocale } from "@/i18n/page-locale";
import { MadeWithBadge } from "@/components/MadeWithBadge";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { SiteHeader } from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/server";

// A one-off page reached from an e-mail link - nothing for search engines.
export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const locale = await pageLocale(params);
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("neuesPasswortFestlegen"), robots: { index: false, follow: false } };
}

export default async function ResetPasswordPage({ params }: LocaleParams) {
  await pageLocale(params);
  const t = await getTranslations("auth");
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-leaf/20 bg-[var(--surface)] p-5 shadow-(--shadow) sm:p-8">
          <h1 className="text-center font-display text-2xl text-leaf-dark sm:text-3xl">
            {t("neuesPasswortFestlegen")}
          </h1>

          <div className="mt-6">
            {data?.claims ? (
              <ResetPasswordForm />
            ) : (
              <div className="space-y-4 text-center">
                <p>
                  {t("resetLinkInvalid")}
                </p>
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-leaf px-4 font-bold text-white transition hover:bg-leaf-dark"
                >
                  {t("zurStartseite")}
                </Link>
              </div>
            )}
          </div>
        </div>
        <MadeWithBadge />
      </main>
    </>
  );
}
