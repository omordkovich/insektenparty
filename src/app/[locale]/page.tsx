import { type LocaleParams, pageLocale } from "@/i18n/page-locale";
import { AuthErrorDialog } from "@/components/AuthErrorDialog";
import { LandingContent } from "@/components/LandingContent";
import { LegalLinks } from "@/components/LegalLinks";
import { LinkExpiredDialog, type LinkExpiredKind } from "@/components/LinkExpiredDialog";
import { pageMetadata } from "@/lib/page-metadata";
import { getTranslations } from "next-intl/server";
import { SITE_DESCRIPTIONS } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { AccountButton, ConsentDialog, EventList } from "@/components/SignedInHomeParts";
import { getAccountName, getSignInMethods } from "@/lib/account";
import { todayInBerlin } from "@/lib/date-poll";
import { lifecycleOf } from "@/lib/event-lifecycle";
import { isDummyPaymentEnabled } from "@/lib/payments";
import { parseStartIntent } from "@/lib/start-intent";
import { termsConsentState } from "@/lib/terms-consent";
import type { ThemeKey } from "@/lib/theme-presets";
import { createClient } from "@/lib/supabase/server";
import { getEventsByOwner } from "@/repositories/event-repository";
import { getUserEntitlements } from "@/services/entitlement-service";

export async function generateMetadata({ params }: LocaleParams) {
  const locale = await pageLocale(params);
  return pageMetadata({
    title: (await getTranslations({ locale, namespace: "home" }))("metaTitle"),
    description: SITE_DESCRIPTIONS[locale],
    path: "/",
    locale,
    alternates: true,
  });
}

type HomeProps = LocaleParams & {
  searchParams: Promise<{
    link_expired?: string | string[];
    auth_error?: string | string[];
    // "Mit diesem Design starten" on a design page (src/lib/start-intent.ts).
    design?: string | string[];
    event?: string | string[];
  }>;
};

export default async function Home({ params, searchParams }: HomeProps) {
  await pageLocale(params);
  const t = await getTranslations("home");
  const { link_expired, auth_error: authError, design, event } = await searchParams;
  const startIntent = parseStartIntent({ design, event });
  const linkExpired: LinkExpiredKind | null =
    link_expired === "recovery" ? "recovery" : link_expired === "signup" ? "signup" : null;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const name = getAccountName(claims?.user_metadata);

  // Stage and deletion day of every event, worked out here on the server.
  const today = todayInBerlin();
  const myEvents = claims
    ? (await getEventsByOwner(claims.sub)).map((event) => {
        const { stage, deletionDate } = lifecycleOf(event, today);
        return {
          id: event.id,
          slug: event.slug,
          title: event.title,
          theme: event.theme as ThemeKey,
          plan: event.plan,
          stage,
          deletionDate,
        };
      })
    : [];

  const entitlements = claims ? await getUserEntitlements(claims.sub) : null;
  const consentState = claims ? termsConsentState(claims.user_metadata) : null;

  return (
    <>
      <SiteHeader
        action={
          claims ? (
            <AccountButton
              email={claims.email ?? ""}
              name={name}
              methods={getSignInMethods(claims.app_metadata)}
            />
          ) : undefined
        }
      />
      <main className="flex min-h-full flex-col items-center px-6 py-16 text-center">
        <LandingContent
          hero={
            claims && entitlements ? (
              <section className="flex flex-col items-center">
                <h1 className="max-w-xl text-2xl font-normal text-zinc-800 sm:text-3xl">
                  {t("greeting", { name: name ?? claims.email ?? "" })}
                </h1>
                <div className="mt-8 w-full">
                  <EventList
                    initialEvents={myEvents}
                    entitlements={entitlements}
                    dummyPayments={isDummyPaymentEnabled()}
                    startIntent={startIntent}
                  />
                </div>
              </section>
            ) : undefined
          }
        />

        <LegalLinks className="mt-auto pt-12" />
      </main>

      {linkExpired ? <LinkExpiredDialog kind={linkExpired} /> : null}
      {authError === "1" ? <AuthErrorDialog /> : null}
      {consentState === "none" ? <ConsentDialog kind="first" /> : null}
      {consentState === "outdated" ? <ConsentDialog kind="update" /> : null}
    </>
  );
}
