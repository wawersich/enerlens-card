/**
 * Writes docs/images/hero.svg: the card, rendered and exported as one animated
 * SVG (REQ AL-5).
 *
 * Not a drawing and not a screen recording. `scripts/hero/export.html` renders
 * the built card with invented values, then walks the result: circles and text
 * from measured boxes and computed styles, icons as their real mdi paths, and
 * every dot as SMIL along the very path the card animates it on. Each dot keeps
 * its own period, which is what no GIF can do - there, all speeds have to be
 * rounded into one shared loop.
 *
 *   npm run build && npm run hero
 *
 * Needs Chromium (`apk add chromium` on the HA box, not persistent).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..");
const bundle = resolve(repo, "dist/enerlens-card.js");
const page = resolve(here, "hero/export.html");
/** One picture per language and colour scheme; the README picks with <picture>. */
const VARIANTS = [
  { lang: "de", dark: false },
  { lang: "de", dark: true },
  { lang: "en", dark: false },
  { lang: "en", dark: true },
];

if (!existsSync(bundle)) {
  console.error("dist/enerlens-card.js fehlt - erst `npm run build`");
  process.exit(1);
}

const browser = ["chromium", "chromium-browser", "google-chrome"].find((bin) => {
  try {
    execFileSync("which", [bin], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
});
if (!browser) {
  console.error("Kein Chromium gefunden (`apk add chromium`)");
  process.exit(1);
}

function exportOne({ lang, dark }) {
  const query = `?lang=${lang}${dark ? "&dark" : ""}`;
  const dom = execFileSync(
    browser,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      // ES modules over file:// are blocked without this, and the page stays empty.
      "--allow-file-access-from-files",
      "--virtual-time-budget=8000",
      "--dump-dom",
      `file://${page}${query}`,
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] },
  );

  const match = /<pre id="out"[^>]*>([\s\S]*?)<\/pre>/.exec(dom);
  if (!match) {
    console.error(`${query}: die Seite hat kein SVG geliefert`);
    process.exit(1);
  }
  const svg = match[1]
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

  const dots = (svg.match(/<animateMotion/g) ?? []).length;
  if (dots === 0) {
    // How the earlier mistake would have slipped through: the picture looked
    // right while every dot ran at one speed, because a pending playback rate
    // reads back as 1 until the animation is ready.
    console.error(`${query}: kein einziger bewegter Punkt - so wäre das Bild sinnlos`);
    process.exit(1);
  }

  const name = `card-${lang}-${dark ? "dark" : "light"}.svg`;
  const target = resolve(repo, "docs/images", name);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, svg);
  const periods = new Set(svg.match(/dur="([\d.]+)s"/g) ?? []).size;
  console.log(
    `  docs/images/${name}: ${(svg.length / 1024).toFixed(1)} kB, ${dots} Punkte in ${periods} Tempi`,
  );
}

for (const variant of VARIANTS) exportOne(variant);
