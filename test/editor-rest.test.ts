// @vitest-environment happy-dom
/**
 * The rest row as an entry of the consumer list (REQ L-21, E-4): shown at the
 * end while the YAML has none, written as `type: rest` only once it is changed
 * or moved - and then without the older keys list.rest_label, icons.rest,
 * colors.rest, whose values it takes along (N-12).
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
type Field = { name?: string; schema?: Field[]; selector?: Record<string, unknown> };
type Form = HTMLElement & { data: Record<string, unknown>; schema: Field[] };

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
  list: { rest_label: "Sonstiges" },
  icons: { rest: "mdi:cloud-question" },
  colors: { rest: "#123456" },
};

async function mount(config: RawConfig): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = hass;
  el.setConfig(config);
  document.body.appendChild(el);
  await el.updateComplete;
  await unfoldAll(el);
  for (const panel of el.shadowRoot?.querySelectorAll(".rest-entry") ?? []) {
    panel.dispatchEvent(new CustomEvent("expanded-will-change", { detail: { expanded: true } }));
  }
  await el.updateComplete;
  return el;
}

/** Consumer entries and the rest entry, in the order they stand. */
const items = (el: Editor) => [
  ...(el.shadowRoot?.querySelectorAll(".consumer-list > .consumer, .consumer-list > .rest-entry") ??
    []),
];
const names = (el: Editor) =>
  items(el).map((e) =>
    e.classList.contains("rest-entry")
      ? `rest:${e.querySelector(".consumer-name")?.textContent?.trim()}`
      : e.querySelector(".consumer-name")?.textContent?.trim(),
  );
const restEntry = (el: Editor) => el.shadowRoot?.querySelector(".rest-entry") as HTMLElement;
const restForm = (el: Editor) => restEntry(el).querySelector("ha-form") as Form;
const fieldNames = (fields: Field[] = []): string[] =>
  fields.flatMap((f) => (f.schema ? fieldNames(f.schema) : f.name ? [f.name] : []));

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

const setRest = (el: Editor, patch: Record<string, unknown>) =>
  act(el, () =>
    restForm(el).dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: { ...restForm(el).data, ...patch } },
        bubbles: true,
        composed: true,
      }),
    ),
  );

const move = (el: Editor, oldIndex: number, newIndex: number) =>
  act(el, () =>
    (el.shadowRoot?.querySelector("ha-sortable") as HTMLElement).dispatchEvent(
      new CustomEvent("item-moved", { detail: { oldIndex, newIndex } }),
    ),
  );

