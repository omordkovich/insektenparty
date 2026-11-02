# Free-Event, bezahlte Events und automatische Löschung – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein einmaliges Free-Event pro Konto (festes Datum ≤ 3 Monate), weitere Events und Features über (vorerst Dummy-)Käufe, und automatischer Ablauf mit Löschung 90 Tage nach dem Stichtag für alle Events.

**Architecture:** Reine Regeln in `src/lib/` (Plan-Regeln, Stichtag/Stufen, Kontingent), Prüfung serverseitig in den Services (Layered Architecture wie bisher), ein Freischalt-Dialog im Client, ein täglicher Vercel-Cron für Mails und Löschung. Stichtag wird **berechnet, nicht gespeichert**.

**Tech Stack:** Next.js 16 (App Router), Drizzle + Supabase Postgres, Vitest, nodemailer (bestehendes SMTP), Vercel Cron.

**Spec:** `docs/superpowers/specs/2026-11-02-free-event-and-expiry-design.md`

## Global Constraints

- **Keine Commits.** Der Nutzer committet selbst. Commit-Schritte entfallen.
- Lokal = Produktions-DB. Migrationen und Testdaten **nur nach Rückfrage** anwenden (Supabase MCP `apply_migration`).
- Alle Tage in Berliner Zeit (`todayInBerlin()` aus `src/lib/date-poll.ts`). Datumswerte sind `YYYY-MM-DD`-Strings.
- Konstanten: Free-Fenster **3 Monate**, Paid-Fenster **12 Monate**, Stichtag ohne Datum = Erstellung **+ 6 Monate**; Stufen: vorbei ab Stichtag **+1**, abgelaufen ab **+30**, löschen ab **+90**; Löschhinweis **7** Tage vorher; Termin-Erinnerung **30** Tage vor Stichtag (nur „Noch kein Termin“); Abstimmungs-Erinnerung **3** Tage vor dem spätesten Vorschlag, nur wenn die Abstimmung ≥ **3** Tage alt ist.
- Fehlertexte (exakt): `"Dieses Event ist vorbei."` · `"Abstimmung und offener Termin gibt es nur mit einem freigeschalteten Event."` · `"Das Datum darf höchstens 3 Monate nach dem Erstellen des Events liegen."` (bei Paid: `12 Monate`) · `"Das Datum liegt in der Vergangenheit."` · `"Du hast kein freies Event mehr."`
- Dummy-Käufe aktiv nur bei `process.env.PAYMENTS_DUMMY === "true"`, **auch in Produktion**. Ledger-`source = 'dummy'`.
- Dummy-Preise (vom Nutzer bestätigt): bezahltes Event **2,99 €**, alle Designs inklusive; einzelnes Design **0,99 €**. Anzeige mit Hinweis „Testphase – es wird nichts berechnet“.
- Bezahltes Event = **alle Designs** nutzbar. Free-Event = freie + pro Nutzer einzeln gekaufte Designs.
- „Ohne GASTZILLA-Hinweis“: **0,99 € pro Event**, für Free- und Paid-Events, nicht in den 2,99 € enthalten. Teilen-Buttons und Rechtslinks bleiben immer sichtbar.
- Nicht in diesem Plan: Gästelisten-Export, eigenes Bild statt Logo.
- Öffentliche Texte (FAQ, Landing, `llms.txt`, Anlass-Seiten) nur mit dem Projekt-Skill `optimizing-seo-aeo-geo`.
- Abweichung von der Spec (bewusst): Das verbrauchte Free-Event wird **nicht** in `profiles` vermerkt (dort ist `name` NOT NULL, nicht jeder Nutzer hat eine Zeile), sondern als Ledger-Zeile `feature = 'free_event'`. Wirkung identisch: überlebt das Löschen des Events, verschwindet mit dem Konto.

## Review Focus

1. **Monatsende beim Fenster:** Event erstellt am 31.01. → spätestes Datum 30.04. (3 Monate) bzw. 28./29.02. bei +1 Monat; nie ein ungültiges Datum, nie ein Überlauf in den Folgemonat. → Test in Task 1.
2. **Mehrtägiges Free-Event:** Startdatum im Fenster, Enddatum außerhalb → muss abgelehnt werden (das Enddatum zählt). → Test in Task 5.
3. **Abstimmung, deren Vorschläge teils vorbei sind:** Stichtag ist der *späteste* Vorschlag, nicht der früheste; Event bleibt beschreibbar, bis der letzte Vorschlag vorbei ist. → Test in Task 1 und Task 6.
4. **Doppelklick auf „Event erstellen“ / zwei Tabs:** darf nur ein Free-Event bzw. ein Guthaben verbrauchen. → Test in Task 4 (zweiter Aufruf nach Verbrauch → 403).
5. **Cron läuft zweimal oder fällt aus:** keine doppelten Mails, Löschung wird nachgeholt. → Test in Task 10.

