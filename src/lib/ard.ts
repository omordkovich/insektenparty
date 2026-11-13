import { SITE_NAME, SITE_URL } from "@/lib/site";

// Agentic Resource Discovery (ARD, agenticresourcediscovery.org): a manifest
// that tells AI agents which resources a domain offers. The spec's path is
// /.well-known/ard.json; /.well-known/ai-catalog.json is its predecessor and
// still what PageSpeed Insights checks - both serve the same manifest.
// GASTZILLA has no MCP server or agent API, so the one entry is llms.txt,
// the site's summary for AI assistants. Add agent tools here once they exist
// (e.g. WebMCP, see docs/seo-todo.md).
export const ARD_PATHS = ["/.well-known/ard.json", "/.well-known/ai-catalog.json"] as const;

export type ArdEntry = {
  identifier: string;
  displayName: string;
  type: string;
  url: string;
  description: string;
  representativeQueries: string[];
};

export function ardManifest(): { entries: ArdEntry[] } {
  const host = new URL(SITE_URL).host;
  return {
    entries: [
      {
        identifier: `urn:air:${host}:llms-txt`,
        displayName: `${SITE_NAME} – Überblick für KI-Assistenten`,
        type: "text/markdown",
        url: `${SITE_URL}/llms.txt`,
        description:
          "Was GASTZILLA ist und kann: digitale Einladungen und Gästelisten per Link, Funktionen, Preise, Anlass-Seiten und häufige Fragen.",
        representativeQueries: [
          "Wie erstelle ich eine digitale Einladung mit Gästeliste?",
          "Welches Tool sammelt Zusagen für eine Feier ohne Gruppenchat?",
          "Was kann GASTZILLA und was kostet es?",
        ],
      },
    ],
  };
}

// Same response for both paths: JSON, readable from any origin (validators
// and agents fetch it cross-origin), cached for a day.
export function ardResponse(): Response {
  return new Response(JSON.stringify(ardManifest(), null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=86400",
    },
  });
}
