# Passwortgeschützte Events – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Owner können ein Event mit einem Passwort schützen; Gäste ohne Passwort sehen eine Sperrseite und können das Passwort per Mail beim Owner anfragen.

**Architecture:** Neue Spalte `events.access_password`. Freischalten setzt ein HMAC-signiertes HttpOnly-Cookie pro Event; Event-Seite, Gäste-API, Linkvorschau und OG-Bild prüfen „geschützt / Owner / Cookie“ serverseitig. Owner-UI im bestehenden `EventDialog` (create + neuer Modus `settings`), Passwort-Anfrage über `sendEmail` an die Konto-E-Mail des Owners.

**Tech Stack:** Next.js 16 (App Router, Route Handlers), React 19, Drizzle + Supabase Postgres, zod 4, nodemailer, vitest, Tailwind 4.

**Spec:** `docs/superpowers/specs/2026-10-08-event-password-design.md`

## Global Constraints

- **Keine Commits.** Projektregel: der User committet selbst – jeder Task endet mit „Kein Commit“.
- Passwort: `trim()`, min **4**, max **100** Zeichen, sonst keine Regeln.
- Meldungen exakt: „Das Passwort muss mindestens 4 Zeichen lang sein.“, „Das Passwort darf höchstens 100 Zeichen lang sein.“, „Die Passwörter stimmen nicht überein.“, „Das Passwort ist leider falsch.“, „Dieses Event ist passwortgeschützt.“
- Cookie: Name `gz_event_<eventId>`, Wert `HMAC-SHA256(EVENT_UNLOCK_SECRET, "<eventId>:<password>")` base64url, HttpOnly, SameSite=Lax, Path=/, Secure in Produktion, Max-Age 180 Tage.
- Das Passwort verlässt den Server nur in Richtung des eingeloggten Owners.
- Gesperrte sehen nur den Titel (kein Datum, Ort, Gäste, Kontakt).
- Anfrage-Nachricht max **500**, „Sonstiges“-Kanal max **100** Zeichen; Telefon 6–20 Ziffern.
- Tests: `npx vitest run <datei>`; am Ende `npx tsc --noEmit`, `npx eslint src`, `npx vitest run`.
- Lokale DB = Produktions-DB: Migration nur nach Rückfrage beim User anwenden; Browser-Tests nur mit eigenem Test-Event.
- Selbst gestartete Dev-Server danach wieder stoppen (läuft auf Port 3000 schon einer, diesen mitbenutzen).

## Dateien

| Datei | Aufgabe |
|---|---|
| `supabase/migrations/2026-10-08-add-event-access-password.sql` (neu) | Spalte anlegen |
| `src/db/schema.ts` | `accessPassword` |
| `src/repositories/event-repository.ts` | `getEventAccessInfo`, `createEvent` mit Passwort |
| `src/lib/validation.ts` (+ Test) | Passwort- und Anfrage-Validierung |
| `src/lib/event-access.ts` (neu, + Test) | Cookie-Signatur, Passwortvergleich, `hasEventAccess` (rein, ohne Next) |
| `src/services/event-access-service.ts` (neu, + Test) | `getViewerAccess`, `denyLockedEvent`, `unlockEvent` |
| `src/services/password-request-service.ts` (neu, + Test) | `buildPasswordRequestEmail`, `requestEventPassword` |
| `src/services/event-service.ts` (+ Test) | Passwort beim Erstellen/Ändern |
| `src/lib/email.ts` | `replyTo` |
| `src/app/api/events/route.ts` | `accessPassword` durchreichen |
| `src/app/api/events/[eventId]/unlock/route.ts` (neu) | Freischalten + Cookie |
| `src/app/api/events/[eventId]/password-request/route.ts` (neu) | Anfrage |
| `src/app/api/events/[eventId]/guests/route.ts`, `…/[guestId]/route.ts` | 403 bei Sperre |
| `src/lib/invitation-text.ts` (+ Test) | Passwort-Zeile |
| `src/components/InfoTooltip.tsx` (neu) | ⓘ-Sprechblase |
| `src/components/EventPasswordFields.tsx` (neu) | Checkbox + 2 Passwortfelder + Tooltip |
| `src/components/EventDialog.tsx`, `ThemeEditButton.tsx`, `Header.tsx` | create + `settings`-Modus |
| `src/components/Footer.tsx` | Passwort im Einladungstext, Owner-Badge |
| `src/components/EventLockedPage.tsx` (neu) | Sperrseite |
| `src/components/PasswordRequestDialog.tsx` (neu) | Anfrage-Dialog |
| `src/app/event/[slug]/page.tsx`, `layout.tsx`, `opengraph-image.tsx` | Gating, Metadaten, OG |
| `src/components/PrivacyPolicyContent.tsx`, `.env.example` | Recht, Secret |

---

### Task 1: Datenbankspalte und Repository

**Files:**
- Create: `supabase/migrations/2026-10-08-add-event-access-password.sql`
- Modify: `src/db/schema.ts` (Tabelle `events`, nach `contactEmail`)
- Modify: `src/repositories/event-repository.ts` (`createEvent`, neue `getEventAccessInfo`)

**Interfaces:**
- Produces: `events.accessPassword: string | null`; `EventRow.accessPassword`;
  `type EventAccessRow = { id: string; ownerId: string | null; accessPassword: string | null; title: string; slug: string }`;
  `getEventAccessInfo(id: string): Promise<EventAccessRow | undefined>`;
  `createEvent(input: { …bisher…; accessPassword: string | null })`.

- [ ] **Step 1: Migration schreiben**

```sql
-- Passwortgeschützte Events: null = nicht geschützt. Klartext, weil der
-- Owner das Passwort im Einladungstext braucht (geteiltes Event-Passwort,
-- kein Konto-Passwort). Additiv - der alte Code ignoriert die Spalte.
alter table public.events add column access_password text;
```

- [ ] **Step 2: Schema ergänzen** – in `src/db/schema.ts` nach `contactEmail: text("contact_email").notNull(),`:

```ts
  // Event password for guests ("Passwortgeschützt"); null = not protected.
  // Plain text on purpose: the owner needs it in the invitation text. Only
  // ever sent to the signed-in owner (see services/event-access-service.ts).
  accessPassword: text("access_password"),
```

- [ ] **Step 3: Repository** – in `createEvent` den Input-Typ um `accessPassword: string | null;` erweitern und in `.values({...})` nach `contactEmail: "",` `accessPassword: input.accessPassword,` ergänzen. Nach `getEventForNotification` anfügen:

```ts
export type EventAccessRow = {
  id: string;
  ownerId: string | null;
  accessPassword: string | null;
  title: string;
  slug: string;
};

// What the password protection needs: who owns the event, its password
// (null = open) and what a locked visitor may see (title) or be sent (slug).
export async function getEventAccessInfo(id: string): Promise<EventAccessRow | undefined> {
  const [event] = await getDb()
    .select({
      id: events.id,
      ownerId: events.ownerId,
      accessPassword: events.accessPassword,
      title: events.title,
      slug: events.slug,
    })
    .from(events)
    .where(eq(events.id, id));
  return event;
}
```

- [ ] **Step 4: Typecheck** – Run: `npx tsc --noEmit`. Expected: genau ein Fehler in `src/services/event-service.ts` (`createEvent` ohne `accessPassword`) – wird in Task 4 behoben. Für jetzt in `createEventForOwner` beim `createEvent({...})`-Aufruf vorläufig `accessPassword: null,` ergänzen und erneut prüfen: keine Fehler.

- [ ] **Step 5: Migration anwenden** – User fragen, ob die Migration über das Supabase-MCP (`apply_migration`, Projekt `znwlcmfrxtcfvesgbudg`, Name `add_event_access_password`) angewendet werden soll. Erst nach „ja“ ausführen und mit `select column_name, is_nullable from information_schema.columns where table_name='events' and column_name='access_password';` prüfen (Expected: eine Zeile, `YES`).

- [ ] **Step 6:** Kein Commit.

---

### Task 2: Validierung (Passwort + Anfrage)

**Files:**
- Modify: `src/lib/validation.ts` (neuer Abschnitt nach `validateEmail`, vor `// --- Guest form`)
- Test: `src/lib/validation.test.ts`

**Interfaces:**
- Produces:
  `EVENT_PASSWORD_MIN_LENGTH = 4`, `EVENT_PASSWORD_MAX_LENGTH = 100`;
  `validateAccessPassword(value: unknown): FieldResult<string | null>` (null = Schutz aus);
  `validateEventPasswordPair(password: string, repeat: string): FieldResult<string>`;
  `PASSWORD_REQUEST_MESSAGE_MAX_LENGTH = 500`, `PASSWORD_REQUEST_OTHER_MAX_LENGTH = 100`;
  `PHONE_CHANNELS = ["sms","whatsapp","telegram","other"] as const`, `type PhoneChannel`, `PHONE_CHANNEL_LABELS: Record<PhoneChannel, string>`;
  `type PasswordRequestContact = { kind: "email"; email: string } | { kind: "phone"; phone: string; channel: PhoneChannel; channelOther: string | null }`;
  `type PasswordRequestInput = { name: string; contact: PasswordRequestContact; message: string | null }`;
  `validatePasswordRequest(body: unknown): FieldResult<PasswordRequestInput>` – Body flach: `{ name, contactKind: "email"|"phone", email, phone, channel, channelOther, message }`.

- [ ] **Step 1: Failing tests** – Import in `validation.test.ts` um `validateAccessPassword, validateEventPasswordPair, validatePasswordRequest` erweitern und anfügen:

