// @vitest-environment happy-dom
/**
 * The editor's job is not to lose configuration. Every form a balance quantity
 * can take in YAML must survive the round trip form -> YAML -> form, and a
 * source the user picked must stay put while the fields under it are still
 * empty (REQ E-1, A-1, A-5, G-5).
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { DEFAULT_CONSUMER_PALETTE, swatchHex } from "../src/colors";
import { normalizeConfig } from "../src/config";
import { NO_DESIGN, flowDesigns } from "../src/designs";
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

/** A field anywhere in the nested schema, by name. */
function findField(el: Editor, name: string): Field | undefined {
  let hit: Field | undefined;
  const walk = (fields: Field[]) => {
    for (const field of fields) {
      if (field.name === name && !field.schema) hit = field;
      if (field.schema) walk(field.schema);
    }
  };
  walk(form(el).schema);
  return hit;
}

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

  it("writes the switch for the list below the cross, and reads it back", async () => {
    const el = await mount({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar", grid: "sensor.grid" },
      list: { enabled: true },
    });
    const saved = await change(el, { list_always_below: true });
    expect(saved.list).toEqual({ enabled: true, always_below: true });
    expect(form(el).data.list_always_below).toBe(true);
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

describe("editor - consumer list hygiene", () => {
  it("drops cleared fields from a consumer instead of writing empty strings", async () => {
    const el = await mount({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar", grid: "sensor.grid" },
      consumers: [{ entity: "sensor.a", name: "A", icon: "mdi:fan" }],
    });
    const saved = await change(el, {
      consumers: [{ entity: "sensor.a", name: "A", icon: "", color: null }],
    });
    expect(saved.consumers).toEqual([{ entity: "sensor.a", name: "A" }]);
  });
});

describe("editor - never writes what the card would refuse (REQ E-1)", () => {
  const base: RawConfig = {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.solar", grid: "sensor.grid" },
  };

  it("holds the state of charge back until a battery entity is picked", async () => {
    const el = await mount(base);
    await change(el, { battery_source: "entity" });
    let saved = await change(el, { battery_soc: "sensor.soc" });
    // Battery not picked yet: no battery_soc in the YAML, but the form keeps it.
    expect(saved.entities?.battery_soc).toBeUndefined();
    expect(form(el).data.battery_soc).toBe("sensor.soc");
    saved = await change(el, { battery: "sensor.bat" });
    expect(saved.entities?.battery).toBe("sensor.bat");
    expect(saved.entities?.battery_soc).toBe("sensor.soc");
  });

  it("drops a consumer row without an entity and a duplicate sensor", async () => {
    const el = await mount(base);
    const saved = await change(el, {
      consumers: [{ name: "orphan" }, { entity: "sensor.a", name: "A" }, { entity: "sensor.a" }],
    });
    expect(saved.consumers).toEqual([{ entity: "sensor.a", name: "A" }]);
  });

  it("writes numbers as typed - no correction mid-keystroke", async () => {
    // Typing "1000" into a box passes through "1"; a correction on "1" would
    // lock the field. The card repairs the order at runtime instead (E-1).
    const el = await mount({ ...base, view: { avg_short_minutes: 5, avg_long_minutes: 15 } });
    const saved = await change(el, { avg_short_minutes: 30 });
    expect(saved.view).toEqual({ avg_short_minutes: 30, avg_long_minutes: 15 });
    expect(form(el).data.avg_short_minutes).toBe(30);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => normalizeConfig(saved)).not.toThrow();
    warn.mockRestore();
  });
});

describe("editor - flow design (P-10)", () => {
  const base: RawConfig = {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.solar", grid: "sensor.grid" },
  };

  it("offers every design this build carries, plus the plain dots", async () => {
    const el = await mount(base);
    const field = findField(el, "design");
    const select = field?.selector?.select as { options: { value: string }[] } | undefined;
    const values = (select?.options ?? []).map((option) => option.value);
    expect(values[0]).toBe(NO_DESIGN);
    for (const design of flowDesigns()) expect(values).toContain(design.id);
    // Every offered value has to survive the card, or the editor breaks E-1.
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const value of values) {
      const saved = await change(el, { design: value });
      expect(() => normalizeConfig(saved)).not.toThrow();
    }
    warn.mockRestore();
  });

  it("writes the chosen design and reads it back", async () => {
    const el = await mount(base);
    const design = flowDesigns()[0];
    const saved = await change(el, { design: design.id });
    expect(saved.flow?.design).toBe(design.id);
    expect(form(el).data.design).toBe(design.id);
  });
});

