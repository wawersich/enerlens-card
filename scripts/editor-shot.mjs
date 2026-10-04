/**
 * Writes docs/images/editor-{de,en}-{light,dark}.png: the card editor in a real
 * Home Assistant, colour picker open, the card live beside it.
 *
 * Unlike the hero pictures the editor cannot be rendered on its own - it is
 * built from Home Assistant's form elements. So this drives a headless
 * Chromium against a running instance over the DevTools protocol (Node's own
 * WebSocket, no dependencies) and changes nothing there: the sensors are
 * in-memory states with invented values that a restart drops, the dialog is
 * cancelled, and language and dark mode are switched in this one page only.
 * The user's stored profile (language, theme) is read before and after; should
 * it have changed anyway, it is put back and the run fails loudly. An earlier
 * version switched dark mode through the frontend's "settheme" event, which
 * saves to the profile - the guard is there so that cannot happen silently.
 *
 *   HA_URL=http://<host>:8123 HA_TOKEN_FILE=<file> npm run editor-shot
 *
 * HA_TOKEN_FILE holds a long-lived access token (profile -> security).
 * HA_DASHBOARD  a dashboard with at least one card, default /lovelace/0 -
 *               the edit dialog is borrowed from that card, then shown with
 *               the card below.
 * HA_CARD       the card type to show, default enerlens-card-dev (npm run
 *               deploy), so the picture shows the code in this checkout.
 *
 * Needs Chromium (`apk add chromium` on the HA box, not persistent).
 */
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.HA_URL?.replace(/\/$/, "");
const tokenFile = process.env.HA_TOKEN_FILE;
if (!url || !tokenFile) {
  console.error("HA_URL und HA_TOKEN_FILE setzen - siehe Kopf von scripts/editor-shot.mjs");
  process.exit(1);
}
const token = readFileSync(tokenFile, "utf8").trim();
const dashboard = process.env.HA_DASHBOARD ?? "/lovelace/0";
const cardType = process.env.HA_CARD ?? "enerlens-card-dev";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Invented values that add up: 9.8 kW solar = 7.7 kW house + 1.8 kW into the
 * battery + 0.3 kW export. A wallbox charges a car at 66 % on surplus, one
 * phase at 16 A, so the picture shows the state-of-charge ring (REQ L-15;
 * Markus, 04.10.2026: screenshots with a charging wallbox at about 66 %). */
const PREFIX = "sensor.enerlens_test_shot_";
const VALUES = {
  solar: 9800,
  grid: -300,
  house: 7700,
  battery: -1800,
  wallbox: 3700,
  c1: 2200,
  c2: 900,
  c3: 600,
  c4: 150,
};
const CAR_SOC = 66;
const NAMES = {
  de: ["Wärmepumpe", "Waschmaschine", "Klima", "Kühlschränke"],
  en: ["Heat pump", "Washing machine", "Air conditioning", "Fridges"],
};

