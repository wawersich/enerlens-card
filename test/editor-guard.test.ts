// @vitest-environment happy-dom
/**
 * The editor never writes a configuration the card refuses (rule 7, REQ E-1,
 * 29.10.2026): a source chosen but not filled in yet stays in the form, the
 * preview keeps the last valid card, and the editor says what is missing.
 * Found by a hunt after Markus switched PV from several sources to one entity.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import type { HomeAssistant, RawConfig } from "../src/types";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
};
type Inner = { _flat: Record<string, unknown>; _emit(flat: Record<string, unknown>): void };

const HASS = {
  states: {},
  locale: { language: "de", number_format: "language" as const },
  language: "de",
  callWS: async () => ({}) as never,
} as unknown as HomeAssistant;

beforeAll(async () => {
  await import("../src/editor");
});

async function mount(entities: Record<string, unknown>): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = HASS;
  el.setConfig({ type: "custom:enerlens-card", entities } as RawConfig);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** What one step writes - undefined when nothing is written. */
async function step(el: Editor, patch: Record<string, unknown>) {
  const inner = el as unknown as Inner;
  let saved: RawConfig | undefined;
  const listen = (ev: Event) => {
    saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
  };
  el.addEventListener("config-changed", listen);
  inner._emit({ ...inner._flat, ...patch });
  el.removeEventListener("config-changed", listen);
  await el.updateComplete;
  return saved;
}

const note = (el: Editor) => el.shadowRoot?.querySelector(".held-note")?.textContent ?? "";

const SOURCES = [{ entity: "sensor.a", kwp: 6 }, { entity: "sensor.b" }];
const SPLIT_GRID = { import: "sensor.gi", export: "sensor.ge" };

describe("a step the card would refuse is not written (E-1, 29.10.2026)", () => {
  const cases: [string, Record<string, unknown>, Record<string, unknown>, RegExp][] = [
    [
      "PV sources -> one entity",
      { solar: SOURCES, grid: "sensor.g", house: "sensor.h" },
      { solar_source: "entity" },
      /PV/,
    ],
    ["PV entity cleared", { solar: "sensor.s", grid: "sensor.g" }, { solar: "" }, /PV/],
    [
      "PV entity -> sources without a row",
      { solar: "sensor.s", grid: "sensor.g" },
      { solar_source: "sources", solar_sources: [] },
      /PV/,
    ],
    [
      "PV derived -> entity",
      { solar: "derived", grid: "sensor.g", house: "sensor.h" },
      { solar_source: "entity" },
      /PV/,
    ],
    ["grid entity cleared", { solar: "sensor.s", grid: "sensor.g" }, { grid: "" }, /Netz/],
    [
      "grid -> split, one side only",
      { solar: "sensor.s", grid: "sensor.g" },
      { grid_source: "split", grid_import: "sensor.gi" },
      /Netz/,
    ],
    [
      "grid split, one side cleared",
      { solar: "sensor.s", grid: SPLIT_GRID },
      { grid_export: "" },
      /Netz/,
    ],
    [
      "grid derived -> entity",
      { solar: "sensor.s", grid: "derived", house: "sensor.h" },
      { grid_source: "entity" },
      /Netz/,
    ],
    [
      "house cleared beside a derived PV",
      { solar: "derived", grid: "sensor.g", house: "sensor.h" },
      { house: "" },
      /Haus/,
    ],
  ];

  for (const [label, entities, patch, named] of cases) {
    it(`${label}: nothing written, the editor says what is missing`, async () => {
      const el = await mount(entities);
      expect(await step(el, patch)).toBeUndefined();
      expect(note(el)).toMatch(named);
      // The form keeps what was chosen.
      const flat = (el as unknown as Inner)._flat;
      for (const [k, v] of Object.entries(patch)) expect(flat[k]).toEqual(v);
    });
  }

  it("writes again, and drops the note, once the step is completed", async () => {
    const el = await mount({ solar: SOURCES, grid: "sensor.g", house: "sensor.h" });
    await step(el, { solar_source: "entity" });
    const saved = await step(el, { solar: "sensor.roof" });
    expect(saved).toBeTruthy();
    expect(() => normalizeConfig(saved as RawConfig)).not.toThrow();
    expect((saved as RawConfig).entities?.solar).toBe("sensor.roof");
    expect(note(el)).toBe("");
  });

  it("still writes every ordinary change at once", async () => {
    const el = await mount({ solar: "sensor.s", grid: "sensor.g", house: "sensor.h" });
    const saved = await step(el, { title: "PV" });
    expect((saved as RawConfig).title).toBe("PV");
  });
});
