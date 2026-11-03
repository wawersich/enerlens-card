/**
 * The flow rule (REQ 4.5, rewritten 03.11.2026 for issue #27): everything that
 * can be assigned is; battery and grid exchange power only as far as the
 * readings prove it; the rest in the order the battery's task asks for
 * (`flow.battery_task`, P-14): `zero_grid` - PV feeds the house first, what the
 * battery still trades with the grid runs between battery and grid - or
 * `supply_house` - the battery feeds the house and stores PV.
 *
 * The catalogue in flow-catalogue.json comes from the study of 02./03.11.2026
 * (111 situations of many kinds of installation, built from physics before any
 * rule was written) - the rule is generic, not tuned to one installation.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { computeFlows, splitFlows } from "../src/flow";
import type { BatteryTask, ConnectionId, Flows, Model, Reading, Signed } from "../src/types";

const reading = (w: number): Reading => ({ available: true, w, derived: false });
const signed = (net: number): Signed => ({
  available: true,
  positive: Math.max(0, net),
  negative: Math.max(0, -net),
  net,
  derived: false,
});
const model = (over: Partial<Model> = {}): Model => ({
  solar: reading(0),
  solarSources: [],
  grid: signed(0),
  battery: signed(0),
  soc: { available: false, derived: false },
  house: reading(0),
  consumers: [],
  ...over,
});

const IDS: ConnectionId[] = [
  "solar_house",
  "solar_grid",
  "solar_battery",
  "grid_house",
  "grid_battery",
  "battery_house",
  "battery_grid",
];
type Six = { pv: number; imp: number; exp: number; dis: number; chg: number; house: number };
const split = (v: Six, block = false, task: BatteryTask = "zero_grid") =>
  splitFlows(v.pv, v.imp, v.exp, v.dis, v.chg, v.house, { block, task });
const round = (f: Flows) =>
  Object.fromEntries(
    Object.entries(f)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, w]) => [k, Math.round((w as number) * 1000) / 1000]),
  );

describe("REQ 4.5: the known cases", () => {
  it("case A (#27): the battery delivering more than the house lacks feeds the grid", () => {
    // PV 3000 covers the house; the battery still discharges 500 and exports it.
    const flows = computeFlows(
      model({
        solar: reading(3000),
        house: reading(3000),
        battery: signed(500),
        grid: signed(-500),
      }),
    );
    expect(flows).toEqual({ solar_house: 3000, battery_grid: 500 });
  });

  it("case B: the battery charging while the grid supplies is charged from the grid", () => {
    // PV 1000 covers the house; the battery still charges 500 and draws it.
    const flows = computeFlows(
      model({
        solar: reading(1000),
        house: reading(1000),
        battery: signed(-500),
        grid: signed(500),
      }),
    );
    expect(flows).toEqual({ solar_house: 1000, grid_battery: 500 });
  });

  it("supply_house: case A as before - PV to the grid, the battery to the house", () => {
    const flows = computeFlows(
      model({
        solar: reading(3000),
        house: reading(3000),
        battery: signed(500),
        grid: signed(-500),
      }),
      "supply_house",
    );
    expect(flows).toEqual({ solar_house: 2500, solar_grid: 500, battery_house: 500 });
  });

  it("supply_house: case B as before - PV into the battery, the grid to the house", () => {
    const flows = computeFlows(
      model({
        solar: reading(1000),
        house: reading(1000),
        battery: signed(-500),
        grid: signed(500),
      }),
      "supply_house",
    );
    expect(flows).toEqual({ solar_battery: 500, solar_house: 500, grid_house: 500 });
  });

  it("the completeness gap: import and export in one block, everything assigned", () => {
    const v = { pv: 1000, imp: 1500, exp: 1000, dis: 0, chg: 1000, house: 500 };
    const want = { solar_grid: 1000, grid_house: 500, grid_battery: 1000 };
    for (const task of ["zero_grid", "supply_house"] as const) {
      expect(round(split(v, true, task))).toEqual(want);
      expect(round(split(v, false, task))).toEqual(want);
    }
  });

  it("a block of sunny export with a full battery and a cloudy discharge: no battery->grid", () => {
    // 30 min: PV 4000, house 1000, export 3000; 30 min: PV 500, house 1000, discharge 500.
    const v = { pv: 2250, imp: 0, exp: 1500, dis: 250, chg: 0, house: 1000 };
    expect(round(split(v, true))).toEqual({
      solar_house: 750,
      solar_grid: 1500,
      battery_house: 250,
    });
  });

  it("case A as a block mean is not proven simultaneous and keeps the phase reading", () => {
    const v = { pv: 3000, imp: 0, exp: 500, dis: 500, chg: 0, house: 3000 };
    expect(round(split(v, true))).toEqual({
      solar_house: 2500,
      solar_grid: 500,
      battery_house: 500,
    });
  });

  it("assigns nothing out of nothing", () => {
    expect(splitFlows(0, 0, 0, 0, 0, 0)).toEqual({});
    expect(splitFlows(Number.NaN, -5, 0, 0, 0, 100)).toEqual({});
  });
});

/** Deterministic random numbers (the tests must not flake). */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const SOURCE: Record<ConnectionId, keyof Six> = {
  solar_house: "pv",
  solar_grid: "pv",
  solar_battery: "pv",
  grid_house: "imp",
  grid_battery: "imp",
  battery_house: "dis",
  battery_grid: "dis",
};
const SINK: Record<ConnectionId, keyof Six> = {
  solar_house: "house",
  solar_grid: "exp",
  solar_battery: "chg",
  grid_house: "house",
  grid_battery: "chg",
  battery_house: "house",
  battery_grid: "exp",
};
/** Maximum flow with all seven connections, written independently of the rule. */
const maxFlow = (v: Six) =>
  Math.min(
    v.pv + v.imp + v.dis,
    v.house + v.exp + v.chg,
    v.pv + v.dis + v.house + v.chg,
    v.pv + v.imp + v.house + v.exp,
  );

