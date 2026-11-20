# Design-Vorschauseiten und Premium-Designs

**Datum:** 2026-11-20
**Status:** Freigegeben (2026-11-20)
**Baut auf:** `2026-11-02-free-event-and-expiry-design.md` (Free-Event,
`paid_event`-Guthaben, Einzeldesign 0,99 €, Dummy-Käufe `PAYMENTS_DUMMY`),
`2026-10-06-occasion-landing-pages-design.md` (Anlass-Seiten, Sektionen pro
Sprache)

## Warum

Wer heute im Event-Dialog auf ein gesperrtes Design klickt, sieht nur ein
kleines Fenster mit Logo, Namen und zwei Preisen. Wie das Design wirkt, sieht
man nicht. Außerdem gibt es keine öffentliche Seite, über die jemand ein
Design bei Google oder per geteiltem Link findet.

Gleichzeitig ändert sich das Angebot: **Alle Designs mit schwebenden/seitlichen
Grafiken werden kostenpflichtig**, nur die schlichten Farbdesigns bleiben
kostenlos.

## Entscheidungen des Owners (2026-11-20)

- Jedes kostenpflichtige Design bekommt eine **öffentliche Seite**, die
  **im Stil des Designs** gestaltet ist (wie eine echte Event-Seite: Theme-
  Klasse, Hintergrund, seitliche/schwebende Grafiken, Farben, Schrift).
- **Kein erfundenes Beispiel-Event.** Inhalt: kurze **Beschreibung des
  Designs**, **mögliche Anlässe**, **alle Kaufoptionen**.
- Texte in **allen 3 Sprachen** (de, en, ru).
- **Premium = alle Designs außer den 8 Farbdesigns** (`weiss`, `schwarz`,
  `gruen`, `blau`, `rot`, `pink`, `orange`, `gelb` – genau die Themes ohne
  `plantsLeft`/`plantsRight`/`accentOne`/`accentTwo`). Das sind heute 33
  Designs. Farbdesigns bekommen keine Seite.
- **Preise zeigen, „Bald verfügbar“ entfällt** – auf den neuen Seiten und im
  Freischalten-Dialog.
- Ohne Zahlungsmöglichkeit (Dummy aus, Stripe pausiert): **Preis plus Knopf
  „Mit diesem Design starten“**. Ist der Dummy-Kauf an, zusätzlich der
  Test-Knopf wie heute.
- In der Design-Auswahl sind gesperrte Designs **nicht ausgegraut**; sie
  zeigen nur das Schloss-Symbol wie heute.
- Im Freischalten-Dialog bekommt die Kachel mit Logo und Namen einen Knopf
  **„Vorschau“**, der die Seite **in einem neuen Tab** öffnet (Dialog-Eingaben
  bleiben erhalten).

## Ziele

1. 33 Design-Seiten, je Sprache unter der eigenen Sektion, indexierbar.
2. Jede Seite zeigt das Design so, wie Gäste es auf einer Event-Seite sehen.
3. Jede Seite zeigt beide Kaufwege mit Preis und führt immer weiter (nie eine
   Sackgasse).
4. Aus dem Freischalten-Dialog ist die Seite mit einem Klick erreichbar, ohne
   dass Eingaben verloren gehen.
5. `PREMIUM_THEMES` folgt der neuen Regel.

## Nicht-Ziele

- Kein Kauf mit echtem Geld (Stripe bleibt pausiert).
- Keine Beispiel-Events, Beispielgäste, Screenshots.
- Keine Seiten für Farbdesigns.
- Keine Bundles oder neuen Produkte; Preise bleiben 0,99 € (Design) und
  2,99 € (Event) aus `src/lib/products.ts`.
- Keine Änderung der AGB/Widerrufstexte (sie sprechen bereits allgemein von
  „Premium-Designs“, `TermsDe.tsx` Z. 47–49; in en/ru ebenso prüfen).

## Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft)

- Die Vorschau sieht anders aus als eine echte Event-Seite im selben Design.
- Ein Klick im Event-Dialog wirft den Nutzer aus dem Dialog und Eingaben
  gehen verloren.
- Ein Knopf, der nichts tut, oder „Bald verfügbar“ als Endstation.
- 33 × 3 fast gleiche Texte (Duplicate Content) oder Beschreibungen, die
  nicht zu den Grafiken passen.
- Falsche Funktionsversprechen (siehe Truth-Check im SEO-Skill).

## Ansätze

