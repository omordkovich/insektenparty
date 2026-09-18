# Leichte Layered Architecture für GASTZILLA

**Datum:** 2026-09-18
**Status:** Genehmigt (Design), Implementierungsplan folgt

## Motivation

Business-Logik (Owner-Checks, Ableitung von Anzeige-Texten aus strukturierten Feldern
wie Datum/Uhrzeit) und Datenzugriff (Drizzle-Queries) sind aktuell direkt in den
API-Route-Handlern (`src/app/api/**/route.ts`) und teilweise in Server Components
(`src/app/page.tsx`, `src/app/p/[slug]/page.tsx`) vermischt. Das macht es schwer,
auf einen Blick zu erkennen, was "Aufbaulogik" (Struktur) und was Detail ist.

Ziel: eine klar benannte, leichte Schichtenstruktur einführen, die diese Verantwortungen
trennt — ohne die Größenordnung oder den Deployment-Ansatz des Projekts (Next.js App
Router auf Vercel, Supabase als DB/Auth) zu verändern.

## Gewählter Ansatz

**Klassische Layered Architecture (3-Schichten/N-Tier)**, konkret:
- **Service Layer Pattern** (Fowler, PoEAA) für Business-Regeln
- **Repository Pattern** für Datenzugriff

Ausdrücklich **nicht**:
- **Volle Clean Architecture** (Entities, Use-Case-Klassen, strikte Dependency
  Inversion über Interfaces, framework-unabhängiger Kern) — zu viel Ceremony für
  dieses Projekt, kämpft gegen Next.js' eigenes Modell (Server Components greifen
  bewusst direkt auf Daten zu).
- **NestJS als separates Backend** — würde eine zweite Deployment-Einheit erzwingen,
  die nicht zu Vercels serverlosem Next.js-Modell passt, Server Components den
  direkten DB-Zugriff nehmen und Supabase-Auth doppelt verdrahten.

Diese Alternativen wurden im Brainstorming besprochen und bewusst verworfen.

## Struktur

```
src/
  repositories/         # reine Funktionen, kapseln Drizzle-Queries
    event-repository.ts
    guest-repository.ts
  services/             # Business-Regeln, rufen repositories/ auf
    event-service.ts
    guest-service.ts
  lib/
    validation.ts        # bleibt unverändert - schon eine saubere eigene Schicht
  app/api/**/route.ts     # bleibt dünn: Request lesen -> Service aufrufen -> Antwort
  app/**/page.tsx          # Server Components rufen repositories/ oder services/
                            # auf statt direkt getDb()
  components/               # UI, unverändert
```

**Namenskonvention (erweitert, 2026-09-18):** "Party"/"parties" wird vollständig
aus Code und Datenbank entfernt — nicht nur in neuen Dateien. Betroffen: die
Drizzle-Tabelle `parties` → `events`, die Spalte `guests.party_id` → `event_id`,
alle Constraint-Namen, alle TypeScript-Typen/Funktionen/Props (`PartyConfig`,
`PartyFieldKey`, `partyId`, `PartyList.tsx`, `CreatePartyButton.tsx`,
`DeletePartyDialog.tsx`, ...), die API-Routen `/api/parties/**` → `/api/events/**`,
sowie CSS-Klassen (`.party-theme` → `.event-theme`). Ausgenommen bleibt bewusst nur
die Seiten-Route `/p/[slug]` (das "p" liest sich nicht als "party" und ein Umbau
würde bereits geteilte Einladungslinks brechen — z. B. `milans7BD`, `xenis37BD`).

**Kein Einsatz von:** Klassen, Interfaces/Dependency Injection, Dependency-Inversion-
Abstraktionen. `services/` rufen `repositories/` direkt auf. Grund: Es ist nicht
geplant, Drizzle/Supabase austauschbar zu machen — Interfaces dafür wären ungenutzte
Ceremony.

## Verantwortungen je Schicht

- **`repositories/`** — 1:1-Wrapper um Drizzle-Queries, keine Business-Regeln. Beispiele:
  `getEventBySlug(slug)`, `getEventsByOwner(ownerId)`, `createEvent(data)`,
  `updateEvent(id, ownerId, fields)`, `deleteEvent(id, ownerId)`.
- **`services/`** — Regeln, die mehr als eine reine DB-Abfrage sind. Beispiele:
  Owner-Check vor einem Update, Ableitung von `dateLabel`/`timeLabel` aus
  `eventDate`/`eventStartTime`/`eventEndTime` (aktuell in der PATCH-Route), Slug-
  Generierung bei Erstellung, Theme-Validierung.
- **`app/api/**/route.ts`** — nur noch: Request-Body parsen, Auth-Claims holen,
  Service-Funktion aufrufen, Ergebnis/Fehler als `NextResponse` zurückgeben.
- **Server Components** (`page.tsx`) — rufen `repositories/`-Funktionen (für reines
  Lesen) oder `services/` auf, statt `getDb()` und Drizzle-Query-Builder direkt zu
  nutzen.
- **`components/`** — unverändert, reine UI.

## Umfang & Reihenfolge (schrittweise)

Die App muss nach jedem Schritt lauffähig bleiben und wird jeweils mit
`tsc --noEmit`, `eslint` und `next build` sowie einem Live-Check im Browser verifiziert.

1. **Pilot: Events** (`parties`-Tabelle)
   - `event-repository.ts` und `event-service.ts` anlegen
   - `src/app/api/parties/route.ts`, `src/app/api/parties/[partyId]/route.ts` auf
     die neuen Schichten umstellen
   - `src/app/page.tsx` und `src/app/p/[slug]/page.tsx` auf `event-repository.ts`
     umstellen statt direktem `getDb()`-Zugriff
2. **Guests**
   - `guest-repository.ts` und `guest-service.ts` anlegen
   - `src/app/api/parties/[partyId]/guests/route.ts` und
     `.../guests/[guestId]/route.ts` umstellen
3. **Aufräumen**
   - Verbleibende direkte `getDb()`-Aufrufe außerhalb der neuen Schichten prüfen
     und entfernen
   - Sicherstellen, dass keine Logik doppelt existiert (alt inline + neu in
     Service/Repository)

## Was sich nicht ändert

- Keine Änderung an DB-Schema, API-Request-/Response-Formaten oder URLs
- Keine Änderung an `components/` (UI-Schicht)
- `src/lib/validation.ts` bleibt wie es ist
- Kein Einsatz von Klassen, Interfaces oder Dependency Injection
- Die Drizzle-Tabelle `parties` wird nicht umbenannt (siehe Namenskonvention oben)

## Verifikation

Kein bestehendes Testsuite vorhanden — Verifikation erfolgt wie im gesamten Projekt
bisher über `tsc --noEmit`, `eslint`, `next build` sowie manuelle Live-Tests im
Browser (inkl. Owner/Nicht-Owner-Fälle) nach jedem Teilschritt, mit Bereinigung
angelegter Testdaten danach.
