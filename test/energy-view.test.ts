/**
 * How the energy mode hands its figures to the drawing (REQ EM-7, EM-8).
 */
import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import {
  type EnergyView,
  energyConfig,
  energyEntities,
  energyKey,
  mainEntities,
  toView,
} from "../src/energy-view";
import type { RawConfig } from "../src/types";

const config = normalizeConfig({
  type: "custom:enerlens-card",
  entities: { solar: "sensor.pv", grid: { import: "sensor.i", export: "sensor.e" } },
  consumers: [{ entity: "sensor.heat", min_w: 40 }],
  min_consumer_w: 10,
} as RawConfig);

/** A month of 470 hours so far. */
const view = { hours: 470, marks: { roles: {}, consumers: {}, rest: { tier: 0, note: "" } } };

describe("energy config (EM-7, EM-8)", () => {
  const shown = energyConfig(config, view as unknown as EnergyView);

  it("writes figures as kWh over the period", () => {
    expect(shown.power.energyHours).toBe(470);
  });

  it("filters the list by W x 1 h", () => {
    expect(shown.minConsumerW).toBeCloseTo(10 / 470);
    expect(shown.consumers[0].minW).toBeCloseTo(40 / 470);
  });

  it("runs the dots on the mean power, with the thresholds as they are", () => {
    expect(shown.flow).toEqual(config.flow);
  });
});

describe("several PV sources in a period (PV-2)", () => {
  const sum = normalizeConfig({
    type: "custom:enerlens-card",
    entities: {
      solar: [{ entity: "sensor.roof" }, { entity: "sensor.balcony", invert: true }],
      grid: { import: "sensor.i", export: "sensor.e" },
      house: "sensor.h",
    },
    consumers: [{ entity: "sensor.heat" }],
  } as RawConfig);
  const hass = {
    states: {},
    locale: { language: "de", number_format: "language" },
    language: "de",
  };

  it("asks for every source, never for the sum, and checks them all for statistics (QB-8)", () => {
    expect([...energyEntities(sum)].sort()).toEqual([
      "sensor.balcony",
      "sensor.e",
      "sensor.h",
      "sensor.heat",
      "sensor.i",
      "sensor.roof",
    ]);
    expect(mainEntities(sum)).toEqual([
      "sensor.balcony",
      "sensor.e",
      "sensor.h",
      "sensor.i",
      "sensor.roof",
    ]);
  });

  it("a changed list of sources means a new fetch (EM-14)", () => {
    const fewer = { ...sum, solarSources: sum.solarSources.slice(0, 1) };
    expect(energyKey(fewer)).not.toBe(energyKey(sum));
  });

  it("each source a mean of its own, in its own sign; the sum its highest tier", () => {
    const view = toView(
      {
        from: 0,
        to: 10 * 3_600_000,
        lateStart: false,
        main: {
          solar: { wh: 5000, filledShare: 0.05 },
          import: { wh: 0, filledShare: 0 },
          export: { wh: 0, filledShare: 0 },
          discharge: null,
          charge: null,
          house: { wh: 5000, filledShare: 0 },
        },
        consumers: {},
        sources: {
          "sensor.roof": { wh: 4000, filledShare: 0 },
          "sensor.balcony": { wh: 1000, filledShare: 0.2 },
        },
        flows: {},
      },
      "today",
      { solar: "#pv-sum", import: "sensor.i", export: "sensor.e", house: "sensor.h" },
      new Set(["sensor.balcony"]),
      hass as never,
      10 * 3_600_000,
    );
    expect(view.meanW("sensor.roof")).toBe(400);
    // Inverted: the rows were turned, the model turns the mean back.
    expect(view.meanW("sensor.balcony")).toBe(-100);
    expect(view.marks.consumers["sensor.balcony"].tier).toBe(2);
    expect(view.marks.roles.solar?.tier).toBe(2);
  });
});

describe("a signed grid split once per period, with a balcony past the house meter (EM-8, PV-3)", () => {
  const hass = {
    states: {},
    locale: { language: "de", number_format: "language" },
    language: "de",
  };
  const run = (houseWh: number, balconyWh: number, exportWh: number, derivedHouse = false) =>
    toView(
      {
        from: 0,
        to: 10 * 3_600_000,
        lateStart: false,
        main: {
          solar: { wh: 20000 + balconyWh, filledShare: 0 },
          import: { wh: 0, filledShare: 0 },
          export: { wh: exportWh, filledShare: 0 },
          discharge: null,
          charge: null,
          house: { wh: houseWh, filledShare: 0 },
        },
        consumers: {},
        sources: {
          "sensor.roof": { wh: 20000, filledShare: 0 },
          "sensor.balcony": { wh: balconyWh, filledShare: 0 },
        },
        flows: {},
      },
      "today",
      {
        solar: "#pv-sum",
        import: "sensor.g#positive",
        export: "sensor.g#negative",
        ...(derivedHouse ? {} : { house: "sensor.h" }),
      },
      new Set(),
      hass as never,
      10 * 3_600_000,
      0,
      new Map([["sensor.g", { positive: "sensor.g#positive", negative: "sensor.g#negative" }]]),
      ["sensor.balcony"],
    );

  it("takes the house as the node shows it: the sensor plus the balcony", () => {
    // Roof 2000 W, balcony 600 W, sensor 1000 W, export 1000 W over ten hours.
    const flows = run(10000, 6000, 10000).flowsW;
    expect(flows.solar_house).toBeCloseTo(1600, 6);
    expect(flows.solar_grid).toBeCloseTo(1000, 6);
  });

  it("adds in sign and clamps once, as the node does", () => {
    // The sensor reads -100 W, the balcony gives 600 W: the house uses 500 W.
    const flows = run(-1000, 6000, 15000).flowsW;
    expect(flows.solar_house).toBeCloseTo(500, 6);
  });

  it("adds nothing to a derived house", () => {
    const flows = run(16000, 6000, 10000, true).flowsW;
    expect(flows.solar_house).toBeCloseTo(1600, 6);
  });
});

describe("the battery's task on the signed-grid path (EM-8, P-14)", () => {
  const hass = {
    states: {},
    locale: { language: "de", number_format: "language" },
    language: "de",
  };
  const run = (task: "zero_grid" | "supply_house") =>
    toView(
      {
        from: 0,
        to: 10 * 3_600_000,
        lateStart: false,
        main: {
          solar: { wh: 10000, filledShare: 0 },
          import: { wh: 0, filledShare: 0 },
          export: { wh: 5000, filledShare: 0 },
          discharge: null,
          charge: null,
          house: { wh: 10000, filledShare: 0 },
        },
        consumers: {},
        flows: {},
      },
      "today",
      {
        solar: "sensor.pv",
        import: "sensor.g#positive",
        export: "sensor.g#negative",
        house: "sensor.h",
      },
      new Set(),
      hass as never,
      10 * 3_600_000,
      0,
      new Map([["sensor.g", { positive: "sensor.g#positive", negative: "sensor.g#negative" }]]),
      [],
      task,
    ).flowsW;

  it("leaves a remainder where the task's order puts it", () => {
    // PV 1000 W, house 1000 W, export 500 W: the readings do not add up.
    expect(run("zero_grid").solar_house).toBeCloseTo(1000, 6);
    expect(run("supply_house").solar_grid).toBeCloseTo(500, 6);
    expect(run("supply_house").solar_house).toBeCloseTo(500, 6);
  });
});
