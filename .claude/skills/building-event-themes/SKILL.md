---
name: building-event-themes
description: Use when adding a new event theme (Thema/Theme / Design) to GASTZILLA (this repo) from a folder of PNG graphics plus a theme name and a short description - including its public design page (/designs/<slug>) in de/en/ru - e.g. "nimm die Bilder aus D:\projects\Insektenparty_gfx\<ordner> und bau ein Thema <name>", "neues Theme mit Farbschema", "Bilder in webp konvertieren und auf Cloudinary hochladen für ein Thema", or when a theme can't be saved ("Das Event konnte nicht gespeichert werden" after picking a new theme).
---

# Building event themes for GASTZILLA

## Inputs

1. **PNG folder** - e.g. `D:\projects\Insektenparty_gfx\schaum`
2. **Theme name** - becomes the theme key, Cloudinary folder and file prefix (e.g. `foam`). Lowercase, `[a-z0-9]` only - it is a CSS class suffix, a DB value and a public_id prefix.
3. **Short description** (optional) - a line from the owner about mood and intended occasions (e.g. „düster, für Halloween-Partys von Erwachsenen“). It steers the German name, the design-page texts and the occasions in step 6. Without it, derive both from the graphics and say so.

Ask only if 1 or 2 is missing. A theme with side or floating graphics (`plantsLeft`/`plantsRight`/`accentOne`/`accentTwo`) is **automatically premium** (`isPremiumTheme` in `theme-presets.ts`); only plain colour designs are free. The owner's test account gets every new design in step 5.4, so it can be tested right away.

## File-name mapping

Theme graphics map to the `assets` slots in `EventConfig` (`src/lib/event-config.ts`). Every slot except `logo` is optional - a theme without side graphics (like `schwarz`) just omits them.

| PNG in folder | public_id | `THEME_ASSETS` slot |
|---|---|---|
| `logo.png` | `<name>_logo` | `logo` (required) |
| `bg_l.png` | `<name>_bg_l` | `plantsLeft` |
| `bg_r.png` | `<name>_bg_r` | `plantsRight` |
| `accent_l.png` | `<name>_accent_l` | `accentOne` |
| `accent_r.png` | `<name>_accent_r` | `accentTwo` |

**Image sizes** - sources need 2x their CSS display size, because Cloudinary's `c_limit` never upscales and high-DPI screens otherwise get a blurry, pixelated image (happened with 128px accents shown at 110px):

| Slot | Shown at | Source needs |
|---|---|---|
| logo | 256px (`Header` `w-64`) | 512x512 |
| accents | 110px (`Header` `ACCENT_SIZE`) | 256x256 |
| side graphics | height `min(1024px,95vh)` | 500x1024 (current standard) |

The convert script downsizes larger logos/accents to these targets and prints a `WARNING` when a source is smaller - pass that on to the user and ask for a bigger export instead of uploading a blurry image.

If the folder uses other names, map by meaning (left/right side graphic, small floating accent, round logo) and say which file went where. No `logo.png` → stop and ask; the theme picker and header need it.

## Steps

### 1. Look at the images and build the palette from them
The theme colors must **come from the graphics** and put them **atmospherically into a scene** - the page should look like the world the graphics live in, not like a neutral UI with pictures pasted on. A generic "Halloween = purple + orange" or "light pastel so everything is visible" palette is the failure mode (it happened with Halloween Clay: bright lavender + saturated violet clashed with the dusty clay and looked flat).

1. Read each PNG (the Read tool shows images) and decide what scene they depict (night graveyard, bubble bath, garden...), where the light comes from and what time/mood it is.
2. Sample the real colors:
   ```bash
   node .claude/skills/building-event-themes/scripts/sample-colors.mjs "<png-folder>"
   ```
   Build every token from these values or close relatives (same hue family, same saturation level - dusty graphics get dusty UI colors, glossy ones get clear colors):
   - background gradient = the scene's environment (sky, water, air) in the graphics' own hue family
   - `--honey`/buttons = the strongest "object" color in the graphics (pumpkin, duck, flower)
   - `--petal` = a secondary object color (ghost green, beak orange)
   - `--ink`/`--muted` = a very light or very dark tint of the background hue, not pure white/black
