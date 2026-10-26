// @vitest-environment happy-dom
/**
 * The editor with several PV sources (REQ PV-6, PV-9, QB-7): the list keeps
 * what it holds, a single plain source stays an entity, the PV scale offers
 * only what the sources can give, and nothing it writes is refused by the
 * card (E-1).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import type { HomeAssistant, RawConfig } from "../src/types";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  shadowRoot: ShadowRoot | null;
};

const HASS = {
  states: {},
  locale: { language: "en", number_format: "language" as const },
  language: "en",
  callWS: async () => ({}) as never,
} as unknown as HomeAssistant;

const SOURCES = [
  { entity: "sensor.roof", name: "Roof", kwp: 8 },
  { entity: "sensor.balcony", kwp: 0.8, house: "excluded" },
];

async function mount(config: Record<string, unknown>): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = HASS;
  el.setConfig({ type: "custom:enerlens-card", ...config } as RawConfig);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

type Inner = {
  _flat: Record<string, unknown>;
  _emit(flat: Record<string, unknown>): void;
};

/** Emits a changed form state, as a field would, and returns what is saved. */
function save(el: Editor, patch: Record<string, unknown>): Record<string, unknown> {
  const editor = el as unknown as Inner;
  let saved: Record<string, unknown> | undefined;
  const listener = (ev: Event) => {
    saved = (ev as CustomEvent<{ config: Record<string, unknown> }>).detail.config;
  };
  el.addEventListener("config-changed", listener);
  editor._emit({ ...editor._flat, ...patch });
  el.removeEventListener("config-changed", listener);
  if (!saved) throw new Error("no config-changed");
  return saved;
}

beforeAll(async () => {
  await import("../src/editor");
});

describe("PV sources in the editor (PV-9)", () => {
  it("opens a list as 'several sources' with every row", async () => {
    const el = await mount({ entities: { solar: SOURCES, grid: "sensor.grid" } });
    const flat = (el as unknown as Inner)._flat;
    expect(flat.solar_source).toBe("sources");
    expect(flat.solar_sources).toEqual([
      { entity: "sensor.roof", name: "Roof", kwp: 8, excluded: false },
      { entity: "sensor.balcony", kwp: 0.8, excluded: true },
    ]);
    expect(el.shadowRoot?.querySelector(".sources-panel")).toBeTruthy();
    expect(el.shadowRoot?.querySelectorAll(".sources-panel .source")).toHaveLength(2);
  });

  it("shows the switch on for a source with house: excluded - in the form drawn (PV-3)", async () => {
    const el = await mount({ entities: { solar: SOURCES, grid: "sensor.grid" } });
    const forms = [...(el.shadowRoot?.querySelectorAll(".sources-panel .source ha-form") ?? [])];
    const data = forms.map((f) => (f as unknown as { data: Record<string, unknown> }).data);
    expect(data.map((d) => d.excluded)).toEqual([false, true]);
  });

  it("an edit elsewhere leaves the list as it is", async () => {
    const el = await mount({ entities: { solar: SOURCES, grid: "sensor.grid" } });
    const saved = save(el, { title: "PV" });
    expect((saved.entities as Record<string, unknown>).solar).toEqual(SOURCES);
  });

  it("writes the rows back, the tick as house: excluded, an empty row left out (E-1)", async () => {
    const el = await mount({ entities: { solar: SOURCES, grid: "sensor.grid" } });
    const saved = save(el, {
      solar_sources: [
        { entity: "sensor.roof", name: "Roof", kwp: 8, excluded: true },
        { entity: "sensor.balcony", kwp: 0.8, excluded: false },
        {},
      ],
    });
    const solar = (saved.entities as Record<string, unknown>).solar;
    expect(solar).toEqual([
      { entity: "sensor.roof", name: "Roof", kwp: 8, house: "excluded" },
      { entity: "sensor.balcony", kwp: 0.8 },
    ]);
    expect(() => normalizeConfig(saved as RawConfig)).not.toThrow();
  });

  it("a single source with nothing else said is the plain entity it always was", async () => {
    const el = await mount({ entities: { solar: SOURCES, grid: "sensor.grid" } });
    const saved = save(el, { solar_sources: [{ entity: "sensor.roof", excluded: false }] });
    expect((saved.entities as Record<string, unknown>).solar).toBe("sensor.roof");
  });

  it("switching from one entity to several starts the list empty and writes nothing yet", async () => {
    const el = await mount({ entities: { solar: "sensor.pv", grid: "sensor.grid" } });
    const saved = save(el, { solar_source: "sources", solar_sources: [{}] });
    expect((saved.entities as Record<string, unknown>).solar).toBeUndefined();
  });
});