describe("editor - flow: peak power and fine tuning", () => {
  const base: RawConfig = {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.solar", grid: "sensor.grid" },
  };

  it("writes peak_w and the fine-tuning fields, and reads them back", async () => {
    const el = await mount({ ...base, flow: { peak_w: 3000, max_dots: 4 } });
    expect(form(el).data.peak_w).toBe(3000);
    expect(form(el).data.max_dots).toBe(4);
    const saved = await change(el, { slow_s: 6, fast_s: 2 });
    expect(saved.flow).toEqual({ peak_w: 3000, max_dots: 4, slow_s: 6, fast_s: 2 });
  });

  it("leaves an out-of-order threshold as typed; the card repairs it", async () => {
    const el = await mount({ ...base, flow: { peak_w: 3000 } });
    const saved = await change(el, { more_dots_above_w: 200, min_w: 500 });
    expect(saved.flow).toEqual({ peak_w: 3000, more_dots_above_w: 200, min_w: 500 });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const flow = normalizeConfig(saved).flow;
    expect(flow.minW).toBe(500);
    expect(flow.slowBelowW).toBe(500);
    expect(flow.moreDotsAboveW).toBe(501);
    warn.mockRestore();
  });
});

/**
 * The status entity is the one place where the user must name the states
 * themselves, so the editor has to offer them rather than assume them
 * (REQ NS-1, NS-7).
 */
describe("editor - grid status", () => {
  beforeAll(async () => {
    await import("../src/editor");
  });

  const BASE: RawConfig = {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.s", grid: "sensor.g", house: "sensor.h" },
  };

  function statusFields(el: Editor): Field[] {
    const group = form(el).schema.find((g) => g.name === "grid_status");
    return group?.schema ?? [];
  }

  it("keeps the section collapsed - most installations have no such entity", async () => {
    const el = await mount(BASE);
    const group = form(el).schema.find((g) => g.name === "grid_status") as Field & {
      expanded?: boolean;
    };
    expect(group).toBeTruthy();
    expect(group.expanded).toBeUndefined();
  });

  it("round-trips the long form", async () => {
    const el = await mount({
      ...BASE,
      entities: {
        ...BASE.entities,
        grid_status: { entity: "sensor.status", outage: ["not_detected"], ok: ["ok"] },
      },
    });
    expect(form(el).data.grid_status).toBe("sensor.status");
    expect(form(el).data.grid_status_outage).toEqual(["not_detected"]);
    expect(form(el).data.grid_status_ok).toEqual(["ok"]);
  });

  it("always writes the long form, never a bare entity id", async () => {
    const el = await mount(BASE);
    const saved = await change(el, {
      grid_status: "sensor.status",
      grid_status_outage: ["not_detected"],
      grid_status_ok: ["ok"],
    });
    expect(saved.entities?.grid_status).toEqual({
      entity: "sensor.status",
      outage: ["not_detected"],
      ok: ["ok"],
    });
  });

  it("drops the whole block when the entity is cleared", async () => {
    const el = await mount({
      ...BASE,
      entities: {
        ...BASE.entities,
        grid_status: { entity: "sensor.status", outage: ["not_detected"] },
      },
    });
    const saved = await change(el, { grid_status: "" });
    expect(saved.entities?.grid_status).toBeUndefined();
  });

  it("offers the entity's own states as choices, so nobody has to guess them", async () => {
    const el = document.createElement("enerlens-card-editor") as Editor;
    el.hass = {
      ...hass,
      states: {
        "sensor.status": {
          entity_id: "sensor.status",
          state: "ok",
          attributes: { options: ["ok", "not_detected"] },
          last_changed: "",
          last_updated: "",
        },
      },
    } as HomeAssistant;
    el.setConfig({
      ...BASE,
      entities: {
        ...BASE.entities,
        grid_status: { entity: "sensor.status", outage: ["not_detected"] },
      },
    });
    document.body.appendChild(el);
    await el.updateComplete;

    const outage = statusFields(el).find((f) => f.name === "grid_status_outage");
    const select = outage?.selector?.select as {
      options: Array<{ value: string }>;
      multiple: boolean;
      custom_value: boolean;
    };
    expect(select.options.map((o) => o.value)).toEqual(["ok", "not_detected"]);
    expect(select.multiple).toBe(true);
    // Typing a state the entity does not publish stays possible.
    expect(select.custom_value).toBe(true);
  });
});