---

### Task 1: Reine Regeln – Plan-Fenster, Stichtag, Stufen

**Files:**
- Create: `src/lib/event-plan.ts`, `src/lib/event-plan.test.ts`
- Create: `src/lib/event-lifecycle.ts`, `src/lib/event-lifecycle.test.ts`

**Interfaces:**
- Produces (`event-plan.ts`):
  - `type EventPlan = "free" | "paid"`, `isEventPlan(value: unknown): value is EventPlan`
  - `DATE_WINDOW_MONTHS: Record<EventPlan, number> = { free: 3, paid: 12 }`
  - `addMonths(iso: string, months: number): string` – Kalendermonate, Tag auf Monatsende gekappt
  - `latestAllowedDate(plan: EventPlan, createdOn: string): string`
  - `canUseDateMode(plan: EventPlan, mode: DateMode): boolean` – free nur `"fixed"`
  - `dateWindowError(plan: EventPlan): string` – die Fenster-Fehlertexte aus Global Constraints
  - `checkPlanRules(plan: EventPlan, createdOn: string, request: DateModeRequest): { status: 400 | 403; error: string } | null` – Modus erlaubt? (sonst 403); bei `fixed` Start- **und** Enddatum, bei `poll` jeder Vorschlag ≤ `latestAllowedDate` (sonst 400 `dateWindowError`). Genutzt von Task 4 und Task 5.
- Produces (`event-lifecycle.ts`):
  - `type LifecycleInput = { dateMode: DateMode; eventDate: string | null; eventEndDate: string | null; createdOn: string; latestPollDate: string | null }`
  - `stichtag(input: LifecycleInput): string`
  - `type LifecycleStage = "active" | "over" | "expired"`
  - `lifecycleStage(stichtag: string, today: string): LifecycleStage`
  - `deletionDate(stichtag: string): string` (= +90 Tage), `isDueForDeletion(stichtag: string, today: string): boolean`
  - Konstanten `OVER_AFTER_DAYS = 1`, `EXPIRED_AFTER_DAYS = 30`, `DELETE_AFTER_DAYS = 90`

- [ ] **Step 1: Failing tests schreiben**

`event-plan.test.ts`:
```ts
expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
expect(addMonths("2028-01-31", 1)).toBe("2028-02-29");
expect(addMonths("2026-01-31", 3)).toBe("2026-04-30");
expect(addMonths("2026-11-15", 3)).toBe("2027-02-15");
expect(latestAllowedDate("free", "2026-01-15")).toBe("2026-04-15");
expect(latestAllowedDate("paid", "2026-01-15")).toBe("2027-01-15");
expect(canUseDateMode("free", "fixed")).toBe(true);
expect(canUseDateMode("free", "poll")).toBe(false);
expect(canUseDateMode("free", "unknown")).toBe(false);
expect(canUseDateMode("paid", "poll")).toBe(true);
expect(checkPlanRules("free", "2026-07-01", { mode: "poll", proposals: [] })?.status).toBe(403);
expect(checkPlanRules("free", "2026-07-01", fixed("2026-09-30", "2026-10-02"))?.status).toBe(400); // Enddatum zählt
expect(checkPlanRules("free", "2026-07-01", fixed("2026-10-01", null))).toBeNull();
expect(checkPlanRules("paid", "2026-07-01", pollWith("2027-07-02"))?.error).toContain("12 Monate");
```
(`fixed`/`pollWith` = kleine Test-Helfer, die einen `DateModeRequest` bauen.)

`event-lifecycle.test.ts`:
```ts
const base = { createdOn: "2026-10-07", latestPollDate: null, eventEndDate: null };
expect(stichtag({ ...base, dateMode: "fixed", eventDate: "2026-12-05" })).toBe("2026-12-05");
expect(stichtag({ ...base, dateMode: "fixed", eventDate: "2026-12-05", eventEndDate: "2026-12-07" })).toBe("2026-12-07");
expect(stichtag({ ...base, dateMode: "fixed", eventDate: null })).toBe("2027-04-07");      // Altdaten
expect(stichtag({ ...base, dateMode: "unknown", eventDate: null })).toBe("2027-04-07");
expect(stichtag({ ...base, dateMode: "poll", eventDate: null, latestPollDate: "2026-12-20" })).toBe("2026-12-20");
expect(lifecycleStage("2026-12-05", "2026-12-05")).toBe("active");
expect(lifecycleStage("2026-12-05", "2026-12-06")).toBe("over");
expect(lifecycleStage("2026-12-05", "2027-01-03")).toBe("over");   // +29
expect(lifecycleStage("2026-12-05", "2027-01-04")).toBe("expired"); // +30
expect(deletionDate("2026-12-05")).toBe("2027-03-05");
expect(isDueForDeletion("2026-12-05", "2027-03-04")).toBe(false);
expect(isDueForDeletion("2026-12-05", "2027-03-05")).toBe(true);
expect(isDueForDeletion("2026-12-05", "2027-04-01")).toBe(true);    // nachholen
```

