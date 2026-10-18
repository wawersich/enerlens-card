// @vitest-environment happy-dom
/**
 * The editor for extra values and label switches (REQ Z-10, issue #9): a group
 * "Beschriftung & Zusatzwerte" right after the main entities, one sub-section per node, a field's
 * settings only once its entity is picked, defaults kept out of the YAML, and
 * the colours with all the others under "Farben".
 */
import { beforeAll, describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import type { HomeAssistant, RawConfig } from "../src/types";
import { topSchema, unfoldAll } from "./editor-panels";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  shadowRoot: ShadowRoot | null;
};
type Field = {
  name?: string;
  type?: string;
  title?: string;
  schema?: Field[];
  selector?: Record<string, unknown>;
};
type Form = HTMLElement & { data: Record<string, unknown>; schema: Field[] };

const hass = {
  states: {},
  locale: { language: "de", number_format: "language" as const },
  language: "de",
  callWS: async () => ({}) as never,
} as HomeAssistant;

const BASE: RawConfig = {
  type: "custom:enerlens-card",
  entities: { solar: "sensor.s", grid: "sensor.g", house: "sensor.h", battery: "sensor.b" },
};

async function mount(config: RawConfig): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = hass;
  el.setConfig(config);
  document.body.appendChild(el);
  await el.updateComplete;
  await unfoldAll(el);
  return el;
}

const forms = (el: Editor): Form[] =>
  [...(el.shadowRoot?.querySelectorAll("ha-form") ?? [])] as unknown as Form[];

/** Field names under a group, nested sections walked through. */
function names(fields: Field[] = []): string[] {
  return fields.flatMap((f) => (f.schema ? names(f.schema) : f.name ? [f.name] : []));
}

function group(el: Editor, name: string): Field | undefined {
  return topSchema(el).find((g) => g.name === name);
}

function sub(el: Editor, node: string): Field | undefined {
  return group(el, "nodes")?.schema?.find((s) => s.name === `node_${node}`);
}

async function change(el: Editor, patch: Record<string, unknown>): Promise<RawConfig> {
  const form = forms(el)[0];
  let saved: RawConfig | undefined;
  const listener = (ev: Event) => {
    saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
  };
  el.addEventListener("config-changed", listener);
  form.dispatchEvent(
    new CustomEvent("value-changed", { detail: { value: { ...form.data, ...patch } } }),
  );
  el.removeEventListener("config-changed", listener);
  if (!saved) throw new Error("no config-changed event");
  el.setConfig(saved);
  await el.updateComplete;
  return saved;
}

