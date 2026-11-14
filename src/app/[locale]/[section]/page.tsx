import { notFound } from "next/navigation";
import { OccasionsHubView, occasionsHubMetadata } from "@/components/OccasionPages";
import { pageLocale } from "@/i18n/page-locale";
import { sectionLanguage } from "@/lib/occasion-slugs";
import { occasionRouteParams } from "@/lib/occasions";

// The occasion overview of every language, under that language's own
// section name: /einladung, /en/invitations (OCCASION_SECTION in
// src/lib/occasion-slugs.ts). A new language needs no new route file.

type OccasionsPageProps = {
  params: Promise<{ locale: string; section: string }>;
};

// Built at deploy time; every other name at this level is a 404.
export const dynamicParams = false;

// Complete params (with the language): the build does not hand this
// function the layout's locale.
export function generateStaticParams() {
  return occasionRouteParams().hubs;
}

async function languageOf(params: OccasionsPageProps["params"]) {
  const locale = await pageLocale(params);
  return sectionLanguage(locale, (await params).section);
}

export async function generateMetadata({ params }: OccasionsPageProps) {
  const locale = await languageOf(params);
  return locale ? occasionsHubMetadata(locale) : {};
}

export default async function OccasionsPage({ params }: OccasionsPageProps) {
  const locale = await languageOf(params);
  if (!locale) notFound();
  return <OccasionsHubView locale={locale} />;
}
