---
name: optimizing-seo-aeo-geo
description: Use when working on GASTZILLA (this repo) pages, texts or metadata that search engines or AI assistants see - adding or changing an occasion landing page (/einladung), FAQ, titles, meta descriptions, structured data, sitemap, llms.txt, robots, OG images, occasion icons, new public pages like /preise, or any request mentioning SEO, AEO, GEO, Google, ranking, "von KI gefunden/empfohlen werden".
---

# SEO / AEO / GEO for GASTZILLA

## Overview
Every public text must (1) match a real search intent, (2) answer it directly, (3) only claim what the app really does. Technical plumbing (sitemap, llms.txt, JSON-LD, hub, chips) is data-driven from `src/lib/occasions.ts` - content quality is where work goes wrong.

Where things live and the verified feature list: `project-map.md` (read it before writing copy).

## Workflow for new or changed public content

1. **Intent check** - Which searches should this page win? Does an existing occasion already target them? Overlap → extend the existing page instead (avoid cannibalization). Distinct intent (other audience, season, moment) → own page.
2. **Research real questions** - never invent FAQ questions:
   `python -X utf8 .claude/skills/optimizing-seo-aeo-geo/scripts/suggest.py "schützenfest" "schützenball einladung"`
   Pick questions about planning/inviting that GASTZILLA can answer. Skip law, tax, fixed dates, celebrities. Use the searchers' phrasing ("Wie früh lädt man … ein?"). Little data (only place names) → keep sensible questions, note it in `docs/seo-todo.md`.
3. **Write answer-first copy (AEO/GEO)** - first sentence of every answer answers the question; then one sentence linking to the GASTZILLA feature. Concrete nouns (Schultüte, Wiesn-Tisch), no fluff. Hedge rules of thumb ("üblich", "meist", "Faustregel") - no invented statistics.
4. **Truth check** - every feature claim must be in the verified list in `project-map.md`. Not available (tickets, payment, reservations, seat plans, recurring events, guest reminders, occasion-specific designs) → say so honestly in an FAQ instead of hinting.
5. **Tone** - "du" everywhere; formal "Sie" + no emoji + no party wording for mourning (Trauerfeier) and similar sensitive occasions.
6. **Icon** (occasions) - monoline style, see `project-map.md` → Icons. Add the Cloudinary version to `src/lib/occasion-icons.ts`.
7. **Audit + verify**:
   `npx tsx .claude/skills/optimizing-seo-aeo-geo/scripts/audit-occasions.mts` (must print OK)
   then `npx tsc --noEmit`, `npx eslint src`, `npm test`; load the page on the dev server (title, canonical, one H1, JSON-LD types, mobile 375 px). Retry once if a brand-new `/einladung/<slug>` 404s on the dev server (static params cache).
8. **Bookkeeping** - set `updated` (occasion) or the date constant in `src/app/sitemap.ts`; update the occasion list / open points in `docs/seo-todo.md`.

## Quick reference

| Rule | Value |
|---|---|
| meta description | ≤ 160 chars, unique |
| metaTitle | ends with `– GASTZILLA`, ≈ ≤ 60 chars |
| H1 | exactly one, contains the main search term |
| benefits / FAQ per occasion | 3–4 each, titles and questions unique across ALL occasions |
| event pages `/event/*` | always `noindex`, never in sitemap, never disallowed in robots.txt |
| AI crawlers | never block (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) |
| new public page | `pageMetadata()`, sitemap entry + date, llms.txt link, JSON-LD, footer/hub link |

## Common mistakes
- FAQ written from imagination → generic questions nobody searches; research first.
- Copying a sibling occasion's FAQ/benefit wording → duplicate content; audit catches it.
- "Mit GASTZILLA kannst du Tische reservieren/Tickets verkaufen" → false claim; GASTZILLA only collects Zusagen.
- Promising prices or dates for paid features (Stripe paused) → only "bald".
- Changing a slug of a live page without redirect (`next.config.ts` / `vercel.json`).
