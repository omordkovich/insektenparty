import { getTranslations } from "next-intl/server";
import { eventLocale } from "@/i18n/request-locale";
import { formatDateRangeLabel } from "@/lib/calendar";
import { cloudinaryPng, OG_SIZE, renderOgCard, renderSiteOgImage } from "@/lib/og-image";
import { THEME_ASSETS, type ThemeKey } from "@/lib/theme-presets";
import { getEventByAddress } from "@/repositories/event-repository";
import { getEventLifecycle } from "@/services/event-lifecycle-service";

// Link preview for a shared invitation: the event's theme logo, title and
// date - nothing a link holder couldn't see on the page anyway. Password-
// protected events show only their title.
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function EventOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventByAddress(slug);
  if (!event) return renderSiteOgImage();
  const locale = eventLocale(event);
  const t = await getTranslations({ locale, namespace: "meta" });

  // Expired: the preview is fetched anonymously - no title, no date.
  if ((await getEventLifecycle(event.id))?.stage === "expired") {
    return renderSiteOgImage({ title: t("expiredTitle"), subtitle: "GASTZILLA" });
  }

  // Password-protected: neither the theme (hints at the occasion) nor the date.
  if (event.accessPassword) {
    return renderSiteOgImage({
      title: t("eventOgTitle", { title: event.title || "Event" }),
      subtitle: t("ogProtected"),
    });
  }

  const assets = THEME_ASSETS[event.theme as ThemeKey];
  return renderOgCard({
    imageSrc: cloudinaryPng(assets.logo),
    imageWidth: 300,
    imageHeight: 300,
    kicker: t("ogKicker"),
    title: event.title || t("ogInvitation"),
    subtitle:
      event.dateMode === "unknown"
        ? t("ogDateFollows")
        : event.dateMode === "poll"
          ? t("ogDateVoting")
          : (event.eventDate
              ? formatDateRangeLabel(event.eventDate, event.eventEndDate, locale)
              : event.dateLabel) || undefined,
  });
}
