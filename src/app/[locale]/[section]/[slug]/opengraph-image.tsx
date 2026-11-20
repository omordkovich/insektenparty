import { getTranslations } from "next-intl/server";
import { designSectionLanguage } from "@/lib/design-slugs";
import { designRouteParams, getDesignBySlug } from "@/lib/designs";
import { OG_SIZE, renderSiteOgImage } from "@/lib/og-image";
import { sectionLanguage } from "@/lib/occasion-slugs";
import { getOccasionBySlug, occasionRouteParams } from "@/lib/occasions";

// Link preview for an occasion or design page: the site card with the
// page's headline. No `alt` export: the page's generateMetadata references
// this route explicitly and sets the alt text itself (pageMetadata's imageAlt).
export const size = OG_SIZE;
export const contentType = "image/png";

// Built at deploy time.
export function generateStaticParams() {
  return [...occasionRouteParams().pages, ...designRouteParams().pages];
}

export default async function SectionOpengraphImage({
  params,
}: {
  params: Promise<{ locale: string; section: string; slug: string }>;
}) {
  const { locale, section, slug } = await params;

  const occasionLocale = sectionLanguage(locale, section);
  const occasion = occasionLocale ? getOccasionBySlug(slug, occasionLocale) : undefined;
  if (occasionLocale && occasion) {
    const t = await getTranslations({ locale: occasionLocale, namespace: "occasions" });
    return renderSiteOgImage({ title: occasion.title, subtitle: t("ogSubtitle") });
  }

  const designLocale = designSectionLanguage(locale, section);
  const design = designLocale ? getDesignBySlug(slug, designLocale) : undefined;
  if (designLocale && design) {
    const t = await getTranslations({ locale: designLocale, namespace: "designs" });
    return renderSiteOgImage({ title: design.title, subtitle: t("ogSubtitle") });
  }

  // Unknown slug: no image (instead of a 200 for every possible URL).
  return new Response(null, { status: 404 });
}
