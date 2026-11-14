import { getTranslations } from "next-intl/server";
import { OG_SIZE, renderSiteOgImage } from "@/lib/og-image";
import { sectionLanguage } from "@/lib/occasion-slugs";
import { getOccasionBySlug, occasionRouteParams } from "@/lib/occasions";

// Link preview for an occasion page: the site card with the occasion's
// headline. No `alt` export: the page's generateMetadata references this
// route explicitly and sets the alt text itself (pageMetadata's imageAlt).
export const size = OG_SIZE;
export const contentType = "image/png";

// Built at deploy time.
export function generateStaticParams() {
  return occasionRouteParams().pages;
}

export default async function OccasionOpengraphImage({
  params,
}: {
  params: Promise<{ locale: string; section: string; slug: string }>;
}) {
  const { locale, section, slug } = await params;
  const language = sectionLanguage(locale, section);
  const occasion = language ? getOccasionBySlug(slug, language) : undefined;
  // Unknown slug: no image (instead of a 200 for every possible URL).
  if (!language || !occasion) return new Response(null, { status: 404 });

  const t = await getTranslations({ locale: language, namespace: "occasions" });
  return renderSiteOgImage({ title: occasion.title, subtitle: t("ogSubtitle") });
}
