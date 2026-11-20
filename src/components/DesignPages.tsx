import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cardClass } from "@/components/card";
import { DesignPurchaseOptions } from "@/components/DesignPurchaseOptions";
import { FloatingAccents } from "@/components/FloatingAccents";
import { JsonLd } from "@/components/JsonLd";
import { LegalLinks } from "@/components/LegalLinks";
import { ParallaxSideGraphics } from "@/components/ParallaxSideGraphics";
import { SiteHeader } from "@/components/SiteHeader";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { DESIGN_SECTION } from "@/lib/design-slugs";
import {
  type Design,
  designAlternates,
  designBreadcrumbs,
  designPath,
  designsFor,
  designsHub,
  designsHubBreadcrumbs,
  designsPath,
} from "@/lib/designs";
import { getOccasion, occasionPath } from "@/lib/occasions";
import { localizedPath, pageMetadata } from "@/lib/page-metadata";
import { isDummyPaymentEnabled } from "@/lib/payments";
import { designsHubStructuredData, designStructuredData } from "@/lib/structured-data";
import { THEME_ASSETS, THEME_CLASS_NAMES } from "@/lib/theme-presets";

// The design pages in every language (/designs, /en/designs, /ru/dizajny;
// see design-slugs.ts). The route files (src/app/[locale]/[section]) only
// pick the language; everything they show is built here.

export function designPageMetadata(design: Design): Metadata {
  const path = designPath(design);
  return pageMetadata({
    title: design.metaTitle,
    description: design.metaDescription,
    path,
    locale: design.locale,
    alternates: designAlternates(design.theme),
    image: localizedPath(`${path}/opengraph-image`, design.locale),
    imageAlt: design.title,
  });
}

export function designsHubMetadata(locale: Locale): Metadata {
  const hub = designsHub(locale);
  return pageMetadata({
    title: hub.metaTitle,
    description: hub.description,
    path: designsPath(locale),
    locale,
    alternates: DESIGN_SECTION,
  });
}

// One design, shown in its own theme - background, side graphics, floating
// accents and colours as on an event page - so visitors see what their
// guests would see. The theme wrapper carries data-theme-root, so dialogs
// opened here (login) take the theme as well.
export async function DesignPageView({ design }: { design: Design }) {
  const t = await getTranslations({ locale: design.locale, namespace: "designs" });
  const assets = THEME_ASSETS[design.theme];
  const occasions = design.occasionIds.flatMap((id) => getOccasion(id, design.locale) ?? []);

  return (
    <div className={THEME_CLASS_NAMES[design.theme]} data-theme-root>
      <div className="relative flex min-h-dvh flex-col" style={{ isolation: "isolate" }}>
        <SiteHeader />
        <main className="flex flex-1 flex-col items-center px-6 pb-16 text-center">
          <JsonLd data={designStructuredData(design)} />
          <div className="relative flex w-full items-center justify-center overflow-hidden pb-6">
            <FloatingAccents accentOne={assets.accentOne} accentTwo={assets.accentTwo} />
            <Image
              src={assets.logo}
              alt={t("logoAlt", { name: design.name })}
              width={256}
              height={256}
              className="h-auto w-64"
              priority
            />
          </div>

          <div className="w-full max-w-3xl space-y-8">
            <section className={cardClass}>
              <Breadcrumbs items={designBreadcrumbs(design)} />
              <h1 className="mt-4 font-display text-3xl leading-tight text-leaf-dark sm:text-5xl">{design.title}</h1>
              <div className="mx-auto mt-4 max-w-xl space-y-3 text-lg text-muted">
                {design.description.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            {occasions.length > 0 ? (
              <section aria-labelledby="fits-title" className={cardClass}>
                <h2 id="fits-title" className="font-display text-2xl text-leaf-dark sm:text-3xl">
                  {t("fitsTitle")}
                </h2>
                <ul className="mt-4 flex flex-wrap justify-center gap-2">
                  {occasions.map((occasion) => (
                    <li key={occasion.id}>
                      <Link
                        href={occasionPath(occasion)}
                        className="inline-flex min-h-11 items-center rounded-full border border-leaf/30 px-4 font-semibold text-leaf-dark transition hover:bg-leaf/10"
                      >
                        {occasion.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <DesignPurchaseOptions theme={design.theme} dummyPayments={isDummyPaymentEnabled()} />

            <Link href={designsPath(design.locale)} className="inline-block font-bold text-leaf-dark underline underline-offset-2">
              {t("allDesigns")}
            </Link>
          </div>

          <LegalLinks className="mt-auto pt-12" />
        </main>
        <ParallaxSideGraphics leftSrc={assets.plantsLeft} rightSrc={assets.plantsRight} />
      </div>
    </div>
  );
}

// Overview of all design pages of a language - neutral site look, one card
// per design.
export async function DesignsHubView({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "designs" });
  const hub = designsHub(locale);
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center px-6 py-16 text-center">
        <div className="w-full max-w-4xl space-y-8">
          <JsonLd data={designsHubStructuredData(locale)} />
          <section className="text-center">
            <Breadcrumbs items={designsHubBreadcrumbs(locale)} />
            <h1 className="mt-4 font-display text-3xl leading-tight text-leaf-dark sm:text-5xl">{hub.title}</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{hub.intro}</p>
          </section>

          <ul className="grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
            {designsFor(locale).map((design) => (
              <li key={design.theme}>
                <Link
                  href={designPath(design)}
                  className={`${cardClass} group block h-full transition hover:border-leaf/50`}
                >
                  <Image
                    src={THEME_ASSETS[design.theme].logo}
                    alt=""
                    width={96}
                    height={96}
                    className="mx-auto h-24 w-24 object-contain transition group-hover:scale-105"
                  />
                  <h2 className="mt-3 text-center font-display text-xl text-leaf-dark hyphens-auto">{design.name}</h2>
                  <p className="mt-2 text-muted">{design.teaser}</p>
                  <span className="mt-3 inline-block font-bold text-leaf-dark">{t("learnMore")}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <LegalLinks className="mt-auto pt-12" />
      </main>
    </>
  );
}