3. Light vs dark follows the scene's mood, not a default. Then make sure the side graphics read against it: as silhouettes (background darker than the graphics' main colors, ~2:1 or more) or as objects in front of a lighter haze. Compare the sampled graphic colors against `--bg-top` (behind tree tops etc.) and `--bg-bottom` (behind the ground where the graphics stand).
4. Use the `.parallax-background` radial gradients as **light sources of the scene**: moon haze behind tree tops, warm glow near pumpkins/lanterns, sunlight, water shimmer - placed where the graphics are (side graphics sit bottom-left/bottom-right, `h-[min(1024px,95vh)]`).
5. If the logo is a disc with its own background (night sky, dark lacquer), sample that disc color and set `--bg-top` to it, and put **no** glow behind the logo (top center): then the logo's content seems to sit right in the page's sky. A glow there lightens the area around the disc and outlines it as a dark circle (happened with New Year). Also hold `--bg-top` over the whole logo height - `linear-gradient(180deg, var(--bg-top) 0, var(--bg-top) 300px, var(--bg-mid) 65%, var(--bg-bottom))` - otherwise the page darkens behind the disc's lower half and it shows as a lighter circle (happened with Pen & Paper). Exception: where the disc itself is lit at its edge (embers, sunrise), put a small glow of that color exactly there so that edge fades out too.

Light-scene example: white foam → aqua water background, duck yellow accent. Dark-scene example: dusty plum clay graveyard → plum/slate night darker than the trees, lilac moon haze top center, terracotta pumpkin glow bottom left/right, pumpkin buttons with dark text, sage ghost green as petal.

### 2. Convert to WebP
```bash
node .claude/skills/building-event-themes/scripts/convert-to-webp.mjs "<png-folder>" <name>
```
Writes `D:\projects\Insektenparty_gfx\webp\<name>\<name>_<file>.webp` (quality 85, lossless alpha), resizes logo to 512px and accents to 256px, and prints sizes plus a `WARNING` for sources below that (see "Image sizes"). Run it from the repo root - it uses the repo's `sharp`.

### 3. Upload to Cloudinary (cloud `d6sufegz`)
Use the Cloudinary Asset Management MCP tools (load via ToolSearch: `sign-upload`, `create-folder`, `search-assets`):

1. `search-assets` with `public_id:<name>_* OR asset_folder:<name>` - if anything exists, ask before overwriting (signed uploads overwrite by default).
2. `create-folder` `<name>`.
3. `sign-upload` one entry per file: `{ "public_id": "<name>_logo", "asset_folder": "<name>" }`. Keep public_ids at root (no `folder`) - existing theme URLs look like `.../image/upload/v123/logo_white.webp`, and `asset_folder` only sorts them in the Media Library.
4. POST each file with curl, sending **every** key of the returned `upload_params` as its own `-F` field plus `api_key`, `signature` and `file=@"<path>"`. A missing or changed field breaks the signature. Print `secure_url` from the response.
5. Use the returned versioned `secure_url`s as-is in the code.

### 4. Code
Files use CRLF line endings - use the Edit tool, not sed/node string replace with `\n`.

**`src/lib/theme-presets.ts`** - four places:
- `ThemeKey` union: add `| "<name>"`
- `THEME_LABELS`: the **German** name shown in the picker (German site language); object order = picker order. Add the English name to `THEME_LABELS_EN` (unless identical) and the Russian one to `THEME_LABELS_RU`.
- `THEME_CLASS_NAMES`: `<name>: "event-theme-<name>"`
- `THEME_ASSETS`: the Cloudinary URLs from step 3

**Design page**: every theme needs one, a plain colour design too - step 6. `src/lib/designs.test.ts` fails until it exists.

**`src/app/globals.css`** - add `.event-theme-<name>` and `.event-theme-<name> .parallax-background` next to the similar themes (light ones near `ballons`, dark ones near `schwarz`). Copy the structure of an existing block and set every token:
- `--bg-top/--bg-mid/--bg-bottom`, `--leaf/--leaf-dark` (accent text/borders), `--honey/--honey-dark` + `--on-honey` (text on honey, >= 4.5:1), `--petal`, `--ink`, `--muted`, `--surface/--surface-solid`, `--danger/--danger-dark`, `--ring`, `--shadow`
- `--button-primary(-text)` and `--button-secondary(-text)` **must be set explicitly** - the `:root` values are already resolved to natur's colors and do not follow `--leaf/--honey`. Primary and secondary use the same color.
- `min-height: 100dvh; background: var(--bg-mid); color: var(--ink);`
- Button text and body text need WCAG AA contrast (>= 4.5:1).
- Dark theme: also add `.event-theme-<name>` to the `color-scheme: dark` selector list near the end of the file.

