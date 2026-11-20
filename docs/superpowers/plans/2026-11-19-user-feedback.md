# Nutzer-Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bewertungs-Banner auf der Startseite, Feedback-Mail an Gastgeber nach dem Event, Feedback-Seite und Freigabe/Löschen per Admin-Mail.

**Architecture:** Neue Tabelle `reviews` ohne Bezug zu Event/Konto; zwei Sent-/Submitted-Spalten auf `events`. Alle Links (Feedback, Moderation, Abmelden) sind HMAC-signierte Tokens (`FEEDBACK_SECRET`). Der bestehende tägliche Lifecycle-Cron verschickt die Feedback-Mail. Zustandsänderungen nur per POST; Seiten mit Token zeigen nur an.

**Tech Stack:** Next.js 16 (App Router), next-intl 4, Drizzle + postgres, Supabase (Migration per SQL-Datei), nodemailer, Zod 4, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-19-user-feedback-design.md`

## Global Constraints

- **Keine Commits, kein Push** (Owner committet selbst). Commit-Schritte entfallen.
- Sprachen: jede neue Nutzer-Text-Zeile in `messages/de.json`, `en.json`, `ru.json`; Englisch britisch, „du“ im Deutschen. Moderationsseite + Admin-Mail nur Deutsch.
- Rechtstexte: alle drei Sprachen gleichzeitig, `PRIVACY_VERSION = "2026-11-19"`, `legal-parity.test.ts` grün.
- Bewertungstext 20–200 Zeichen nach `trim`; Name mit `personNameSchema` (2–100 Zeichen, wie Kontoname).
- Sterne 1–5 (Ganzzahl).
- Feedback-Link gilt 30 Tage ab Versandtag; Moderations- und Abmelde-Links laufen nicht ab.
- Feedback-Mail nur: `dateMode = 'fixed'`, `eventDate` gesetzt, Stage `over`, ≥ 1 Gast mit `declined = false`, beide Feedback-Spalten leer, Owner mit E-Mail und `feedbackMails !== false`.
- Admin-Empfänger `process.env.FEEDBACK_ADMIN_EMAIL ?? "info@gastzilla.de"`.
- Ohne `FEEDBACK_SECRET`: keine Feedback-Mails, alle Token gelten als ungültig.
- Feedback-Seiten `noindex`, nicht in Sitemap/llms.txt; kein Review-JSON-LD.
- Beispiele: 6 pro Sprache, sichtbar „(Beispiele)“ gekennzeichnet, nur verifizierte Features (`.claude/skills/optimizing-seo-aeo-geo/project-map.md`).
- Namens-Fallback: de „Gastgeber:in“, en „Host“, ru „Организатор“.

## Review Focus

- Mail-Scanner öffnet Posten-/Löschen-/Abmelde-Link per GET → es darf sich nichts ändern (Seiten rufen nur Lese-Funktionen auf; Tests in Task 7/8 prüfen, dass nur der POST-Service ändert).
- Zweimal schnell abschicken (Doppelklick, zwei Tabs) → genau eine Review, zweiter Versuch 409 (Task 6).
- Event zwischen Mail und Absenden gelöscht → freundliche Meldung, 410 statt 500 (Task 6).
- `<script>`/`&`/Anführungszeichen im Bewertungstext oder Namen → in der HTML-Admin-Mail escaped (Task 4).
- Nur 1–2 freigegebene Reviews → Banner läuft trotzdem ohne Lücke (Liste wird auf ≥ 6 Karten aufgefüllt, Task 10).

---

### Task 1: Datenbank – Tabelle `reviews`, Event-Spalten, Repository

**Files:**
- Create: `supabase/migrations/2026-11-19-add-reviews.sql`
- Modify: `src/db/schema.ts`
- Create: `src/repositories/review-repository.ts`
- Modify: `src/repositories/user-repository.ts`

**Interfaces:**
- Produces (`schema.ts`): `reviews` Tabelle, `type ReviewRecord`, `events.feedbackRequestSentAt`, `events.feedbackSubmittedAt` (timestamptz, nullable).
- Produces (`review-repository.ts`):
  - `submitReviewForEvent(eventId: string, review: { rating: number; text: string; displayName: string | null; language: Locale }): Promise<{ status: "created"; review: ReviewRecord } | { status: "already" | "missing" }>` – eine Transaktion: `update events set feedback_submitted_at = now() where id = $1 and feedback_submitted_at is null returning id`; kein Treffer → prüfen, ob das Event existiert („already“) oder nicht („missing“); sonst Review einfügen und zurückgeben.
  - `getReview(id: string): Promise<ReviewRecord | undefined>`
  - `approveReview(id: string): Promise<boolean>` (true = geändert; setzt `status='approved'`, `approved_at=now()` nur wenn `pending`)
  - `deleteReview(id: string): Promise<boolean>`
  - `getApprovedReviews(language: Locale, limit: number): Promise<ReviewRecord[]>` (neueste `approved_at` zuerst)
  - `getFeedbackEventInfo(eventId: string): Promise<{ title: string; ownerId: string | null; submitted: boolean } | undefined>`
- Produces (`user-repository.ts`): `UserContact` bekommt `feedbackMails: boolean` (`raw_user_meta_data ->> 'feedback_mails'` ≠ `'false'`); `disableFeedbackMails(userId: string): Promise<void>` (jsonb `||` `{"feedback_mails": false}` auf `raw_user_meta_data`).

- [ ] **Step 1: Migration schreiben** – `create table public.reviews` (Spalten exakt wie Spec-Tabelle: `rating smallint not null check (rating between 1 and 5)`, `text varchar(200) not null`, `display_name varchar(100)`, `language text not null check (language in ('de','en','ru'))`, `status text not null default 'pending' check (status in ('pending','approved'))`, `created_at`, `approved_at`), Index auf `(language, status, approved_at desc)`, `enable row level security` ohne Policies (Kommentar wie in `2026-10-08-add-date-poll.sql`); `alter table public.events add column feedback_request_sent_at timestamptz, add column feedback_submitted_at timestamptz`. Kopfkommentar: additiv, alter Code ignoriert es.
- [ ] **Step 2: Schema + Repository** nach den Interfaces oben (Drizzle-Muster aus `event-repository.ts`/`guest-repository.ts`, Transaktion wie `guest-repository.ts:76`).
- [ ] **Step 3: Prüfen** – `npx tsc --noEmit` → keine Fehler. Bestehende Tests, die `getUserContact` mocken, ggf. um `feedbackMails: true` ergänzen; `npm test` grün.
- [ ] **Step 4: Migration anwenden** – Owner fragen, ob sie per Supabase-MCP `apply_migration` auf das Projekt laufen soll (nicht ohne Zustimmung).

### Task 2: Signierte Links

**Files:**
- Create: `src/lib/feedback-token.ts`, `src/lib/feedback-token.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces:
  - `type FeedbackTokenKind = "feedback" | "moderate" | "unsubscribe"`
  - `signFeedbackToken(payload: { kind: FeedbackTokenKind; id: string; exp?: string }, secret: string): string` – Format `<base64url(JSON {k,id,exp?})>.<base64url(HMAC-SHA256)>`; `exp` = letzter gültiger Tag `YYYY-MM-DD` (Berlin).
  - `verifyFeedbackToken(token: string, kind: FeedbackTokenKind, secret: string, today: string): { id: string } | null`
  - `getFeedbackSecret(): string | null` (`process.env.FEEDBACK_SECRET` oder null bei leer)
  - `FEEDBACK_LINK_VALID_DAYS = 30`

