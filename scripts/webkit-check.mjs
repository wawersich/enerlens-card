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
 *     beside the cross stays level with the house (Z-3, Z-8);
 *   - every line reaches its circle, and with the card made transparent
 *     (card-mod, issue #8) no line or dot shows inside one, read off a
 *     picture of each run (K-16).
 *
 *   npm run build && npm run webkit-check
 *   npm run webkit-check -- --shots /tmp/wk     # also a picture per WebKit run
 *   npm run webkit-check -- --bundle /path/enerlens-card.js   # another build
 *
 * Needs WebKitGTK in the container, not persistent:
 *   apk add webkit2gtk-4.1 py3-gobject3 py3-cairo xvfb-run font-dejavu
 * and Chromium and Firefox (`apk add chromium firefox`). Exits non-zero when
 * a check fails.
 */
import { execFile, execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { readPng } from "./webkit-check/png.mjs";

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
const SCENES = ["plain", "scaled", "below", "extras", "nobatt", "clear", "clearring", "clearlate"];
/** How far a pixel may stray from the page's white and still count as white. */
const CLEAR_TOLERANCE = 24;
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
const firefox = has("which", ["firefox"]) ? "firefox" : undefined;
// All three or none: a release must not pass for want of a browser (18.10.2026).
if (!chromium || !firefox) {
  console.error(
    `${[!chromium && "Chromium", !firefox && "Firefox"].filter(Boolean).join(" und ")} fehlt: apk add chromium firefox`,
  );
  process.exit(1);
}
if (shots) mkdirSync(shots, { recursive: true });
/* Every run is also judged by its picture, so it always takes one. */
const pictures = shots ?? mkdtempSync(resolve(tmpdir(), "webkit-check-"));
if (!shots) process.on("exit", () => rmSync(pictures, { recursive: true, force: true }));

const url = (scene) =>
  `${page}?scene=${scene}&bundle=${encodeURIComponent(pathToFileURL(bundle).href)}`;

async function inWebkit(scene, { zoom, mode }) {
  const args = ["-a", "python3", runner, url(scene), String(zoom), mode];
  const picture = resolve(pictures, `${scene}-${mode}-${zoom}.png`);
  args.push(picture);
  const { stdout } = await run("xvfb-run", args, { timeout: 60000 });
  const m = JSON.parse(stdout.trim().split("\n").pop());
  if (!m.error) m.circles = judge(scene, m.rims, picture);
  return m;
}

/**
 * Chromium, driven over the DevTools protocol in real time: one load,
 * measured and pictured. Not --dump-dom with a virtual time budget, as until
 * 18.10.2026: virtual time runs timers but no frames, so a CSS transition
 * never ends there - and the card learns of a fill made see-through late
 * from the end of one (K-16, scene clearlate).
 */
async function inChromium(scene, scale) {
  const profile = mkdtempSync(resolve(tmpdir(), "webkit-check-cr-"));
  const browser = spawn(
    chromium,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--allow-file-access-from-files",
      `--force-device-scale-factor=${scale}`,
      // The same window the circles are measured in and pictured at.
      "--window-size=1000,1100",
      "--hide-scrollbars",
      `--user-data-dir=${profile}`,
      "--remote-debugging-port=0",
      // Blank first: the viewport is set before the page loads (below).
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  const exited = new Promise((r) => browser.once("exit", r));
  const failed = new Promise((_r, reject) =>
    browser.once("error", (e) => reject(new Error(`Chromium: ${e.message}`))),
  );
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const within = (promise, ms, what) =>
    Promise.race([
      promise,
      failed,
      wait(ms).then(() => Promise.reject(new Error(`Chromium: ${what}`))),
    ]);
  let socket;
  try {
    // Port 0: Chromium picks a free one and names it on stderr.
    const port = await within(
      new Promise((resolvePort, reject) => {
        let text = "";
        const timer = setTimeout(() => reject(new Error("Chromium: kein DevTools-Port")), 20000);
        browser.stderr.on("data", (chunk) => {
          text += chunk;
          const found = /DevTools listening on ws:\/\/[^:]+:(\d+)\//.exec(text);
          if (found) {
            clearTimeout(timer);
            resolvePort(Number(found[1]));
          }
        });
      }),
      25000,
      "kein DevTools-Port",
    );
    let target;
    for (let i = 0; i < 50 && !target; i++) {
      const list = await fetch(`http://127.0.0.1:${port}/json`)
        .then((r) => r.json())
        .catch(() => []);
      target = list.find((t) => t.type === "page");
      if (!target) await wait(200);
    }
    if (!target) throw new Error("Chromium: keine Seite");
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r, reject) => {
      socket.onopen = r;
      socket.onerror = () => reject(new Error("Chromium: DevTools nicht erreichbar"));
    });
    let next = 0;
    const pending = new Map();
    socket.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      pending.get(msg.id)?.(msg);
      pending.delete(msg.id);
    };
    let closed;
    socket.onclose = () => {
      closed = new Error("Chromium: DevTools-Verbindung weg");
    };
    const send = (method, params = {}) => {
      if (closed) return Promise.reject(closed);
      const id = ++next;
      const answer = new Promise((r) => pending.set(id, r));
      socket.send(JSON.stringify({ id, method, params }));
      return within(answer, 15000, `keine Antwort auf ${method}`);
    };
    // The whole window is the viewport, as the circles are judged against a
    // picture of it - headless=new would otherwise keep part of it for itself.
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1000,
      height: 1100,
      deviceScaleFactor: scale,
      mobile: false,
    });
    await send("Page.navigate", { url: `${url(scene)}#auto` });
    // The page writes its answer 2.5 s after load (#auto).
    let json = "";
    for (let i = 0; i < 60 && !json; i++) {
      await wait(250);
      const answer = await send("Runtime.evaluate", {
        expression: "document.getElementById('out')?.textContent ?? ''",
        returnByValue: true,
      });
      json = answer.result?.result?.value ?? "";
    }
    const m = json ? JSON.parse(json) : { error: "keine Antwort" };
    if (!m.error) {
      const picture = resolve(pictures, `${scene}-chromium-${scale}.png`);
      const shot = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(picture, Buffer.from(shot.result.data, "base64"));
      m.circles = judge(scene, m.rims, picture);
    }
    return m;
  } finally {
    socket?.close();
    browser.kill("SIGKILL");
    await Promise.race([exited, wait(5000)]);
    // Helper processes may still be writing a moment after the kill.
    rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
}

