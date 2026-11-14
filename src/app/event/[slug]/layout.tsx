import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatDateRangeLabel } from "@/lib/calendar";
import { HtmlShell } from "@/components/HtmlShell";
import { DEFAULT_LOCALE, OG_LOCALE } from "@/i18n/config";
import { eventLocale } from "@/i18n/request-locale";
import { buildEventShareUrl } from "@/lib/share";
import { THEME_CLASS_NAMES, type ThemeKey } from "@/lib/theme-presets";
import { getEventByAddress } from "@/repositories/event-repository";
import { getEventLifecycle } from "@/services/event-lifecycle-service";
import React from "react";

type EventLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

// Event pages (and their /info sub-page) contain guest lists - names, often
// of children - plus addresses and phone numbers. They must never show up
// in search results. Note: robots.txt must NOT disallow /event/, otherwise
// crawlers can't fetch the page and never see this noindex.

const NO_INDEX: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventByAddress(slug);

  if (!event) {
    return { title: (await getTranslations({ locale: DEFAULT_LOCALE, namespace: "meta" }))("eventNotFound"), robots: NO_INDEX };
  }
  const locale = eventLocale(event);
  const t = await getTranslations({ locale, namespace: "meta" });

  // Link previews are fetched anonymously, so an expired event reveals
  // nothing to anyone: no title, no date.
  if ((await getEventLifecycle(event.id))?.stage === "expired") {
    const expiredDescription = t("expiredDescription");
    return {
      title: t("expiredTitle"),
      description: expiredDescription,
      robots: NO_INDEX,
      openGraph: {
        type: "website",
        siteName: "GASTZILLA",
        locale: OG_LOCALE[locale],
        title: t("expiredTitle"),
        description: expiredDescription,
        url: buildEventShareUrl(event.slug),
      },
      twitter: { card: "summary_large_image", title: t("expiredTitle"), description: expiredDescription },
    };
  }

  // Not for search engines (see NO_INDEX), but this is what WhatsApp & co.
  // show when an invitation link is shared - only what any link holder
  // sees anyway (title, date), never the guest list or contact details.
  // Password-protected: the preview names the event but nothing else.
  const dateLabel = event.eventDate
    ? formatDateRangeLabel(event.eventDate, event.eventEndDate, locale)
    : event.dateLabel;
  const description = event.accessPassword
    ? t("protectedDescription")
    : event.dateMode === "unknown"
      ? t("unknownDescription")
      : event.dateMode === "poll"
        ? t("pollDescription")
        : dateLabel
          ? t("dateDescription", { date: dateLabel })
          : t("plainDescription");

  return {
    title: t("eventTitle", { title: event.title }),
    description,
    robots: NO_INDEX,
    openGraph: {
      type: "website",
      siteName: "GASTZILLA",
      locale: OG_LOCALE[locale],
      title: t("eventOgTitle", { title: event.title }),
      description,
      url: buildEventShareUrl(event.slug),
    },
    twitter: { card: "summary_large_image", title: t("eventOgTitle", { title: event.title }), description },
  };
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const { slug } = await params;
  const event = await getEventByAddress(slug);

  if (!event) {
    notFound();
  }

  const themeClassName = THEME_CLASS_NAMES[event.theme as ThemeKey];
  // Event pages speak the event's language, not the visitor's choice.
  const locale = eventLocale(event);
  setRequestLocale(locale);

  // Own <html> (see app/layout.tsx). The theme wrapper inside it lets
  // portalled dialogs (e.g. the privacy policy) and the cookie banner pick up
  // the event's CSS variables.
  return (
    <HtmlShell locale={locale} themeClassName={themeClassName}>
      {children}
    </HtmlShell>
  );
}
