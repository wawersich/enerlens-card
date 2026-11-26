// @vitest-environment happy-dom
/**
 * Switching the PV between one entity and several sources must not rebuild
 * the editor (REQ E-3): every group that was open stays open, and what is
 * half typed stays. Markus 23.11.2026: picking "Mehrere Quellen" folded every
 * group of the editor.
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { HomeAssistant, RawConfig } from "../src/types";
import { unfoldAll } from "./editor-panels";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
};
type Form = HTMLElement & { data: Record<string, unknown> };

const HASS = {
  states: {},
  locale: { language: "en", number_format: "language" as const },
  language: "en",
  callWS: async () => ({}) as never,
} as unknown as HomeAssistant;

beforeAll(async () => {
  await import("../src/editor");
});

async function mount(solar: unknown): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = HASS;
  el.setConfig({
    type: "custom:enerlens-card",
    entities: { solar, grid: "sensor.grid", house: "sensor.house" },
  } as RawConfig);
  document.body.appendChild(el);
  await el.updateComplete;
  await unfoldAll(el);
  return el;
}

/** The editor's own groups, top level. */
const panels = (el: Editor) =>
  [...(el.shadowRoot?.children ?? [])].filter((c) => c.localName === "ha-expansion-panel");

const entitiesForm = (el: Editor) =>
  el.shadowRoot?.querySelector('.section[data-section="entities"] ha-form') as Form;

type Panel = HTMLElement & { expanded?: boolean };
const panel = (el: Editor, sel: string) => el.shadowRoot?.querySelector(sel) as Panel;
const section = (el: Editor, name: string) => panel(el, `.section[data-section="${name}"]`);
/** The colours' group: the one top-level panel holding the colour rows. */
const colours = (el: Editor) =>
  [...(el.shadowRoot?.children ?? [])].find(
    (c) => c.localName === "ha-expansion-panel" && c.querySelector(".colors"),
  ) as Panel;

/** What a click on a panel's header does: open it, announced and told. */
function click(p: Panel) {
  p.dispatchEvent(new CustomEvent("expanded-will-change", { detail: { expanded: true } }));
  p.expanded = true;
  p.dispatchEvent(new CustomEvent("expanded-changed", { detail: { expanded: true } }));
}

/** Picks a PV source in the entities group, as the select does. */
async function pick(el: Editor, source: string) {
  const form = entitiesForm(el);
  form.dispatchEvent(
    new CustomEvent("value-changed", { detail: { value: { ...form.data, solar_source: source } } }),
  );
  await el.updateComplete;
}

describe("switching the PV source keeps the editor as it is (E-3)", () => {
  it("one entity -> several sources: every group stays, the entities form too", async () => {
    const el = await mount("sensor.pv");
    const before = panels(el);
    const form = entitiesForm(el);
    await pick(el, "sources");
    const after = panels(el);
    for (const panel of before) expect(after).toContain(panel);
    expect(entitiesForm(el)).toBe(form);
    // The sources' own group is the only one that comes.
    expect(after.length).toBe(before.length + 1);
  });

  it("several sources -> one entity: only the sources' group goes", async () => {
    const el = await mount([{ entity: "sensor.roof" }, { entity: "sensor.balcony" }]);
    const before = panels(el);
    const form = entitiesForm(el);
    await pick(el, "entity");
    const after = panels(el);
    expect(after.length).toBe(before.length - 1);
    for (const panel of after) expect(before).toContain(panel);
    expect(entitiesForm(el)).toBe(form);
  });

  it("an open group stays open, and the sources' group opens by itself", async () => {
    const el = await mount("sensor.pv");
    const before = section(el, "entities");
    click(before);
    await el.updateComplete;
    await pick(el, "sources");
    // Looked up anew: the same element, and still open.
    const after = section(el, "entities");
    expect(after).toBe(before);
    expect(after.expanded).toBe(true);
    expect(panel(el, ".sources-panel").expanded).toBe(true);
  });

  it("groups opened by hand stay open through a YAML edit; that edit opens nothing", async () => {
    const el = await mount("sensor.pv");
    for (const p of [
      section(el, "entities"),
      panel(el, ".consumers-panel:not(.sources-panel)"),
      colours(el),
    ])
      click(p);
    await el.updateComplete;
    // A YAML edit: a config the editor did not write, now with sources.
    el.setConfig({
      type: "custom:enerlens-card",
      entities: {
        solar: ["sensor.roof", "sensor.balcony"],
        grid: "sensor.grid",
        house: "sensor.house",
      },
    } as RawConfig);
    await el.updateComplete;
    expect(section(el, "entities").expanded).toBe(true);
    expect(panel(el, ".consumers-panel:not(.sources-panel)").expanded).toBe(true);
    expect(colours(el).expanded).toBe(true);
    expect(panel(el, ".sources-panel").expanded).toBe(false);
  });

  it("the sources' group opened by hand stays open when a source is added", async () => {
    const el = await mount([{ entity: "sensor.roof" }, { entity: "sensor.balcony" }]);
    click(panel(el, ".sources-panel"));
    await el.updateComplete;
    (el.shadowRoot?.querySelector(".sources-panel .add-consumer") as HTMLButtonElement).click();
    await el.updateComplete;
    expect(panel(el, ".sources-panel").expanded).toBe(true);
  });

  it("an event of a panel nested inside a group does not fold the group", async () => {
    const el = await mount("sensor.pv");
    const entities = el.shadowRoot?.querySelector(
      '.section[data-section="entities"]',
    ) as HTMLElement & {
      expanded?: boolean;
    };
    entities.dispatchEvent(new CustomEvent("expanded-changed", { detail: { expanded: true } }));
    await el.updateComplete;
    const inner = entitiesForm(el);
    inner.dispatchEvent(
      new CustomEvent("expanded-changed", {
        detail: { expanded: false },
        bubbles: true,
        composed: true,
      }),
    );
    await el.updateComplete;
    expect(entities.expanded).toBe(true);
  });
});

