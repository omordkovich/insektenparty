# Layered Architecture (Event/Guest Repositories & Services) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce a lightweight layered structure (`repositories/` for DB access, `services/` for business rules) for the `parties` ("Event") and `guests` domains, so API routes and Server Components stop mixing HTTP handling, business rules, and raw Drizzle queries in one place.

**Architecture:** Classic 3-tier layering (Repository Pattern + Service Layer Pattern), no classes, no dependency injection/interfaces. `api/**/route.ts` handlers stay thin (parse request, call a service, return `NextResponse`). Server Components call repository functions directly for plain reads. Services call repositories; repositories are 1:1 wrappers around Drizzle queries for one table each. New files use "Event" naming (matching the app's existing Party→Event UI rename); the underlying Drizzle table stays `parties` (not renamed — out of scope).

**Tech Stack:** Next.js 16 (App Router), Drizzle ORM (`postgres-js`), Supabase Auth, TypeScript. No test framework exists in this project — verification is `tsc --noEmit` + `eslint` + `next build` + manual live checks via the Claude Browser tools, matching how every prior change in this project has been verified.

**Spec:** `docs/superpowers/specs/2026-09-18-layered-architecture-design.md`

## Global Constraints

- No behavior change: HTTP status codes, error messages (German), response JSON shapes callers rely on, and DB schema must stay exactly as they are today — this is a pure internal restructuring.
- New files/functions for the `parties` domain are named "Event" (`event-repository.ts`, `event-service.ts`, `getEventBySlug`, `createEvent`, ...). The Drizzle table stays `parties` / `partyId`.
- No classes, no interfaces, no dependency injection. Plain exported async functions only, matching the rest of the codebase (`getDb()`, `validation.ts`).
- `repositories/*` return raw Drizzle rows (or thin projections); `services/*` do validation, business rules, and shape DTOs.
- Every task must leave the app in a working, verifiable state (`tsc --noEmit`, `eslint`, `next build` all clean) before moving to the next task.
- Disposable test accounts: use the Supabase project id `znwlcmfrxtcfvesgbudg` and anon key `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpud2xjbWZyeHRjZnZlc2didWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NzY0NzIsImV4cCI6MjA4NDQ1MjQ3Mn0.XM2A4PmHyck34dZEFmU6FITKFBeLvNQGd11VyVUTezQ` for any signup/login used in live verification; always clean up (delete `public.parties`, `public.profiles`, `auth.users` rows for that test account) after each live check.

---

### Task 1: Event repository

**Files:**
- Create: `src/repositories/event-repository.ts`

**Interfaces:**
- Consumes: `getDb()` from `@/db`, `parties` table from `@/db/schema`.
- Produces (used by Task 2, Task 5, Task 6, Task 10):
  - `type EventRow = typeof parties.$inferSelect`
  - `type EventListItem = { id: string; slug: string; title: string; theme: string }`
  - `getEventBySlug(slug: string): Promise<EventRow | undefined>`
  - `eventExistsById(id: string): Promise<boolean>`
  - `getEventsByOwner(ownerId: string): Promise<EventListItem[]>`
  - `createEvent(input: { ownerId: string; slug: string; theme: string; title: string }): Promise<{ slug: string }>`
  - `updateEvent(id: string, ownerId: string, fields: Partial<typeof parties.$inferInsert>): Promise<EventRow | undefined>`
  - `deleteEvent(id: string, ownerId: string): Promise<{ id: string } | undefined>`

- [ ] **Step 1: Write the repository file**

```ts
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { parties } from "@/db/schema";

export type EventRow = typeof parties.$inferSelect;

export async function getEventBySlug(slug: string): Promise<EventRow | undefined> {
  const [event] = await getDb().select().from(parties).where(eq(parties.slug, slug));
  return event;
}

export async function eventExistsById(id: string): Promise<boolean> {
  const [event] = await getDb()
    .select({ id: parties.id })
    .from(parties)
    .where(eq(parties.id, id));
  return !!event;
}

export type EventListItem = {
  id: string;
  slug: string;
  title: string;
  theme: string;
};

export async function getEventsByOwner(ownerId: string): Promise<EventListItem[]> {
  return getDb()
    .select({ id: parties.id, slug: parties.slug, title: parties.title, theme: parties.theme })
    .from(parties)
    .where(eq(parties.ownerId, ownerId))
    .orderBy(desc(parties.createdAt));
}

export async function createEvent(input: {
  ownerId: string;
  slug: string;
  theme: string;
  title: string;
}): Promise<{ slug: string }> {
  const [created] = await getDb()
    .insert(parties)
    .values({
      ownerId: input.ownerId,
      slug: input.slug,
      theme: input.theme,
      kicker: "",
      title: input.title,
      greeting: "",
      dateLabel: "",
      timeLabel: "",
      locationLabel: "",
      defaultArrivalTime: "",
      eventDate: null,
      eventStartTime: null,
      eventEndTime: null,
      contactName: "",
      contactPhone: "",
      contactEmail: "",
    })
    .returning({ slug: parties.slug });
  return created;
}

export async function updateEvent(
  id: string,
  ownerId: string,
  fields: Partial<typeof parties.$inferInsert>,
): Promise<EventRow | undefined> {
  const [updated] = await getDb()
    .update(parties)
    .set({ ...fields, updatedAt: new Date() })
    .where(and(eq(parties.id, id), eq(parties.ownerId, ownerId)))
    .returning();
  return updated;
}

export async function deleteEvent(
  id: string,
  ownerId: string,
): Promise<{ id: string } | undefined> {
  const [deleted] = await getDb()
    .delete(parties)
    .where(and(eq(parties.id, id), eq(parties.ownerId, ownerId)))
    .returning({ id: parties.id });
  return deleted;
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 3: Verify lint**

Run: `npx eslint src/repositories/event-repository.ts`
Expected: no output (clean).

- [ ] **Step 4: Commit**

```bash
git add src/repositories/event-repository.ts
git commit -m "Add event-repository.ts wrapping parties table Drizzle queries"
```

---

### Task 2: Event service

**Files:**
- Create: `src/services/event-service.ts`

**Interfaces:**
- Consumes: `EventRow`, `createEvent`, `updateEvent`, `deleteEvent` from `@/repositories/event-repository` (Task 1); `generateSlug` from `@/lib/slug`; `formatDateLabel`, `formatTimeLabel` from `@/lib/calendar`; `THEME_LABELS`, `ThemeKey` from `@/lib/theme-presets`; `isPartyFieldKey`, `validateEventDate`, `validateEventTime`, `validatePartyField`, `PartyFieldKey` from `@/lib/validation`.
- Produces (used by Task 3, Task 4):
  - `type EventServiceResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string }`
  - `createEventForOwner(ownerId: string, input: { theme: unknown; title: unknown }): Promise<EventServiceResult<{ slug: string }>>`
  - `updateEventForOwner(id: string, ownerId: string, body: Record<string, unknown>): Promise<EventServiceResult<EventRow>>`
  - `deleteEventForOwner(id: string, ownerId: string): Promise<EventServiceResult<{ ok: true }>>`

- [ ] **Step 1: Write the service file**

```ts
import { formatDateLabel, formatTimeLabel } from "@/lib/calendar";
import { generateSlug } from "@/lib/slug";
import { THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";
import {
  isPartyFieldKey,
  validateEventDate,
  validateEventTime,
  validatePartyField,
  type PartyFieldKey,
} from "@/lib/validation";
import {
  createEvent,
  deleteEvent,
  updateEvent,
  type EventRow,
} from "@/repositories/event-repository";

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];

