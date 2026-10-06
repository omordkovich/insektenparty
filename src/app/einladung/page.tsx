import Link from "next/link";
import { AuthButtons } from "@/components/AuthButtons";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cardClass } from "@/components/card";
import { JsonLd } from "@/components/JsonLd";
import { LegalLinks } from "@/components/LegalLinks";
import { SiteHeader } from "@/components/SiteHeader";
import { hubBreadcrumbs, OCCASIONS, OCCASIONS_HUB, OCCASIONS_PATH, occasionPath } from "@/lib/occasions";
import { pageMetadata } from "@/lib/page-metadata";
import { occasionsHubStructuredData } from "@/lib/structured-data";

export const metadata = pageMetadata({
  title: OCCASIONS_HUB.metaTitle,
  description: OCCASIONS_HUB.description,
  path: OCCASIONS_PATH,
});

// Overview of all occasion pages - one card per entry in OCCASIONS.
export default function OccasionsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center px-6 py-16 text-center">
        <div className="w-full max-w-3xl space-y-8">
          <JsonLd data={occasionsHubStructuredData()} />

          <section className="text-center">
            <Breadcrumbs items={hubBreadcrumbs()} />
            <h1 className="mt-4 font-display text-3xl leading-tight text-leaf-dark sm:text-5xl">
              {OCCASIONS_HUB.title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{OCCASIONS_HUB.intro}</p>
            <div className="mt-6 flex justify-center">
              <AuthButtons registerLabel="Kostenlos starten" afterLoginHref="/" />
            </div>
          </section>

          <ul className="grid gap-4 text-left sm:grid-cols-2">
            {OCCASIONS.map((occasion) => (
              <li key={occasion.id}>
                <Link
                  href={occasionPath(occasion)}
                  className={`${cardClass} block h-full transition hover:border-leaf/50`}
                >
                  <h2 className="font-display text-xl text-leaf-dark">{occasion.name}</h2>
                  <p className="mt-2 text-muted">{occasion.teaser}</p>
                  <span className="mt-3 inline-block font-bold text-leaf-dark">Mehr erfahren →</span>
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
