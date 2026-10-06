# Anlass-Seiten (SEO-Landingpages)

**Datum:** 2026-10-06
**Status:** Design genehmigt

## Ziel

GASTZILLA soll bei Suchanfragen zu konkreten Anlässen gefunden und von
KI-Assistenten empfohlen werden („Einladung Kindergeburtstag online“,
„Glühweinabend organisieren“). Dafür bekommt jeder Anlass eine eigene,
statische Info-Seite mit passendem Text, Vorteilen und FAQ.

Reine Info-Seiten: In der App ändert sich nichts. Es gibt kein Anlass-Feld,
keine neuen API-Endpunkte, Events werden angelegt wie bisher. Der Button
„Kostenlos starten“ öffnet den bestehenden Registrierungsdialog.

## Anlässe

Kindergeburtstag, Hochzeit, Firmenfeier, Grillparty / Gartenfest,
Halloweenparty, Glühweinabend, Gruppenausflug, einfache Verabredungen.

**Vorgehen:** Zuerst wird nur Kindergeburtstag als Muster gebaut und vom
Nutzer gegengelesen (Ton, Länge). Die übrigen sieben folgen danach als reine
Daten-Einträge, ohne Code-Änderung.

## Adressen

| Seite | Adresse |
|---|---|
| Übersicht | `/einladung` |
| Anlass | `/einladung/<slug>`, z. B. `/einladung/kindergeburtstag` |

Deutsch bleibt ohne Sprachpräfix. Spätere Sprachen bekommen ein Präfix und
eigene, übersetzte Adressen (z. B. `/en/invitation/kids-birthday-party`),
verknüpft per `hreflang`. Mehrsprachigkeit selbst ist nicht Teil dieses
Designs – nur die Struktur ist darauf vorbereitet (siehe `id`).

Unbekannte Slugs → 404 (`dynamicParams = false`, alle Seiten per
`generateStaticParams` statisch erzeugt).

## Datenmodell (`src/lib/occasions.ts`)

Eine Liste `OCCASIONS`, ein Eintrag pro Anlass, ohne React (damit Sitemap,
llms.txt und Server-Seiten sie gleichermaßen importieren können):

| Feld | Zweck |
|---|---|
| `id` | sprachunabhängiger, fester Schlüssel (englisch, z. B. `kids-birthday`) – verbindet später die Sprachversionen eines Anlasses |
| `slug` | deutsche Adresse, nur `a-z`, `0-9`, `-` |
| `name` | Kurzname für Chips/Breadcrumb, z. B. „Kindergeburtstag“ |
| `title` | H1, enthält den Suchbegriff |
| `metaTitle` | `<title>`, endet auf „– GASTZILLA“ |
| `description` | Meta-Beschreibung, max. 160 Zeichen |
| `teaser` | ein Satz für Übersichtsseite und llms.txt |
| `intro` | 1–2 Absätze Einleitung |
| `benefitsTitle` | H2 über den Vorteilen, z. B. „Darum passt GASTZILLA zum Kindergeburtstag“ (eigenes Feld wegen zum/zur/zu) |
| `benefits` | 3–4 × `{ title, text }`, anlass-spezifisch |
| `faq` | 3–4 × `{ question, answer }` |
| `updated` | Datum der letzten Textänderung (Sitemap `lastModified`) |

Texte beschreiben nur, was GASTZILLA tatsächlich kann. Keine erfundenen
Funktionen (z. B. kein „Halloween-Design“ – stattdessen vorhandene Designs
wie „Schwarz“ oder „Orange“ nennen), keine erfundenen Zahlen oder
Bewertungen. Anrede „du“ wie auf der restlichen Seite.

## Anlass-Seite (`src/app/einladung/[anlass]/page.tsx`)

Von oben nach unten:

1. `SiteHeader` (Logo)
2. Sichtbare Breadcrumb-Navigation „Startseite › Anlässe › <name>“
   (`<nav aria-label="Brotkrumen">`)
3. H1 (`title`) + `intro`
4. `AuthButtons` mit `registerLabel="Kostenlos starten"`
5. H2 `benefitsTitle` mit `benefits` als H3 + Text
6. H2 „So funktioniert's“ – die drei Schritte der Startseite, ausgelagert in
   eine gemeinsame Komponente `HowItWorks`
7. H2 „Häufige Fragen“ – `faq` als `<details>` wie auf der Startseite
   (gemeinsame Komponente `FaqList`)
8. H2 „Weitere Anlässe“ – Links zu allen anderen Anlass-Seiten; entfällt,
   solange es keine anderen gibt
9. `LegalLinks`

Layout und Karten-Stil wie `LandingContent` (`cardClass`).

**Metadaten:** `pageMetadata({ title: metaTitle, description, path })`.
**Vorschaubild:** `src/app/einladung/[anlass]/opengraph-image.tsx` mit
`renderOgCard` (Logo oben, `title` als Titel). Da `pageMetadata` das
OG-Bild explizit auf `/opengraph-image` setzt, bekommt es einen optionalen
Parameter für den Bildpfad.

**Strukturierte Daten** (`occasionStructuredData(occasion)` in
`src/lib/structured-data.ts`): `@graph` mit `WebPage` (name, description,
url, inLanguage, `isPartOf` → `/#website`, `about` → `/#app`),
`BreadcrumbList` (Startseite → Anlässe → Anlass) und `FAQPage`. Das
Ausgeben als `<script type="application/ld+json">` wandert in eine kleine
Komponente `JsonLd`, die auch `LandingContent` nutzt.

## Übersichtsseite (`src/app/einladung/page.tsx`)

H1 „Online-Einladungen für jeden Anlass“, kurze Einleitung, eine Karte pro
Anlass (`name`, `teaser`, Link), `AuthButtons`, `LegalLinks`. Schema:
`CollectionPage` + `BreadcrumbList` (Startseite → Anlässe). Eigene Metadaten
über `pageMetadata`.

## Startseite

Neuer Abschnitt „Für jeden Anlass“ in `LandingContent` zwischen „So
funktioniert's“ und „Häufige Fragen“: alle Anlässe aus `OCCASIONS` als
Chips (Link auf `/einladung/<slug>`) plus Link „Alle Anlässe →“ auf
`/einladung`.

## Weitere Anbindung

- **Sitemap:** `/einladung` (lastModified = jüngstes `updated`) und jede
  Anlass-Seite mit ihrem `updated`.
- **llms.txt:** Abschnitt „Anlässe“ mit `- [name](url): teaser`.
- **Wartungsmodus:** keine Änderung – die neuen Seiten zeigen wie die
  Startseite den Platzhalter.
- **robots.txt:** keine Änderung (alles unter `/einladung` ist erlaubt).

## Tests (Vitest)

- `occasions.test.ts`: IDs und Slugs eindeutig und URL-tauglich; keine leeren Texte;
  `description` ≤ 160 Zeichen; `metaTitle` endet auf „– GASTZILLA“; je 3–4
  `benefits` und `faq`; `updated` ist ein gültiges ISO-Datum.
- `structured-data.test.ts`: `occasionStructuredData` liefert Breadcrumb
  mit drei Einträgen und korrekten URLs sowie alle FAQ-Einträge.
- `sitemap.test.ts`: enthält `/einladung` und jede Anlass-Seite.
- Manuell im Browser: Überschriftenstruktur, JSON-LD, Links, 404 bei
  unbekanntem Slug, Mobil-Layout.

## Nicht enthalten

Anlass-Feld in der App, neue Designs, Bilder/Screenshots pro Anlass (siehe
`docs/seo-todo.md`), Vergleichs- und Preisseite.