### 5. Database - the step that is easy to miss
`public.events` has a check constraint **`events_theme_check`** listing every allowed theme key. It is **not in the repo's migrations** (created directly in Supabase), so a new key passes the TypeScript validation but saving fails with "Das Event konnte nicht gespeichert werden".

1. Read the current list (Supabase MCP `execute_sql`, project `znwlcmfrxtcfvesgbudg`):
   ```sql
   select pg_get_constraintdef(oid) from pg_constraint where conname = 'events_theme_check';
   ```
2. Write `supabase/migrations/<YYYY-MM-DD>-add-<name>-theme.sql`: drop and re-add the constraint with the **current** list plus `'<name>'` (don't copy a list from an older migration - another theme may have been added since).
3. This is the production DB: tell the user what the migration does and **ask before** `apply_migration`. Afterwards re-run the query from step 1 to confirm.

`user_entitlements` needs no schema change: its check allows any `theme:%` feature.

4. **Owner's test account gets every new design as bought** (owner's standing wish, 2026-11-20). Right after the constraint is confirmed, insert the entitlement (no need to ask again - it only touches this one account):
   ```sql
   insert into public.user_entitlements (user_id, feature, quantity, source, note)
   select '189a83d5-f3e5-42b4-9c22-3f4bb37c9137'::uuid, 'theme:<name>', 1, 'manual', 'Neues Design, Owner-Testkonto'
   where not exists (select 1 from public.user_entitlements
     where user_id = '189a83d5-f3e5-42b4-9c22-3f4bb37c9137'::uuid and feature = 'theme:<name>');
   ```
   No other account gets anything.

### 6. Design page (every theme - premium and plain colour designs)

Each design has a public page in its own theme (plain colour designs are marked free and offer „Kostenlos – in jedem Event“ instead of the 0,99 € option; the overview lists them first), in three languages: `/designs/<slug>`, `/en/designs/<slug>`, `/ru/dizajny/<slug>` (route `src/app/[locale]/[section]/[slug]`, view `src/components/DesignPages.tsx`). It shows the logo with the floating accents, the side graphics, a description, „Passt zu“ links to occasion pages and both purchase options; the occasion pages link back automatically („Passende Designs“ in the „Darum passt GASTZILLA zu …“ card). Load the `optimizing-seo-aeo-geo` skill first.

1. **Look at every graphic** (logo, both side graphics, both accents - the Read tool shows the PNGs from the input folder) and note motifs, colours and mood. Texts may only describe what is really there. Combine with the owner's short description (input 3).
2. **Names** in `src/lib/theme-presets.ts`: German in `THEME_LABELS` (picker order), English in `THEME_LABELS_EN` (unless identical), Russian in `THEME_LABELS_RU`.
3. **Slugs** in `DESIGN_SLUGS` (`src/lib/design-slugs.ts`): one per language from that language's name, `[a-z0-9-]`, Russian transliterated (e.g. `khellouin-kladbishche`). German and English share the `/designs` section - a German slug must never equal another theme's English slug. Never change a live slug without a redirect (`next.config.ts`).
4. **Occasions** in `DESIGN_OCCASIONS` (`src/lib/designs.ts`): 2-5 ids from `OCCASION_SLUGS` (`src/lib/occasion-slugs.ts`) that the graphics really suit (a gold/black balloon design is for adults, not a baby shower).
5. **Search terms**: `python -X utf8 .claude/skills/optimizing-seo-aeo-geo/scripts/suggest.py "<motiv> einladung"` (en: `suggest_en.py`, ru: `suggest_ru.py`). Little data → use the general pattern „<Anlass>-Einladung“ / "<occasion> invitation design".
6. **Texts** - one entry each in `src/lib/designs-de.ts`, `designs-en.ts` (British English, written for English searches, not translated word for word), `designs-ru.ts` (written for Russian searches, almost only Cyrillic):
   - `metaTitle`: ends with „– GASTZILLA“, ≤ 60 characters, e.g. „Halloween-Einladung im Friedhof-Design – GASTZILLA“
   - `metaDescription`: 70-160 characters, motifs + occasions; may end with „Gäste sagen per Link zu.“
   - `title` (H1): name + search term, e.g. „Halloween-Friedhof – düsteres Design für deine Halloween-Einladung“
   - `teaser`: one sentence (overview card, llms.txt)
   - `description`: 1-2 paragraphs - first sentence what the graphics show, then which occasions it suits. Only features from `project-map.md`.
   - `updated`: today (YYYY-MM-DD); it feeds sitemap and schema, it is **not** shown on the page.
   - Every title/description/teaser must be unique across all designs of the language.
