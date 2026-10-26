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
