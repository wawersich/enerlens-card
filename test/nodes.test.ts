/**
 * Node labels and colours around the flow threshold (REQ K-3, K-4, P-1).
 * A grid at 4 W of export shows "0.00 kW" - a state word next to that is
 * noise, so the word and the colour only appear from flow.min_w upwards.
 */
import { describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
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
  entities: { solar: "sensor.s", grid: "sensor.g", house: "sensor.h", battery: "sensor.b" },
  flow: { min_w: 10 },
});

function views(values: Record<string, number>) {
  const hass = hassWith(values);
  const all = buildNodeViews(buildModel(hass, config), config, hass);
  return {
    grid: all.find((v) => v.key === "grid"),
    battery: all.find((v) => v.key === "battery"),
  };
}

describe("state words around flow.min_w", () => {
  it("shows no state word for a trickle below the threshold", () => {
    const { grid, battery } = views({
      "sensor.s": 0,
      "sensor.g": -4,
      "sensor.h": 500,
      "sensor.b": 6,
    });
    expect(grid?.label).toBe("Netz");
    expect(grid?.color).toBe("var(--el-line)");
    expect(battery?.label).toBe("Batterie");
    expect(battery?.color).toBe("var(--el-line)");
  });

  it("shows the state word from the threshold on", () => {
    const { grid, battery } = views({
      "sensor.s": 0,
      "sensor.g": -10,
      "sensor.h": 500,
      "sensor.b": 10,
    });
    expect(grid?.label).toBe("Netz · Einspeisung");
    expect(grid?.color).toBe(config.colors.grid_export);
    expect(battery?.label).toBe("Batterie · entlädt");
    expect(battery?.color).toBe(config.colors.battery_discharge);
  });

  it("still shows the figure itself below the threshold (REQ K-3: magnitude)", () => {
    const { grid } = views({ "sensor.s": 0, "sensor.g": -4, "sensor.h": 500, "sensor.b": 0 });
    expect(grid?.value).toBe("0,00 kW");
  });
});