- [ ] **Step 1: Tests schreiben**
```ts
const S = "secret";
it("round-trips", () => {
  const t = signFeedbackToken({ kind: "feedback", id: "e1", exp: "2026-12-19" }, S);
  expect(verifyFeedbackToken(t, "feedback", S, "2026-12-19")).toEqual({ id: "e1" });
});
it("rejects after exp", () => expect(verifyFeedbackToken(signFeedbackToken({ kind: "feedback", id: "e1", exp: "2026-12-19" }, S), "feedback", S, "2026-12-20")).toBeNull());
it("rejects other kind", () => expect(verifyFeedbackToken(signFeedbackToken({ kind: "moderate", id: "r1" }, S), "unsubscribe", S, "2026-11-19")).toBeNull());
it("rejects tampered payload", () => { /* id im Payload ersetzen, Signatur behalten */ expect(...).toBeNull(); });
it("rejects other secret", () => expect(verifyFeedbackToken(signFeedbackToken({ kind: "moderate", id: "r1" }, S), "moderate", "x", "2026-11-19")).toBeNull());
it("rejects garbage", () => { for (const t of ["", "abc", "a.b.c", "%%.%%"]) expect(verifyFeedbackToken(t, "moderate", S, "2026-11-19")).toBeNull(); });
```
- [ ] **Step 2:** `npx vitest run src/lib/feedback-token.test.ts` → FAIL (Modul fehlt).
- [ ] **Step 3: Implementieren** – `createHmac`/`timingSafeEqual` wie `src/lib/event-access.ts`; Längen vor `timingSafeEqual` vergleichen; JSON-Parse in try/catch.
- [ ] **Step 4:** Test → PASS.
- [ ] **Step 5:** `.env.example`: `FEEDBACK_SECRET=` (Kommentar wie `EVENT_UNLOCK_SECRET`, „Ändern macht alle Feedback-, Freigabe- und Abmeldelinks ungültig“) und `FEEDBACK_ADMIN_EMAIL=info@gastzilla.de`.

