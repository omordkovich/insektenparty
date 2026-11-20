# Design-Vorschauseiten Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alle Designs mit Grafiken werden kostenpflichtig, heißen auf Deutsch deutsch und bekommen je eine öffentliche, im Design gestaltete Seite (de/en/ru) mit Beschreibung, passenden Anlässen und beiden Kaufoptionen; der Freischalten-Dialog verlinkt die Seite als „Vorschau“.

**Architecture:** Design-Sektionen pro Sprache (`/designs`, `/en/designs`, `/ru/dizajny`) laufen über die bestehenden Routen `src/app/[locale]/[section]/…`, die künftig zwischen Anlass- und Design-Sektion unterscheiden. Inhalte liegen in Datendateien analog zu den Anlässen. Die Seite setzt die Theme-Klasse selbst auf einen Wrapper (`data-theme-root`) und nutzt `ParallaxSideGraphics` und die aus `Header` herausgelöste Akzent-/Logo-Darstellung. „Mit diesem Design starten“ übergibt die Absicht per URL-Parameter und `localStorage` (überlebt den Login) an die Startseite, wo `CreateEventButton` den Dialog vorbelegt öffnet.

**Tech Stack:** Next.js 16 (App Router, statische Params), next-intl 4, Tailwind, Vitest, Cloudinary-Bilder.

**Spec:** `docs/superpowers/specs/2026-11-20-design-preview-pages-design.md`

## Global Constraints

- **Keine Commits, kein Push** (Owner committet selbst). Commit-Schritte entfallen.
- Premium = jedes Theme mit `plantsLeft`, `plantsRight`, `accentOne` oder `accentTwo` in `THEME_ASSETS`; frei bleiben genau `weiss`, `schwarz`, `gruen`, `blau`, `rot`, `pink`, `orange`, `gelb`.
- Preise nur aus `PRODUCTS` (`theme` 99 Cent, `paid_event` 299 Cent) über `formatPrice`.
- `baldVerfugbar` verschwindet aus Code und `messages/{de,en,ru}.json`.
- Jeder neue UI-Text in `messages/de.json`, `en.json`, `ru.json`; „du“; Englisch britisch.
- SEO-Regeln aus `.claude/skills/optimizing-seo-aeo-geo/SKILL.md`: `metaTitle` endet mit „– GASTZILLA“ (≤ 60 Zeichen), `metaDescription` ≤ 160 und einzigartig, genau eine H1, Truth-Check gegen `project-map.md`.
- Datei-Zeilenenden: CRLF in `src/lib/theme-presets.ts` (Edit-Tool benutzen).
- Selbst gestartete Dev-Server am Ende stoppen.

## Review Focus

1. **Login dazwischen:** abgemeldeter Besucher klickt „Mit diesem Design starten“, meldet sich (auch per Google/OAuth) an → der Erstellen-Dialog öffnet sich trotzdem mit dem Design. Test in Task 6 (`readStartIntent` aus `localStorage`, Ablauf nach 1 h).
2. **Sprachumschalter auf einer Design-Seite** führt auf dieselbe Design-Seite der anderen Sprache, nicht auf 404. Test in Task 3 (`translateDesignPath`).
3. **Fremde Sektion unter fremdem Präfix** (`/en/dizajny/…`, `/dizajny/…`) leitet auf die richtige Sprache um statt 404. Test in Task 3 (`sectionRedirect`).
4. **Ungültiger `?design=`-Wert** (Farbdesign, Tippfehler, gelöschtes Theme) öffnet nichts Kaputtes: unbekannt → ignoriert, Farbdesign → Dialog mit dem Design ohne Freischalten. Test in Task 6 (`parseStartIntent`).
5. **Kein Event mehr möglich** (Free-Event verbraucht, kein Guthaben) beim Start über die Design-Seite → Freischalten-Dialog „Event freischalten“ statt eines Erstellen-Dialogs, der beim Speichern scheitert. Test in Task 6 (`startView`).

---

### Task 1: Premium-Regel und deutsche Design-Namen