| Ansatz | Was | Abwägung |
|---|---|---|
| **A – Event-Seiten-Bausteine im Theme (gewählt)** | Neue Seite nutzt dasselbe Theming wie `/event/[slug]` (Theme-Klasse über `HtmlShell`, `ParallaxSideGraphics`, Hero-Stil), Inhalt aber Beschreibung + Anlässe + Kaufoptionen | Sieht automatisch aus wie die echte Seite, neue Designs bekommen ihre Seite fast gratis; mittlerer Aufwand |
| B – eigene Schauseite | Nachgebaute Seite mit Logo/Farben | Schneller, driftet aber von der echten Seite weg |
| C – Screenshots | Bild je Design | Bei 33 Designs Pflegeaufwand bei jeder Änderung; verworfen |

Der Owner hat A gewählt, ohne Beispiel-Event (statt dessen Beschreibung +
Anlässe).

## Wie es heute ist

- `PREMIUM_THEMES = ["natur", "ballons"]` (`src/lib/theme-presets.ts`).
  `resolveEntitlements` (`src/lib/features.ts`) gibt Nicht-Premium-Themes
  immer frei, Premium nur mit `theme:<key>`-Eintrag; ein bezahltes Event darf
  alle Themes (`unlockedThemesFor`). Im Bearbeiten-Modus bleibt das aktuelle
  Theme wählbar (`isThemeSelectable`, „grandfathered“).
- `UnlockDialog` (`src/components/UnlockDialog.tsx`), `kind: "theme"`: Kachel
  mit Logo + Name, darunter „Nur dieses Design“ (0,99 €, `product: "theme"`)
  und „Ganzes Event freischalten“ (2,99 €, `event_upgrade` bzw. `paid_event`).
  Ohne Guthaben und ohne Dummy: Text `baldVerfugbar`.
- Anlass-Seiten: `src/app/[locale]/[section]/[slug]/page.tsx`, Sektion pro
  Sprache aus `OCCASION_SECTION` (`src/lib/occasion-slugs.ts`),
  `dynamicParams = false`, Inhalte in `src/lib/occasions.ts` /
  `occasions-en.ts` (ru siehe dort).
- Event-Seite: `src/app/event/[slug]/layout.tsx` setzt
  `THEME_CLASS_NAMES[theme]` über `HtmlShell`; `page.tsx` setzt `Header`,
  `Hero`, `ParallaxSideGraphics`, `GuestSection`, `Footer` zusammen.

## Design

### 1. Premium-Regel

`PREMIUM_THEMES` wird aus `THEME_ASSETS` abgeleitet: ein Theme ist Premium,
wenn es mindestens eine der Grafiken `plantsLeft`, `plantsRight`,
`accentOne`, `accentTwo` hat. Test: genau die 8 Farbdesigns sind frei.
Bestehende Events mit jetzt gesperrtem Design behalten es (bestehende
Grandfathering-Regel). Alle heutigen Konten sind Testkonten, keine
Migration/Benachrichtigung nötig.

Die Regel geht **sofort live**, auch wenn auf der Live-Seite weder Testkauf
noch Stripe an ist. Der Owner nimmt hin, dass bis dahin niemand ein
Premium-Design kaufen kann (Freischalten-Dialog zeigt nur Preise). Kein
Feature-Schalter.

Ausnahme: Das Konto `nail.toy.creations@gmail.com` bekommt für alle 33
Premium-Designs je einen `theme:<key>`-Eintrag in `user_entitlements`
(Quelle wie ein manueller Eintrag, kein Kauf). Alle anderen Konten bleiben
unverändert.

Die DB-Constraint prüft nur das Muster `theme:%` – keine Schema-Änderung.

### 1a. Deutsche Design-Namen

Owner-Entscheidung: Auf Deutsch heißen alle Designs deutsch – überall in der
App (Design-Auswahl, Freischalten-Dialog, Design-Seiten). `THEME_LABELS`
(de) wird übersetzt; da `THEME_LABELS_EN` heute nur die deutsch benannten
Themes übersetzt, braucht es dann für jedes Theme mit geändertem Namen einen
englischen Eintrag (bisheriger Name). Russisch bleibt wie es ist. Vorschlag
(der Owner kann einzelne Namen ändern):

| Key | heute | neu (de) |
|---|---|---|
| foam | Foam | Schaumparty |
| halloweenclay | Halloween Clay | Halloween-Knete |
| halloweengraveyard | Halloween Graveyard | Halloween-Friedhof |
| halloweenkids | Halloween Kids | Halloween für Kinder |
| christmaskids | Christmas Kids | Weihnachten für Kinder |
| christmassnow | Christmas Snow | Weihnachtsschnee |
| artdeco | Art Deco | Art déco |
| newyear | New Year | Silvester |
| birthdaypresents | Birthday Presents | Geburtstagsgeschenke |
| birthdayprincess | Birthday Princess | Prinzessin |
| penandpaper | Pen & Paper | Rollenspiel |
| magic | Magic | Zauberei |
| pirates | Pirates | Piraten |
| pirateskids | Pirates Kids | Piraten für Kinder |
| teddy | Teddy | Teddybär |
| cinema | Cinema | Kino |
| karnaval | Karnaval | Karneval |
| toycars | Toy Cars | Spielzeugautos |

