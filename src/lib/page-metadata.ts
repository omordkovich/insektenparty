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
}: {
  title: string;
  description: string;
  path: string;
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
      images: [{ url: "/opengraph-image", ...OG_SIZE, alt: SITE_NAME }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}
