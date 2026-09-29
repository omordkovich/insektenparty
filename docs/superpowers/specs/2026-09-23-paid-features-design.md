# Kostenpflichtige Features (Entitlements) für GASTZILLA

**Datum:** 2026-09-23
**Status:** Genehmigt (Design), Implementierungsplan folgt

## Ziel

Nutzer sollen Features nach und nach freischalten können; jede Freischaltung wird
in der Datenbank festgehalten. Erste Features:

- **Premium-Themes:** Alle Themes sind frei, außer `natur` und `ballons`. Künftig
  kommen weitere kostenpflichtige Themes hinzu – das Design muss das ohne
  Migration erlauben.
- **Event-Kontingent:** Jeder Nutzer darf 1 Event anlegen (und seine Events
  editieren). Jedes weitere gleichzeitig existierende Event erfordert einen
  freigeschalteten Event-Slot.

**Außerhalb des Scopes:** Bezahlsystem, Preise, Admin-Oberfläche, Kauf-Buttons.
Freischaltungen werden vorerst ausschließlich manuell per SQL (Supabase Studio)
eingetragen.

## Entscheidungen

| Frage | Entscheidung |
|---|---|
| Wie wird freigeschaltet? | Nur manuell per DB. UI zeigt gesperrte Features mit Hinweis „bald freischalten“. |
| Was zählt fürs Event-Limit? | Aktuell existierende Events. Löschen gibt den Slot wieder frei. |
| Bestandsdaten? | Alles bleibt nutzbar. Regeln greifen nur bei neuen Aktionen (Event anlegen, Theme **wechseln** auf ein gesperrtes). |
| Geltungsbereich einer Freischaltung | Pro Nutzer (gilt für alle seine Events). |
| Event-Slot | Dauerhaft; erhöht das Limit gleichzeitig existierender Events um `quantity`. |
| Datenmodell | Ledger-Tabelle `user_entitlements` (Ansatz A). Verworfen: Profil-Tabelle mit Spalten (keine Historie, Schemaänderung pro Feature) und Katalog-Tabelle + Zuordnung (Vorratsaufwand, solange es keine Preise gibt). |

## Datenmodell

Neue Tabelle `user_entitlements` (Drizzle: `src/db/schema.ts`):

| Spalte | Typ | Bedeutung |
|---|---|---|
| `id` | `uuid` PK, `default gen_random_uuid()` | |
| `user_id` | `uuid not null`, FK → `auth.users(id) on delete cascade` | Nutzer |
| `feature` | `text not null` | `theme:<ThemeKey>` oder `event_slot` |
| `quantity` | `integer not null default 1`, `check (quantity > 0)` | Nur für `event_slot` relevant (+N Events); bei Themes ignoriert |
| `source` | `text not null default 'manual'` | Herkunft; später z. B. `'stripe'` |
| `note` | `text` nullable | Freitext, später z. B. Bestell-ID |
| `created_at` | `timestamptz not null default now()` | |

- Index auf `user_id`.
- `check (feature = 'event_slot' or feature like 'theme:%')` – prüft nur das
  Muster, damit neue Premium-Themes **keine Migration** brauchen.
- **RLS aktiviert, keine Policies.** Die App liest serverseitig über Drizzle
  (`DATABASE_URL`, umgeht RLS); über die öffentliche Supabase-API (Publishable Key)
  ist die Tabelle damit weder lesbar noch beschreibbar – Nutzer können sich nicht
  selbst freischalten.
- Die Tabelle ist ein Append-only-Ledger: jede Freischaltung = eine Zeile.
  Entziehen = Zeile löschen (kein Storno-Mechanismus vor dem Bezahlsystem).

**Migration:** Der `drizzle/`-Ordner ist veraltet (nur `0000` mit Alt-Tabellen).
Die Migration wird – wie bisher – über Supabase angewendet; `schema.ts` wird
synchron gehalten.

**Manuelles Freischalten (Beispiele):**

```sql
insert into user_entitlements (user_id, feature) values ('<uuid>', 'theme:natur');
insert into user_entitlements (user_id, feature, quantity, note)
  values ('<uuid>', 'event_slot', 2, 'Geschenk');
```

## Feature-Katalog im Code

- `src/lib/theme-presets.ts`: neues `PREMIUM_THEMES: readonly ThemeKey[] = ["natur", "ballons"]`.
  Ein neues Bezahl-Theme = eine Zeile hier.
