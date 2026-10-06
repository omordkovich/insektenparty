import type { Metadata } from "next";
import { OG_SIZE, SITE_NAME } from "@/lib/site";

// Metadata for an indexable page: canonical URL plus matching Open Graph
// tags. Next.js replaces (not merges) a parent's openGraph object, so every
// page sets its own - otherwise /about would be shared with the start
// page's title and URL. That replacement also drops the image inherited
// from app/opengraph-image, hence the explicit reference to it.
export function pageMetadata({
  title,
  description,
  path,
  image = "/opengraph-image",
  imageAlt = SITE_NAME,
}: {
  title: string;
  description: string;
  path: string;
  // Link preview image; pages with their own opengraph-image pass its path.
  image?: string;
  imageAlt?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "de_DE",
      title,
      description,
      url: path,
      images: [{ url: image, ...OG_SIZE, alt: imageAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