describe("editor - the colour rows (REQ C-1, E-3)", () => {
  const BASE: RawConfig = {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.solar", grid: "sensor.grid" },
  };

  type Row = {
    swatch: HTMLButtonElement;
    text: HTMLElement & { value?: string; placeholder?: string };
    reset: HTMLButtonElement;
  };

  function rows(el: Editor): Record<string, Row> {
    const out: Record<string, Row> = {};
    for (const node of el.shadowRoot?.querySelectorAll(".color") ?? []) {
      const swatch = node.querySelector("button.swatch") as HTMLButtonElement;
      const id = swatch.getAttribute("data-key") ?? "";
      if (!id.startsWith("node:")) continue;
      out[id.slice(5)] = {
        swatch,
        text: node.querySelector("ha-textfield") as Row["text"],
        reset: node.querySelector("button.reset") as HTMLButtonElement,
      };
    }
    return out;
  }

  /** The swatch paints its colour inline; normalise it back to plain hex. */
  const shown = (row: Row): string | null => swatchHex(row.swatch.style.background);

  /** Fires what an element hands back after the user changed it, then feeds the
   *  emitted config through setConfig the way Home Assistant does. */
  async function act(el: Editor, run: () => void): Promise<RawConfig> {
    let saved: RawConfig | undefined;
    const listener = (ev: Event) => {
      saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
    };
    el.addEventListener("config-changed", listener);
    run();
    el.removeEventListener("config-changed", listener);
    if (!saved) throw new Error("no config-changed event");
    el.setConfig(saved);
    await el.updateComplete;
    return saved;
  }

  it("offers one row per colour and keeps them out of the form schema", async () => {
    const el = await mount(BASE);
    expect(Object.keys(rows(el))).toEqual([
      "solar",
      "house",
      "grid_import",
      "grid_export",
      "battery_charge",
      "battery_discharge",
      "rest",
    ]);
    // Colours are ours to render now, but the data stays in the form's hands -
    // that is what keeps a cleared field from writing an empty colour (REQ E-1).
    const sections = [...(el.shadowRoot?.querySelectorAll("ha-form") ?? [])].flatMap(
      (f) => (f as Form).schema,
    );
    expect(sections.find((s) => s.name === "colors")).toBeUndefined();
    expect(form(el).data).toHaveProperty("color_solar");
  });

  it("never uses the native colour input, which would take the dialog with it", async () => {
    // <input type="color"> opens an operating-system popup outside the document.
    // Every pointer event in it reaches the card editor's ha-dialog as a click on
    // nothing, and the dialog closes mid-pick.
    const el = await mount(BASE);
    expect(el.shadowRoot?.querySelector('input[type="color"]')).toBeNull();
  });

  it("shows the default in the swatch while the field is empty", async () => {
    const el = await mount(BASE);
    const rest = rows(el).rest;
    expect(rest.text.value).toBe("");
    // The placeholder names what the empty field stands for.
    expect(rest.text.placeholder).toBe("#7d7d7d");
    expect(shown(rest)).toBe("#7d7d7d");
    expect(rest.reset.disabled).toBe(true);
  });

  it("shows the configured colour, whatever notation it is written in", async () => {
    const el = await mount({ ...BASE, colors: { rest: "rgb(255, 153, 0)" } });
    const rest = rows(el).rest;
    expect(rest.text.value).toBe("rgb(255, 153, 0)");
    expect(shown(rest)).toBe("#ff9900");
    expect(rest.reset.disabled).toBe(false);
  });

  it("keeps the text field, so a theme variable can still be typed (REQ C-1)", async () => {
    const el = await mount(BASE);
    const text = rows(el).solar.text;
    const saved = await act(el, () => {
      text.value = "var(--warning-color)";
      text.dispatchEvent(new Event("input"));
    });
    expect(saved.colors).toEqual({ solar: "var(--warning-color)" });
    expect(rows(el).solar.text.value).toBe("var(--warning-color)");
  });

  it("resets a colour to the default instead of writing an empty one", async () => {
    const el = await mount({ ...BASE, colors: { rest: "#999", solar: "#f90" } });
    const saved = await act(el, () => rows(el).rest.reset.click());
    expect(saved.colors).toEqual({ solar: "#f90" });
    const empty = await act(el, () => rows(el).solar.reset.click());
    expect(empty.colors).toBeUndefined();
    expect(rows(el).solar.text.value).toBe("");
  });
});