- [ ] **Step 2:** `npx vitest run src/lib/event-plan.test.ts src/lib/event-lifecycle.test.ts` → FAIL (Module fehlen)
- [ ] **Step 3:** Beide Module implementieren. `addDays` aus `src/lib/date-poll.ts` wiederverwenden.
- [ ] **Step 4:** Gleicher Befehl → PASS

---

### Task 2: Datenbank-Migration und Schema

**Files:**
- Create: `supabase/migrations/2026-11-02-free-event-and-expiry.sql`
- Modify: `src/db/schema.ts` (`events`, `userEntitlements`)

**Interfaces:**
- Produces: `events.plan text not null default 'free' check (plan in ('free','paid'))`, `events.deletion_notice_sent_at timestamptz null`, `events.date_reminder_sent_at timestamptz null`, `events.badge_hidden boolean not null default false` (Drizzle `badgeHidden`); `user_entitlements.consumed_event_id uuid null` (kein FK, damit die Zeile das Löschen des Events überlebt), `user_entitlements.consumed_at timestamptz null`. Drizzle: `plan`, `deletionNoticeSentAt`, `dateReminderSentAt`, `consumedEventId`, `consumedAt`.

- [ ] **Step 1: Migration schreiben**, in einer Transaktion, in dieser Reihenfolge:
  1. Spalten anlegen.
  2. Den bestehenden Feature-Check von `user_entitlements` ersetzen (Name per `pg_constraint` nachschlagen) durch `feature in ('paid_event','free_event','no_badge','event_slot') or feature like 'theme:%'`.
  3. Bestand: pro `owner_id` das älteste Event (`created_at`) → `plan = 'free'`, alle weiteren → `'paid'`.
  4. Pro Owner mit Events eine Zeile `('free_event', source 'manual', consumed_event_id = ältestes Event, consumed_at = dessen created_at)`.
  5. Jede `event_slot`-Zeile mit `quantity n` → n Zeilen `paid_event` (`generate_series`, `source` und `note` übernehmen).
  6. Pro Owner seine `paid`-Events per `row_number()` gegen seine `paid_event`-Zeilen matchen → `consumed_event_id`, `consumed_at = now()`. Mehr Paid-Events als Guthaben bleiben trotzdem `paid` (Bestandsschutz).
  7. `event_slot`-Zeilen löschen; Check final auf `feature in ('paid_event','free_event','no_badge') or feature like 'theme:%'`.
  Kopfkommentar wie in den bestehenden Migrationen („Additive – …“, was mit Altdaten passiert).
- [ ] **Step 2:** `schema.ts` synchron halten. `npx tsc --noEmit` → keine Fehler.
- [ ] **Step 3: Nutzer fragen**, dann per Supabase MCP anwenden. Prüf-Query: Erwartet 4 Events, davon 2 `free` (je Owner das älteste) und 2 `paid`, 2 `free_event`-Zeilen, 4 `paid_event`-Zeilen (2 verbraucht), 0 `event_slot`.

---

### Task 3: Entitlements – Kontingent statt Slots

**Files:**
- Modify: `src/lib/features.ts`, `src/lib/features.test.ts`
- Modify: `src/repositories/entitlement-repository.ts`, `src/services/entitlement-service.ts`
- Create: `src/lib/products.ts`

**Interfaces:**
- Consumes: `EventPlan` (Task 1)
- Produces (`features.ts`):
  - `PAID_EVENT_FEATURE = "paid_event"`, `FREE_EVENT_FEATURE = "free_event"`. **Entfernt:** `FREE_EVENT_LIMIT`, `EVENT_SLOT_FEATURE`.
  - `type EntitlementRow = { feature: string; quantity: number; consumedAt: Date | null }`
  - `type UserEntitlements = { unlockedThemes: ThemeKey[]; freeEventAvailable: boolean; eventCredits: number }`
  - `resolveEntitlements(rows: EntitlementRow[]): UserEntitlements` – `freeEventAvailable` = keine `free_event`-Zeile; `eventCredits` = Anzahl `paid_event` mit `consumedAt === null`
  - `canCreateEvent(e): boolean` = `freeEventAvailable || eventCredits > 0`
  - `nextEventPlan(e, wantPaid: boolean): EventPlan | null` – `wantPaid` → `"paid"` nur mit Guthaben; sonst Free zuerst, dann Guthaben; sonst `null`
  - `unlockedThemesFor(e: Pick<UserEntitlements, "unlockedThemes">, plan: EventPlan): ThemeKey[]` – `"paid"` → alle Themes; `"free"` → `e.unlockedThemes`. Alle Theme-Prüfungen (Server und Client) bekommen ihre Liste von hier; `canUseTheme`/`isThemeSelectable` bleiben unverändert.