### Task 3: Validierung des Feedback-Formulars

**Files:**
- Modify: `src/lib/validation.ts`, `src/lib/validation.test.ts`, `messages/{de,en,ru}.json` (Namespace `errors`)

**Interfaces:**
- Produces:
  - `REVIEW_TEXT_MIN_LENGTH = 20`, `REVIEW_TEXT_MAX_LENGTH = 200`
  - `type FeedbackInput = { rating: number; text: string; displayName: string | null }`
  - `validateFeedback(value: unknown): { ok: true; value: FeedbackInput } | { ok: false; error: ErrorMessage }` – Eingabe `{ rating, text, showName: boolean, name?: string, consent: boolean }`; `showName=false` → `displayName: null` (Name ignoriert); `showName=true` → Name durch `personNameSchema`; `consent !== true` → Fehler.
- Neue Error-Keys: `ratingRequired`, `reviewTextTooShort` ({min}), `reviewTextTooLong` ({max}), `publishConsentRequired`, `feedbackLinkInvalid`, `feedbackAlreadySent`, `feedbackEventGone`, `feedbackSendFailed`.

- [ ] **Step 1: Tests** – `rating` 0, 6, 2.5, "5" → Fehler `ratingRequired`; Text mit 19 Zeichen nach trim → `reviewTextTooShort` {min:20}; 201 → `reviewTextTooLong` {max:200}; 200 → ok; `showName:false, name:"X"` → `displayName: null`; `showName:true, name:"A"` → derselbe Fehler wie `validatePersonName("A")`; `consent:false` → `publishConsentRequired`; gültig → `{ rating: 5, text: "<getrimmt>", displayName: "Anna" }`.
- [ ] **Step 2:** `npx vitest run src/lib/validation.test.ts` → FAIL.
- [ ] **Step 3:** Implementieren (Muster der übrigen Schemas in `validation.ts`), Error-Texte in allen drei Sprachen.
- [ ] **Step 4:** Test + `src/i18n/messages.test.ts` → PASS.

### Task 4: HTML-Mails und Mail-Texte

**Files:**
- Modify: `src/lib/email.ts`
- Create: `src/lib/feedback-mails.ts`, `src/lib/feedback-mails.test.ts`
- Modify: `messages/{de,en,ru}.json` (Namespace `mail`)

