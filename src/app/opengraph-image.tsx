import { OG_SIZE, renderSiteOgImage } from "@/lib/og-image";

// Link preview for the start page and every page below it that has no
// opengraph-image of its own (about, legal pages). Event pages override it.
export const alt = "GASTZILLA – Digitale Einladungen & Gästelisten für jedes Event";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderSiteOgImage();
}
