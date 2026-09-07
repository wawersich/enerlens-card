#!/usr/bin/env node
/**
 * Measures hit targets and font sizes in a headless Chromium (REQ I-3, K-12).
 *
 * Copies the built card next to the harness, opens it at the reference widths
 * and prints the JSON the harness writes into #out. Needs `chromium` on PATH;
 * puppeteer is deliberately not a dependency - `--dump-dom` is enough.
 *
 *   node scripts/measure.mjs            # 344 and 304 px (360 / 320 px devices)
 *   node scripts/measure.mjs 500 344    # any widths
 *   LANG_CARD=en node scripts/measure.mjs 500   # English strings
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const lang = process.env.LANG_CARD ?? "de";
const widths = process.argv.slice(2).map(Number).filter(Boolean);
if (widths.length === 0) widths.push(344, 304);

const dir = mkdtempSync(
  join(
    process.env.CLAUDE_JOB_DIR ? `${process.env.CLAUDE_JOB_DIR}/tmp` : tmpdir(),
    "enerlens-measure-",
  ),
);
copyFileSync(join(root, "dist/enerlens-card.js"), join(dir, "enerlens-card.js"));
copyFileSync(join(here, "measure/harness.html"), join(dir, "harness.html"));

const chromium = process.env.CHROMIUM ?? "chromium";
const results = [];
for (const width of widths) {
  const url = `file://${dir}/harness.html?w=${width}&lang=${lang}`;
  const args = [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--hide-scrollbars",
    `--window-size=${width + 16},1400`,
    "--virtual-time-budget=3000",
    "--allow-file-access-from-files",
  ];
  const dom = execFileSync(chromium, [...args, "--dump-dom", url], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  const match = dom.match(/<pre id="out">([^<]*)<\/pre>/);
  if (!match || !match[1])
    throw new Error(`no measurement at ${width} px - harness did not finish`);
  const data = JSON.parse(match[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
  results.push(data);
  execFileSync(chromium, [...args, `--screenshot=${dir}/card-${width}.png`, url], {
    stdio: "ignore",
  });
}
writeFileSync(join(dir, "measurements.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
console.error(`Screenshots und JSON: ${dir}`);
