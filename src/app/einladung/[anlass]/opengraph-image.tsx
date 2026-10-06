import { OG_SIZE, renderSiteOgImage } from "@/lib/og-image";
import { getOccasionBySlug } from "@/lib/occasions";

// Link preview for an occasion page: the site card with the occasion's
// headline. No `alt` export: the page's generateMetadata references this
// route explicitly and sets the alt text itself (pageMetadata's imageAlt).
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OccasionOpengraphImage({
  params,
}: {
  params: Promise<{ anlass: string }>;
}) {
  const { anlass } = await params;
  const occasion = getOccasionBySlug(anlass);
  // Unknown slug: no image (instead of a 200 for every possible URL).
  if (!occasion) return new Response(null, { status: 404 });

  return renderSiteOgImage({
    title: occasion.title,
    subtitle: "Kostenlos & werbefrei – Gäste sagen per Link zu.",
  });
}