- Produces (`products.ts`): `PRODUCTS = { paid_event: { label: "Event freischalten", priceCents: 299 }, theme: { label: "Design freischalten", priceCents: 99 }, no_badge: { label: "Ohne GASTZILLA-Hinweis", priceCents: 99 } } as const`, `formatPrice(cents: number): string` → `"2,99 €"`. Später Stripe-`lookup_key` (siehe Memory zum Stripe-Brainstorm).
- Produces (Service): `getUserEntitlements(userId): Promise<UserEntitlements>` (ohne Event-Zählung)

- [ ] **Step 1:** Bestehende `features.test.ts` auf das neue Modell umschreiben. Neue Fälle: Free verfügbar ohne Zeile; nach `free_event` nicht mehr; Guthaben zählt nur unverbrauchte; `nextEventPlan` für alle Kombinationen (Free+Guthaben+`wantPaid=false` → `"free"`; Free+Guthaben+`wantPaid=true` → `"paid"`; kein Free, kein Guthaben → `null`); `unlockedThemesFor(e, "paid")` enthält `"natur"` und `"ballons"` ohne Zeile, `unlockedThemesFor(e, "free")` nicht; `formatPrice(299) === "2,99 €"`.
- [ ] **Step 2:** `npx vitest run src/lib/features.test.ts` → FAIL
- [ ] **Step 3:** Implementieren. `getEntitlementRows` liefert `consumedAt` mit. `countEventsByOwner` wird nicht mehr gebraucht (entfernen, falls ungenutzt).
- [ ] **Step 4:** `npx vitest run` → PASS. `npx tsc --noEmit` zeigt die Aufrufer, die Task 4 und Task 8 anpassen. Bis dahin vorläufig kompilierbar halten.

---

### Task 4: Event erstellen mit Kontingent (transaktional)

**Files:**
- Modify: `src/repositories/event-repository.ts` (`createEvent`)
- Modify: `src/services/event-service.ts` (`createEventForOwner`), `src/services/event-service.test.ts`
- Modify: `src/app/api/events/route.ts` (Body-Feld `paid`)

**Interfaces:**
- Consumes: `nextEventPlan` (Task 3), `checkPlanRules` (Task 1)
- Produces:
  - `createEvent(input: {...wie heute; plan: EventPlan }): Promise<{ id: string; slug: string } | "no_quota">`. In **einer Transaktion**: `pg_advisory_xact_lock(hashtext(ownerId))`, Kontingent neu prüfen (free: keine `free_event`-Zeile; paid: unverbrauchte `paid_event`-Zeile vorhanden, ältesteste nehmen), Event einfügen, `free_event`-Zeile schreiben bzw. Guthaben mit `consumed_event_id`/`consumed_at` verbrauchen.
  - `createEventForOwner(ownerId, input: { theme; title; accessPassword?; date?; paid?: unknown })`

- [ ] **Step 1: Failing tests** in `event-service.test.ts` (Mocks wie bestehend):
  - Free verfügbar, `date: { mode: "unknown" }` → `{ ok:false, status:403, error:"Abstimmung und offener Termin gibt es nur mit einem freigeschalteten Event." }`
  - Free verfügbar, fixed `date: "2026-10-02"` bei `todayInBerlin = "2026-07-01"` → 400 `"Das Datum darf höchstens 3 Monate nach dem Erstellen des Events liegen."`; `"2026-10-01"` → ok, `createEvent` mit `plan: "free"`
  - Free verbraucht, 1 Guthaben, `mode: "poll"` → ok mit `plan: "paid"`
  - `paid: true`, Free verfügbar, 1 Guthaben → `plan: "paid"`
  - Kein Kontingent → 403 `"Du hast kein freies Event mehr."`
  - `createEvent` liefert `"no_quota"` (Race) → 403, gleicher Text
  - Theme `"natur"` ohne Zeile: Plan `paid` → ok; Plan `free` → 403 `THEME_LOCKED_ERROR` (Theme-Prüfung über `unlockedThemesFor(e, plan)`)
- [ ] **Step 2:** `npx vitest run src/services/event-service.test.ts` → FAIL
- [ ] **Step 3:** Implementieren. Reihenfolge im Service: Validierung → Entitlements → `nextEventPlan(e, input.paid === true)` → `checkPlanRules(plan, todayInBerlin(), request)` → `createEvent`. Route reicht `paid` durch.
- [ ] **Step 4:** → PASS

