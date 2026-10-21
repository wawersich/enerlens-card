// @vitest-environment happy-dom
/**
 * The editor builds what is on screen and nothing else (REQ E-3, E-4, EL-I2).
 *
 * ha-form builds the fields of folded groups too, and every entity picker in
 * Home Assistant walks all entities of the installation. With every group in
 * one form, a cold first open took 1.6 s in Firefox and showed only the
 * consumers and colours for the first second. So each top-level section and
 * each consumer entry carries its form only once it has been unfolded - and
 * keeps it from then on, so focus and a half-typed value survive folding.
 *
 * ha-form is an empty element here; what is checked is what the editor hands
 * it, which is what Home Assistant would build.
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { HomeAssistant, RawConfig } from "../src/types";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  shadowRoot: ShadowRoot | null;
};
type Field = { name?: string; type?: string; schema?: Field[]; selector?: Record<string, unknown> };
type Form = HTMLElement & { data: Record<string, unknown>; schema: Field[] };

const hass = {
  states: {},
  locale: { language: "de", number_format: "language" as const },
  language: "de",
  callWS: async () => ({}) as never,
} as HomeAssistant;

const CONFIG: RawConfig = {
  type: "custom:enerlens-card",
  entities: {
    solar: "sensor.solar",
    grid: "sensor.grid",
    house: "sensor.house",
    battery: "sensor.battery",
    battery_soc: "sensor.soc",
  },
  consumers: [
    { entity: "sensor.wallbox", name: "Wallbox", charge: { soc: "sensor.car" } },
    { entity: "sensor.pump", name: "Pump" },
  ],
  icons: { solar: "mdi:solar-power" },
};

async function mount(config: RawConfig = CONFIG): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = hass;
  el.setConfig(config);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const forms = (root: ParentNode | null | undefined): Form[] =>
  [...(root?.querySelectorAll("ha-form") ?? [])] as unknown as Form[];
const section = (el: Editor, name: string) =>
  el.shadowRoot?.querySelector(`.section[data-section="${name}"]`) as HTMLElement;
const consumer = (el: Editor, index: number) =>
  el.shadowRoot?.querySelectorAll(".consumer")[index] as HTMLElement;

/** What the panel announces when it is clicked open or shut. */
async function toggle(el: Editor, panel: HTMLElement, expanded: boolean) {
  panel.dispatchEvent(new CustomEvent("expanded-will-change", { detail: { expanded } }));
  panel.dispatchEvent(new CustomEvent("expanded-changed", { detail: { expanded } }));
  await el.updateComplete;
}

/** Every selector type anywhere in a schema, groups walked through. */
function selectors(fields: Field[]): string[] {
  return fields.flatMap((f) => [
    ...Object.keys(f.selector ?? {}),
    ...(f.schema ? selectors(f.schema) : []),
  ]);
}

