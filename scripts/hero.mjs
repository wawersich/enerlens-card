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
 *   npm run build && npm run hero              # mit Umsortieren
 *   npm run build && npm run hero -- --flow-only   # nur der Fluss
 *   npm run build && npm run hero -- --outage      # Netzausfall, Inselbetrieb
 *   npm run build && npm run hero -- --below       # Liste unter dem Kreuz
 *   npm run build && npm run hero -- --fade        # Ring blendet Farben über
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
/* Three scenes show the ring shifting and overtaking while the list re-sorts,
 * one shows only the flow. The quiet
 * variant is kept because it suits a place where the picture is a side note;
 * both come from the same page, so neither can drift away from the card. */
const flowOnly = process.argv.includes("--flow-only");
/* The grid gone and the house off-grid: banner, X and dashed node (REQ NS-4, NS-5). */
const outage = process.argv.includes("--outage");
/* The list under the cross, in a narrow card (list.always_below). */
const below = process.argv.includes("--below");
/* The ring keeping its places and blending colours (ring.animation: fade). */
const fade = process.argv.includes("--fade");

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
  const query = `?lang=${lang}${dark ? "&dark" : ""}${flowOnly ? "&scenes=1" : ""}${outage ? "&outage" : ""}${below ? "&below" : ""}${fade ? "&fade" : ""}`;
  const dom = execFileSync(
    browser,
    [
      "--headless",
      "--disable-gpu",
      "--no-sandbox",
      // ES modules over file:// are blocked without this, and the page stays empty.
      "--allow-file-access-from-files",
      // The page waits out a beat of the card before each further snapshot,
      // so the clock needs room - too small a budget dumps a blank page.
      "--virtual-time-budget=45000",
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

  const name = `card-${lang}-${dark ? "dark" : "light"}${flowOnly ? "-flow" : ""}${outage ? "-outage" : ""}${below ? "-below" : ""}${fade ? "-fade" : ""}.svg`;
  const target = resolve(repo, "docs/images", name);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, svg);
  const periods = new Set(svg.match(/dur="([\d.]+)s"/g) ?? []).size;
  const glides = (svg.match(/<animateTransform/g) ?? []).length;
  console.log(
    `  docs/images/${name}: ${(svg.length / 1024).toFixed(1)} kB, ${dots} Punkte in ${periods} Tempi` +
      (glides ? `, ${glides} gleitende Zeilen` : ""),
  );
}

for (const variant of VARIANTS) exportOne(variant);
