import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthButtons } from "@/components/AuthButtons";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cardClass } from "@/components/card";
import { FaqSection } from "@/components/FaqSection";
import { HowItWorks } from "@/components/HowItWorks";
import { JsonLd } from "@/components/JsonLd";
import { LegalLinks } from "@/components/LegalLinks";
import { OccasionChips } from "@/components/OccasionChips";
import { SiteHeader } from "@/components/SiteHeader";
import { getOccasionBySlug, OCCASIONS, occasionBreadcrumbs, occasionPath } from "@/lib/occasions";
import { pageMetadata } from "@/lib/page-metadata";
import { occasionStructuredData } from "@/lib/structured-data";

type OccasionPageProps = {
  params: Promise<{ anlass: string }>;
};

// Every occasion page is built at deploy time; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return OCCASIONS.map((occasion) => ({ anlass: occasion.slug }));
}

export async function generateMetadata({ params }: OccasionPageProps): Promise<Metadata> {
  const { anlass } = await params;
  const occasion = getOccasionBySlug(anlass);
  if (!occasion) return {};

  const path = occasionPath(occasion);
  return pageMetadata({
    title: occasion.metaTitle,
    description: occasion.description,
    path,
    image: `${path}/opengraph-image`,
    imageAlt: occasion.title,
  });
}

// Info page for one occasion (see src/lib/occasions.ts) - for search
// engines and AI assistants; signing up works as on the start page.
export default async function OccasionPage({ params }: OccasionPageProps) {
  const { anlass } = await params;
  const occasion = getOccasionBySlug(anlass);
  if (!occasion) notFound();

  const otherOccasions = OCCASIONS.filter((other) => other.id !== occasion.id);

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
              <AuthButtons registerLabel="Kostenlos starten" afterLoginHref="/" />
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

          <HowItWorks />

          <FaqSection items={occasion.faq} />

          {otherOccasions.length > 0 ? (
            <section aria-labelledby="more-occasions-title" className={cardClass}>
              <h2
                id="more-occasions-title"
                className="text-center font-display text-2xl text-leaf-dark sm:text-3xl"
              >
                Weitere Anlässe
              </h2>
              <div className="mt-6">
                <OccasionChips occasions={otherOccasions} />
              </div>
            </section>
          ) : null}
        </div>

        <LegalLinks className="mt-auto pt-12" />
      </main>
    </>
  );
}