describe("editor - nodes (REQ Z-10)", () => {
  beforeAll(async () => {
    await import("../src/editor");
  });

  it("puts the groups in the new order", async () => {
    const el = await mount(BASE);
    const panels = [...(el.shadowRoot?.children ?? [])].map((c) =>
      c.localName === "ha-form"
        ? (c as unknown as Form).schema.map((g) => g.name).join("+")
        : c.classList.contains("consumers-panel")
          ? "consumers"
          : c.classList.contains("section")
            ? (c as HTMLElement).dataset.section
            : c.localName,
    );
    expect(panels).toEqual([
      "title",
      "entities",
      "nodes",
      "consumers",
      "grid_status",
      "display",
      "flow",
      "ha-expansion-panel",
      "icons",
    ]);
  });

  it("splits the main entities into one closed section per node (E-3)", async () => {
    const el = await mount(BASE);
    const sections = group(el, "entities")?.schema ?? [];
    expect(sections.map((s) => s.name)).toEqual([
      "entities_solar",
      "entities_grid",
      "entities_house",
      "entities_battery",
      "colors_hint",
    ]);
    const titled = sections.filter((s) => s.type === "expandable");
    expect(titled.map((s) => s.title)).toEqual(["PV", "Netz", "Haus", "Batterie"]);
    expect(titled.every((s) => !("expanded" in s))).toBe(true);
    const of = (node: string) => names(sections.find((s) => s.name === `entities_${node}`)?.schema);
    expect(of("solar")).toEqual(["solar_source", "solar", "solar_invert"]);
    expect(of("battery")).toContain("battery_soc");
    // No battery: its section stays, to pick one, but without a state of charge.
    const without = await mount({ ...BASE, entities: { solar: "sensor.s", grid: "sensor.g" } });
    const battery = group(without, "entities")?.schema?.find((s) => s.name === "entities_battery");
    expect(names(battery?.schema)).toEqual(["battery_source"]);
  });

  it("has one sub-section per node, the battery only with a battery", async () => {
    const el = await mount(BASE);
    expect(group(el, "nodes")?.schema?.map((s) => s.name)).toEqual([
      "node_solar",
      "node_grid",
      "node_house",
      "node_battery",
      "colors_hint",
    ]);
    const without = await mount({ ...BASE, entities: { solar: "sensor.s", grid: "sensor.g" } });
    expect(group(without, "nodes")?.schema?.map((s) => s.name)).not.toContain("node_battery");
  });

  it("offers a state word only for grid and battery, and no inside field for the battery", async () => {
    const el = await mount(BASE);
    expect(names(sub(el, "solar")?.schema)).not.toContain("node_solar_show_state");
    expect(names(sub(el, "house")?.schema)).not.toContain("node_house_show_state");
    expect(names(sub(el, "grid")?.schema)).toContain("node_grid_show_state");
    expect(names(sub(el, "battery")?.schema)).toContain("node_battery_show_state");
    expect(names(sub(el, "battery")?.schema).some((n) => n.includes("_inside_"))).toBe(false);
  });

  it("shows a field's settings only once its entity is picked", async () => {
    const el = await mount(BASE);
    expect(names(sub(el, "house")?.schema)).toEqual([
      "node_house_show_name",
      "node_house_inside_entity",
      "node_house_label_entity",
    ]);
    await change(el, { node_house_label_entity: "sensor.autarky" });
    expect(names(sub(el, "house")?.schema)).toEqual([
      "node_house_show_name",
      "node_house_inside_entity",
      "node_house_label_entity",
      "node_house_label_prefix",
      "node_house_label_decimals",
      "node_house_label_size",
      "node_house_label_weight",
    ]);
  });

  it("writes nothing for the defaults", async () => {
    const el = await mount(BASE);
    const saved = await change(el, { title: "x" });
    expect(saved.nodes).toBeUndefined();
    const data = forms(el)[0].data;
    expect(data.node_grid_show_name).toBe(true);
    expect(data.node_grid_show_state).toBe(true);
    const withField = await change(el, { node_solar_inside_entity: "sensor.today" });
    expect(withField.nodes).toEqual({ solar: { inside: { entity: "sensor.today" } } });
    const data2 = forms(el)[0].data;
    expect(data2.node_solar_inside_size).toBe(100);
    expect(data2.node_solar_inside_position).toBe("above");
    expect(data2.node_solar_inside_decimals).toBe("ha");
    expect(data2.node_solar_inside_weight).toBe("normal");
  });

  it("writes switches off, prefix, decimals as a number and the rest as chosen", async () => {
    const el = await mount(BASE);
    const saved = await change(el, {
      node_grid_show_name: false,
      node_grid_show_state: false,
      node_house_label_entity: "sensor.autarky",
      node_house_label_prefix: "Autarkie",
      node_house_label_decimals: "0",
      node_house_label_size: 120,
      node_house_label_weight: "bold",
      node_solar_inside_entity: "sensor.today",
      node_solar_inside_position: "below",
      node_solar_inside_decimals: "sig3",
    });
    expect(saved.nodes).toEqual({
      grid: { show_name: false, show_state: false },
      house: {
        label: {
          entity: "sensor.autarky",
          prefix: "Autarkie",
          decimals: 0,
          size: 120,
          weight: "bold",
        },
      },
      solar: { inside: { entity: "sensor.today", position: "below", decimals: "sig3" } },
    });
    expect(() => normalizeConfig(saved)).not.toThrow();
  });

  it("reads a configuration back into the form unchanged", async () => {
    const config: RawConfig = {
      ...BASE,
      nodes: {
        solar: { show_name: false, inside: { entity: "sensor.today", decimals: 1 } },
        battery: {
          show_state: false,
          label: { entity: "sensor.rest", prefix: "Rest", weight: "medium", size: 80 },
        },
      },
      colors: { battery_label: "#e53935" },
    };
    const el = await mount(config);
    const saved = await change(el, {});
    expect(saved.nodes).toEqual(config.nodes);
    expect(saved.colors).toEqual(config.colors);
  });

  it("drops a field and its colour when its entity is removed", async () => {
    const el = await mount({
      ...BASE,
      nodes: { house: { label: { entity: "sensor.autarky", prefix: "Autarkie" } } },
      colors: { house_label: "#123456", solar: "#ff0000" },
    });
    const saved = await change(el, { node_house_label_entity: "" });
    expect(saved.nodes).toBeUndefined();
    expect(saved.colors).toEqual({ solar: "#ff0000" });
  });

  it("offers a colour row for each field with an entity, under Farben (REQ Z-6)", async () => {
    const el = await mount({
      ...BASE,
      nodes: { solar: { inside: { entity: "sensor.today" }, label: { entity: "sensor.fc" } } },
    });
    const ids = [...(el.shadowRoot?.querySelectorAll(".color button.swatch") ?? [])]
      .map((b) => b.getAttribute("data-key") ?? "")
      .filter((id) => id.includes("_inside") || id.includes("_label"));
    expect(ids).toEqual(["flat:color_solar_inside", "flat:color_solar_label"]);
  });

  it("labels the fields and explains the less obvious ones (REQ E-6)", async () => {
    const el = await mount({ ...BASE, nodes: { house: { label: { entity: "sensor.autarky" } } } });
    const editor = el as unknown as {
      _label: (i: { name: string }) => string;
      _helper: (i: { name: string }) => string;
    };
    expect(editor._label({ name: "node_house_label_prefix" })).toBe("Vorsatz");
    expect(editor._label({ name: "node_grid_show_state" })).toBe("Zustandswort anzeigen");
    expect(editor._helper({ name: "node_house_label_decimals" })).toContain("Genauigkeit");
    expect(editor._helper({ name: "node_house_label_entity" })).toContain("Ø");
    expect(editor._helper({ name: "node_solar_inside_position" })).not.toBe("");
    expect(sub(el, "house")?.title).toBe("Haus");
    // Not "Knoten": the entities belong to the nodes just as much (Markus, 17.10.2026).
    expect(group(el, "entities")?.title).toBe("Basis-Entitäten");
    expect(group(el, "nodes")?.title).toBe("Beschriftung & Zusatzwerte");
  });

  it("never turns an empty decimals from the YAML into text the card refuses (REQ E-1)", async () => {
    const el = await mount({
      ...BASE,
      nodes: {
        solar: { inside: { entity: "sensor.today", decimals: null as unknown as undefined } },
      },
    });
    expect(forms(el)[0].data.node_solar_inside_decimals).toBe("ha");
    const saved = await change(el, { title: "x" });
    expect(() => normalizeConfig(saved)).not.toThrow();
  });

  it("keeps decimals 0 and reads text decimals as the number they are", async () => {
    const el = await mount({
      ...BASE,
      nodes: {
        solar: { inside: { entity: "sensor.today", decimals: 0 } },
        grid: { label: { entity: "sensor.imp", decimals: "2" } },
      },
    });
    // Rewritten once the nodes are edited; an edit elsewhere leaves them as
    // typed (issue #19).
    const saved = await change(el, { node_house_show_name: false });
    expect(saved.nodes?.solar?.inside?.decimals).toBe(0);
    expect(saved.nodes?.grid?.label?.decimals).toBe(2);
  });

  it("keeps keys it does not know, so the card can still warn about them", async () => {
    const el = await mount({
      ...BASE,
      nodes: {
        house: { lable: { entity: "sensor.x" }, label: { entity: "sensor.y", colour: "red" } },
      } as RawConfig["nodes"],
    });
    const saved = await change(el, { title: "x" });
    const house = saved.nodes?.house as Record<string, unknown>;
    expect(house.lable).toEqual({ entity: "sensor.x" });
    expect((house.label as Record<string, unknown>).colour).toBe("red");
  });

  it("drops a colour for the battery's inside field, which has no row", async () => {
    const el = await mount({
      ...BASE,
      colors: { battery_inside: "#123456", solar: "#ff0000" } as RawConfig["colors"],
    });
    // Once the colours are edited; an edit elsewhere leaves them as typed (#19).
    const saved = await change(el, { color_house: "#00ff00" });
    expect(saved.colors).toEqual({ solar: "#ff0000", house: "#00ff00" });
  });

  it("writes a colour from its row and removes it again (REQ Z-6)", async () => {
    const el = await mount({ ...BASE, nodes: { house: { label: { entity: "sensor.autarky" } } } });
    const editor = el as unknown as { _applyColor: (id: string, value: string) => void };
    let saved: RawConfig | undefined;
    el.addEventListener("config-changed", (ev) => {
      saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
    });
    editor._applyColor("flat:color_house_label", "#abcdef");
    expect(saved?.colors).toEqual({ house_label: "#abcdef" });
    el.setConfig(saved as RawConfig);
    await el.updateComplete;
    editor._applyColor("flat:color_house_label", "");
    expect(saved?.colors).toBeUndefined();
  });

  it("shows no battery colour rows without a battery", async () => {
    const el = await mount({
      ...BASE,
      entities: { solar: "sensor.s", grid: "sensor.g" },
      nodes: { battery: { label: { entity: "sensor.rest" } } },
    });
    const ids = [...(el.shadowRoot?.querySelectorAll(".color button.swatch") ?? [])].map(
      (b) => b.getAttribute("data-key") ?? "",
    );
    expect(ids.some((id) => id.includes("battery_label"))).toBe(false);
  });

  it("points to the colours under main entities, labels and consumers (REQ Z-10)", async () => {
    const el = await mount(BASE);
    for (const name of ["entities", "nodes"]) {
      const last = group(el, name)?.schema?.at(-1);
      expect(last?.type, name).toBe("constant");
      expect(last?.name, name).toBe("colors_hint");
    }
    const editor = el as unknown as { _label: (i: { name: string }) => string };
    expect(editor._label({ name: "colors_hint" })).toContain("Farben");
    const consumers = el.shadowRoot?.querySelector(".consumers-panel .consumers");
    expect(consumers?.lastElementChild?.textContent).toContain("Farben");
  });

  it("keeps a key that belongs to the other field as unknown, for the card to warn about", async () => {
    const el = await mount({
      ...BASE,
      nodes: {
        house: {
          inside: { entity: "sensor.x", prefix: "A" },
          label: { entity: "sensor.y", position: "below" },
        },
      } as RawConfig["nodes"],
    });
    const saved = await change(el, { title: "x" });
    const house = saved.nodes?.house as Record<string, Record<string, unknown>>;
    expect(house.inside.prefix).toBe("A");
    expect(house.label.position).toBe("below");
  });

  it("writes neither the battery's node nor its colour without a battery (REQ Z-10, A-5)", async () => {
    const el = await mount({
      ...BASE,
      nodes: { battery: { label: { entity: "sensor.rest" } } },
      colors: { battery_label: "#123456" },
    });
    const none = await change(el, { battery_source: "none" });
    expect(none.nodes).toBeUndefined();
    expect(none.colors).toBeUndefined();
    // The form keeps them, so they return with the battery.
    const back = await change(el, { battery_source: "entity", battery: "sensor.b" });
    expect(back.nodes).toEqual({ battery: { label: { entity: "sensor.rest" } } });
    expect(back.colors).toEqual({ battery_label: "#123456" });
  });
});