describe("several sources picked: the entity chosen so far is the first source (C2, Markus 24.11.2026)", () => {
  /** What the editor writes on a pick, or undefined when it holds it. */
  async function pickAndSave(el: Editor, source: string) {
    let saved: RawConfig | undefined;
    el.addEventListener("config-changed", (ev) => {
      saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
    });
    await pick(el, source);
    return saved;
  }

  it("the PV sensor becomes the first row: nothing held, the YAML as it was", async () => {
    const el = await mount("sensor.pv");
    const saved = await pickAndSave(el, "sources");
    expect(saved?.entities?.solar).toBe("sensor.pv");
    expect(el.shadowRoot?.querySelector(".held-note")).toBeNull();
    expect(el.shadowRoot?.querySelectorAll(".sources-panel .source").length).toBe(1);
  });

  it("an inverted sensor stays inverted", async () => {
    const el = await mount({ entity: "sensor.pv", invert: true });
    const saved = await pickAndSave(el, "sources");
    expect(saved?.entities?.solar).toEqual([{ entity: "sensor.pv", invert: true }]);
  });

  /** Sets a field of the entities form, as typing or picking does. */
  async function set(el: Editor, patch: Record<string, unknown>) {
    const form = entitiesForm(el);
    form.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: { ...form.data, ...patch } } }),
    );
    await el.updateComplete;
  }
  const rows = (el: Editor) => el.shadowRoot?.querySelectorAll(".sources-panel .source").length;
  const held = (el: Editor) => el.shadowRoot?.querySelector(".held-note") !== null;

  it("no sensor chosen yet: an empty first row, held until one is", async () => {
    const el = await mount("sensor.pv");
    await set(el, { solar: undefined });
    const saved = await pickAndSave(el, "sources");
    expect(rows(el)).toBe(1);
    expect(saved).toBeUndefined();
    expect(held(el)).toBe(true);
  });

  it("derived from YAML: an empty first row, held", async () => {
    const el = await mount("derived");
    const saved = await pickAndSave(el, "sources");
    expect(rows(el)).toBe(1);
    expect(saved).toBeUndefined();
    expect(held(el)).toBe(true);
  });

  it("an entity left behind for derived is not carried", async () => {
    const el = await mount("sensor.pv");
    await set(el, { solar_source: "derived" });
    const saved = await pickAndSave(el, "sources");
    expect(saved).toBeUndefined();
    expect(held(el)).toBe(true);
  });

  it("an empty row left over from before does not stop the carry", async () => {
    const el = await mount("derived");
    await pick(el, "sources");
    await set(el, { solar_source: "entity" });
    await set(el, { solar: "sensor.x" });
    const saved = await pickAndSave(el, "sources");
    expect(saved?.entities?.solar).toBe("sensor.x");
    expect(rows(el)).toBe(1);
  });

  it("a hand-typed ref the card refuses is not turned into another one", async () => {
    const el = await mount({ entity: "sensor.pv", invert: "yes" });
    const saved = await pickAndSave(el, "sources");
    expect(saved?.entities?.solar).not.toBe("sensor.pv");
  });
});
