# Anlass-Seiten (SEO-Landingpages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Commit policy:** **No commits, no pushes, no branches/worktrees.** Work directly in the main working tree; all changes stay uncommitted and the user commits themselves. Reviews compare the working tree (`git diff`, `git status`) against the state before the task. Subagents must be told explicitly not to run `git commit`.

**Goal:** Statische Info-Seiten pro Anlass unter `/einladung/<slug>` plus Übersicht `/einladung`, verlinkt von der Startseite, in Sitemap, `llms.txt` und mit strukturierten Daten – zunächst nur mit dem Anlass Kindergeburtstag als Muster.

**Architecture:** Eine reine Datenliste `OCCASIONS` in `src/lib/occasions.ts` (ohne React) speist eine statisch erzeugte Vorlage `src/app/einladung/[anlass]/page.tsx`, die Übersichtsseite, den Startseiten-Abschnitt, Sitemap, `llms.txt` und die JSON-LD-Builder in `src/lib/structured-data.ts`. Gemeinsame UI-Teile der Startseite (Schritte, FAQ, Icons, JSON-LD-Ausgabe) werden in eigene Komponenten ausgelagert und wiederverwendet.

**Tech Stack:** Next.js 16 (App Router, `generateStaticParams`, `next/og`), React 19, TypeScript, Tailwind 4, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-06-occasion-landing-pages-design.md`

## Global Constraints

- Adressen: Übersicht `/einladung`, Anlass `/einladung/<slug>`. Deutsch ohne Sprachpräfix.
- Jeder Anlass hat eine sprachunabhängige `id` (englisch, z. B. `kids-birthday`) und einen deutschen `slug`; beide nur `a-z`, `0-9`, `-`.
- `description` max. 160 Zeichen; `metaTitle` endet auf `– GASTZILLA`; je 3–4 `benefits` und 3–4 `faq`; `updated` im Format `YYYY-MM-DD`.
- Texte: Anrede „du“; nur Funktionen nennen, die GASTZILLA wirklich hat (Zusage per Link ohne Konto, Begleitpersonen mit Namen, Bring-/Abholzeit, Mitbringsel, Nachricht, E-Mail-Benachrichtigung an Gastgeber, Teilen per WhatsApp/Signal/Telegram/E-Mail/Link, Termin in Kalender übernehmen, mehrere Designs). Keine erfundenen Designs, Zahlen oder Bewertungen. Premium-Designs (`natur`, `ballons`) nicht als kostenlos verfügbar darstellen.
- Unbekannter Slug → 404 (`dynamicParams = false`).
- In der App ändert sich nichts: kein Anlass-Feld, keine API-Änderung.
- Jede Task endet mit `npx tsc --noEmit`, `npx eslint src`, `npm test` grün.
- Live-Prüfung: Dev-Server über Browser-`preview_start` mit Launch-Config `insektenparty-dev`; **danach wieder stoppen** (Nutzerwunsch). Läuft schon ein Server auf Port 3000 (z. B. vom Nutzer), diesen nutzen und nicht stoppen.

---

### Task 1: Datenliste `OCCASIONS` mit Kindergeburtstag

**Files:**
- Modify: `src/lib/faq.ts` (Typ `FaqItem` exportieren)
- Create: `src/lib/occasions.ts`
- Test: `src/lib/occasions.test.ts`

**Interfaces:**
- Produces:
  - `type FaqItem = { question: string; answer: string }` (aus `@/lib/faq`)
  - `type Occasion = { id; slug; name; title; metaTitle; description; teaser; intro: string[]; benefitsTitle; benefits: { title: string; text: string }[]; faq: FaqItem[]; updated: string }`
  - `type Breadcrumb = { name: string; path: string }`
  - `const OCCASIONS_PATH = "/einladung"`
  - `const OCCASIONS_HUB: { title: string; metaTitle: string; description: string; intro: string }`
  - `const OCCASIONS: Occasion[]`
  - `occasionPath(occasion: Occasion): string`
  - `getOccasionBySlug(slug: string): Occasion | undefined`
  - `hubBreadcrumbs(): Breadcrumb[]`, `occasionBreadcrumbs(occasion: Occasion): Breadcrumb[]`
  - `latestOccasionUpdate(): string`

- [ ] **Step 1: `FaqItem` in `src/lib/faq.ts` exportieren**

Ersetze die Zeile

```ts
export const FAQ: { question: string; answer: string }[] = [
```

durch

```ts
export type FaqItem = { question: string; answer: string };

export const FAQ: FaqItem[] = [
```

- [ ] **Step 2: Failing test schreiben** – `src/lib/occasions.test.ts`

```ts
import { describe, expect, it } from "vitest";
import {
  getOccasionBySlug,
  hubBreadcrumbs,
  latestOccasionUpdate,
  OCCASIONS,
  OCCASIONS_HUB,
  occasionBreadcrumbs,
  occasionPath,
} from "@/lib/occasions";

const URL_SAFE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("OCCASIONS", () => {
  it("is not empty", () => {
    expect(OCCASIONS.length).toBeGreaterThan(0);
  });

  it("has unique ids and slugs", () => {
    expect(new Set(OCCASIONS.map((o) => o.id)).size).toBe(OCCASIONS.length);
    expect(new Set(OCCASIONS.map((o) => o.slug)).size).toBe(OCCASIONS.length);
  });

  for (const occasion of OCCASIONS) {
    describe(occasion.id, () => {
      it("uses URL-safe id and slug", () => {
        expect(occasion.id).toMatch(URL_SAFE);
        expect(occasion.slug).toMatch(URL_SAFE);
      });

      it("has no empty texts", () => {
        const texts = [
          occasion.name,
          occasion.title,
          occasion.metaTitle,
          occasion.description,
          occasion.teaser,
          occasion.benefitsTitle,
          ...occasion.intro,
          ...occasion.benefits.flatMap((b) => [b.title, b.text]),
          ...occasion.faq.flatMap((f) => [f.question, f.answer]),
        ];
        for (const text of texts) expect(text.trim()).not.toBe("");
        expect(occasion.intro.length).toBeGreaterThan(0);
      });

      it("fits search result limits", () => {
        expect(occasion.description.length).toBeLessThanOrEqual(160);
        expect(occasion.metaTitle.endsWith("– GASTZILLA")).toBe(true);
      });

      it("has 3-4 benefits and 3-4 FAQ entries", () => {
        expect(occasion.benefits.length).toBeGreaterThanOrEqual(3);
        expect(occasion.benefits.length).toBeLessThanOrEqual(4);
        expect(occasion.faq.length).toBeGreaterThanOrEqual(3);
        expect(occasion.faq.length).toBeLessThanOrEqual(4);
      });

      it("has a valid updated date", () => {
        expect(occasion.updated).toMatch(ISO_DATE);
        expect(Number.isNaN(Date.parse(occasion.updated))).toBe(false);
      });
    });
  }
});

describe("OCCASIONS_HUB", () => {
  it("fits search result limits", () => {
    expect(OCCASIONS_HUB.description.length).toBeLessThanOrEqual(160);
    expect(OCCASIONS_HUB.metaTitle.endsWith("– GASTZILLA")).toBe(true);
  });
});

describe("occasionPath / getOccasionBySlug", () => {
  it("builds the page path from the slug", () => {
    const occasion = getOccasionBySlug("kindergeburtstag");
    expect(occasion?.id).toBe("kids-birthday");
    expect(occasionPath(occasion!)).toBe("/einladung/kindergeburtstag");
  });

  it("returns undefined for unknown slugs", () => {
    expect(getOccasionBySlug("gibtsnicht")).toBeUndefined();
  });
});

describe("breadcrumbs", () => {
  it("leads from the start page to the hub", () => {
    expect(hubBreadcrumbs()).toEqual([
      { name: "Startseite", path: "/" },
      { name: "Anlässe", path: "/einladung" },
    ]);
  });

  it("ends with the occasion itself", () => {
    const occasion = getOccasionBySlug("kindergeburtstag")!;
    expect(occasionBreadcrumbs(occasion)).toEqual([
      { name: "Startseite", path: "/" },
      { name: "Anlässe", path: "/einladung" },
      { name: "Kindergeburtstag", path: "/einladung/kindergeburtstag" },
    ]);
  });
});

describe("latestOccasionUpdate", () => {
  it("is the newest updated date of all occasions", () => {
    const newest = OCCASIONS.map((o) => o.updated).sort().at(-1);
    expect(latestOccasionUpdate()).toBe(newest);
  });
});
```

- [ ] **Step 3: Test laufen lassen, er muss fehlschlagen**

Run: `npx vitest run src/lib/occasions.test.ts`
Expected: FAIL – `Failed to resolve import "@/lib/occasions"`.

- [ ] **Step 4: `src/lib/occasions.ts` anlegen**

```ts
import type { FaqItem } from "@/lib/faq";

// Info pages per occasion (/einladung/<slug>) - for search engines and AI
// assistants, nothing in the app depends on them. One entry here is all a
// new page needs: the page itself, the overview, the start page section,
// the sitemap and llms.txt are all built from this list.
// Only describe what GASTZILLA really does - no invented designs or numbers.
export type Occasion = {
  // Language-independent key; links the language versions of an occasion
  // once there are more languages. Never changes.
  id: string;
  // German URL part, /einladung/<slug>.
  slug: string;
  // Short name for chips and breadcrumbs.
  name: string;
  // H1, contains the search term.
  title: string;
  metaTitle: string;
  // Search result snippet, max. 160 characters.
  description: string;
  // One sentence for the overview page and llms.txt.
  teaser: string;
  intro: string[];
  // Own field because German needs zum/zur/zu depending on the occasion.
  benefitsTitle: string;
  benefits: { title: string; text: string }[];
  faq: FaqItem[];
  // Last real text change (sitemap lastModified), YYYY-MM-DD.
  updated: string;
};

export type Breadcrumb = { name: string; path: string };

export const OCCASIONS_PATH = "/einladung";

export const OCCASIONS_HUB = {
  title: "Online-Einladungen für jeden Anlass",
  metaTitle: "Online-Einladungen für jeden Anlass – GASTZILLA",
  description:
    "Ob Kindergeburtstag, Hochzeit oder Grillabend: Erstelle kostenlos eine digitale Einladung, teile den Link und sammle alle Zusagen in einer Gästeliste.",
  intro:
    "Egal, was du feierst: Mit GASTZILLA bekommt jeder Anlass seine eigene Einladungsseite. Deine Gäste sagen per Link zu – ohne Konto, ohne App und ohne Zusagen-Chaos im Gruppenchat.",
};

export const OCCASIONS: Occasion[] = [
  {
    id: "kids-birthday",
    slug: "kindergeburtstag",
    name: "Kindergeburtstag",
    title: "Einladung zum Kindergeburtstag online erstellen",
    metaTitle: "Einladung zum Kindergeburtstag online erstellen – GASTZILLA",
    description:
      "Kindergeburtstag-Einladung per Link: Eltern sagen ohne Konto zu, du siehst Bring- und Abholzeiten und Mitbringsel auf einen Blick. Kostenlos & werbefrei.",
    teaser: "Eltern sagen per Link zu – mit Bring- und Abholzeit, Geschwistern und Mitbringseln.",
    intro: [
      "Beim Kindergeburtstag laufen die Zusagen meist kreuz und quer: ein paar im Klassenchat, ein paar per Nachricht, eine auf dem Schulhof. Wer kommt jetzt eigentlich, wer bringt das Geschwisterkind mit, und wann wird wer abgeholt?",
      "Mit GASTZILLA erstellst du in wenigen Minuten eine Einladungsseite für den Kindergeburtstag und schickst den Link an die Eltern. Sie tragen ihr Kind selbst ein – ganz ohne Konto oder App – und du hast alle Zusagen in einer Liste.",
    ],
    benefitsTitle: "Darum passt GASTZILLA zum Kindergeburtstag",
    benefits: [
      {
        title: "Bring- und Abholzeiten im Blick",
        text: "Eltern geben an, wann sie ihr Kind bringen und wieder abholen. So weißt du, wer wann da ist – und niemand wartet vergeblich an der Tür.",
      },
      {
        title: "Geschwister und Begleitung",
        text: "Kommt ein Elternteil oder das Geschwisterkind mit? Begleitpersonen werden direkt bei der Zusage mit Namen eingetragen und mitgezählt.",
      },
      {
        title: "Mitbringsel abstimmen",
        text: "Wer Kuchen, Muffins oder Saft mitbringt, schreibt es dazu. Alle sehen es – und es gibt keine fünf Nudelsalate.",
      },
      {
        title: "Ein Link für den Klassenchat",
        text: "Teile die Einladung per WhatsApp, Signal, Telegram oder E-Mail. Bei jeder neuen Zusage bekommst du eine Benachrichtigung per E-Mail.",
      },
    ],
    faq: [
      {
        question: "Brauchen die Eltern ein Konto oder eine App?",
        answer:
          "Nein. Die Eltern öffnen einfach den Einladungslink im Browser und tragen ihr Kind ein. Nur du als Gastgeber brauchst ein kostenloses Konto.",
      },
      {
        question: "Wer kann die Gästeliste sehen?",
        answer:
          "Alle, die den Einladungslink haben – also die eingeladenen Familien. Suchmaschinen finden deine Event-Seite nicht. Teile den Link deshalb nur mit den Eltern, die du einladen möchtest.",
      },
      {
        question: "Was kostet die Einladung zum Kindergeburtstag?",
        answer:
          "Nichts. Ein Event mit allen Grundfunktionen ist bei GASTZILLA kostenlos und werbefrei.",
      },
      {
        question: "Können die Eltern den Termin in ihren Kalender übernehmen?",
        answer:
          "Ja. Mit einem Klick auf das Datum der Einladung landet der Termin direkt im eigenen Kalender.",
      },
    ],
    updated: "2026-10-06",
  },
];

export function occasionPath(occasion: Occasion): string {
  return `${OCCASIONS_PATH}/${occasion.slug}`;
}

export function getOccasionBySlug(slug: string): Occasion | undefined {
  return OCCASIONS.find((occasion) => occasion.slug === slug);
}

// Shared by the visible breadcrumb navigation and the BreadcrumbList schema.
export function hubBreadcrumbs(): Breadcrumb[] {
  return [
    { name: "Startseite", path: "/" },
    { name: "Anlässe", path: OCCASIONS_PATH },
  ];
}

export function occasionBreadcrumbs(occasion: Occasion): Breadcrumb[] {
  return [...hubBreadcrumbs(), { name: occasion.name, path: occasionPath(occasion) }];
}

// The overview page changes whenever one of its occasions does.
export function latestOccasionUpdate(): string {
  return OCCASIONS.map((occasion) => occasion.updated).sort().at(-1) ?? "";
}
```

- [ ] **Step 5: Test laufen lassen, er muss bestehen**

Run: `npx vitest run src/lib/occasions.test.ts`
Expected: PASS. Falls `fits search result limits` scheitert: `description` kürzen (nicht den Test ändern).

- [ ] **Step 6: Gesamtprüfung**

Run: `npx tsc --noEmit; npx eslint src; npm test`
Expected: alles grün.

---

### Task 2: Gemeinsame Bausteine aus der Startseite auslagern

Reines Refactoring – die Startseite muss danach identisch aussehen.

**Files:**
- Create: `src/components/card.ts`, `src/components/LandingIcons.tsx`, `src/components/JsonLd.tsx`, `src/components/HowItWorks.tsx`, `src/components/FaqSection.tsx`
- Modify: `src/components/LandingContent.tsx` (komplett ersetzen, Inhalt unten)

**Interfaces:**
- Consumes: `FaqItem` aus `@/lib/faq` (Task 1)
- Produces:
  - `cardClass: string` (aus `./card`)
  - `ClockIcon`, `GuestIcon`, `CalendarPlusIcon`, `ListCheckIcon`, `ShareIcon` (aus `./LandingIcons`)
  - `JsonLd({ data }: { data: object })`
  - `HowItWorks()` – komplette Karte „So funktioniert's“
  - `FaqSection({ items, children }: { items: FaqItem[]; children?: ReactNode })` – komplette Karte „Häufige Fragen“

- [ ] **Step 1: `src/components/card.ts`**

```ts
// Card look shared by the start page and the occasion pages.
export const cardClass =
  "rounded-[2rem] border border-leaf/20 bg-[var(--surface)] p-5 shadow-(--shadow) sm:p-8";
```

- [ ] **Step 2: `src/components/LandingIcons.tsx`** – die fünf Icon-Funktionen unverändert aus `LandingContent.tsx` übernehmen, jeweils mit `export`:

```tsx
// Line icons of the start page and the occasion pages.

export function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function GuestIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M3 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 11l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarPlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ListCheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6l1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 6h10M11 12h10M11 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ShareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
```

- [ ] **Step 3: `src/components/JsonLd.tsx`**

```tsx
// schema.org data for search engines and AI assistants. Built from our own
// constants; "<" is escaped so the JSON can never close the script tag.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
```

- [ ] **Step 4: `src/components/HowItWorks.tsx`**

```tsx
import type { ReactNode } from "react";
import { cardClass } from "./card";
import { CalendarPlusIcon, ListCheckIcon, ShareIcon } from "./LandingIcons";

const STEPS: { text: string; icon: ReactNode }[] = [
  { text: "Event anlegen und Design für jeden Anlass aussuchen", icon: <CalendarPlusIcon /> },
  { text: "Einladungslink teilen", icon: <ShareIcon /> },
  { text: "Zusagen jederzeit im Blick – mit Benachrichtigung per E-Mail", icon: <ListCheckIcon /> },
];

// "So funktioniert's" card - the same three steps on the start page and
// every occasion page.
export function HowItWorks() {
  return (
    <section aria-labelledby="steps-title" className={cardClass}>
      <h2 id="steps-title" className="text-center font-display text-2xl text-leaf-dark sm:text-3xl">
        So funktioniert&apos;s
      </h2>
      <ol className="mt-6 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.text} className="flex flex-col items-center text-center">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-button-primary text-button-primary-text">
              {step.icon}
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--surface-solid)] bg-honey text-[11px] font-bold text-on-honey">
                {index + 1}
              </span>
            </span>
            <p className="mt-3 text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 5: `src/components/FaqSection.tsx`**

```tsx
import type { ReactNode } from "react";
import type { FaqItem } from "@/lib/faq";
import { cardClass } from "./card";

// "Häufige Fragen" card. The answers are plain HTML (no client JS), so
// crawlers read them even while collapsed. Pair with FAQPage schema.
export function FaqSection({ items, children }: { items: FaqItem[]; children?: ReactNode }) {
  return (
    <section aria-labelledby="faq-title" className={cardClass}>
      <h2 id="faq-title" className="text-center font-display text-2xl text-leaf-dark sm:text-3xl">
        Häufige Fragen
      </h2>
      <div className="mt-6 space-y-2 text-left">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-2xl border border-leaf/15 px-4 py-3 open:bg-leaf/5"
          >
            <summary className="cursor-pointer list-none font-bold text-leaf-dark marker:hidden">
              <span className="mr-2 inline-block transition group-open:rotate-90">›</span>
              {item.question}
            </summary>
            <p className="mt-2 pl-5 text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
      {children}
    </section>
  );
}
```

- [ ] **Step 6: `src/components/LandingContent.tsx` komplett ersetzen**

```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { FAQ } from "@/lib/faq";
import { siteStructuredData } from "@/lib/structured-data";
import { AuthButtons } from "./AuthButtons";
import { cardClass } from "./card";
import { FaqSection } from "./FaqSection";
import { HowItWorks } from "./HowItWorks";
import { JsonLd } from "./JsonLd";
import { ClockIcon, GuestIcon, ShareIcon } from "./LandingIcons";

const BENEFITS: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: "In 2 Minuten fertig",
    text: "Titel, Datum, Ort, Design wählen – fertig ist deine Einladungsseite.",
    icon: <ClockIcon />,
  },
  {
    title: "Gäste brauchen kein Konto",
    text: "Zusagen, Begleitpersonen, Mitbringsel und Nachrichten direkt über den Link.",
    icon: <GuestIcon />,
  },
  {
    title: "Teilen, wo deine Gäste sind",
    text: "WhatsApp, Signal, Telegram, E-Mail – oder einfach den Link kopieren.",
    icon: <ShareIcon />,
  },
];

// Start page for visitors who are not logged in - the content search
// engines index (logged-in users see their event list instead).
export function LandingContent() {
  return (
    <div className="w-full max-w-3xl space-y-8">
      <JsonLd data={siteStructuredData()} />
      <section className="text-center">
        <h1 className="font-display text-3xl leading-tight text-leaf-dark sm:text-5xl">
          Online-Einladung &amp; Gästeliste kostenlos erstellen
        </h1>
        <p className="mt-4 text-xl font-bold text-amber-700 sm:text-2xl">
          Schluss mit Zusagen-Chaos im Gruppenchat.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">
          Erstelle in wenigen Minuten eine Einladungsseite für Geburtstag, Hochzeit,
          Grillabend oder Firmenfeier. Teile den Link – deine Gäste tragen sich selbst ein.
        </p>
        <div className="mt-6 flex justify-center">
          <AuthButtons registerLabel="Kostenlos starten" />
        </div>
      </section>

      <section aria-labelledby="benefits-title" className={cardClass}>
        <h2 id="benefits-title" className="sr-only">
          Vorteile
        </h2>
        <ul className="grid gap-6 sm:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-leaf/10 text-leaf-dark">
                {benefit.icon}
              </span>
              <h3 className="mt-3 font-display text-lg text-leaf-dark">{benefit.title}</h3>
              <p className="mt-1 text-sm text-muted">{benefit.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <HowItWorks />

      <FaqSection items={FAQ}>
        <p className="mt-6 text-center text-sm text-muted">
          Mehr über die Idee hinter GASTZILLA:{" "}
          <Link href="/about" className="font-bold text-leaf-dark underline underline-offset-2">
            Über uns
          </Link>
        </p>
      </FaqSection>
    </div>
  );
}
```

- [ ] **Step 7: Gesamtprüfung**

Run: `npx tsc --noEmit; npx eslint src; npm test`
Expected: alles grün.

- [ ] **Step 8: Startseite unverändert?**

Dev-Server (siehe Global Constraints), ausgeloggt `http://localhost:3000/` öffnen. Prüfen per `curl -s http://localhost:3000/ | grep -oE '<h[1-3][^>]*>[^<]*'`: gleiche Überschriften wie vorher (H1, H2 „Vorteile“, 3× H3, H2 „So funktioniert's“, H2 „Häufige Fragen“) und genau ein `application/ld+json`.

---

### Task 3: JSON-LD-Builder für Anlass- und Übersichtsseite

**Files:**
- Modify: `src/lib/structured-data.ts`
- Test: `src/lib/structured-data.test.ts`

**Interfaces:**
- Consumes: `Occasion`, `Breadcrumb`, `OCCASIONS`, `OCCASIONS_HUB`, `OCCASIONS_PATH`, `occasionPath`, `occasionBreadcrumbs`, `hubBreadcrumbs` (Task 1); `FaqItem` (Task 1)
- Produces:
  - `occasionStructuredData(occasion: Occasion)` – `{ "@context", "@graph": [WebPage, BreadcrumbList, FAQPage] }`
  - `occasionsHubStructuredData()` – `{ "@context", "@graph": [CollectionPage, BreadcrumbList] }`
  - `siteStructuredData()` bleibt in Signatur und Ausgabe gleich.

- [ ] **Step 1: Failing test schreiben** – `src/lib/structured-data.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { FAQ } from "@/lib/faq";
import { getOccasionBySlug, OCCASIONS } from "@/lib/occasions";
import {
  occasionStructuredData,
  occasionsHubStructuredData,
  siteStructuredData,
} from "@/lib/structured-data";

type Node = Record<string, unknown> & { "@type": string };

function byType(data: { "@graph": object[] }, type: string): Node {
  const node = (data["@graph"] as Node[]).find((n) => n["@type"] === type);
  if (!node) throw new Error(`no ${type} node`);
  return node;
}

describe("siteStructuredData", () => {
  it("describes organization, website, app and FAQ", () => {
    const types = (siteStructuredData()["@graph"] as Node[]).map((n) => n["@type"]);
    expect(types).toEqual(["Organization", "WebSite", "WebApplication", "FAQPage"]);
  });

  it("lists every start page question", () => {
    const faq = byType(siteStructuredData(), "FAQPage");
    expect((faq.mainEntity as unknown[]).length).toBe(FAQ.length);
  });
});

describe("occasionStructuredData", () => {
  const occasion = getOccasionBySlug("kindergeburtstag")!;
  const data = occasionStructuredData(occasion);

  it("describes the page as part of the site", () => {
    const page = byType(data, "WebPage");
    expect(page.url).toBe("https://gastzilla.de/einladung/kindergeburtstag");
    expect(page.name).toBe(occasion.metaTitle);
    expect(page.isPartOf).toEqual({ "@id": "https://gastzilla.de/#website" });
    expect(page.about).toEqual({ "@id": "https://gastzilla.de/#app" });
  });

  it("has a three-step breadcrumb with absolute URLs", () => {
    const breadcrumb = byType(data, "BreadcrumbList");
    expect(breadcrumb.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Startseite", item: "https://gastzilla.de/" },
      { "@type": "ListItem", position: 2, name: "Anlässe", item: "https://gastzilla.de/einladung" },
      {
        "@type": "ListItem",
        position: 3,
        name: "Kindergeburtstag",
        item: "https://gastzilla.de/einladung/kindergeburtstag",
      },
    ]);
  });

  it("lists every occasion question with its answer", () => {
    const faq = byType(data, "FAQPage");
    expect(faq.mainEntity).toEqual(
      occasion.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    );
  });
});

describe("occasionsHubStructuredData", () => {
  const data = occasionsHubStructuredData();

  it("lists every occasion page", () => {
    const page = byType(data, "CollectionPage");
    expect(page.url).toBe("https://gastzilla.de/einladung");
    const list = page.mainEntity as { itemListElement: { url: string }[] };
    expect(list.itemListElement.map((item) => item.url)).toEqual(
      OCCASIONS.map((o) => `https://gastzilla.de/einladung/${o.slug}`),
    );
  });

  it("has a two-step breadcrumb", () => {
    const breadcrumb = byType(data, "BreadcrumbList");
    expect((breadcrumb.itemListElement as unknown[]).length).toBe(2);
  });
});
```

- [ ] **Step 2: Test laufen lassen, er muss fehlschlagen**

Run: `npx vitest run src/lib/structured-data.test.ts`
Expected: FAIL – `occasionStructuredData is not a function` (bzw. Export fehlt).

- [ ] **Step 3: `src/lib/structured-data.ts` erweitern**

Importe oben ergänzen:

```ts
import { FAQ, type FaqItem } from "@/lib/faq";
import {
  type Breadcrumb,
  hubBreadcrumbs,
  type Occasion,
  occasionBreadcrumbs,
  occasionPath,
  OCCASIONS,
  OCCASIONS_HUB,
  OCCASIONS_PATH,
} from "@/lib/occasions";
```

(die bisherige Zeile `import { FAQ } from "@/lib/faq";` entfällt). Unter `const ORGANIZATION_ID = …` ergänzen:

```ts
const WEBSITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#app`;

