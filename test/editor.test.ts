// @vitest-environment happy-dom
/**
 * The editor's job is not to lose configuration. Every form a balance quantity
 * can take in YAML must survive the round trip form -> YAML -> form, and a
 * source the user picked must stay put while the fields under it are still
 * empty (REQ E-1, A-1, A-5, G-5).
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { HomeAssistant, RawConfig } from "../src/types";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  shadowRoot: ShadowRoot | null;
};

type Field = { name?: string; type?: string; schema?: Field[]; selector?: Record<string, unknown> };
type Form = HTMLElement & { data: Record<string, unknown>; schema: Field[] };

const hass = {
  states: {},
  locale: { language: "de", number_format: "language" as const },
  language: "de",
  callWS: async () => ({}) as never,
} as HomeAssistant;

/** The reference installation's shape: no signed battery sensor, two entities. */
const SPLIT_BATTERY: RawConfig = {
  type: "custom:enerlens-card",
  entities: {
    solar: "sensor.solar",
    grid: "sensor.grid",
    house: "sensor.house",
    battery: { discharge: "sensor.bat_out", charge: "sensor.bat_in" },
    battery_soc: "sensor.soc",
  },
  update_interval_s: 5,
};

async function mount(config: RawConfig): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = hass;
  el.setConfig(config);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const form = (el: Editor): Form => el.shadowRoot?.querySelector("ha-form") as Form;

/** Names of all fields under "entities", grids flattened. */
function entityFields(el: Editor): string[] {
  const group = form(el).schema.find((g) => g.name === "entities");
  const names: string[] = [];
  const walk = (fields: Field[]) => {
    for (const f of fields) {
      if (f.schema) walk(f.schema);
      else if (f.name) names.push(f.name);
    }
  };
  walk(group?.schema ?? []);
  return names;
}

function sourceOptions(el: Editor, quantity: string): string[] {
  const group = form(el).schema.find((g) => g.name === "entities");
  const field = group?.schema?.find((f) => f.name === `${quantity}_source`);
  const select = field?.selector?.select as { options: Array<{ value: string }> };
  return select.options.map((o) => o.value);
}

/** Reproduces what ha-form emits when a field changes, then the echo HA sends
 *  back through setConfig. Returns the emitted config. */
async function change(el: Editor, patch: Record<string, unknown>): Promise<RawConfig> {
  let saved: RawConfig | undefined;
  const listener = (ev: Event) => {
    saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
  };
  el.addEventListener("config-changed", listener);
  form(el).dispatchEvent(
    new CustomEvent("value-changed", { detail: { value: { ...form(el).data, ...patch } } }),
  );
  el.removeEventListener("config-changed", listener);
  if (!saved) throw new Error("no config-changed event");
  el.setConfig(saved);
  await el.updateComplete;
  return saved;
}

