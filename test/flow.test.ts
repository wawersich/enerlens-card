import { describe, expect, it } from "vitest";
import { computeFlows, planDots } from "../src/flow";
import type { Config, ConnectionId, Flows, Model, Reading, Signed } from "../src/types";

// Test data is built by hand: config.ts and model.ts are implemented in
// parallel and only their types are imported here.

const unavailable: Reading = { available: false, derived: false };

function reading(w: number): Reading {
  return { available: true, w, derived: false };
}

function signed(net: number): Signed {
  return {
    available: true,
    positive: Math.max(0, net),
    negative: Math.max(0, -net),
    net,
    derived: false,
  };
}

const unavailableSigned: Signed = { available: false, derived: false };

function model(over: Partial<Model> = {}): Model {
  return {
    solar: reading(0),
    grid: signed(0),
    battery: signed(0),
    soc: unavailable,
    house: reading(0),
    consumers: [],
    ...over,
  };
}

/** REQ P-3 defaults: S1 500, S2 2000, S3 6000, max_dots 5, slow 5 s, fast 1.8 s. */
function config(over: Partial<Config["flow"]> = {}): Config {
  return {
    sources: {
      solar: { kind: "absent" },
      grid: { kind: "absent" },
      battery: { kind: "absent" },
      house: { kind: "absent" },
    },
    consumers: [],
    minConsumerW: 10,
    maxConsumers: Number.POSITIVE_INFINITY,
    updateIntervalS: 5,
    list: { enabled: true },
    ring: { enabled: true },
    view: {
      defaultMode: "current",
      avgShortMinutes: 5,
      avgLongMinutes: 15,
      showSelector: true,
      remember: true,
    },
    flow: {
      minW: 10,
      slowBelowW: 500,
      moreDotsAboveW: 2000,
      maxDotsAtW: 6000,
      maxDots: 5,
      slowS: 5,
      fastS: 1.8,
      animation: "auto",
      ...over,
    },
    colors: {
      solar: "solar",
      house: "house",
      grid_import: "grid_import",
      grid_export: "grid_export",
      battery_charge: "battery_charge",
      battery_discharge: "battery_discharge",
      rest: "rest",
      socStops: [
        { at: 0, color: "#e53935" },
        { at: 100, color: "#43a047" },
      ],
      consumerPalette: ["#7e57c2"],
    },
    icons: {},
  };
}

/** Runs one connection at `w` through the dot rule. */
function plan(w: number, over: Partial<Config["flow"]> = {}) {
  return planDots({ solar_house: w }, config(over))[0];
}

