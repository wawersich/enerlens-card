/**
 * How the energy mode hands its figures to the drawing (REQ EM-7, EM-8).
 */
import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import { type EnergyView, energyConfig } from "../src/energy-view";
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
