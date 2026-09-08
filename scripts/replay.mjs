#!/usr/bin/env node
// EnerLens — replay reference data onto Home Assistant test entities.
//
// Home Assistant cannot back-date states: POST /api/states always writes "now".
// Scenarios are therefore *played back* onto dedicated test entities instead of
// being written into the recorder history (see docs/test-setup.md).
//
// Reference data lives OUTSIDE this repository (REQ 5.1), by default in
// /share/dev/enerlens-fixture/history-YYYY-MM-DD.json with the shape
//   { day, series: { <role>: { entity_id, points: [{ t: <ISO>, v: <string> }] } } }
//
// Safety: this script only ever writes entities below sensor.enerlens_test_.
// Every write goes through assertTestEntity() — a real entity can not be hit.
//
// Code and comments English, console output German (project convention).
// No dependencies: plain Node 24 standard library.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Hard safety fence: nothing outside this prefix is ever written. */
const ENTITY_PREFIX = "sensor.enerlens_test_";

const DEFAULT_FIXTURE_DIR = process.env.ENERLENS_FIXTURES || "/share/dev/enerlens-fixture";
const DEFAULT_DAY = "2026-09-05"; // reference day, REQ 5.1
const DEFAULT_TICK_MS = 1000; // scenario-time bucket size for one write batch
const DEFAULT_WINDOW_MIN = 15; // used when --to is omitted

const API_BASE = (process.env.ENERLENS_HA_URL || "http://supervisor/core/api").replace(/\/+$/, "");
const TOKEN = process.env.ENERLENS_HA_TOKEN || process.env.SUPERVISOR_TOKEN || "";

/** Roles that carry a percentage instead of power. */
const PERCENT_ROLES = new Set(["soc", "soc_cloud"]);

/** German labels for the roles of the fixture (friendly_name + console output). */
const ROLE_LABELS = {
  solar: "PV",
  grid: "Netz",
  house_5s: "Haus 5 s",
  house_10s: "Haus 10 s",
  house_60s: "Haus 60 s",
  battery_to_house: "Batterie entlädt",
  solar_to_battery: "Batterie lädt",
  soc: "Ladezustand",
  soc_cloud: "Ladezustand Cloud",
  heatpump: "Wärmepumpe",
  ac: "Klima",
  ac_storage: "Klima Speicher",
  storage: "Speicher",
  fridges: "Kühlschränke",
  dryer: "Trockner",
  washer: "Waschmaschine",
  dishwasher: "Spülmaschine",
};

const nf = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const USAGE = `
EnerLens Replay — spielt einen Zeitausschnitt der Referenzdaten auf Test-Entitäten.

  node scripts/replay.mjs --from <ZEIT> [--to <ZEIT>] [Optionen]
  node scripts/replay.mjs --once <ZEIT> [Optionen]

Optionen:
  --from <ZEIT>       Beginn des Ausschnitts (HH:MM, HH:MM:SS oder volle ISO-Zeit)
  --to <ZEIT>         Ende des Ausschnitts (Standard: --from + ${DEFAULT_WINDOW_MIN} min)
  --once <ZEIT>       Nur einen einzelnen Zeitpunkt setzen, kein Abspielen
  --day <YYYY-MM-DD>  Referenztag (Standard: ${DEFAULT_DAY})
  --speed <faktor>    Zeitfaktor: 1 = Echtzeit, 4 = vierfach (Standard: 1)
  --tick <ms>         Raster für einen Schreibblock in Szenariozeit (Standard: ${DEFAULT_TICK_MS})
  --roles a,b,c       Nur diese Rollen abspielen (Standard: alle der Datei)
  --fixtures <pfad>   Verzeichnis der Referenzdaten (Standard: ${DEFAULT_FIXTURE_DIR})
  --dry-run           Nichts schreiben, nur zeigen, was passieren würde
  --list-roles        Rollen der Datei auflisten und beenden
  --help              Diese Hilfe

Zeiten ohne Datum werden als Ortszeit des Referenztags gelesen
(${Intl.DateTimeFormat().resolvedOptions().timeZone}). Eindeutig geht es mit
voller ISO-Zeit, z. B. --once 2026-09-05T15:40:18+02:00

Ziel-Entitäten: ${ENTITY_PREFIX}<rolle>  ·  API: ${API_BASE}
Es werden ausschließlich Entitäten mit diesem Präfix beschrieben.

Beispiele:
  node scripts/replay.mjs --from 15:25 --to 15:41 --day 2026-09-05 --speed 4
  node scripts/replay.mjs --once 15:40:18            # Abnahme L, dritter Fall
  node scripts/replay.mjs --from 12:46 --to 12:52 --speed 1 --dry-run
`;

