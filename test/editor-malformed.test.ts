// @vitest-environment happy-dom
/**
 * Issue #19: the card may refuse a hand-typed configuration - the editor still
 * has to open on it, since it is the way to repair it, and must never throw
 * while rendering or editing. What it cannot show it leaves as it is: an edit
 * elsewhere does not rewrite or drop it (REQ E-1).
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { HomeAssistant, RawConfig } from "../src/types";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  shadowRoot: ShadowRoot | null;
};
type Form = HTMLElement & { data: Record<string, unknown> };

const HASS = {
  states: {},
  locale: { language: "en", number_format: "language" as const },
  language: "en",
  callWS: async () => ({}) as never,
} as unknown as HomeAssistant;

const ENTITIES = { solar: "sensor.s", grid: "sensor.g" };

async function mount(config: Record<string, unknown>, hass = HASS): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = hass;
  el.setConfig({ type: "custom:enerlens-card", ...config } as RawConfig);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** Changes the title through the form, as a user would, and returns what is saved. */
function editTitle(el: Editor): Record<string, unknown> {
  const form = el.shadowRoot?.querySelector("ha-form") as Form;
  let saved: Record<string, unknown> | undefined;
  const listener = (ev: Event) => {
    saved = (ev as CustomEvent<{ config: Record<string, unknown> }>).detail.config;
  };
  el.addEventListener("config-changed", listener);
  form.dispatchEvent(
    new CustomEvent("value-changed", { detail: { value: { ...form.data, title: "New" } } }),
  );
  el.removeEventListener("config-changed", listener);
  if (!saved) throw new Error("no config-changed");
  expect(saved.title).toBe("New");
  return saved;
}

/** Every colour group drawn, so the colour rows and stops are rendered too. */
async function unfoldAll(el: Editor): Promise<void> {
  const editor = el as unknown as { _builtSections: Set<string>; requestUpdate(): void };
  for (const panel of el.shadowRoot?.querySelectorAll(".section[data-section]") ?? []) {
    editor._builtSections.add((panel as HTMLElement).dataset.section as string);
  }
  editor.requestUpdate();
  await el.updateComplete;
}

beforeAll(async () => {
  await import("../src/editor");
});

describe("the editor opens on malformed YAML and keeps working (issue #19)", () => {
  const CASES: Record<string, Record<string, unknown>> = {
    "battery: false": { entities: { ...ENTITIES, battery: false } },
    "solar: 5": { entities: { ...ENTITIES, solar: 5 } },
    "soc_stops colour left empty (unquoted #)": {
      entities: ENTITIES,
      colors: {
        soc_stops: [
          { at: 0, color: null },
          { at: 100, color: "#fff" },
        ],
      },
    },
    "soc_stops without colours": {
      entities: ENTITIES,
      colors: { soc_stops: [{ at: 0 }, { at: 100 }] },
    },
    "soc_stops colour a number": {
      entities: ENTITIES,
      colors: {
        soc_stops: [
          { at: 0, color: 5 },
          { at: 100, color: "red" },
        ],
      },
    },
    "soc_stops as plain colours": { entities: ENTITIES, colors: { soc_stops: ["red", "blue"] } },
    "soc_stops with empty entries": { entities: ENTITIES, colors: { soc_stops: [null, null] } },
    "plugged: true": {
      entities: ENTITIES,
      consumers: [
        { entity: "sensor.c", charge: { soc: "sensor.soc", show: "plugged", plugged: true } },
      ],
    },
    "plugged: 5": {
      entities: ENTITIES,
      consumers: [
        { entity: "sensor.c", charge: { soc: "sensor.soc", show: "plugged", plugged: 5 } },
      ],
    },
  };

  for (const [name, config] of Object.entries(CASES)) {
    it(name, async () => {
      const el = await mount(config);
      await unfoldAll(el);
      expect(el.shadowRoot?.querySelector("ha-form")).not.toBeNull();
      editTitle(el);
      el.remove();
    });
  }

  it("hass without states while a grid status is set", async () => {
    const el = await mount(
      { entities: { ...ENTITIES, grid_status: { entity: "sensor.st", outage: ["off"] } } },
      { ...HASS, states: undefined } as unknown as HomeAssistant,
    );
    await unfoldAll(el);
    editTitle(el);
    el.remove();
  });
});

describe("an edit elsewhere leaves what the editor cannot show as it is (issue #19)", () => {
  const KEPT: Record<
    string,
    [Record<string, unknown>, (saved: Record<string, unknown>) => unknown]
  > = {
    "entities as text": [{ entities: "sensor.abc" }, (s) => s.entities],
    "colors as text": [{ entities: ENTITIES, colors: "red" }, (s) => s.colors],
    "flow as text": [{ entities: ENTITIES, flow: "on" }, (s) => s.flow],
    "flow as a list": [{ entities: ENTITIES, flow: ["a"] }, (s) => s.flow],
    "soc_stops as plain colours": [
      { entities: ENTITIES, colors: { soc_stops: ["red", "blue"] } },
      (s) => (s.colors as Record<string, unknown>)?.soc_stops,
    ],
    "a misspelt key in a main entity": [
      { entities: { ...ENTITIES, battery: { entitiy: "sensor.b" } } },
      (s) => (s.entities as Record<string, unknown>)?.battery,
    ],
    "a consumer entity that is a number": [
      { entities: ENTITIES, consumers: [{ entity: 5 }] },
      (s) => s.consumers,
    ],
    "a charge whose soc is a number": [
      { entities: ENTITIES, consumers: [{ entity: "sensor.c", charge: { soc: 5 } }] },
      (s) => s.consumers,
    ],
    "nodes.solar as text": [
      { entities: ENTITIES, nodes: { solar: "x" } },
      (s) => (s.nodes as Record<string, unknown>)?.solar,
    ],
    "list as text": [{ entities: ENTITIES, list: "x" }, (s) => s.list],
  };

  for (const [name, [config, pick]] of Object.entries(KEPT)) {
    it(name, async () => {
      const el = await mount(config);
      expect(pick(editTitle(el))).toEqual(pick(config));
      el.remove();
    });
  }
});

