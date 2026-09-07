/**
 * Acceptance items from REQ section 5 that need no browser: the derived battery
 * in the two reference scenarios, checked end to end through config, model,
 * flows and node labels.
 */
import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import { computeFlows } from "../src/flow";
import { buildModel } from "../src/model";
import { buildNodeViews } from "../src/render/cross";
import type { HomeAssistant } from "../src/types";

function hassWith(values: Record<string, number>): HomeAssistant {
  const states: HomeAssistant["states"] = {};
  for (const [id, w] of Object.entries(values)) {
    states[id] = {
      entity_id: id,
      state: String(w),
      attributes: { unit_of_measurement: "W", device_class: "power" },
      last_changed: "",
      last_updated: "",
    } as HomeAssistant["states"][string];
  }
  return {
    states,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  } as HomeAssistant;
}

const config = normalizeConfig({
  type: "custom:enerlens-card",
  entities: { solar: "sensor.s", grid: "sensor.g", house: "sensor.h", battery: "derived" },
});

describe("battery: derived (REQ section 5, A-1, A-2, E-2)", () => {
  it("night: PV 0, grid +420 W, house 1520 W -> discharging 1100 W, battery -> house", () => {
    const hass = hassWith({ "sensor.s": 0, "sensor.g": 420, "sensor.h": 1520 });
    const model = buildModel(hass, config);
    const battery = model.battery;
    if (!battery?.available) throw new Error("battery should be available");
    expect(battery.derived).toBe(true);
    expect(battery.net).toBe(1100);

    const flows = computeFlows(model);
    expect(flows.battery_house).toBe(1100);
    expect(flows.grid_house).toBe(420);
    expect(flows.solar_battery).toBeUndefined();

    const view = buildNodeViews(model, config, hass).find((v) => v.key === "battery");
    expect(view?.label).toBe("Batterie · entlädt");
    expect(view?.value).toBe("1,10 kW");
    expect(view?.derived).toBe(true);
    // Derived: nothing to open (REQ A-3, I-4).
    expect(view?.entity).toBeUndefined();
  });

  it("day: PV 5000 W, grid -3000 W, house 800 W -> charging 1200 W, PV -> battery", () => {
    const hass = hassWith({ "sensor.s": 5000, "sensor.g": -3000, "sensor.h": 800 });
    const model = buildModel(hass, config);
    if (!model.battery?.available) throw new Error("battery should be available");
    expect(model.battery.net).toBe(-1200);

    const flows = computeFlows(model);
    expect(flows.solar_battery).toBe(1200);
    expect(flows.solar_grid).toBe(3000);
    expect(flows.solar_house).toBe(800);
    expect(flows.battery_house).toBeUndefined();

    const battery = buildNodeViews(model, config, hass).find((v) => v.key === "battery");
    expect(battery?.label).toBe("Batterie · lädt");
  });

  it("goes unavailable with any input (REQ A-4)", () => {
    const hass = hassWith({ "sensor.s": 0, "sensor.h": 1520 });
    const model = buildModel(hass, config);
    expect(model.battery?.available).toBe(false);
  });
});
