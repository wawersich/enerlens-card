// @vitest-environment happy-dom
/**
 * The editor's job is not to lose configuration. A form cannot express split
 * or derived entities, and the failure mode of card editors is flattening them
 * on save (REQ E-1, G-5).
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { HomeAssistant, RawConfig } from "../src/types";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  shadowRoot: ShadowRoot | null;
};

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

/** Reproduces what ha-form emits when a field changes. */
function change(el: Editor, patch: Record<string, unknown>): RawConfig {
  const form = el.shadowRoot?.querySelector("ha-form") as HTMLElement & { data: unknown };
  let saved: RawConfig | undefined;
  el.addEventListener("config-changed", (ev) => {
    saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
  });
  form.dispatchEvent(
    new CustomEvent("value-changed", {
      detail: { value: { ...(form.data as object), ...patch } },
    }),
  );
  if (!saved) throw new Error("no config-changed event");
  return saved;
}

describe("editor", () => {
  beforeAll(async () => {
    await import("../src/editor");
  });

  it("does not offer a field for a split entity", async () => {
    const el = await mount(SPLIT_BATTERY);
    const form = el.shadowRoot?.querySelector("ha-form") as HTMLElement & {
      schema: Array<{ name: string; schema?: Array<{ name: string }> }>;
    };
    const entities = form.schema.find((g) => g.name === "entities");
    const names = entities?.schema?.map((f) => f.name) ?? [];
    expect(names, "battery must not be editable here").not.toContain("battery");
    // The plain ones stay editable.
    expect(names).toContain("solar");
    expect(names).toContain("battery_soc");
  });

  it("keeps the split entity when something else is saved (REQ E-1)", async () => {
    const el = await mount(SPLIT_BATTERY);
    const saved = change(el, { update_interval_s: 10 });
    expect(saved.update_interval_s).toBe(10);
    // The whole point: editing an unrelated field must not flatten the battery.
    expect(saved.entities?.battery).toEqual({
      discharge: "sensor.bat_out",
      charge: "sensor.bat_in",
    });
  });

  it("names the affected fields in the notice", async () => {
    const el = await mount(SPLIT_BATTERY);
    const alert = el.shadowRoot?.querySelector("ha-alert");
    expect(alert, "no notice shown").toBeTruthy();
    expect(alert?.textContent).toContain("Batterieleistung");
  });

  it("stays out of the way for a plain configuration", async () => {
    const el = await mount({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" },
    });
    expect(el.shadowRoot?.querySelector("ha-alert")).toBeFalsy();
    const form = el.shadowRoot?.querySelector("ha-form") as HTMLElement & {
      schema: Array<{ name: string; schema?: Array<{ name: string }> }>;
    };
    const names = form.schema.find((g) => g.name === "entities")?.schema?.map((f) => f.name) ?? [];
    expect(names).toContain("battery");
  });
});
