#!/usr/bin/env node
// EnerLens — create 100 synthetic consumers for the load test (REQ L-11, N-1).
//
// Writes sensor.enerlens_stress_001 … _100 plus sensor.enerlens_stress_house
// via POST /api/states. Values are deterministic for a given --seed, so a run
// is reproducible; --vary keeps changing them so the list re-sorting (L-7, L-8)
// and the ring transitions (R-4) can be watched under load.
//
// Safety: this script only ever writes entities below sensor.enerlens_stress_.
// Every write goes through assertStressEntity().
//
// Code and comments English, console output German (project convention).
// No dependencies: plain Node 24 standard library.

/** Hard safety fence: nothing outside this prefix is ever written. */
const ENTITY_PREFIX = "sensor.enerlens_stress_";

const API_BASE = (process.env.ENERLENS_HA_URL || "http://supervisor/core/api").replace(/\/+$/, "");
const TOKEN = process.env.ENERLENS_HA_TOKEN || process.env.SUPERVISOR_TOKEN || "";

const DEFAULT_COUNT = 100;
const DEFAULT_SEED = 42;
const DEFAULT_INTERVAL_S = 5;
/** Watts the house carries on top of the sum of all consumers → visible "Rest". */
const HOUSE_HEADROOM_W = 250;

const nf = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

const USAGE = `
EnerLens Stress-Entitäten — legt ${DEFAULT_COUNT} Test-Verbraucher plus Hauswert an.

  node scripts/make-stress-entities.mjs [Optionen]

Optionen:
  --count <n>       Anzahl Verbraucher (Standard: ${DEFAULT_COUNT}, max. 999)
  --seed <n>        Startwert des Zufallsgenerators (Standard: ${DEFAULT_SEED})
  --vary            In einer Schleife laufen und die Werte laufend ändern
  --interval <s>    Abstand zwischen zwei Runden bei --vary (Standard: ${DEFAULT_INTERVAL_S})
  --rounds <n>      Nur n Runden bei --vary (Standard: unbegrenzt bis Strg+C)
  --dry-run         Nichts schreiben, nur zeigen, was passieren würde
  --help            Diese Hilfe

Entitäten: ${ENTITY_PREFIX}001 … ${ENTITY_PREFIX}${String(DEFAULT_COUNT).padStart(3, "0")}
           ${ENTITY_PREFIX}house  (Hauswert = Summe aller Verbraucher + ${HOUSE_HEADROOM_W} W)
Es werden ausschließlich Entitäten mit diesem Präfix beschrieben.

Die Verteilung ist absichtlich gemischt: einige Verbraucher liegen unter 10 W
(damit min_consumer_w greift), viele im zwei- bis dreistelligen Bereich, einige
im Kilowatt-Bereich.

Beispiele:
  node scripts/make-stress-entities.mjs --dry-run
  node scripts/make-stress-entities.mjs
  node scripts/make-stress-entities.mjs --vary --interval 3
`;

