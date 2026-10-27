import { describe, expect, it } from "vitest";
import { arrowColor } from "../src/colors";
import { normalizeConfig } from "../src/config";
import type { RawConfig } from "../src/types";

/* The arrows' colour (REQ C-8): red in, green out - or each its direction's. */

const base = { type: "custom:enerlens-card", entities: { solar: "sensor.pv", grid: "sensor.g" } };
const RED = "var(--error-color, #db4437)";
const GREEN = "var(--success-color, #43a047)";

describe("C-8: colors.arrows", () => {
  it("red and green by default: import and discharge red, export and charge green", () => {
    const config = normalizeConfig(base);
    expect(config.colors.arrows).toBe("red_green");
    expect(arrowColor(config, "grid_import")).toBe(RED);
    expect(arrowColor(config, "battery_discharge")).toBe(RED);
    expect(arrowColor(config, "grid_export")).toBe(GREEN);
    expect(arrowColor(config, "battery_charge")).toBe(GREEN);
  });

  it("direction: each arrow in its direction's colour, own colours included", () => {
    const config = normalizeConfig({
      ...base,
      colors: { arrows: "direction", grid_export: "#123456" },
    } as RawConfig);
    expect(arrowColor(config, "grid_export")).toBe("#123456");
    expect(arrowColor(config, "grid_import")).toBe(config.colors.grid_import);
    expect(arrowColor(config, "battery_charge")).toBe(config.colors.battery_charge);
  });

  it("an unknown value: a warning and the default, never an error card (E-1)", () => {
    const warn = console.warn;
    const said: unknown[] = [];
    console.warn = (...a: unknown[]) => said.push(a);
    try {
      const config = normalizeConfig({
        ...base,
        colors: { arrows: "blue" },
      } as unknown as RawConfig);
      expect(config.colors.arrows).toBe("red_green");
      expect(said).toHaveLength(1);
    } finally {
      console.warn = warn;
    }
  });
});