7. **Nothing else to wire**: overview `/designs`, sitemap with hreflang, llms.txt, JSON-LD, OG image, footer link, the unlock dialog's „Vorschau“ link and the occasion back-links all read these lists.
8. **Check**: `npx vitest run src/lib/designs.test.ts src/lib/theme-presets.test.ts`, then on the dev server open `/designs/<de-slug>`, `/en/designs/<en-slug>`, `/ru/dizajny/<ru-slug>` (375 px too): theme, graphics, readable text, one H1, language switcher lands on the same design; and one occasion page from step 6.4 shows the design under „Passende Designs“.

### 7. Verify
- `npx tsc --noEmit` and `npx vitest run src/lib`
- curl each URL through the loader transform (`.../image/upload/f_auto,q_auto,c_limit,w_256/<name>_logo.webp`) - expect 200
- Contrast: compute ratios for ink/muted/leaf on `--bg-mid` and `--surface-solid`, button text on button, `--on-honey` on honey (>= 4.5:1), and the sampled graphic colors against `--bg-top`/`--bg-bottom` (step 1.3). A small node one-liner with the WCAG luminance formula is enough.
- **Visual check of the scene (do it - the palette is judged by how it looks with the graphics):** if the user's dev server already runs on :3000 use it read-only (`navigate`), otherwise `preview_start` `insektenparty-dev`. Open `/event/milans7BD` (expired event, no login needed), then via `javascript_tool` (debug only, no DB write) replace the `event-theme*` class with `event-theme-<name>`, set `position:relative; isolation:isolate; overflow:hidden` on it and prepend: a `div.parallax-background` (`position:absolute; inset:0; z-index:-20`), the two side graphics (`position:absolute; bottom:0; left:0`/`right:0`; `height:min(1024px,95vh); z-index:-10`) and the two accents. Wait before the screenshot - buttons have a CSS `transition`, and for a brand-new theme the dev server's hot reload can need several seconds to deliver the new CSS block, so an early screenshot still shows natur's green button. Poll until `getComputedStyle(root).getPropertyValue("--button-primary")` is the new value, then wait ~1s more. Screenshot and judge: do the graphics sit *in* the scene, does the light make sense, are text and buttons readable? Iterate on the CSS until yes. Stop a server you started yourself. (The expired page shows the black GASTZILLA banner - on dark themes that is a known general issue, not the theme's.)
- Full check (theme picker + save) needs a login - say so instead of claiming it works.

## Replacing images of an existing theme
When the user re-saves some PNGs ("bg_l neu abgespeichert, aktualisiere es"):
1. Convert only those files (copy them to a scratch folder and run the script there, then copy the WebPs into `Insektenparty_gfx\webp\<name>\`).
2. `sign-upload` with the same public_id + `asset_folder`, plus `overwrite: true` and `invalidate: true` - the user asking for the update is the go-ahead to overwrite.
3. The response has a **new version** (`v...`) in `secure_url`. Replace the old URL in `THEME_ASSETS`, otherwise browsers and the CDN keep serving the old image.

## Don'ts
- No `git commit`/`push` - the user commits themselves.
- Don't write theme changes into existing events' rows to test.
- Don't skip step 5 - it is the reason the first theme of this kind failed.
- Never remove a theme without redirecting its design pages (all three languages) to the designs overview (`next.config.ts`).