function fail(msg) {
  console.error(`Fehler: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = {
    count: DEFAULT_COUNT,
    seed: DEFAULT_SEED,
    vary: false,
    interval: DEFAULT_INTERVAL_S,
    rounds: Infinity,
    dryRun: false,
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
      case "--vary":
        opts.vary = true;
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--count":
        opts.count = Number(need(i, a));
        i++;
        break;
      case "--seed":
        opts.seed = Number(need(i, a));
        i++;
        break;
      case "--interval":
        opts.interval = Number(need(i, a));
        i++;
        break;
      case "--rounds":
        opts.rounds = Number(need(i, a));
        i++;
        break;
      default:
        fail(`Unbekannte Option "${a}". --help zeigt die Hilfe.`);
    }
  }
  if (!Number.isInteger(opts.count) || opts.count < 1 || opts.count > 999) fail("--count muss zwischen 1 und 999 liegen.");
  if (!Number.isFinite(opts.seed)) fail("--seed muss eine Zahl sein.");
  if (!Number.isFinite(opts.interval) || opts.interval < 0.5) fail("--interval muss mindestens 0,5 s sein.");
  if (!(opts.rounds > 0)) fail("--rounds muss größer als 0 sein.");
  return opts;
}

// ---------------------------------------------------------------------------
// Deterministic pseudo random (mulberry32) — same seed, same values.
// ---------------------------------------------------------------------------

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Four classes of consumer, spread deterministically over the index so every
 * run contains standby loads below the 10 W filter and a few kilowatt loads.
 */
function classOf(index) {
  if (index % 7 === 0) return "standby"; // < 10 W → filtered away (L-3)
  if (index % 11 === 0) return "large"; // kilowatt range
  if (index % 3 === 0) return "medium";
  return "small";
}

const RANGES = {
  standby: [0.2, 9.4],
  small: [12, 180],
  medium: [180, 900],
  large: [1500, 6500],
};

function baseValues(count, seed) {
  const rnd = mulberry32(seed);
  const out = [];
  for (let i = 1; i <= count; i++) {
    const kind = classOf(i);
    const [lo, hi] = RANGES[kind];
    out.push({ index: i, kind, w: lo + rnd() * (hi - lo) });
  }
  return out;
}

/** One step of the random walk: keeps the class, occasionally switches a device off. */
function varyValues(items, rnd) {
  for (const it of items) {
    const [lo, hi] = RANGES[it.kind];
    if (rnd() < 0.08) {
      it.w = it.kind === "standby" ? lo : 0.4; // switched off → falls through the filter
    } else if (it.w < lo) {
      it.w = lo + rnd() * (hi - lo) * 0.5; // switched back on
    } else {
      it.w = Math.min(hi, Math.max(lo, it.w * (0.55 + rnd() * 1.05)));
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// Entities and writing
// ---------------------------------------------------------------------------

const consumerEntity = (index) => `${ENTITY_PREFIX}${String(index).padStart(3, "0")}`;
const HOUSE_ENTITY = `${ENTITY_PREFIX}house`;

/** The safety fence — every write passes through here. */
function assertStressEntity(entityId) {
  const ok = typeof entityId === "string" && entityId.startsWith(ENTITY_PREFIX) && /^sensor\.[a-z0-9_]+$/.test(entityId);
  if (!ok) {
    console.error(`\nABBRUCH: "${entityId}" liegt nicht unter ${ENTITY_PREFIX} — es wird nichts geschrieben.`);
    process.exit(2);
  }
  return entityId;
}

function attributesFor(name) {
  return {
    unit_of_measurement: "W",
    device_class: "power",
    state_class: "measurement",
    friendly_name: name,
  };
}

let written = 0;
let errors = 0;
let consecutiveErrors = 0;

async function writeState(entityId, value, name, { dryRun }) {
  assertStressEntity(entityId);
  if (dryRun) {
    written++;
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/states/${entityId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ state: String(Math.round(value * 10) / 10), attributes: attributesFor(name) }),
    });
    if (!res.ok) {
      errors++;
      consecutiveErrors++;
      console.error(`  ! ${entityId}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
      return;
    }
    written++;
    consecutiveErrors = 0;
  } catch (err) {
    errors++;
    consecutiveErrors++;
    console.error(`  ! ${entityId}: ${err.message}`);
  }
}