function fail(msg) {
  console.error(`Fehler: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = {
    day: DEFAULT_DAY,
    speed: 1,
    tick: DEFAULT_TICK_MS,
    fixtures: DEFAULT_FIXTURE_DIR,
    dryRun: false,
    listRoles: false,
    roles: null,
    from: null,
    to: null,
    once: null,
  };
  const need = (i, name) => {
    if (i + 1 >= argv.length) fail(`${name} braucht einen Wert.`);
    return argv[i + 1];
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--help":
      case "-h":
        console.log(USAGE.trim());
        process.exit(0);
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--list-roles":
        opts.listRoles = true;
        break;
      case "--day":
        opts.day = need(i, a);
        i++;
        break;
      case "--from":
        opts.from = need(i, a);
        i++;
        break;
      case "--to":
        opts.to = need(i, a);
        i++;
        break;
      case "--once":
        opts.once = need(i, a);
        i++;
        break;
      case "--speed":
        opts.speed = Number(need(i, a));
        i++;
        break;
      case "--tick":
        opts.tick = Number(need(i, a));
        i++;
        break;
      case "--roles":
        opts.roles = need(i, a)
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean);
        i++;
        break;
      case "--fixtures":
        opts.fixtures = need(i, a);
        i++;
        break;
      default:
        fail(`Unbekannte Option "${a}". --help zeigt die Hilfe.`);
    }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.day)) fail(`--day erwartet YYYY-MM-DD, bekam "${opts.day}".`);
  if (!Number.isFinite(opts.speed) || opts.speed <= 0) fail("--speed muss größer als 0 sein.");
  if (!Number.isFinite(opts.tick) || opts.tick < 50) fail("--tick muss mindestens 50 ms sein.");
  return opts;
}

/** Accepts "HH:MM", "HH:MM:SS" (local time on `day`) or a full ISO timestamp. */
function parseTime(value, day) {
  if (/^\d{4}-\d{2}-\d{2}[T ]/.test(value)) {
    const ms = Date.parse(value);
    if (!Number.isFinite(ms)) fail(`Zeit "${value}" ist keine gültige ISO-Zeit.`);
    return ms;
  }
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!m) fail(`Zeit "${value}" verstehe ich nicht (HH:MM, HH:MM:SS oder volle ISO-Zeit).`);
  const [y, mo, d] = day.split("-").map(Number);
  const t = new Date(y, mo - 1, d, Number(m[1]), Number(m[2]), Number(m[3] ?? 0), 0);
  if (Number.isNaN(t.getTime())) fail(`Zeit "${value}" ergibt keinen gültigen Zeitpunkt.`);
  return t.getTime();
}

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

function loadFixture(dir, day) {
  const file = join(dir, `history-${day}.json`);
  if (!existsSync(file)) {
    fail(
      `Referenzdaten nicht gefunden: ${file}\n` +
        `Die Daten liegen außerhalb des Repositories (REQ 5.1). Pfad per --fixtures\n` +
        "oder Umgebungsvariable ENERLENS_FIXTURES setzen.",
    );
  }
  let raw;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    fail(`${file} lässt sich nicht lesen: ${err.message}`);
  }
  if (!raw || typeof raw.series !== "object" || raw.series === null) {
    fail(`${file} hat nicht die erwartete Form { day, series: { <rolle>: { entity_id, points } } }.`);
  }
  const series = {};
  for (const [role, s] of Object.entries(raw.series)) {
    const points = (s?.points ?? [])
      .map((p) => ({ t: Date.parse(p.t), v: String(p.v) }))
      .filter((p) => Number.isFinite(p.t))
      .sort((a, b) => a.t - b.t);
    series[role] = { entity_id: s?.entity_id ?? null, points };
  }
  return { file, day: raw.day ?? day, series };
}

/** Step-hold: the value in effect at `t`, or null before the first point. */
function valueAt(points, t) {
  let v = null;
  for (const p of points) {
    if (p.t > t) break;
    v = p.v;
  }
  return v;
}

/**
 * Groups all state changes inside the window into buckets of `tickMs` scenario
 * time. Within one bucket the last value of a role wins — that keeps the number
 * of REST calls sane without losing the shape of the curve.
 */
function buildTimeline(series, roles, fromMs, toMs, tickMs) {
  const buckets = new Map();
  for (const role of roles) {
    for (const p of series[role].points) {
      if (p.t <= fromMs || p.t > toMs) continue;
      const bucket = fromMs + Math.floor((p.t - fromMs) / tickMs) * tickMs;
      let m = buckets.get(bucket);
      if (!m) buckets.set(bucket, (m = new Map()));
      m.set(role, p.v);
    }
  }
  return [...buckets.entries()].sort((a, b) => a[0] - b[0]).map(([t, values]) => ({ t, values }));
}

// ---------------------------------------------------------------------------
// Target entities and writing
// ---------------------------------------------------------------------------

function targetEntity(role) {
  const slug = role.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  return `${ENTITY_PREFIX}${slug}`;
}

/**
 * The safety fence. Every single write passes through here; a target that is not
 * a plain sensor below ENTITY_PREFIX aborts the whole run instead of writing.
 */
function assertTestEntity(entityId) {
  const ok = typeof entityId === "string" && entityId.startsWith(ENTITY_PREFIX) && /^sensor\.[a-z0-9_]+$/.test(entityId);
  if (!ok) {
    console.error(`\nABBRUCH: "${entityId}" liegt nicht unter ${ENTITY_PREFIX} — es wird nichts geschrieben.`);
    process.exit(2);
  }
  return entityId;
}

function attributesFor(role) {
  const percent = PERCENT_ROLES.has(role);
  return {
    unit_of_measurement: percent ? "%" : "W",
    device_class: percent ? "battery" : "power",
    state_class: "measurement",
    friendly_name: `EnerLens Test ${ROLE_LABELS[role] ?? role}`,
  };
}

let written = 0;
let errors = 0;
let consecutiveErrors = 0;

async function writeState(role, value, { dryRun }) {
  const entityId = assertTestEntity(targetEntity(role));
  if (dryRun) {
    written++;
    return true;
  }
  try {
    const res = await fetch(`${API_BASE}/states/${entityId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ state: String(value), attributes: attributesFor(role) }),
    });
    if (!res.ok) {
      errors++;
      consecutiveErrors++;
      const body = (await res.text()).slice(0, 200);
      console.error(`  ! ${entityId}: HTTP ${res.status} ${body}`);
      return false;
    }
    written++;
    consecutiveErrors = 0;
    return true;
  } catch (err) {
    errors++;
    consecutiveErrors++;
    console.error(`  ! ${entityId}: ${err.message}`);
    return false;
  }
}

