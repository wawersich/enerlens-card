// @vitest-environment happy-dom
/**
 * Clearing a field in the GUI editor must never produce a configuration the
 * card refuses (REQ E-1). ha-form does not hand back "unset": a cleared text is
 * "", a cleared number is undefined or null, a cleared select is "" - and the
 * consumer object selector leaves "" or null inside each entry. Every field the
 * form offers is cleared here, one at a time and all at once, and the result
 * has to pass normalizeConfig.
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
type Form = HTMLElement & { data: Record<string, unknown> };

const hass = {
  states: {},
  locale: { language: "de", number_format: "language" as const },
  language: "de",
  callWS: async () => ({}) as never,
} as HomeAssistant;

/** A configuration with every optional field set, so clearing each one matters. */
const FULL: RawConfig = {
  type: "custom:enerlens-card",
  title: "T",
  entities: {
    solar: { entity: "sensor.s", invert: true },
    grid: { import: "sensor.gi", export: "sensor.ge" },
    house: "sensor.h",
    battery: "sensor.b",
    battery_soc: "sensor.soc",
    grid_status: { entity: "sensor.status", outage: ["not_detected"], ok: ["ok"] },
  },
  consumers: [{ entity: "sensor.c", name: "C", color: "#123", icon: "mdi:fan", min_w: 20 }],
  min_consumer_w: 10,
  max_consumers: 5,
  update_interval_s: 5,
  list: { enabled: true, rest_label: "Rest" },
  ring: { enabled: true },
  view: {
    default_mode: "avg_short",
    avg_short_minutes: 5,
    avg_long_minutes: 15,
    show_selector: true,
  },
  flow: { inactive_lines: "dim", animation: "auto", min_w: 10 },
  colors: { solar: "#f90", rest: "#777" },
  icons: { house: "mdi:home" },
};

async function mount(config: RawConfig): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = hass;
  el.setConfig(config);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function emit(el: Editor, value: Record<string, unknown>): RawConfig {
  const form = el.shadowRoot?.querySelector("ha-form") as Form;
  let saved: RawConfig | undefined;
  const listener = (ev: Event) => {
    saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
  };
  el.addEventListener("config-changed", listener);
  form.dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
  el.removeEventListener("config-changed", listener);
  if (!saved) throw new Error("no config-changed");
  return saved;
}

/** What the various selectors leave behind when a field is cleared. */
const CLEARED: Record<string, unknown[]> = {
  text: ["", null, undefined],
  number: [undefined, null, ""],
  boolean: [undefined, null],
  select: ["", null, undefined],
  /** A multi-select hands back an empty array, and "" when the form resets it. */
  list: [[], "", null, undefined],
};

function kindOf(name: string): keyof typeof CLEARED {
  if (/^grid_status_(outage|ok)$/.test(name)) return "list";
  if (/_source$|default_mode|inactive_lines|animation|power_unit|power_decimals/.test(name))
    return "select";
  if (/_invert$|_enabled$|show_selector/.test(name)) return "boolean";
  if (/minutes|_w$|_s$|max_consumers/.test(name)) return "number";
  return "text";
}

describe("editor: clearing fields never yields an invalid configuration (REQ E-1)", () => {
  beforeAll(async () => {
    await import("../src/editor");
  });

  it("each field on its own", async () => {
    const el = await mount(FULL);
    const form = el.shadowRoot?.querySelector("ha-form") as Form;
    const fields = Object.keys(form.data).filter(
      // The three required entities and the source selectors legitimately
      // fail when emptied - that is a missing entity, not an editor artefact.
      (k) =>
        !["solar", "grid", "house", "battery", "grid_import", "grid_export"].includes(k) &&
        !k.endsWith("_source"),
    );
    const failures: string[] = [];
    for (const field of fields) {
      for (const empty of CLEARED[kindOf(field)]) {
        const el2 = await mount(FULL);
        const value = {
          ...(el2.shadowRoot?.querySelector("ha-form") as Form).data,
          [field]: empty,
        };
        const saved = emit(el2, value);
        try {
          normalizeConfig(saved);
        } catch (e) {
          failures.push(`${field} = ${JSON.stringify(empty)} -> ${(e as Error).message}`);
        }
      }
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("every consumer field cleared inside the object selector", async () => {
    for (const empty of ["", null]) {
      const el = await mount(FULL);
      const data = (el.shadowRoot?.querySelector("ha-form") as Form).data;
      const saved = emit(el, {
        ...data,
        consumers: [{ entity: "sensor.c", name: empty, color: empty, icon: empty, min_w: empty }],
      });
      expect(() => normalizeConfig(saved)).not.toThrow();
    }
  });

  it("everything optional cleared at once", async () => {
    const el = await mount(FULL);
    const data = (el.shadowRoot?.querySelector("ha-form") as Form).data;
    const value: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (
        ["solar", "grid", "house", "battery", "grid_import", "grid_export"].includes(k) ||
        k.endsWith("_source")
      )
        value[k] = v;
      else if (k === "consumers")
        value[k] = [{ entity: "sensor.c", name: "", color: "", icon: "" }];
      else value[k] = kindOf(k) === "text" || kindOf(k) === "select" ? "" : undefined;
    }
    const saved = emit(el, value);
    expect(() => normalizeConfig(saved)).not.toThrow();
  });
});