**Files:**
- Modify: `src/lib/theme-presets.ts` (`THEME_LABELS`, `THEME_LABELS_EN`, `PREMIUM_THEMES`)
- Modify: `src/lib/theme-presets.test.ts`, `src/lib/features.test.ts` (falls dort `natur`/`ballons` als einzige Premium-Themes angenommen werden)
- Modify: `.claude/skills/building-event-themes/SKILL.md` (Zeile 13 „Default: free“, Zeile 80 Label, Zeile 83 `PREMIUM_THEMES`)
- Modify: `src/components/EventDialog.tsx:319-321` (gesperrte Designs nicht mehr ausgrauen)

**Interfaces:**
- Produces: `PREMIUM_THEMES: readonly ThemeKey[]` (abgeleitet, Reihenfolge = `THEME_LABELS`), `isPremiumTheme(theme: ThemeKey): boolean`, `FREE_THEMES: readonly ThemeKey[]`.

- [ ] **Step 1: Failing tests** in `theme-presets.test.ts`:
  - `it("keeps exactly the colour designs free")`: `expect([...FREE_THEMES].sort()).toEqual(["blau","gelb","gruen","orange","pink","rot","schwarz","weiss"])`; `expect(PREMIUM_THEMES).toHaveLength(Object.keys(THEME_LABELS).length - 8)`.
  - `it("names every design in German")`: `themeLabel("halloweengraveyard","de") === "Halloween-Friedhof"`, `themeLabel("toycars","de") === "Spielzeugautos"`, `themeLabel("newyear","de") === "Silvester"`; English stays: `themeLabel("halloweengraveyard","en") === "Halloween Graveyard"`, `themeLabel("karnaval","en") === "Carnival"`.
  - In `GERMAN_NAMES` „Karnaval“ durch „Karneval“ ersetzen und die neuen deutschen Namen ergänzen (der bestehende Test „names every theme in English“ prüft dann, dass kein englischer Name deutsch ist).
- [ ] **Step 2:** `npx vitest run src/lib/theme-presets.test.ts` → FAIL.
- [ ] **Step 3: Implement.** `THEME_LABELS` gemäß Tabelle Spec 1a; für jedes umbenannte Theme den bisherigen Namen in `THEME_LABELS_EN` eintragen. `PREMIUM_THEMES = THEME_KEYS.filter(isPremiumTheme)` mit `isPremiumTheme = (t) => Boolean(a.plantsLeft || a.plantsRight || a.accentOne || a.accentTwo)` für `a = THEME_ASSETS[t]`. Die Konstante muss nach `THEME_ASSETS` stehen (heute steht `PREMIUM_THEMES` davor – verschieben). Kommentar über `PREMIUM_THEMES` anpassen.
- [ ] **Step 4:** `npx vitest run src/lib` → PASS (andere Tests, die `natur`/`ballons` als Premium voraussetzen, bleiben grün; Tests, die ein jetzt premium gewordenes Theme als frei voraussetzen, auf ein Farbdesign umstellen).
- [ ] **Step 5: Skill anpassen:** Zeile 13 → „Ein Theme mit Seiten- oder Schwebegrafiken ist automatisch premium; nur reine Farbdesigns sind frei. Zum Testen hat das Owner-Testkonto jedes Design (Schritt 5.4).“; Zeile 80 → „deutscher Name in `THEME_LABELS`, englischer in `THEME_LABELS_EN`, russischer in `THEME_LABELS_RU`“; Zeile 83 streichen; neuer Punkt unter „Code“: „Design-Seite: Inhalte in `designs-de.ts`/`-en.ts`/`-ru.ts` und Slugs in `design-slugs.ts` anlegen (sonst schlägt `designs.test.ts` fehl)“; neuer Punkt unter „Don'ts“: „Ein Theme nie ohne Weiterleitung seiner Design-Seiten (alle drei Sprachen) auf `/designs` entfernen (`next.config.ts`).“
- [ ] **Step 6: Design-Auswahl ohne Ausgrauen.** In der Design-Kachel des `EventDialog` entfällt `${selectable ? "" : "opacity-50"}`; das Schloss-Symbol oben rechts, `aria-disabled` und der `sr-only`-Text „gesperrt“ bleiben. Sichtprüfung in Task 8 (Logos voll farbig, Schloss sichtbar).

### Task 2: Datenmodell der Design-Seiten