**Interfaces:**
- Produces:
  - `sendEmail(options: { to; subject; text; html?: string; replyTo? })` – `html` an nodemailer durchreichen; Konsolen-Fallback unverändert (nur Text).
  - `escapeHtml(value: string): string` (in `feedback-mails.ts`, exportiert)
  - `buildFeedbackRequestMail(input: { title: string; feedbackLink: string; unsubscribeLink: string }, locale: Locale): { subject: string; text: string; html: string }`
  - `buildFeedbackAdminMail(input: { rating: number; text: string; displayName: string | null; language: Locale; createdAt: Date; approveLink: string; deleteLink: string }): { subject: string; text: string; html: string }` (Deutsch)
- Neue `mail`-Keys (alle Sprachen): `feedbackSubject` („Wie war „{title}“?“), `feedbackText` (Dank, Bitte um kurze Bewertung, Link `{link}`, Hinweis „Du bekommst diese Mail einmal nach deinem Event.“, Abmelden `{unsubscribe}`), `feedbackButton` („Feedback geben“), `feedbackUnsubscribe` („Keine Feedback-Mails mehr“). Admin-Mail-Texte fest im Code (Deutsch): Betreff `Neue Bewertung (★{rating}) – bitte prüfen`.

- [ ] **Step 1: Tests** – Request-Mail de/en: Betreff enthält Titel, `text` enthält `feedbackLink` und `unsubscribeLink`, `html` enthält beide als `href`. Admin-Mail: `text` enthält „★★★★☆“ bei rating 4, Name oder „(ohne Namen)“, Sprache „de“; mit `text: '<script>"&'` und `displayName: "<b>A</b>"` enthält `html` weder `<script>` noch `<b>`, sondern `&lt;script&gt;&quot;&amp;`; beide Links als Buttons im HTML und als Zeilen im Text.
- [ ] **Step 2:** `npx vitest run src/lib/feedback-mails.test.ts` → FAIL.
- [ ] **Step 3:** Implementieren. HTML: eine Tabelle, inline-Styles, Button-Farbe grün `#2f7d4a` (Posten/Feedback) bzw. `#b45309` (Löschen), Schrift system-ui. Jeder eingesetzte Wert durch `escapeHtml`.
- [ ] **Step 4:** Test → PASS.

### Task 5: Feedback-Mail im täglichen Cron

**Files:**
- Modify: `src/lib/lifecycle-mails.ts`, `src/lib/lifecycle-mails.test.ts`
- Modify: `src/repositories/event-repository.ts` (`LifecycleJobRow`, `getAllLifecycleRows`, neu `markFeedbackRequestSent`)
- Modify: `src/services/notification-service.ts`, `src/services/lifecycle-job-service.ts`, `src/services/lifecycle-job-service.test.ts`

**Interfaces:**
- Consumes: Task 1 (`feedbackMails`), Task 2 (`signFeedbackToken`, `getFeedbackSecret`, `FEEDBACK_LINK_VALID_DAYS`), Task 4 (`buildFeedbackRequestMail`).
- Produces:
  - `LifecycleMailRow` um `acceptedGuests: number; feedbackRequestSentAt: Date | null; feedbackSubmittedAt: Date | null` erweitert (Repository: Subquery `count(*) filter (where declined = false)` aus `guests`, left join wie `latestPoll`).
  - `feedbackRequestDue(row: LifecycleMailRow, today: string): boolean` (Bedingungen aus Global Constraints; Stage via `lifecycleStage(stichtag(row), today) === "over"`).
  - `sendFeedbackRequestMail(event: { id: string; ownerId: string | null; title: string }, today: string): Promise<boolean>` – false ohne Secret, ohne Owner/E-Mail oder bei `feedbackMails === false`; Links: `${SITE_URL}${localizedPath("/feedback", owner.locale)}?t=<feedback-token, exp = addDays(today, FEEDBACK_LINK_VALID_DAYS)>` und `.../feedback/abmelden?t=<unsubscribe-token mit ownerId>`.
  - `markFeedbackRequestSent(id: string): Promise<void>`
- `runLifecycleJob`: nach dem bestehenden `dueMail`-Block (und nur wenn nicht gelöscht) unabhängig prüfen `feedbackRequestDue` → senden → markieren; eigener try/catch; zählt in `mailed`.