---

### Task 5: Datums-Regeln beim Ändern (Fenster, Vergangenheit, Modus)

**Files:**
- Modify: `src/lib/validation.ts` (`validateFixedDate`), Tests in `src/lib/validation.test.ts`
- Modify: `src/lib/date-poll-form.ts` (`buildDateModeRequest` reicht `today` durch), `src/lib/date-poll-form.test.ts`
- Modify: `src/services/date-mode-service.ts`, `src/services/date-mode-service.test.ts`
- Modify: `src/services/event-service.ts` (`updateEventForOwner`, Schedule-Pfad)
- Modify: `src/repositories/date-poll-repository.ts` (`applyDateModeChange` setzt `date_reminder_sent_at = null`)
- Modify: `src/repositories/event-repository.ts`: `getEventPlanInfo(id): Promise<{ ownerId: string | null; plan: EventPlan; createdOn: string } | undefined>`

**Interfaces:**
- Produces: `validateFixedDate(raw: unknown, options: { today: string; latest?: string; latestError?: string })`. Prüft Start **und** Enddatum: `< today` → `"Das Datum liegt in der Vergangenheit."`, `> latest` → `latestError`.
- Consumes: `checkPlanRules` (Task 1), `getEventPlanInfo` für Plan und `createdOn`.

- [ ] **Step 1: Failing tests**
  - `validateFixedDate({ date: "2026-06-30" }, { today: "2026-07-01" })` → Vergangenheits-Fehler
  - mehrtägig `{ date: "2026-09-30", endDate: "2026-10-02" }`, `latest: "2026-10-01"` → `latestError` (Review Focus 2)
  - `changeDateMode` auf Free-Event mit `mode: "poll"` → 403; fixed außerhalb Fenster → 400; Paid-Event `poll` mit Vorschlag nach 12 Monaten → 400 mit `12 Monate`
  - `updateEventForOwner` mit `eventDate` außerhalb des Fensters → 400
  - `updateEventForOwner` Theme-Wechsel auf `"ballons"` ohne Zeile: Paid-Event → ok, Free-Event → 403 (Theme-Prüfung mit `unlockedThemesFor(e, plan)` aus `getEventPlanInfo`)
- [ ] **Step 2:** `npx vitest run src/lib src/services` → FAIL
- [ ] **Step 3:** Implementieren. Bestehende Aufrufer von `validateFixedDate` (`parseDateModeRequest`, `date-poll-form`) übergeben `today`. Das Fenster prüft der Service, nicht das Formular, weil das Formular Plan und Erstellungsdatum über `DateSettings` bekommt (Task 8).
- [ ] **Step 4:** → PASS

---

### Task 6: Nur noch lesen ab „vorbei“

**Files:**
- Create: `src/services/event-lifecycle-service.ts`, `src/services/event-lifecycle-service.test.ts`
- Modify: `src/repositories/event-repository.ts`: `getLifecycleInput(id): Promise<LifecycleInput | undefined>` (inkl. `max(date_poll_options.date)`, `createdOn` via `todayInBerlin(createdAt)`)
- Modify: `src/services/guest-service.ts`, `src/services/poll-vote-service.ts` (`checkWrite`), `src/services/event-service.ts` (`updateEventForOwner`), `src/services/date-mode-service.ts` (`changeDateMode`), `src/services/password-request-service.ts`

**Interfaces:**
- Produces: `EVENT_OVER_ERROR = "Dieses Event ist vorbei."`
- Produces: `getEventLifecycle(eventId): Promise<{ stichtag: string; stage: LifecycleStage; deletionDate: string } | undefined>`
- Produces: `denyIfOver(eventId: string): Promise<{ ok: false; status: 409; error: string } | null>`

- [ ] **Step 1: Failing tests:** `denyIfOver` mit gemocktem `getLifecycleInput` und `todayInBerlin`: aktiv → `null`; Stichtag gestern → 409; Abstimmung mit Vorschlägen gestern + in 5 Tagen → `null` (Review Focus 3). In `guest-service.test.ts` und `poll-vote-service.test.ts` je ein Fall: vorbei → 409 `EVENT_OVER_ERROR`, Repository-Schreibfunktion nicht aufgerufen.
- [ ] **Step 2:** → FAIL
- [ ] **Step 3:** `denyIfOver` als erste Prüfung nach dem Existenz-Check in alle genannten Schreibpfade einbauen. **Nicht** in `deleteEventForOwner`.
- [ ] **Step 4:** `npx vitest run` → PASS

---

### Task 7: Dummy-Käufe (API)