**Files:**
- Create: `src/lib/design-slugs.ts`, `src/lib/designs.ts`, `src/lib/designs.test.ts`
- Create (leer typisiert, gefüllt in Task 4): `src/lib/designs-de.ts`, `src/lib/designs-en.ts`, `src/lib/designs-ru.ts`

**Interfaces:**
- Produces (`design-slugs.ts`):
  - `DESIGN_SECTION: Record<Locale, string> = { de: "/designs", en: "/designs", ru: "/dizajny" }`
  - `DESIGN_SLUGS: Partial<Record<ThemeKey, Record<Locale, string>>>` (Vollständigkeit für alle `PREMIUM_THEMES` prüft der Test) (de aus dem deutschen Namen, en aus dem englischen, ru transliteriert, z. B. `halloweengraveyard: { de: "halloween-friedhof", en: "halloween-graveyard", ru: "khellouin-kladbishche" }`)
  - `designSectionLanguage(locale: string, section: string): Locale | undefined`
  - `translateDesignPath(pathname: string, to: Locale): string | null` (gleiches Verhalten wie `translateOccasionPath`, inkl. geteilter Sektionsnamen de/en)
- Produces (`designs.ts`):
  - `type DesignContent = { theme: ThemeKey; metaTitle: string; metaDescription: string; title: string /* H1 */; teaser: string /* 1 Satz, Übersicht + llms.txt */; description: string[] /* 1–2 Absätze */; updated: string /* YYYY-MM-DD */ }`
  - `type Design = DesignContent & { locale: Locale; slug: string; name: string /* themeLabel */; occasionIds: string[] }`
  - `DESIGN_OCCASIONS: Partial<Record<ThemeKey, string[]>>` (2–5 Anlass-IDs aus `OCCASION_SLUGS`, sprachunabhängig)
  - `designsFor(locale): Design[]` (Reihenfolge `PREMIUM_THEMES`), `getDesignBySlug(slug, locale)`, `getDesign(theme, locale)`, `designPath(design): string`, `designPathFor(theme, locale): string`, `designsPath(locale): string`, `designAlternates(theme): Record<Locale,string>`, `designRouteParams(): { hubs; pages }`, `designBreadcrumbs(design)`, `designsHubBreadcrumbs(locale)`, `designsHub(locale): { title; metaTitle; description; intro }`, `latestDesignUpdate(locale)`.
- Consumes: `PREMIUM_THEMES`, `themeLabel` (Task 1), `OCCASION_SLUGS`.

- [ ] **Step 1: Failing tests** `designs.test.ts` (Muster `occasions.test.ts`), je Sprache parametrisiert:
  - jedes `PREMIUM_THEMES`-Theme hat genau einen Eintrag pro Sprache, kein Farbdesign hat einen;
  - Slugs eindeutig pro Sprache, nur `[a-z0-9-]`;
  - `metaTitle.endsWith("– GASTZILLA")`, `metaTitle.length <= 60`, `metaDescription.length <= 160`, alle Titel/Beschreibungen/Teaser pro Sprache einzigartig, keine leeren Texte, `updated` gültiges Datum;
  - jede ID in `DESIGN_OCCASIONS` existiert in `OCCASION_SLUGS`, 2–5 pro Design;
  - `designPathFor("halloweengraveyard","de") === "/designs/halloween-friedhof"`, `getDesignBySlug("halloween-friedhof","en") === undefined`;
  - `translateDesignPath("/designs/halloween-friedhof","en") === "/designs/halloween-graveyard"`, `translateDesignPath("/designs","ru") === "/dizajny"`, `translateDesignPath("/einladung","en") === null`.
  - Englische Texte ohne Umlaute, russische mit kyrillischem Anteil (wie in `occasions.test.ts`).
- [ ] **Step 2:** `npx vitest run src/lib/designs.test.ts` → FAIL.
- [ ] **Step 3: Implement** Slug-Tabelle, Funktionen und `DESIGN_OCCASIONS` (Anlass-Zuordnung nach Motiv: z. B. `halloweengraveyard: ["halloween","theme-party"]` – nur IDs, die es gibt). Inhaltsdateien exportieren `DESIGNS_DE: DesignContent[]` usw.; in Task 2 noch leer, deshalb bleiben die „hat Inhalt“-Tests bis Task 4 rot – alle anderen müssen grün sein.
- [ ] **Step 4:** `npx vitest run src/lib/designs.test.ts` → nur die Inhaltstests FAIL.

