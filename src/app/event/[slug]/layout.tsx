import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildEventShareUrl } from "@/lib/share";
import { THEME_CLASS_NAMES, type ThemeKey } from "@/lib/theme-presets";
import { getEventByAddress } from "@/repositories/event-repository";
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
    return { title: "Event nicht gefunden", robots: NO_INDEX };
  }

  // Not for search engines (see NO_INDEX), but this is what WhatsApp & co.
  // show when an invitation link is shared - only what any link holder
  // sees anyway (title, date), never the guest list or contact details.
  const description = event.dateLabel
    ? `Du bist eingeladen – ${event.dateLabel}. Jetzt zusagen und Gästeliste ansehen.`
    : "Du bist eingeladen! Jetzt zusagen und Gästeliste ansehen.";

  return {
    title: `${event.title} - Einladung`,
    description,
    robots: NO_INDEX,
    openGraph: {
      type: "website",
      siteName: "GASTZILLA",
      locale: "de_DE",
      title: `Einladung: ${event.title}`,
      description,
      url: buildEventShareUrl(event.slug),
    },
    twitter: { card: "summary_large_image", title: `Einladung: ${event.title}`, description },
  };
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const { slug } = await params;
  const event = await getEventByAddress(slug);

  if (!event) {
    notFound();
  }

  const themeClassName = THEME_CLASS_NAMES[event.theme as ThemeKey];

  // data-theme-root lets portalled dialogs (e.g. the privacy policy) mount
  // inside the themed wrapper so they pick up the event's CSS variables.
  return (
    <div className={themeClassName} data-theme-root>
      {children}
    </div>
  );
}
