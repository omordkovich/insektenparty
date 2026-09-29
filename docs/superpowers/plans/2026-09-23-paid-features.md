# Kostenpflichtige Features (Entitlements) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Commit policy:** **No commits, no pushes, no branches/worktrees.** Work directly in the main working tree; all changes stay uncommitted and the user commits themselves. Reviews compare the working tree (`git diff`, `git status`) against the state before the task instead of commit ranges. Subagents must be told explicitly not to run `git commit`.

**Goal:** Nutzer bekommen freischaltbare Features (Premium-Themes `natur`/`ballons`, zusätzliche Event-Slots über das 1 freie Event hinaus), in der DB als Ledger festgehalten und serverseitig erzwungen; vorerst nur manuell per SQL freischaltbar.

**Architecture:** Neue Ledger-Tabelle `user_entitlements` (eine Zeile pro Freischaltung). Reine, getestete Regel-Funktionen in `src/lib/features.ts` (auch vom Client importiert); Repository/Service nach der bestehenden Layered Architecture (`src/repositories/`, `src/services/`). `event-service.ts` erzwingt Limit und Theme-Sperre (403), die UI spiegelt dieselben Regeln nur zur Bequemlichkeit.

**Tech Stack:** Next.js 16 (App Router), Drizzle ORM (`postgres-js`), Supabase (Auth + Postgres, Migrationen via Supabase MCP `apply_migration`), TypeScript, Tailwind 4, **Vitest (neu)**.

**Spec:** `docs/superpowers/specs/2026-09-23-paid-features-design.md`

## Global Constraints

- Supabase project id: `znwlcmfrxtcfvesgbudg`. Migrations go through Supabase MCP `apply_migration` (the `drizzle/` folder is stale — do **not** run `drizzle-kit generate/migrate/push`). Keep `src/db/schema.ts` in sync by hand.
- Premium themes initially: `natur`, `ballons`. Adding a paid theme later must need only a code change in `PREMIUM_THEMES` — no DB migration.
- `FREE_EVENT_LIMIT = 1`. Limit counts **currently existing** events of the owner.
- Feature keys: `theme:<ThemeKey>` and `event_slot`.
- Existing data stays usable: editing fields is always allowed; theme is only checked when it **changes**.
- Error messages (German, exact):
  - Limit: `Du hast dein Event-Kontingent erreicht.` (HTTP 403)
  - Theme: `Dieses Design ist noch nicht freigeschaltet.` (HTTP 403)
  - UI hint limit: `Weitere Events kannst du bald freischalten.`
  - UI hint theme: `Dieses Design kannst du bald freischalten.`
- No classes, no DI — plain exported functions, matching the codebase.
- Every task leaves `npx tsc --noEmit`, `npx eslint`, `npm test` (from Task 1 on) and `npx next build` clean.
- Live verification: dev server via Browser `preview_start` with launch config `insektenparty-dev`; **stop it again when done** (user preference). Disposable test accounts are created via `fetch` to `https://znwlcmfrxtcfvesgbudg.supabase.co/auth/v1/signup` using the publishable key from `.env.local` (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) and a `mailinator.com` email; confirm via `update auth.users set email_confirmed_at = now() where id = '<id>';`. Always clean up afterwards:
  ```sql
  delete from public.user_entitlements where user_id = '<id>';
  delete from public.events where owner_id = '<id>';
  delete from public.profiles where id = '<id>';
  delete from auth.users where id = '<id>';
  ```

---

### Task 1: Vitest setup + pure feature rules

**Files:**
- Modify: `package.json` (devDependency `vitest`, script `test`)
- Create: `vitest.config.mts`
- Modify: `src/lib/theme-presets.ts` (add `PREMIUM_THEMES` after `THEME_LABELS`)
- Create: `src/lib/features.ts`
- Test: `src/lib/features.test.ts`

