// Converts every PNG in a theme graphics folder to WebP for upload to
// Cloudinary: <png-folder>/<file>.png -> Insektenparty_gfx/webp/<name>/<name>_<file>.webp
// Usage (from the repo root, so the repo's sharp is used):
//   node .claude/skills/building-event-themes/scripts/convert-to-webp.mjs <png-folder> <theme-name>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.join(process.cwd(), "package.json"));
const sharp = require("sharp");

const [srcDir, name] = process.argv.slice(2);
if (!srcDir || !name || !/^[a-z0-9]+$/.test(name)) {
  console.error("Usage: convert-to-webp.mjs <png-folder> <theme-name [a-z0-9]>");
  process.exit(1);
}

const outDir = path.join(path.dirname(path.resolve(srcDir)), "webp", name);
fs.mkdirSync(outDir, { recursive: true });

const pngs = fs.readdirSync(srcDir).filter((f) => f.toLowerCase().endsWith(".png"));
if (pngs.length === 0) {
  console.error(`No PNGs in ${srcDir}`);
  process.exit(1);
}

for (const file of pngs) {
  const base = path.basename(file, path.extname(file)).toLowerCase();
  const dst = path.join(outDir, `${name}_${base}.webp`);
  const before = fs.statSync(path.join(srcDir, file)).size;
  let image = sharp(path.join(srcDir, file));
  // Target = 2x the CSS display size, so high-DPI screens stay sharp
  // (Cloudinary's c_limit never upscales): logo is shown at 256px
  // (Header w-64), floating accents at 110px (Header ACCENT_SIZE).
  const target = base === "logo" ? 512 : base.startsWith("accent") ? 256 : null;
  if (target) {
    const { width, height } = await image.metadata();
    if (Math.max(width, height) < target) {
      console.warn(`WARNING ${file} is ${width}x${height} - needs ${target}px to stay sharp on high-DPI screens`);
    }
    image = image.resize({ width: target, height: target, fit: "inside", withoutEnlargement: true });
  }
  const info = await image
    .webp({ quality: 85, alphaQuality: 100, effort: 6 })
    .toFile(dst);
  console.log(`${file} -> ${dst}  ${info.width}x${info.height}  ${before}B -> ${info.size}B`);
}