Unverändert, weil schon deutsch bzw. im Deutschen üblich: Ballons, Disco,
Hippie, Tarot, Pride, Dinosaurier, Weltall, Einschulung, Ninja, Fußball,
Hochzeit, Brettspiele, Bowling, Hawaii, Natur und die Farbdesigns. Der
Skill `building-event-themes` bekommt den Hinweis, neue Themes deutsch zu
benennen.

### 2. URLs

Eigene Sektion pro Sprache, analog zu `OCCASION_SECTION`:

| Sprache | Übersicht | Design-Seite |
|---|---|---|
| de | `/designs` | `/designs/<slug>` |
| en | `/en/designs` | `/en/designs/<slug>` |
| ru | `/ru/dizajny` | `/ru/dizajny/<slug>` |

Slugs pro Sprache lesbar und suchbegriffnah (z. B. de `halloween-friedhof`,
en `halloween-graveyard`), in einer Slug-Tabelle analog zu
`OCCASION_SLUGS`. Der Sprachumschalter übersetzt die Pfade (wie
`translateOccasionPath`). Wird ein Design entfernt, bekommt seine Seite eine
Weiterleitung auf die Übersicht.

### 3. Übersichtsseite `/designs`

Raster aller Premium-Designs (Logo, Name, ein Satz) mit Links auf die
Einzelseiten, dazu ein kurzer Absatz: Farbdesigns kostenlos, Premium-Designs
einzeln (0,99 €) oder im freigeschalteten Event (2,99 €) enthalten.
Neutrales Seiten-Layout (kein Theme). Verlinkt aus Footer und Anlass-
Übersicht.

### 4. Design-Seite

Seite im Theme des Designs (Theme-Klasse auf der Seiten-Wurzel, seitliche und
schwebende Grafiken wie auf der Event-Seite). Aufbau von oben:

1. Header (wie öffentliche Seiten, mit Sprachumschalter), Breadcrumbs
   „Designs › <Name>“.
2. Hero im Event-Stil: Logo des Designs, H1 mit dem Design-Namen aus
   `themeLabel(key, locale)` + Suchbegriff (z. B. „Halloween-Friedhof –
   Design für deine Halloween-Einladung“), damit Dialog-Kachel und Seite
   denselben Namen zeigen; Slugs ebenfalls aus dem Namen der Sprache
   (z. B. de `halloween-friedhof`, en `halloween-graveyard`). Darunter die
   Beschreibung
   (2–3 Sätze: Stimmung, Farben, Motive – aus den Grafiken abgeleitet).
3. „Passt zu“: 2–5 Anlässe, verlinkt auf die Anlass-Seiten der jeweiligen
   Sprache (nur existierende Anlass-IDs, Build/Test prüft das).
4. Kaufoptionen, zwei Karten:
   - **Nur dieses Design – 0,99 €**: „für alle deine Events“.
   - **Ganzes Event freischalten – 2,99 €**: alle Designs inklusive +
     die bekannten Extras (`PAID_EVENT_FEATURE_KEYS`).
   - Haupt-Knopf je Karte bzw. gemeinsam: **„Mit diesem Design starten“**
     (siehe 5). Mit `PAYMENTS_DUMMY` zusätzlich „Freischalten (Test, ohne
     Zahlung)“ für angemeldete Nutzer.
   - Hinweis-Zeile wie im Dialog nur, solange der Dummy an ist.
5. Kurzer Link „Alle Designs ansehen“ → Übersicht; Footer.

Die Seite ist statisch erzeugt (alle Designs × Sprachen), Kauf-/Login-Zustand
kommt clientseitig dazu, damit die Seite cachebar bleibt.

### 5. „Mit diesem Design starten“

*(Eigene Entscheidung nach Builder-Check, korrigierbar.)* Ein Knopf pro
Karte, beide führen auf die Startseite der Sprache:

- Karte „Nur dieses Design“ → `/?design=<themeKey>`: „Event erstellen“-
  Dialog mit dem Design vorausgewählt. Ist es gesperrt, öffnet sich darüber
  der Freischalten-Dialog für dieses Design (der normale Kaufweg).
