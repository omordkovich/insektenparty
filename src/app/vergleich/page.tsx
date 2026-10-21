import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cardClass } from "@/components/card";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { LegalLinks } from "@/components/LegalLinks";
import { OccasionActions } from "@/components/OccasionActions";
import { SiteHeader } from "@/components/SiteHeader";
import { UpdatedDate } from "@/components/UpdatedDate";
import { COMPARISON, comparisonBreadcrumbs } from "@/lib/comparison";
import { getOccasionBySlug, occasionPath } from "@/lib/occasions";
import { pageMetadata } from "@/lib/page-metadata";
import { comparisonStructuredData, LIMITATIONS } from "@/lib/structured-data";

export const metadata = pageMetadata({
  title: COMPARISON.metaTitle,
  description: COMPARISON.description,
  path: COMPARISON.path,
});

const pollPage = getOccasionBySlug("terminabstimmung");

// WhatsApp poll vs. Doodle vs. GASTZILLA (content in src/lib/comparison.ts).
export default function ComparisonPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center px-6 py-16 text-center">
        <div className="w-full max-w-3xl space-y-8">
          <JsonLd data={comparisonStructuredData()} />

          <section className="text-center">
            <Breadcrumbs items={comparisonBreadcrumbs()} />
            <h1 className="mt-4 font-display text-3xl leading-tight text-leaf-dark sm:text-5xl">
              {COMPARISON.title}
            </h1>
            <div className="mx-auto mt-4 max-w-xl space-y-3 text-lg text-muted">
              {COMPARISON.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <OccasionActions backHref="/" />
            </div>
          </section>

          <section aria-labelledby="options-title" className={cardClass}>
            <h2
              id="options-title"
              className="text-center font-display text-2xl text-leaf-dark sm:text-3xl"
            >
              Wann passt was?
            </h2>
            <ul className="mt-6 grid gap-6 text-left sm:grid-cols-3">
              {COMPARISON.options.map((option) => (
                <li key={option.name}>
                  <h3 className="font-display text-lg text-leaf-dark">{option.heading}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
                    {option.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-muted">{option.note}</p>
                </li>
              ))}
            </ul>
            {pollPage ? (
              <p className="mt-6 text-center text-sm">
                <Link
                  href={occasionPath(pollPage)}
                  className="font-bold text-leaf-dark underline underline-offset-2"
                >
                  So funktioniert die Terminabstimmung mit GASTZILLA →
                </Link>
              </p>
            ) : null}
          </section>

          <section aria-labelledby="limits-title" className={cardClass}>
            <h2
              id="limits-title"
              className="text-center font-display text-2xl text-leaf-dark sm:text-3xl"
            >
              Was GASTZILLA nicht kann
            </h2>
            <ul className="mt-6 list-disc space-y-2 pl-5 text-left text-muted">
              {LIMITATIONS.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </section>

          <FaqSection items={COMPARISON.faq} />

          <div className="space-y-1">
            <p className="text-sm text-muted">{COMPARISON.disclaimer}</p>
            <UpdatedDate date={COMPARISON.updated} />
          </div>
        </div>

        <LegalLinks className="mt-auto pt-12" />
      </main>
    </>
  );
}