async function writeBatch(values, opts) {
  await Promise.all([...values].map(([role, value]) => writeState(role, value, opts)));
  if (consecutiveErrors >= 20) {
    console.error("\nABBRUCH: 20 Schreibversuche in Folge fehlgeschlagen. Läuft Home Assistant? Ist SUPERVISOR_TOKEN gesetzt?");
    process.exit(3);
  }
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

const clock = (ms) =>
  new Date(ms).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

function fmtValue(role, value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value); // unavailable / unknown pass through
  return `${nf.format(Math.round(n * 10) / 10)} ${PERCENT_ROLES.has(role) ? "%" : "W"}`;
}

const plural = (n) => (n === 1 ? "Wert " : "Werte");

function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  const min = Math.floor(s / 60);
  return min ? `${min} min ${String(s % 60).padStart(2, "0")} s` : `${s} s`;
}

function fmtBatch(values, max = 4) {
  const list = [...values];
  const head = list
    .slice(0, max)
    .map(([role, v]) => `${ROLE_LABELS[role] ?? role} ${fmtValue(role, v)}`)
    .join(" · ");
  return list.length > max ? `${head} … (+${list.length - max})` : head;
}

// ---------------------------------------------------------------------------
// Interruption handling
// ---------------------------------------------------------------------------