/** Writes one round in small parallel chunks so 101 requests do not stampede. */
async function writeRound(items, opts) {
  const jobs = items.map((it) => ({
    id: consumerEntity(it.index),
    w: it.w,
    name: `EnerLens Stress ${String(it.index).padStart(3, "0")}`,
  }));
  const sum = items.reduce((a, it) => a + it.w, 0);
  jobs.push({ id: HOUSE_ENTITY, w: sum + HOUSE_HEADROOM_W, name: "EnerLens Stress Haus" });

  const CHUNK = 10;
  for (let i = 0; i < jobs.length; i += CHUNK) {
    if (stopping) break;
    await Promise.all(jobs.slice(i, i + CHUNK).map((j) => writeState(j.id, j.w, j.name, opts)));
    if (consecutiveErrors >= 20) {
      console.error("\nABBRUCH: 20 Schreibversuche in Folge fehlgeschlagen. Läuft Home Assistant? Ist SUPERVISOR_TOKEN gesetzt?");
      process.exit(3);
    }
  }
  return sum;
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

function sleep(ms) {
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
  if (!opts.dryRun && !TOKEN) {
    fail("SUPERVISOR_TOKEN ist nicht gesetzt — ohne Token kann nichts geschrieben werden.\nMit --dry-run läuft das Skript auch ohne Token.");
  }

  const items = baseValues(opts.count, opts.seed);
  const counts = items.reduce((a, it) => ((a[it.kind] = (a[it.kind] ?? 0) + 1), a), {});
  const below10 = items.filter((it) => it.w < 10).length;
  const sum = items.reduce((a, it) => a + it.w, 0);
  const mark = opts.dryRun ? "  [TROCKENLAUF — es wird nichts geschrieben]" : "";

  console.log(`EnerLens Stress-Entitäten${mark}`);
  console.log(`  Verbraucher   : ${opts.count}  (${consumerEntity(1)} … ${consumerEntity(opts.count)})`);
  console.log(`  Hauswert      : ${HOUSE_ENTITY}`);
  console.log(`  Startwert     : Seed ${opts.seed}`);
  console.log(
    `  Verteilung    : ${counts.standby ?? 0}× Standby · ${counts.small ?? 0}× klein · ${counts.medium ?? 0}× mittel · ${counts.large ?? 0}× groß`,
  );
  console.log(`  Unter 10 W    : ${below10} (fallen durch min_consumer_w)`);
  console.log(`  Summe         : ${nf.format(Math.round(sum))} W  →  Haus ${nf.format(Math.round(sum + HOUSE_HEADROOM_W))} W`);
  console.log(`  Modus         : ${opts.vary ? `Schleife alle ${nf.format(opts.interval)} s (Strg+C beendet)` : "einmalig"}`);
  console.log(`  Ziel          : ${API_BASE}\n`);

  if (opts.dryRun) {
    console.log("Beispielwerte (die ersten 12):");
    for (const it of items.slice(0, 12)) {
      console.log(`  ${consumerEntity(it.index)}   ${nf.format(Math.round(it.w * 10) / 10).padStart(8)} W   ${it.kind}`);
    }
    const top = [...items].sort((a, b) => b.w - a.w).slice(0, 5);
    console.log(`\nGrößte Verbraucher: ${top.map((t) => `${String(t.index).padStart(3, "0")} ${nf.format(Math.round(t.w))} W`).join(" · ")}`);
    console.log(`\nTrockenlauf beendet: ${opts.count + 1} Entitäten würden geschrieben, geschrieben wurde nichts.`);
    return;
  }

  const rnd = mulberry32(opts.seed + 1);
  let round = 0;
  for (;;) {
    round++;
    const roundSum = await writeRound(items, opts);
    const top = [...items].sort((a, b) => b.w - a.w).slice(0, 3);
    console.log(
      `Runde ${String(round).padStart(3)} · ${opts.count + 1} Werte · Haus ${nf.format(Math.round(roundSum + HOUSE_HEADROOM_W))} W · ` +
        `Größte: ${top.map((t) => `${String(t.index).padStart(3, "0")} ${nf.format(Math.round(t.w))} W`).join(" · ")}`,
    );
    if (stopping || !opts.vary || round >= opts.rounds) break;
    await sleep(opts.interval * 1000);
    if (stopping) break;
    varyValues(items, rnd);
  }

  console.log(`\n${stopping ? "Abgebrochen" : "Fertig"}: ${written} Werte gesetzt, ${errors} Fehler, ${round} Runde(n).`);
  console.log("Die Entitäten behalten ihren letzten Wert, bis Home Assistant neu startet.");
}

main().catch((err) => {
  console.error(`\nUnerwarteter Fehler: ${err?.stack ?? err}`);
  process.exit(1);
});