function faqPage(items: FaqItem[], id: string) {
  return {
    "@type": "FAQPage",
    "@id": id,
    inLanguage: "de",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function breadcrumbList(items: Breadcrumb[], id: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
```

In `siteStructuredData()`: `"@id": \`${SITE_URL}/#website\`` → `"@id": WEBSITE_ID`, `"@id": \`${SITE_URL}/#app\`` → `"@id": APP_ID`, und den ganzen `FAQPage`-Block ersetzen durch `faqPage(FAQ, \`${SITE_URL}/#faq\`),`.

Am Dateiende ergänzen:

```ts
// One occasion page (/einladung/<slug>): the page itself, its breadcrumb
// and its FAQ, tied to the site and the app described on the start page.
export function occasionStructuredData(occasion: Occasion) {
  const url = `${SITE_URL}${occasionPath(occasion)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: occasion.metaTitle,
        description: occasion.description,
        inLanguage: "de",
        dateModified: occasion.updated,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": APP_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      breadcrumbList(occasionBreadcrumbs(occasion), `${url}#breadcrumb`),
      faqPage(occasion.faq, `${url}#faq`),
    ],
  };
}

// The overview page (/einladung): a collection of all occasion pages.
export function occasionsHubStructuredData() {
  const url = `${SITE_URL}${OCCASIONS_PATH}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: OCCASIONS_HUB.metaTitle,
        description: OCCASIONS_HUB.description,
        inLanguage: "de",
        isPartOf: { "@id": WEBSITE_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: OCCASIONS.map((occasion, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: occasion.name,
            url: `${SITE_URL}${occasionPath(occasion)}`,
          })),
        },
      },
      breadcrumbList(hubBreadcrumbs(), `${url}#breadcrumb`),
    ],
  };
}
```

- [ ] **Step 4: Test laufen lassen, er muss bestehen**

Run: `npx vitest run src/lib/structured-data.test.ts`
Expected: PASS.

- [ ] **Step 5: Gesamtprüfung**

Run: `npx tsc --noEmit; npx eslint src; npm test`
Expected: alles grün.

---

### Task 4: Anlass-Seite `/einladung/[anlass]` mit Breadcrumb und Vorschaubild

**Files:**
- Modify: `src/lib/page-metadata.ts` (optionaler Bildpfad)
- Modify: `src/lib/og-image.tsx` (`renderSiteOgImage` mit optionalem Titel/Untertitel)
- Create: `src/components/Breadcrumbs.tsx`, `src/components/OccasionChips.tsx`
- Create: `src/app/einladung/[anlass]/page.tsx`, `src/app/einladung/[anlass]/opengraph-image.tsx`

**Interfaces:**
- Consumes: Task 1 (`OCCASIONS`, `getOccasionBySlug`, `occasionPath`, `occasionBreadcrumbs`, `Breadcrumb`, `Occasion`), Task 2 (`cardClass`, `JsonLd`, `HowItWorks`, `FaqSection`), Task 3 (`occasionStructuredData`)
- Produces:
  - `pageMetadata({ title, description, path, image? })` – `image` default `"/opengraph-image"`
  - `renderSiteOgImage({ title?, subtitle? } = {})`
  - `Breadcrumbs({ items }: { items: Breadcrumb[] })` – letzter Eintrag ist die aktuelle Seite
  - `OccasionChips({ occasions }: { occasions: Occasion[] })`

- [ ] **Step 1: `pageMetadata` um `image` erweitern** (`src/lib/page-metadata.ts`)

Signatur und Verwendung ändern:

```ts
export function pageMetadata({
  title,
  description,
  path,
  image = "/opengraph-image",
}: {
  title: string;
  description: string;
  path: string;
  // Link preview image; pages with their own opengraph-image pass its path.
  image?: string;
}): Metadata {
```

und in `openGraph.images` bzw. `twitter.images` jeweils `"/opengraph-image"` durch `image` ersetzen.

- [ ] **Step 2: `renderSiteOgImage` parametrisieren** (`src/lib/og-image.tsx`)

```ts
export function renderSiteOgImage({
  title = "Online-Einladung & Gästeliste kostenlos erstellen",
  subtitle = "Schluss mit Zusagen-Chaos im Gruppenchat.",
}: { title?: string; subtitle?: string } = {}) {
  return renderOgCard({
    imageSrc: SITE_LOGO,
    imageWidth: 420,
    imageHeight: 149,
    title,
    subtitle,
  });
}
```

- [ ] **Step 3: `src/components/Breadcrumbs.tsx`**

```tsx
import Link from "next/link";
import type { Breadcrumb } from "@/lib/occasions";

// Visible breadcrumb trail; the same items go into the BreadcrumbList
// schema. The last item is the current page and is not a link.
export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Brotkrumen" className="text-sm text-muted">
      <ol className="flex flex-wrap justify-center gap-x-1">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-x-1">
              {index > 0 ? <span aria-hidden="true">›</span> : null}
              {isCurrent ? (
                <span aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.path} className="underline underline-offset-2 hover:text-leaf-dark">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 4: `src/components/OccasionChips.tsx`**

```tsx
import Link from "next/link";
import { type Occasion, occasionPath } from "@/lib/occasions";

// Occasion pages as round link chips (start page, "Weitere Anlässe").
export function OccasionChips({ occasions }: { occasions: Occasion[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {occasions.map((occasion) => (
        <li key={occasion.id}>
          <Link
            href={occasionPath(occasion)}
            className="inline-flex min-h-11 items-center rounded-full border border-leaf/30 bg-[var(--surface-solid)] px-4 font-bold text-leaf-dark transition hover:bg-leaf/10"
          >
            {occasion.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 5: `src/app/einladung/[anlass]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthButtons } from "@/components/AuthButtons";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cardClass } from "@/components/card";