- [ ] **Step 1: Tests `feedbackRequestDue`** – Basiszeile: fixed, `eventDate "2026-11-10"`, today `"2026-11-11"`, `acceptedGuests 1`, Spalten null → true. Jeweils false bei: today `"2026-11-10"` (noch nicht over); today `"2026-12-10"` (expired, Tag 30); `dateMode "poll"`; `eventDate null`; `acceptedGuests 0`; `feedbackRequestSentAt` gesetzt; `feedbackSubmittedAt` gesetzt. Mehrtägig: `eventEndDate "2026-11-12"`, today `"2026-11-12"` → false, `"2026-11-13"` → true.
- [ ] **Step 2: Tests Job** – Mock `sendFeedbackRequestMail` (true) + `markFeedbackRequestSent`; fällige Zeile → einmal gesendet und markiert, zweiter Lauf am selben Tag sendet nicht; `sendFeedbackRequestMail` false → nicht markiert; Fehler bei einer Zeile stoppt die nächste nicht; Zeile, die heute gelöscht wird, bekommt keine Feedback-Mail.
- [ ] **Step 3:** `npx vitest run src/lib/lifecycle-mails.test.ts src/services/lifecycle-job-service.test.ts` → FAIL.
- [ ] **Step 4:** Implementieren.
- [ ] **Step 5:** Tests → PASS; `npx tsc --noEmit` sauber.

### Task 6: Feedback absenden (Service + API)

**Files:**
- Create: `src/services/feedback-service.ts`, `src/services/feedback-service.test.ts`
- Create: `src/app/api/feedback/route.ts`

**Interfaces:**
- Consumes: Task 1 (`submitReviewForEvent`, `getFeedbackEventInfo`), Task 2, Task 3 (`validateFeedback`), Task 4 (`buildFeedbackAdminMail`, `sendEmail`).
- Produces:
  - `type FeedbackPageState = { kind: "invalid" } | { kind: "gone" } | { kind: "done" } | { kind: "form"; title: string; ownerName: string | null }`
  - `getFeedbackPageState(token: string | undefined, today: string): Promise<FeedbackPageState>` (nur lesend; `ownerName` aus `getUserContact(ownerId).name`)
  - `submitFeedback(body: unknown, locale: Locale, today: string): Promise<{ ok: true } | { ok: false; status: 400 | 403 | 409 | 410; error: ErrorMessage }>` – Body `{ token, rating, text, showName, name?, consent }`; Token ungültig → 403 `feedbackLinkInvalid`; Validierung → 400; `missing` → 410 `feedbackEventGone`; `already` → 409 `feedbackAlreadySent`; `created` → Admin-Mail mit moderate-Token der Review-ID (`?t=…&a=approve|delete` auf `${SITE_URL}/feedback/moderieren`), Mail-Fehler loggen, trotzdem `ok`.
- Route `POST /api/feedback`: Muster `password-request/route.ts` (`apiErrors`, JSON-Parse, 500 → `feedbackSendFailed`); Locale aus Body-Feld `locale` mit `isLocale`, sonst `DEFAULT_LOCALE`.

- [ ] **Step 1: Tests** (Repos, `sendEmail`, `getFeedbackSecret` gemockt): gültig → `submitReviewForEvent` mit `{ rating, text, displayName, language: "en" }` aufgerufen, Admin-Mail an `info@gastzilla.de`; `FEEDBACK_ADMIN_EMAIL="a@b.de"` → an diese; `already` → 409; `missing` → 410; falsches Token → 403 und kein Repo-Aufruf; `sendEmail` wirft → trotzdem `{ ok: true }`; `getFeedbackPageState`: kein Token → invalid, Event weg → gone, submitted → done, sonst form mit Titel.
- [ ] **Step 2:** FAIL → **Step 3:** implementieren → **Step 4:** PASS.

### Task 7: Feedback-Seite

