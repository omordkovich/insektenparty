import { cloudinaryPng, OG_SIZE, renderOgCard, renderSiteOgImage } from "@/lib/og-image";
import { THEME_ASSETS, type ThemeKey } from "@/lib/theme-presets";
import { getEventByAddress } from "@/repositories/event-repository";

// Link preview for a shared invitation: the event's theme logo, title and
// date - nothing a link holder couldn't see on the page anyway.
export const alt = "Einladung";
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

  const assets = THEME_ASSETS[event.theme as ThemeKey];
  return renderOgCard({
    imageSrc: cloudinaryPng(assets.logo),
    imageWidth: 300,
    imageHeight: 300,
    kicker: "Du bist eingeladen!",
    title: event.title || "Einladung",
    subtitle: event.dateLabel || undefined,
  });
}