- `src/lib/features.ts` (neu):
  - `FREE_EVENT_LIMIT = 1`
  - `EVENT_SLOT_FEATURE = "event_slot"`
  - `themeFeatureKey(theme: ThemeKey): string` → `` `theme:${theme}` ``
  - reine Funktionen (ohne DB-Zugriff, testbar):
    - `resolveEntitlements(rows, eventCount)` → `{ unlockedThemes: ThemeKey[], eventLimit, eventCount }`
      - `unlockedThemes` = alle Nicht-Premium-Themes + Premium-Themes mit passender Zeile
      - `eventLimit` = `FREE_EVENT_LIMIT` + Summe `quantity` aller `event_slot`-Zeilen
      - Unbekannte `feature`-Werte (z. B. `theme:` mit ungültigem Key) werden ignoriert.
    - `canUseTheme(entitlements, theme)`
    - `canCreateEvent(entitlements)` → `eventCount < eventLimit`

## Serverseitige Prüfung (Service-Schicht)

Folgt der bestehenden Layered Architecture (siehe
`2026-09-18-layered-architecture-design.md`).

**Repository**
- `src/repositories/entitlement-repository.ts` (neu): `getEntitlementRows(userId)`.
- `src/repositories/event-repository.ts`: `countEventsByOwner(ownerId)`,
  `getEventTheme(id, ownerId)` (aktuelles Theme für den Wechsel-Check).

**Service**
- `src/services/entitlement-service.ts` (neu): `getUserEntitlements(userId)` –
  lädt Zeilen + Event-Anzahl und ruft `resolveEntitlements` auf.
- `src/services/event-service.ts`:
  - `createEventForOwner`: nach der Theme-Validierung
    - `!canCreateEvent` → **403** „Du hast dein Event-Kontingent erreicht.“
    - `!canUseTheme` → **403** „Dieses Design ist noch nicht freigeschaltet.“
  - `updateEventForOwner`: wenn `theme` im Body steht **und sich vom aktuellen
    Theme unterscheidet** und `!canUseTheme` → **403** (gleiche Meldung).
    Unverändertes Theme wird nicht geprüft (Bestandsschutz; `EventDialog` sendet
    `{theme, title}` immer zusammen).
  - Feld-Edits eigener Events bleiben immer erlaubt, auch über dem Limit.

**Bekannte Einschränkung:** Zwei gleichzeitige Create-Requests können beide den
Limit-Check passieren. Bei rein manueller Freischaltung ohne Zahlung akzeptiert;
mit dem Bezahlsystem per Transaktion + Advisory-Lock nachrüsten.

## UI

**Datenfluss:** `src/app/page.tsx` lädt serverseitig `getUserEntitlements` und
reicht `eventLimit` und `unlockedThemes` an `EventList` durch; `EventList` reicht
`unlockedThemes` an `EventDialog` (create + edit) weiter. Kein neuer API-Endpunkt.

**Event-Kontingent (`EventList` / `CreateEventButton`)**
- `canCreate = eventList.length < eventLimit`, clientseitig berechnet – nach
  Löschen sofort wieder aktiv.
- Limit erreicht: Button deaktiviert, mit Schloss-Icon, darunter
  „Weitere Events kannst du bald freischalten.“
- Keine Zähleranzeige (bewusst weggelassen).

**Themen-Auswahl (`EventDialog`)**
- Gesperrte Themes bleiben sichtbar: abgedimmt + Schloss-Badge. Klick wählt nicht
  aus, sondern zeigt „Dieses Design kannst du bald freischalten.“
- Edit-Modus: Das **ursprüngliche** Theme des Events ist im Picker immer
  wählbar, auch wenn es gesperrt ist (Bestand; der Server prüft ein unverändertes
  Theme nicht). Wird ein anderes Theme gespeichert, gilt beim nächsten Öffnen
  dieses als ursprüngliches – das alte gesperrte Theme ist dann nicht mehr wählbar.
- Default beim Erstellen bleibt `THEME_KEYS[0]` (Weiß, frei).
- Server-403 wird im bestehenden `error`-Feld angezeigt.

## Tests

- **Vitest** neu einrichten (minimal: `vitest` als devDependency, `npm test`,
  Pfad-Alias `@/` wie in `tsconfig.json`).
- Unit-Tests für `src/lib/features.ts`: Nicht-Premium immer frei, Premium nur mit
  Zeile, Limit-Summe über mehrere `event_slot`-Zeilen, `quantity` bei Themes
  ignoriert, unbekannte Features ignoriert, `canCreateEvent` an der Grenze.
- Manuelle Prüfung im Browser mit per Supabase-SQL eingetragenen/entfernten
  Zeilen: Anlegen am Limit (UI + direkter POST → 403), Löschen gibt Slot frei,
  gesperrtes Theme (UI + direkter PATCH → 403), Bestandsevent mit Natur bleibt
  editierbar, Freischaltung per SQL wirkt nach Reload.
