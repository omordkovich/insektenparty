import { getTranslations } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "@/i18n/config";
import { OG_SIZE, renderSiteOgImage } from "@/lib/og-image";

// Link preview for the start page and every page below it that has no
// opengraph-image of its own (about, legal pages). Event pages override it.
// The alt text is set by pageMetadata (imageAlt), per language.
export const size = OG_SIZE;
export const contentType = "image/png";

// Built at deploy time, once per language.
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = await getTranslations({ locale, namespace: "home" });
  return renderSiteOgImage({ title: t("title"), subtitle: t("tagline") });
}