```ts
describe("event password", () => {
  it("accepts 4 to 100 characters after trimming, null switches it off", () => {
    expect(validateAccessPassword(" abcd ")).toEqual({ ok: true, value: "abcd" });
    expect(validateAccessPassword(null)).toEqual({ ok: true, value: null });
    expect(validateAccessPassword("abc")).toEqual({
      ok: false,
      error: "Das Passwort muss mindestens 4 Zeichen lang sein.",
    });
    expect(validateAccessPassword("  ab  ")).toEqual({
      ok: false,
      error: "Das Passwort muss mindestens 4 Zeichen lang sein.",
    });
    expect(validateAccessPassword("x".repeat(101))).toEqual({
      ok: false,
      error: "Das Passwort darf höchstens 100 Zeichen lang sein.",
    });
    expect(validateAccessPassword(1234).ok).toBe(false);
  });

  it("checks that both dialog fields match", () => {
    expect(validateEventPasswordPair("Sommer", " Sommer ")).toEqual({ ok: true, value: "Sommer" });
    expect(validateEventPasswordPair("Sommer", "Winter")).toEqual({
      ok: false,
      error: "Die Passwörter stimmen nicht überein.",
    });
    expect(validateEventPasswordPair("abc", "abc")).toEqual({
      ok: false,
      error: "Das Passwort muss mindestens 4 Zeichen lang sein.",
    });
  });
});

describe("validatePasswordRequest", () => {
  const byEmail = { name: " Max ", contactKind: "email", email: " max@example.de ", message: "" };
  const byPhone = { name: "Max", contactKind: "phone", phone: "+49 (152) 123-456", channel: "whatsapp" };

  function requestError(body: Record<string, unknown>) {
    const result = validatePasswordRequest(body);
    return result.ok ? null : result.error;
  }

  it("accepts an e-mail request", () => {
    expect(validatePasswordRequest(byEmail)).toEqual({
      ok: true,
      value: { name: "Max", contact: { kind: "email", email: "max@example.de" }, message: null },
    });
  });

  it("accepts a phone request with channel and optional message", () => {
    expect(validatePasswordRequest({ ...byPhone, message: " Hallo! " })).toEqual({
      ok: true,
      value: {
        name: "Max",
        contact: { kind: "phone", phone: "+49 (152) 123-456", channel: "whatsapp", channelOther: null },
        message: "Hallo!",
      },
    });
  });

  it("requires a free text for the channel \"Sonstiges\"", () => {
    expect(requestError({ ...byPhone, channel: "other", channelOther: " " })).toBe(
      "Bitte gib an, wie du das Passwort bekommen möchtest.",
    );
    const result = validatePasswordRequest({ ...byPhone, channel: "other", channelOther: " Signal " });
    expect(result.ok && result.value.contact).toEqual({
      kind: "phone",
      phone: "+49 (152) 123-456",
      channel: "other",
      channelOther: "Signal",
    });
  });

  it("requires a contact choice and its fields", () => {
    expect(requestError({ name: "Max" })).toBe("Bitte wähle, wie du das Passwort bekommen möchtest.");
    expect(requestError({ ...byEmail, email: "" })).toBe("E-Mail ist erforderlich.");
    expect(requestError({ ...byPhone, channel: undefined })).toBe(
      "Bitte wähle, wie du das Passwort per Telefon bekommen möchtest.",
    );
  });

  it("checks the phone number loosely", () => {
    expect(requestError({ ...byPhone, phone: "12345" })).toBe("Bitte gib eine gültige Telefonnummer ein.");
    expect(requestError({ ...byPhone, phone: "0152 abc" })).toBe("Bitte gib eine gültige Telefonnummer ein.");
    expect(requestError({ ...byPhone, phone: "1".repeat(21) })).toBe("Bitte gib eine gültige Telefonnummer ein.");
    expect(requestError({ ...byPhone, phone: "0152/123456" })).toBeNull();
  });

  it("checks name and message length", () => {
    expect(requestError({ ...byEmail, name: "M" })).toBe("Name muss mindestens 2 Zeichen lang sein.");
    expect(requestError({ ...byEmail, message: "x".repeat(501) })).toBe(
      "Die Nachricht darf höchstens 500 Zeichen lang sein.",
    );
  });
});
```

- [ ] **Step 2: Run** `npx vitest run src/lib/validation.test.ts` – Expected: FAIL (Funktionen nicht exportiert).

- [ ] **Step 3: Implementierung** – in `src/lib/validation.ts` nach `validateEmail` einfügen. `guestNameSchema` ist weiter unten definiert; den neuen Abschnitt deshalb **nach** `validateGuestInput` platzieren (vor `// --- Event page fields`):

```ts
// --- Event password ("Passwortgeschützt") ------------------------------------------

export const EVENT_PASSWORD_MIN_LENGTH = 4;
export const EVENT_PASSWORD_MAX_LENGTH = 100;

// Deliberately soft: a shared password the owner sends around with the
// invitation link, not an account password (see lib/password.ts).
const eventPasswordSchema = z
  .string({ error: "Bitte gib ein Passwort ein." })
  .trim()
  .min(EVENT_PASSWORD_MIN_LENGTH, `Das Passwort muss mindestens ${EVENT_PASSWORD_MIN_LENGTH} Zeichen lang sein.`)
  .max(EVENT_PASSWORD_MAX_LENGTH, `Das Passwort darf höchstens ${EVENT_PASSWORD_MAX_LENGTH} Zeichen lang sein.`);

// Saving an event: null switches the protection off.
export function validateAccessPassword(value: unknown): FieldResult<string | null> {
  return toFieldResult(eventPasswordSchema.nullable().safeParse(value));
}

// The dialog's "Passwort" + "Passwort wiederholen".
export function validateEventPasswordPair(password: string, repeat: string): FieldResult<string> {
  const result = toFieldResult(eventPasswordSchema.safeParse(password));
  if (!result.ok) return result;
  if (result.value !== repeat.trim()) {
    return { ok: false, error: "Die Passwörter stimmen nicht überein." };
  }
  return result;
}

// --- Password request (locked event page) --------------------------------------------

export const PASSWORD_REQUEST_MESSAGE_MAX_LENGTH = 500;
export const PASSWORD_REQUEST_OTHER_MAX_LENGTH = 100;
export const PHONE_CHANNELS = ["sms", "whatsapp", "telegram", "other"] as const;
export type PhoneChannel = (typeof PHONE_CHANNELS)[number];
export const PHONE_CHANNEL_LABELS: Record<PhoneChannel, string> = {
  sms: "SMS",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  other: "Sonstiges",
};

export type PasswordRequestContact =
  | { kind: "email"; email: string }
  | { kind: "phone"; phone: string; channel: PhoneChannel; channelOther: string | null };

export type PasswordRequestInput = {
  name: string;
  contact: PasswordRequestContact;
  message: string | null;
};

const INVALID_PHONE = "Bitte gib eine gültige Telefonnummer ein.";

// Loose on purpose: digits plus the usual separators, 6-20 digits.
const phoneSchema = z
  .string({ error: INVALID_PHONE })
  .trim()
  .regex(/^\+?[\d\s\-/()]+$/, INVALID_PHONE)
  .refine((value) => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= 6 && digits <= 20;
  }, INVALID_PHONE);

const channelOtherSchema = z
  .string({ error: "Bitte gib an, wie du das Passwort bekommen möchtest." })
  .trim()
  .min(1, "Bitte gib an, wie du das Passwort bekommen möchtest.")
  .max(PASSWORD_REQUEST_OTHER_MAX_LENGTH, `Die Angabe darf höchstens ${PASSWORD_REQUEST_OTHER_MAX_LENGTH} Zeichen lang sein.`);

const requestMessageSchema = z.preprocess(
  (value) => (value === undefined || value === null || (typeof value === "string" && value.trim() === "") ? null : value),
  z
    .string({ error: "Die Nachricht ist ungültig." })
    .trim()
    .max(PASSWORD_REQUEST_MESSAGE_MAX_LENGTH, `Die Nachricht darf höchstens ${PASSWORD_REQUEST_MESSAGE_MAX_LENGTH} Zeichen lang sein.`)
    .nullable(),
);

function isPhoneChannel(value: unknown): value is PhoneChannel {
  return (PHONE_CHANNELS as readonly unknown[]).includes(value);
}

// The form sends flat fields; only the chosen contact way is checked.
export const passwordRequestSchema = z
  .object(
    {
      name: guestNameSchema,
      contactKind: z.unknown(),
      email: z.unknown(),
      phone: z.unknown(),
      channel: z.unknown(),
      channelOther: z.unknown(),
      message: requestMessageSchema,
    },
    { error: "Ungültige Anfragedaten." },
  )
  .transform((request, ctx): PasswordRequestInput => {
    const fail = (message: string) => {
      ctx.addIssue({ code: "custom", message });
      return z.NEVER;
    };

    let contact: PasswordRequestContact;
    if (request.contactKind === "email") {
      const email = emailSchema.safeParse(request.email);
      if (!email.success) return fail(firstError(email.error));
      contact = { kind: "email", email: email.data };
    } else if (request.contactKind === "phone") {
      const phone = phoneSchema.safeParse(request.phone);
      if (!phone.success) return fail(firstError(phone.error));
      if (!isPhoneChannel(request.channel)) {
        return fail("Bitte wähle, wie du das Passwort per Telefon bekommen möchtest.");
      }
      let channelOther: string | null = null;
      if (request.channel === "other") {
        const other = channelOtherSchema.safeParse(request.channelOther);
        if (!other.success) return fail(firstError(other.error));
        channelOther = other.data;
      }
      contact = { kind: "phone", phone: phone.data, channel: request.channel, channelOther };
    } else {
      return fail("Bitte wähle, wie du das Passwort bekommen möchtest.");
    }

    return { name: request.name, contact, message: request.message };
  });

export function validatePasswordRequest(body: unknown): FieldResult<PasswordRequestInput> {
  return toFieldResult(passwordRequestSchema.safeParse(body));
}
```