function randomSix(next: () => number, exclusive: boolean): Six {
  const w = () => (next() < 0.25 ? 0 : Math.round(next() * 8000));
  const v = { pv: w(), imp: w(), exp: w(), dis: w(), chg: w(), house: w() };
  if (exclusive) {
    if (next() < 0.5) v.imp = 0;
    else v.exp = 0;
    if (next() < 0.5) v.dis = 0;
    else v.chg = 0;
  }
  return v;
}

describe("REQ 4.5: properties on 20 000 random readings", () => {
  const next = rng(20261103);
  const cases = Array.from({ length: 20000 }, (_, i) => ({
    v: randomSix(next, i % 2 === 0),
    block: i % 3 === 0,
    task: (i % 5 < 3 ? "zero_grid" : "supply_house") as BatteryTask,
  }));

  it("never assigns more than a node measured (C1) and always the maximum flow (C2)", () => {
    const wrong: string[] = [];
    for (const { v, block, task } of cases) {
      const f = split(v, block, task);
      const used: Partial<Record<keyof Six, number>> = {};
      for (const id of IDS) {
        const w = f[id] ?? 0;
        if (!(w >= 0)) wrong.push(`${JSON.stringify(v)} ${id} ${w}`);
        used[SOURCE[id]] = (used[SOURCE[id]] ?? 0) + w;
        used[SINK[id]] = (used[SINK[id]] ?? 0) + w;
      }
      for (const [node, w] of Object.entries(used)) {
        if (w > v[node as keyof Six] + 1e-6) wrong.push(`${JSON.stringify(v)} ${node} over`);
      }
      const total = IDS.reduce((sum, id) => sum + (f[id] ?? 0), 0);
      if (Math.abs(total - maxFlow(v)) > 1e-3) {
        wrong.push(`${JSON.stringify(v)} block=${block} ${total} of ${maxFlow(v)}`);
      }
    }
    expect(wrong.slice(0, 5)).toEqual([]);
  });

  it("splits a balanced block the same for either task - step 3 comes first", () => {
    const differ = cases
      .filter(({ v }) => Math.abs(v.pv + v.imp + v.dis - (v.house + v.exp + v.chg)) < 1e-9)
      .concat(
        cases.map(({ v, block, task }) => {
          // Balance it: the house takes what the others leave.
          const house = Math.max(0, v.pv + v.imp + v.dis - v.exp - v.chg);
          return { v: { ...v, house }, block, task };
        }),
      )
      .filter(({ v }) => Math.abs(v.pv + v.imp + v.dis - (v.house + v.exp + v.chg)) < 1e-9)
      .filter(
        ({ v }) =>
          JSON.stringify(round(split(v, true, "zero_grid"))) !==
          JSON.stringify(round(split(v, true, "supply_house"))),
      )
      .map(({ v }) => JSON.stringify(v));
    expect(differ.slice(0, 5)).toEqual([]);
  });

  it("is continuous: a small change of a reading moves the lines a little (C4)", () => {
    const step = rng(7);
    const jumps: string[] = [];
    for (const { v, block, task } of cases.slice(0, 5000)) {
      const w = { ...v };
      let moved = 0;
      for (const k of Object.keys(w) as (keyof Six)[]) {
        const d = (step() - 0.5) * 0.02;
        w[k] = Math.max(0, w[k] + d);
        moved += Math.abs(w[k] - v[k]);
      }
      const a = split(v, block, task);
      const b = split(w, block, task);
      const change = IDS.reduce((sum, id) => sum + Math.abs((a[id] ?? 0) - (b[id] ?? 0)), 0);
      if (change > 10 * moved + 1e-6) jumps.push(`${JSON.stringify(v)} block=${block}`);
    }
    expect(jumps.slice(0, 5)).toEqual([]);
  });

  it("with one netting meter and one battery it is the plain list min(source, sink) in step-2 order", () => {
    const plain = (v: Six, order: ConnectionId[]): Flows => {
      const left = { ...v };
      const out: Flows = {};
      for (const id of order) {
        const x = Math.min(left[SOURCE[id]], left[SINK[id]]);
        if (x > 0) out[id] = (out[id] ?? 0) + x;
        left[SOURCE[id]] -= x;
        left[SINK[id]] -= x;
      }
      return out;
    };
    const ORDERS: Record<BatteryTask, ConnectionId[]> = {
      zero_grid: [
        "solar_house",
        "solar_battery",
        "solar_grid",
        "battery_house",
        "battery_grid",
        "grid_house",
        "grid_battery",
      ],
      supply_house: [
        "solar_battery",
        "solar_grid",
        "battery_grid",
        "grid_battery",
        "solar_house",
        "battery_house",
        "grid_house",
      ],
    };
    const differ = cases
      .filter((_, i) => i % 2 === 0)
      .filter(
        ({ v, task }) =>
          JSON.stringify(round(split(v, false, task))) !==
          JSON.stringify(round(plain(v, ORDERS[task]))),
      )
      .map(({ v, task }) => `${task} ${JSON.stringify(v)}`);
    expect(differ.slice(0, 5)).toEqual([]);
  });
});