### Task 3: Routing, Sprachumschalter, Weiterleitungen

**Files:**
- Modify: `src/app/[locale]/[section]/page.tsx`, `src/app/[locale]/[section]/[slug]/page.tsx`, `src/app/[locale]/[section]/[slug]/opengraph-image.tsx`
- Modify: `src/i18n/switch-url.ts` (+ `switch-url.test.ts`), `src/proxy.ts` (+ Test der Weiterleitung, Muster vorhandener Proxy-Tests bzw. neu `src/proxy.test.ts`)

**Interfaces:**
- Consumes: Task 2 (`designSectionLanguage`, `getDesignBySlug`, `designRouteParams`, `translateDesignPath`, `DESIGN_SECTION`).
- Produces: `sectionRedirect(pathname: string): string | null` in `src/proxy.ts` (ersetzt `occasionRedirect`, prüft Anlass- und Design-Sektion); Views aus Task 5 werden hier nur eingehängt (`DesignPageView`, `DesignsHubView`, `designPageMetadata`, `designsHubMetadata`).

- [ ] **Step 1: Failing tests:** `languageSwitchHref("/designs/halloween-friedhof","","ru") === "/ru/dizajny/khellouin-kladbishche"`; `sectionRedirect("/dizajny") === "/ru/dizajny"`; `sectionRedirect("/en/dizajny/khellouin-kladbishche") === "/en/designs/halloween-graveyard"`; `sectionRedirect("/designs/halloween-friedhof") === null`; bestehende `occasionRedirect`-Fälle laufen unverändert über `sectionRedirect`.
- [ ] **Step 2:** `npx vitest run src/i18n src/proxy.test.ts` → FAIL.
- [ ] **Step 3: Implement.** `generateStaticParams` = Anlass-Params ∪ Design-Params; jede Seite fragt zuerst `sectionLanguage`, dann `designSectionLanguage`, sonst `notFound()`. Das OG-Bild ruft für Designs `renderSiteOgImage({ title: design.title, subtitle: t("ogSubtitle") })` (Namespace `designs`). `languageSwitchHref` nimmt `translateOccasionPath(...) ?? translateDesignPath(...) ?? pathname`.
- [ ] **Step 4:** Tests → PASS.

### Task 4: Texte für 33 Designs in drei Sprachen

**Files:**
- Modify: `src/lib/designs-de.ts`, `src/lib/designs-en.ts`, `src/lib/designs-ru.ts`

- [ ] **Step 1: Grafiken ansehen.** Für jedes Theme Logo, `plantsLeft`, `plantsRight`, Akzente (URLs in `THEME_ASSETS`) per Read/Browser ansehen und Motive, Farben, Stimmung notieren. Beschreibungen müssen zu dem passen, was zu sehen ist.
- [ ] **Step 2: Suchbegriffe** pro Design-Motiv prüfen: `python -X utf8 .claude/skills/optimizing-seo-aeo-geo/scripts/suggest.py "<motiv> einladung"` (en: `suggest_en.py`, ru: `suggest_ru.py`); H1 = Name + gesuchte Formulierung, z. B. „Halloween-Friedhof – Design für deine Halloween-Einladung“.
- [ ] **Step 3: Texte schreiben** (pro Design und Sprache: `metaTitle`, `metaDescription`, `title`, `teaser`, `description` 2–3 Sätze, `updated: "2026-11-20"`). Erster Satz der Beschreibung sagt, wie das Design aussieht; zweiter, wofür es passt; keine Funktionsversprechen außerhalb von `project-map.md`. Englisch/Russisch eigenständig geschrieben, nicht wörtlich übersetzt.
- [ ] **Step 4:** `npx vitest run src/lib/designs.test.ts` → PASS (alle Tests aus Task 2).

### Task 5: Design-Seite, Übersicht, Kaufoptionen

> **Reihenfolge:** Task 6 vor Task 5 ausführen – Task 5 nutzt `startHref`/`saveStartIntent`.