**Interfaces:**
- Consumes: `THEME_LABELS`, `ThemeKey` from `@/lib/theme-presets`.
- Produces (used by Tasks 2–4):
  - `PREMIUM_THEMES: readonly ThemeKey[]` (in `theme-presets.ts`)
  - `FREE_EVENT_LIMIT: number` (= 1)
  - `EVENT_SLOT_FEATURE: "event_slot"`
  - `themeFeatureKey(theme: ThemeKey): string`
  - `type EntitlementRow = { feature: string; quantity: number }`
  - `type UserEntitlements = { unlockedThemes: ThemeKey[]; eventLimit: number; eventCount: number }`
  - `resolveEntitlements(rows: EntitlementRow[], eventCount: number): UserEntitlements`
  - `canUseTheme(entitlements: Pick<UserEntitlements, "unlockedThemes">, theme: ThemeKey): boolean`
  - `canCreateEvent(entitlements: Pick<UserEntitlements, "eventLimit" | "eventCount">): boolean`
  - `isThemeSelectable(unlockedThemes: readonly ThemeKey[], theme: ThemeKey, originalTheme?: ThemeKey): boolean`

- [ ] **Step 1: Install Vitest and add config + script**

Run: `npm install --save-dev vitest`

Add to `package.json` `"scripts"` (after `"lint"`):
```json
    "test": "vitest run",
```

