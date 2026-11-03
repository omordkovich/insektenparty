---
name: building-event-themes
description: Use when adding a new event theme (Thema/Theme) to GASTZILLA (this repo) from a folder of PNG graphics plus a theme name - e.g. "nimm die Bilder aus D:\projects\Insektenparty_gfx\<ordner> und bau ein Thema <name>", "neues Theme mit Farbschema", "Bilder in webp konvertieren und auf Cloudinary hochladen für ein Thema", or when a theme can't be saved ("Das Event konnte nicht gespeichert werden" after picking a new theme).
---

# Building event themes for GASTZILLA

## Inputs

1. **PNG folder** - e.g. `D:\projects\Insektenparty_gfx\schaum`
2. **Theme name** - becomes the theme key, Cloudinary folder and file prefix (e.g. `foam`). Lowercase, `[a-z0-9]` only - it is a CSS class suffix, a DB value and a public_id prefix.

Ask only if one of these is missing. Default: the theme is **free** (not in `PREMIUM_THEMES`) so the user can test it right away; make it premium only when asked.

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
- `THEME_LABELS`: label shown in the picker; object order = picker order. Use the name the user gave unless they ask for a German one.
- `THEME_CLASS_NAMES`: `<name>: "event-theme-<name>"`
- `THEME_ASSETS`: the Cloudinary URLs from step 3
- `PREMIUM_THEMES`: only if the theme should be paid

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

`user_entitlements` needs nothing: its check allows any `theme:%` feature.

### 6. Verify
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
