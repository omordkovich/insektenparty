import { AuthErrorDialog } from "@/components/AuthErrorDialog";
import { LandingContent } from "@/components/LandingContent";
import { LegalLinks } from "@/components/LegalLinks";
import { LinkExpiredDialog, type LinkExpiredKind } from "@/components/LinkExpiredDialog";
import { pageMetadata } from "@/lib/page-metadata";
import { SITE_DESCRIPTION } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { AccountButton, ConsentDialog, EventList } from "@/components/SignedInHomeParts";
import { getAccountName, getSignInMethods } from "@/lib/account";
import { todayInBerlin } from "@/lib/date-poll";
import { lifecycleOf } from "@/lib/event-lifecycle";
import { isDummyPaymentEnabled } from "@/lib/payments";
import { hasAcceptedTerms } from "@/lib/terms-consent";
import type { ThemeKey } from "@/lib/theme-presets";
import { createClient } from "@/lib/supabase/server";
import { getEventsByOwner } from "@/repositories/event-repository";
import { getUserEntitlements } from "@/services/entitlement-service";

export const metadata = pageMetadata({
  title: "Online-Einladung & Gästeliste kostenlos erstellen – GASTZILLA",
  description: SITE_DESCRIPTION,
  path: "/",
});

type HomeProps = {
  searchParams: Promise<{ link_expired?: string | string[]; auth_error?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { link_expired, auth_error: authError } = await searchParams;
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
                  Hi {name ?? claims.email}
                </h1>
                <div className="mt-8 w-full">
                  <EventList
                    initialEvents={myEvents}
                    entitlements={entitlements}
                    dummyPayments={isDummyPaymentEnabled()}
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
      {claims && !hasAcceptedTerms(claims.user_metadata) ? <ConsentDialog /> : null}
    </>
  );
}
