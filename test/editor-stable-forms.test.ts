// @vitest-environment happy-dom
/**
 * The editor keeps its forms while typing (rule 7, E-3). Found 23.11.2026 by
 * two bug hunts after the PV-sources fold: a note that comes or goes above
 * the field being typed in rebuilt that field's form - focus gone after the
 * first digit, the fine-tuning group folded.
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { HomeAssistant, RawConfig } from "../src/types";

type Editor = HTMLElement & {
  setConfig: (c: RawConfig) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
};
type Field = { name?: string; expanded?: boolean; schema?: Field[] };
type Form = HTMLElement & { data: Record<string, unknown>; schema: Field[] };

const HASS = {
  states: {},
  locale: { language: "en", number_format: "language" as const },
  language: "en",
  callWS: async () => ({}) as never,
} as unknown as HomeAssistant;

beforeAll(async () => {
  await import("../src/editor");
});

async function settle(el: Editor) {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
  }
}

/** Mounted like HA does it: every config-changed comes back through setConfig. */
async function mount(extra: Record<string, unknown> = {}): Promise<Editor> {
  const el = document.createElement("enerlens-card-editor") as Editor;
  el.hass = HASS;
  el.addEventListener("config-changed", (ev) =>
    el.setConfig((ev as CustomEvent<{ config: RawConfig }>).detail.config),
  );
  el.setConfig({
    type: "custom:enerlens-card",
    entities: { solar: "sensor.pv", grid: "sensor.grid", house: "sensor.house" },
    ...extra,
  } as RawConfig);
  document.body.appendChild(el);
  await settle(el);
  for (let i = 0; i < 2; i++) {
    for (const p of el.shadowRoot?.querySelectorAll(".section, .consumer") ?? []) {
      p.dispatchEvent(new CustomEvent("expanded-will-change", { detail: { expanded: true } }));
    }
    await settle(el);
  }
  return el;
}

const forms = (el: Editor, section: string) =>
  [
    ...(el.shadowRoot?.querySelectorAll(`.section[data-section="${section}"] ha-form`) ?? []),
  ] as Form[];
const names = (f: Form): string[] => {
  const walk = (l: Field[]): string[] =>
    (l ?? []).flatMap((i) => (i.schema ? walk(i.schema) : [i.name ?? ""]));
  return walk(f.schema);
};
const formOf = (el: Editor, section: string, field: string) =>
  forms(el, section).find((f) => names(f).includes(field)) as Form;

/** Types into a field as ha-form reports it, and returns the forms before and after. */
async function type(el: Editor, section: string, field: string, value: unknown) {
  const before = forms(el, section);
  const form = formOf(el, section, field);
  form.dispatchEvent(
    new CustomEvent("value-changed", { detail: { value: { ...form.data, [field]: value } } }),
  );
  await settle(el);
  return { before, after: forms(el, section), form };
}

const notes = (el: Editor, section: string) =>
  el.shadowRoot?.querySelectorAll(`.section[data-section="${section}"] .field-note`).length ?? 0;

describe("a note while typing keeps every form (rule 7)", () => {
  it("peak power below the minimum: a note on min_w above, the typed form stays", async () => {
    const el = await mount({ flow: { min_w: 50 } });
    const { before, after, form } = await type(el, "flow", "peak_w", 4);
    expect(notes(el, "flow")).toBeGreaterThan(0);
    expect(formOf(el, "flow", "peak_w")).toBe(form);
    expect(after.map((f, i) => f === before[i])).toEqual(before.map(() => true));
  });

  it("the note goes again: nothing is rebuilt either", async () => {
    const el = await mount({ flow: { min_w: 50 } });
    await type(el, "flow", "peak_w", 4);
    const { before, after } = await type(el, "flow", "peak_w", 4000);
    expect(after.map((f, i) => f === before[i])).toEqual(before.map(() => true));
  });

  it("long average below the short one: the typed form stays", async () => {
    const el = await mount({ view: { avg_short_minutes: 10 } });
    const { before, after, form } = await type(el, "quick_buttons", "avg_long_minutes", 5);
    expect(notes(el, "quick_buttons")).toBeGreaterThan(0);
    expect(formOf(el, "quick_buttons", "avg_long_minutes")).toBe(form);
    expect(after.map((f, i) => f === before[i])).toEqual(before.map(() => true));
  });

  it("fine tuning: the first digit of 'slow below' keeps the group's form", async () => {
    const el = await mount();
    const { before, after, form } = await type(el, "flow", "slow_below_w", 5);
    expect(formOf(el, "flow", "slow_below_w")).toBe(form);
    expect(after.map((f, i) => f === before[i])).toEqual(before.map(() => true));
  });
});

