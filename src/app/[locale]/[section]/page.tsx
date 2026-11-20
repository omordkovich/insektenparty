import { notFound } from "next/navigation";
import { DesignsHubView, designsHubMetadata } from "@/components/DesignPages";
import { OccasionsHubView, occasionsHubMetadata } from "@/components/OccasionPages";
import { pageLocale } from "@/i18n/page-locale";
import { designSectionLanguage } from "@/lib/design-slugs";
import { designRouteParams } from "@/lib/designs";
import { sectionLanguage } from "@/lib/occasion-slugs";
import { occasionRouteParams } from "@/lib/occasions";

// The overview pages of every language, under that language's own section
// name: occasions (/einladung, /en/invitations - OCCASION_SECTION in
// src/lib/occasion-slugs.ts) and designs (/designs, /ru/dizajny -
// DESIGN_SECTION in src/lib/design-slugs.ts). A new language needs no new
// route file.

type SectionPageProps = {
  params: Promise<{ locale: string; section: string }>;
};

// Built at deploy time; every other name at this level is a 404.
export const dynamicParams = false;

// Complete params (with the language): the build does not hand this
// function the layout's locale.
export function generateStaticParams() {
  return [...occasionRouteParams().hubs, ...designRouteParams().hubs];
}

async function overviewOf(params: SectionPageProps["params"]) {
  const locale = await pageLocale(params);
  const { section } = await params;
  const occasionLocale = sectionLanguage(locale, section);
  if (occasionLocale) return { kind: "occasions" as const, locale: occasionLocale };
  const designLocale = designSectionLanguage(locale, section);
  if (designLocale) return { kind: "designs" as const, locale: designLocale };
  return null;
}

export async function generateMetadata({ params }: SectionPageProps) {
  const overview = await overviewOf(params);
  if (!overview) return {};
  return overview.kind === "occasions" ? occasionsHubMetadata(overview.locale) : designsHubMetadata(overview.locale);
}

export default async function SectionPage({ params }: SectionPageProps) {
  const overview = await overviewOf(params);
  if (!overview) notFound();
  return overview.kind === "occasions" ? (
    <OccasionsHubView locale={overview.locale} />
  ) : (
    <DesignsHubView locale={overview.locale} />
  );
}
