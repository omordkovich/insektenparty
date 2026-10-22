# SEO & KI-Sichtbarkeit – To-do

Stand: 2026-10-22

## Erledigt (im Code)

- [x] Strukturierte Daten auf der Startseite: Organization, WebSite, WebApplication (mit Funktionsliste) und FAQPage (`src/lib/structured-data.ts`)
- [x] FAQ in eine gemeinsame Quelle ausgelagert (`src/lib/faq.ts`), damit Startseite, Schema und llms.txt immer gleich sind
- [x] `/llms.txt` für KI-Assistenten (`src/app/llms.txt/route.ts`)
- [x] App-Icons für Google-Suche und Homescreen: `src/app/icon.png` (512 px), `src/app/apple-icon.png` (180 px)
- [x] Deutsche 404-Seite (`src/app/not-found.tsx`)
- [x] Sitemap mit `lastModified` – **bei Textänderungen das Datum in `src/app/sitemap.ts` anpassen**
- [x] Footer-Links als `<nav>` (Landmark für Screenreader und Crawler)
- [x] `/sitemap.xml` und `/llms.txt` bleiben auch im Wartungsmodus erreichbar
- [x] H1, Seitentitel und Vorschaubild: „Online-Einladung & Gästeliste kostenlos erstellen“
- [x] Anlass-Seiten: Vorlage `/einladung/<slug>`, Übersicht `/einladung`, Abschnitt „Für jeden Anlass“ auf der Startseite, Sitemap, llms.txt, Schema (WebPage, BreadcrumbList, FAQPage) – 28 Anlässe: Kindergeburtstag, Spielverabredung, Einschulung & Schulstart, Kita- & Schulfeste, Abifeier & Abiball, Geburtstag, Hochzeit, Junggesellenabschied, Babyparty & Gender Reveal, Taufe & Kommunion, Trauerfeier & Beerdigung, Firmenfeier, Grillparty & Gartenfest, Karneval, Oktoberfest, Halloweenparty, Advent & Weihnachtsmarkt, Familienfest & Feiertage, Silvester, Mottoparty, Gruppenreise & Vereinsfahrt, Kultur, Proben & Auftritte, Ausgehen, Sport zusammen, Tabletop & Brettspiele, Gaming & LAN-Party; jede Seite mit Einladungstext-Vorlage zum Kopieren und eigenen, anlass-spezifischen FAQ und Vorteilen (keine Doppelungen) – **neue Anlässe = ein Eintrag in `src/lib/occasions.ts`**

- [x] Terminabstimmung (2026-10-09): eigene Seite `/einladung/terminabstimmung` für „Termin abstimmen“, „Terminumfrage“, „gemeinsamen Termin finden“ (Titel, Beschreibung, FAQ-Schema); Start-FAQ, Funktionsliste, Meta-Beschreibung der Startseite, llms.txt und die Anlass-Seiten JGA, Familienfest, Gruppenreise, Kultur, Proben, Ausgehen, Sport, Tabletop, Gaming, Firmenfeier ergänzt
- [x] Terminbestätigung zum Teilen (2026-10-09): Start-FAQ, Funktionsliste, Vorteil „Teilen, wo deine Gäste sind“, llms.txt und `/einladung/terminabstimmung` (Beschreibung, Einleitung, Vorteil, neue FAQ „Wie teile ich allen den festgelegten Termin mit?“)

- [x] GEO-Ausbau (2026-10-14): Vergleichsseite `/vergleich` („WhatsApp-Umfrage, Doodle oder GASTZILLA?“, FAQ aus echten Suchanfragen wie „doodle einladung erstellen kostenlos“, „wie terminumfrage whatsapp“) – Inhalt in `src/lib/comparison.ts`, verlinkt von der Anlass-Übersicht `/einladung`, „Über uns“, llms.txt, Sitemap; Liste „Was GASTZILLA nicht kann“ (`LIMITATIONS` in `src/lib/structured-data.ts`) auf `/vergleich` und in llms.txt; sichtbares „Aktualisiert am“ auf Anlass-Seiten, `/vergleich` und „Über uns“; AboutPage-Schema + Kontakt auf „Über uns“; falsche Funktionsangabe „Designs für verschiedene Anlässe“ korrigiert

- [x] Design-Formulierung (2026-10-22): überall „Designs für jeden Anlass – Farbdesigns kostenlos, dazu kostenpflichtige Premium-Designs“; keine einzelnen Design- oder Farbnamen und keine Anzahl mehr (Funktionsliste, Start-FAQ, llms.txt, `/vergleich`, Anlass-FAQ Karneval, Oktoberfest, Halloween, Mottoparty, Trauerfeier); „Keine Designs für bestimmte Anlässe“ aus „Was GASTZILLA nicht kann“ entfernt. **Live erst nach dem nächsten Deploy** – `gastzilla.de/llms.txt` zeigt bis dahin noch „Acht Farbdesigns …“