**Files:**
- Create: `src/lib/payments.ts` – `isDummyPaymentEnabled(): boolean`
- Create: `src/services/purchase-service.ts`, `src/services/purchase-service.test.ts`
- Create: `src/repositories/purchase-repository.ts`
- Create: `src/app/api/purchases/route.ts` (POST, angemeldet + AGB akzeptiert wie `api/events/route.ts`)

**Interfaces:**
- Produces: Body `{ product: "paid_event" } | { product: "event_upgrade"; eventId: string } | { product: "theme"; theme: ThemeKey } | { product: "no_badge"; eventId: string }`
- Produces: `purchase(userId: string, body: unknown): Promise<{ ok: true; data: { usedCredit: boolean } } | { ok: false; status: number; error: string }>`
  - `paid_event`: Dummy nötig → Zeile `paid_event`, `source 'dummy'`, unverbraucht
  - `theme`: Dummy nötig, schon freigeschaltet → ok ohne neue Zeile
  - `event_upgrade`: Owner, `plan = 'free'` (sonst 409 „Dieses Event ist schon freigeschaltet.“), `denyIfOver`. Transaktion mit User-Lock: unverbrauchtes Guthaben vorhanden → verbrauchen (`usedCredit: true`, **auch ohne Dummy**); sonst Dummy → Zeile schreiben und sofort verbrauchen; sonst 403. Danach `events.plan = 'paid'`.
  - `no_badge`: Owner, `denyIfOver`, Dummy nötig, schon `badge_hidden` → ok ohne neue Zeile. Transaktion: Zeile `no_badge` mit `consumed_event_id`/`consumed_at` + `events.badge_hidden = true`. Plan des Events egal.
  - Dummy aus → 403 „Käufe sind bald verfügbar.“
- Repository: `insertEntitlement(...)`, `upgradeEventToPaid(eventId, userId, useDummy: boolean): Promise<"used_credit" | "purchased" | "no_credit">`

- [ ] **Step 1: Failing tests** für jede Zeile oben, `PAYMENTS_DUMMY` per `vi.stubEnv`.
- [ ] **Step 2:** → FAIL · **Step 3:** implementieren · **Step 4:** → PASS
- [ ] **Step 5:** `PAYMENTS_DUMMY=true` in `.env.local`. **Nutzer fragen**, ob ich es auf Vercel (Production + Preview) setze oder er selbst.

---

### Task 8: Freischalt-Dialog und gesperrte Stellen im Client

**Files:**
- Create: `src/components/UnlockDialog.tsx`
- Modify: `src/components/DateModeFields.tsx` (Props `lockedModes?: DateMode[]`, `onLockedClickAction?: () => void`)
- Modify: `src/components/DateSettingsDialog.tsx`, `src/lib/date-poll-form.ts` (`DateSettings` + `plan`, `maxDate`)
- Modify: `src/components/EventDialog.tsx` (Create: Termin-Block; Theme-Sperre → Dialog)
- Modify: `src/components/CreateEventButton.tsx`, `src/components/EventList.tsx`, `src/app/page.tsx`
- Modify: `src/app/event/[slug]/page.tsx`, `src/components/Header.tsx`/`ThemeEditButton.tsx` (Durchreichen)

**Interfaces:**
- Consumes: `POST /api/purchases` (Task 7), `PRODUCTS`/`formatPrice` (Task 3), `POST /api/events` mit `paid` (Task 4)
- Produces: `UnlockDialog({ kind: "event" | "credit" | "theme" | "no_badge"; eventId?: string; theme?: ThemeKey; eventCredits: number; dummyPayments: boolean; onUnlockedAction: () => void; onCloseAction: () => void })`
  - Inhalt: was man bekommt (event/credit: „Alle Designs, Termin abstimmen lassen, Termin offen lassen, Datum bis 12 Monate im Voraus“; theme: Design-Vorschau + beide Wege, siehe Step 4), Preis via `formatPrice`, Hinweis „Testphase – es wird nichts berechnet“.
  - Button: `kind === "event" && eventCredits > 0` → „Mit vorhandenem Event-Guthaben freischalten“; sonst `dummyPayments` → „Freischalten (Test, ohne Zahlung)“; sonst Text „Bald verfügbar“.
- Server-Seiten reichen `dummyPayments = isDummyPaymentEnabled()` und `eventCredits` als Props.

