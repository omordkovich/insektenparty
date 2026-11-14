import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OccasionPageView, occasionPageMetadata } from "@/components/OccasionPages";
import { pageLocale } from "@/i18n/page-locale";
import { sectionLanguage } from "@/lib/occasion-slugs";
import { getOccasionBySlug, occasionRouteParams } from "@/lib/occasions";

// One occasion page in every language: /einladung/hochzeit,
// /en/invitations/wedding (slugs in src/lib/occasion-slugs.ts).

type OccasionPageProps = {
  params: Promise<{ locale: string; section: string; slug: string }>;
};

// Every occasion page is built at deploy time; any other slug - and every
// slug under another language's section - is a 404.
export const dynamicParams = false;

// Complete params (with the language): the build does not hand this
// function the layout's locale.
export function generateStaticParams() {
  return occasionRouteParams().pages;
}

async function occasionOf(params: OccasionPageProps["params"]) {
  const locale = await pageLocale(params);
  const { section, slug } = await params;
  const language = sectionLanguage(locale, section);
  return language ? getOccasionBySlug(slug, language) : undefined;
}

export async function generateMetadata({ params }: OccasionPageProps): Promise<Metadata> {
  const occasion = await occasionOf(params);
  return occasion ? occasionPageMetadata(occasion) : {};
}

export default async function OccasionPage({ params }: OccasionPageProps) {
  const occasion = await occasionOf(params);
  if (!occasion) notFound();
  return <OccasionPageView occasion={occasion} />;
}
