// @vitest-environment happy-dom
/**
 * The width of the content (REQ AN-7, issue #33) and the list at the card's
 * right edge (L-13, changed 01.11.2026). On a wide card the fan lines ran
 * across the whole card; `content.max_width` keeps header, drawing, fans and
 * list together as one block, placed left, centred or right.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { type ConfigNote, normalizeConfig } from "../src/config";
import { styles } from "../src/styles";
import { ConfigError, type HomeAssistant, type RawConfig } from "../src/types";
import { unfoldAll } from "./editor-panels";

const ENTITIES = { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" };
const cfg = (over: Record<string, unknown> = {}) =>
  ({ type: "custom:enerlens-card", entities: { ...ENTITIES }, ...over }) as RawConfig;

const hass = {
  states: Object.fromEntries(
    Object.keys({ "sensor.solar": 1, "sensor.grid": 1, "sensor.house": 1 }).map((id) => [
      id,
      {
        entity_id: id,
        state: "500",
        attributes: { unit_of_measurement: "W" },
        last_changed: "2026-11-01T10:00:00+00:00",
        last_updated: "2026-11-01T10:00:00+00:00",
      },
    ]),
  ),
  locale: { language: "de", number_format: "language" as const },
  language: "de",
  callWS: async () => ({}) as never,
} as unknown as HomeAssistant;

describe("AN-7: content.max_width and content.align in the config", () => {
  afterEach(() => vi.restoreAllMocks());

  it("no block, no limit", () => {
    expect(normalizeConfig(cfg()).content).toBeUndefined();
    expect(normalizeConfig(cfg({ content: {} })).content).toBeUndefined();
  });

  it("a width in px, centred unless told otherwise", () => {
    expect(normalizeConfig(cfg({ content: { max_width: 900 } })).content).toEqual({
      maxWidth: 900,
      align: "center",
    });
    expect(
      normalizeConfig(cfg({ content: { max_width: 900, align: "left" } })).content?.align,
    ).toBe("left");
    expect(
      normalizeConfig(cfg({ content: { max_width: 900, align: "right" } })).content?.align,
    ).toBe("right");
  });

  it("draws a width outside 400..2000 to the limit, with a note, never refuses (E-1)", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const notes: ConfigNote[] = [];
    expect(
      normalizeConfig(cfg({ content: { max_width: 9 } }), undefined, notes).content?.maxWidth,
    ).toBe(400);
    expect(normalizeConfig(cfg({ content: { max_width: 5000 } })).content?.maxWidth).toBe(2000);
    expect(normalizeConfig(cfg({ content: { max_width: 900.4 } })).content?.maxWidth).toBe(900);
    expect(notes.map((n) => n.field)).toContain("content.max_width");
  });

  it("an unknown alignment falls back to the centre with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(
      normalizeConfig(cfg({ content: { max_width: 900, align: "middle" } })).content?.align,
    ).toBe("center");
    expect(warn.mock.calls.map((c) => String(c[0])).join()).toContain("content.align");
  });

  it("an alignment without a width does nothing, a misspelt one is still named", () => {
    expect(normalizeConfig(cfg({ content: { align: "left" } })).content).toBeUndefined();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    normalizeConfig(cfg({ content: { align: "middle" } }));
    expect(warn.mock.calls.map((c) => String(c[0])).join()).toContain("content.align");
  });

  it("names a typo inside the block and refuses text for a number", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    normalizeConfig(cfg({ content: { max_widht: 900 } }));
    expect(warn.mock.calls.map((c) => String(c[0])).join()).toContain("max_widht");
    expect(() => normalizeConfig(cfg({ content: { max_width: "wide" } }))).toThrow(ConfigError);
    expect(() => normalizeConfig(cfg({ content: 900 }))).toThrow(ConfigError);
  });

  it("does not warn about the block itself", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    normalizeConfig(cfg({ content: { max_width: 900, align: "left" } }));
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("AN-7 / L-13: the stylesheet", () => {
  const text = styles.cssText.replace(/\s+/g, " ");

  it("no longer holds the list beside the cross to 55 % of the card (L-13)", () => {
    const rule = text.match(/\.list:not\(\.stacked\) \{[^}]*\}/)?.[0] ?? "";
    expect(rule).toContain("flex: 1 1 145px");
    expect(rule).not.toContain("max-width");
  });

  it("places a limited block left, in the middle or right", () => {
    expect(text).toMatch(/\.content \{[^}]*margin-inline: auto/);
    expect(text).toMatch(/\.content\.align-left \{[^}]*margin-inline: 0 auto/);
    expect(text).toMatch(/\.content\.align-right \{[^}]*margin-inline: auto 0/);
  });
});

describe("AN-7: the card", () => {
  type Card = HTMLElement & {
    setConfig: (c: unknown) => void;
    hass: HomeAssistant;
    updateComplete: Promise<unknown>;
  };

  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  async function mount(config: RawConfig): Promise<Card> {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig(config);
    el.hass = hass;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  const content = (el: Card) =>
    el.shadowRoot?.querySelector("ha-card")?.querySelector(".content") as HTMLElement;

  it("holds header and body in one block, unlimited by default", async () => {
    const el = await mount(cfg({ title: "T" }));
    const block = content(el);
    expect(block).not.toBeNull();
    const children = [...block.children].map((c) => c.className);
    expect(children.some((c) => c.includes("header"))).toBe(true);
    expect(children.some((c) => c.split(" ").includes("body"))).toBe(true);
    expect(block.style.maxWidth).toBe("");
    el.remove();
  });

  it("limits the block to the width configured, the card stays as wide as it was", async () => {
    const el = await mount(cfg({ content: { max_width: 900, align: "left" } }));
    expect(content(el).style.maxWidth).toBe("900px");
    expect(content(el).classList.contains("align-left")).toBe(true);
    // The dashboard still gets the full width (REQ AN-7).
    const card = customElements.get("enerlens-card") as unknown as {
      prototype: { getGridOptions: () => { columns: number } };
    };
    expect(card.prototype.getGridOptions.call(el).columns).toBe(12);
    el.setConfig(cfg({ content: { max_width: 1200 } }));
    await el.updateComplete;
    expect(content(el).style.maxWidth).toBe("1200px");
    expect(content(el).classList.contains("align-center")).toBe(true);
    el.setConfig(cfg());
    await el.updateComplete;
    expect(content(el).style.maxWidth).toBe("");
    el.remove();
  });
});

describe("AN-7: the editor", () => {
  type Editor = HTMLElement & {
    setConfig: (c: RawConfig) => void;
    hass: HomeAssistant;
    updateComplete: Promise<unknown>;
  };
  type Form = HTMLElement & { data: Record<string, unknown>; schema: unknown[] };

  beforeAll(async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await import("../src/editor");
  });

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
  const main = (el: Editor) =>
    [...(el.shadowRoot?.querySelectorAll("ha-form") ?? [])].find((f) =>
      JSON.stringify((f as Form).schema).includes('"name":"content_max_width"'),
    ) as Form | undefined;
  // A field the card may override ends its form (E-1 notes), so the
  // alignment sits in the next one: look in all of them.
  const has = (el: Editor, name: string) =>
    [...(el.shadowRoot?.querySelectorAll("ha-form") ?? [])].some((f) =>
      JSON.stringify((f as Form).schema).includes(`"name":"${name}"`),
    );

  async function change(el: Editor, values: Record<string, unknown>): Promise<RawConfig> {
    const form = main(el) as Form;
    let saved: RawConfig | undefined;
    const listen = (ev: Event) => {
      saved = (ev as CustomEvent<{ config: RawConfig }>).detail.config;
    };
    el.addEventListener("config-changed", listen);
    form.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: { ...form.data, ...values } } }),
    );
    el.removeEventListener("config-changed", listen);
    if (!saved) throw new Error("no config-changed");
    el.setConfig(saved);
    await el.updateComplete;
    return saved;
  }

  it("offers the width with the card's limits; the alignment only with a width", async () => {
    const el = await mount(cfg());
    const form = main(el);
    expect(form).toBeDefined();
    expect(JSON.stringify(form?.schema)).toMatch(
      /"name":"content_max_width","selector":\{"number":\{"min":400,"max":2000/,
    );
    expect(has(el, "content_align")).toBe(false);
    const saved = await change(el, { content_max_width: 900 });
    expect(saved.content).toEqual({ max_width: 900 });
    expect(has(el, "content_align")).toBe(true);
    expect(main(el)?.data.content_align).toBe("center");
    el.remove();
  });

  it("writes the alignment, and drops it with the width", async () => {
    const el = await mount(cfg({ content: { max_width: 900 } }));
    const saved = await change(el, { content_align: "right" });
    expect(saved.content).toEqual({ max_width: 900, align: "right" });
    const cleared = await change(el, { content_max_width: undefined });
    expect(cleared.content).toBeUndefined();
    el.remove();
  });

  it("says under the field what the card uses instead (E-1)", async () => {
    const el = await mount(cfg({ content: { max_width: 5000 } }));
    const notes = [...(el.shadowRoot?.querySelectorAll(".field-note") ?? [])].map((n) =>
      (n.textContent ?? "").trim(),
    );
    expect(notes.join(" ")).toContain("2000");
    el.remove();
  });

  it("stands with the card's look, not among the list switches", async () => {
    const el = await mount(cfg());
    const names =
      JSON.stringify(main(el)?.schema ?? []).match(/"name":"[a-z_]+"/g) ?? ([] as string[]);
    const at = (n: string) => names.indexOf(`"name":"${n}"`);
    expect(at("content_max_width")).toBe(at("appearance") + 1);
    el.remove();
  });

  it("shows what the YAML says", async () => {
    const el = await mount(cfg({ content: { max_width: 1100, align: "left" } }));
    expect(main(el)?.data).toMatchObject({ content_max_width: 1100, content_align: "left" });
    el.remove();
  });
});