- [ ] **Step 4: Run** `npx vitest run src/lib/validation.test.ts` – Expected: PASS. Falls „Name muss mindestens…“ vor der Kontaktprüfung fehlschlägt: korrekt, zod prüft Objektfelder vor dem Transform.

- [ ] **Step 5:** Kein Commit.

---

### Task 3: Cookie-Signatur und Zugriffslogik (rein)

**Files:**
- Create: `src/lib/event-access.ts`
- Test: `src/lib/event-access.test.ts`

**Interfaces:**
- Produces:
  `EVENT_ACCESS_MAX_AGE_SECONDS: number` (180 Tage);
  `eventAccessCookieName(eventId: string): string`;
  `getEventUnlockSecret(): string | null` (liest `process.env.EVENT_UNLOCK_SECRET`);
  `signEventAccess(eventId: string, password: string, secret: string): string`;
  `eventPasswordMatches(stored: string, attempt: string): boolean`;
  `type EventAccessInfo = { id: string; ownerId: string | null; accessPassword: string | null }`;
  `hasEventAccess(event: EventAccessInfo, viewer: { userId?: string; token?: string; secret: string | null }): boolean`.

- [ ] **Step 1: Failing test** `src/lib/event-access.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  eventAccessCookieName,
  eventPasswordMatches,
  hasEventAccess,
  signEventAccess,
} from "@/lib/event-access";

const SECRET = "test-secret";
const event = { id: "event-1", ownerId: "owner-1", accessPassword: "Sommer" };

describe("event access cookie", () => {
  it("names the cookie per event", () => {
    expect(eventAccessCookieName("event-1")).toBe("gz_event_event-1");
  });

  it("signs deterministically and differently per event, password and secret", () => {
    const token = signEventAccess("event-1", "Sommer", SECRET);
    expect(token).toBe(signEventAccess("event-1", "Sommer", SECRET));
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(signEventAccess("event-2", "Sommer", SECRET)).not.toBe(token);
    expect(signEventAccess("event-1", "Winter", SECRET)).not.toBe(token);
    expect(signEventAccess("event-1", "Sommer", "other")).not.toBe(token);
  });
});

describe("eventPasswordMatches", () => {
  it("compares after trimming the attempt", () => {
    expect(eventPasswordMatches("Sommer", " Sommer ")).toBe(true);
    expect(eventPasswordMatches("Sommer", "sommer")).toBe(false);
    expect(eventPasswordMatches("Sommer", "")).toBe(false);
  });
});

describe("hasEventAccess", () => {
  const token = signEventAccess(event.id, event.accessPassword, SECRET);

  it("lets everyone into an open event", () => {
    expect(hasEventAccess({ ...event, accessPassword: null }, { secret: null })).toBe(true);
  });

  it("lets the owner in without a cookie", () => {
    expect(hasEventAccess(event, { userId: "owner-1", secret: SECRET })).toBe(true);
  });

  it("accepts a valid cookie only", () => {
    expect(hasEventAccess(event, { token, secret: SECRET })).toBe(true);
    expect(hasEventAccess(event, { userId: "someone-else", secret: SECRET })).toBe(false);
    expect(hasEventAccess(event, { token: `${token}x`, secret: SECRET })).toBe(false);
    expect(hasEventAccess({ ...event, id: "event-2" }, { token, secret: SECRET })).toBe(false);
    expect(hasEventAccess({ ...event, accessPassword: "Winter" }, { token, secret: SECRET })).toBe(false);
  });

  it("stays locked when the secret is missing", () => {
    expect(hasEventAccess(event, { token, secret: null })).toBe(false);
  });
});
```

- [ ] **Step 2: Run** `npx vitest run src/lib/event-access.test.ts` – Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Implementierung** `src/lib/event-access.ts`:

```ts
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Password-protected events: after the right password a guest gets an
// HttpOnly cookie per event holding an HMAC of event id + password. Changing
// the password changes the expected value, so every earlier unlock expires.
// Kept free of Next.js so it can be tested.

export const EVENT_ACCESS_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export function eventAccessCookieName(eventId: string): string {
  return `gz_event_${eventId}`;
}

export function getEventUnlockSecret(): string | null {
  return process.env.EVENT_UNLOCK_SECRET || null;
}

export function signEventAccess(eventId: string, password: string, secret: string): string {
  return createHmac("sha256", secret).update(`${eventId}:${password}`).digest("base64url");
}

// Hashing both sides first gives equal-length buffers, so the comparison
// leaks neither the content nor the length of the stored password.
function sameText(a: string, b: string): boolean {
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(a), digest(b));
}

export function eventPasswordMatches(stored: string, attempt: string): boolean {
  return sameText(stored, attempt.trim());
}

export type EventAccessInfo = { id: string; ownerId: string | null; accessPassword: string | null };

export function hasEventAccess(
  event: EventAccessInfo,
  viewer: { userId?: string; token?: string; secret: string | null },
): boolean {
  if (!event.accessPassword) return true;
  if (viewer.userId && viewer.userId === event.ownerId) return true;
  // Without a secret nothing can be verified: protected events stay locked.
  if (!viewer.token || !viewer.secret) return false;
  return sameText(signEventAccess(event.id, event.accessPassword, viewer.secret), viewer.token);
}
```

- [ ] **Step 4: Run** `npx vitest run src/lib/event-access.test.ts` – Expected: PASS.

- [ ] **Step 5:** `.env.example` am Ende ergänzen:

```
# Signiert die Freischalt-Cookies passwortgeschützter Events. Zufälliger,
# langer Wert, z. B.: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
# Ändern macht alle bisherigen Freischaltungen ungültig.
EVENT_UNLOCK_SECRET=
```

- [ ] **Step 6:** Kein Commit.

---

### Task 4: Passwort beim Erstellen und Ändern eines Events

**Files:**
- Modify: `src/services/event-service.ts` (`createEventForOwner`, `updateEventForOwner`)
- Modify: `src/app/api/events/route.ts` (Body-Feld durchreichen)
- Test: `src/services/event-service.test.ts`

**Interfaces:**
- Consumes: `validateAccessPassword` (Task 2), `createEvent(... accessPassword)` (Task 1).
- Produces: `createEventForOwner(ownerId, { theme, title, accessPassword? }: { theme: unknown; title: unknown; accessPassword?: unknown })`; `PATCH /api/events/[id]` akzeptiert `accessPassword: string | null`.

- [ ] **Step 1: Failing tests** – in `event-service.test.ts` anfügen:

```ts
describe("event password", () => {
  beforeEach(() => {
    vi.mocked(createEvent).mockReset();
    vi.mocked(createEvent).mockImplementation(async (input) => ({ slug: input.slug }));
    vi.mocked(updateEvent).mockClear();
    vi.mocked(getUserEntitlements).mockResolvedValue({
      unlockedThemes: ["weiss"],
      eventLimit: 1,
      eventCount: 0,
    });
  });

  it("stores the trimmed password when creating", async () => {
    await createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest", accessPassword: " Sommer " });
    expect(vi.mocked(createEvent).mock.calls[0][0].accessPassword).toBe("Sommer");
  });

  it("creates an open event without a password", async () => {
    await createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest" });
    expect(vi.mocked(createEvent).mock.calls[0][0].accessPassword).toBeNull();
  });

  it("rejects a too short password when creating", async () => {
    expect(
      await createEventForOwner("owner-id", { theme: "weiss", title: "Sommerfest", accessPassword: "abc" }),
    ).toEqual({ ok: false, status: 400, error: "Das Passwort muss mindestens 4 Zeichen lang sein." });
    expect(createEvent).not.toHaveBeenCalled();
  });

  it("sets and removes the password on update", async () => {
    expect(await update({ accessPassword: "Winter" })).toMatchObject({ ok: true, data: { accessPassword: "Winter" } });
    expect(await update({ accessPassword: null })).toMatchObject({ ok: true, data: { accessPassword: null } });
    expect(await update({ accessPassword: "ab" })).toEqual({
      ok: false,
      status: 400,
      error: "Das Passwort muss mindestens 4 Zeichen lang sein.",
    });
  });
});
```

- [ ] **Step 2: Run** `npx vitest run src/services/event-service.test.ts` – Expected: FAIL.

- [ ] **Step 3: `createEventForOwner`** – Import `validateAccessPassword` ergänzen; Signatur auf `input: { theme: unknown; title: unknown; accessPassword?: unknown }`; nach der Titel-Validierung:

```ts
  const passwordValidation = validateAccessPassword(input.accessPassword ?? null);
  if (!passwordValidation.ok) {
    return { ok: false, status: 400, error: passwordValidation.error };
  }
```

und im `createEvent({...})`-Aufruf das vorläufige `accessPassword: null` aus Task 1 durch `accessPassword: passwordValidation.value,` ersetzen.

- [ ] **Step 4: `updateEventForOwner`** – nach `let themeUpdate…` ergänzen:

```ts
  // undefined = not part of this request; null = protection switched off.
  let passwordUpdate: string | null | undefined;
```

In der Schleife als erste Prüfung:

```ts
    if (key === "accessPassword") {
      const validation = validateAccessPassword(rawValue);
      if (!validation.ok) {
        return { ok: false, status: 400, error: validation.error };
      }
      passwordUpdate = validation.value;
      continue;
    }
```

`hasAnyUpdate` ersetzen durch:

```ts
  const hasAnyUpdate =
    Object.keys(updates).length > 0 || themeUpdate !== undefined || passwordUpdate !== undefined;
```

und im `updateEvent(...)`-Aufruf nach `...(schedule ?? {}),` ergänzen:

```ts
    ...(passwordUpdate !== undefined ? { accessPassword: passwordUpdate } : {}),
```

- [ ] **Step 5: API** – in `src/app/api/events/route.ts` den Aufruf erweitern:

```ts
    const result = await createEventForOwner(userId, {
      theme: (body as { theme?: unknown })?.theme,
      title: (body as { title?: unknown })?.title,
      accessPassword: (body as { accessPassword?: unknown })?.accessPassword,
    });
```

Kommentar in `src/app/api/events/[eventId]/route.ts` über `PATCH` ergänzen: `plus an optional "theme" and/or "accessPassword" (string, or null to remove the protection)`.

- [ ] **Step 6: Run** `npx vitest run src/services/event-service.test.ts` und `npx tsc --noEmit` – Expected: PASS, keine Typfehler.

- [ ] **Step 7:** Kein Commit.

---

### Task 5: Zugriffsprüfung, Freischalten und gesperrte Gäste-API

**Files:**
- Create: `src/services/event-access-service.ts`
- Create: `src/app/api/events/[eventId]/unlock/route.ts`
- Modify: `src/app/api/events/[eventId]/guests/route.ts` (GET, POST)
- Modify: `src/app/api/events/[eventId]/guests/[guestId]/route.ts` (PATCH, DELETE)
- Test: `src/services/event-access-service.test.ts`

**Interfaces:**
- Consumes: Task 1 `getEventAccessInfo`, Task 3 Funktionen.
- Produces:
  `type EventAccessResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string }`;
  `EVENT_LOCKED_ERROR = "Dieses Event ist passwortgeschützt."`;
  `getViewerAccess(event: EventAccessInfo): Promise<{ userId: string | undefined; isOwner: boolean; hasAccess: boolean }>`;
  `denyLockedEvent(eventId: string): Promise<NextResponse | null>`;
  `unlockEvent(eventId: string, body: unknown): Promise<EventAccessResult<{ cookie: { name: string; value: string; maxAge: number } | null }>>`.

- [ ] **Step 1: Failing test** `src/services/event-access-service.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/repositories/event-repository", () => ({ getEventAccessInfo: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const { unlockEvent } = await import("@/services/event-access-service");
const { getEventAccessInfo } = await import("@/repositories/event-repository");
const { signEventAccess } = await import("@/lib/event-access");

const protectedEvent = { id: "event-1", ownerId: "owner-1", accessPassword: "Sommer", title: "Fest", slug: "fest-abc123" };

describe("unlockEvent", () => {
  beforeEach(() => {
    process.env.EVENT_UNLOCK_SECRET = "test-secret";
    vi.mocked(getEventAccessInfo).mockResolvedValue(protectedEvent);
  });

  it("returns the signed cookie for the right password", async () => {
    expect(await unlockEvent("event-1", { password: " Sommer " })).toEqual({
      ok: true,
      data: {
        cookie: {
          name: "gz_event_event-1",
          value: signEventAccess("event-1", "Sommer", "test-secret"),
          maxAge: 180 * 24 * 60 * 60,
        },
      },
    });
  });

  it("rejects a wrong password", async () => {
    expect(await unlockEvent("event-1", { password: "Winter" })).toEqual({
      ok: false,
      status: 401,
      error: "Das Passwort ist leider falsch.",
    });
    expect(await unlockEvent("event-1", {})).toMatchObject({ ok: false, status: 401 });
  });

  it("needs no cookie for an open event", async () => {
    vi.mocked(getEventAccessInfo).mockResolvedValue({ ...protectedEvent, accessPassword: null });
    expect(await unlockEvent("event-1", { password: "egal" })).toEqual({ ok: true, data: { cookie: null } });
  });

  it("reports unknown events and a missing secret", async () => {
    vi.mocked(getEventAccessInfo).mockResolvedValueOnce(undefined);
    expect(await unlockEvent("nope", { password: "Sommer" })).toMatchObject({ ok: false, status: 404 });

    delete process.env.EVENT_UNLOCK_SECRET;
    vi.spyOn(console, "error").mockImplementationOnce(() => {});
    expect(await unlockEvent("event-1", { password: "Sommer" })).toMatchObject({ ok: false, status: 500 });
  });
});
```

- [ ] **Step 2: Run** `npx vitest run src/services/event-access-service.test.ts` – Expected: FAIL (Modul fehlt).

- [ ] **Step 3: Implementierung** `src/services/event-access-service.ts`:

```ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  EVENT_ACCESS_MAX_AGE_SECONDS,
  eventAccessCookieName,
  eventPasswordMatches,
  getEventUnlockSecret,
  hasEventAccess,
  signEventAccess,
  type EventAccessInfo,
} from "@/lib/event-access";
import { createClient } from "@/lib/supabase/server";
import { getEventAccessInfo } from "@/repositories/event-repository";

export type EventAccessResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export const EVENT_LOCKED_ERROR = "Dieses Event ist passwortgeschützt.";

// A small pause after a wrong password slows down guessing (passwords may
// be as short as 4 characters - this is a privacy screen, not a vault).
const WRONG_PASSWORD_DELAY_MS = 500;

// Who is looking at the event: the signed-in owner, a guest who unlocked it
// (cookie), or someone who still needs the password.
export async function getViewerAccess(
  event: EventAccessInfo,
): Promise<{ userId: string | undefined; isOwner: boolean; hasAccess: boolean }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const token = (await cookies()).get(eventAccessCookieName(event.id))?.value;

  return {
    userId,
    isOwner: !!userId && userId === event.ownerId,
    hasAccess: hasEventAccess(event, { userId, token, secret: getEventUnlockSecret() }),
  };
}

// Guest API routes: 403 for a locked event. Unknown events pass through so
// the guest service keeps answering 404 as before.
export async function denyLockedEvent(eventId: string): Promise<NextResponse | null> {
  const event = await getEventAccessInfo(eventId);
  if (!event) return null;
  const { hasAccess } = await getViewerAccess(event);
  return hasAccess ? null : NextResponse.json({ error: EVENT_LOCKED_ERROR }, { status: 403 });
}

export async function unlockEvent(
  eventId: string,
  body: unknown,
): Promise<EventAccessResult<{ cookie: { name: string; value: string; maxAge: number } | null }>> {
  const event = await getEventAccessInfo(eventId);
  if (!event) {
    return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
  }
  if (!event.accessPassword) {
    return { ok: true, data: { cookie: null } };
  }

  const attempt = (body as { password?: unknown } | null)?.password;
  if (typeof attempt !== "string" || !eventPasswordMatches(event.accessPassword, attempt)) {
    await new Promise((resolve) => setTimeout(resolve, WRONG_PASSWORD_DELAY_MS));
    return { ok: false, status: 401, error: "Das Passwort ist leider falsch." };
  }

  const secret = getEventUnlockSecret();
  if (!secret) {
    console.error("EVENT_UNLOCK_SECRET is not set.");
    return {
      ok: false,
      status: 500,
      error: "Das Event konnte nicht geöffnet werden. Bitte versuche es später erneut.",
    };
  }

  return {
    ok: true,
    data: {
      cookie: {
        name: eventAccessCookieName(event.id),
        value: signEventAccess(event.id, event.accessPassword, secret),
        maxAge: EVENT_ACCESS_MAX_AGE_SECONDS,
      },
    },
  };
}
```

- [ ] **Step 4: Run** `npx vitest run src/services/event-access-service.test.ts` – Expected: PASS (der Falsch-Test dauert ~1 s wegen der Verzögerung).

- [ ] **Step 5: Unlock-Route** `src/app/api/events/[eventId]/unlock/route.ts`:

```ts
import { NextResponse } from "next/server";
import { isUuid } from "@/lib/validation";
import { unlockEvent } from "@/services/event-access-service";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

// Locked event page: checks the password and sets the unlock cookie.
export async function POST(request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const result = await unlockEvent(eventId, body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const response = NextResponse.json({ ok: true });
    if (result.data.cookie) {
      response.cookies.set(result.data.cookie.name, result.data.cookie.value, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: result.data.cookie.maxAge,
      });
    }
    return response;
  } catch (error) {
    console.error("POST /api/events/[eventId]/unlock failed:", error);
    return NextResponse.json(
      { error: "Das Event konnte nicht geöffnet werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 6: Gäste-Routen sperren** – in `guests/route.ts` (GET und POST) und `guests/[guestId]/route.ts` (PATCH und DELETE) `import { denyLockedEvent } from "@/services/event-access-service";` ergänzen und jeweils direkt nach der `isUuid`-Prüfung einfügen:

```ts
    const denied = await denyLockedEvent(eventId);
    if (denied) return denied;