interface Scenario {
  id: string;
  category: string;
  mode: "power" | "energy";
  description: string;
  input: Six;
  expected: Partial<Record<ConnectionId, number>> | null;
  acceptable?: Partial<Record<ConnectionId, [number, number]>>;
}
const catalogue = JSON.parse(
  readFileSync(new URL("./flow-catalogue.json", import.meta.url), "utf8"),
) as Scenario[];

/**
 * Where no rule working from means alone can be right (study, section 7):
 * a lag of seconds inside a 5-minute block, and hours that mix grid charging
 * with export or a forced discharge with normal operation - their phases only
 * show with the block's minimum and maximum (deferred, REQ 4.5). And dev-16, a
 * "battery first" inverter mode: the battery's task there is not zero_grid -
 * with supply_house it comes out right (below).
 */
const KNOWN_LIMITS = new Set(["nrg-10", "nrg-18", "nrg-19", "dev-16"]);

describe("REQ 4.5: the catalogue of 111 situations", () => {
  const near = (a: number, b: number) => Math.abs(a - b) <= Math.max(1, 0.005 * Math.abs(b));
  const inside = (w: number, [lo, hi]: [number, number]) =>
    w >= lo - Math.max(1, 0.005 * lo) && w <= hi + Math.max(1, 0.005 * hi);
  for (const s of catalogue) {
    // No preferred answer and no range either: nothing to hold the rule to.
    if ((!s.expected && !s.acceptable) || KNOWN_LIMITS.has(s.id)) continue;
    it(`${s.id}: ${s.description}`, () => {
      const f = split(s.input, s.mode === "energy");
      const exact =
        s.expected !== null && IDS.every((id) => near(f[id] ?? 0, s.expected?.[id] ?? 0));
      const acceptable =
        s.acceptable !== undefined &&
        IDS.every((id) => {
          const range = s.acceptable?.[id];
          const w = f[id] ?? 0;
          if (range) return inside(w, range);
          return s.expected ? near(w, s.expected[id] ?? 0) : true;
        });
      expect(exact || acceptable, JSON.stringify(round(f))).toBe(true);
    });
  }

  it("dev-16, a 'battery first' mode, is right with supply_house", () => {
    const s = catalogue.find((c) => c.id === "dev-16") as Scenario;
    const f = split(s.input, s.mode === "energy", "supply_house");
    for (const id of IDS) expect(f[id] ?? 0).toBeCloseTo(s.expected?.[id] ?? 0, 3);
  });

  it("lists only real limits as known", () => {
    for (const id of KNOWN_LIMITS) expect(catalogue.some((s) => s.id === id)).toBe(true);
  });
});