describe("editor - a colour row folds its CSS field out (REQ E-3)", () => {
  const BASE: RawConfig = {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.solar", grid: "sensor.grid" },
  };

  type Parts = {
    row: HTMLElement;
    swatch: HTMLButtonElement;
    css: HTMLElement;
    more: HTMLButtonElement;
    body: HTMLElement;
    text: HTMLElement & { value?: string };
  };

  function row(el: Editor, key: string): Parts {
    const swatch = el.shadowRoot?.querySelector(
      `button.swatch[data-key="node:${key}"]`,
    ) as HTMLButtonElement;
    const node = swatch.closest(".color") as HTMLElement;
    return {
      row: node,
      swatch,
      css: node.querySelector(".css") as HTMLElement,
      more: node.querySelector("button.more") as HTMLButtonElement,
      body: node.querySelector(".body") as HTMLElement,
      text: node.querySelector("ha-textfield") as Parts["text"],
    };
  }

  async function click(el: Editor, button: HTMLButtonElement): Promise<void> {
    button.click();
    await el.updateComplete;
  }

  it("keeps the CSS field away until it is asked for", async () => {
    const el = await mount(BASE);
    const solar = row(el, "solar");
    expect(solar.body.hasAttribute("hidden")).toBe(true);
    expect(solar.more.getAttribute("aria-expanded")).toBe("false");
    // Folded shut, the row still says what it is set to and still picks colours.
    expect(solar.css.textContent?.trim()).toBe("Standard");
    expect(swatchHex(solar.swatch.style.background)).toBe("#ff9800");
  });

  it("folds out on CSS and back again, one row at a time", async () => {
    const el = await mount(BASE);
    await click(el, row(el, "solar").more);
    expect(row(el, "solar").body.hasAttribute("hidden")).toBe(false);
    expect(row(el, "solar").more.getAttribute("aria-expanded")).toBe("true");
    // Its neighbour is unaffected - opening one is not a mode.
    expect(row(el, "rest").body.hasAttribute("hidden")).toBe(true);

    await click(el, row(el, "solar").more);
    expect(row(el, "solar").body.hasAttribute("hidden")).toBe(true);
  });

  it("stays open across a keystroke - the list re-renders on every one", async () => {
    const el = await mount(BASE);
    await click(el, row(el, "solar").more);

    const text = row(el, "solar").text;
    text.value = "var(--warning-color)";
    text.dispatchEvent(new Event("input"));
    await el.updateComplete;

    const after = row(el, "solar");
    expect(after.body.hasAttribute("hidden")).toBe(false);
    expect(after.text.value).toBe("var(--warning-color)");
    // The head reports the new value without being folded out for it.
    expect(after.css.textContent?.trim()).toBe("var(--warning-color)");
  });
});

describe("editor - the colour wheel lives inside the dialog (REQ E-3)", () => {
  const BASE: RawConfig = {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.solar", grid: "sensor.grid" },
  };

  const swatchOf = (el: Editor, key: string) =>
    el.shadowRoot?.querySelector(`button.swatch[data-key="node:${key}"]`) as HTMLButtonElement;
  const wheel = (el: Editor) => el.shadowRoot?.querySelector(".picker") as HTMLElement | null;

  async function open(el: Editor, key: string): Promise<HTMLElement> {
    swatchOf(el, key).click();
    await el.updateComplete;
    const panel = wheel(el);
    if (!panel) throw new Error("no picker");
    return panel;
  }

  /** happy-dom lays nothing out, so the strip is given a box to measure. */
  function box(node: Element, width: number, height: number): void {
    (node as unknown as { getBoundingClientRect: () => DOMRect }).getBoundingClientRect = () =>
      ({ left: 0, top: 0, width, height, right: width, bottom: height }) as DOMRect;
  }

  function pointer(type: string, x: number, y: number): Event {
    const ev = new Event(type, { bubbles: true, cancelable: true });
    Object.assign(ev, { clientX: x, clientY: y, pointerId: 1, button: 0 });
    return ev;
  }

  it("opens under the swatch, in our own shadow root", async () => {
    const el = await mount(BASE);
    expect(wheel(el)).toBeNull();
    const panel = await open(el, "solar");
    // Inside the editor, so the surrounding ha-dialog keeps the pointer events.
    expect(panel.getAttribute("role")).toBe("dialog");
    expect(el.shadowRoot?.contains(panel)).toBe(true);
    expect(swatchOf(el, "solar").getAttribute("aria-expanded")).toBe("true");
    // It starts on the colour the row actually shows.
    expect((panel.querySelector(".foot .hex") as HTMLInputElement).value).toBe("#ff9800");
  });

  it("closes on a second click, on Escape and on a click elsewhere", async () => {
    const el = await mount(BASE);
    await open(el, "solar");
    swatchOf(el, "solar").click();
    await el.updateComplete;
    expect(wheel(el)).toBeNull();

    const panel = await open(el, "solar");
    panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await el.updateComplete;
    expect(wheel(el)).toBeNull();

    await open(el, "solar");
    (el.shadowRoot?.querySelector(".scrim") as HTMLElement).dispatchEvent(
      new Event("pointerdown", { bubbles: true }),
    );
    await el.updateComplete;
    expect(wheel(el)).toBeNull();
  });

  it("writes the colour once the drag ends, not on every pixel", async () => {
    const el = await mount(BASE);
    const panel = await open(el, "rest");
    const strip = panel.querySelector(".hue") as HTMLElement;
    box(strip, 200, 15);

    const seen: RawConfig[] = [];
    el.addEventListener("config-changed", (ev) => {
      seen.push((ev as CustomEvent<{ config: RawConfig }>).detail.config);
    });

    // A third of the way along the strip is green.
    strip.dispatchEvent(pointer("pointerdown", 66, 7));
    await el.updateComplete;
    strip.dispatchEvent(pointer("pointermove", 100, 7));
    await el.updateComplete;
    // Dragging paints, it does not save.
    expect(seen).toHaveLength(0);
    expect(swatchHex(swatchOf(el, "rest").style.background)).not.toBe("#7d7d7d");

    strip.dispatchEvent(pointer("pointerup", 100, 7));
    await el.updateComplete;
    expect(seen).toHaveLength(1);
    expect(seen[0].colors?.rest).toMatch(/^#[\da-f]{6}$/);
  });

  it("moves on the arrow keys, so the wheel is not the only way in", async () => {
    const el = await mount({ ...BASE, colors: { rest: "#ff0000" } });
    const panel = await open(el, "rest");
    const strip = panel.querySelector(".hue") as HTMLElement;

    let saved: RawConfig | undefined;
    el.addEventListener("config-changed", (ev) => {
      saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
    });
    const key = new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true, bubbles: true });
    Object.defineProperty(key, "target", { value: strip });
    panel.dispatchEvent(key);
    await el.updateComplete;

    // Ten degrees along the wheel from red, and written straight away.
    expect(saved?.colors?.rest).toBe("#ff2a00");
  });
});