Create `vitest.config.mts`:
```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors the "@/*" path alias from tsconfig.json.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 2: Add `PREMIUM_THEMES` to `src/lib/theme-presets.ts`**

Insert directly after the `THEME_LABELS` object:
```ts
// Themes that must be unlocked per user (see user_entitlements, feature key
// "theme:<key>"). Adding a paid theme later only needs a new entry here -
// the DB check constraint only enforces the "theme:%" pattern.
export const PREMIUM_THEMES: readonly ThemeKey[] = ["natur", "ballons"];
```

- [ ] **Step 3: Write the failing tests** — `src/lib/features.test.ts`

```ts
import { describe, expect, it } from "vitest";
import {
  canCreateEvent,
  canUseTheme,
  EVENT_SLOT_FEATURE,
  FREE_EVENT_LIMIT,
  isThemeSelectable,
  resolveEntitlements,
  themeFeatureKey,
} from "@/lib/features";
import { PREMIUM_THEMES, THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";

const ALL_THEMES = Object.keys(THEME_LABELS) as ThemeKey[];
const FREE_THEMES = ALL_THEMES.filter((t) => !PREMIUM_THEMES.includes(t));

describe("themeFeatureKey", () => {
  it("prefixes the theme key", () => {
    expect(themeFeatureKey("natur")).toBe("theme:natur");
  });
});

describe("resolveEntitlements", () => {
  it("without rows: all non-premium themes unlocked, free event limit", () => {
    const result = resolveEntitlements([], 0);
    expect(result.unlockedThemes).toEqual(FREE_THEMES);
    expect(result.unlockedThemes).not.toContain("natur");
    expect(result.unlockedThemes).not.toContain("ballons");
    expect(result.eventLimit).toBe(FREE_EVENT_LIMIT);
    expect(result.eventCount).toBe(0);
  });

  it("unlocks a premium theme only when its row exists", () => {
    const result = resolveEntitlements([{ feature: "theme:natur", quantity: 1 }], 0);
    expect(result.unlockedThemes).toContain("natur");
    expect(result.unlockedThemes).not.toContain("ballons");
  });

  it("keeps theme order of THEME_LABELS", () => {
    const result = resolveEntitlements(
      [
        { feature: "theme:natur", quantity: 1 },
        { feature: "theme:ballons", quantity: 1 },
      ],
      0,
    );
    expect(result.unlockedThemes).toEqual(ALL_THEMES);
  });

  it("sums quantity over all event_slot rows", () => {
    const result = resolveEntitlements(
      [
        { feature: EVENT_SLOT_FEATURE, quantity: 1 },
        { feature: EVENT_SLOT_FEATURE, quantity: 2 },
      ],
      0,
    );
    expect(result.eventLimit).toBe(FREE_EVENT_LIMIT + 3);
  });

  it("ignores quantity on theme rows for the event limit", () => {
    const result = resolveEntitlements([{ feature: "theme:natur", quantity: 5 }], 0);
    expect(result.eventLimit).toBe(FREE_EVENT_LIMIT);
  });

  it("ignores unknown features", () => {
    const result = resolveEntitlements(
      [
        { feature: "theme:gibtsnicht", quantity: 1 },
        { feature: "something_else", quantity: 4 },
      ],
      2,
    );
    expect(result.unlockedThemes).toEqual(FREE_THEMES);
    expect(result.eventLimit).toBe(FREE_EVENT_LIMIT);
    expect(result.eventCount).toBe(2);
  });
});

describe("canUseTheme", () => {
  it("reflects unlockedThemes", () => {
    expect(canUseTheme({ unlockedThemes: ["weiss"] }, "weiss")).toBe(true);
    expect(canUseTheme({ unlockedThemes: ["weiss"] }, "natur")).toBe(false);
  });
});

describe("canCreateEvent", () => {
  it("allows creating while below the limit", () => {
    expect(canCreateEvent({ eventLimit: 1, eventCount: 0 })).toBe(true);
  });

  it("blocks at the limit", () => {
    expect(canCreateEvent({ eventLimit: 1, eventCount: 1 })).toBe(false);
  });

  it("blocks above the limit (grandfathered owners)", () => {
    expect(canCreateEvent({ eventLimit: 1, eventCount: 3 })).toBe(false);
  });
});

describe("isThemeSelectable", () => {
  it("unlocked theme is selectable", () => {
    expect(isThemeSelectable(["weiss"], "weiss")).toBe(true);
  });

  it("locked theme is not selectable", () => {
    expect(isThemeSelectable(["weiss"], "natur")).toBe(false);
  });

  it("the event's original (locked) theme stays selectable", () => {
    expect(isThemeSelectable(["weiss"], "natur", "natur")).toBe(true);
    expect(isThemeSelectable(["weiss"], "ballons", "natur")).toBe(false);
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/features`.

- [ ] **Step 5: Implement `src/lib/features.ts`**

```ts
import { PREMIUM_THEMES, THEME_LABELS, type ThemeKey } from "@/lib/theme-presets";

// Pure entitlement rules, shared by the server (event-service) and the
// client (EventList/EventDialog). The server is the source of truth; the
// client only mirrors these rules to disable locked options.

export const FREE_EVENT_LIMIT = 1;
export const EVENT_SLOT_FEATURE = "event_slot";

const THEME_KEYS = Object.keys(THEME_LABELS) as ThemeKey[];

export function themeFeatureKey(theme: ThemeKey): string {
  return `theme:${theme}`;
}

export type EntitlementRow = { feature: string; quantity: number };

export type UserEntitlements = {
  unlockedThemes: ThemeKey[];
  eventLimit: number;
  eventCount: number;
};

export function resolveEntitlements(
  rows: EntitlementRow[],
  eventCount: number,
): UserEntitlements {
  const features = new Set(rows.map((row) => row.feature));

  const unlockedThemes = THEME_KEYS.filter(
    (theme) => !PREMIUM_THEMES.includes(theme) || features.has(themeFeatureKey(theme)),
  );

  const extraSlots = rows
    .filter((row) => row.feature === EVENT_SLOT_FEATURE)
    .reduce((sum, row) => sum + row.quantity, 0);

  return { unlockedThemes, eventLimit: FREE_EVENT_LIMIT + extraSlots, eventCount };
}

export function canUseTheme(
  entitlements: Pick<UserEntitlements, "unlockedThemes">,
  theme: ThemeKey,
): boolean {
  return entitlements.unlockedThemes.includes(theme);
}

export function canCreateEvent(
  entitlements: Pick<UserEntitlements, "eventLimit" | "eventCount">,
): boolean {
  return entitlements.eventCount < entitlements.eventLimit;
}

// In edit mode the event's current theme stays selectable even when locked
// (grandfathered) - the server only checks a theme that actually changes.
export function isThemeSelectable(
  unlockedThemes: readonly ThemeKey[],
  theme: ThemeKey,
  originalTheme?: ThemeKey,
): boolean {
  return theme === originalTheme || unlockedThemes.includes(theme);
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, all tests in `src/lib/features.test.ts` green.

- [ ] **Step 7: Type-check and lint**

Run: `npx tsc --noEmit && npx eslint src/lib vitest.config.mts`
Expected: no output.

- [ ] **Step 8: Leave uncommitted**

Do **not** commit. Run `git status --short` and confirm exactly these paths are changed/new: `package.json package-lock.json vitest.config.mts src/lib/theme-presets.ts src/lib/features.ts src/lib/features.test.ts`.

---

### Task 2: `user_entitlements` table, repository and service

**Files:**
- Supabase migration `create_user_entitlements` (via MCP `apply_migration`)
- Modify: `src/db/schema.ts` (append table)
- Create: `src/repositories/entitlement-repository.ts`
- Modify: `src/repositories/event-repository.ts` (add `countEventsByOwner`, `getEventTheme`)
- Create: `src/services/entitlement-service.ts`

**Interfaces:**
- Consumes: `EntitlementRow`, `UserEntitlements`, `resolveEntitlements` from `@/lib/features` (Task 1).
- Produces (used by Tasks 3–4):
  - `userEntitlements` Drizzle table, `type UserEntitlementRecord`
  - `getEntitlementRows(userId: string): Promise<EntitlementRow[]>`
  - `countEventsByOwner(ownerId: string): Promise<number>`
  - `getEventTheme(id: string, ownerId: string): Promise<string | undefined>`
  - `getUserEntitlements(userId: string): Promise<UserEntitlements>`

- [ ] **Step 1: Apply the migration**

Additive only (new table), safe to apply before the code ships. Supabase MCP `apply_migration`, project `znwlcmfrxtcfvesgbudg`, name `create_user_entitlements`:

```sql
create table public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Only the pattern is checked, so new paid themes need no migration.
  feature text not null check (feature = 'event_slot' or feature like 'theme:%'),
  quantity integer not null default 1 check (quantity > 0),
  source text not null default 'manual',
  note text,
  created_at timestamptz not null default now()
);

create index user_entitlements_user_id_idx on public.user_entitlements (user_id);

-- RLS on, no policies: the app reads via DATABASE_URL (bypasses RLS); the
-- public Supabase API (publishable key) can neither read nor write, so
-- users cannot unlock features for themselves.
alter table public.user_entitlements enable row level security;
```

- [ ] **Step 2: Verify the migration**

Supabase MCP `execute_sql`:
```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'user_entitlements'
order by ordinal_position;
```
Expected: 7 columns as above. Then `list_tables` (schemas `["public"]`) shows `public.user_entitlements` with `rls_enabled: true`.

Check the constraint rejects bad keys (must error with a check-constraint violation, inserts nothing):
```sql
insert into public.user_entitlements (user_id, feature)
select id, 'bogus' from auth.users limit 1;
```
Expected: `ERROR: new row for relation "user_entitlements" violates check constraint`.

- [ ] **Step 3: Add the table to `src/db/schema.ts`**

Append at the end of the file:
```ts
// One row per unlock (append-only ledger). user_id references auth.users
// (FK + on delete cascade live in the Supabase migration, like events.owner_id
// which is also not modelled as a Drizzle reference).
export const userEntitlements = pgTable("user_entitlements", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  userId: uuid("user_id").notNull(),
  feature: text("feature").notNull(),
  quantity: integer("quantity").notNull().default(1),
  source: text("source").notNull().default("manual"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type UserEntitlementRecord = typeof userEntitlements.$inferSelect;
```

- [ ] **Step 4: Create `src/repositories/entitlement-repository.ts`**

```ts
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { userEntitlements } from "@/db/schema";
import type { EntitlementRow } from "@/lib/features";

export async function getEntitlementRows(userId: string): Promise<EntitlementRow[]> {
  return getDb()
    .select({ feature: userEntitlements.feature, quantity: userEntitlements.quantity })
    .from(userEntitlements)
    .where(eq(userEntitlements.userId, userId));
}
```

- [ ] **Step 5: Add two functions to `src/repositories/event-repository.ts`**

Change the import line to:
```ts
import { and, count, desc, eq } from "drizzle-orm";
```

Add after `getEventsByOwner`:
```ts
export async function countEventsByOwner(ownerId: string): Promise<number> {
  const [row] = await getDb()
    .select({ value: count() })
    .from(events)
    .where(eq(events.ownerId, ownerId));
  return row?.value ?? 0;
}

// Undefined when the event does not exist or belongs to someone else.
export async function getEventTheme(id: string, ownerId: string): Promise<string | undefined> {
  const [event] = await getDb()
    .select({ theme: events.theme })
    .from(events)
    .where(and(eq(events.id, id), eq(events.ownerId, ownerId)));
  return event?.theme;
}
```

- [ ] **Step 6: Create `src/services/entitlement-service.ts`**

```ts
import { resolveEntitlements, type UserEntitlements } from "@/lib/features";
import { getEntitlementRows } from "@/repositories/entitlement-repository";
import { countEventsByOwner } from "@/repositories/event-repository";

export async function getUserEntitlements(userId: string): Promise<UserEntitlements> {
  const [rows, eventCount] = await Promise.all([
    getEntitlementRows(userId),
    countEventsByOwner(userId),
  ]);
  return resolveEntitlements(rows, eventCount);
}
```

- [ ] **Step 7: Type-check, lint, test, build**

Run: `npx tsc --noEmit && npx eslint src && npm test && npx next build`
Expected: all clean; build succeeds.

- [ ] **Step 8: Leave uncommitted**

Do **not** commit. Run `git status --short` and confirm exactly these paths are changed/new: `src/db/schema.ts src/repositories/entitlement-repository.ts src/repositories/event-repository.ts src/services/entitlement-service.ts`.

---

### Task 3: Enforce limit and theme lock in `event-service`

**Files:**
- Modify: `src/services/event-service.ts`

**Interfaces:**
- Consumes: `getUserEntitlements` (Task 2), `getEventTheme` (Task 2), `canCreateEvent`, `canUseTheme` (Task 1).
- Produces: `POST /api/events` → 403 on limit/locked theme; `PATCH /api/events/[eventId]` → 403 on switching to a locked theme. Response shape `{ error: string }` unchanged.

- [ ] **Step 1: Update imports in `src/services/event-service.ts`**

Add:
```ts
import { canCreateEvent, canUseTheme } from "@/lib/features";
import { getUserEntitlements } from "@/services/entitlement-service";
```
and extend the event-repository import to:
```ts
import {
  createEvent,
  deleteEvent,
  getEventTheme,
  updateEvent,
  type EventRow,
} from "@/repositories/event-repository";
```

Add below the `THEME_KEYS` constant:
```ts
const EVENT_LIMIT_ERROR = "Du hast dein Event-Kontingent erreicht.";
const THEME_LOCKED_ERROR = "Dieses Design ist noch nicht freigeschaltet.";
```

- [ ] **Step 2: Enforce in `createEventForOwner`**

Insert directly **before** `const slug = generateSlug(titleValidation.value);` (so input errors stay 400 and come first):
```ts
  const entitlements = await getUserEntitlements(ownerId);
  if (!canCreateEvent(entitlements)) {
    return { ok: false, status: 403, error: EVENT_LIMIT_ERROR };
  }
  if (!canUseTheme(entitlements, theme as ThemeKey)) {
    return { ok: false, status: 403, error: THEME_LOCKED_ERROR };
  }
```

- [ ] **Step 3: Enforce in `updateEventForOwner`**

Insert directly **after** the `if (!hasAnyUpdate) { ... }` block and **before** `const updated = await updateEvent(...)`:
```ts
  // Only a theme that actually changes is checked, so grandfathered events
  // keep their (now premium) theme - EventDialog always sends {theme, title}.
  if (themeUpdate !== undefined) {
    const currentTheme = await getEventTheme(id, ownerId);
    if (currentTheme === undefined) {
      return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
    }
    if (themeUpdate !== currentTheme) {
      const entitlements = await getUserEntitlements(ownerId);
      if (!canUseTheme(entitlements, themeUpdate)) {
        return { ok: false, status: 403, error: THEME_LOCKED_ERROR };
      }
    }
  }
```

- [ ] **Step 4: Type-check, lint, test, build**

Run: `npx tsc --noEmit && npx eslint src && npm test && npx next build`
Expected: all clean.

- [ ] **Step 5: Live API verification**

Start dev server (`preview_start` name `insektenparty-dev`). Create + confirm a disposable test account (see Global Constraints), log in through the app's Login dialog. Then in the Browser pane via `javascript_tool` (same-origin, session cookie is sent):

1. `await fetch("/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({theme:"natur",title:"T1"})}).then(async r=>[r.status,await r.json()])`
   Expected: `[403, {error:"Dieses Design ist noch nicht freigeschaltet."}]`
2. Same with `theme:"weiss", title:"T1"` → `201`.
3. Same with `theme:"weiss", title:"T2"` → `[403, {error:"Du hast dein Event-Kontingent erreicht."}]`
4. Get the id of T1: `select id from public.events where owner_id='<id>';` then
   `fetch("/api/events/<eventId>",{method:"PATCH",...body:JSON.stringify({theme:"natur",title:"T1"})})` → `403` theme error.
5. Grant via SQL: `insert into public.user_entitlements (user_id, feature) values ('<id>','theme:natur'), ('<id>','event_slot');`
   Repeat 4 → `200`. Repeat 3 → `201`.
6. Grandfathering: `delete from public.user_entitlements where user_id='<id>';` then PATCH T1 with `{theme:"natur",title:"T1 neu"}` (unchanged theme) → `200`.
7. Delete-frees-slot: user now has 2 events and limit 1. `DELETE /api/events/<T2 id>` and `DELETE /api/events/<T1 id>` → both `200`; POST `{theme:"weiss",title:"T3"}` → `201`.

Clean up the test account (Global Constraints). Stop the dev server (`preview_stop`).

- [ ] **Step 6: Leave uncommitted**

Do **not** commit. Run `git status --short` and confirm exactly these paths are changed/new: `src/services/event-service.ts`.

---

### Task 4: UI — locked create button and locked themes

**Files:**
- Modify: `src/components/EditIcons.tsx` (add `LockIcon`)
- Modify: `src/app/page.tsx`
- Modify: `src/components/EventList.tsx`
- Modify: `src/components/CreateEventButton.tsx`
- Modify: `src/components/EventDialog.tsx`

**Interfaces:**
- Consumes: `getUserEntitlements` (Task 2), `isThemeSelectable` (Task 1), `ThemeKey`.
- Produces:
  - `EventList` props: `{ initialEvents: EventListItem[]; eventLimit: number; unlockedThemes: ThemeKey[] }`
  - `CreateEventButton` props: `{ unlockedThemes: ThemeKey[]; limitReached: boolean }`
  - `EventDialog` props: both modes gain `unlockedThemes: ThemeKey[]`

- [ ] **Step 1: Add `LockIcon` to `src/components/EditIcons.tsx`**

Append:
```tsx
export function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
```

- [ ] **Step 2: Load entitlements in `src/app/page.tsx`**

Add import:
```ts
import { getUserEntitlements } from "@/services/entitlement-service";
```
After the `myEvents` declaration add:
```ts
  const entitlements = claims ? await getUserEntitlements(claims.sub) : null;
```
Replace `<EventList initialEvents={myEvents} />` with:
```tsx
              <EventList
                initialEvents={myEvents}
                eventLimit={entitlements?.eventLimit ?? 1}
                unlockedThemes={entitlements?.unlockedThemes ?? []}
              />
```

- [ ] **Step 3: Thread props through `src/components/EventList.tsx`**

Change the props type and signature:
```tsx
type EventListProps = {
  initialEvents: EventListItem[];
  eventLimit: number;
  unlockedThemes: ThemeKey[];
};

export function EventList({ initialEvents, eventLimit, unlockedThemes }: EventListProps) {
```
Below the `useState` hooks add:
```tsx
  // Recomputed from the live list, so deleting an event frees the slot
  // immediately. The server re-checks on create.
  const limitReached = eventList.length >= eventLimit;
```
Replace **both** `<CreateEventButton />` occurrences with:
```tsx
<CreateEventButton unlockedThemes={unlockedThemes} limitReached={limitReached} />
```
In the edit `<EventDialog mode="edit" ...>` add the prop `unlockedThemes={unlockedThemes}`.

- [ ] **Step 4: Locked state in `src/components/CreateEventButton.tsx`**

Replace the file with:
```tsx
"use client";

import { useId, useState } from "react";
import type { ThemeKey } from "@/lib/theme-presets";
import { Button } from "./Button";
import { LockIcon } from "./EditIcons";
import { EventDialog } from "./EventDialog";

type CreateEventButtonProps = {
  unlockedThemes: ThemeKey[];
  limitReached: boolean;
};

export function CreateEventButton({ unlockedThemes, limitReached }: CreateEventButtonProps) {
  const [open, setOpen] = useState(false);
  const hintId = useId();

  if (limitReached) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button variant="primary" size="lg" disabled aria-describedby={hintId} className="gap-2">
          <LockIcon />
          Event erstellen
        </Button>
        <p id={hintId} className="text-sm text-muted">
          Weitere Events kannst du bald freischalten.
        </p>
      </div>
    );
  }

  return (
    <>
      <Button variant="primary" size="lg" onClick={() => setOpen(true)}>
        + Event erstellen
      </Button>
      {open ? (
        <EventDialog
          mode="create"
          unlockedThemes={unlockedThemes}
          onCloseAction={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
```

- [ ] **Step 5: Locked themes in `src/components/EventDialog.tsx`**

5a. Imports — add:
```tsx
import { isThemeSelectable } from "@/lib/features";
import { LockIcon } from "./EditIcons";
```

5b. Props — add `unlockedThemes: ThemeKey[];` to **both** union members:
```tsx
type EventDialogProps =
  | {
      mode: "create";
      unlockedThemes: ThemeKey[];
      onCloseAction: () => void;
    }
  | {
      mode: "edit";
      event: { id: string; title: string; theme: ThemeKey };
      unlockedThemes: ThemeKey[];
      onCloseAction: () => void;
      onSavedAction: (updated: { title: string; theme: ThemeKey }) => void;
    };
```

5c. In the component body, after the existing `useState` hooks:
```tsx
  const [lockHint, setLockHint] = useState<string | null>(null);
  const originalTheme = mode === "edit" ? props.event.theme : undefined;
```

5d. Replace the theme `<button>` inside `THEME_KEYS.map(...)` with:
```tsx
          const selectable = isThemeSelectable(props.unlockedThemes, key, originalTheme);
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (!selectable) {
                  setLockHint("Dieses Design kannst du bald freischalten.");
                  return;
                }
                setLockHint(null);
                setTheme(key);
              }}
              disabled={saving}
              aria-pressed={theme === key}
              aria-disabled={!selectable || undefined}
              className={`relative flex flex-col items-center gap-1 rounded-2xl border p-2 text-center transition ${
                theme === key ? "border-leaf bg-leaf/10" : "border-leaf/20 hover:bg-leaf/5"
              } ${selectable ? "" : "opacity-50"}`}
            >
              {selectable ? null : (
                <span className="absolute top-1 right-1 rounded-full bg-white p-1 text-leaf-dark shadow-sm">
                  <LockIcon />
                </span>
              )}
              <Image
                src={THEME_ASSETS[key].logo}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <span className="text-[11px] leading-tight text-muted">
                {THEME_LABELS[key]}
                {selectable ? null : <span className="sr-only"> (gesperrt)</span>}
              </span>
            </button>
          );
```
The map callback therefore changes from `(key) => ( <button …/> )` to `(key) => { const selectable = …; return ( <button …/> ); }`.

5e. Directly **after** the closing `</div>` of the theme grid (before the `{error ? …}` block), add:
```tsx
      {lockHint ? (
        <p className="mt-3 text-sm text-muted" role="status">
          {lockHint}
        </p>
      ) : null}
```

- [ ] **Step 6: Type-check, lint, test, build**

Run: `npx tsc --noEmit && npx eslint src && npm test && npx next build`
Expected: all clean.

- [ ] **Step 7: Live UI verification**

Start dev server (`preview_start` name `insektenparty-dev`), create + confirm + log in a disposable test account.

1. Home, 0 events: "+ Event erstellen" enabled. Open dialog: Natur and Ballons dimmed with lock; clicking Natur shows `Dieses Design kannst du bald freischalten.` and keeps Weiß selected. Create event "U1" with Weiß → lands on `/p/<slug>`.
2. Back on home (1 event, limit 1): button disabled with lock icon and hint `Weitere Events kannst du bald freischalten.` Screenshot.
3. Delete U1 via the trash button → button enabled again without reload.
4. Create "U2" (Weiß). SQL: `update public.events set theme='natur' where owner_id='<id>';` → reload. Edit dialog of U2: Natur is selected and **not** dimmed; Ballons dimmed. Click "Bestätigen" (title changed to "U2 neu") → saves without error.
5. In the same dialog, switch to Weiß, then back to Natur → allowed; save with Weiß. Reopen edit dialog → Natur now dimmed/locked.
6. SQL: `insert into public.user_entitlements (user_id, feature, quantity) values ('<id>','theme:ballons',1), ('<id>','event_slot',1);` → reload: Ballons selectable, create button enabled; create "U3" works; afterwards button disabled again (2/2).
7. `resize_window` preset `mobile`: dialog theme grid and lock badges render without overflow; reset to `desktop`.
8. `read_console_messages` onlyErrors → none.

Clean up the test account (Global Constraints). Stop the dev server (`preview_stop`).

- [ ] **Step 8: Leave uncommitted**

Do **not** commit. Run `git status --short` and confirm exactly these paths are changed/new: `src/components/EditIcons.tsx src/app/page.tsx src/components/EventList.tsx src/components/CreateEventButton.tsx src/components/EventDialog.tsx`.