- Karte „Ganzes Event“ → `/?design=<themeKey>&event=paid`: derselbe Dialog,
  aber im Modus bezahltes Event (Guthaben nutzen bzw. kaufen).
- Nicht angemeldet → Anmelde-Dialog; Parameter bleiben über den Login
  erhalten.
- Kein Event mehr möglich (kein Free-Event, kein Guthaben) → der bestehende
  Weg für „Event freischalten“.
- Wer das Design für ein **bestehendes** Event will, kauft es über diesen Weg
  (gilt für alle Events) und stellt es danach in den Event-Einstellungen um.
  Ein eigener Einstieg „in bestehendes Event übernehmen“ ist Nicht-Ziel.

### 6. Freischalten-Dialog

- `baldVerfugbar` entfällt in allen drei Sprachen. Ohne Guthaben und ohne
  Dummy zeigt jede Option ihren Preis und keinen toten Knopf; der Dialog wird
  ja schon aus der App heraus geöffnet, „Mit diesem Design starten“ ergibt
  dort keinen Sinn. (Builder: Preis + Hinweis „Zahlung bald möglich“ ist
  **nicht** gewünscht – es bleibt beim Preis ohne Zusatz.)
- Kachel mit Logo/Name (nur `kind: "theme"`) bekommt rechts einen Link-Knopf
  **„Vorschau“** → Design-Seite der aktuellen Sprache, `target="_blank"`,
  `rel="noopener"`.

### 7. Texte

- Pro Design und Sprache: `metaTitle` (endet mit „– GASTZILLA“, ≤ 60
  Zeichen), `metaDescription` (≤ 160, einzigartig), H1, Beschreibung,
  Anlass-IDs (sprachunabhängig, einmal pro Design).
- Ablage in einer eigenen Datei analog zu den Anlässen (z. B.
  `src/lib/designs.ts`, `designs-en.ts`, `designs-ru.ts`), UI-Texte
  (Knöpfe, Überschriften) in `messages/*.json`.
- Englisch für englische Suchen geschrieben (britische Schreibweise), nicht
  wörtlich übersetzt; Russisch ebenso eigenständig.
- Beschreibungen aus den echten Grafiken ableiten (Bilder ansehen), keine
  Standardfloskeln; jede Beschreibung einzigartig.
- Truth-Check: nur Funktionen aus der verifizierten Liste
  (`project-map.md`).

### 8. SEO-Technik

- `pageMetadata()` mit Canonical und hreflang für alle drei Sprachen.
- JSON-LD: `BreadcrumbList`; für die Einzelseite `Product` mit `Offer`
  (Preis EUR) – Builder prüft, ob ein Offer ohne echte Kaufmöglichkeit
  vertretbar ist, sonst nur `WebPage`/`CreativeWork`.
- Sitemap (+ Datumskonstante), llms.txt-Abschnitt „Designs“, OG-Bild pro
  Design (Logo + Name im Theme-Farbton).
- Ausnahme von der SEO-Regel „keine einzelnen Designs nennen“: gilt für
  die Design-Seiten und die Übersicht. Alle anderen Texte (Startseite,
  Anlass-Seiten, FAQ, llms.txt außerhalb des Design-Abschnitts) bleiben
  allgemein. `project-map.md` und `docs/seo-todo.md` entsprechend
  aktualisieren; die Regel „keine Preise nennen“ entfällt für Designs
  und Events (Owner-Entscheidung).

### 9. Tests

- `PREMIUM_THEMES`: genau die 8 Farbdesigns frei, alle anderen premium.
- Jedes Premium-Design hat Texte in allen drei Sprachen und einen Slug je
  Sprache; Slugs eindeutig; alle Anlass-IDs existieren.
- Meta-Längen und Einzigartigkeit (Audit-Skript erweitern oder eigenes).
- `UnlockDialog`: kein `baldVerfugbar` mehr; Vorschau-Link zeigt auf die
  richtige Sprache.
- Sichtprüfung auf dem Dev-Server: mehrere Designs in allen drei Sprachen,
  375 px, Sprachumschalter, Knopf-Wege angemeldet/abgemeldet.

## Dem Builder überlassen

- Wie die Event-Bausteine (Hero, `ParallaxSideGraphics`) ohne Event-Daten
  genutzt werden (Props aufteilen oder kleine Präsentations-Komponente).
- Wie `?design=` auf der Startseite den Dialog öffnet und nach dem Login
  erhalten bleibt.
- Genaue Slugs, Reihenfolge in der Übersicht, OG-Bild-Gestaltung.
- Ob die Übersicht Anlass-Filter bekommt (nicht nötig).