describe("an edit keeps valid keys the form has no field for (issue #19)", () => {
  it("list.title and view.remember", async () => {
    const el = await mount({
      entities: ENTITIES,
      list: { title: "Consumers", rest_label: "Rest" },
      view: { remember: false, default_mode: "avg_short" },
    });
    const saved = editTitle(el);
    expect(saved.list).toEqual({ title: "Consumers", rest_label: "Rest" });
    expect(saved.view).toEqual({ remember: false, default_mode: "avg_short" });
    el.remove();
  });
});

describe("every form field belongs to a part of the YAML (issue #19)", () => {
  it("so an edit to it is never mistaken for no edit", async () => {
    const { fieldOwner } = await import("../src/editor");
    const configs = [
      {
        title: "T",
        entities: {
          solar: { entity: "sensor.s", invert: true },
          grid: { import: "sensor.gi", export: "sensor.ge" },
          battery: { discharge: "sensor.bo", charge: "sensor.bi" },
          battery_soc: "sensor.soc",
          grid_status: { entity: "sensor.st", outage: ["off"] },
        },
        consumers: [{ entity: "sensor.c" }],
        nodes: { solar: { inside: { entity: "sensor.x" }, label: { entity: "sensor.y" } } },
      },
      { entities: { solar: "sensor.s", grid: "sensor.g", house: "sensor.h", battery: "sensor.b" } },
    ];
    const names = new Set<string>();
    for (const config of configs) {
      const el = await mount(config);
      const flat = (el as unknown as { _flat: Record<string, unknown> })._flat;
      for (const name of Object.keys(flat)) names.add(name);
      el.remove();
    }
    expect(names.size).toBeGreaterThan(60);
    const orphans = [...names].filter((name) => fieldOwner(name) === undefined);
    expect(orphans).toEqual([]);
  });
});

describe("every form field reaches the YAML (issue #19)", () => {
  // The ownership above only says a field has a part, not the right one. A
  // field filed under the wrong part would look untouched and its edit would
  // be dropped - so each field is changed on its own, and the saved config has
  // to change with it.
  const FULL = {
    type: "custom:enerlens-card",
    title: "T",
    entities: {
      solar: "sensor.s",
      grid: "sensor.g",
      house: "sensor.h",
      battery: "sensor.b",
      battery_soc: "sensor.soc",
      grid_status: { entity: "sensor.st", outage: ["off"] },
    },
    consumers: [{ entity: "sensor.c" }],
    nodes: {
      solar: { inside: { entity: "sensor.x" }, label: { entity: "sensor.y" } },
      grid: { inside: { entity: "sensor.x" }, label: { entity: "sensor.y" } },
      house: { inside: { entity: "sensor.x" }, label: { entity: "sensor.y" } },
      battery: { label: { entity: "sensor.y" } },
    },
    power: { unit: "kW" },
  };

  /** A value of the field's own kind that differs from the one it has. */
  function another(name: string, value: unknown): unknown {
    if (name === "energy_periods") return ["week"];
    // Quick buttons show their defaults ticked; a real value differs from those.
    if (name === "modes") return ["current"];
    if (name === "scope") return ["full"];
    if (typeof value === "boolean") return !value;
    if (typeof value === "number") return value === 100 ? 120 : value + 1;
    if (Array.isArray(value))
      return [...value, name === "consumers" ? { entity: "sensor.new" } : "x"];
    if (name.endsWith("decimals")) return name.startsWith("power_") ? 3 : "2";
    if (name.endsWith("position")) return "below";
    if (name.endsWith("weight")) return "bold";
    if (typeof value === "string") return `${value}z`;
    if (/_w$|_s$|minutes|max_|dots|digits/.test(name)) return 7;
    if (name.includes("outage") || name.endsWith("_ok")) return ["x"];
    if (name.startsWith("color_")) return "#123456";
    if (name === "power_unit") return "W";
    if (name === "default_mode") return "avg_short";
    return "zz";
  }

  it("a change to any field changes the saved config", async () => {
    const el = await mount(FULL);
    const editor = el as unknown as {
      _flat: Record<string, unknown>;
      _emit(flat: Record<string, unknown>): void;
    };
    const before = editor._flat;
    const unchanged: string[] = [];
    for (const [name, value] of Object.entries(before)) {
      // A source switch is a choice between forms, covered by the source tests.
      if (name.endsWith("_source")) continue;
      el.setConfig(FULL as RawConfig);
      let saved: unknown;
      const listener = (ev: Event) => {
        saved = (ev as CustomEvent<{ config: unknown }>).detail.config;
      };
      el.addEventListener("config-changed", listener);
      editor._emit({ ...before, [name]: another(name, value) });
      el.removeEventListener("config-changed", listener);
      if (JSON.stringify(saved) === JSON.stringify(FULL)) unchanged.push(name);
    }
    expect(Object.keys(before).length).toBeGreaterThan(60);
    expect(unchanged).toEqual([]);
    el.remove();
  });
});
