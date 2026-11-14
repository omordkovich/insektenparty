import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cardClass } from "@/components/card";
import { FaqSection } from "@/components/FaqSection";
import { HowItWorks } from "@/components/HowItWorks";
import { InvitationTemplate } from "@/components/InvitationTemplate";
import { JsonLd } from "@/components/JsonLd";
import { LegalLinks } from "@/components/LegalLinks";
import { OccasionActions } from "@/components/OccasionActions";
import { OccasionIcon } from "@/components/OccasionIcon";
import { SiteHeader } from "@/components/SiteHeader";
import { UpdatedDate } from "@/components/UpdatedDate";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { COMPARISON } from "@/lib/comparison";
import { OCCASION_SECTION } from "@/lib/occasion-slugs";
import {
  hubBreadcrumbs,
  type Occasion,
  occasionAlternates,
  occasionBreadcrumbs,
  occasionPath,
  occasionsFor,
  occasionsHub,
  occasionsPath,
} from "@/lib/occasions";
import { localizedPath, pageMetadata } from "@/lib/page-metadata";
import { occasionStructuredData, occasionsHubStructuredData } from "@/lib/structured-data";

// The occasion pages in every language: German under /einladung, English
// under /en/invitations (see occasion-slugs.ts). The route files
// (src/app/[locale]/[section]) only pick the language; everything they show
// is built here.

export function occasionPageMetadata(occasion: Occasion): Metadata {
  const path = occasionPath(occasion);
  return pageMetadata({
    title: occasion.metaTitle,
    description: occasion.description,
    path,
    locale: occasion.locale,
    alternates: occasionAlternates(occasion.id),
    image: localizedPath(`${path}/opengraph-image`, occasion.locale),
    imageAlt: occasion.title,
  });
}

export function occasionsHubMetadata(locale: Locale): Metadata {
  const hub = occasionsHub(locale);
  return pageMetadata({
    title: hub.metaTitle,
    description: hub.description,
    path: occasionsPath(locale),
    locale,
    alternates: OCCASION_SECTION,
  });
}

// Info page for one occasion - for search engines and AI assistants;
// signing up works as on the start page.
export function OccasionPageView({ occasion }: { occasion: Occasion }) {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center px-6 py-16 text-center">
        <div className="w-full max-w-3xl space-y-8">
          <JsonLd data={occasionStructuredData(occasion)} />

          <section className="text-center">
            <Breadcrumbs items={occasionBreadcrumbs(occasion)} />
            <h1 className="mt-4 font-display text-3xl leading-tight text-leaf-dark sm:text-5xl">
              {occasion.title}
            </h1>
            <div className="mx-auto mt-4 max-w-xl space-y-3 text-lg text-muted">
              {occasion.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <OccasionActions />
            </div>
          </section>

          <section aria-labelledby="benefits-title" className={cardClass}>
            <h2
              id="benefits-title"
              className="text-center font-display text-2xl text-leaf-dark sm:text-3xl"
            >
              {occasion.benefitsTitle}
            </h2>
            <ul className="mt-6 grid gap-6 text-left sm:grid-cols-2">
              {occasion.benefits.map((benefit) => (
                <li key={benefit.title}>
                  <h3 className="font-display text-lg text-leaf-dark">{benefit.title}</h3>
                  <p className="mt-1 text-muted">{benefit.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <InvitationTemplate name={occasion.name} lines={occasion.invitationText} />

          <HowItWorks />

          <FaqSection items={occasion.faq} />

          <UpdatedDate date={occasion.updated} />
        </div>

        <LegalLinks className="mt-auto pt-12" />
      </main>
    </>
  );
}

// Overview of all occasion pages of a language - one card per occasion.
export async function OccasionsHubView({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "occasions" });
  const hub = occasionsHub(locale);
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center px-6 py-16 text-center">
        <div className="w-full max-w-3xl space-y-8">
          <JsonLd data={occasionsHubStructuredData(locale)} />

          <section className="text-center">
            <Breadcrumbs items={hubBreadcrumbs(locale)} />
            <h1 className="mt-4 font-display text-3xl leading-tight text-leaf-dark sm:text-5xl">{hub.title}</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{hub.intro}</p>
            <div className="mt-6 flex justify-center">
              <OccasionActions backHref="/" />
            </div>
          </section>

          <ul className="grid gap-4 text-left sm:grid-cols-2">
            {occasionsFor(locale).map((occasion) => (
              <li key={occasion.id}>
                <Link
                  href={occasionPath(occasion)}
                  className={`${cardClass} group block h-full transition hover:border-leaf/50`}
                >
                  {/* Above the title, so the text keeps the full card width. */}
                  <OccasionIcon
                    occasion={occasion}
                    className="mx-auto h-20 w-20 opacity-40 transition group-hover:opacity-70 sm:h-24 sm:w-24"
                  />
                  <h2 className="mt-3 font-display text-xl text-leaf-dark hyphens-auto">{occasion.name}</h2>
                  <p className="mt-2 text-muted">{occasion.teaser}</p>
                  <span className="mt-3 inline-block font-bold text-leaf-dark">{t("learnMore")}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* The comparison exists in German only - no detour for English readers. */}
          {locale === DEFAULT_LOCALE ? (
            <Link href={COMPARISON.path} className={`${cardClass} block text-center transition hover:border-leaf/50`}>
              <h2 className="font-display text-xl text-leaf-dark">{t("compareTitle")}</h2>
              <p className="mt-2 text-muted">{COMPARISON.teaser}</p>
              <span className="mt-3 inline-block font-bold text-leaf-dark">{t("compareCta")}</span>
            </Link>
          ) : null}
        </div>

        <LegalLinks className="mt-auto pt-12" />
      </main>
    </>
  );
}