describe("editor - every colour the card has (REQ C-1, C-3, C-4)", () => {
  const WITH_CONSUMERS: RawConfig = {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.solar", grid: "sensor.grid", battery_soc: "sensor.soc" },
    consumers: [
      { entity: "sensor.heat_pump", name: "Wärmepumpe" },
      { entity: "sensor.fridge", name: "Kühlschränke", color: "#00e81b" },
      { entity: "sensor.dryer" },
    ],
  };

  const idsOf = (el: Editor, kind: string): string[] =>
    [...(el.shadowRoot?.querySelectorAll("button.swatch") ?? [])]
      .map((n) => n.getAttribute("data-key") ?? "")
      .filter((id) => id.startsWith(`${kind}:`));

  const rowOf = (el: Editor, id: string): HTMLElement =>
    (el.shadowRoot?.querySelector(`button.swatch[data-key="${id}"]`) as HTMLElement).closest(
      ".color",
    ) as HTMLElement;

  const swatchOf = (el: Editor, id: string): HTMLButtonElement =>
    el.shadowRoot?.querySelector(`button.swatch[data-key="${id}"]`) as HTMLButtonElement;

  async function act(el: Editor, run: () => void): Promise<RawConfig> {
    let saved: RawConfig | undefined;
    const listener = (ev: Event) => {
      saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
    };
    el.addEventListener("config-changed", listener);
    run();
    el.removeEventListener("config-changed", listener);
    if (!saved) throw new Error("no config-changed event");
    // Whatever the editor writes, the card has to accept (REQ E-1).
    expect(() => normalizeConfig(saved as RawConfig)).not.toThrow();
    el.setConfig(saved);
    await el.updateComplete;
    return saved;
  }

  const typeInto = (row: HTMLElement, value: string): void => {
    const field = row.querySelector("ha-textfield") as HTMLElement & { value?: string };
    field.value = value;
    field.dispatchEvent(new Event("input"));
  };

  describe("consumers", () => {
    it("gives every consumer a row, named the way the list names it", async () => {
      const el = await mount(WITH_CONSUMERS);
      expect(idsOf(el, "consumer")).toEqual(["consumer:0", "consumer:1", "consumer:2"]);
      const names = idsOf(el, "consumer").map((id) =>
        rowOf(el, id).querySelector(".name")?.textContent?.trim(),
      );
      // Without a name of its own a consumer is known by its entity.
      expect(names).toEqual(["Wärmepumpe", "Kühlschränke", "sensor.dryer"]);
    });

    it("shows the palette colour a consumer would get anyway", async () => {
      const el = await mount(WITH_CONSUMERS);
      // Nothing set: the swatch shows what the card paints, by position.
      expect(swatchHex(swatchOf(el, "consumer:0").style.background)).toBe(
        DEFAULT_CONSUMER_PALETTE[0],
      );
      expect(swatchHex(swatchOf(el, "consumer:1").style.background)).toBe("#00e81b");
    });

    it("writes the colour into that consumer and leaves its neighbours alone", async () => {
      const el = await mount(WITH_CONSUMERS);
      const saved = await act(el, () => typeInto(rowOf(el, "consumer:0"), "#d400c5"));
      expect(saved.consumers?.[0]).toEqual({
        entity: "sensor.heat_pump",
        name: "Wärmepumpe",
        color: "#d400c5",
      });
      expect(saved.consumers?.[1]).toEqual({
        entity: "sensor.fridge",
        name: "Kühlschränke",
        color: "#00e81b",
      });
    });

    it("drops the colour rather than writing an empty one", async () => {
      const el = await mount(WITH_CONSUMERS);
      const reset = rowOf(el, "consumer:1").querySelector("button.reset") as HTMLButtonElement;
      const saved = await act(el, () => reset.click());
      expect(saved.consumers?.[1]).toEqual({ entity: "sensor.fridge", name: "Kühlschränke" });
    });

    it("no longer offers a second place to set the same colour", async () => {
      const el = await mount(WITH_CONSUMERS);
      const consumers = form(el).schema.find((f) => f.name === "consumers");
      const fields = (consumers?.selector?.object as { fields: Record<string, unknown> }).fields;
      expect(Object.keys(fields)).not.toContain("color");
      expect(Object.keys(fields)).toContain("icon");
    });
  });

  describe("state of charge", () => {
    it("starts from the built-in gradient while none is configured", async () => {
      const el = await mount(WITH_CONSUMERS);
      expect(idsOf(el, "stop")).toEqual(["stop:0", "stop:1", "stop:2"]);
      expect(swatchHex(swatchOf(el, "stop:0").style.background)).toBe("#e53935");
      expect(swatchHex(swatchOf(el, "stop:2").style.background)).toBe("#43a047");
    });

    it("pins the two ends, which the card insists on (REQ C-3)", async () => {
      const el = await mount(WITH_CONSUMERS);
      // Ends: no percentage field, no way to remove them.
      for (const id of ["stop:0", "stop:2"]) {
        expect(rowOf(el, id).querySelector("input.percent")).toBeNull();
        expect(rowOf(el, id).querySelector(".at .fixed")?.textContent?.trim()).toBe(
          id === "stop:0" ? "0" : "100",
        );
      }
      expect(rowOf(el, "stop:1").querySelector("input.percent")).not.toBeNull();
    });

    it("writes the whole gradient when one stop changes colour", async () => {
      const el = await mount(WITH_CONSUMERS);
      const saved = await act(el, () => typeInto(rowOf(el, "stop:1"), "#ffcc00"));
      expect(saved.colors?.soc_stops).toEqual([
        { at: 0, color: "#e53935" },
        { at: 50, color: "#ffcc00" },
        { at: 100, color: "#43a047" },
      ]);
    });

    it("keeps a percentage between its neighbours, so the list never runs backwards", async () => {
      const el = await mount(WITH_CONSUMERS);
      const percent = rowOf(el, "stop:1").querySelector("input.percent") as HTMLInputElement;
      const saved = await act(el, () => {
        percent.value = "180";
        percent.dispatchEvent(new Event("change"));
      });
      expect(saved.colors?.soc_stops?.[1].at).toBe(100);
    });

    it("adds a stop in the widest gap and removes only the middle ones", async () => {
      const el = await mount({
        ...WITH_CONSUMERS,
        colors: {
          soc_stops: [
            { at: 0, color: "#f00" },
            { at: 20, color: "#ff0" },
            { at: 100, color: "#0f0" },
          ],
        },
      });
      const add = el.shadowRoot?.querySelector("button.add") as HTMLButtonElement;
      const saved = await act(el, () => add.click());
      // The 20-to-100 gap is the wide one; halfway is 60.
      expect(saved.colors?.soc_stops?.map((s) => s.at)).toEqual([0, 20, 60, 100]);

      const remove = rowOf(el, "stop:2").querySelector("button.reset") as HTMLButtonElement;
      const back = await act(el, () => remove.click());
      expect(back.colors?.soc_stops?.map((s) => s.at)).toEqual([0, 20, 100]);
    });

    it("will not go below the two stops a gradient needs", async () => {
      const el = await mount(WITH_CONSUMERS);
      // The ends carry no remove button at all - there is nothing to press.
      expect(rowOf(el, "stop:0").querySelectorAll("button.reset")).toHaveLength(1);
      const middle = rowOf(el, "stop:1").querySelectorAll("button.reset");
      expect(middle).toHaveLength(2);
    });
  });
});