```

(In POST/PATCH vor dem Einlesen des Bodys; DELETE nutzt `_request` – unverändert.)

- [ ] **Step 7: Run** `npx tsc --noEmit` und `npx vitest run` – Expected: keine Fehler, alles grün.

- [ ] **Step 8:** Kein Commit.

---

### Task 6: Passwort-Anfrage (Service, Mail, Route)

**Files:**
- Modify: `src/lib/email.ts` (`replyTo`)
- Create: `src/services/password-request-service.ts`
- Create: `src/app/api/events/[eventId]/password-request/route.ts`
- Test: `src/services/password-request-service.test.ts`

**Interfaces:**
- Consumes: `validatePasswordRequest`, `PHONE_CHANNEL_LABELS`, `PasswordRequestInput` (Task 2); `getEventAccessInfo` (Task 1); `EventAccessResult` (Task 5).
- Produces: `buildPasswordRequestEmail(request: PasswordRequestInput, eventTitle: string, link: string): { subject: string; text: string; replyTo?: string }`; `requestEventPassword(eventId: string, body: unknown): Promise<EventAccessResult<{ ok: true }>>`; `sendEmail({ to, subject, text, replyTo? })`.

- [ ] **Step 1: Failing test** `src/services/password-request-service.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/repositories/event-repository", () => ({ getEventAccessInfo: vi.fn() }));
vi.mock("@/repositories/user-repository", () => ({ getUserContact: vi.fn() }));
vi.mock("@/lib/recaptcha", () => ({
  getRecaptchaToken: vi.fn(() => "token"),
  verifyRecaptchaToken: vi.fn(async () => ({ ok: true })),
}));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn(async () => {}) }));

const { buildPasswordRequestEmail, requestEventPassword } = await import("@/services/password-request-service");
const { getEventAccessInfo } = await import("@/repositories/event-repository");
const { getUserContact } = await import("@/repositories/user-repository");
const { sendEmail } = await import("@/lib/email");

const LINK = "https://gastzilla.de/event/fest-abc123";

describe("buildPasswordRequestEmail", () => {
  it("asks for an e-mail answer with Reply-To", () => {
    expect(
      buildPasswordRequestEmail(
        { name: "Max", contact: { kind: "email", email: "max@example.de" }, message: "Bis bald!" },
        "Sommerfest",
        LINK,
      ),
    ).toEqual({
      subject: "Passwort-Anfrage für „Sommerfest“",
      replyTo: "max@example.de",
      text: [
        "„Max“ möchte das Passwort für dein Event „Sommerfest“ per E-Mail an max@example.de.",
        "",
        "Nachricht: Bis bald!",
        "",
        "Antworte einfach auf diese E-Mail, um Max das Passwort zu schicken.",
        "",
        `Event ansehen: ${LINK}`,
      ].join("\n"),
    });
  });

  it("names the phone channel, or the free text for \"Sonstiges\"", () => {
    const whatsapp = buildPasswordRequestEmail(
      { name: "Max", contact: { kind: "phone", phone: "0152 123456", channel: "whatsapp", channelOther: null }, message: null },
      "Sommerfest",
      LINK,
    );
    expect(whatsapp.replyTo).toBeUndefined();
    expect(whatsapp.text).toBe(
      [
        "„Max“ möchte das Passwort für dein Event „Sommerfest“ per WhatsApp an 0152 123456.",
        "",
        `Event ansehen: ${LINK}`,
      ].join("\n"),
    );

    const other = buildPasswordRequestEmail(
      { name: "Max", contact: { kind: "phone", phone: "0152 123456", channel: "other", channelOther: "Signal" }, message: null },
      "Sommerfest",
      LINK,
    );
    expect(other.text.split("\n")[0]).toBe(
      "„Max“ möchte das Passwort für dein Event „Sommerfest“ per Signal an 0152 123456.",
    );
  });
});