**Files:**
- Create: `src/app/[locale]/feedback/page.tsx`, `src/components/FeedbackForm.tsx`, `src/components/StarRatingInput.tsx`
- Modify: `messages/{de,en,ru}.json` (neuer Namespace `feedback`)

**Interfaces:**
- Consumes: Task 6 (`getFeedbackPageState`, `POST /api/feedback`), Task 3 (Limits).
- Seite: `generateMetadata` mit `robots: { index: false, follow: false }`; `searchParams.t`; rendert je Zustand Meldung (+ Link Startseite) oder `<FeedbackForm token title defaultName />`. Layout wie `ContentPage`/`SiteHeader`.
- `FeedbackForm` (client): `StarRatingInput` (Radiogruppe 1–5, Pfeiltasten, `aria-label` „{n} von 5 Sternen“), Textarea mit `CharCounter` (max 200), Checkbox „Mein Vorname darf mit der Bewertung erscheinen“ + Namensfeld (nur sichtbar wenn angehakt, vorausgefüllt), Pflicht-Checkbox Veröffentlichung mit `LegalLink` auf Datenschutz; Absenden → POST, Erfolg → Dank-Ansicht, Fehler via `useErrorText`. Button während Senden deaktiviert (gegen Doppelklick).
- `feedback`-Keys: `metaTitle`, `title`, `intro` ({title}), `ratingLabel`, `starLabel` ({n}), `textLabel`, `showName`, `nameLabel`, `consent`, `submit`, `thanksTitle`, `thanksText`, `invalidTitle`, `invalidText`, `doneTitle`, `doneText`, `goneText`, `homeLink`.

- [ ] **Step 1:** Implementieren.
- [ ] **Step 2:** `npx tsc --noEmit`, `npx eslint src`, `npx vitest run src/i18n/messages.test.ts` → grün.
- [ ] **Step 3:** Im Dev-Server (Task 12) prüfen; hier nur sicherstellen, dass die Seite selbst keine schreibende Funktion aufruft.

### Task 8: Moderation (Posten/Löschen) und Abmelden

**Files:**
- Modify: `src/services/feedback-service.ts`, `src/services/feedback-service.test.ts`
- Create: `src/app/api/feedback/moderate/route.ts`, `src/app/api/feedback/unsubscribe/route.ts`
- Create: `src/app/[locale]/feedback/moderieren/page.tsx`, `src/app/[locale]/feedback/abmelden/page.tsx`, `src/components/FeedbackActionButton.tsx`
- Modify: `messages/{de,en,ru}.json` (`feedback.unsubscribe*`)

**Interfaces:**
- Produces:
  - `getModerationState(token: string | undefined): Promise<{ kind: "invalid" } | { kind: "gone" } | { kind: "review"; review: ReviewRecord }>` (lesend)
  - `moderateReview(body: unknown): Promise<{ ok: true; result: "approved" | "already_approved" | "deleted" | "gone" } | { ok: false; status: 400 | 403; error: ErrorMessage }>` – Body `{ token, action: "approve" | "delete" }`.
  - `unsubscribeFeedback(body: unknown): Promise<{ ok: true } | { ok: false; status: 403; error: ErrorMessage }>` – Body `{ token }`; ruft `disableFeedbackMails`; Konto weg → trotzdem ok.
- Moderationsseite: nur Deutsch (feste Texte), `noindex`, zeigt Sterne/Text/Name/Sprache/Status und je nach `a` einen Button „Jetzt posten“ oder „Endgültig löschen“ (beide anbieten, `a` bestimmt den hervorgehobenen), danach Ergebnistext.
- Abmeldeseite: lokalisiert, `noindex`, Erklärung + Button „Keine Feedback-Mails mehr“, danach Bestätigung.
- `FeedbackActionButton` (client): POST an eine URL mit JSON-Body, zeigt Ergebnis-Text.

- [ ] **Step 1: Tests** – approve pending → `approveReview` aufgerufen, `approved`; schon approved → `already_approved`; delete → `deleted` (auch bei approved); Review fehlt → `gone`; falsche Art (feedback-Token) → 403; unbekannte `action` → 400; `getModerationState` ruft weder `approveReview` noch `deleteReview` auf; unsubscribe gültig → `disableFeedbackMails(userId)`; ungültig → 403.
- [ ] **Step 2:** FAIL → **Step 3:** implementieren → **Step 4:** PASS.