/**
 * Firefox, driven over WebDriver BiDi: one load, measured and pictured, at a
 * device scale of 1. Its own profile, so local files may load the bundle from
 * another folder; thrown away afterwards.
 */
async function inFirefox(scene) {
  const profile = mkdtempSync(resolve(tmpdir(), "webkit-check-ff-"));
  writeFileSync(
    resolve(profile, "user.js"),
    'user_pref("security.fileuri.strict_origin_policy", false);\n',
  );
  // Port 0: Firefox picks a free one and names it on stderr.
  const browser = spawn(
    firefox,
    ["--headless", "--no-remote", "--profile", profile, "--remote-debugging-port=0"],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  const exited = new Promise((r) => browser.once("exit", r));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const within = (promise, ms, what) =>
    Promise.race([promise, wait(ms).then(() => Promise.reject(new Error(`Firefox: ${what}`)))]);
  let socket;
  try {
    const port = await within(
      new Promise((r) => {
        let text = "";
        browser.stderr.on("data", (chunk) => {
          text += chunk;
          const found = /ws:\/\/127\.0\.0\.1:(\d+)/.exec(text);
          if (found) r(found[1]);
        });
      }),
      30000,
      "startet nicht",
    );
    socket = new WebSocket(`ws://127.0.0.1:${port}/session`);
    await within(
      new Promise((r, reject) => {
        socket.onopen = r;
        socket.onerror = () => reject(new Error("Firefox: keine Verbindung"));
      }),
      10000,
      "keine Verbindung",
    );
    let id = 0;
    const pending = new Map();
    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      pending.get(msg.id)?.(msg);
      pending.delete(msg.id);
    };
    socket.onclose = () => {
      for (const settle of pending.values()) settle({ error: true, message: "Verbindung weg" });
      pending.clear();
    };
    const send = (method, params = {}) =>
      within(
        new Promise((r, reject) => {
          const n = ++id;
          pending.set(n, (msg) => (msg.error ? reject(new Error(msg.message)) : r(msg.result)));
          socket.send(JSON.stringify({ id: n, method, params }));
        }),
        30000,
        `${method} ohne Antwort`,
      );
    await send("session.new", { capabilities: {} });
    const { contexts } = await send("browsingContext.getTree", {});
    const context = contexts[0].context;
    await send("browsingContext.setViewport", {
      context,
      viewport: { width: 1000, height: 1100 },
      devicePixelRatio: 1,
    });
    await send("browsingContext.navigate", { context, url: url(scene), wait: "complete" });
    await wait(2500);
    const answer = await send("script.evaluate", {
      expression: "window.check()",
      target: { context },
      awaitPromise: false,
    });
    const m = JSON.parse(answer.result.value);
    const picture = resolve(pictures, `${scene}-firefox.png`);
    const { data } = await send("browsingContext.captureScreenshot", { context });
    writeFileSync(picture, Buffer.from(data, "base64"));
    if (!m.error) m.circles = judge(scene, m.rims, picture);
    return m;
  } finally {
    socket?.close();
    browser.kill();
    // The profile only goes once Firefox has stopped writing to it.
    await Promise.race([exited, wait(5000)]);
    rmSync(profile, { recursive: true, force: true });
  }
}