import { FaqSection } from "@/components/FaqSection";
import { HowItWorks } from "@/components/HowItWorks";
import { JsonLd } from "@/components/JsonLd";
import { LegalLinks } from "@/components/LegalLinks";
import { OccasionChips } from "@/components/OccasionChips";
import { SiteHeader } from "@/components/SiteHeader";
import { getOccasionBySlug, OCCASIONS, occasionBreadcrumbs, occasionPath } from "@/lib/occasions";
import { pageMetadata } from "@/lib/page-metadata";
import { occasionStructuredData } from "@/lib/structured-data";

type OccasionPageProps = {
  params: Promise<{ anlass: string }>;
};

// Every occasion page is built at deploy time; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return OCCASIONS.map((occasion) => ({ anlass: occasion.slug }));
}

export async function generateMetadata({ params }: OccasionPageProps): Promise<Metadata> {
  const { anlass } = await params;
  const occasion = getOccasionBySlug(anlass);
  if (!occasion) return {};

  const path = occasionPath(occasion);
  return pageMetadata({
    title: occasion.metaTitle,
    description: occasion.description,
    path,
    image: `${path}/opengraph-image`,
  });
}

// Info page for one occasion (see src/lib/occasions.ts) - for search
// engines and AI assistants; signing up works as on the start page.
export default async function OccasionPage({ params }: OccasionPageProps) {
  const { anlass } = await params;
  const occasion = getOccasionBySlug(anlass);
  if (!occasion) notFound();

  const otherOccasions = OCCASIONS.filter((other) => other.id !== occasion.id);

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center px-6 py-16 text-center">
        <div className="w-full max-w-3xl space-y-8">
          <JsonLd data={occasionStructuredData(occasion)} />

          <section className="text-center">
            <Breadcrumbs items={occasionBreadcrumbs(occasion)} />
            <h1 className="mt-4 font-display text-3xl leading-tight text-leaf-dark sm:text-5xl">
              {occasion.title}
            </h1>
            <div className="mx-auto mt-4 max-w-xl space-y-3 text-lg text-muted">
              {occasion.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <AuthButtons registerLabel="Kostenlos starten" />
            </div>
          </section>

          <section aria-labelledby="benefits-title" className={cardClass}>
            <h2
              id="benefits-title"
              className="text-center font-display text-2xl text-leaf-dark sm:text-3xl"
            >
              {occasion.benefitsTitle}
            </h2>
            <ul className="mt-6 grid gap-6 text-left sm:grid-cols-2">
              {occasion.benefits.map((benefit) => (
                <li key={benefit.title}>
                  <h3 className="font-display text-lg text-leaf-dark">{benefit.title}</h3>
                  <p className="mt-1 text-muted">{benefit.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <HowItWorks />

          <FaqSection items={occasion.faq} />

          {otherOccasions.length > 0 ? (
            <section aria-labelledby="more-occasions-title" className={cardClass}>
              <h2
                id="more-occasions-title"
                className="text-center font-display text-2xl text-leaf-dark sm:text-3xl"
              >
                Weitere Anlässe
              </h2>
              <div className="mt-6">
                <OccasionChips occasions={otherOccasions} />
              </div>
            </section>
          ) : null}
        </div>

        <LegalLinks className="mt-auto pt-12" />
      </main>
    </>
  );
}
```

- [ ] **Step 6: `src/app/einladung/[anlass]/opengraph-image.tsx`**

```tsx
import { OG_SIZE, renderSiteOgImage } from "@/lib/og-image";
import { getOccasionBySlug, OCCASIONS } from "@/lib/occasions";

// Link preview for an occasion page: the site card with the occasion's
// headline.
export const alt = "GASTZILLA – Online-Einladung";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return OCCASIONS.map((occasion) => ({ anlass: occasion.slug }));
}

export default async function OccasionOpengraphImage({
  params,
}: {
  params: Promise<{ anlass: string }>;
}) {
  const { anlass } = await params;
  const occasion = getOccasionBySlug(anlass);
  if (!occasion) return renderSiteOgImage();

  return renderSiteOgImage({
    title: occasion.title,
    subtitle: "Kostenlos & werbefrei – Gäste sagen per Link zu.",
  });
}
```

- [ ] **Step 7: Gesamtprüfung**

Run: `npx tsc --noEmit; npx eslint src; npm test`
Expected: alles grün.

- [ ] **Step 8: Im Browser prüfen**

Dev-Server, dann:

```bash
curl -s http://localhost:3000/einladung/kindergeburtstag | grep -oE '<title>[^<]*</title>|<link rel="canonical"[^>]*>|<meta property="og:image"[^>]*>|<h[1-3][^>]*>[^<]*'
```

Expected: Titel „Einladung zum Kindergeburtstag online erstellen – GASTZILLA“, canonical `https://gastzilla.de/einladung/kindergeburtstag`, og:image auf `/einladung/kindergeburtstag/opengraph-image…`, eine H1, H2 Vorteile/So funktioniert's/Häufige Fragen, 4× H3. „Weitere Anlässe“ fehlt (nur ein Anlass). `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/einladung/gibtsnicht` → `404`. `http://localhost:3000/einladung/kindergeburtstag/opengraph-image` im Browser öffnen → Vorschaubild mit Anlass-Titel. Screenshot der Seite bei 375 px Breite (`resize_window` preset `mobile`, danach `desktop`).

---

### Task 5: Übersichtsseite `/einladung`

**Files:**
- Create: `src/app/einladung/page.tsx`

**Interfaces:**
- Consumes: Task 1 (`OCCASIONS`, `OCCASIONS_HUB`, `OCCASIONS_PATH`, `occasionPath`, `hubBreadcrumbs`), Task 2 (`cardClass`, `JsonLd`), Task 3 (`occasionsHubStructuredData`), Task 4 (`Breadcrumbs`)

- [ ] **Step 1: `src/app/einladung/page.tsx`**

```tsx
import Link from "next/link";
import { AuthButtons } from "@/components/AuthButtons";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { cardClass } from "@/components/card";
import { JsonLd } from "@/components/JsonLd";
import { LegalLinks } from "@/components/LegalLinks";
import { SiteHeader } from "@/components/SiteHeader";
import { hubBreadcrumbs, OCCASIONS, OCCASIONS_HUB, OCCASIONS_PATH, occasionPath } from "@/lib/occasions";
import { pageMetadata } from "@/lib/page-metadata";
import { occasionsHubStructuredData } from "@/lib/structured-data";

export const metadata = pageMetadata({
  title: OCCASIONS_HUB.metaTitle,
  description: OCCASIONS_HUB.description,
  path: OCCASIONS_PATH,
});

// Overview of all occasion pages - one card per entry in OCCASIONS.
export default function OccasionsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-full flex-col items-center px-6 py-16 text-center">
        <div className="w-full max-w-3xl space-y-8">
          <JsonLd data={occasionsHubStructuredData()} />

          <section className="text-center">
            <Breadcrumbs items={hubBreadcrumbs()} />
            <h1 className="mt-4 font-display text-3xl leading-tight text-leaf-dark sm:text-5xl">
              {OCCASIONS_HUB.title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{OCCASIONS_HUB.intro}</p>
            <div className="mt-6 flex justify-center">
              <AuthButtons registerLabel="Kostenlos starten" />
            </div>
          </section>

          <ul className="grid gap-4 text-left sm:grid-cols-2">
            {OCCASIONS.map((occasion) => (
              <li key={occasion.id}>
                <Link
                  href={occasionPath(occasion)}
                  className={`${cardClass} block h-full transition hover:border-leaf/50`}
                >
                  <h2 className="font-display text-xl text-leaf-dark">{occasion.name}</h2>
                  <p className="mt-2 text-muted">{occasion.teaser}</p>
                  <span className="mt-3 inline-block font-bold text-leaf-dark">Mehr erfahren →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <LegalLinks className="mt-auto pt-12" />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Gesamtprüfung**

Run: `npx tsc --noEmit; npx eslint src; npm test`
Expected: alles grün.

- [ ] **Step 3: Im Browser prüfen**

```bash
curl -s http://localhost:3000/einladung | grep -oE '<title>[^<]*</title>|<link rel="canonical"[^>]*>|<h[1-2][^>]*>[^<]*|href="/einladung/[^"]*"'
```

Expected: Titel „Online-Einladungen für jeden Anlass – GASTZILLA“, canonical `https://gastzilla.de/einladung`, H1 + je Anlass eine H2, Link `href="/einladung/kindergeburtstag"`. Breadcrumb-Link „Startseite“ führt zu `/`.

---

### Task 6: Abschnitt „Für jeden Anlass“ auf der Startseite

**Files:**
- Modify: `src/components/LandingContent.tsx`

**Interfaces:**
- Consumes: Task 1 (`OCCASIONS`, `OCCASIONS_PATH`), Task 2 (`cardClass`), Task 4 (`OccasionChips`)

- [ ] **Step 1: Importe ergänzen**

```tsx
import { OCCASIONS, OCCASIONS_PATH } from "@/lib/occasions";
import { OccasionChips } from "./OccasionChips";
```

- [ ] **Step 2: Abschnitt zwischen `<HowItWorks />` und `<FaqSection …>` einfügen**

```tsx
      <section aria-labelledby="occasions-title" className={cardClass}>
        <h2 id="occasions-title" className="text-center font-display text-2xl text-leaf-dark sm:text-3xl">
          Für jeden Anlass
        </h2>
        <div className="mt-6">
          <OccasionChips occasions={OCCASIONS} />
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href={OCCASIONS_PATH} className="font-bold text-leaf-dark underline underline-offset-2">
            Alle Anlässe →
          </Link>
        </p>
      </section>
```

- [ ] **Step 3: Gesamtprüfung**

Run: `npx tsc --noEmit; npx eslint src; npm test`
Expected: alles grün.

- [ ] **Step 4: Im Browser prüfen**

Ausgeloggt `http://localhost:3000/`: Abschnitt „Für jeden Anlass“ mit Chip „Kindergeburtstag“ und Link „Alle Anlässe →“ zwischen „So funktioniert's“ und „Häufige Fragen“. Chip-Klick führt zur Anlass-Seite. Screenshot.

---

### Task 7: Sitemap und `llms.txt`

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/app/llms.txt/route.ts`
- Test: `src/app/sitemap.test.ts`

**Interfaces:**
- Consumes: Task 1 (`OCCASIONS`, `OCCASIONS_HUB`, `OCCASIONS_PATH`, `occasionPath`, `latestOccasionUpdate`)

- [ ] **Step 1: Failing test schreiben** – `src/app/sitemap.test.ts`

```ts
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { latestOccasionUpdate, OCCASIONS } from "@/lib/occasions";

describe("sitemap", () => {
  const entries = sitemap();
  const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

  it("lists the occasion overview with the newest occasion date", () => {
    expect(byUrl.get("https://gastzilla.de/einladung")?.lastModified).toBe(latestOccasionUpdate());
  });

  it("lists every occasion page with its own date", () => {
    for (const occasion of OCCASIONS) {
      const entry = byUrl.get(`https://gastzilla.de/einladung/${occasion.slug}`);
      expect(entry?.lastModified).toBe(occasion.updated);
    }
  });

  it("never lists event pages", () => {
    expect(entries.some((entry) => entry.url.includes("/p/"))).toBe(false);
  });
});
```

- [ ] **Step 2: Test laufen lassen, er muss fehlschlagen**

Run: `npx vitest run src/app/sitemap.test.ts`
Expected: FAIL – Eintrag für `/einladung` ist `undefined`.

- [ ] **Step 3: `src/app/sitemap.ts` erweitern**

Import ergänzen:

```ts
import { latestOccasionUpdate, OCCASIONS, OCCASIONS_PATH, occasionPath } from "@/lib/occasions";
```

Nach dem `/about`-Eintrag im zurückgegebenen Array einfügen:

```ts
    {
      url: `${SITE_URL}${OCCASIONS_PATH}`,
      lastModified: latestOccasionUpdate(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...OCCASIONS.map((occasion) => ({
      url: `${SITE_URL}${occasionPath(occasion)}`,
      lastModified: occasion.updated,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
```

- [ ] **Step 4: Test laufen lassen, er muss bestehen**

Run: `npx vitest run src/app/sitemap.test.ts`
Expected: PASS.

- [ ] **Step 5: `llms.txt` um Anlässe ergänzen** (`src/app/llms.txt/route.ts`)

Import ergänzen:

```ts
import { OCCASIONS, OCCASIONS_HUB, OCCASIONS_PATH, occasionPath } from "@/lib/occasions";
```

Im Template-String direkt vor `## Häufige Fragen` einfügen:

```ts
## Anlässe

- [${OCCASIONS_HUB.title}](${SITE_URL}${OCCASIONS_PATH}): Übersicht aller Anlass-Seiten
${OCCASIONS.map((occasion) => `- [${occasion.title}](${SITE_URL}${occasionPath(occasion)}): ${occasion.teaser}`).join("\n")}

```

- [ ] **Step 6: Gesamtprüfung**

Run: `npx tsc --noEmit; npx eslint src; npm test`
Expected: alles grün.

- [ ] **Step 7: Im Browser prüfen**

`curl -s http://localhost:3000/sitemap.xml | grep einladung` → zwei `<loc>`-Einträge. `curl -s http://localhost:3000/llms.txt` → Abschnitt „## Anlässe“ mit Übersicht und Kindergeburtstag.

---

### Task 8: Abschlussprüfung und To-do-Liste

**Files:**
- Modify: `docs/seo-todo.md`

- [ ] **Step 1: Produktions-Build**

Run: `npx next build`
Expected: Build erfolgreich; in der Routen-Übersicht `/einladung` und `/einladung/[anlass]` (mit `/einladung/kindergeburtstag`) als statisch (●/○) erzeugt.

- [ ] **Step 2: Strukturierte Daten prüfen**

```bash
curl -s http://localhost:3000/einladung/kindergeburtstag | grep -oE '<script type="application/ld\+json">[^<]*' | sed 's/<script type="application\/ld+json">//' | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);console.log(j["@graph"].map(x=>x["@type"]).join(", "))})'
```

Expected: `WebPage, BreadcrumbList, FAQPage`.

- [ ] **Step 3: Dev-Server stoppen** (falls selbst gestartet).

- [ ] **Step 4: `docs/seo-todo.md` aktualisieren**

Unter „Erledigt (im Code)“ ergänzen:

```markdown
- [x] Anlass-Seiten: Vorlage `/einladung/<slug>`, Übersicht `/einladung`, Abschnitt „Für jeden Anlass“ auf der Startseite, Sitemap, llms.txt, Schema (WebPage, BreadcrumbList, FAQPage) – Muster: Kindergeburtstag
```

und den Punkt unter „Offene Entscheidungen“ ersetzen durch:

```markdown
- [ ] Kindergeburtstag-Text gegenlesen (`src/lib/occasions.ts`), dann die übrigen Anlässe als Einträge ergänzen: Hochzeit, Firmenfeier, Grillparty/Gartenfest, Halloweenparty, Glühweinabend, Gruppenausflug, einfache Verabredungen
```
