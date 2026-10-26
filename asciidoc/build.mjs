/**
 * Builds the documentation site (GitHub Pages) from asciidoc/content/<lang>/
 * into docs/, next to docs/images, which it never touches.
 *
 *   npm run build && npm run site                 # build into docs/
 *   npm run site -- --view /path/to/www/folder    # and copy there to look at it
 *
 * The live cards on the pages run the card from dist/, so build it first.
 * Each page names itself in its header: `:page-key:` pairs the German and the
 * English version (the language switch links one to the other), `:nav-order:`
 * places it in the side navigation. Search is Pagefind, run over the built
 * HTML; it reads <html lang> and keeps one index per language.
 */
import asciidoctorFactory from "@asciidoctor/core";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { registerCompactLists } from "./converter.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "..");
const out = resolve(repo, "docs");
const CARD = resolve(repo, "dist/enerlens-card.js");
/* The README pictures, shared with the site: they already live in
 * docs/images, the build only reads them. */
const IMAGES = resolve(out, "images");
const viewAt = process.argv.indexOf("--view");
const VIEW = viewAt >= 0 ? process.argv[viewAt + 1] : undefined;
if (viewAt >= 0 && !VIEW) {
  console.error("--view braucht einen Zielordner");
  process.exit(1);
}
if (!existsSync(CARD)) {
  console.error("dist/enerlens-card.js fehlt - erst `npm run build`");
  process.exit(1);
}
/* What the build writes - and all it may delete. Anything else in the output
 * folder (docs/images in the repository) is never touched. */
const OWN = ["de", "en", "assets", "demo", "pagefind", "index.html", ".nojekyll"];
const LANGS = ["de", "en"];
const UI = {
  de: { search: "Suchen", theme: "Hell/Dunkel umschalten", other: "English", menu: "Inhalt" },
  en: { search: "Search", theme: "Toggle light/dark", other: "Deutsch", menu: "Contents" },
};
const FOOT = {
  de: 'EnerLens Card · <a href="https://github.com/wawersich/enerlens-card">GitHub</a> · MIT-Lizenz',
  en: 'EnerLens Card · <a href="https://github.com/wawersich/enerlens-card">GitHub</a> · MIT licence',
};

/** Admonition labels in the page's language; the built-in ones are English. */
const CAPTIONS = {
  de: { "note-caption": "Hinweis", "tip-caption": "Tipp", "important-caption": "Wichtig",
    "warning-caption": "Achtung", "caution-caption": "Vorsicht", "table-caption!": "", "figure-caption!": "" },
  en: { "table-caption!": "", "figure-caption!": "" },
};

const asciidoctor = asciidoctorFactory();
registerCompactLists(asciidoctor);

/** Every page of one language, read and converted, in navigation order. */
function pages(lang) {
  const dir = join(here, "content", lang);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".adoc"))
    .map((f) => {
      const doc = asciidoctor.load(readFileSync(join(dir, f), "utf8"), {
        safe: "safe",
        attributes: { "sectanchors": "", "idprefix": "", "idseparator": "-", "imagesdir": "../images", ...CAPTIONS[lang] },
      });
      const key = doc.getAttribute("page-key");
      return {
        key,
        file: key === "start" ? "index.html" : `${key}.html`,
        title: doc.getDocumentTitle(),
        description: doc.getAttribute("description") ?? "",
        order: Number(doc.getAttribute("nav-order") ?? 99),
        body: doc.convert(),
      };
    })
    .sort((a, b) => a.order - b.order);
}

const ICON_THEME =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9c0-.5 0-.9-.1-1.4A5.5 5.5 0 0 1 12.4 3.1 9 9 0 0 0 12 3Z"/></svg>';

/* The logo, inlined so it follows the page's own light/dark switch: without
 * the file's <style> (which follows only the system) it draws in currentColor. */
const LOGO = readFileSync(join(here, "assets", "brand", "logo-lupe.svg"), "utf8")
  .replace(/<style>[\s\S]*?<\/style>\s*/, "")
  .replace(/ width="\d+" height="\d+"/, ' aria-hidden="true"')
  .trim();

function layout(lang, page, all, others) {
  const ui = UI[lang];
  const other = LANGS.find((l) => l !== lang);
  const twin = others.find((p) => p.key === page.key) ?? others[0];
  const nav = all
    .map((p) => `<li${p.key === page.key ? ' class="current"' : ""}><a href="${p.file}">${p.title}</a></li>`)
    .join("\n");
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title} – EnerLens Card</title>
<meta name="description" content="${page.description}">
<script>
  // Before the first paint, so a dark page never flashes light.
  try { const t = localStorage.getItem("theme"); if (t) document.documentElement.dataset.theme = t; } catch {}
</script>
<link rel="icon" href="../assets/brand/favicon-lupe.svg" type="image/svg+xml">
<link rel="icon" href="../assets/brand/favicon-lupe-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="../assets/brand/apple-touch-icon.png">
<link rel="stylesheet" href="../assets/style.css">
<link rel="stylesheet" href="../pagefind/pagefind-ui.css">
</head>
<body>
<header class="top">
  <a class="brand" href="index.html">${LOGO}Ener<span>Lens</span></a>
  <div id="search" class="search" data-placeholder="${ui.search}"></div>
  <a class="lang" href="../${other}/${twin.file}" hreflang="${other}">${ui.other}</a>
  <button class="theme" type="button" title="${ui.theme}" aria-label="${ui.theme}">${ICON_THEME}</button>
