// @vitest-environment happy-dom
/**
 * The checklist for numbers (E-1, 22.10.2026): every number field the editor
 * offers, fed what a person can type - below the minimum, above the maximum,
 * 0, -1, 0.5 and every step on the way to a value - never brings the card to
 * refuse its configuration. Where the card uses another value than the one
 * typed, the editor says so under the field.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { normalizeConfig } from "../src/config";
import type { HomeAssistant, RawConfig } from "../src/types";
import { unfoldAll } from "./editor-panels";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
};
type Field = {
  name?: string;
  schema?: Field[];
  selector?: { number?: { min?: number; max?: number } };
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
  memory_id: "numbers0",
  entities: { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" },
  consumers: [{ entity: "sensor.heat" }],
};

async function mount(config: RawConfig): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = hass;
  el.setConfig(config);
  document.body.appendChild(el);
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
  await unfoldAll(el);
  return el;
}

const forms = (el: Editor): Form[] =>
  [...(el.shadowRoot?.querySelectorAll("ha-form") ?? [])] as unknown as Form[];

/** Every number field of the main form, with its limits. */
function numberFields(el: Editor): { name: string; min?: number; max?: number }[] {
  const out = new Map<string, { name: string; min?: number; max?: number }>();
  const walk = (fields: Field[]) => {
    for (const f of fields) {
      if (f.schema) walk(f.schema);
      else if (f.name && f.selector?.number) {
        out.set(f.name, { name: f.name, min: f.selector.number.min, max: f.selector.number.max });
      }
    }
  };
  for (const form of forms(el)) walk(form.schema ?? []);
  return [...out.values()];
}

/** Types into one field as ha-form reports it; returns the emitted config. */
async function type(el: Editor, name: string, value: number): Promise<RawConfig> {
  const form = forms(el).find((f) => JSON.stringify(f.schema).includes(`"name":"${name}"`)) as Form;
  let saved: RawConfig | undefined;
  const listen = (ev: Event) => {
    saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
  };
  el.addEventListener("config-changed", listen);
  form.dispatchEvent(
    new CustomEvent("value-changed", { detail: { value: { ...form.data, [name]: value } } }),
  );
  el.removeEventListener("config-changed", listen);
  if (!saved) throw new Error(`no config-changed for ${name}`);
  el.setConfig(saved);
  await el.updateComplete;
  return saved;
}

/** "120" typed key by key: 1, 12, 120. */
const steps = (text: string) =>
  [...text].map((_, i) => Number(text.slice(0, i + 1))).filter((n) => Number.isFinite(n));

describe("every number field, whatever is typed (E-1 checklist)", () => {
  beforeAll(async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await import("../src/editor");
  });

  it("finds the number fields", async () => {
    const el = await mount(BASE);
    expect(numberFields(el).map((f) => f.name)).toEqual(
      expect.arrayContaining([
        "update_interval_s",
        "avg_short_minutes",
        "avg_long_minutes",
        "max_consumers",
        "min_consumer_w",
        "min_w",
        "peak_w",
        "max_dots",
        "slow_s",
        "fast_s",
      ]),
    );
  });

  it("never brings the card to refuse its configuration", async () => {
    const el = await mount(BASE);
    for (const field of numberFields(el)) {
      const values = new Set<number>([-1, 0, 0.5, 1, 1.5, 1e9, ...steps("120"), ...steps("0.5")]);
      if (field.min !== undefined) values.add(field.min - 1);
      if (field.max !== undefined) values.add(field.max + 1);
      for (const value of values) {
        const saved = await type(el, field.name, value);
        expect(() => normalizeConfig(saved), `${field.name} = ${value}`).not.toThrow();
      }
      el.setConfig(BASE);
      await el.updateComplete;
    }
  });

  it("says under the field what the card uses instead", async () => {
    const el = await mount(BASE);
    await type(el, "avg_long_minutes", 1);
    await el.updateComplete;
    const notes = [...(el.shadowRoot?.querySelectorAll(".field-note") ?? [])].map((n) =>
      (n.textContent ?? "").trim(),
    );
    // Plain words: what must hold (Markus 22.10.2026).
    expect(notes).toContain("Mindestens 2.");
    // The field keeps what was typed (rule 7).
    expect(forms(el).find((f) => "avg_long_minutes" in f.data)?.data.avg_long_minutes).toBe(1);
  });

  it("names both windows when they are swapped", async () => {
    const el = await mount({ ...BASE, view: { avg_short_minutes: 5, avg_long_minutes: 2 } });
    const notes = [...(el.shadowRoot?.querySelectorAll(".field-note") ?? [])].map(
      (n) => n.textContent ?? "",
    );
    expect(notes).toEqual([
      "Das kurze Fenster muss kürzer sein als das lange.",
      "Das lange Fenster muss länger sein als das kurze.",
    ]);
  });

  it("keeps the field being typed in its form when a note appears (rule 7)", async () => {
    const el = await mount(BASE);
    const holder = () =>
      forms(el).find((f) => JSON.stringify(f.schema).includes('"name":"max_dots_at_w"'));
    const before = holder();
    await type(el, "max_dots_at_w", 1);
    expect(el.shadowRoot?.querySelectorAll(".field-note").length).toBeGreaterThan(0);
    expect(holder()).toBe(before);
  });

  it("says nothing in the console while it works out the notes", async () => {
    const el = await mount({ ...BASE, view: { avg_long_minutes: 1 } });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    warn.mockClear();
    for (let i = 0; i < 3; i++) {
      el.hass = { ...hass };
      await el.updateComplete;
    }
    expect(warn).not.toHaveBeenCalled();
  });

  it("uses the card's limits in the editor", async () => {
    const el = await mount(BASE);
    const peak = numberFields(el).find((f) => f.name === "peak_w");
    expect(peak?.min).toBe(1);
  });
});