describe("editor", () => {
  beforeAll(async () => {
    await import("../src/editor");
  });

  describe("reading a configuration", () => {
    it("recognises a split battery and shows its two pickers", async () => {
      const el = await mount(SPLIT_BATTERY);
      expect(form(el).data.battery_source).toBe("split");
      expect(form(el).data.battery_discharge).toBe("sensor.bat_out");
      expect(form(el).data.battery_charge).toBe("sensor.bat_in");
      const names = entityFields(el);
      expect(names).toContain("battery_discharge");
      expect(names).toContain("battery_charge");
      // The single-entity picker is not offered next to the split one.
      expect(names).not.toContain("battery");
    });

    it("recognises an inverted entity", async () => {
      const el = await mount({
        type: "custom:enerlens-card",
        entities: { solar: "sensor.solar", grid: { entity: "sensor.grid", invert: true } },
      });
      expect(form(el).data.grid_source).toBe("entity");
      expect(form(el).data.grid).toBe("sensor.grid");
      expect(form(el).data.grid_invert).toBe(true);
    });

    it("reads a missing house as derived and a missing battery as none", async () => {
      const el = await mount({
        type: "custom:enerlens-card",
        entities: { solar: "sensor.solar", grid: "sensor.grid" },
      });
      expect(form(el).data.house_source).toBe("derived");
      expect(form(el).data.battery_source).toBe("none");
      // No battery, nothing to pick a state of charge for (REQ A-5).
      expect(entityFields(el)).not.toContain("battery_soc");
    });

    it("offers derived only once (REQ A-1)", async () => {
      const el = await mount({
        type: "custom:enerlens-card",
        entities: { solar: "sensor.solar", grid: "derived", house: "sensor.house" },
      });
      expect(sourceOptions(el, "grid")).toContain("derived");
      expect(sourceOptions(el, "house")).not.toContain("derived");
      expect(sourceOptions(el, "battery")).not.toContain("derived");
    });
  });

  describe("writing a configuration", () => {
    it("keeps the split battery when something else is saved (REQ E-1)", async () => {
      const el = await mount(SPLIT_BATTERY);
      const saved = await change(el, { update_interval_s: 10 });
      expect(saved.update_interval_s).toBe(10);
      expect(saved.entities?.battery).toEqual({
        discharge: "sensor.bat_out",
        charge: "sensor.bat_in",
      });
    });

    it("writes the inverted form only when the switch is on", async () => {
      const el = await mount({
        type: "custom:enerlens-card",
        entities: { solar: "sensor.solar", grid: "sensor.grid" },
      });
      let saved = await change(el, { grid_invert: true });
      expect(saved.entities?.grid).toEqual({ entity: "sensor.grid", invert: true });
      saved = await change(el, { grid_invert: false });
      // Back to the plain string - no {entity, invert: false} clutter in the YAML.
      expect(saved.entities?.grid).toBe("sensor.grid");
    });

    it("builds a split grid from its two pickers", async () => {
      const el = await mount({
        type: "custom:enerlens-card",
        entities: { solar: "sensor.solar", grid: "sensor.grid" },
      });
      await change(el, { grid_source: "split" });
      const saved = await change(el, { grid_import: "sensor.in", grid_export: "sensor.out" });
      expect(saved.entities?.grid).toEqual({ import: "sensor.in", export: "sensor.out" });
    });

    it("writes derived explicitly, except for the house", async () => {
      const el = await mount({
        type: "custom:enerlens-card",
        entities: { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" },
      });
      let saved = await change(el, { battery_source: "derived" });
      expect(saved.entities?.battery).toBe("derived");
      saved = await change(el, { battery_source: "none", house_source: "derived" });
      expect(saved.entities?.battery).toBeUndefined();
      expect(saved.entities?.house).toBeUndefined();
    });

    it("drops the state of charge with the battery", async () => {
      const el = await mount(SPLIT_BATTERY);
      const saved = await change(el, { battery_source: "none" });
      expect(saved.entities?.battery).toBeUndefined();
      expect(saved.entities?.battery_soc).toBeUndefined();
    });
  });

  describe("form state", () => {
    it("keeps a chosen source while its fields are still empty", async () => {
      const el = await mount({
        type: "custom:enerlens-card",
        entities: { solar: "sensor.solar", grid: "sensor.grid" },
      });
      const saved = await change(el, { battery_source: "split" });
      // Nothing to write yet - but the form must not snap back to "none".
      expect(saved.entities?.battery).toBeUndefined();
      expect(form(el).data.battery_source).toBe("split");
      expect(entityFields(el)).toContain("battery_discharge");
    });

    it("keeps a half-filled split in the form until both pickers are set", async () => {
      const el = await mount({
        type: "custom:enerlens-card",
        entities: { solar: "sensor.solar", grid: "sensor.grid" },
      });
      await change(el, { battery_source: "split" });
      const saved = await change(el, { battery_discharge: "sensor.bat_out" });
      expect(saved.entities?.battery).toBeUndefined();
      expect(form(el).data.battery_discharge).toBe("sensor.bat_out");
    });

    it("takes an outside edit over its own state", async () => {
      const el = await mount(SPLIT_BATTERY);
      await change(el, { battery_source: "entity" });
      // The YAML editor hands back something we did not emit.
      el.setConfig({ ...SPLIT_BATTERY, entities: { ...SPLIT_BATTERY.entities, grid: "derived" } });
      await el.updateComplete;
      expect(form(el).data.battery_source).toBe("split");
      expect(form(el).data.grid_source).toBe("derived");
    });
  });

  it("round-trips every source form unchanged", async () => {
    const config: RawConfig = {
      type: "custom:enerlens-card",
      entities: {
        solar: { entity: "sensor.solar", invert: true },
        grid: { import: "sensor.in", export: "sensor.out" },
        house: "derived",
        battery: { discharge: "sensor.bat_out", charge: "sensor.bat_in" },
        battery_soc: "sensor.soc",
      },
    };
    const el = await mount(config);
    const saved = await change(el, { title: "x" });
    // house: "derived" is written as absence (REQ A-1); everything else verbatim.
    expect(saved.entities).toEqual({ ...config.entities, house: undefined });
  });
});

describe("editor - colours, icons and thresholds", () => {
  it("round-trips colours and icons, leaving soc_stops alone", async () => {
    const config: RawConfig = {
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar", grid: "sensor.grid" },
      colors: {
        grid_export: "#43a047",
        soc_stops: [
          { at: 0, color: "#f00" },
          { at: 100, color: "#0f0" },
        ],
      },
      icons: { house: "mdi:home-lightning-bolt" },
    };
    const el = await mount(config);
    expect(form(el).data.color_grid_export).toBe("#43a047");
    expect(form(el).data.icon_house).toBe("mdi:home-lightning-bolt");
    const saved = await change(el, { color_solar: "var(--warning-color)", icon_grid: "mdi:flash" });
    expect(saved.colors).toEqual({
      grid_export: "#43a047",
      solar: "var(--warning-color)",
      soc_stops: config.colors?.soc_stops,
    });
    expect(saved.icons).toEqual({ house: "mdi:home-lightning-bolt", grid: "mdi:flash" });
  });

  it("drops the colours block entirely when the last colour is cleared", async () => {
    const el = await mount({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar", grid: "sensor.grid" },
      colors: { rest: "#999" },
    });
    const saved = await change(el, { color_rest: "" });
    expect(saved.colors).toBeUndefined();
  });

  it("writes flow.min_w next to the other flow options", async () => {
    const el = await mount({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar", grid: "sensor.grid" },
      flow: { inactive_lines: "dim" },
    });
    const saved = await change(el, { min_w: 25 });
    expect(saved.flow).toEqual({ inactive_lines: "dim", min_w: 25 });
  });
});