async function putState(key, state, attributes) {
  const res = await fetch(`${url}/api/states/${PREFIX}${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ state: String(state), attributes }),
  });
  if (!res.ok) throw new Error(`${PREFIX}${key}: HTTP ${res.status}`);
}

function cardConfig(lang) {
  const [c1, c2, c3, c4] = NAMES[lang];
  return {
    type: `custom:${cardType}`,
    entities: {
      solar: `${PREFIX}solar`,
      grid: `${PREFIX}grid`,
      house: `${PREFIX}house`,
      battery: `${PREFIX}battery`,
      battery_soc: `${PREFIX}soc`,
    },
    consumers: [
      { entity: `${PREFIX}c1`, name: c1, icon: "mdi:heat-wave" },
      { entity: `${PREFIX}c2`, name: c2, icon: "mdi:washing-machine" },
      { entity: `${PREFIX}c3`, name: c3, icon: "mdi:air-conditioner" },
      { entity: `${PREFIX}c4`, name: c4, icon: "mdi:fridge-outline" },
      // Last, so the others keep the colours of the title picture.
      {
        entity: `${PREFIX}wallbox`,
        name: "Wallbox",
        icon: "mdi:ev-station",
        charge: { soc: `${PREFIX}car` },
      },
    ],
    flow: { design: "electron", inactive_lines: "dim" },
  };
}

/** Every element matching `sel`, through all shadow roots below `root`. */
const DEEP = `window.__deep = (sel, root = document) => {
  const out = [];
  const walk = (n) => {
    for (const e of n.querySelectorAll(sel)) out.push(e);
    for (const e of n.querySelectorAll("*")) if (e.shadowRoot) walk(e.shadowRoot);
  };
  walk(root);
  return out;
};`;

async function browser() {
  const port = 9300 + Math.floor(Math.random() * 500);
  const profile = mkdtempSync(join(tmpdir(), "enerlens-shot-"));
  const chrome = spawn(
    "chromium",
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--hide-scrollbars",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--window-size=1040,860",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let targets = [];
  for (let i = 0; i < 50 && targets.length === 0; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      targets = list.filter((t) => t.type === "page");
    } catch {}
    if (targets.length === 0) await sleep(200);
  }
  if (targets.length === 0) throw new Error("Chromium antwortet nicht");
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id;
      pending.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    const failed = r.result?.exceptionDetails;
    if (failed) throw new Error(failed.exception?.description ?? failed.text);
    return r.result?.result?.value;
  };
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1040,
    height: 860,
    deviceScaleFactor: 2,
    mobile: false,
  });
  const close = async () => {
    ws.close();
    const gone = new Promise((r) => chrome.once("exit", r));
    chrome.kill();
    await gone;
    rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
  };
  return { send, evaluate, close };
}

/** Polls `expr` in the page until it is true; the frontend renders in its own time. */
async function waitFor(evaluate, expr, ms = 20000) {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(250)) {
    if (await evaluate(expr)) return;
  }
  throw new Error(`timed out waiting for ${expr}`);
}

async function shoot(lang, dark) {
  const { send, evaluate, close } = await browser();
  try {
    // Signed in by handing the frontend a token, as it would keep one itself.
    await send("Page.navigate", { url: `${url}/` });
    await sleep(2500);
    await evaluate(`localStorage.setItem("hassTokens", JSON.stringify({
      access_token: ${JSON.stringify(token)}, token_type: "Bearer", expires_in: 1800,
      hassUrl: ${JSON.stringify(url)}, clientId: ${JSON.stringify(`${url}/`)},
      expires: Date.now() + 1e10, refresh_token: "" })); 1`);
    await send("Page.navigate", { url: url + dashboard });
    await sleep(7000);
    await evaluate(DEEP);

    // Language and theme of this page only: false keeps the profile's language,
    // and the theme is set on the page's own state, not saved.
    await evaluate(`(async () => {
      const ha = document.querySelector("home-assistant");
      await ha._selectLanguage(${JSON.stringify(lang)}, false);
      // Never the "settheme" event: that one saves the choice to the profile.
    ${dark ? "ha._updateHass({ selectedTheme: { ...ha.hass.selectedTheme, dark: true } }); await new Promise((r) => setTimeout(r, 300)); ha._applyTheme(true);" : ""}
      await new Promise((r) => setTimeout(r, 2500));
    })()`);
    // The dialog is titled after the registered name; "(dev)" is no part of the picture.
    await evaluate(
      `(window.customCards || []).forEach((c) => { if (c.type === ${JSON.stringify(cardType)}) c.name = "EnerLens Card"; })`,
    );

    // Borrow the edit dialog from the dashboard's first card, then show ours in it.
    await waitFor(evaluate, `!!__deep("hui-root")[0]?.lovelace`);
    await evaluate(`__deep("hui-root")[0].lovelace.setEditMode(true)`);
    await waitFor(evaluate, `!!__deep("hui-card-edit-mode")[0]`);
    await evaluate(`__deep("hui-card-edit-mode")[0]._editCard()`);
    await waitFor(evaluate, `!!__deep("hui-dialog-edit-card")[0]?._params`);
    // Let the borrowed card's editor finish loading before it is swapped out.
    await sleep(3000);
    await evaluate(`(async () => {
      const d = __deep("hui-dialog-edit-card")[0];
      const params = d._params;
      d.closeDialog();
      await new Promise((r) => setTimeout(r, 800));
      await d.showDialog({ ...params, cardConfig: ${JSON.stringify(cardConfig(lang))}, saveCardConfig: async () => {} });
    })()`);
    await sleep(5000);

    const colours = `__deep("ha-expansion-panel", __deep("${cardType}-editor")[0]?.shadowRoot ?? document)
      .find((p) => /^(Farben|Colou?rs)/.test((p.header || p.textContent || "").trim()))`;
    await waitFor(evaluate, `!!${colours}`);
    // Colours open, the picker on the grid import row - the third swatch.
    await evaluate(`(async () => {
      const editor = __deep("${cardType}-editor")[0];
      const panel = ${colours};
      panel.expanded = true;
      await new Promise((r) => setTimeout(r, 800));
      __deep("button.swatch", editor.shadowRoot)[2].click();
      await new Promise((r) => setTimeout(r, 800));
      panel.scrollIntoView({ block: "start" });
    })()`);
    await sleep(1500);

    // Cut to the dialog itself, without the dashboard behind it.
    const box = await evaluate(`(() => {
      const d = __deep("hui-dialog-edit-card")[0];
      const boxes = __deep("*", d.shadowRoot).map((e) => e.getBoundingClientRect())
        .filter((r) => r.width > 800 && r.width < 1000 && r.height > 700)
        .sort((a, b) => b.width * b.height - a.width * a.height);
      const r = boxes[0];
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    })()`);
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      clip: { ...box, scale: 1 },
    });
    const name = `editor-${lang}-${dark ? "dark" : "light"}.png`;
    writeFileSync(join(repo, "docs/images", name), Buffer.from(shot.result.data, "base64"));
    console.log(`  docs/images/${name}`);
  } finally {
    await close();
  }
}

/** The user's stored frontend data for `keys`, or writes it back. */
async function userData(keys, restore) {
  const ws = new WebSocket(`${url.replace(/^http/, "ws")}/api/websocket`);
  const out = {};
  let id = 0;
  await new Promise((done, fail) => {
    const queue = [...keys];
    const next = () => {
      const key = queue.shift();
      if (!key) {
        ws.close();
        done();
        return;
      }
      ws.send(
        JSON.stringify(
          restore
            ? { id: ++id, type: "frontend/set_user_data", key, value: restore[key] }
            : { id: ++id, type: "frontend/get_user_data", key },
        ),
      );
      ws.onmessage = (e) => {
        const m = JSON.parse(e.data);
        if (!m.success) return fail(new Error(`user data ${key}: ${JSON.stringify(m.error)}`));
        out[key] = m.result?.value ?? null;
        next();
      };
    };
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.type === "auth_required")
        ws.send(JSON.stringify({ type: "auth", access_token: token }));
      else if (m.type === "auth_ok") next();
      else if (m.type === "auth_invalid") fail(new Error("token rejected"));
    };
    ws.onerror = () => fail(new Error("websocket failed"));
  });
  return out;
}

const PROFILE_KEYS = ["theme", "language"];
const before = await userData(PROFILE_KEYS);

for (const [key, value] of Object.entries(VALUES)) {
  await putState(key, value, {
    unit_of_measurement: "W",
    device_class: "power",
    state_class: "measurement",
  });
}
await putState("soc", 68, { unit_of_measurement: "%", device_class: "battery" });
await putState("car", CAR_SOC, { unit_of_measurement: "%", device_class: "battery" });

try {
  for (const lang of ["de", "en"]) {
    for (const dark of [false, true]) await shoot(lang, dark);
  }
} finally {
  const after = await userData(PROFILE_KEYS);
  if (JSON.stringify(after) !== JSON.stringify(before)) {
    await userData(
      PROFILE_KEYS.filter((k) => before[k] !== null),
      before,
    );
    console.error(
      `Profil hatte sich geändert und ist zurückgesetzt: ${JSON.stringify(after)} -> ${JSON.stringify(before)}`,
    );
    process.exitCode = 1;
  }
}
