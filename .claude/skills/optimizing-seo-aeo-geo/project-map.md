# GASTZILLA – SEO map and verified facts

## Where things live

| Concern | File |
|---|---|
| Occasion pages (data for page, hub, chips, sitemap, llms.txt, JSON-LD, OG) | `src/lib/occasions.ts` (+ `occasions.test.ts` enforces limits) |
| Occasion page / hub / OG image | `src/app/einladung/[anlass]/page.tsx`, `src/app/einladung/page.tsx`, `.../opengraph-image.tsx` |
| Start page copy, benefits, chips | `src/components/LandingContent.tsx`, `src/components/HowItWorks.tsx` |
| Start page FAQ (also schema + llms.txt) | `src/lib/faq.ts` |
| Title/description/canonical/OG helper | `src/lib/page-metadata.ts` (`pageMetadata()`) |
| JSON-LD (Organization, WebSite, WebApplication, FAQPage, WebPage, BreadcrumbList, CollectionPage, AboutPage) + `FEATURES` + `LIMITATIONS` (what it can't do) | `src/lib/structured-data.ts` |
| Comparison page WhatsApp-Umfrage / Doodle / GASTZILLA | `src/lib/comparison.ts` (content + `updated`), `src/app/vergleich/page.tsx` |
| Visible "Aktualisiert am" date | `src/components/UpdatedDate.tsx` (occasion pages, /vergleich, /about; about date = `ABOUT_UPDATED` in `src/lib/site.ts`) |
| Sitemap + lastModified dates | `src/app/sitemap.ts` (bump dates by hand) |
| AI summary | `src/app/llms.txt/route.ts` |
| AI-agent discovery manifest (ARD) at `/.well-known/ard.json` + predecessor `/.well-known/ai-catalog.json` (PageSpeed checks it) | `src/lib/ard.ts` (entries), `src/app/.well-known/*/route.ts`; both paths in `maintenance.ts` ALWAYS_REACHABLE |
| robots | `src/app/robots.ts` |
| Event pages (noindex) | `src/app/event/[slug]/layout.tsx` |
| Maintenance (what stays reachable) | `src/lib/maintenance.ts` |
| Site constants (URL, name, description) | `src/lib/site.ts` |
| Open SEO tasks | `docs/seo-todo.md` |

## Verified features (may be claimed)
Gäste sagen per Link zu oder ab – ohne Konto/App · Begleitpersonen mit Namen, mitgezählt · Ankunftszeit (Pflicht) + „bleibe bis“ (optional) · Mitbringsel-Eintrag, für alle sichtbar · Nachricht zur Zusage (für Link-Inhaber sichtbar) · Gäste ändern/löschen ihren Eintrag · E-Mail an den Gastgeber bei neuer Zusage, Änderung, Löschung · Teilen per WhatsApp, Signal, Telegram, E-Mail, Link kopieren · Termin in Kalender (nur mit Datum + Uhrzeit) · Zeitraum über mehrere Tage · Passwortschutz der Event-Seite · Terminabstimmung (kostenpflichtiges Extra) · Einladungstext-Editor für den Owner · Farbdesigns kostenlos; kostenpflichtige Premium-Designs · 1 Event pro Konto kostenlos, einmalig, nur mit festem Termin ≤ 3 Monate nach dem Erstellen; Terminabstimmung, offener Termin, Termin bis 12 Monate, Event-Seite ohne GASTZILLA-Hinweis = kostenpflichtige Extras; weitere Events „bald“ (keine Preise nennen, Zahlung in Testphase) · automatische Löschung 90 Tage nach dem Stichtag, Einladungslink ab Stichtag + 30 Tage „abgelaufen“, Löschhinweis-Mail 7 Tage vorher · werbefrei, keine Tracking-Cookies, Server in der EU · Event-Seiten nicht in Suchmaschinen.

**Not available (never imply):** Tickets/Bezahlung/Kostenteilung, Tisch- oder Escape-Room-Reservierung, Sitzplan, Teams, wiederkehrende Termine, Teilnehmerlimit, Erinnerungen/Benachrichtigungen an Gäste.

**Designs** (owner's decision 2026-10-22):
- Frame as „Designs für jeden Anlass“ / „im passenden Design“: Farbdesigns kostenlos, dazu „kostenpflichtige Premium-Designs“.
- Never name individual designs or colours („Schwarz“, Ballons …) and never state how many there are – describe them generically („ein dunkles Farbdesign“), so copy survives when designs change.
- No „bald“ for Premium-Designs; never list designs as a limitation.

Re-verify in code before relying on a feature that may have changed (`src/components/GuestModal.tsx`, `src/services/*`).

## Icons
Occasion icons: monoline, single colour #2f7d4a, outline only, 256×256 transparent WebP on Cloudinary folder `icons`, public_id = occasion id; versioned URL via `src/lib/occasion-icons.ts`.
Generate several at once as a 3×3 sheet (same prompt style, white background) so stroke width matches; cut, key out white, recolour, centre with 20 px padding (sharp is installed). Check median stroke ≈ 8 px at 256 px - a single-icon generation usually comes out thinner and must be thickened. Shown via CSS mask (`OccasionIcon`), so colour comes from `--leaf`.

## AEO/GEO beyond the page
`llms.txt` and JSON-LD describe content; off-site mentions (directories, blogs, forums) drive AI recommendations most. The ARD manifest (`ard.json` / `ai-catalog.json`) currently lists only `llms.txt`; add an entry per real agent tool (WebMCP, MCP server) once one exists. Identifier format `urn:air:gastzilla.de:<name>`, 2–5 `representativeQueries`.
