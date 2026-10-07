import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /event/ (event pages) is deliberately NOT disallowed: crawlers have to be able
// to fetch those pages to see their noindex. Blocking them here would let a
// linked invitation URL still appear in results, just without content.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/auth/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
