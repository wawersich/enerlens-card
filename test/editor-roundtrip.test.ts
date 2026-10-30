// @vitest-environment happy-dom
/**
 * What the editor shows is what the YAML says (REQ E-1, PV-9). On 25.10.2026
 * a PV source with `house: excluded` showed its switch off: the row was
 * converted to the form twice, and the second time the flag was gone. The
 * tests then read the editor's inner state, not what the drawn forms got.
 *
 * These tests look at the forms as drawn - every section unfolded:
 *  A. Each form hands its own data back unchanged, as ha-form does when a field
 *     is set to the value it already has. The configuration must stay as it
 *     was: anything the form shows differently from the YAML would be written.
 *  B. A form gets no data it has no field for (the old `house` would have
 *     been one), and a table of YAML values against what the forms show.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import type { HomeAssistant, RawConfig } from "../src/types";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  shadowRoot: ShadowRoot | null;
  requestUpdate(): void;
};
type Form = HTMLElement & { data: Record<string, unknown>; schema: unknown[] };

const hass = {
  states: {},
  locale: { language: "de", number_format: "language" as const },
  language: "de",
  callWS: async () => ({}) as never,
} as HomeAssistant;

/** As much as differs from the defaults as the form can hold. */
const RICH: RawConfig = {
  type: "custom:enerlens-card",
  title: "T",
  layout: "square_left",
  entities: {
    solar: [
      { entity: "sensor.roof", name: "Dach", kwp: 8, icon: "mdi:solar-panel" },
      { entity: "sensor.balcony", name: "Balkon", kwp: 0.8, house: "excluded" },
      { entity: "sensor.shed", house: "excluded" },
    ],
    grid: { import: "sensor.gi", export: "sensor.ge" },
    house: "sensor.h",
    battery: "sensor.b",
    battery_soc: "sensor.soc",
    grid_status: { entity: "sensor.status", outage: ["not_detected"], ok: ["ok"] },
  },
  consumers: [
    { entity: "sensor.c", name: "C", color: "#123", icon: "mdi:fan", min_w: 20 },
    {
      entity: "sensor.car",
      name: "Auto",
      charge: { soc: "sensor.car_soc", show: "plugged", plugged: "binary_sensor.plug" },
    },
  ],
  min_consumer_w: 10,
  max_consumers: 5,
  update_interval_s: 5,
  appearance: "dark",
  list: { enabled: true, rest_label: "Rest", solar: true, always_below: true },
  ring: { enabled: true, animation: "overtake", solar: false },
  view: {
    modes: ["current", "avg_short"],
    default_mode: "avg_short",
    avg_short_minutes: 5,
    avg_long_minutes: 15,
    pv_scales: ["share", "peak"],
    default_pv_scale: "peak",
  },
  flow: { lines: "curved", inactive_lines: "dim", animation: "auto", min_w: 10, dot_size: 120 },
  colors: { solar: "#f90", rest: "#777", grid_label: "#123456", solar_inside: "#654321" },
  icons: { house: "mdi:home" },
  nodes: {
    solar: {
      show_name: false,
      inside: { entity: "sensor.today", position: "below", decimals: 1, size: 80, weight: "bold" },
      label: { entity: "sensor.fc", prefix: "Prognose", decimals: "sig3", size: 120 },
    },
    grid: { show_state: false, label: { entity: "sensor.imp", prefix: "Bezug", decimals: 0 } },
    battery: { show_name: false, show_state: false, label: { entity: "sensor.rest", size: 60 } },
  },
};

/** Opened with every section and every consumer unfolded: all forms drawn. */
async function mount(config: RawConfig): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = hass;
  el.setConfig(config);
  document.body.appendChild(el);
  await el.updateComplete;
  const all = { has: () => true } as unknown as ReadonlySet<string>;
  const inner = el as unknown as {
    _builtSections: ReadonlySet<string>;
    _builtConsumers: ReadonlySet<number>;
  };
  inner._builtSections = all;
  inner._builtConsumers = all as unknown as ReadonlySet<number>;
  el.requestUpdate();
  await el.updateComplete;
  return el;
}

const forms = (el: Editor) => [...(el.shadowRoot?.querySelectorAll("ha-form") ?? [])] as Form[];