describe("editor - the other ways into a colour (REQ E-3)", () => {
  const BASE: RawConfig = {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.solar", grid: "sensor.grid" },
    consumers: [
      { entity: "sensor.ac_up", name: "Klima OG", color: "#1400ff" },
      { entity: "sensor.ac_store", name: "Klima Speicher" },
    ],
  };

  const swatchOf = (el: Editor, id: string) =>
    el.shadowRoot?.querySelector(`button.swatch[data-key="${id}"]`) as HTMLButtonElement;

  async function open(el: Editor, id: string): Promise<HTMLElement> {
    swatchOf(el, id).click();
    await el.updateComplete;
    return el.shadowRoot?.querySelector(".picker") as HTMLElement;
  }

  async function act(el: Editor, run: () => void): Promise<RawConfig> {
    let saved: RawConfig | undefined;
    const listener = (ev: Event) => {
      saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
    };
    el.addEventListener("config-changed", listener);
    run();
    el.removeEventListener("config-changed", listener);
    if (!saved) throw new Error("no config-changed event");
    el.setConfig(saved);
    await el.updateComplete;
    return saved;
  }

  it("takes a hex value typed straight into the wheel", async () => {
    const el = await mount(BASE);
    const panel = await open(el, "node:rest");
    const hex = panel.querySelector(".hex") as HTMLInputElement;
    expect(hex.value).toBe("#7d7d7d");

    const saved = await act(el, () => {
      hex.value = "#3366cc";
      hex.dispatchEvent(new Event("change"));
    });
    expect(saved.colors?.rest).toBe("#3366cc");
    // The wheel moved with it, rather than staying on the old colour.
    const after = el.shadowRoot?.querySelector(".picker .hex") as HTMLInputElement;
    expect(after.value).toBe("#3366cc");
  });

  it("ignores what it cannot read instead of writing nonsense", async () => {
    const el = await mount(BASE);
    const panel = await open(el, "node:rest");
    const hex = panel.querySelector(".hex") as HTMLInputElement;

    let fired = false;
    el.addEventListener("config-changed", () => {
      fired = true;
    });
    hex.value = "lila bitte";
    hex.dispatchEvent(new Event("change"));
    await el.updateComplete;

    expect(fired).toBe(false);
    // The field goes back to the colour that still applies.
    expect((el.shadowRoot?.querySelector(".picker .hex") as HTMLInputElement).value).toBe(
      "#7d7d7d",
    );
  });

  it("offers the colours this card already uses, each of them once", async () => {
    const el = await mount(BASE);
    const panel = await open(el, "consumer:1");
    const chips = [...panel.querySelectorAll(".used .chip")] as HTMLElement[];
    expect(chips.length).toBeGreaterThan(0);

    // Every suggestion is a different colour.
    const hexes = chips.map((c) => swatchHex(c.style.background));
    expect(new Set(hexes).size).toBe(hexes.length);
    // The blue that is already on the other air conditioner is among them.
    expect(hexes).toContain("#1400ff");
  });

  it("keeps the last consumer's colour, however many are configured", async () => {
    // Seven node colours plus eight own consumer colours used to run past the
    // twelve the list showed, and the last consumer fell off it silently.
    const many: RawConfig = {
      ...BASE,
      consumers: [
        { entity: "sensor.c1", name: "One", color: "#1400ff" },
        { entity: "sensor.c2", name: "Two", color: "#d4c800" },
        { entity: "sensor.c3", name: "Three", color: "#00e81b" },
        { entity: "sensor.c4", name: "Four", color: "#aa00aa" },
        { entity: "sensor.c5", name: "Five", color: "#00aaff" },
        { entity: "sensor.c6", name: "Six", color: "#884400" },
        { entity: "sensor.c7", name: "Seven", color: "#ff0066" },
        { entity: "sensor.c8", name: "Eight", color: "#00e8d7" },
      ],
    };
    const el = await mount(many);
    const panel = await open(el, "consumer:0");
    const titles = [...panel.querySelectorAll(".used .chip")].map((c) => c.getAttribute("title"));
    expect(titles).toContain("#00e8d7");
  });

  it("takes a suggestion as written, so a theme variable stays one", async () => {
    const el = await mount(BASE);
    const panel = await open(el, "consumer:1");
    const chip = [...panel.querySelectorAll(".used .chip")].find(
      (c) => c.getAttribute("title") === "#1400ff",
    ) as HTMLButtonElement;

    const saved = await act(el, () => chip.click());
    expect(saved.consumers?.[1]).toEqual({
      entity: "sensor.ac_store",
      name: "Klima Speicher",
      color: "#1400ff",
    });

    // A node colour written as a theme variable is handed on unchanged.
    const nodePanel = await open(el, "node:rest");
    const themed = [...nodePanel.querySelectorAll(".used .chip")].find((c) =>
      c.getAttribute("title")?.startsWith("var("),
    ) as HTMLButtonElement;
    const withVar = await act(el, () => themed.click());
    expect(withVar.colors?.rest).toMatch(/^var\(--/);
  });
});

describe("editor - reading a colour by its channels (REQ E-3)", () => {
  const BASE: RawConfig = {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.solar", grid: "sensor.grid" },
    colors: { rest: "#ff9800" },
  };

  const swatchOf = (el: Editor, id: string) =>
    el.shadowRoot?.querySelector(`button.swatch[data-key="${id}"]`) as HTMLButtonElement;

  async function open(el: Editor, id: string): Promise<HTMLElement> {
    swatchOf(el, id).click();
    await el.updateComplete;
    return el.shadowRoot?.querySelector(".picker") as HTMLElement;
  }

  async function mode(el: Editor, name: string): Promise<HTMLElement> {
    const button = [...(el.shadowRoot?.querySelectorAll("button.mode") ?? [])].find(
      (b) => b.textContent?.trim() === name,
    ) as HTMLButtonElement;
    button.click();
    await el.updateComplete;
    return el.shadowRoot?.querySelector(".picker") as HTMLElement;
  }

  const numbers = (panel: HTMLElement): number[] =>
    [...panel.querySelectorAll(".channel .number")].map((n) =>
      Number((n as HTMLInputElement).value),
    );

  it("reads the colour out as RGB and as HSL", async () => {
    const el = await mount(BASE);
    await open(el, "node:rest");
    expect(numbers(await mode(el, "RGB"))).toEqual([255, 152, 0]);
    // The same orange, the way CSS writes hsl(): 36deg, full saturation, half light.
    expect(numbers(await mode(el, "HSL"))).toEqual([36, 100, 50]);
  });

  it("writes when the slider is let go, not while it is moving", async () => {
    const el = await mount(BASE);
    await open(el, "node:rest");
    const panel = await mode(el, "RGB");
    const green = panel.querySelectorAll(".channel .range")[1] as HTMLInputElement;

    const seen: RawConfig[] = [];
    el.addEventListener("config-changed", (ev) => {
      seen.push((ev as CustomEvent<{ config: RawConfig }>).detail.config);
    });

    green.value = "0";
    green.dispatchEvent(new Event("input"));
    await el.updateComplete;
    expect(seen).toHaveLength(0);
    // The wheel repaints all the way along, though.
    expect((el.shadowRoot?.querySelector(".picker .reading") as HTMLElement).textContent).toBe(
      "#ff0000",
    );

    green.dispatchEvent(new Event("change"));
    await el.updateComplete;
    expect(seen).toHaveLength(1);
    expect(seen[0].colors?.rest).toBe("#ff0000");
  });

  it("takes a number typed into a channel straight away", async () => {
    const el = await mount(BASE);
    await open(el, "node:rest");
    const panel = await mode(el, "RGB");
    const blue = panel.querySelectorAll(".channel .number")[2] as HTMLInputElement;

    let saved: RawConfig | undefined;
    el.addEventListener("config-changed", (ev) => {
      saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
    });
    blue.value = "255";
    blue.dispatchEvent(new Event("change"));
    await el.updateComplete;
    expect(saved?.colors?.rest).toBe("#ff98ff");
  });

  it("stays in the notation it was left in, row after row", async () => {
    const el = await mount(BASE);
    await open(el, "node:rest");
    await mode(el, "HSL");
    // A different row, opened fresh: still HSL.
    swatchOf(el, "node:solar").click();
    await el.updateComplete;
    const panel = el.shadowRoot?.querySelector(".picker") as HTMLElement;
    expect(panel.querySelectorAll(".channel")).toHaveLength(3);
    expect(
      [...panel.querySelectorAll("button.mode")]
        .find((b) => b.getAttribute("aria-pressed") === "true")
        ?.textContent?.trim(),
    ).toBe("HSL");
  });

  it("keeps the hue visible when a channel drives the colour to black", async () => {
    const el = await mount(BASE);
    await open(el, "node:rest");
    const panel = await mode(el, "HSL");
    const light = panel.querySelectorAll(".channel .number")[2] as HTMLInputElement;
    light.value = "0";
    light.dispatchEvent(new Event("change"));
    await el.updateComplete;

    // Black has no hue of its own; the strip must not snap back to red.
    const after = el.shadowRoot?.querySelector(".picker") as HTMLElement;
    expect(numbers(after)[0]).toBe(36);
  });
});