## Du selbst (Dashboards & Konten)

- [x] **Datenbank-Migration Event-Adressen, Schritt 1** – eingespielt am 2026-10-07
- [ ] **Schritt 2 nach dem Deploy** – `supabase/migrations/2026-10-07-2-event-slug-key-not-null.sql` ausführen
- [ ] **Wartungsmodus beenden**, sobald es geht (`MAINTENANCE_MODE` in Vercel entfernen + Redeploy). Solange die Startseite 503 liefert, wird sie nicht indexiert.
- [ ] **Vercel → Domains → www.gastzilla.de**: Weiterleitung von 307 (temporär) auf **308 (permanent)** umstellen
- [ ] **Google Search Console**: Domain-Property `gastzilla.de` anlegen (DNS-TXT-Eintrag), Sitemap `https://gastzilla.de/sitemap.xml` einreichen
- [ ] **Bing Webmaster Tools**: Seite hinzufügen (kann aus der Search Console importiert werden), Sitemap einreichen – Bing ist die Datenbasis für ChatGPT-Suche und Copilot
- [ ] Nach dem Livegang testen:
  - [Rich Results Test](https://search.google.com/test/rich-results) mit `https://gastzilla.de`
  - [Schema Validator](https://validator.schema.org/)
  - [PageSpeed Insights](https://pagespeed.web.dev/) (Core Web Vitals, mobil)
- [ ] Prüfen, dass im Vercel-Firewall kein „AI Bots“-Block aktiviert wird (aktuell kommen GPTBot, ClaudeBot, PerplexityBot durch)

## Offene Entscheidungen (mit mir abstimmen)

- [x] Instagram @gastzilla (2026-10-14): `INSTAGRAM_URL` in `src/lib/site.ts` → `sameAs` im Organization-Schema, Footer-Links (alle Seiten inkl. Event-Seiten), „Über uns“, llms.txt, Wartungsseite. Weitere Profile (LinkedIn, …) genauso ergänzen
- [ ] Screenshot einer Beispiel-Einladung → als `screenshot` ins Schema und auf die Startseite
- [ ] Seite `/preise`, sobald das Bezahlmodell steht (Stripe ist pausiert)
- [ ] Nach 2–3 Monaten Search Console: ranken zwei Anlass-Seiten auf dieselben Begriffe → zusammenlegen + Weiterleitung
- [ ] FAQ der Anlass-Seiten: basieren seit 2026-10-08 auf echten Google-Suchanfragen (Autovervollständigung). Für Kultur, Proben, Advent, Halloween, Sport gab es kaum Daten → nach dem Livegang mit echten Suchanfragen aus der Search Console nachschärfen; jährlich wiederholen
- [ ] „Über uns“: persönliche Geschichte ergänzen (warum gebaut, seit wann, für wen) – nur mit echten Angaben von dir
- [ ] `/vergleich`: Angaben zu WhatsApp/Doodle jährlich prüfen (Stand-Hinweis auf der Seite), nach dem Livegang Suchanfragen aus der Search Console einarbeiten
- [ ] Nach dem Livegang mit echten Daten: anonymisierte Kennzahlen (z. B. typische Zusagequote, wie früh eingeladen wird) als zitierbare Quelle – nur nach Datenschutz-Check, nie geschätzt
- [ ] Nach dem Livegang in der Search Console beobachten, ob `/einladung/terminabstimmung` für „Termin abstimmen“ / „Terminumfrage“ erscheint; ggf. Titel und FAQ an die echten Suchanfragen anpassen

## Außerhalb der Seite (für KI-Empfehlungen am wichtigsten)

KI-Assistenten empfehlen vor allem, was anderswo erwähnt wird.

- [ ] Eintrag in Verzeichnissen und Produktlisten (z. B. Product Hunt, alternativeTo, deutsche Tool-Listen)
- [ ] Erwähnungen in Eltern-, Hochzeits- und Event-Blogs, Foren, Reddit (r/de, Eltern-Communities)
- [ ] Weitere Social-Media-Profile anlegen; im Instagram-Profil gastzilla.de als Link eintragen (Verknüpfung in beide Richtungen)
- [ ] Nach den ersten Nutzern: echte Bewertungen sammeln (z. B. Trustpilot) – **keine** erfundenen Bewertungen ins Schema