- [ ] **Step 1:** `DateModeFields`: gesperrte Modi abgedimmt mit `LockIcon` (wie die Theme-Kacheln), Klick → `onLockedClickAction`. Zusätzlich `<input type="date" min={today} max={maxDate}>`.
- [ ] **Step 2:** `DateSettingsDialog`: Free-Event → `lockedModes={["unknown","poll"]}`, Dialog `kind="event"`, danach `router.refresh()`. Bei Fenster-Fehler unter der Meldung der Button „Mehr Zeit? Event freischalten“.
- [ ] **Step 3:** `EventDialog` Create: neuer Prop `createPlan: EventPlan`. Bei `"free"` Termin-Block mit `DateModeFields` (Modus vorbelegt `fixed`, gesperrt `unknown`/`poll`); gesperrter Klick → `UnlockDialog kind="credit"`, nach Erfolg `paid = true` und alle Modi frei. Body: `date` aus `buildDateModeRequest`, `paid`. Bei `"paid"` wie heute (`unknown`).
- [ ] **Step 4:** Theme-Sperre (`setLockHint("…bald freischalten.")`) → `UnlockDialog kind="theme"` mit zwei Wegen: „Nur dieses Design – 0,99 €“ (`product: "theme"`) und „Ganzes Event freischalten – 2,99 €, alle Designs inklusive“ (Edit-Modus: `event_upgrade` mit `eventId`; Create-Modus: `paid_event`-Guthaben + `paid = true`). Danach Theme auswählbar (lokal Liste aktualisieren + `router.refresh()`). Alle Seiten reichen `unlockedThemesFor(entitlements, plan)` statt `unlockedThemes` durch; Create mit `createPlan="paid"` → alle Themes.
- [ ] **Step 5:** `CreateEventButton`: `limitReached` → Button bleibt klickbar (Schloss-Icon), öffnet `UnlockDialog kind="credit"`, danach `EventDialog` mit `createPlan="paid"`. `EventList`: `limitReached = !canCreateEvent(entitlements)` aus Props; nach Löschen **nicht** neu berechnen.
- [ ] **Step 6:** „Ohne GASTZILLA-Hinweis“: `MadeWithBadge` bekommt `hidden?: boolean` (blendet nur das Logo-`Link` aus, Teilen-Buttons und `LegalLinks` bleiben) und `onRemoveAction?: () => void` (nur Owner: kleines X-Button oben rechts am Logo, `aria-label="GASTZILLA-Hinweis entfernen"`). `Footer` reicht beides durch. Die Event-Seite übergibt `badgeHidden` und für den Owner (Stufe aktiv, nicht `badgeHidden`) den Klick → `UnlockDialog kind="no_badge"` → `router.refresh()`.
- [ ] **Step 7:** `npx tsc --noEmit` und `npm run lint` → sauber. Browser-Prüfung in Task 11.

---

### Task 9: Event-Seite und Übersicht nach Stufe

**Files:**
- Create: `src/components/EventExpiredPage.tsx`, `src/components/EventOverNotice.tsx`
- Modify: `src/app/event/[slug]/page.tsx`, `src/app/event/[slug]/layout.tsx` (Metadaten), `src/app/event/[slug]/opengraph-image.tsx`, `src/app/event/[slug]/info/page.tsx`
- Modify: `src/components/Hero.tsx`, `GuestSection.tsx`, `DatePollSection.tsx`, `Footer.tsx`, `Header.tsx` (Prop `readOnly`)
- Modify: `src/repositories/event-repository.ts` (`getEventsByOwner` + `plan`, Lifecycle-Felder), `src/app/page.tsx`, `src/components/EventList.tsx`

**Interfaces:**
- Consumes: `getEventLifecycle` (Task 6)

- [ ] **Step 1:** Seite: `stage === "expired"` und nicht Owner → `<EventExpiredPage />` („Diese Einladung ist abgelaufen.“, Link zur Startseite, keine Eventdaten). Metadaten und OG-Bild in diesem Fall: nur „Abgelaufene Einladung“, kein Titel, kein Datum.
- [ ] **Step 2:** `stage !== "active"`: `readOnly` an alle Bearbeitungs-Komponenten (kein Stift, kein Theme-Button, keine Gast-/Abstimmungs-Buttons). Gäste sehen `EventOverNotice` „Diese Party war am {Datum}.“. Owner sieht „Dieses Event ist vorbei und wird am {Löschdatum} gelöscht.“
- [ ] **Step 3:** Übersicht (`EventList`): pro Event kleiner Hinweis „Vorbei · wird am {TT.MM.JJJJ} gelöscht“ bzw. bei Free-Event ein Badge „Free“ und bei bezahltem keiner.
- [ ] **Step 4:** `npx tsc --noEmit`, `npm run lint` → sauber.

---

### Task 10: Täglicher Job – Erinnerungen und Löschung

**Files:**
- Create: `src/lib/lifecycle-mails.ts`, `src/lib/lifecycle-mails.test.ts`
- Create: `src/services/lifecycle-job-service.ts`, `src/services/lifecycle-job-service.test.ts`
- Create: `src/app/api/cron/event-lifecycle/route.ts`
- Modify: `src/repositories/event-repository.ts` (`getAllLifecycleRows()`, `markMailSent(id, kind)`, `deleteEventById(id)`), `src/services/notification-service.ts`, `vercel.json`