export type EventServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export async function createEventForOwner(
  ownerId: string,
  input: { theme: unknown; title: unknown },
): Promise<EventServiceResult<{ slug: string }>> {
  const { theme, title } = input;

  if (typeof theme !== "string" || !THEME_KEYS.includes(theme as ThemeKey)) {
    return { ok: false, status: 400, error: "Ungültiges Theme." };
  }

  const titleValidation = validatePartyField("title", title);
  if (!titleValidation.ok) {
    return { ok: false, status: 400, error: titleValidation.error };
  }
  if (!titleValidation.value) {
    return {
      ok: false,
      status: 400,
      error: "Bitte gib einen Namen für dein Event ein.",
    };
  }

  const slug = generateSlug(titleValidation.value);
  const created = await createEvent({
    ownerId,
    slug,
    theme,
    title: titleValidation.value,
  });

  return { ok: true, data: { slug: created.slug } };
}

export async function updateEventForOwner(
  id: string,
  ownerId: string,
  body: Record<string, unknown>,
): Promise<EventServiceResult<EventRow>> {
  const updates: Partial<Record<PartyFieldKey, string>> = {};
  let themeUpdate: ThemeKey | undefined;
  let eventDateUpdate: string | null | undefined;
  let eventStartTimeUpdate: string | null | undefined;
  let eventEndTimeUpdate: string | null | undefined;

  for (const [key, rawValue] of Object.entries(body)) {
    if (key === "theme") {
      if (typeof rawValue !== "string" || !THEME_KEYS.includes(rawValue as ThemeKey)) {
        return { ok: false, status: 400, error: "Ungültiges Theme." };
      }
      themeUpdate = rawValue as ThemeKey;
      continue;
    }
    if (key === "eventDate") {
      const validation = validateEventDate(rawValue);
      if (!validation.ok) {
        return { ok: false, status: 400, error: validation.error };
      }
      eventDateUpdate = validation.value;
      continue;
    }
    if (key === "eventStartTime" || key === "eventEndTime") {
      const validation = validateEventTime(rawValue);
      if (!validation.ok) {
        return { ok: false, status: 400, error: validation.error };
      }
      if (key === "eventStartTime") {
        eventStartTimeUpdate = validation.value;
      } else {
        eventEndTimeUpdate = validation.value;
      }
      continue;
    }
    if (!isPartyFieldKey(key)) continue;
    const validation = validatePartyField(key, rawValue);
    if (!validation.ok) {
      return { ok: false, status: 400, error: validation.error };
    }
    updates[key] = validation.value;
  }

  if ((eventStartTimeUpdate !== undefined) !== (eventEndTimeUpdate !== undefined)) {
    return {
      ok: false,
      status: 400,
      error: "Start- und Endzeit müssen gemeinsam angegeben werden.",
    };
  }

  if (eventDateUpdate !== undefined) {
    updates.dateLabel = formatDateLabel(eventDateUpdate);
  }
  if (eventStartTimeUpdate !== undefined) {
    updates.timeLabel = formatTimeLabel(eventStartTimeUpdate, eventEndTimeUpdate ?? null);
  }

  const hasAnyUpdate =
    Object.keys(updates).length > 0 ||
    themeUpdate !== undefined ||
    eventDateUpdate !== undefined ||
    eventStartTimeUpdate !== undefined;

  if (!hasAnyUpdate) {
    return { ok: false, status: 400, error: "Kein gültiges Feld angegeben." };
  }

  const updated = await updateEvent(id, ownerId, {
    ...updates,
    ...(themeUpdate ? { theme: themeUpdate } : {}),
    ...(eventDateUpdate !== undefined ? { eventDate: eventDateUpdate } : {}),
    ...(eventStartTimeUpdate !== undefined ? { eventStartTime: eventStartTimeUpdate } : {}),
    ...(eventEndTimeUpdate !== undefined ? { eventEndTime: eventEndTimeUpdate } : {}),
  });

  if (!updated) {
    return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
  }

  return { ok: true, data: updated };
}