</header>
<div class="frame">
  <nav class="side" aria-label="${ui.menu}">
  <button class="menu" type="button" aria-expanded="false">${ui.menu}: <b>${page.title}</b></button>
  <ul>
${nav}
  </ul></nav>
  <main data-pagefind-body>
    <h1>${page.title}</h1>
${page.body}
  </main>
</div>
<footer class="foot">${FOOT[lang]}</footer>
<script src="../pagefind/pagefind-ui.js"></script>
<script type="module" src="../assets/site.js"></script>
</body>
</html>
`;
}

mkdirSync(out, { recursive: true });
for (const name of OWN) rmSync(join(out, name), { recursive: true, force: true });
const byLang = Object.fromEntries(LANGS.map((l) => [l, pages(l)]));
for (const lang of LANGS) {
  const other = byLang[LANGS.find((l) => l !== lang)];
  mkdirSync(join(out, lang), { recursive: true });
  for (const page of byLang[lang]) {
    writeFileSync(join(out, lang, page.file), layout(lang, page, byLang[lang], other));
  }
}

// The root picks the reader's language, English otherwise. The links name
// index.html: Home Assistant's /local answers a bare folder with 403.
writeFileSync(
  join(out, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>EnerLens Card</title>
<link rel="icon" href="assets/brand/favicon-lupe.svg" type="image/svg+xml">
<script>location.replace((navigator.language || "en").startsWith("de") ? "de/index.html" : "en/index.html");</script>
<a href="en/index.html">English</a> · <a href="de/index.html">Deutsch</a>`,
);
cpSync(join(here, "assets"), join(out, "assets"), { recursive: true, filter: (f) => !/\.bak\./.test(f) });
cpSync(join(here, "demo"), join(out, "demo"), { recursive: true });
cpSync(CARD, join(out, "demo", "enerlens-card.js"));
// The demo's icons, served from here: every mdi name the demo files or the
// card spell out, and the battery levels the card composes from the charge.
{
  const mdi = await import("@mdi/js");
  const demo = join(here, "demo");
  const text = [...readdirSync(demo).filter((f) => f.endsWith(".js")).map((f) => join(demo, f)), CARD]
    .map((f) => readFileSync(f, "utf8"))
    .join("\n");
  const names = new Set([...text.matchAll(/mdi:([a-z0-9-]+)/g)].map((m) => m[1]).filter((n) => !n.endsWith("-")));
  const key = (n) => "mdi" + n.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("");
  // The one name the card composes rather than spells out: battery-10 to
  // battery-90 by the charge level in tens (render/cross.ts).
  for (let n = 10; n <= 90; n += 10) names.add(`battery-${n}`);
  const icons = {};
  for (const n of names) if (mdi[key(n)]) icons[n] = mdi[key(n)];
  writeFileSync(join(out, "demo", "icons.json"), JSON.stringify(icons));
  const missing = [...names].filter((n) => !icons[n]);
  console.log(`Symbole: ${Object.keys(icons).length}` + (missing.length ? `, nicht gefunden: ${missing.join(", ")}` : ""));
}
// A version in every address the pages load, from the content: a browser
// keeps these files for weeks (Home Assistant's /local for 31 days), and an
// old card would draw a new arrangement as the cross. Inside out, so a change
// to the card renews every address that leads to it.
{
  const version = (file) => createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 8);
  const stamp = (file, pairs) => {
    let text = readFileSync(file, "utf8");
    for (const [from, to] of pairs) {
      if (!text.includes(from)) throw new Error(`${file}: ${from} nicht gefunden`);
      text = text.replaceAll(from, to);
    }
    writeFileSync(file, text);
  };
  const demo = join(out, "demo");
  stamp(join(demo, "demo.js"), [
    ['"./enerlens-card.js"', `"./enerlens-card.js?v=${version(join(demo, "enerlens-card.js"))}"`],
    ['"./shared.js"', `"./shared.js?v=${version(join(demo, "shared.js"))}"`],
    ['"./icons.json"', `"./icons.json?v=${version(join(demo, "icons.json"))}"`],
  ]);
  stamp(join(out, "assets", "site.js"), [
    ['"../demo/demo.js"', `"../demo/demo.js?v=${version(join(demo, "demo.js"))}"`],
  ]);
  const site = version(join(out, "assets", "site.js"));
  const css = version(join(out, "assets", "style.css"));
  for (const lang of LANGS) {
    for (const page of readdirSync(join(out, lang)).filter((f) => f.endsWith(".html"))) {
      stamp(join(out, lang, page), [
        ['"../assets/site.js"', `"../assets/site.js?v=${site}"`],
        ['"../assets/style.css"', `"../assets/style.css?v=${css}"`],
      ]);
    }
  }
}
// GitHub Pages would otherwise run the folder through Jekyll.
writeFileSync(join(out, ".nojekyll"), "");

execFileSync(join(repo, "node_modules", ".bin", "pagefind"), ["--site", out], { stdio: "inherit" });

if (VIEW) {
  rmSync(VIEW, { recursive: true, force: true });
  cpSync(out, VIEW, { recursive: true });
  console.log(`\nKopiert nach ${VIEW}`);
}