const CONSUMERS = [
  { entity: "sensor.a", name: "A" },
  { entity: "sensor.b", name: "B" },
  { entity: "sensor.c", name: "C" },
];
const STOPS = [
  { at: 0, color: "#ff0000" },
  { at: 30, color: "#ffaa00" },
  { at: 60, color: "#00ff00" },
  { at: 100, color: "#0000ff" },
];
const row = (el: Editor, id: string) =>
  el.shadowRoot?.querySelector(`.swatch[data-key="${id}"]`)?.closest(".color") as HTMLElement;
/** The keys of the colour rows whose CSS field is open. */
const open = (el: Editor) =>
  [...(el.shadowRoot?.querySelectorAll(".color.open .swatch") ?? [])].map(
    (b) => (b as HTMLElement).dataset.key,
  );
const openNames = (el: Editor) =>
  [...(el.shadowRoot?.querySelectorAll(".color.open .name") ?? [])].map((n) =>
    n.textContent?.trim(),
  );
const inner = (el: Editor) => el as unknown as Record<string, (...a: unknown[]) => void>;

describe("a colour row's open field stays with its entry (E-3)", () => {
  it("a consumer above it removed: the field stays open at its consumer", async () => {
    const el = await mount({ consumers: CONSUMERS });
    (row(el, "consumer:1").querySelector(".more") as HTMLButtonElement).click();
    await settle(el);
    inner(el)._removeConsumer(0);
    await settle(el);
    expect(openNames(el)).toEqual(["B"]);
  });

  it("its consumer moved: the field moves with it", async () => {
    const el = await mount({ consumers: CONSUMERS });
    (row(el, "consumer:0").querySelector(".more") as HTMLButtonElement).click();
    await settle(el);
    inner(el)._moveTo(0, 2);
    await settle(el);
    expect(openNames(el)).toEqual(["A"]);
  });

  it("its consumer removed, a new one added: the new one starts closed", async () => {
    const el = await mount({ consumers: CONSUMERS });
    (row(el, "consumer:2").querySelector(".more") as HTMLButtonElement).click();
    await settle(el);
    inner(el)._removeConsumer(2);
    await settle(el);
    inner(el)._addConsumer();
    await settle(el);
    expect(open(el)).toEqual([]);
  });

  it("a stop below it removed: the field stays at its stop", async () => {
    const el = await mount({ colors: { soc_stops: STOPS } });
    (row(el, "stop:2").querySelector(".more") as HTMLButtonElement).click();
    await settle(el);
    (row(el, "stop:1").querySelector(".reset") as HTMLButtonElement).click();
    await settle(el);
    expect(open(el)).toEqual(["stop:1"]);
  });

  it("a stop added before it: the field stays at its stop", async () => {
    const el = await mount({
      colors: { soc_stops: [STOPS[0], { at: 80, color: "#00ff00" }, STOPS[3]] },
    });
    (row(el, "stop:1").querySelector(".more") as HTMLButtonElement).click();
    await settle(el);
    inner(el)._addStop();
    await settle(el);
    // 0 / 40 / 80 / 100: the 80 % stop is the third now.
    expect(open(el)).toEqual(["stop:2"]);
  });

  it("a YAML edit with another list: no consumer's field is left open", async () => {
    const el = await mount({ consumers: CONSUMERS });
    (row(el, "consumer:1").querySelector(".more") as HTMLButtonElement).click();
    await settle(el);
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.pv", grid: "sensor.grid", house: "sensor.house" },
      consumers: [
        { entity: "sensor.x", name: "X" },
        { entity: "sensor.y", name: "Y" },
      ],
    } as RawConfig);
    await settle(el);
    expect(open(el)).toEqual([]);
  });
});