describe("computeFlows (REQ 4.5)", () => {
  it("sends surplus PV to the battery first, then the grid", () => {
    // PV 5000, house 1000, charging 3000 -> 1000 left for export.
    const flows = computeFlows(
      model({
        solar: reading(5000),
        house: reading(1000),
        battery: signed(-3000),
        grid: signed(-1000),
      }),
    );
    expect(flows).toEqual({ solar_battery: 3000, solar_grid: 1000, solar_house: 1000 });
  });

  it("covers the house from PV before battery before grid", () => {
    const flows = computeFlows(
      model({
        solar: reading(500),
        house: reading(2000),
        battery: signed(1000),
        grid: signed(500),
      }),
    );
    expect(flows).toEqual({ solar_house: 500, battery_house: 1000, grid_house: 500 });
  });

  it("charges the battery from the grid when PV is exhausted (step 4)", () => {
    const flows = computeFlows(
      model({ solar: reading(0), house: reading(200), battery: signed(-800), grid: signed(1000) }),
    );
    expect(flows).toEqual({ grid_battery: 800, grid_house: 200 });
  });

  it("exports from the battery when PV cannot fill the export (step 3)", () => {
    const flows = computeFlows(
      model({ solar: reading(0), house: reading(0), battery: signed(700), grid: signed(-700) }),
    );
    expect(flows).toEqual({ battery_grid: 700 });
  });

  it("prefers PV over the battery for export (step 2 before step 3)", () => {
    const flows = computeFlows(
      model({ solar: reading(400), house: reading(0), battery: signed(600), grid: signed(-1000) }),
    );
    expect(flows).toEqual({ solar_grid: 400, battery_grid: 600 });
  });

  it("treats unavailable quantities as 0", () => {
    const flows = computeFlows(
      model({
        solar: unavailable,
        house: reading(1500),
        battery: unavailableSigned,
        grid: signed(1500),
      }),
    );
    expect(flows).toEqual({ grid_house: 1500 });
  });

  it("works without a battery", () => {
    const flows = computeFlows(
      model({ solar: reading(2000), house: reading(1200), battery: null, grid: signed(-800) }),
    );
    expect(flows).toEqual({ solar_grid: 800, solar_house: 1200 });
  });

  it("omits connections carrying 0 W", () => {
    expect(computeFlows(model())).toEqual({});
  });

  it("never drives both directions of a connection (invariant of REQ P-2)", () => {
    const opposites: [ConnectionId, ConnectionId][] = [["grid_battery", "battery_grid"]];
    const values = [-4000, -1500, -300, 0, 300, 1500, 4000];
    for (const pv of [0, 500, 3000, 9000]) {
      for (const gridNet of values) {
        for (const batteryNet of values) {
          for (const house of [0, 800, 3500]) {
            const flows = computeFlows(
              model({
                solar: reading(pv),
                grid: signed(gridNet),
                battery: signed(batteryNet),
                house: reading(house),
              }),
            );
            for (const [a, b] of opposites) {
              expect(flows[a] === undefined || flows[b] === undefined).toBe(true);
            }
            for (const w of Object.values(flows)) expect(w).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it("never routes more than a source holds", () => {
    const flows = computeFlows(
      model({
        solar: reading(1000),
        grid: signed(-5000),
        battery: signed(-5000),
        house: reading(5000),
      }),
    );
    const fromPv = (flows.solar_battery ?? 0) + (flows.solar_grid ?? 0) + (flows.solar_house ?? 0);
    expect(fromPv).toBeLessThanOrEqual(1000);
  });
});

describe("planDots - Abnahme P (REQ 4.6, P-3)", () => {
  it("5 W -> no dots, connection inactive", () => {
    expect(planDots({ solar_house: 5 }, config())).toEqual([]);
  });

  it("exactly 10 W -> 1 dot (boundary is inclusive)", () => {
    expect(plan(10).count).toBe(1);
  });

  it("300 W -> 1 dot, 5.00 s", () => {
    expect(plan(300).count).toBe(1);
    expect(plan(300).durationS).toBeCloseTo(5.0, 2);
  });

  it("exactly 500 W -> 1 dot, 5.00 s", () => {
    expect(plan(500).count).toBe(1);
    expect(plan(500).durationS).toBeCloseTo(5.0, 2);
  });

  it("1200 W -> 1 dot, 3.51 s", () => {
    expect(plan(1200).count).toBe(1);
    expect(Math.abs(plan(1200).durationS - 3.51)).toBeLessThanOrEqual(0.05);
  });

  it("exactly 2000 W -> 2 dots, 1.80 s", () => {
    expect(plan(2000).count).toBe(2);
    expect(Math.abs(plan(2000).durationS - 1.8)).toBeLessThanOrEqual(0.05);
  });

  it("4000 W -> 3 dots, 1.80 s", () => {
    expect(plan(4000).count).toBe(3);
    expect(Math.abs(plan(4000).durationS - 1.8)).toBeLessThanOrEqual(0.05);
  });

  it("6000 W -> 5 dots", () => {
    expect(plan(6000).count).toBe(5);
  });

  it("9000 W -> 5 dots (capped by max_dots)", () => {
    expect(plan(9000).count).toBe(5);
  });
});

describe("planDots (REQ 4.6, P-4)", () => {
  it("drops connections below flow.minW", () => {
    const flows: Flows = { solar_house: 9, grid_house: 10 };
    expect(planDots(flows, config()).map((p) => p.connection)).toEqual(["grid_house"]);
  });

  it("assigns the colour of the flow state (REQ P-4)", () => {
    const flows: Flows = {
      solar_house: 100,
      solar_grid: 100,
      solar_battery: 100,
      grid_house: 100,
      grid_battery: 100,
      battery_house: 100,
      battery_grid: 100,
    };
    const byConnection = Object.fromEntries(
      planDots(flows, config()).map((p) => [p.connection, p.colorKey]),
    );
    expect(byConnection).toEqual({
      solar_house: "solar",
      solar_grid: "grid_export",
      battery_grid: "grid_export",
      solar_battery: "battery_charge",
      grid_house: "grid_import",
      grid_battery: "grid_import",
      battery_house: "battery_discharge",
    });
  });

  it("uses floor, not round, for the dot count", () => {
    // 3300 W -> 2 + floor(0.325 * 3) = 2 + floor(0.975) = 2; round would give 3.
    expect(plan(3300).count).toBe(2);
    // 4600 W -> 2 + floor(0.65 * 3) = 2 + floor(1.95) = 3; round would give 4.
    expect(plan(4600).count).toBe(3);
  });

  it("respects max_dots", () => {
    expect(plan(9000, { maxDots: 3 }).count).toBe(3);
  });

  it("interpolates the duration linearly between S1 and S2", () => {
    // Midpoint 1250 W -> 5 - 0.5 * 3.2 = 3.4 s.
    expect(plan(1250).durationS).toBeCloseTo(3.4, 6);
  });

  it("carries the watts through", () => {
    expect(plan(1234).w).toBe(1234);
  });

  it("keeps every connection at or above minW", () => {
    expect(planDots({ solar_house: 10 }, config({ minW: 0 })).length).toBe(1);
    expect(planDots({ solar_house: 0 }, config({ minW: 0 })).length).toBe(1);
  });
});