describe("editor - the rest entry (REQ L-21)", () => {
  beforeAll(async () => {
    await import("../src/editor");
  });

  it("shows the rest at the end of the list while the YAML has no entry", async () => {
    const el = await mount(BASE);
    expect(names(el)).toEqual(["Wallbox", "Pump", "rest:Sonstiges"]);
  });

  it("has no entity, no remove button, no condition and no idle value", async () => {
    const el = await mount(BASE);
    expect(restEntry(el).querySelector(".remove")).toBeNull();
    const fields = fieldNames(restForm(el).schema);
    expect(fields).toEqual(expect.arrayContaining(["name", "icon", "min_w", "position", "show"]));
    // Its own entity, that is; the extra values have one each.
    expect(restForm(el).schema.map((f) => f.name)).not.toContain("entity");
    expect(fields).not.toContain("idle_value");
    const show = restForm(el)
      .schema.flatMap(function all(f: Field): Field[] {
        return f.schema ? f.schema.flatMap(all) : [f];
      })
      .find((f) => f.name === "show");
    const options = (show?.selector?.select as { options: { value: string }[] }).options;
    expect(options.map((o) => o.value)).toEqual(["", "always"]);
  });

  it("shows the older keys in the entry", async () => {
    const el = await mount(BASE);
    expect(restForm(el).data).toMatchObject({ name: "Sonstiges", icon: "mdi:cloud-question" });
  });

  it("has no rest label under List and no rest icon under Icons any more", async () => {
    const el = await mount(BASE);
    const all = fieldNames(topSchema(el) as Field[]);
    expect(all).not.toContain("rest_label");
    expect(all).not.toContain("icon_rest");
  });

  it("writes nothing for the rest while another consumer changes", async () => {
    const el = await mount(BASE);
    const saved = await move(el, 1, 0);
    expect(saved.consumers?.map((c) => c.entity)).toEqual(["sensor.pump", "sensor.wallbox"]);
    expect(saved.consumers?.some((c) => (c as { type?: string }).type === "rest")).toBe(false);
    expect(saved.list?.rest_label).toBe("Sonstiges");
    expect(saved.icons?.rest).toBe("mdi:cloud-question");
  });

  it("a change writes the entry, takes the older values along and drops their keys", async () => {
    const el = await mount(BASE);
    const saved = await setRest(el, { position: "bottom" });
    expect(saved.consumers?.[2]).toEqual({
      type: "rest",
      name: "Sonstiges",
      icon: "mdi:cloud-question",
      color: "#123456",
      position: "bottom",
    });
    expect(saved.list?.rest_label).toBeUndefined();
    expect(saved.icons?.rest).toBeUndefined();
    expect(saved.colors?.rest).toBeUndefined();
    expect(names(el)).toEqual(["Wallbox", "Pump", "rest:Sonstiges"]);
  });

  it("a move across the rest writes it at its place", async () => {
    const el = await mount(BASE);
    const saved = await move(el, 2, 0);
    expect(saved.consumers?.map((c) => (c as { type?: string }).type ?? c.entity)).toEqual([
      "rest",
      "sensor.wallbox",
      "sensor.pump",
    ]);
    expect(names(el)).toEqual(["rest:Sonstiges", "Wallbox", "Pump"]);
  });

  it("keeps a rest entry from the YAML where it stands and edits it there", async () => {
    const el = await mount({
      ...BASE,
      list: undefined,
      icons: undefined,
      colors: undefined,
      consumers: [
        { entity: "sensor.wallbox", name: "Wallbox" },
        { type: "rest", name: "Other" },
        { entity: "sensor.pump", name: "Pump" },
      ],
    } as unknown as RawConfig);
    expect(names(el)).toEqual(["Wallbox", "rest:Other", "Pump"]);
    const saved = await setRest(el, { show: "always" });
    expect(saved.consumers?.[1]).toEqual({ type: "rest", name: "Other", show: "always" });
  });

  it("drops an idle value the form could not have shown", async () => {
    const el = await mount(BASE);
    const saved = await setRest(el, {
      indicators: { bar_top: { entity: "sensor.outside" }, idle_value: "bar_top" },
    });
    expect((saved.consumers?.[2] as unknown as Record<string, unknown>).indicators).toEqual({
      bar_top: { entity: "sensor.outside" },
    });
  });

  it("puts a new consumer before the rest that is not in the YAML yet", async () => {
    const el = await mount(BASE);
    const add = el.shadowRoot?.querySelector(".add-consumer") as HTMLButtonElement;
    await act(el, () => add.click());
    expect(names(el)).toHaveLength(4);
    expect(names(el)[3]).toBe("rest:Sonstiges");
  });

  it("writes the rest's colour into its entry (a change to the rest)", async () => {
    const el = await mount(BASE);
    (el.shadowRoot?.querySelector('button.swatch[data-key="node:rest"]') as HTMLElement).click();
    await el.updateComplete;
    const hex = el.shadowRoot?.querySelector(".picker .hex") as HTMLInputElement;
    expect(hex.value).toBe("#123456");
    const saved = await act(el, () => {
      hex.value = "#3366cc";
      hex.dispatchEvent(new Event("change"));
    });
    expect(saved.colors?.rest).toBeUndefined();
    expect(saved.consumers?.[2]).toMatchObject({
      type: "rest",
      color: "#3366cc",
      name: "Sonstiges",
    });
  });

  it("gives the consumers' colour rows the palette colours as if the rest were not there", async () => {
    const el = await mount({
      ...BASE,
      consumers: [{ type: "rest" }, { entity: "sensor.wallbox" }],
    } as unknown as RawConfig);
    const first = el.shadowRoot?.querySelector('button.swatch[data-key="consumer:1"]');
    expect(first).not.toBeNull();
    expect(el.shadowRoot?.querySelector('button.swatch[data-key="consumer:0"]')).toBeNull();
  });
});

describe("editor - the rest entry, review cases (REQ L-21)", () => {
  beforeAll(async () => {
    await import("../src/editor");
  });

  it("offers no list scope without consumers, rest entry or not", async () => {
    const el = await mount({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar", grid: "sensor.grid" },
    } as RawConfig);
    expect(fieldNames(topSchema(el) as Field[])).not.toContain("scope");
  });

  it("clears a name the form showed from the older key", async () => {
    const el = await mount(BASE);
    const { name: _gone, ...without } = restForm(el).data;
    const saved = await act(el, () =>
      restForm(el).dispatchEvent(new CustomEvent("value-changed", { detail: { value: without } })),
    );
    expect((saved.consumers?.[2] as unknown as Record<string, unknown>).name).toBeUndefined();
    expect(saved.list?.rest_label).toBeUndefined();
  });

  it("keeps a further rest entry and an unknown type as written, shown as skipped", async () => {
    const el = await mount({
      ...BASE,
      consumers: [
        { type: "rest", name: "One" },
        { type: "rest", name: "Two" },
        { type: "section", label: "x" },
        { entity: "sensor.wallbox" },
      ],
    } as unknown as RawConfig);
    expect(el.shadowRoot?.querySelectorAll(".ignored-entry")).toHaveLength(2);
    const saved = await move(el, 3, 0);
    expect(saved.consumers?.map((c) => (c as { type?: string }).type ?? c.entity)).toEqual([
      "sensor.wallbox",
      "rest",
      "rest",
      "section",
    ]);
  });

  it("keeps the rest's icon field where the consumer list is no list (#19)", async () => {
    const el = await mount({ ...BASE, consumers: "oops" } as unknown as RawConfig);
    const all = fieldNames(topSchema(el) as Field[]);
    // The name stands with the list settings, which such a card never showed.
    expect(all).toContain("icon_rest");
  });
});