### Task 9: Wartungsmodus

**Files:**
- Modify: `src/lib/maintenance.ts`, `src/lib/maintenance.test.ts`

- [ ] **Step 1: Test** – bei aktivem Wartungsmodus auf `gastzilla.de` sind `/feedback`, `/feedback/abmelden`, `/en/feedback`, `/feedback/moderieren` erreichbar (`shouldShowMaintenance` → false); `/feedbacks` nicht.
- [ ] **Step 2:** FAIL → **Step 3:** `"/feedback"` zu `ALWAYS_REACHABLE_SECTIONS` → **Step 4:** PASS.

### Task 10: Bewertungs-Banner

**Files:**
- Create: `src/lib/reviews-banner.ts`, `src/lib/reviews-banner.test.ts`, `src/components/ReviewsBanner.tsx`
- Modify: `src/components/LandingContent.tsx` (nach `FaqSection`), `src/app/globals.css`, `messages/{de,en,ru}.json` (Namespace `reviews`)

**Interfaces:**
- Consumes: Task 1 (`getApprovedReviews`).
- Produces:
  - `type BannerReview = { rating: number; text: string; name: string }`
  - `BANNER_MIN_CARDS = 6`, `BANNER_MAX_REVIEWS = 20`
  - `pickBannerReviews(approved: { rating: number; text: string; displayName: string | null }[], examples: BannerReview[], fallbackName: string): { items: BannerReview[]; examples: boolean }` – keine echten → Beispiele, `examples: true`; sonst echte (Name oder `fallbackName`), `examples: false`.
  - `fillTrack<T>(items: T[], min: number): T[]` – wiederholt die Liste, bis `length >= min` (leere Liste → leer).
- `ReviewsBanner` (Server-Komponente): h2 `reviews.title` („Was Gastgeber sagen“) + bei Beispielen kleines „(Beispiele)“; Track = `fillTrack(items, 6)` zweimal, zweite Kopie `aria-hidden`; Karte: Sterne mit `aria-label`, `<blockquote>`, Name; darunter `reviews.verification` bzw. `reviews.examplesNote`. Fehler beim DB-Lesen → Beispiele (nie die Startseite brechen).
- CSS: `@keyframes reviews-marquee { to { transform: translateX(-50%) } }`, Dauer als CSS-Variable `--marquee-duration: calc(var(--cards) * 6s)`; Pause bei `:hover`/`:focus-within`; `@media (prefers-reduced-motion: reduce)` → keine Animation, zweite Kopie `display:none`, `overflow-x: auto` mit `scroll-snap`; Rand-Fade per `mask-image`; Container `overflow: hidden` (kein horizontales Seiten-Scrollen bei 375 px).
- `reviews`-Keys: `title`, `examplesLabel`, `verification`, `examplesNote`, `fallbackName`, `starsLabel` ({n}), `examples` (Array mit 6 `{rating, text, name}`; Texte nur über verifizierte Features: Zusage per Link ohne Konto, Begleitpersonen, Mitbringsel-Liste, Teilen per WhatsApp, Mail bei neuer Zusage, Kalender-Termin; ≤ 200 Zeichen, überwiegend 5 Sterne, 1–2 mit 4).

- [ ] **Step 1: Tests** – `pickBannerReviews([], ex, "Host")` → `{ items: ex, examples: true }`; eine echte ohne Namen → `[{…, name: "Host"}]`, `examples: false`; `fillTrack([a], 6)` → 6× a; `fillTrack([a,b,c,d], 6)` → 8 Einträge (ganze Wiederholungen); `fillTrack([], 6)` → `[]`. Plus: jede Sprache hat genau 6 Beispiele mit `rating` 1–5 und `text.length <= 200`.
- [ ] **Step 2:** FAIL → **Step 3:** implementieren → **Step 4:** PASS.