describe("requestEventPassword", () => {
  const body = { name: "Max", contactKind: "email", email: "max@example.de", recaptchaToken: "token" };

  beforeEach(() => {
    vi.mocked(sendEmail).mockClear();
    vi.mocked(getEventAccessInfo).mockResolvedValue({
      id: "event-1",
      ownerId: "owner-1",
      accessPassword: "Sommer",
      title: "Sommerfest",
      slug: "fest-abc123",
    });
    vi.mocked(getUserContact).mockResolvedValue({ name: "Anna", email: "anna@example.de" });
  });

  it("mails the owner", async () => {
    expect(await requestEventPassword("event-1", body)).toEqual({ ok: true, data: { ok: true } });
    expect(vi.mocked(sendEmail).mock.calls[0][0]).toMatchObject({
      to: "anna@example.de",
      replyTo: "max@example.de",
      subject: "Passwort-Anfrage für „Sommerfest“",
    });
  });

  it("rejects invalid requests without mailing", async () => {
    expect(await requestEventPassword("event-1", { ...body, contactKind: undefined })).toEqual({
      ok: false,
      status: 400,
      error: "Bitte wähle, wie du das Passwort bekommen möchtest.",
    });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("handles open events and owners without e-mail", async () => {
    vi.mocked(getEventAccessInfo).mockResolvedValueOnce({
      id: "event-1",
      ownerId: "owner-1",
      accessPassword: null,
      title: "Sommerfest",
      slug: "fest-abc123",
    });
    expect(await requestEventPassword("event-1", body)).toMatchObject({ ok: false, status: 409 });

    vi.mocked(getUserContact).mockResolvedValueOnce(null);
    expect(await requestEventPassword("event-1", body)).toEqual({
      ok: false,
      status: 503,
      error: "Die Anfrage konnte nicht zugestellt werden.",
    });
  });
});
```

- [ ] **Step 2: Run** `npx vitest run src/services/password-request-service.test.ts` – Expected: FAIL.

- [ ] **Step 3: `sendEmail`** – in `src/lib/email.ts` Options-Typ um `replyTo?: string;` erweitern und in `client.sendMail({...})` `replyTo: options.replyTo,` ergänzen.

- [ ] **Step 4: Service** `src/services/password-request-service.ts`:

```ts
import { sendEmail } from "@/lib/email";
import { getRecaptchaToken, verifyRecaptchaToken } from "@/lib/recaptcha";
import { buildEventShareUrl } from "@/lib/share";
import {
  PHONE_CHANNEL_LABELS,
  validatePasswordRequest,
  type PasswordRequestInput,
} from "@/lib/validation";
import { getEventAccessInfo } from "@/repositories/event-repository";
import { getUserContact } from "@/repositories/user-repository";
import type { EventAccessResult } from "@/services/event-access-service";

// "Passwort anfragen" on a locked event page: forwarded once to the owner's
// account e-mail and not stored. An e-mail request gets Reply-To so the owner
// just answers; the owner's own address stays hidden until they do.
export function buildPasswordRequestEmail(
  request: PasswordRequestInput,
  eventTitle: string,
  link: string,
): { subject: string; text: string; replyTo?: string } {
  const { contact } = request;
  const via =
    contact.kind === "email"
      ? `per E-Mail an ${contact.email}`
      : `per ${contact.channel === "other" ? contact.channelOther : PHONE_CHANNEL_LABELS[contact.channel]} an ${contact.phone}`;

  const lines = [`„${request.name}“ möchte das Passwort für dein Event „${eventTitle}“ ${via}.`];
  if (request.message) lines.push("", `Nachricht: ${request.message}`);
  if (contact.kind === "email") {
    lines.push("", `Antworte einfach auf diese E-Mail, um ${request.name} das Passwort zu schicken.`);
  }
  lines.push("", `Event ansehen: ${link}`);

  return {
    subject: `Passwort-Anfrage für „${eventTitle}“`,
    text: lines.join("\n"),
    ...(contact.kind === "email" ? { replyTo: contact.email } : {}),
  };
}

export async function requestEventPassword(
  eventId: string,
  body: unknown,
): Promise<EventAccessResult<{ ok: true }>> {
  const event = await getEventAccessInfo(eventId);
  if (!event) {
    return { ok: false, status: 404, error: "Event wurde nicht gefunden." };
  }
  if (!event.accessPassword) {
    return {
      ok: false,
      status: 409,
      error: "Dieses Event ist nicht mehr passwortgeschützt. Bitte lade die Seite neu.",
    };
  }

  const recaptcha = await verifyRecaptchaToken(getRecaptchaToken(body));
  if (!recaptcha.ok) {
    return { ok: false, status: recaptcha.status, error: recaptcha.error };
  }

  const validation = validatePasswordRequest(body);
  if (!validation.ok) {
    return { ok: false, status: 400, error: validation.error };
  }

  const owner = event.ownerId ? await getUserContact(event.ownerId) : null;
  if (!owner?.email) {
    return { ok: false, status: 503, error: "Die Anfrage konnte nicht zugestellt werden." };
  }

  const email = buildPasswordRequestEmail(validation.value, event.title, buildEventShareUrl(event.slug));
  await sendEmail({ to: owner.email, ...email });
  return { ok: true, data: { ok: true } };
}
```

Hinweis: In der Test-Erwartung „rejects invalid requests“ läuft reCAPTCHA (gemockt `ok`) vor der Validierung – die Reihenfolge entspricht `guest-service.ts`.

- [ ] **Step 5: Run** `npx vitest run src/services/password-request-service.test.ts` – Expected: PASS.

- [ ] **Step 6: Route** `src/app/api/events/[eventId]/password-request/route.ts`:

```ts
import { NextResponse } from "next/server";
import { isUuid } from "@/lib/validation";
import { requestEventPassword } from "@/services/password-request-service";

type RouteContext = {
  params: Promise<{ eventId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { eventId } = await context.params;
    if (!isUuid(eventId)) {
      return NextResponse.json({ error: "Ungültige Event-ID." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Ungültige Anfragedaten." }, { status: 400 });
    }

    const result = await requestEventPassword(eventId, body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("POST /api/events/[eventId]/password-request failed:", error);
    return NextResponse.json(
      { error: "Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut." },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 7: Run** `npx tsc --noEmit` – Expected: keine Fehler.

- [ ] **Step 8:** Kein Commit.

---

### Task 7: Einladungstext mit Passwort, Owner-Badge

**Files:**
- Modify: `src/lib/invitation-text.ts` (`InvitationFacts`, `invitationLines`)
- Test: `src/lib/invitation-text.test.ts`
- Modify: `src/components/Footer.tsx`

**Interfaces:**
- Produces: `InvitationFacts.password: string | null`; `FooterProps.accessPassword: string | null` (nur für den Owner befüllt, sonst `null`).

- [ ] **Step 1: Failing test** – in `invitation-text.test.ts` das `facts`-Objekt um `password: null,` ergänzen und anfügen:

```ts
describe("invitation text for a password-protected event", () => {
  it("adds the password right after the link", () => {
    const lines = buildInvitationText({ ...facts, password: "Sommer" }, DEFAULT_WORDING).split("\n");
    const linkIndex = lines.indexOf("https://gastzilla.de/event/abc123");
    expect(lines[linkIndex + 1]).toBe("Passwort für die Event-Seite: Sommer");
  });

  it("has no password line for an open event", () => {
    expect(buildInvitationText(facts, DEFAULT_WORDING)).not.toContain("Passwort");
  });
});
```

- [ ] **Step 2: Run** `npx vitest run src/lib/invitation-text.test.ts` – Expected: FAIL (Typfehler/fehlende Zeile).

- [ ] **Step 3: Implementierung** – in `InvitationFacts` nach `url: string;`:

```ts
  /** Password-protected event: shown right after the link; null = open. */
  password: string | null;
```

In `invitationLines` nach `{ kind: "fixed", text: facts.url },`:

```ts
    ...(facts.password ? fixed(`Passwort für die Event-Seite: ${facts.password}`) : []),
```

- [ ] **Step 4: Run** `npx vitest run src/lib/invitation-text.test.ts` – Expected: PASS.

- [ ] **Step 5: Footer** – `FooterProps` um `accessPassword: string | null;` erweitern, im Destructuring ergänzen, in `facts={{…}}` nach `url: …` `password: accessPassword,` einfügen. `import { LockIcon } from "./EditIcons";` ergänzen und direkt vor `<MadeWithBadge` einfügen:

```tsx
        {isOwner && accessPassword ? (
          <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-leaf/10 px-3 py-1 text-xs font-bold text-leaf-dark">
            <LockIcon />
            Passwortgeschützt
          </p>
        ) : null}
```

(`page.tsx` reicht das Prop in Task 9 durch; bis dahin meldet `tsc` den fehlenden Prop – erwartet.)

- [ ] **Step 6:** Kein Commit.

---

### Task 8: Owner-Dialog (Checkbox, Passwortfelder, Tooltip)

**Files:**
- Create: `src/components/InfoTooltip.tsx`
- Create: `src/components/EventPasswordFields.tsx`
- Modify: `src/components/EventDialog.tsx`
- Modify: `src/components/ThemeEditButton.tsx`
- Modify: `src/components/Header.tsx` (`themeEdit`-Typ)

**Interfaces:**
- Consumes: `validateEventPasswordPair`, `EVENT_PASSWORD_MAX_LENGTH` (Task 2); `PATCH`/`POST` mit `accessPassword` (Task 4).
- Produces: `EventDialog` Modi `"create"` und `"settings"` (`event: { id: string; theme: ThemeKey; accessPassword: string | null }`); `Header`-Prop `themeEdit?: { eventId: string; theme: ThemeKey; unlockedThemes: ThemeKey[]; accessPassword: string | null }`.

- [ ] **Step 1: `InfoTooltip.tsx`**

```tsx
"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type InfoTooltipProps = {
  label: string;
  children: ReactNode;
};

// "i" button with a speech bubble. Opens on click/tap (a title attribute
// never shows on phones) and closes on a click elsewhere or Escape - the
// Escape is kept from also closing a surrounding dialog. The bubble spans
// the nearest positioned ancestor, so give the surrounding row "relative".
export function InfoTooltip({ label, children }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const bubbleId = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <span ref={wrapperRef}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? bubbleId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.stopPropagation();
            setOpen(false);
          }
        }}
        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-current text-xs leading-none font-bold text-leaf transition hover:text-leaf-dark"
      >
        i
      </button>
      {open ? (
        <span
          id={bubbleId}
          role="tooltip"
          className="absolute top-full right-0 left-0 z-20 mt-2 block rounded-xl border border-leaf/20 bg-surface p-3 text-left text-xs leading-relaxed font-normal text-ink shadow-(--shadow)"
        >
          {children}
        </span>
      ) : null}
    </span>
  );
}
```

- [ ] **Step 2: `EventPasswordFields.tsx`**

```tsx
"use client";

import { useId } from "react";
import { EVENT_PASSWORD_MAX_LENGTH } from "@/lib/validation";
import { InfoTooltip } from "./InfoTooltip";
import { PasswordInput } from "./PasswordInput";

type EventPasswordFieldsProps = {
  isProtected: boolean;
  onProtectedChange: (value: boolean) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  passwordRepeat: string;
  onPasswordRepeatChange: (value: string) => void;
  disabled?: boolean;
};

// "Passwortgeschützt" in the event dialog (create and settings).
export function EventPasswordFields({
  isProtected,
  onProtectedChange,
  password,
  onPasswordChange,
  passwordRepeat,
  onPasswordRepeatChange,
  disabled = false,
}: EventPasswordFieldsProps) {
  const passwordId = useId();
  const repeatId = useId();

  return (
    <div className="mt-5">
      <div className="relative flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-leaf-dark">
          <input
            type="checkbox"
            checked={isProtected}
            disabled={disabled}
            onChange={(event) => onProtectedChange(event.target.checked)}
            className="h-5 w-5 rounded border-leaf/40"
          />
          Passwortgeschützt
        </label>
        <InfoTooltip label="Was bedeutet passwortgeschützt?">
          Nur wer das Passwort kennt, sieht deine Event-Seite und die Gästeliste.{" "}
          <strong>Teile das Passwort deinen Gästen mit</strong> – am einfachsten zusammen mit dem
          Einladungslink. Im Einladungstext fügen wir es automatisch ein. Wer es nicht hat, kann
          es auf der Event-Seite bei dir anfragen; du bekommst dann eine E-Mail.
        </InfoTooltip>
      </div>

      {isProtected ? (
        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor={passwordId} className="mb-1 block text-sm font-semibold text-leaf-dark">
              Passwort
            </label>
            <PasswordInput
              id={passwordId}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              autoComplete="off"
              maxLength={EVENT_PASSWORD_MAX_LENGTH}
              disabled={disabled}
            />
            <p className="mt-1 text-xs text-muted">Mindestens 4 Zeichen.</p>
          </div>
          <div>
            <label htmlFor={repeatId} className="mb-1 block text-sm font-semibold text-leaf-dark">
              Passwort wiederholen
            </label>
            <PasswordInput
              id={repeatId}
              value={passwordRepeat}
              onChange={(event) => onPasswordRepeatChange(event.target.value)}
              autoComplete="off"
              maxLength={EVENT_PASSWORD_MAX_LENGTH}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: `EventDialog.tsx`** – Änderungen:

1. Imports: `validateEventPasswordPair` aus `@/lib/validation`, `import { EventPasswordFields } from "./EventPasswordFields";`.
2. Props: Modus `"theme"` umbenennen in `"settings"`, `event: { id: string; theme: ThemeKey; accessPassword: string | null };`, Kommentar: `// Owner's event page: design and password protection - the title is edited inline on the page itself.`
3. Alle `mode === "theme"` → `mode === "settings"`.
4. State nach `originalTheme`:

```ts
  const originalPassword = mode === "settings" ? props.event.accessPassword : null;
  const [isProtected, setIsProtected] = useState(originalPassword !== null);
  const [password, setPassword] = useState(originalPassword ?? "");
  const [passwordRepeat, setPasswordRepeat] = useState(originalPassword ?? "");
```

5. `handleSubmit` ersetzen durch:

```ts
  async function handleSubmit() {
    if (saving) return;

    let trimmedName = "";
    if (mode === "create") {
      const titleResult = validateNewEventTitle(name);
      if (!titleResult.ok) {
        setError(titleResult.error);
        nameInputRef.current?.focus();
        return;
      }
      trimmedName = titleResult.value;
    }

    let accessPassword: string | null = null;
    if (isProtected) {
      const passwordResult = validateEventPasswordPair(password, passwordRepeat);
      if (!passwordResult.ok) {
        setError(passwordResult.error);
        return;
      }
      accessPassword = passwordResult.value;
    }

    // Settings: only send what changed; nothing changed = just close.
    const changes: { theme?: ThemeKey; accessPassword?: string | null } = {};
    if (mode === "settings") {
      if (theme !== originalTheme) changes.theme = theme;
      if (accessPassword !== originalPassword) changes.accessPassword = accessPassword;
      if (Object.keys(changes).length === 0) {
        onCloseAction();
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      if (mode === "create") {
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme, title: trimmedName, accessPassword }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          setError(
            payload?.error ?? "Das Event konnte nicht erstellt werden. Bitte versuche es erneut.",
          );
          setSaving(false);
          return;
        }

        const { slug } = (await response.json()) as { slug: string };
        router.push(`/event/${slug}`);
        return;
      }

      const response = await fetch(`/api/events/${props.event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(
          payload?.error ?? "Die Einstellungen konnten nicht gespeichert werden. Bitte versuche es erneut.",
        );
        setSaving(false);
        return;
      }

      // Theme and password both shape the server-rendered page (wrapper
      // class, assets, badge, invitation text), so re-render it.
      router.refresh();
      onCloseAction();
    } catch {
      setError(
        mode === "create"
          ? "Das Event konnte nicht erstellt werden. Bitte versuche es erneut."
          : "Die Einstellungen konnten nicht gespeichert werden. Bitte versuche es erneut.",
      );
      setSaving(false);
    }
  }
```

6. Überschrift: `{mode === "create" ? "Event erstellen" : "Event-Einstellungen"}`.
7. Im Settings-Modus ebenfalls die Zwischenüberschrift „Design“ zeigen: die Bedingung `{mode === "create" ? (<p …>Design</p>) : null}` entfernen und das `<p className="mt-5 text-sm font-semibold text-leaf-dark">Design</p>` immer rendern; das Raster bekommt immer `mt-2` (die `${mode === "create" ? "mt-2" : "mt-5"}`-Verzweigung durch `mt-2` ersetzen).
8. Direkt nach dem `{lockHint ? … : null}`-Block einfügen:

```tsx
      <EventPasswordFields
        isProtected={isProtected}
        onProtectedChange={(value) => {
          setIsProtected(value);
          setError(null);
        }}
        password={password}
        onPasswordChange={setPassword}
        passwordRepeat={passwordRepeat}
        onPasswordRepeatChange={setPasswordRepeat}
        disabled={saving}
      />
```

9. Die verrutschte Einrückung `            {error ? (` auf 6 Leerzeichen korrigieren.

- [ ] **Step 4: `ThemeEditButton.tsx`** – Prop `accessPassword: string | null` ergänzen, an `EventDialog` `mode="settings"` und `event={{ id: eventId, theme, accessPassword }}` übergeben; `aria-label`/`title` → „Event-Einstellungen“; Kommentar: `// Owner-only pencil next to the event logo: opens design and password settings.`

- [ ] **Step 5: `Header.tsx`** – `themeEdit`-Typ um `accessPassword: string | null` erweitern, Kommentar „Owner only: shows the settings pencil (design, password)…“, und `accessPassword={themeEdit.accessPassword}` an `ThemeEditButton` durchreichen (Aufrufstelle in `Header.tsx` per `grep -n ThemeEditButton src/components/Header.tsx` finden).

- [ ] **Step 6: Run** `npx eslint src/components` – Expected: keine Fehler. (`tsc` meldet bis Task 9 noch die fehlenden Props in `page.tsx` – erwartet.)

- [ ] **Step 7:** Kein Commit.

---

### Task 9: Sperrseite, Anfrage-Dialog, Gating von Seite/Metadaten/OG

**Files:**
- Create: `src/components/PasswordRequestDialog.tsx`
- Create: `src/components/EventLockedPage.tsx`
- Modify: `src/app/event/[slug]/page.tsx`
- Modify: `src/app/event/[slug]/layout.tsx` (`generateMetadata`)
- Modify: `src/app/event/[slug]/opengraph-image.tsx`

**Interfaces:**
- Consumes: `getViewerAccess` (Task 5), `/unlock` (Task 5), `/password-request` (Task 6), `validatePasswordRequest`, `PHONE_CHANNELS`, `PHONE_CHANNEL_LABELS`, `PASSWORD_REQUEST_*` (Task 2), Footer-/Header-Props (Tasks 7, 8).
- Produces: `EventLockedPage({ eventId, title }: { eventId: string; title: string })`; `PasswordRequestDialog({ eventId, onCloseAction })`.

- [ ] **Step 1: `PasswordRequestDialog.tsx`**

```tsx
"use client";

import { useId, useRef, useState, type SubmitEvent } from "react";
import {
  NAME_MAX_LENGTH,
  PASSWORD_REQUEST_MESSAGE_MAX_LENGTH,
  PASSWORD_REQUEST_OTHER_MAX_LENGTH,
  PHONE_CHANNEL_LABELS,
  PHONE_CHANNELS,
  validatePasswordRequest,
  type PhoneChannel,
} from "@/lib/validation";
import { Button } from "./Button";
import { FormModal } from "./FormModal";
import { LegalLink } from "./LegalLink";
import { RecaptchaCheckbox } from "./RecaptchaCheckbox";

type PasswordRequestDialogProps = {
  eventId: string;
  onCloseAction: () => void;
};

type ContactKind = "email" | "phone";

const inputClass = "w-full rounded-xl border border-leaf/25 bg-surface px-3 py-3";

// Locked event page: asks the owner for the password by e-mail. Only the
// chosen contact way is shown and sent.
export function PasswordRequestDialog({ eventId, onCloseAction }: PasswordRequestDialogProps) {
  const titleId = useId();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const otherId = useId();
  const messageId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [contactKind, setContactKind] = useState<ContactKind | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<PhoneChannel | null>(null);
  const [channelOther, setChannelOther] = useState("");
  const [message, setMessage] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaReset, setRecaptchaReset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  function requestClose() {
    if (!saving) onCloseAction();
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (sent) {
      onCloseAction();
      return;
    }

    const body = {
      name,
      contactKind: contactKind ?? undefined,
      ...(contactKind === "email" ? { email } : {}),
      ...(contactKind === "phone"
        ? { phone, channel: channel ?? undefined, ...(channel === "other" ? { channelOther } : {}) }
        : {}),
      message,
    };
    const validation = validatePasswordRequest(body);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    if (!recaptchaToken) {
      setError("Bitte bestätige, dass du kein Roboter bist.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/password-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, recaptchaToken }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.");
        setRecaptchaReset((value) => value + 1);
        return;
      }
      setSent(true);
    } catch {
      setError("Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.");
      setRecaptchaReset((value) => value + 1);
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormModal
      titleId={titleId}
      onSubmitAction={handleSubmit}
      onCloseAction={requestClose}
      closeDisabled={saving}
      initialFocusRef={sent ? undefined : nameInputRef}
      header="Passwort anfragen"
      footer={
        sent ? (
          <Button variant="primary" type="submit">
            Schließen
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={requestClose} disabled={saving}>
              Abbrechen
            </Button>
            <Button variant="primary" type="submit" disabled={saving || !recaptchaToken}>
              {saving ? "Wird gesendet ..." : "Anfrage senden"}
            </Button>
          </>
        )
      }
    >
      {sent ? (
        <p role="status" className="text-muted">
          Deine Anfrage wurde an den Gastgeber geschickt. Er meldet sich bei dir.
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor={nameId} className="mb-1 block text-sm font-bold">
              Name
            </label>
            <input
              ref={nameInputRef}
              id={nameId}
              type="text"
              autoComplete="name"
              maxLength={NAME_MAX_LENGTH}
              value={name}
              disabled={saving}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
            />
          </div>

          <fieldset>
            <legend className="mb-1 block text-sm font-bold">
              Wie soll dir der Gastgeber das Passwort schicken?
            </legend>
            <div className="flex gap-4">
              {(["email", "phone"] as const).map((kind) => (
                <label key={kind} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="contactKind"
                    checked={contactKind === kind}
                    disabled={saving}
                    onChange={() => setContactKind(kind)}
                    className="h-5 w-5"
                  />
                  {kind === "email" ? "E-Mail" : "Telefon"}
                </label>
              ))}
            </div>
          </fieldset>

          {contactKind === "email" ? (
            <div>
              <label htmlFor={emailId} className="mb-1 block text-sm font-bold">
                E-Mail-Adresse
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                value={email}
                disabled={saving}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </div>
          ) : null}

          {contactKind === "phone" ? (
            <>
              <div>
                <label htmlFor={phoneId} className="mb-1 block text-sm font-bold">
                  Telefonnummer
                </label>
                <input
                  id={phoneId}
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  disabled={saving}
                  onChange={(event) => setPhone(event.target.value)}
                  className={inputClass}
                />
              </div>
              <fieldset>
                <legend className="mb-1 block text-sm font-bold">Per</legend>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {PHONE_CHANNELS.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="channel"
                        checked={channel === option}
                        disabled={saving}
                        onChange={() => setChannel(option)}
                        className="h-5 w-5"
                      />
                      {PHONE_CHANNEL_LABELS[option]}
                    </label>
                  ))}
                </div>
              </fieldset>
              {channel === "other" ? (
                <div>
                  <label htmlFor={otherId} className="mb-1 block text-sm font-bold">
                    Wie genau?
                  </label>
                  <input
                    id={otherId}
                    type="text"
                    placeholder="z. B. Signal oder Anruf"
                    maxLength={PASSWORD_REQUEST_OTHER_MAX_LENGTH}
                    value={channelOther}
                    disabled={saving}
                    onChange={(event) => setChannelOther(event.target.value)}
                    className={inputClass}
                  />
                </div>
              ) : null}
            </>
          ) : null}

          <div>
            <label htmlFor={messageId} className="mb-1 block text-sm font-bold">
              Nachricht <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id={messageId}
              rows={3}
              maxLength={PASSWORD_REQUEST_MESSAGE_MAX_LENGTH}
              value={message}
              disabled={saving}
              onChange={(event) => setMessage(event.target.value)}
              className={inputClass}
            />
          </div>

          <RecaptchaCheckbox onTokenChange={setRecaptchaToken} resetSignal={recaptchaReset} />

          <p className="text-xs text-muted">
            Deine Angaben schicken wir einmalig per E-Mail an den Gastgeber und speichern sie
            nicht. Mehr dazu in der{" "}
            <LegalLink document="privacy" className="underline underline-offset-2 hover:text-leaf-dark">
              Datenschutzerklärung
            </LegalLink>
            .
          </p>

          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </FormModal>
  );
}
```

- [ ] **Step 2: `EventLockedPage.tsx`**

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type SubmitEvent } from "react";
import { AuthDialog } from "./AuthDialog";
import { Button } from "./Button";
import { cardClass } from "./card";
import { PasswordInput } from "./PasswordInput";
import { PasswordRequestDialog } from "./PasswordRequestDialog";
import { SiteHeader } from "./SiteHeader";

type EventLockedPageProps = {
  eventId: string;
  title: string;
};

// Shown instead of a password-protected event to everyone who is neither
// its signed-in owner nor has unlocked it. Only the title is revealed.
export function EventLockedPage({ eventId, title }: EventLockedPageProps) {
  const router = useRouter();
  const passwordId = useId();
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (!password.trim()) {
      setError("Bitte gib das Passwort ein.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Das Event konnte nicht geöffnet werden. Bitte versuche es erneut.");
        return;
      }
      // The cookie is set - render the page again, now with the event.
      router.refresh();
    } catch {
      setError("Das Event konnte nicht geöffnet werden. Bitte versuche es erneut.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex flex-col items-center px-4 pt-4 pb-16">
        <div className={`${cardClass} w-full max-w-md text-center`}>
          <h1 className="font-display text-3xl leading-tight text-leaf-dark">Einladung: {title}</h1>
          <p className="mt-3 text-muted">
            Dieses Event ist passwortgeschützt. Gib das Passwort ein, das du vom Gastgeber
            bekommen hast.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 text-left">
            <label htmlFor={passwordId} className="mb-1 block text-sm font-bold">
              Passwort
            </label>
            <PasswordInput
              id={passwordId}
              value={password}
              autoComplete="off"
              disabled={saving}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error ? (
              <p className="mt-2 text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" variant="primary" className="mt-4 w-full" disabled={saving}>
              {saving ? "Wird geprüft ..." : "Event öffnen"}
            </Button>
          </form>

          <Button variant="outline" className="mt-3 w-full" onClick={() => setRequestOpen(true)}>
            Passwort anfragen
          </Button>

          <p className="mt-6 text-sm text-muted">
            Du bist der Gastgeber?{" "}
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="underline underline-offset-2 hover:text-leaf-dark"
            >
              Anmelden
            </button>
          </p>
        </div>
      </main>

      {requestOpen ? (
        <PasswordRequestDialog eventId={eventId} onCloseAction={() => setRequestOpen(false)} />
      ) : null}
      {/* No afterLoginHref: after login the dialog refreshes this page,
          which then renders the event for its owner. */}
      {loginOpen ? <AuthDialog initialMode="login" onCloseAction={() => setLoginOpen(false)} /> : null}
    </>
  );
}
```

- [ ] **Step 3: `page.tsx`** – Imports: `createClient` entfernen, `import { EventLockedPage } from "@/components/EventLockedPage";` und `import { getViewerAccess } from "@/services/event-access-service";` ergänzen. Den Block

```ts
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const isOwner = data?.claims?.sub === event.ownerId;
```

ersetzen durch:

```ts
  const { isOwner, hasAccess } = await getViewerAccess(event);
  // Password-protected and neither the owner nor unlocked: only the title.
  if (!hasAccess) {
    return <EventLockedPage eventId={event.id} title={event.title} />;
  }
  // The password only ever goes to the signed-in owner.
  const ownerAccessPassword = isOwner ? event.accessPassword : null;
```

`themeEdit` → `{ eventId: event.id, theme, unlockedThemes, accessPassword: ownerAccessPassword }`; `<Footer … accessPassword={ownerAccessPassword} />`.

Achtung: `getViewerAccess` gibt `isOwner` nur bei eingeloggtem Owner `true` – identisch zum bisherigen Verhalten bis auf `ownerId === null` (bisher `undefined === null` → false, jetzt ebenfalls false).

- [ ] **Step 4: `layout.tsx`** – in `generateMetadata` die `description` ersetzen durch:

```ts
  // Password-protected: the preview names the event but nothing else.
  const description = event.accessPassword
    ? "Passwortgeschützte Einladung – öffne den Link und gib das Passwort ein."
    : event.dateLabel
      ? `Du bist eingeladen – ${event.dateLabel}. Jetzt zusagen und Gästeliste ansehen.`
      : "Du bist eingeladen! Jetzt zusagen und Gästeliste ansehen.";
```

- [ ] **Step 5: `opengraph-image.tsx`** – Import `renderSiteOgImage` ist vorhanden; nach `if (!event) return renderSiteOgImage();` einfügen:

```ts
  // Password-protected: neither the theme (hints at the occasion) nor the date.
  if (event.accessPassword) {
    return renderSiteOgImage({
      title: `Einladung: ${event.title || "Event"}`,
      subtitle: "Passwortgeschützte Einladung",
    });
  }
```

Kopfkommentar ergänzen: „…Password-protected events show only their title.“

- [ ] **Step 6: Run** `npx tsc --noEmit`, `npx eslint src`, `npx vitest run` – Expected: alles grün.

- [ ] **Step 7:** Kein Commit.

---

### Task 10: Datenschutz, Secret, Browser-Verifikation

**Files:**
- Modify: `src/components/PrivacyPolicyContent.tsx`

- [ ] **Step 1: Datenschutz** – Abschnitt „5. Cookies und lokale Speicherung“: nach dem Listenpunkt „Anmelde-Cookies (Supabase)“ einfügen:

```tsx
          <li>
            <strong>Freischalt-Cookie (passwortgeschützte Events):</strong> merkt
            sich für bis zu 180 Tage, dass du das Passwort eines Events richtig
            eingegeben hast, damit du es nicht bei jedem Besuch erneut eingeben
            musst. Es enthält kein Passwort, nur eine Prüfsumme.
          </li>
```

(Der Eintrag gehört in die `<List>` unter `<SubHeading>Technisch notwendig</SubHeading>`, nach „Anmelde-Cookies (Supabase)“.) Am Ende von Abschnitt „8. Anmeldung als Gast“ – vor dessen schließendem `</Section>`, nach dem Absatz „Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Teilnahme an der Gästeliste)…“ – einen Unterabschnitt einfügen. **Keine neue Abschnittsnummer**, sonst verschieben sich 9–17 und der Verweis „siehe Abschnitt 10“ (reCAPTCHA) bricht:

```tsx
        <SubHeading>Passwort-Anfrage</SubHeading>
        <p>
          Ist ein Event passwortgeschützt, kannst du das Passwort beim
          Veranstalter anfragen. Dafür verarbeiten wir deinen Namen, je nach
          Wahl deine E-Mail-Adresse oder deine Telefonnummer samt gewünschtem
          Weg (z. B. SMS oder WhatsApp) sowie eine optionale Nachricht.
        </p>
        <p>
          Diese Angaben schicken wir einmalig per E-Mail an den Veranstalter
          und speichern sie nicht in unserer Datenbank. Bei einer Anfrage per
          E-Mail kann der Veranstalter direkt auf deine Adresse antworten.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Teilnahme an der
          Veranstaltung) bzw. lit. f DSGVO (berechtigtes Interesse an der
          Kontaktaufnahme).
        </p>
```

`<LastUpdated date="Oktober 2026" />` ist bereits gesetzt – prüfen, sonst aktualisieren.

- [ ] **Step 2: Secret** – User bitten, `EVENT_UNLOCK_SECRET` in `.env.local` und in Vercel (Production + Preview) zu setzen, mit dem Wert aus:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Dev-Server danach neu starten (Env wird nur beim Start gelesen).

- [ ] **Step 3: Test-Event** – User fragen: Test-Event per SQL auf seinem Account anlegen (und danach löschen) oder selbst anlegen? Bei SQL: `owner_id` per `select id from auth.users where email = '<user-mail>'` ermitteln, Event mit `slug='passwort-test-zz9zz9'`, `slug_key='zz9zz9'`, `title='Passwort-Test'`, `theme='weiss'`, `access_password='Test1234'`, alle anderen Textfelder `''` anlegen.

- [ ] **Step 4: Browser (nicht eingeloggt, eigener Tab)** – `/event/passwort-test-zz9zz9` öffnen:
  - Sperrseite mit GASTZILLA-Logo, „Einladung: Passwort-Test“, kein Datum/Ort.
  - `fetch('/api/events/<id>/guests')` im Tab → Status `403`.
  - Falsches Passwort → „Das Passwort ist leider falsch.“
  - „Passwort anfragen“: E-Mail/Telefon umschalten, „Sonstiges“ blendet Textfeld ein, Validierungsmeldungen erscheinen (nicht absenden – reCAPTCHA).
  - Richtiges Passwort → Event-Seite erscheint; Gäste-API → `200`.
  - Mobile-Viewport (375 px): Sperrseite ohne horizontales Scrollen.

- [ ] **Step 5: Browser (Owner)** – nur wenn der User eingeloggt ist oder selbst testet: Stift → „Event-Einstellungen“, Tooltip öffnen/schließen (Klick daneben, Esc schließt nur den Tooltip), Passwort ändern → altes Cookie ungültig (Gast-Tab neu laden → Sperrseite), Einladungstext enthält „Passwort für die Event-Seite: …“, Badge „Passwortgeschützt“ sichtbar.

- [ ] **Step 6: Aufräumen** – Test-Event löschen (`delete from public.events where slug_key = 'zz9zz9';`), Browser-Viewport zurücksetzen, selbst gestartete Dev-Server stoppen.

- [ ] **Step 7: Abschluss** – `npx tsc --noEmit`, `npx eslint src`, `npx vitest run`, `npx next build` – alle grün. Kein Commit.