export async function deleteEventForOwner(
  id: string,
  ownerId: string,
): Promise<EventServiceResult<{ ok: true }>> {
  const deleted = await deleteEvent(id, ownerId);
  if (!deleted) {
    return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
  }
  return { ok: true, data: { ok: true } };
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 3: Verify lint**

Run: `npx eslint src/services/event-service.ts`
Expected: no output (clean).

- [ ] **Step 4: Commit**

```bash
git add src/services/event-service.ts
git commit -m "Add event-service.ts with owner-scoped create/update/delete rules"
```

---

### Task 3: Migrate `POST /api/parties` to the service layer

**Files:**
- Modify: `src/app/api/parties/route.ts`

**Interfaces:**
- Consumes: `createEventForOwner` from `@/services/event-service` (Task 2).

- [ ] **Step 1: Replace the route body**

Replace the full contents of `src/app/api/parties/route.ts` with:

```ts
import { NextResponse } from "next/server";
import { createEventForOwner } from "@/services/event-service";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const result = await createEventForOwner(userId, {
      theme: (body as { theme?: unknown })?.theme,
      title: (body as { title?: unknown })?.title,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("POST /api/parties failed:", error);
    return NextResponse.json(
      { error: "Das Event konnte nicht erstellt werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify types and lint**

Run: `npx tsc --noEmit && npx eslint src/app/api/parties/route.ts`
Expected: no output (clean).

- [ ] **Step 3: Verify production build**

Run: `npx next build`
Expected: build succeeds, route table lists `POST /api/parties` as before.

- [ ] **Step 4: Live verification**

Start the dev server (`preview_start` with the `insektenparty-dev` launch config, or reuse a running one). In the Browser pane:

1. Create a disposable test account via direct `fetch` to
   `https://znwlcmfrxtcfvesgbudg.supabase.co/auth/v1/signup` with the anon key
   from Global Constraints, a `mailinator.com` email, and a password — note the
   returned user id.
2. Confirm the email via Supabase `execute_sql`:
   `update auth.users set email_confirmed_at = now() where id = '<id>';`
3. Log in as that account through the app's own Login dialog.
4. Click "+ Event erstellen", fill in a name, pick a theme, click "Bestätigen".
5. Confirm you land on `/p/<slug>` and the title matches what you typed.
6. Also verify the error path: try creating an event with an empty name — confirm
   the dialog shows "Bitte gib einen Namen für dein Event ein." and does not navigate.

- [ ] **Step 5: Clean up test data**

Via Supabase `execute_sql`:
```sql
delete from public.parties where owner_id = '<id>';
delete from public.profiles where id = '<id>';
delete from auth.users where id = '<id>';
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/parties/route.ts
git commit -m "Migrate POST /api/parties to event-service"
```

---

### Task 4: Migrate `PATCH`/`DELETE /api/parties/[partyId]` to the service layer

**Files:**
- Modify: `src/app/api/parties/[partyId]/route.ts`

**Interfaces:**
- Consumes: `updateEventForOwner`, `deleteEventForOwner` from `@/services/event-service` (Task 2); `isUuid` from `@/lib/validation`.

- [ ] **Step 1: Replace the route body**

Replace the full contents of `src/app/api/parties/[partyId]/route.ts` with:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/validation";
import { deleteEventForOwner, updateEventForOwner } from "@/services/event-service";

type RouteContext = {
  params: Promise<{ partyId: string }>;
};

// Partial update: the body may contain any subset of the known party fields
// plus an optional "theme" (in practice either one field from the inline
// EditableField save, or {theme, title} together from EventDialog's edit
// mode). Unknown keys are ignored (see event-service.ts).
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { partyId } = await context.params;
    if (!isUuid(partyId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const result = await updateEventForOwner(partyId, userId, body as Record<string, unknown>);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("PATCH /api/parties/[partyId] failed:", error);
    return NextResponse.json(
      { error: "Das Event konnte nicht gespeichert werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { partyId } = await context.params;
    if (!isUuid(partyId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const userId = data?.claims?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
    }

    const result = await deleteEventForOwner(partyId, userId);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("DELETE /api/parties/[partyId] failed:", error);
    return NextResponse.json(
      { error: "Das Event konnte nicht gelöscht werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify types and lint**

Run: `npx tsc --noEmit && npx eslint "src/app/api/parties/[partyId]/route.ts"`
Expected: no output (clean).

- [ ] **Step 3: Verify production build**

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 4: Live verification**

Using a fresh disposable test account (same process as Task 3, Step 4):

1. Create an event, then on its page edit the Titel field (pencil → type → save) —
   confirm it updates in place.
2. Edit the Datum field via the date picker, then the Uhrzeit field via the two
   time inputs — reload the page and confirm the "Datum"/"Uhrzeit" labels show the
   formatted text (e.g. "Sonntag, 13. September 2026", "14:30 - 18:00 Uhr") and
   the "Zum Kalender hinzufügen" link now appears on the Datum field.
3. On the home screen, click the event's pencil icon, change the theme, confirm
   the CSS theme class changes on the event page after saving.
4. Delete the event via the home screen's trash icon, confirm it disappears from
   the list.
5. Verify the "start/end time together" rule: with browser dev tools or a direct
   `fetch('/api/parties/<id>', {method:'PATCH', body: JSON.stringify({eventStartTime: '09:00'})})`,
   confirm you get a 400 with "Start- und Endzeit müssen gemeinsam angegeben werden."

- [ ] **Step 5: Clean up test data**

Same as Task 3, Step 5 (delete parties/profiles/auth.users rows for the test account —
skip if already deleted in Step 4's own delete-event check).

- [ ] **Step 6: Commit**

```bash
git add "src/app/api/parties/[partyId]/route.ts"
git commit -m "Migrate PATCH/DELETE /api/parties/[partyId] to event-service"
```

---

### Task 5: Migrate the home page to `event-repository`

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getEventsByOwner` from `@/repositories/event-repository` (Task 1).

- [ ] **Step 1: Replace the imports and `myParties` query**

In `src/app/page.tsx`, replace:

```ts
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { parties } from "@/db/schema";
import { AuthButtons } from "@/components/AuthButtons";
import { Button } from "@/components/Button";
import { CreatePartyButton } from "@/components/CreatePartyButton";
import { PartyList } from "@/components/PartyList";
import { SiteHeader } from "@/components/SiteHeader";
import type { ThemeKey } from "@/lib/theme-presets";
import { createClient } from "@/lib/supabase/server";
```

with:

```ts
import { AuthButtons } from "@/components/AuthButtons";
import { Button } from "@/components/Button";
import { CreatePartyButton } from "@/components/CreatePartyButton";
import { PartyList } from "@/components/PartyList";
import { SiteHeader } from "@/components/SiteHeader";
import type { ThemeKey } from "@/lib/theme-presets";
import { createClient } from "@/lib/supabase/server";
import { getEventsByOwner } from "@/repositories/event-repository";
```

and replace:

```ts
  const myParties = claims
    ? (
        await getDb()
          .select({
            id: parties.id,
            slug: parties.slug,
            title: parties.title,
            theme: parties.theme,
          })
          .from(parties)
          .where(eq(parties.ownerId, claims.sub))
          .orderBy(desc(parties.createdAt))
      ).map((party) => ({ ...party, theme: party.theme as ThemeKey }))
    : [];
```

with:

```ts
  const myParties = claims
    ? (await getEventsByOwner(claims.sub)).map((event) => ({
        ...event,
        theme: event.theme as ThemeKey,
      }))
    : [];
```

Leave everything else in the file (the JSX, the `name` derivation, the Logout form) unchanged.

- [ ] **Step 2: Verify types and lint**

Run: `npx tsc --noEmit && npx eslint src/app/page.tsx`
Expected: no output (clean).

- [ ] **Step 3: Verify production build**

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 4: Live verification**

Log in as any existing test/real account with at least one event and confirm the
home screen still lists it (title, theme logo, edit/delete buttons) exactly as
before.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "Migrate home page owner event listing to event-repository"
```

---

### Task 6: Migrate the event page to `event-repository`

**Files:**
- Modify: `src/app/p/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getEventBySlug` from `@/repositories/event-repository` (Task 1).

- [ ] **Step 1: Replace the imports and party lookup**

In `src/app/p/[slug]/page.tsx`, replace:

```ts
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { parties } from "@/db/schema";
import { Footer } from "@/components/Footer";
```

with:

```ts
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
```

and add this import alongside the others (e.g. after the `party-config` import):

```ts
import { getEventBySlug } from "@/repositories/event-repository";
```

then replace:

```ts
  const { slug } = await params;
  const db = getDb();
  const [party] = await db.select().from(parties).where(eq(parties.slug, slug));

  if (!party) {
    notFound();
  }
```

with:

```ts
  const { slug } = await params;
  const party = await getEventBySlug(slug);

  if (!party) {
    notFound();
  }
```

Leave the rest of the file (the `config` object construction, the JSX) unchanged.

- [ ] **Step 2: Verify types and lint**

Run: `npx tsc --noEmit && npx eslint "src/app/p/[slug]/page.tsx"`
Expected: no output (clean).

- [ ] **Step 3: Verify production build**

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 4: Live verification**

Open an existing event's page (e.g. `milans7BD`), confirm it still renders fully
(header, hero with all fields, guest list, footer, theme graphics), and confirm
`notFound()` still triggers for a nonexistent slug (e.g. `/p/does-not-exist`
returns the Next.js not-found page).

- [ ] **Step 5: Commit**

```bash
git add "src/app/p/[slug]/page.tsx"
git commit -m "Migrate event page lookup to event-repository"
```

---

### Task 7: Guest repository

**Files:**
- Create: `src/repositories/guest-repository.ts`

**Interfaces:**
- Consumes: `getDb()` from `@/db`, `guests` table from `@/db/schema`, `GuestInput` type from `@/lib/validation`.
- Produces (used by Task 8):
  - `type GuestRow = typeof guests.$inferSelect`
  - `getGuestsByEventId(partyId: string): Promise<GuestRow[]>`
  - `createGuest(partyId: string, input: GuestInput): Promise<GuestRow>`
  - `updateGuest(partyId: string, guestId: string, input: GuestInput): Promise<GuestRow | undefined>`
  - `deleteGuest(partyId: string, guestId: string): Promise<{ id: string } | undefined>`

- [ ] **Step 1: Write the repository file**

```ts
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { guests } from "@/db/schema";
import type { GuestInput } from "@/lib/validation";

export type GuestRow = typeof guests.$inferSelect;

export async function getGuestsByEventId(partyId: string): Promise<GuestRow[]> {
  return getDb()
    .select()
    .from(guests)
    .where(eq(guests.partyId, partyId))
    .orderBy(asc(guests.arrivalTime), asc(guests.name));
}

export async function createGuest(partyId: string, input: GuestInput): Promise<GuestRow> {
  const [created] = await getDb()
    .insert(guests)
    .values({
      partyId,
      name: input.name,
      additionalGuests: input.additionalGuests,
      additionalGuestNames: input.additionalGuestNames,
      arrivalTime: input.arrivalTime,
      bringingSomething: input.bringingSomething,
      bringingDescription: input.bringingDescription,
      hasMessage: input.hasMessage,
      message: input.message,
    })
    .returning();
  return created;
}

export async function updateGuest(
  partyId: string,
  guestId: string,
  input: GuestInput,
): Promise<GuestRow | undefined> {
  const [updated] = await getDb()
    .update(guests)
    .set({
      name: input.name,
      additionalGuests: input.additionalGuests,
      additionalGuestNames: input.additionalGuestNames,
      arrivalTime: input.arrivalTime,
      bringingSomething: input.bringingSomething,
      bringingDescription: input.bringingDescription,
      hasMessage: input.hasMessage,
      message: input.message,
      updatedAt: new Date(),
    })
    .where(and(eq(guests.id, guestId), eq(guests.partyId, partyId)))
    .returning();
  return updated;
}

export async function deleteGuest(
  partyId: string,
  guestId: string,
): Promise<{ id: string } | undefined> {
  const [deleted] = await getDb()
    .delete(guests)
    .where(and(eq(guests.id, guestId), eq(guests.partyId, partyId)))
    .returning({ id: guests.id });
  return deleted;
}
```

- [ ] **Step 2: Verify types and lint**

Run: `npx tsc --noEmit && npx eslint src/repositories/guest-repository.ts`
Expected: no output (clean).

- [ ] **Step 3: Commit**

```bash
git add src/repositories/guest-repository.ts
git commit -m "Add guest-repository.ts wrapping guests table Drizzle queries"
```

---

### Task 8: Guest service

**Files:**
- Create: `src/services/guest-service.ts`

**Interfaces:**
- Consumes: `eventExistsById` from `@/repositories/event-repository` (Task 1); `GuestRow`, `createGuest`, `updateGuest`, `deleteGuest`, `getGuestsByEventId` from `@/repositories/guest-repository` (Task 7); `getRecaptchaToken`, `verifyRecaptchaToken` from `@/lib/recaptcha`; `normalizeArrivalTime`, `validateGuestInput` from `@/lib/validation`; `GuestDto` from `@/lib/types`.
- Produces (used by Task 9):
  - `type GuestServiceResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string }`
  - `listGuestsForEvent(partyId: string): Promise<GuestDto[]>`
  - `createGuestForEvent(partyId: string, body: unknown): Promise<GuestServiceResult<GuestDto>>`
  - `updateGuestForEvent(partyId: string, guestId: string, body: unknown): Promise<GuestServiceResult<GuestDto>>`
  - `deleteGuestForEvent(partyId: string, guestId: string): Promise<GuestServiceResult<{ ok: true }>>`

- [ ] **Step 1: Write the service file**

```ts
import { getRecaptchaToken, verifyRecaptchaToken } from "@/lib/recaptcha";
import type { GuestDto } from "@/lib/types";
import { normalizeArrivalTime, validateGuestInput } from "@/lib/validation";
import { eventExistsById } from "@/repositories/event-repository";
import {
  createGuest,
  deleteGuest,
  getGuestsByEventId,
  updateGuest,
  type GuestRow,
} from "@/repositories/guest-repository";

export type GuestServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

function toGuestDto(row: GuestRow): GuestDto {
  return {
    id: row.id,
    name: row.name,
    additionalGuests: row.additionalGuests,
    additionalGuestNames: row.additionalGuestNames,
    arrivalTime: normalizeArrivalTime(String(row.arrivalTime)),
    bringingSomething: row.bringingSomething,
    bringingDescription: row.bringingDescription,
    hasMessage: row.hasMessage,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listGuestsForEvent(partyId: string): Promise<GuestDto[]> {
  const rows = await getGuestsByEventId(partyId);
  return rows.map(toGuestDto);
}

export async function createGuestForEvent(
  partyId: string,
  body: unknown,
): Promise<GuestServiceResult<GuestDto>> {
  const recaptcha = await verifyRecaptchaToken(getRecaptchaToken(body));
  if (!recaptcha.ok) {
    return { ok: false, status: recaptcha.status, error: recaptcha.error };
  }

  const validation = validateGuestInput(body);
  if (!validation.ok) {
    return { ok: false, status: 400, error: validation.error };
  }

  const exists = await eventExistsById(partyId);
  if (!exists) {
    return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
  }

  const created = await createGuest(partyId, validation.data);
  return { ok: true, data: toGuestDto(created) };
}

export async function updateGuestForEvent(
  partyId: string,
  guestId: string,
  body: unknown,
): Promise<GuestServiceResult<GuestDto>> {
  const recaptcha = await verifyRecaptchaToken(getRecaptchaToken(body));
  if (!recaptcha.ok) {
    return { ok: false, status: recaptcha.status, error: recaptcha.error };
  }

  const validation = validateGuestInput(body);
  if (!validation.ok) {
    return { ok: false, status: 400, error: validation.error };
  }

  const updated = await updateGuest(partyId, guestId, validation.data);
  if (!updated) {
    return { ok: false, status: 404, error: "Gast wurde nicht gefunden." };
  }

  return { ok: true, data: toGuestDto(updated) };
}

export async function deleteGuestForEvent(
  partyId: string,
  guestId: string,
): Promise<GuestServiceResult<{ ok: true }>> {
  const deleted = await deleteGuest(partyId, guestId);
  if (!deleted) {
    return { ok: false, status: 404, error: "Gast wurde nicht gefunden." };
  }
  return { ok: true, data: { ok: true } };
}
```

- [ ] **Step 2: Verify types and lint**

Run: `npx tsc --noEmit && npx eslint src/services/guest-service.ts`
Expected: no output (clean).

- [ ] **Step 3: Commit**

```bash
git add src/services/guest-service.ts
git commit -m "Add guest-service.ts with recaptcha/validation/DTO rules"
```

---

### Task 9: Migrate guest routes to the service layer

**Files:**
- Modify: `src/app/api/parties/[partyId]/guests/route.ts`
- Modify: `src/app/api/parties/[partyId]/guests/[guestId]/route.ts`

**Interfaces:**
- Consumes: `listGuestsForEvent`, `createGuestForEvent`, `updateGuestForEvent`, `deleteGuestForEvent` from `@/services/guest-service` (Task 8); `isUuid` from `@/lib/validation`.

**Important — preserve existing behavior exactly:** neither the guest list/create
route nor the guest update/delete route currently checks Supabase auth at all
(RSVP is anonymous, guarded only by reCAPTCHA; the owner-only guest management
buttons on the event page work because only the owner is shown those buttons in
the UI — there is no server-side owner check on these specific endpoints today).
Do **not** add one as part of this migration.

- [ ] **Step 1: Replace `src/app/api/parties/[partyId]/guests/route.ts`**

```ts
import { NextResponse } from "next/server";
import { isUuid } from "@/lib/validation";
import { createGuestForEvent, listGuestsForEvent } from "@/services/guest-service";

type RouteContext = {
  params: Promise<{ partyId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { partyId } = await context.params;
    if (!isUuid(partyId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    const guests = await listGuestsForEvent(partyId);
    return NextResponse.json(guests);
  } catch (error) {
    console.error("GET /api/parties/[partyId]/guests failed:", error);
    return NextResponse.json(
      { error: "Die Gästeliste konnte nicht geladen werden." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { partyId } = await context.params;
    if (!isUuid(partyId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const result = await createGuestForEvent(partyId, body);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("POST /api/parties/[partyId]/guests failed:", error);
    return NextResponse.json(
      {
        error: "Der Gast konnte nicht gespeichert werden. Bitte versuche es erneut.",
      },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Replace `src/app/api/parties/[partyId]/guests/[guestId]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { isUuid } from "@/lib/validation";
import { deleteGuestForEvent, updateGuestForEvent } from "@/services/guest-service";

type RouteContext = {
  params: Promise<{ partyId: string; guestId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { partyId, guestId } = await context.params;
    if (!isUuid(partyId) || !isUuid(guestId)) {
      return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const result = await updateGuestForEvent(partyId, guestId, body);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("PATCH /api/parties/[partyId]/guests/[guestId] failed:", error);
    return NextResponse.json(
      {
        error: "Der Gast konnte nicht gespeichert werden. Bitte versuche es erneut.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { partyId, guestId } = await context.params;
    if (!isUuid(partyId) || !isUuid(guestId)) {
      return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
    }

    const result = await deleteGuestForEvent(partyId, guestId);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("DELETE /api/parties/[partyId]/guests/[guestId] failed:", error);
    return NextResponse.json(
      {
        error: "Der Gast konnte nicht gelöscht werden. Bitte versuche es erneut.",
      },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 3: Verify types and lint**

Run:
```bash
npx tsc --noEmit
npx eslint "src/app/api/parties/[partyId]/guests/route.ts" "src/app/api/parties/[partyId]/guests/[guestId]/route.ts"
```
Expected: no output (clean).

- [ ] **Step 4: Verify production build**

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 5: Live verification**

On any existing event's page (no login required for RSVP):

1. Add a guest via "+ Gast hinzufügen" (fill name, arrival time, pass the
   reCAPTCHA checkbox) — confirm it appears in the list immediately.
2. Edit that guest (pencil icon) — change the name, save, confirm it updates.
3. Delete that guest (trash icon) — confirm it disappears.
4. Reload the page and confirm the guest list still loads (GET still works
   without auth).

- [ ] **Step 6: Commit**

```bash
git add "src/app/api/parties/[partyId]/guests/route.ts" "src/app/api/parties/[partyId]/guests/[guestId]/route.ts"
git commit -m "Migrate guest routes to guest-service"
```

---

### Task 10: Cleanup — remaining direct DB access and final sweep

**Files:**
- Modify: `src/app/p/[slug]/layout.tsx`

**Interfaces:**
- Consumes: `getEventBySlug` from `@/repositories/event-repository` (Task 1).

- [ ] **Step 1: Replace `src/app/p/[slug]/layout.tsx`**

This file currently runs the same `parties` lookup twice (once in
`generateMetadata`, once in the layout component) via direct `getDb()` calls.
Replace the full file with:

```ts
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { THEME_CLASS_NAMES, type ThemeKey } from "@/lib/theme-presets";
import { getEventBySlug } from "@/repositories/event-repository";
import React from "react";

type PartyLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const party = await getEventBySlug(slug);

  if (!party) {
    return { title: "Event nicht gefunden" };
  }

  return {
    title: `${party.title} - Einladung`,
    description: `Digitale Einladung: Infos ansehen und Gästeliste verwalten.`,
  };
}

export default async function PartyLayout({ children, params }: PartyLayoutProps) {
  const { slug } = await params;
  const party = await getEventBySlug(slug);

  if (!party) {
    notFound();
  }

  const themeClassName = THEME_CLASS_NAMES[party.theme as ThemeKey];

  return <div className={themeClassName}>{children}</div>;
}
```

- [ ] **Step 2: Sweep for remaining direct DB access outside the new layers**

Run:
```bash
grep -rn "getDb()" src/app src/components 2>/dev/null
```
Expected: no matches (every remaining `getDb()` call should live inside
`src/repositories/*.ts` or `src/db/index.ts` itself). If any route/page still
calls `getDb()` directly, that indicates a spot this plan missed — stop and
report it rather than silently leaving it.

- [ ] **Step 3: Verify types and lint**

Run: `npx tsc --noEmit && npx eslint "src/app/p/[slug]/layout.tsx"`
Expected: no output (clean).

- [ ] **Step 4: Verify production build**

Run: `npx next build`
Expected: build succeeds, same route table as before this plan started.

- [ ] **Step 5: Live verification — full regression pass**

1. Open an existing event page (e.g. `milans7BD`) — confirm the browser tab
   title is `"<title> - Einladung"` and the page renders fully.
2. Open a nonexistent slug (`/p/does-not-exist`) — confirm the Next.js
   not-found page renders (not a crash).
3. Re-run the Task 3/4/9 live-verification flows once more end-to-end (create
   event → edit fields/date/time/theme → add/edit/delete guest → delete event)
   with one fresh disposable test account, to confirm nothing regressed across
   the full set of changes together. Clean up the test account afterward.

- [ ] **Step 6: Commit**

```bash
git add "src/app/p/[slug]/layout.tsx"
git commit -m "Migrate event layout metadata lookup to event-repository; complete layered-architecture rollout"
```