**Files:**
- Create: `src/components/FloatingAccents.tsx` (aus `Header.tsx` herausgelöst), `src/components/DesignPages.tsx` (`DesignPageView`, `DesignsHubView`, `designPageMetadata`, `designsHubMetadata`), `src/components/DesignPurchaseOptions.tsx` (Client)
- Modify: `src/components/Header.tsx` (nutzt `FloatingAccents`), `messages/{de,en,ru}.json` (Namespace `designs`)

**Interfaces:**
- Consumes: Task 2 (`Design`, `designsFor`, `designsHub`, Breadcrumb-Helfer), Task 6 (`startHref(intent: StartIntent, locale): string`, `saveStartIntent(intent)`), `PRODUCTS`, `formatPrice`, `isDummyPaymentEnabled()` (serverseitig beim Rendern gelesen und als Prop `dummyPayments` übergeben).
- Produces: `FloatingAccents({ accentOne?: string; accentTwo?: string })`; `DesignPurchaseOptions({ theme: ThemeKey; dummyPayments: boolean })`.

- [ ] **Step 1: `FloatingAccents` herauslösen** – identisches Markup/Klassen wie heute in `Header.tsx` (Konstanten mitnehmen), `Header` rendert sie. Event-Seite optisch unverändert (Sichtprüfung in Task 8).
- [ ] **Step 2: `DesignPageView`** (Server): äußerer `<div className={THEME_CLASS_NAMES[theme]} data-theme-root>` mit `relative flex min-h-dvh flex-col` und `style={{ isolation: "isolate" }}` (wie Event-Seite), darin `SiteHeader`, Kopfbereich mit `FloatingAccents` + Design-Logo (256 px, `alt` = Name), `Breadcrumbs`, H1 `design.title`, Absätze `design.description`, „Passt zu“-Chips mit Links auf `occasionPath(getOccasion(id, locale))`, `DesignPurchaseOptions`, Link „Alle Designs ansehen“ → `designsPath(locale)`, `LegalLinks`, `ParallaxSideGraphics` mit `plantsLeft/plantsRight`, `JsonLd` (Task 7). Der Text liegt auf `bg-[var(--surface)]`-Karten, damit er auf jedem Theme lesbar ist.
- [ ] **Step 3: `DesignPurchaseOptions`** (Client): zwei Karten. Karte 1: Überschrift `t("onlyThisDesign", { price })`, Text `t("forAllEvents")`, Knopf `t("startWithDesign")` → Intent `{ theme, paid: false }`. Karte 2: `t("wholeEvent", { price })`, Liste der Event-Extras (dieselben Keys wie `PAID_EVENT_FEATURE_KEYS` im `UnlockDialog`, dafür die Konstante nach `src/lib/products.ts` verschieben und exportieren), Knopf → `{ theme, paid: true }`. Klick: immer `saveStartIntent(intent)`; angemeldet → `window.location.assign(startHref(intent, locale))`; abgemeldet → `AuthDialog` (`initialMode="login"`, `afterLoginHref={startHref(intent, locale)}`) direkt auf der Design-Seite öffnen. Google-Login und E-Mail-Bestätigung landen ohne Parameter auf der Startseite – dort greift `readStartIntent()`. Mit `dummyPayments` und angemeldet (Login-Status wie `OccasionActions` aus `onAuthStateChange`): zusätzlich „Freischalten (Test, ohne Zahlung)“ → `POST /api/purchases` mit `{ product: "theme", theme }` bzw. `{ product: "paid_event" }`, danach Erfolgsmeldung `t("unlockedTest")`; Hinweis `eventDialog.testphaseEsWirdNichts` nur dann.
- [ ] **Step 4: `DesignsHubView`**: neutrales Layout wie `OccasionsHubView`, H1 `designsHub(locale).title`, Intro (Farbdesigns kostenlos, Premium-Designs einzeln oder im freigeschalteten Event mit Preisen), Raster aller `designsFor(locale)` mit Logo, Name, Teaser → `designPath`.
- [ ] **Step 5: Links auf die Übersicht:** in `OccasionsHubView` (Karte wie die Vergleichs-Karte, alle Sprachen) und im Footer-Linkblock `LegalLinks.tsx`.
- [ ] **Step 6:** `npx tsc --noEmit`, `npx eslint src`, `npx vitest run` → grün; `src/i18n/messages.test.ts` (Schlüssel-Parität) grün.