/** What the picture of one run shows wrong at the circles (K-16). */
function judge(scene, rims, picture) {
  if (!rims?.nodes?.length) return ["keine Kreise gemessen"];
  const png = readPng(readFileSync(picture));
  const found = gaps(rims, png);
  if (scene.startsWith("clear")) found.push(...insideCircles(rims, png));
  return found;
}

const white = (rgb) => rgb.every((v) => 255 - v <= CLEAR_TOLERANCE);

/**
 * Whether the lines reach every circle: just outside its edge, on the way
 * towards the middle of the cross where all of a node's lines arrive, the
 * picture must not be white. 1.5 px out the border's anti-aliasing is past,
 * so a gap narrower than that goes unseen. The page draws idle lines plainly;
 * a dimmed one (inactive_lines: dim) would read as white here.
 */
function gaps(rims, png) {
  const k = png.width / rims.view;
  const found = [];
  for (const { key, x, y, outer, towards } of rims.nodes) {
    for (let d = outer + 1.5; d <= outer + 3; d += 0.5) {
      const px = Math.round((x + d * towards[0]) * k);
      const py = Math.round((y + d * towards[1]) * k);
      if (white(png.pixel(px, py))) {
        found.push(`Lücke vor ${key}`);
        break;
      }
    }
  }
  return found;
}

/**
 * What shows inside each circle of the transparent card, from its picture: a
 * ring of samples 2.5 to 6 px within the border, where the value and icon
 * never reach and the page's white should show through. Closer to the border
 * its own anti-aliasing shows at 1x, so a cut up to 2.5 px short of it goes
 * unseen. The band fits the plain layout only: on smaller nodes the value
 * reaches into it. Returns one entry per circle with something drawn there,
 * in device pixels.
 */
function insideCircles(rims, png) {
  const k = png.width / rims.view;
  const found = [];
  for (const { key, x, y, inner } of rims.nodes) {
    const hit = new Set();
    for (let d = inner - 6; d <= inner - 2.5; d += 0.5) {
      for (let deg = 0; deg < 360; deg += 0.5) {
        const px = Math.round((x + d * Math.cos((deg * Math.PI) / 180)) * k);
        const py = Math.round((y + d * Math.sin((deg * Math.PI) / 180)) * k);
        if (px < 0 || py < 0 || px >= png.width || py >= png.height) continue;
        if (!white(png.pixel(px, py))) hit.add(`${px},${py}`);
      }
    }
    if (hit.size) found.push(`${key} ${hit.size} px`);
  }
  return found;
}

/** What is wrong with one measurement, in words; empty when all is well. */
function problems(m, lines) {
  if (m.error) return [m.error];
  const found = [];
  if (!m.cross.dots) found.push("keine Punkte im Kreuz");
  if (!m.fan.dots) found.push("keine Punkte am Fächer");
  if (m.cross.worst > TOLERANCE_PX) found.push(`Kreuz-Punkte ${m.cross.worst} px neben der Linie`);
  if (m.fan.worst > TOLERANCE_PX) found.push(`Fächer-Punkte ${m.fan.worst} px neben der Linie`);
  // The clear scene has no ring on purpose.
  if (m.ring === null) {
    if (!m.ringOff) found.push("kein Ring am Haus");
  } else if (m.ring > TOLERANCE_PX) found.push(`Ring ${m.ring} px neben der Hausmitte`);
  if (m.outside.length) found.push(`außerhalb der Karte: ${[...new Set(m.outside)].join(", ")}`);
  if (m.labels?.length) found.push(`Beschriftungen: ${[...new Set(m.labels)].join(", ")}`);
  if (m.circles?.length) found.push(`Kreise: ${m.circles.join(", ")}`);
  // Opaque circles are drawn as before K-16, transparent ones are cut out.
  if (m.rims && m.clipped !== m.clear) {
    found.push(
      m.clipped ? "Ausschnitt bei deckender Karte" : "kein Ausschnitt bei durchsichtiger Karte",
    );
  }
  // The fan's own cut-out at the house, beside the cross (all scenes but below).
  if (m.rims && m.fanClipped !== m.clear) {
    found.push(
      m.fanClipped ? "Fächer bei deckender Karte ausgeschnitten" : "Fächer nicht ausgeschnitten",
    );
  }
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
  for (const scale of CHROMIUM_SCALES) {
    const m = await inChromium(scene, scale).catch((e) => ({ error: e.message }));
    rows.push({ engine: "Chromium", scene, how: `Skalierung ${scale}`, m, lines: true });
  }
  const m = await inFirefox(scene).catch((e) => ({ error: e.message }));
  rows.push({ engine: "Firefox", scene, how: "Skalierung 1", m, lines: true });
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
