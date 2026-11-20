import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignPageView, designPageMetadata } from "@/components/DesignPages";
import { OccasionPageView, occasionPageMetadata } from "@/components/OccasionPages";
import { pageLocale } from "@/i18n/page-locale";
import { designSectionLanguage } from "@/lib/design-slugs";
import { designRouteParams, getDesignBySlug } from "@/lib/designs";
import { sectionLanguage } from "@/lib/occasion-slugs";
import { getOccasionBySlug, occasionRouteParams } from "@/lib/occasions";

// One occasion page (/einladung/hochzeit, /en/invitations/wedding) or one
// design page (/designs/halloween-friedhof, /ru/dizajny/...) in every
// language (slugs in src/lib/occasion-slugs.ts and design-slugs.ts).

type SectionSlugPageProps = {
  params: Promise<{ locale: string; section: string; slug: string }>;
};

// Every page is built at deploy time; any other slug - and every slug
// under another language's section - is a 404.
export const dynamicParams = false;

// Complete params (with the language): the build does not hand this
// function the layout's locale.
export function generateStaticParams() {
  return [...occasionRouteParams().pages, ...designRouteParams().pages];
}

async function pageOf(params: SectionSlugPageProps["params"]) {
  const locale = await pageLocale(params);
  const { section, slug } = await params;
  const occasionLocale = sectionLanguage(locale, section);
  if (occasionLocale) {
    const occasion = getOccasionBySlug(slug, occasionLocale);
    return occasion ? { kind: "occasion" as const, occasion } : null;
  }
  const designLocale = designSectionLanguage(locale, section);
  if (designLocale) {
    const design = getDesignBySlug(slug, designLocale);
    return design ? { kind: "design" as const, design } : null;
  }
  return null;
}

export async function generateMetadata({ params }: SectionSlugPageProps): Promise<Metadata> {
  const page = await pageOf(params);
  if (!page) return {};
  return page.kind === "occasion" ? occasionPageMetadata(page.occasion) : designPageMetadata(page.design);
}

export default async function SectionSlugPage({ params }: SectionSlugPageProps) {
  const page = await pageOf(params);
  if (!page) notFound();
  return page.kind === "occasion" ? <OccasionPageView occasion={page.occasion} /> : <DesignPageView design={page.design} />;
}