### Task 6: „Mit diesem Design starten“ bis in den Erstellen-Dialog (vor Task 5 ausführen)

**Files:**
- Create: `src/lib/start-intent.ts`, `src/lib/start-intent.test.ts`
- Modify: `src/app/[locale]/page.tsx` (`searchParams.design`, `searchParams.event`), `src/components/EventList.tsx`, `src/components/CreateEventButton.tsx`, `src/components/EventDialog.tsx` (Prop `initialTheme?: ThemeKey` nur im Modus `create`)

**Interfaces:**
- Produces:
  - `type StartIntent = { theme: ThemeKey; paid: boolean }`
  - `parseStartIntent(params: { design?: string | string[]; event?: string | string[] }): StartIntent | null` (unbekanntes Theme → `null`; `event === "paid"` → `paid: true`)
  - `startHref(intent, locale): string` → `localizedPath("/", locale) + "?design=<key>" + (paid ? "&event=paid" : "")`
  - `saveStartIntent(intent, now = Date.now())`, `readStartIntent(now = Date.now()): StartIntent | null` (Key `gastzilla:start-intent`, gültig 60 min, jeder Zugriff in try/catch), `clearStartIntent()`
  - `startView(intent: StartIntent, entitlements: UserEntitlements, creditBought: boolean): "create" | "unlock-credit"` – `"unlock-credit"`, wenn `paid && eventCredits === 0 && !creditBought` oder `!canCreateEvent(entitlements) && !creditBought`; sonst `"create"`.
- Consumes: `canCreateEvent` (`features.ts`), `localizedPath`.

- [ ] **Step 1: Failing tests** `start-intent.test.ts`: `parseStartIntent({ design: "halloweengraveyard", event: "paid" })` → `{ theme: "halloweengraveyard", paid: true }`; `parseStartIntent({ design: "gibtsnicht" })` → `null`; `parseStartIntent({ design: "weiss" })` → `{ theme: "weiss", paid: false }`; `readStartIntent` nach `saveStartIntent(i, 0)` mit `now = 59*60_000` → `i`, mit `now = 61*60_000` → `null`; `startHref({theme:"foam",paid:true},"en") === "/en?design=foam&event=paid"` (an `localizedPath` anpassen); `startView`: Free-Event frei + `paid:false` → `"create"`; Free-Event verbraucht, 0 Guthaben → `"unlock-credit"`; `paid:true`, 1 Guthaben → `"create"`; `paid:true`, 0 Guthaben → `"unlock-credit"`.
- [ ] **Step 2:** `npx vitest run src/lib/start-intent.test.ts` → FAIL.
- [ ] **Step 3: Implement** `start-intent.ts`.
- [ ] **Step 4: Einbau.** Startseite reicht `parseStartIntent(searchParams)` als `startIntent` an `EventList` → `CreateEventButton`. `CreateEventButton` nimmt beim Mount `startIntent ?? readStartIntent()`, ruft `clearStartIntent()`, entfernt `design`/`event` per `router.replace` aus der URL und öffnet `startView(...)`. Nach Kauf eines Guthabens öffnet sich `"create"` wie heute (`creditBought`). Bei `paid: true` und vorhandenem Guthaben erhält `EventDialog` `createPlan="paid"`. `EventDialog` (create) startet mit `initialTheme ?? THEME_KEYS[0]`; ist das Theme nicht wählbar, setzt ein einmaliger Effekt `setUnlockTarget({ kind: "theme", theme })` (vorhandener Kaufweg). Nicht angemeldet: den Login öffnet die Design-Seite selbst (Task 5); die Startseite ändert für abgemeldete Besucher nichts.
- [ ] **Step 5:** `npx vitest run`, `npx tsc --noEmit` → grün.

### Task 7: Freischalten-Dialog, SEO-Technik, Doku