### Task 11: Rechtstexte und Registrierungshinweis

**Files:**
- Modify: `src/components/legal/PrivacyDe.tsx`, `PrivacyEn.tsx`, `PrivacyRu.tsx`, `src/lib/legal-info.ts`
- Modify: Registrierungsdialog (`src/components/AuthDialog.tsx` bzw. dort, wo `ConsentCheckboxes` für die Registrierung gerendert wird), `messages/{de,en,ru}.json` (`consent.feedbackNotice`)

- [ ] **Step 1:** Neuer Abschnitt **„10. Feedback und Bewertungen“** direkt nach „9. E-Mail-Versand und Kontakt“ in allen drei Sprachen, gleiche Struktur (Absätze/Listen identisch zählen). Inhalt laut Spec „Rechtliches“: Feedback-Mail einmal nach Event mit Zusagen (Art. 6 Abs. 1 lit. f DSGVO, § 7 Abs. 3 UWG), Widerspruch per Abmeldelink oder Mail; gespeichert werden Sterne, Text, optional Name, Sprache, Zeitpunkte – keine Verbindung zu Konto oder Event; Prüfung von Hand vor Veröffentlichung; Veröffentlichung auf der Startseite auf Grundlage der Einwilligung im Formular (Art. 6 Abs. 1 lit. a, widerrufbar per Mail); nicht freigegebene werden gelöscht, veröffentlichte bleiben bis zum Widerruf.
- [ ] **Step 2:** Alle folgenden Abschnittsnummern +1 und jede Querverweis-Nummer ≥ 10 anpassen: `grep -n "Abschnitt\|section\|раздел" src/components/legal/Privacy*.tsx` – Verweise auf 10, 15, 16 werden 11, 16, 17. Abschnitt „Speicherdauer“ um Bewertungen ergänzen (gleich in allen Sprachen).
- [ ] **Step 3:** `PRIVACY_VERSION = "2026-11-19"` und das `data-updated`-Datum der drei Texte.
- [ ] **Step 4:** Eine Hinweiszeile unter den Consent-Checkboxen der Registrierung (E-Mail und Google): „Nach deinem Event bitten wir dich einmal per E-Mail um Feedback – abbestellbar mit einem Klick.“ (en/ru entsprechend).
- [ ] **Step 5:** `npx vitest run src/components/legal/legal-parity.test.ts src/lib/terms-consent.test.ts src/i18n/messages.test.ts` → PASS. (`PRIVACY_VERSION` löst kein Re-Consent aus – nur `TERMS_VERSION`; prüfen, dass das so bleibt.)

### Task 12: Gesamtprüfung

- [ ] **Step 1:** `npx tsc --noEmit` → keine Fehler; `npx eslint src` → keine Fehler; `npm test` → alles grün.
- [ ] **Step 2:** Dev-Server per `preview_start` (Name aus `.claude/launch.json`). Startseite de/en/ru: Banner sichtbar, „(Beispiele)“-Hinweis, Texte im Seitenquelltext (`get_page_text`), Pause bei Hover, mobil 375 px ohne horizontales Scrollen, `prefers-reduced-motion` (per `javascript_tool` die Media-Query-Regel prüfen). `/feedback?t=quatsch` → „Link ungültig“; mit lokal signiertem Token (Script mit `FEEDBACK_SECRET` aus `.env.local`) Formular laden und Validierungsfehler anzeigen lassen – **nicht** gegen die Produktions-DB absenden, ohne den Owner zu fragen.
- [ ] **Step 3:** Screenshot Banner (Desktop + mobil) für den Owner. Dev-Server danach stoppen.
- [ ] **Step 4:** Owner-Hinweise sammeln: `FEEDBACK_SECRET` + ggf. `FEEDBACK_ADMIN_EMAIL` in Vercel setzen, Migration anwenden (falls nicht in Task 1 geschehen), Rechtstexte gegenlesen lassen, `docs/seo-todo.md` um „Bewertungs-Banner live, Beispiele bis zur ersten Freigabe“ ergänzen.