/** What a form sends back, saved; undefined when nothing changed. */
function echo(el: Editor, form: Form, value: Record<string, unknown>): RawConfig | undefined {
  let saved: RawConfig | undefined;
  const listener = (ev: Event) => {
    saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
  };
  el.addEventListener("config-changed", listener);
  form.dispatchEvent(new CustomEvent("value-changed", { detail: { value }, bubbles: true }));
  el.removeEventListener("config-changed", listener);
  return saved;
}

/** Every field name of a schema, nested sections included. */
function fieldNames(schema: unknown[]): Set<string> {
  const out = new Set<string>();
  const walk = (items: unknown[]) => {
    for (const item of items) {
      const entry = item as { name?: string; schema?: unknown[] };
      if (entry.name) out.add(entry.name);
      if (Array.isArray(entry.schema)) walk(entry.schema);
    }
  };
  walk(schema);
  return out;
}

/**
 * Data a form carries without a field of its own: the consumer's colour and
 * the source's colour and invert live in YAML or in the colour panel.
 */
const NO_FIELD_OK = new Set(["color", "invert"]);

beforeAll(async () => {
  await import("../src/editor");
});

describe("A: every drawn form, handed back unchanged, changes nothing (E-1)", () => {
  it("draws the forms this test relies on", async () => {
    const el = await mount(RICH);
    const all = forms(el);
    // The main form, one per PV source, one per consumer.
    expect(all.length).toBeGreaterThanOrEqual(1 + 3 + 2);
    expect(el.shadowRoot?.querySelectorAll(".sources-panel .source ha-form")).toHaveLength(3);
  });

  it("each form on its own", async () => {
    // The card's memory id (V-12) is handed out on the first save, on purpose.
    const plain = (config: RawConfig) => {
      const { memoryId: _id, ...rest } = normalizeConfig(config);
      return rest;
    };
    const original = plain(RICH);
    const failures: string[] = [];
    const count = forms(await mount(RICH)).length;
    for (let i = 0; i < count; i++) {
      // A fresh editor per form: one echo must not hide behind another.
      const el = await mount(RICH);
      const form = forms(el)[i];
      const saved = echo(el, form, { ...form.data });
      if (!saved) continue;
      try {
        expect(plain(saved)).toEqual(original);
      } catch {
        failures.push(`form ${i} (${[...fieldNames(form.schema)].slice(0, 4).join(", ")} ...)`);
      }
      el.remove();
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
});

describe("B: the forms show what the YAML says", () => {
  it("a row form gets no data it has no field for", async () => {
    // The sections of the main form all share the whole flat state, on
    // purpose; a row - one PV source, one consumer - is its own form.
    const el = await mount(RICH);
    const rows = forms(el).filter((form) => fieldNames(form.schema).has("entity"));
    // Three PV sources, two consumers and the rest (L-21).
    expect(rows).toHaveLength(3 + 2 + 1);
    const stray: string[] = [];
    for (const form of rows) {
      const names = fieldNames(form.schema);
      for (const key of Object.keys(form.data ?? {})) {
        if (!names.has(key) && !NO_FIELD_OK.has(key)) stray.push(key);
      }
    }
    expect(stray).toEqual([]);
  });

  it("the PV sources: name, kWp, icon and the house switch as configured (PV-3)", async () => {
    const el = await mount(RICH);
    const data = [...(el.shadowRoot?.querySelectorAll(".sources-panel .source ha-form") ?? [])].map(
      (f) => (f as Form).data,
    );
    expect(data).toEqual([
      { entity: "sensor.roof", name: "Dach", kwp: 8, icon: "mdi:solar-panel", excluded: false },
      { entity: "sensor.balcony", name: "Balkon", kwp: 0.8, excluded: true },
      { entity: "sensor.shed", excluded: true },
    ]);
  });

  it("the main form: arrangement, line form and the PV switches as configured", async () => {
    const el = await mount(RICH);
    const data = forms(el)[0].data;
    expect(data).toMatchObject({
      layout: "square_left",
      flow_lines: "curved",
      list_solar: true,
      ring_solar: false,
      pv_scales: ["share", "peak"],
      default_pv_scale: "peak",
      appearance: "dark",
      list_always_below: true,
    });
  });
});

describe("C: a switch left out of the YAML shows what the card does (E-1)", () => {
  // Found 25.10.2026 on a documentation picture: "Show PV ring" stood off while
  // the card drew the ring - unset read as off. The defaults are the card's
  // (config.ts): list and ring on with consumers, the PV ring on.
  const BASE = {
    type: "custom:enerlens-card",
    entities: {
      solar: [
        { entity: "sensor.roof", kwp: 8 },
        { entity: "sensor.balcony", kwp: 0.8 },
      ],
      grid: "sensor.g",
      house: "sensor.h",
    },
  } as unknown as RawConfig;
  const WITH_CONSUMERS = { ...BASE, consumers: [{ entity: "sensor.c" }] } as RawConfig;

  it("with consumers: list on, ring on, PV ring on, PV rows off", async () => {
    const data = forms(await mount(WITH_CONSUMERS))[0].data;
    expect(data).toMatchObject({
      list_enabled: true,
      ring_enabled: true,
      ring_solar: true,
    });
    expect(data.list_solar).not.toBe(true);
  });

  it("without consumers: list and ring off, the PV ring still on", async () => {
    const data = forms(await mount(BASE))[0].data;
    expect(data.list_enabled).not.toBe(true);
    expect(data.ring_enabled).not.toBe(true);
    expect(data.ring_solar).toBe(true);
  });

  it("a default shown and left alone is never written", async () => {
    const el = await mount(WITH_CONSUMERS);
    const form = forms(el)[0];
    const saved = echo(el, form, { ...form.data, title: "T" });
    expect(saved?.title).toBe("T");
    expect(saved?.list).toBeUndefined();
    expect(saved?.ring).toBeUndefined();
  });

  it("consumers the card cannot use count as none: list and ring shown off", async () => {
    for (const consumers of [["sensor.c"], [{ entity: "" }], [{ name: "x" }], ""]) {
      const data = forms(await mount({ ...BASE, consumers } as unknown as RawConfig))[0].data;
      expect(data.list_enabled, JSON.stringify(consumers)).toBe(false);
      expect(data.ring_enabled, JSON.stringify(consumers)).toBe(false);
    }
  });

  it("the first consumer turns the shown default on, and still nothing is written", async () => {
    const el = await mount(BASE);
    const form = forms(el)[0];
    expect(form.data.list_enabled).toBe(false);
    const saved = echo(el, form, { ...form.data, consumers: [{ entity: "sensor.c" }] });
    expect(saved?.list).toBeUndefined();
    expect(saved?.ring).toBeUndefined();
    await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(forms(el)[0].data).toMatchObject({ list_enabled: true, ring_enabled: true });
  });

  it("turned on without consumers, it is written - and shows on again when reopened", async () => {
    const el = await mount(BASE);
    const form = forms(el)[0];
    const saved = echo(el, form, { ...form.data, list_enabled: true });
    expect(saved?.list).toEqual({ enabled: true });
    const again = forms(await mount(saved as RawConfig))[0].data;
    expect(again.list_enabled).toBe(true);
  });

  it("a saved off shows off when reopened", async () => {
    const data = forms(
      await mount({ ...WITH_CONSUMERS, ring: { solar: false, enabled: false } } as RawConfig),
    )[0].data;
    expect(data.ring_solar).toBe(false);
    expect(data.ring_enabled).toBe(false);
  });

  it("a hand-typed value stays as written when another field is edited (issue #19)", async () => {
    const el = await mount({ ...WITH_CONSUMERS, list: { enabled: "yes" } } as unknown as RawConfig);
    const form = forms(el)[0];
    const saved = echo(el, form, { ...form.data, title: "T" });
    expect(saved?.list).toEqual({ enabled: "yes" });
  });

  it("a switch turned off is written as off", async () => {
    const el = await mount(WITH_CONSUMERS);
    const form = forms(el)[0];
    const saved = echo(el, form, { ...form.data, ring_solar: false, list_enabled: false });
    expect(saved?.ring).toEqual({ solar: false });
    expect(saved?.list).toEqual({ enabled: false });
  });
});

describe("D: the quick buttons have no start value field (issue #22)", () => {
  // Markus, 23.10.2026: "Das Feld macht fast keinen Sinn, im YAML könnte es
  // bleiben, in GUI weg." A card remembers its last value (V-12); the start
  // value only counts on the very first opening. The keys stay valid in YAML.
  const START = ["default_mode", "default_energy", "default_scope", "default_pv_scale"];
  const WITH_START = {
    ...RICH,
    view: {
      modes: ["current", "avg_short"],
      default_mode: "avg_short",
      energy_periods: ["power", "today"],
      default_energy: "today",
      pv_scales: ["share", "peak"],
      default_pv_scale: "peak",
    },
    list: { ...(RICH.list as object), scope: ["filtered", "full"], default_scope: "full" },
  } as RawConfig;

  it("no form offers a start value", async () => {
    const el = await mount(WITH_START);
    const names = forms(el).flatMap((f) => [...fieldNames(f.schema)]);
    for (const name of START) expect(names, name).not.toContain(name);
  });

  it("a start value in the YAML stays as written when the quick buttons are edited", async () => {
    const el = await mount(WITH_START);
    const form = forms(el)[0];
    const saved = echo(el, form, {
      ...form.data,
      modes: ["current", "avg_short", "avg_long"],
      energy_periods: ["power", "today", "week"],
    });
    expect(saved?.view).toMatchObject({
      default_mode: "avg_short",
      default_energy: "today",
      default_pv_scale: "peak",
    });
    expect((saved?.list as Record<string, unknown>).default_scope).toBe("full");
  });
});

describe("E: style and expand of the quick buttons in the editor (QB-12, QB-14, issue #21)", () => {
  // With the PV ring: without it there is no PV scale to expand (PV-6).
  const CFG = {
    ...RICH,
    ring: { enabled: true, solar: true },
    view: { modes: ["current", "avg_short"], energy_periods: ["power", "today"] },
  } as RawConfig;
  const names = (el: Editor) => forms(el).flatMap((f) => [...fieldNames(f.schema)]);

  it("the style always; expand for every quick button with more than one value", async () => {
    const el = await mount(CFG);
    const all = names(el);
    for (const n of ["quick_style", "expanded_modes", "expanded_energy_periods"]) {
      expect(all, n).toContain(n);
    }
    // One source without kWp: the card offers "100 %" only - nothing to expand (PV-6).
    expect(all).not.toContain("expanded_pv_scales");
    const both = await mount({
      ...CFG,
      entities: {
        ...(CFG.entities as object),
        solar: [
          { entity: "sensor.roof", kwp: 8 },
          { entity: "sensor.balcony", kwp: 0.8 },
        ],
      },
    } as RawConfig);
    expect(names(both)).toContain("expanded_pv_scales");
    const one = await mount({ ...CFG, view: { modes: ["current"] } } as RawConfig);
    expect(names(one)).not.toContain("expanded_modes");
    expect(names(one)).toContain("quick_style");
  });

  it("shows the default style and writes nothing while it is left alone", async () => {
    const el = await mount(CFG);
    const form = forms(el)[0];
    expect(form.data.quick_style).toBe("segment");
    const saved = echo(el, form, { ...form.data, title: "T" });
    expect((saved?.view as Record<string, unknown>).quick_style).toBeUndefined();
    expect((saved?.view as Record<string, unknown>).expanded).toBeUndefined();
  });

  it("writes the style and the expanded quick buttons in their fixed order", async () => {
    const el = await mount(CFG);
    const form = forms(el)[0];
    const saved = echo(el, form, {
      ...form.data,
      quick_style: "single",
      expanded_pv_scales: true,
      expanded_modes: true,
    });
    expect(saved?.view).toMatchObject({ quick_style: "single", expanded: ["modes", "pv_scales"] });
  });

  it("opens with what the YAML says; a hidden switch keeps its entry (#19)", async () => {
    const el = await mount({
      ...CFG,
      view: { ...(CFG.view as object), modes: ["current"], expanded: ["modes", "energy_periods"] },
    } as RawConfig);
    const form = forms(el)[0];
    expect(form.data.expanded_energy_periods).toBe(true);
    const saved = echo(el, form, { ...form.data, title: "T" });
    expect((saved?.view as Record<string, unknown>).expanded).toEqual(["modes", "energy_periods"]);
  });
});

describe("F: a select left out of the YAML shows the card's default (E-1)", () => {
  // The same as for the switches (block C): shown, never written while left
  // alone - an empty select said nothing about what the card does (25.10.2026).
  const BARE = {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.s", grid: "sensor.g", house: "sensor.h" },
  } as unknown as RawConfig;

  it("every select shows what the card does", async () => {
    const data = forms(await mount(BARE))[0].data;
    expect(data).toMatchObject({
      layout: "cross",
      flow_lines: "curved",
      appearance: "auto",
      ring_animation: "overtake",
      power_unit: "kW",
      power_decimals: 2,
      inactive_lines: "show",
      animation: "auto",
      design: "none",
      quick_style: "segment",
    });
  });

  it("the labels of the main entities come right after them, the PV sources next (Z-10)", async () => {
    const el = await mount({
      ...BARE,
      entities: { ...BARE.entities, solar: [{ entity: "sensor.a" }, { entity: "sensor.b" }] },
    } as unknown as RawConfig);
    const headings = [
      ...(el.shadowRoot?.querySelectorAll("ha-expansion-panel > [slot=header]") ?? []),
    ].map((h) => h.textContent?.trim());
    // Folded like every other panel: open it pushed all below out of sight (Markus 27.10.2026).
    expect(el.shadowRoot?.querySelector(".sources-panel")?.hasAttribute("expanded")).toBe(false);
    expect(headings.slice(0, 4)).toEqual([
      "Basis-Entitäten",
      "Basis-Entitäten: Beschriftung & Zusatzwerte",
      "PV-Quellen",
      "Verbraucher",
    ]);
  });

  it("the line form follows the arrangement: straight beside the cross", async () => {
    const data = forms(await mount({ ...BARE, layout: "triangle" } as RawConfig))[0].data;
    expect(data.flow_lines).toBe("straight");
  });

  it("automatic units show their digits", async () => {
    const data = forms(await mount({ ...BARE, power: { unit: "auto" } } as RawConfig))[0].data;
    expect(data.power_digits).toBe(3);
  });

  it("a default shown and left alone is never written", async () => {
    const el = await mount(BARE);
    const form = forms(el)[0];
    const saved = echo(el, form, { ...form.data, title: "T" }) as Record<string, unknown>;
    expect(saved.title).toBe("T");
    for (const key of ["layout", "appearance", "flow", "power", "ring", "view"]) {
      expect(saved[key], key).toBeUndefined();
    }
  });

  it("a value picked is written, the default too once it was set", async () => {
    const el = await mount(BARE);
    const form = forms(el)[0];
    const saved = echo(el, form, { ...form.data, layout: "triangle", animation: "off" }) as Record<
      string,
      unknown
    >;
    expect(saved.layout).toBe("triangle");
    expect(saved.flow).toEqual({ animation: "off" });
  });

  it("the arrows' colours: left alone nothing is written, switched off 'direction' (C-8)", async () => {
    const el = await mount(BARE);
    const form = forms(el)[0];
    expect((echo(el, form, { ...form.data }) as Record<string, unknown>)?.colors).toBeUndefined();
    const box = el.shadowRoot?.querySelector<HTMLInputElement>("input.arrow-colors");
    expect(box?.checked).toBe(true);
    let saved: RawConfig | undefined;
    el.addEventListener("config-changed", (ev) => {
      saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
    });
    box?.click();
    expect(saved?.colors?.arrows).toBe("direction");
  });

  it("the battery-centre triangle can be picked and is written as such (AN-6)", async () => {
    const el = await mount(BARE);
    const form = forms(el)[0];
    const saved = echo(el, form, { ...form.data, layout: "triangle_battery" }) as Record<
      string,
      unknown
    >;
    expect(saved.layout).toBe("triangle_battery");
    expect(
      forms(await mount({ ...BARE, layout: "triangle_battery" } as RawConfig))[0].data.layout,
    ).toBe("triangle_battery");
  });
});
