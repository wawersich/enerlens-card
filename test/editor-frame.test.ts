// @vitest-environment happy-dom
/**
 * The frame switch of a consumer and of the rest in the editor (REQ LZ-16):
 * in "Display", beside the highlight; greyed out while the card frames every
 * row, showing what the YAML says; written only as `frame: true`.
 */
import { describe, expect, it } from "vitest";
import "../src/editor";
import { normalizeConfig } from "../src/config";
import type { HomeAssistant, RawConfig } from "../src/types";
import { unfoldAll } from "./editor-panels";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  shadowRoot: ShadowRoot | null;
};
type Field = {
  name?: string;
  disabled?: boolean;
  schema?: Field[];
  selector?: Record<string, unknown>;
};
type Form = HTMLElement & {
  data: Record<string, unknown>;
  schema: Field[];
  computeLabel: (f: Field) => string;
  computeHelper: (f: Field) => string;
};

const hass = {
  states: {},
  locale: { language: "de", number_format: "language" as const },
  language: "de",
  callWS: async () => ({}) as never,
} as HomeAssistant;

const BASE: RawConfig = {
  type: "custom:enerlens-card",
  entities: { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" },
  consumers: [
    { entity: "sensor.wallbox", name: "Wallbox" },
    { entity: "sensor.pump", name: "Pump" },
  ],
};

async function mount(config: RawConfig): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = hass;
  el.setConfig(config);
  document.body.appendChild(el);
  await el.updateComplete;
  await unfoldAll(el);
  for (const panel of el.shadowRoot?.querySelectorAll(".consumer, .rest-entry") ?? []) {
    panel.dispatchEvent(new CustomEvent("expanded-will-change", { detail: { expanded: true } }));
  }
  await el.updateComplete;
  return el;
}

const flat = (fields: Field[] = []): Field[] =>
  fields.flatMap((f) => (f.schema ? flat(f.schema) : [f]));

const entry = (el: Editor, index: number | "rest") =>
  (index === "rest"
    ? el.shadowRoot?.querySelector(".rest-entry")
    : el.shadowRoot?.querySelectorAll(".consumer")[index]) as HTMLElement;

/** The entry's form that holds the frame switch. */
function frameForm(el: Editor, index: number | "rest"): Form {
  const forms = [...entry(el, index).querySelectorAll("ha-form")] as Form[];
  const form = forms.find((f) => flat(f.schema).some((x) => x.name === "frame"));
  if (!form) throw new Error("no frame switch");
  return form;
}
const frameField = (el: Editor, index: number | "rest") =>
  flat(frameForm(el, index).schema).find((f) => f.name === "frame") as Field;

async function act(el: Editor, run: () => void): Promise<RawConfig> {
  let saved: RawConfig | undefined;
  const listener = (ev: Event) => {
    saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
  };
  el.addEventListener("config-changed", listener);
  run();
  el.removeEventListener("config-changed", listener);
  if (!saved) throw new Error("no config-changed event");
  expect(() => normalizeConfig(saved as RawConfig)).not.toThrow();
  el.setConfig(saved);
  await el.updateComplete;
  return saved;
}

const set = (el: Editor, index: number | "rest", patch: Record<string, unknown>) =>
  act(el, () => {
    const form = frameForm(el, index);
    form.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: { ...form.data, ...patch } },
        bubbles: true,
        composed: true,
      }),
    );
  });

const restOf = (config: RawConfig) =>
  (config.consumers as unknown as Record<string, unknown>[]).find((c) => c.type === "rest");

describe("frame switch per entry in the editor (LZ-16)", () => {
  it("stands in Display, right after the highlight, as a switch with its label", async () => {
    const el = await mount(BASE);
    const form = frameForm(el, 0);
    const names = flat(form.schema).map((f) => f.name);
    expect(names.indexOf("frame")).toBe(names.indexOf("highlight") + 1);
    expect(form.closest(".display-panel")).not.toBeNull();
    expect(frameField(el, 0).selector).toEqual({ boolean: {} });
    expect(form.computeLabel(frameField(el, 0))).toBe("Rahmen um diesen Eintrag");
    expect(frameField(el, 0).disabled ?? false).toBe(false);
  });

  it("is off by default and writes only frame: true", async () => {
    const el = await mount(BASE);
    expect(frameForm(el, 0).data.frame ?? false).toBe(false);
    const on = await set(el, 0, { frame: true });
    expect(on.consumers?.[0]).toEqual({ entity: "sensor.wallbox", name: "Wallbox", frame: true });
    expect(frameForm(el, 0).data.frame).toBe(true);
    const off = await set(el, 0, { frame: false });
    expect(off.consumers?.[0]).toEqual({ entity: "sensor.wallbox", name: "Wallbox" });
  });

  it("leaves a written frame: false alone on another change", async () => {
    const el = await mount({
      ...BASE,
      consumers: [{ entity: "sensor.wallbox", frame: false }, { entity: "sensor.pump" }],
    });
    const saved = await set(el, 0, { name: "Auto" });
    expect(saved.consumers?.[0]).toEqual({ entity: "sensor.wallbox", name: "Auto", frame: false });
  });

  it("is greyed out while the card frames every row, showing what the YAML says", async () => {
    const el = await mount({
      ...BASE,
      list: { frame: true },
      consumers: [{ entity: "sensor.wallbox", frame: true }, { entity: "sensor.pump" }],
    });
    for (const i of [0, 1]) expect(frameField(el, i).disabled).toBe(true);
    expect(frameForm(el, 0).data.frame).toBe(true);
    expect(frameForm(el, 1).data.frame ?? false).toBe(false);
    expect(frameForm(el, 1).computeHelper(frameField(el, 1))).toBe(
      "Rahmen ist für alle Listen-Einträge eingeschaltet.",
    );
  });

  it("keeps the entry's frame: true while the card frames every row", async () => {
    const el = await mount({
      ...BASE,
      list: { frame: true },
      consumers: [{ entity: "sensor.wallbox", frame: true }, { entity: "sensor.pump" }],
    });
    const saved = await set(el, 0, { name: "Auto" });
    expect(saved.consumers?.[0]).toEqual({ entity: "sensor.wallbox", name: "Auto", frame: true });
  });

  it("follows the card's switch at once: a new form when it changes", async () => {
    const el = await mount(BASE);
    const before = frameForm(el, 0);
    const forms = [...(el.shadowRoot?.querySelectorAll("ha-form") ?? [])] as Form[];
    const global = forms.find((f) => flat(f.schema).some((x) => x.name === "list_frame"));
    if (!global) throw new Error("no list_frame switch");
    await act(el, () =>
      global.dispatchEvent(
        new CustomEvent("value-changed", {
          detail: { value: { ...global.data, list_frame: true } },
          bubbles: true,
          composed: true,
        }),
      ),
    );
    expect(frameField(el, 0).disabled).toBe(true);
    expect(frameForm(el, 0)).not.toBe(before);
  });

  it("frames the rest on its own", async () => {
    const el = await mount(BASE);
    expect(frameField(el, "rest").selector).toEqual({ boolean: {} });
    const on = await set(el, "rest", { frame: true });
    expect(restOf(on)).toEqual({ type: "rest", frame: true });
    const off = await set(el, "rest", { frame: false });
    expect(restOf(off)?.frame).toBeUndefined();
  });

  it("greys out the rest's switch too while the card frames every row", async () => {
    const el = await mount({ ...BASE, list: { frame: true } });
    expect(frameField(el, "rest").disabled).toBe(true);
  });
});
