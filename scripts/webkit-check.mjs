/**
 * Checks the built card in WebKit - the engine of Safari on Mac, iPhone and
 * iPad, of GNOME Web and of the Home Assistant app on Apple devices - and, for
 * comparison, in Chromium.
 *
 * WebKit has caught the card out more than once, and nobody here browses with
 * it: the ring needed an explicit size, page zoom pushed the dots off their
 * lines (issue #7), and getScreenCTM() leaves out the scale of an element above
 * the card. This loads `scripts/webkit-check/page.html` at several page zooms,
 * in a plain, a scaled and a narrow setting with the card as most people have
 * it, and in two settings with extra values (with and without a battery,
 * issue #9), and measures what went wrong before:
 *
 *   - every dot lies on a drawn line (cross and fan), at three places each;
 *   - the consumer ring sits centred on the house node;
 *   - nodes, rows, ring and dots stay inside the card;
 *   - the lines are as wide as the card asked for (K-12), where unzoomed;
 *   - the label blocks stay 8 px clear of the card's edge, the other nodes'
 *     circles and each other, never reach under the mode chips, and the list
 *     beside the cross stays level with the house (Z-3, Z-8).
 *
 *   npm run build && npm run webkit-check
 *   npm run webkit-check -- --shots /tmp/wk     # also a picture per WebKit run
 *   npm run webkit-check -- --bundle /path/enerlens-card.js   # another build
 *
 * Needs WebKitGTK in the container, not persistent:
 *   apk add webkit2gtk-4.1 py3-gobject3 py3-cairo xvfb-run font-dejavu
 * and Chromium (`apk add chromium`). Exits non-zero when a check fails.
 */