describe("a stop's percentage shows what is written", () => {
  it("typed past its neighbour: the field shows the stop as kept", async () => {
    const el = await mount({ colors: { soc_stops: STOPS } });
    const input = () => row(el, "stop:1").querySelector("input.percent") as HTMLInputElement;
    // 80 is kept at 60, its neighbour; then 90 is kept at 60 again.
    for (const typed of ["80", "90"]) {
      input().value = typed;
      input().dispatchEvent(new Event("change"));
      await settle(el);
      expect(input().value).toBe("60");
    }
  });
});

/** The consumer entry's display form and its indicators group. */
const displayForm = (el: Editor) =>
  [...(el.shadowRoot?.querySelectorAll(".consumer ha-form") ?? [])].find((f) =>
    names(f as Form).includes("highlight"),
  ) as Form;
const indicators = (f: Form) =>
  (f.schema as (Field & { expanded?: boolean })[]).find((i) => i.name === "indicators") as Field & {
    expanded?: boolean;
    schema: (Field & { expanded?: boolean })[];
  };

describe("groups of an entry stay open while they are worked in", () => {
  it("clearing a ring's entity keeps the indicators and the ring open", async () => {
    const el = await mount({
      consumers: [
        { entity: "sensor.a", indicators: { ring: { entity: "sensor.soc", label: "Charge" } } },
      ],
    });
    const form = displayForm(el);
    const data = form.data as { indicators: { ring: Record<string, unknown> } };
    form.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: {
          value: {
            ...data,
            indicators: {
              ...data.indicators,
              ring: { ...data.indicators.ring, entity: undefined },
            },
          },
        },
      }),
    );
    await settle(el);
    const group = indicators(displayForm(el));
    expect(group.expanded).toBe(true);
    expect(group.schema.find((s) => s.name === "ring")?.expanded).toBe(true);
  });

  it("removing the last extra value keeps the values group open", async () => {
    const el = await mount({
      consumers: [{ entity: "sensor.a", indicators: { values: [{ entity: "sensor.v" }] } }],
    });
    const panel = () =>
      el.shadowRoot?.querySelector(".values-panel") as HTMLElement & { expanded?: boolean };
    expect(panel().expanded).toBe(true);
    (
      el.shadowRoot?.querySelector(
        ".values-panel .value .remove, .values-panel .remove",
      ) as HTMLButtonElement
    ).click();
    await settle(el);
    expect(panel().expanded).toBe(true);
  });
});

describe("the review's cases (23.11.2026)", () => {
  it("digits typed into a stop survive a new hass before they are committed", async () => {
    const el = await mount({ colors: { soc_stops: STOPS } });
    const input = () => row(el, "stop:1").querySelector("input.percent") as HTMLInputElement;
    input().value = "4";
    el.hass = { ...HASS } as HomeAssistant;
    await settle(el);
    expect(input().value).toBe("4");
  });

  it("a ring whose entity is cleared is no longer offered for the value column", async () => {
    const el = await mount({
      consumers: [
        { entity: "sensor.a", indicators: { ring: { entity: "sensor.soc", label: "Charge" } } },
      ],
    });
    const form = displayForm(el);
    const data = form.data as { indicators: { ring: Record<string, unknown> } };
    form.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: {
          value: {
            ...data,
            indicators: {
              ...data.indicators,
              ring: { ...data.indicators.ring, entity: undefined },
            },
          },
        },
      }),
    );
    await settle(el);
    const idle = (
      indicators(displayForm(el)).schema as (Field & {
        selector?: { select?: { options: { value: string }[] } };
      })[]
    ).find((s) => s.name === "idle_value");
    expect(idle?.selector?.select?.options.map((o) => o.value)).toEqual([""]);
  });

  it("the open wheel moves with its consumer", async () => {
    const el = await mount({ consumers: CONSUMERS });
    (row(el, "consumer:2").querySelector(".swatch") as HTMLButtonElement).click();
    await settle(el);
    inner(el)._removeConsumer(0);
    await settle(el);
    const picking = [...(el.shadowRoot?.querySelectorAll(".color.picking .name") ?? [])].map((n) =>
      n.textContent?.trim(),
    );
    expect(picking).toEqual(["C"]);
  });
});