**Interfaces:**
- Produces: `type LifecycleMail = "deletion_notice" | "date_reminder" | "poll_reminder"`
- Produces: `dueMail(row: LifecycleInput & { deletionNoticeSentAt: Date | null; dateReminderSentAt: Date | null }, today: string): LifecycleMail | null`
  - `deletion_notice`: `today >= deletionDate − 7`, nicht gesendet
  - `date_reminder`: kein Datum (`unknown` oder `fixed` ohne Datum), Stufe aktiv, `today >= stichtag − 30`, nicht gesendet
  - `poll_reminder`: `poll`, Stufe aktiv, `today >= latestPollDate − 3`, `createdOn <= today − 3`, nicht gesendet (`date_reminder_sent_at` gilt für beide)
- Produces: `runLifecycleJob(today: string): Promise<{ mailed: number; deleted: number }>`: erst löschen (`isDueForDeletion`), dann pro restlichem Event `dueMail` → senden → `markMailSent`. Fehler bei einer Mail stoppt den Rest nicht.
- Route: `GET`, `Authorization: Bearer ${process.env.CRON_SECRET}`, sonst 401. `vercel.json`: `"crons": [{ "path": "/api/cron/event-lifecycle", "schedule": "0 5 * * *" }]`.
- Mails (Betreff exakt laut Spec): `sendDeletionNotice(event, deletionDate)`, `sendDateReminder(event, stichtag)`, `sendPollReminder(event, latestPollDate)` in `notification-service.ts`, Link zur Event-Seite bzw. Startseite.

- [ ] **Step 1: Failing tests** `dueMail`: jede Regel an ihrer Grenze (Tag davor `null`, Tag selbst Mail), schon gesendet → `null`, Abstimmung erst 2 Tage alt → `null`. `runLifecycleJob`: zweimal hintereinander → Mails nur einmal (Review Focus 5); Stichtag vor 100 Tagen → gelöscht; Mail-Fehler → übrige laufen weiter.
- [ ] **Step 2:** → FAIL · **Step 3:** implementieren · **Step 4:** → PASS
- [ ] **Step 5: Nutzer fragen**, ob ich `CRON_SECRET` auf Vercel setze oder er selbst.

---

### Task 11: Texte, Recht, Prüfung im Browser

**Files:**
- Modify: `src/components/PrivacyPolicyContent.tsx` (Abschnitt 15 „Speicherdauer“), `src/components/TermsContent.tsx` (Leistungsbeschreibung), `src/lib/legal-info.ts` (`TERMS_VERSION`, `PRIVACY_VERSION` = `"2026-11-02"`)
- Modify: `src/lib/faq.ts`, `src/components/LandingContent.tsx`, `src/app/llms.txt`, ggf. `src/lib/occasions.ts` – **mit Skill `optimizing-seo-aeo-geo`**

- [ ] **Step 1:** Datenschutz: Events, Gästeeinträge und Abstimmungen werden 90 Tage nach dem Stichtag automatisch gelöscht. Stichtag in einem Satz erklären. AGB: ein kostenloses Event pro Konto, einmalig, festes Datum innerhalb von 3 Monaten; automatische Löschung. Hinweis an den Nutzer: `hasAcceptedTerms` prüft keine Version, Bestandsnutzer werden also **nicht** erneut gefragt.
- [ ] **Step 2:** FAQ „Ist GASTZILLA kostenlos?“ und weitere öffentliche Stellen, die Terminabstimmung oder mehrere Events als kostenlos darstellen, per Skill überarbeiten.
- [ ] **Step 3:** `npx vitest run`, `npx tsc --noEmit`, `npm run lint`, `npm run build` → alles grün.
- [ ] **Step 4: Browser** (Dev-Server per `preview_start`, danach wieder stoppen). **Vorher Nutzer fragen**, mit welchem Testkonto (Produktions-DB). Prüfen: Free-Event erstellen nur mit Datum ≤ 3 Monate; gesperrte Modi → Dialog mit Preis → freischalten → Abstimmung möglich; gesperrter „Event erstellen“ → Guthaben → erstellen; gesperrtes Design → freischalten; X am Abzeichen → Dialog 0,99 € → Abzeichen weg, auch im Inkognito-Tab, Rechtslinks noch da; Owner-Ansicht eines vorbei-Events (bestehende Events von vor 50/59 Tagen: „abgelaufen“) read-only mit Löschdatum; Gastansicht im Inkognito-Tab zeigt „abgelaufen“. Cron-Route lokal mit Header aufrufen → JSON `{ mailed, deleted }`, ohne Header → 401.