import { execFile, execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..");
const page = pathToFileURL(resolve(here, "webkit-check/page.html")).href;
const runner = resolve(here, "webkit-check/webkit.py");

const option = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const bundle = resolve(option("--bundle") ?? resolve(repo, "dist/enerlens-card.js"));
const shots = option("--shots");

/** How far a dot or the ring may be off, in screen pixels. */
const TOLERANCE_PX = 1.5;
/** How far a line's width may be off what the card asked for, in screen pixels. */
const LINE_TOLERANCE_PX = 0.1;
const SCENES = ["plain", "scaled", "below", "extras", "nobatt"];
/* 100 % once; the zooms both set before loading (Safari remembers them per
 * site) and changed while the card runs (Cmd + / Cmd -). */
const WEBKIT_RUNS = [
  { zoom: 1, mode: "preset" },
  { zoom: 0.8, mode: "preset" },
  { zoom: 1.5, mode: "preset" },
  { zoom: 0.8, mode: "live" },
  { zoom: 1.5, mode: "live" },
];
/* Chromium has no page zoom from the command line; a device scale factor is
 * the closest, and Chromium must simply not change under it. */
const CHROMIUM_SCALES = [1, 2];

if (!existsSync(bundle)) {
  console.error(`${bundle} fehlt - erst \`npm run build\``);
  process.exit(1);
}
const has = (bin, args = ["--version"]) => {
  try {
    execFileSync(bin, args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};
const webkit =
  has("which", ["xvfb-run"]) &&
  has("python3", [
    "-c",
    "import gi; gi.require_version('WebKit2', '4.1'); from gi.repository import WebKit2",
  ]);
if (!webkit) {
  console.error(
    "WebKitGTK fehlt: apk add webkit2gtk-4.1 py3-gobject3 py3-cairo xvfb-run font-dejavu",
  );
  process.exit(1);
}
const chromium = ["chromium", "chromium-browser", "google-chrome"].find((bin) =>
  has("which", [bin]),
);
if (!chromium) console.warn("Kein Chromium gefunden (`apk add chromium`) - nur WebKit.");
if (shots) mkdirSync(shots, { recursive: true });

const url = (scene) =>
  `${page}?scene=${scene}&bundle=${encodeURIComponent(pathToFileURL(bundle).href)}`;

async function inWebkit(scene, { zoom, mode }) {
  const args = ["-a", "python3", runner, url(scene), String(zoom), mode];
  if (shots) args.push(resolve(shots, `${scene}-${mode}-${zoom}.png`));
  const { stdout } = await run("xvfb-run", args, { timeout: 60000 });
  return JSON.parse(stdout.trim().split("\n").pop());
}

async function inChromium(scene, scale) {
  const { stdout } = await run(
    chromium,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--allow-file-access-from-files",
      `--force-device-scale-factor=${scale}`,
      "--virtual-time-budget=8000",
      "--dump-dom",
      `${url(scene)}#auto`,
    ],
    { timeout: 60000, maxBuffer: 16 * 1024 * 1024 },
  );
  const text = /<pre id="out">([^<]*)<\/pre>/.exec(stdout)?.[1] ?? "";
  const json = text
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  return json ? JSON.parse(json) : { error: "keine Antwort" };
}

/** What is wrong with one measurement, in words; empty when all is well. */
function problems(m, lines) {
  if (m.error) return [m.error];
  const found = [];
  if (!m.cross.dots) found.push("keine Punkte im Kreuz");
  if (!m.fan.dots) found.push("keine Punkte am Fächer");
  if (m.cross.worst > TOLERANCE_PX) found.push(`Kreuz-Punkte ${m.cross.worst} px neben der Linie`);
  if (m.fan.worst > TOLERANCE_PX) found.push(`Fächer-Punkte ${m.fan.worst} px neben der Linie`);
  if (m.ring === null) found.push("kein Ring am Haus");
  else if (m.ring > TOLERANCE_PX) found.push(`Ring ${m.ring} px neben der Hausmitte`);
  if (m.outside.length) found.push(`außerhalb der Karte: ${[...new Set(m.outside)].join(", ")}`);
  if (m.labels?.length) found.push(`Beschriftungen: ${[...new Set(m.labels)].join(", ")}`);
  if (!lines) return found;
  if (m.lines?.error) found.push(m.lines.error);
  else if (m.lines && m.lines.off > LINE_TOLERANCE_PX)
    found.push(`Linien ${m.lines.off} px zu dick oder zu dünn`);
  return found;
}

const rows = [];
for (const scene of SCENES) {
  for (const setting of WEBKIT_RUNS) {
    const m = await inWebkit(scene, setting).catch((e) => ({ error: e.message }));
    rows.push({
      engine: "WebKit",
      scene,
      how: `${setting.zoom * 100} % ${setting.mode === "live" ? "danach" : "vorab"}`,
      m,
      // Line widths only where this run left the page unzoomed - not read off
      // the card, whose _pathZoom stays 1 in a WebKit without the issue #7 bug.
      lines: setting.zoom === 1,
    });
  }
  if (chromium) {
    for (const scale of CHROMIUM_SCALES) {
      const m = await inChromium(scene, scale).catch((e) => ({ error: e.message }));
      rows.push({ engine: "Chromium", scene, how: `Skalierung ${scale}`, m, lines: true });
    }
  }
}

let failed = 0;
const pad = (s, n) => String(s).padEnd(n);
console.log(
  `${pad("Engine", 9)}${pad("Szene", 8)}${pad("Zoom", 16)}${pad("Faktor", 8)}${pad("Kreuz", 11)}${pad("Fächer", 11)}${pad("Ring", 9)}${pad("Linien", 10)}Ergebnis`,
);
for (const { engine, scene, how, m, lines } of rows) {
  const found = problems(m, lines);
  if (found.length) failed++;
  const px = (v) => (v === undefined || v === null ? "-" : `${v} px`);
  console.log(
    `${pad(engine, 9)}${pad(scene, 8)}${pad(how, 16)}${pad(m.zoom === undefined ? "-" : Number(m.zoom).toFixed(2), 8)}${pad(px(m.cross?.worst), 11)}${pad(px(m.fan?.worst), 11)}${pad(px(m.ring), 9)}${pad(px(lines ? m.lines?.off : undefined), 10)}${found.length ? `FEHLER: ${found.join("; ")}` : "ok"}`,
  );
}
if (shots) console.log(`Bilder: ${shots}`);
console.log(
  failed ? `\n${failed} von ${rows.length} Läufen mit Fehlern.` : `\nAlle ${rows.length} Läufe ok.`,
);
process.exit(failed ? 1 : 0);