describe("editor - builds only what is unfolded (REQ E-3, EL-I2)", () => {
  beforeAll(async () => {
    await import("../src/editor");
  });

  it("opens with the title field alone, every section and entry folded and empty", async () => {
    const el = await mount();
    const all = forms(el.shadowRoot);
    expect(all).toHaveLength(1);
    expect(all[0].schema.map((f) => f.name)).toEqual(["title"]);
    // Not one entity or icon picker - those are what made the first open slow.
    expect(selectors(all[0].schema)).toEqual(["text"]);
    const panels = [...(el.shadowRoot?.querySelectorAll(".section") ?? [])] as HTMLElement[];
    expect(panels.map((p) => p.dataset.section)).toEqual([
      "entities",
      "nodes",
      "grid_status",
      "display",
      "smoothing",
      "energy",
      "list_scope",
      "flow",
      "icons",
    ]);
    for (const panel of panels) expect(forms(panel)).toHaveLength(0);
    expect(forms(consumer(el, 0))).toHaveLength(0);
    expect(forms(consumer(el, 1))).toHaveLength(0);
  });

  it("builds a section's form as it unfolds, on the whole form data", async () => {
    const el = await mount();
    await toggle(el, section(el, "entities"), true);
    const [inner] = forms(section(el, "entities"));
    expect(inner).toBeTruthy();
    expect(inner.schema.map((f) => f.name)).toEqual([
      "entities_solar",
      "entities_grid",
      "entities_house",
      "entities_battery",
      "colors_hint",
    ]);
    // The same flat data the title form has: any piece may report any field.
    expect(inner.data).toBe(forms(el.shadowRoot)[0].data);
    // The others stay unbuilt.
    expect(forms(section(el, "icons"))).toHaveLength(0);
  });

  it("keeps a built form when the section folds again", async () => {
    const el = await mount();
    await toggle(el, section(el, "display"), true);
    const before = forms(section(el, "display"))[0];
    await toggle(el, section(el, "display"), false);
    expect(forms(section(el, "display"))[0]).toBe(before);
  });

  it("keeps it built through typing and through an outside edit", async () => {
    const el = await mount();
    await toggle(el, section(el, "flow"), true);
    const before = forms(section(el, "flow"))[0];
    let saved: RawConfig | undefined;
    el.addEventListener("config-changed", (ev) => {
      saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
    });
    before.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: { ...before.data, min_w: 25 } } }),
    );
    expect(saved?.flow).toEqual({ min_w: 25 });
    el.setConfig(saved as RawConfig);
    await el.updateComplete;
    expect(forms(section(el, "flow"))[0]).toBe(before);
    // A YAML edit resets the form's data, not what has been unfolded.
    el.setConfig({ ...CONFIG, title: "Outside" });
    await el.updateComplete;
    expect(forms(section(el, "flow"))).toHaveLength(1);
  });

  it("keeps the group's own help above its fields, as ha-form-expandable did", async () => {
    const el = await mount();
    const help = section(el, "grid_status").querySelector(".section-description");
    expect(help?.textContent).toMatch(/Netzausfall/);
    // Said once: not again under the entity picker.
    await toggle(el, section(el, "grid_status"), true);
    const [inner] = forms(section(el, "grid_status")) as unknown as Array<
      Form & { computeHelper: (f: Field) => string }
    >;
    expect(inner.computeHelper({ name: "grid_status" })).toBe("");
    expect(section(el, "display").querySelector(".section-description")).toBeNull();
  });

  it("builds a consumer entry's form as it unfolds, its charge section included", async () => {
    const el = await mount();
    await toggle(el, consumer(el, 0), true);
    const [inner] = forms(consumer(el, 0));
    expect(inner.schema.map((f) => f.name)).toContain("charge");
    expect(forms(consumer(el, 1))).toHaveLength(0);
    await toggle(el, consumer(el, 0), false);
    expect(forms(consumer(el, 0))[0]).toBe(inner);
  });

  it("ignores the charge section unfolding and folding inside an entry", async () => {
    const el = await mount();
    await toggle(el, consumer(el, 0), true);
    const [inner] = forms(consumer(el, 0));
    for (const expanded of [true, false]) {
      for (const type of ["expanded-will-change", "expanded-changed"]) {
        inner.dispatchEvent(
          new CustomEvent(type, { detail: { expanded }, bubbles: true, composed: true }),
        );
      }
    }
    await el.updateComplete;
    expect((consumer(el, 0) as HTMLElement & { expanded: boolean }).expanded).toBe(true);
    expect(forms(consumer(el, 0))[0]).toBe(inner);
  });

  it("builds a new entry straight away, and keeps it when it folds", async () => {
    const el = await mount();
    (el.shadowRoot?.querySelector(".add-consumer") as HTMLElement).click();
    await el.updateComplete;
    const [inner] = forms(consumer(el, 2));
    expect(inner).toBeTruthy();
    // Opened from code, so the panel announced nothing - folding it must not
    // take the half-filled form away.
    await toggle(el, consumer(el, 2), false);
    expect(forms(consumer(el, 2))[0]).toBe(inner);
  });
});
