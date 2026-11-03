// Prints the dominant colors of every PNG in a theme graphics folder, so the
// theme palette can be built from the graphics instead of guessed.
// Usage (from the repo root, so the repo's sharp is used):
//   node .claude/skills/building-event-themes/scripts/sample-colors.mjs <png-folder>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.join(process.cwd(), "package.json"));
const sharp = require("sharp");

const [srcDir] = process.argv.slice(2);
if (!srcDir) {
  console.error("Usage: sample-colors.mjs <png-folder>");
  process.exit(1);
}

const hex = (v) => Math.min(255, v).toString(16).padStart(2, "0");

for (const file of fs.readdirSync(srcDir).filter((f) => f.toLowerCase().endsWith(".png"))) {
  const { data } = await sharp(path.join(srcDir, file))
    .resize(64, 64, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Bucket opaque pixels into coarse color bins (steps of 24) and count them;
  // transparent pixels are the page background, not part of the graphic.
  const bins = {};
  let opaque = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    opaque++;
    const key = "#" + [0, 1, 2].map((j) => hex(Math.round(data[i + j] / 24) * 24)).join("");
    bins[key] = (bins[key] || 0) + 1;
  }
  const top = Object.entries(bins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([color, n]) => `${color} ${Math.round((n / opaque) * 100)}%`);
  console.log(`${file}: ${top.join(", ")}`);
}