let stopping = false;
const waiters = new Set();

process.on("SIGINT", () => {
  if (stopping) process.exit(130);
  stopping = true;
  process.stdout.write("\nAbbruch angefordert (Strg+C) — beende sauber …\n");
  for (const w of [...waiters]) w();
});

function sleepUntil(targetReal) {
  const ms = targetReal - Date.now();
  if (stopping || ms <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      waiters.delete(done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    waiters.add(done);
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const fixture = loadFixture(opts.fixtures, opts.day);
  const available = Object.keys(fixture.series);

  if (opts.listRoles) {
    console.log(`Referenzdaten: ${fixture.file}  (Tag ${fixture.day})\n`);
    console.log("Rolle              Punkte  Ziel-Entität");
    console.log("-".repeat(70));
    for (const role of available) {
      console.log(
        `${role.padEnd(18)} ${String(fixture.series[role].points.length).padStart(6)}  ${targetEntity(role)}`,
      );
    }
    return;
  }

  if (!opts.once && !opts.from) {
    console.log(USAGE.trim());
    fail("Entweder --from (mit optionalem --to) oder --once angeben.");
  }
  if (opts.once && opts.from) fail("--once und --from schließen sich aus.");

  const roles = opts.roles ?? available;
  const unknown = roles.filter((r) => !available.includes(r));
  if (unknown.length) fail(`Unbekannte Rolle(n): ${unknown.join(", ")}\nVerfügbar: ${available.join(", ")}`);
  if (!roles.length) fail("Keine Rollen ausgewählt.");

  if (!opts.dryRun && !TOKEN) {
    fail("SUPERVISOR_TOKEN ist nicht gesetzt — ohne Token kann nichts geschrieben werden.\nMit --dry-run läuft das Skript auch ohne Token.");
  }

  const mark = opts.dryRun ? "  [TROCKENLAUF — es wird nichts geschrieben]" : "";

  // --- single point in time --------------------------------------------------
  if (opts.once) {
    const t = parseTime(opts.once, opts.day);
    console.log(`EnerLens Replay — Einzelzeitpunkt${mark}`);
    console.log(`  Referenzdaten : ${fixture.file}`);
    console.log(`  Zeitpunkt     : ${new Date(t).toLocaleString("de-DE")}  (${new Date(t).toISOString()})`);
    console.log(`  Ziel          : ${ENTITY_PREFIX}<rolle>  ·  ${API_BASE}\n`);

    const batch = new Map();
    const missing = [];
    for (const role of roles) {
      const v = valueAt(fixture.series[role].points, t);
      if (v === null) missing.push(role);
      else batch.set(role, v);
    }
    for (const [role, v] of batch) {
      console.log(`  ${role.padEnd(18)} ${fmtValue(role, v).padStart(12)}   → ${targetEntity(role)}`);
    }
    if (missing.length) console.log(`\n  Ohne Wert zu diesem Zeitpunkt (übersprungen): ${missing.join(", ")}`);
    await writeBatch(batch, opts);
    console.log(`\n${opts.dryRun ? "Würde setzen" : "Gesetzt"}: ${written} Werte, ${errors} Fehler.`);
    return;
  }

  // --- window replay ---------------------------------------------------------
  const fromMs = parseTime(opts.from, opts.day);
  const toMs = opts.to ? parseTime(opts.to, opts.day) : fromMs + DEFAULT_WINDOW_MIN * 60000;
  if (toMs <= fromMs) fail("--to muss nach --from liegen.");

  const initial = new Map();
  for (const role of roles) {
    const v = valueAt(fixture.series[role].points, fromMs);
    if (v !== null) initial.set(role, v);
  }
  const timeline = buildTimeline(fixture.series, roles, fromMs, toMs, opts.tick);
  const totalWrites = initial.size + timeline.reduce((a, s) => a + s.values.size, 0);
  const spanMs = toMs - fromMs;

  console.log(`EnerLens Replay${mark}`);
  console.log(`  Referenzdaten : ${fixture.file}`);
  console.log(`  Fenster       : ${clock(fromMs)} – ${clock(toMs)}  (${fmtDuration(spanMs)} Szenariozeit)`);
  console.log(`  Zeitfaktor    : ${nf.format(opts.speed)}×  →  ${fmtDuration(spanMs / opts.speed)} echte Laufzeit`);
  console.log(`  Raster        : ${opts.tick} ms  →  ${timeline.length} Schritte`);
  console.log(`  Rollen        : ${roles.length} (${roles.join(", ")})`);
  console.log(`  Ziel          : ${ENTITY_PREFIX}<rolle>  ·  ${API_BASE}`);
  console.log(`  Schreibvorgänge: ${totalWrites} (inkl. ${initial.size} Startwerte)\n`);

  if (opts.dryRun) {
    console.log("Trockenlauf — die ersten Schritte:");
    console.log(`  ${clock(fromMs)}  ▸ Start   ${initial.size} Werte   ${fmtBatch(initial)}`);
    for (const step of timeline.slice(0, 8)) {
      console.log(`  ${clock(step.t)}  ·         ${String(step.values.size).padStart(2)} ${plural(step.values.size)}   ${fmtBatch(step.values)}`);
    }
    if (timeline.length > 8) {
      console.log(`  …  ${timeline.length - 8} weitere Schritte`);
      const last = timeline[timeline.length - 1];
      console.log(`  ${clock(last.t)}  ·         ${String(last.values.size).padStart(2)} ${plural(last.values.size)}   ${fmtBatch(last.values)}`);
    }
    console.log(`\nTrockenlauf beendet: ${totalWrites} Werte würden gesetzt, geschrieben wurde nichts.`);
    return;
  }

  const startedReal = Date.now();
  console.log(`${clock(fromMs)}  ▸ Startwerte   ${initial.size} Werte   ${fmtBatch(initial)}`);
  await writeBatch(initial, opts);

  for (const step of timeline) {
    if (stopping) break;
    await sleepUntil(startedReal + (step.t - fromMs) / opts.speed);
    if (stopping) break;
    await writeBatch(step.values, opts);
    console.log(`${clock(step.t)}  ·  ${String(step.values.size).padStart(2)} ${plural(step.values.size)}   ${fmtBatch(step.values)}`);
  }

  const runtime = Date.now() - startedReal;
  console.log(
    `\n${stopping ? "Abgebrochen" : "Fertig"}: ${written} Werte gesetzt, ${errors} Fehler, Laufzeit ${fmtDuration(runtime)}.`,
  );
  console.log("Die Entitäten behalten ihren letzten Wert, bis Home Assistant neu startet.");
}

main().catch((err) => {
  console.error(`\nUnerwarteter Fehler: ${err?.stack ?? err}`);
  process.exit(1);
});