describe("the PV scale in the editor (PV-6, QB-6)", () => {
  const part = (el: Editor) =>
    [...(el.shadowRoot?.querySelectorAll("fieldset.part") ?? [])].find(
      (f) => f.querySelector("legend")?.textContent === "PV scale",
    );

  it("a part of the quick buttons when there are sources and a ring", async () => {
    const el = await mount({ entities: { solar: SOURCES, grid: "sensor.grid" } });
    const editor = el as unknown as { _builtSections: Set<string>; requestUpdate(): void };
    editor._builtSections.add("quick_buttons");
    editor.requestUpdate();
    await el.updateComplete;
    expect(part(el)).toBeTruthy();
  });

  it("none for one entity", async () => {
    const el = await mount({ entities: { solar: "sensor.pv", grid: "sensor.grid" } });
    const editor = el as unknown as { _builtSections: Set<string>; requestUpdate(): void };
    editor._builtSections.add("quick_buttons");
    editor.requestUpdate();
    await el.updateComplete;
    expect(part(el)).toBeUndefined();
  });

  it("writes the ticked scales and the start value", async () => {
    const el = await mount({ entities: { solar: SOURCES, grid: "sensor.grid" } });
    const saved = save(el, { pv_scales: ["peak"], default_pv_scale: "peak" });
    expect(saved.view).toEqual({ pv_scales: ["peak"], default_pv_scale: "peak" });
  });

  it("the switches for PV ring and PV rows reach the YAML", async () => {
    const el = await mount({ entities: { solar: SOURCES, grid: "sensor.grid" } });
    const saved = save(el, { ring_solar: false, list_solar: true });
    expect(saved.ring).toEqual({ solar: false });
    expect(saved.list).toEqual({ solar: true });
  });
});

describe("show_selector: false fixes the PV scale too (QB-7)", () => {
  it("is translated on opening into a list with its start value", async () => {
    const el = await mount({
      entities: { solar: SOURCES, grid: "sensor.grid" },
      view: { show_selector: false, default_pv_scale: "peak" },
    });
    let saved: Record<string, unknown> | undefined;
    el.addEventListener("config-changed", (ev) => {
      saved = (ev as CustomEvent<{ config: Record<string, unknown> }>).detail.config;
    });
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { solar: SOURCES, grid: "sensor.grid" },
      view: { show_selector: false, default_pv_scale: "peak" },
    } as RawConfig);
    await new Promise((r) => setTimeout(r, 0));
    expect((saved?.view as Record<string, unknown>)?.pv_scales).toEqual(["peak"]);
  });
});

describe("arrangement and line form in the editor (AN-6)", () => {
  it("opens with what the YAML says", async () => {
    const el = await mount({
      entities: { solar: "sensor.pv", grid: "sensor.grid" },
      layout: "triangle",
      flow: { lines: "curved" },
    });
    const flat = (el as unknown as Inner)._flat;
    expect(flat.layout).toBe("triangle");
    expect(flat.flow_lines).toBe("curved");
  });

  it("writes both to the YAML, and the card takes them (E-1)", async () => {
    const el = await mount({ entities: { solar: "sensor.pv", grid: "sensor.grid" } });
    const saved = save(el, { layout: "square_left", flow_lines: "curved" });
    expect(saved.layout).toBe("square_left");
    expect(saved.flow).toEqual({ lines: "curved" });
    const config = normalizeConfig(saved as RawConfig);
    expect(config.layout).toBe("square_left");
    expect(config.flow.lines).toBe("curved");
  });

  it("a cleared field leaves the key out - the default again", async () => {
    const el = await mount({
      entities: { solar: "sensor.pv", grid: "sensor.grid" },
      layout: "square_right",
      flow: { lines: "curved" },
    });
    const saved = save(el, { layout: undefined, flow_lines: undefined });
    expect("layout" in saved && saved.layout !== undefined).toBe(false);
    expect(saved.flow).toBeUndefined();
  });

  it("offers the four arrangements under their names", async () => {
    const el = await mount({ entities: { solar: "sensor.pv", grid: "sensor.grid" } });
    const editor = el as unknown as { _builtSections: Set<string>; requestUpdate(): void };
    editor._builtSections.add("display");
    editor.requestUpdate();
    await el.updateComplete;
    const forms = [...(el.shadowRoot?.querySelectorAll("ha-form") ?? [])];
    const json = JSON.stringify(forms.map((f) => (f as unknown as { schema: unknown }).schema));
    for (const label of ["Cross", "Square · solar right", "Square · solar left", "Triangle"]) {
      expect(json).toContain(label);
    }
  });
});