**Files:**
- Modify: `src/components/UnlockDialog.tsx`, `messages/{de,en,ru}.json` (`baldVerfugbar` entfernen, `eventDialog.preview` neu)
- Modify: `src/lib/structured-data.ts` (+ Test), `src/app/sitemap.ts`, `src/app/llms.txt/route.ts`
- Modify: `.claude/skills/optimizing-seo-aeo-geo/project-map.md`, `docs/seo-todo.md`

**Interfaces:**
- Consumes: Task 2 (`designPathFor`, `designsFor`, `designsHub`, `designAlternates`, `latestDesignUpdate`, `designsPath`).
- Produces: `designStructuredData(design: Design)` → `WebPage` + `BreadcrumbList` (kein `Product`/`Offer`, solange nichts live kaufbar ist – Entscheidung des Plans, in `docs/seo-todo.md` als offener Punkt „Offer ergänzen, sobald Stripe live“), `designsHubStructuredData(locale)` → `CollectionPage` + `ItemList`.

- [ ] **Step 1: Failing tests:** `structured-data.test.ts`: `designStructuredData(getDesign("foam","de")!)` enthält `@type` `WebPage` und eine `BreadcrumbList` mit drei Einträgen (Startseite, Designs, Name); `designsHubStructuredData("en")` listet `PREMIUM_THEMES.length` Einträge. `messages.test.ts`/neuer Test: kein Schlüssel `baldVerfugbar` in irgendeiner Sprache.
- [ ] **Step 2:** Tests → FAIL.
- [ ] **Step 3: `UnlockDialog`:** `renderAction` gibt ohne Guthaben und ohne Dummy `null` zurück (Preis steht schon in der Überschrift/Preiszeile). Die Theme-Kachel bekommt rechts einen Link `t("preview")` → `designPathFor(theme, locale)` mit `localizedPath`, `target="_blank" rel="noopener"`, Stil `buttonClassName("outline")` klein. Hinweis `testphaseEsWirdNichts` nur bei `dummyPayments`.
- [ ] **Step 4: SEO-Technik:** `designPageMetadata`/`designsHubMetadata` über `pageMetadata()` mit `languageAlternates(designAlternates(theme))` bzw. `DESIGN_SECTION`; Sitemap: Übersicht + alle Seiten je Sprache mit `lastModified` aus `updated`; llms.txt: deutscher Abschnitt „Designs“ (Übersicht + jede Seite mit Teaser), in den Sprachabschnitten en/ru je ein Link auf die Übersicht.
- [ ] **Step 5: Doku:** `project-map.md` → Design-Regel: „Einzelne Designs nur auf den Design-Seiten und der Übersicht nennen; sonst allgemein. Preise (0,99 € Design, 2,99 € Event) dürfen genannt werden.“ Verifizierte Funktionsliste: „keine Preise nennen“ streichen. `docs/seo-todo.md`: Eintrag 2026-11-20 mit dem Umfang und dem Offer-Punkt. Danach `npx tsx .claude/skills/optimizing-seo-aeo-geo/scripts/audit-occasions.mts` → OK.
- [ ] **Step 6:** `npx vitest run`, `npx tsc --noEmit`, `npx eslint src` → grün.

### Task 8: Prüfung im Browser

- [ ] **Step 1:** Dev-Server (`preview_start` `insektenparty-dev` oder vorhandener auf :3000 nur lesend). Öffnen: `/designs`, `/designs/halloween-friedhof`, `/en/designs/halloween-graveyard`, `/ru/dizajny/<slug>` sowie je ein helles (`ballons`) und ein dunkles Design (`halloweengraveyard`). Prüfen: Theme-Hintergrund, Seitengrafiken, Akzente, Lesbarkeit, genau eine H1, Canonical + hreflang im `<head>`, JSON-LD-Typen, 375 px ohne horizontales Scrollen, Sprachumschalter.
- [ ] **Step 2:** Event-Seite `/event/milans7BD` unverändert (Akzente im Header).
- [ ] **Step 3:** Abgemeldet „Mit diesem Design starten“ → Anmelde-Dialog. Vollständiger Weg mit Login und Freischalten-Dialog mit Vorschau-Link braucht ein Konto – dem Owner sagen, was nicht selbst geprüft wurde.
- [ ] **Step 4:** Selbst gestarteten Server stoppen.
