// @vitest-environment happy-dom
/**
 * Extra values at the nodes and switchable labels (REQ Z-1 to Z-6, Z-9;
 * issue #9). The card shows a state the way Home Assistant would - it never
 * computes, converts or averages one.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { collectEntityIds, collectExtraIds, normalizeConfig } from "../src/config";
import { formatExtra, formatPower } from "../src/format";
import { ConfigError, type HassEntity, type HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";

beforeAll(fakeMotion);
afterEach(() => vi.restoreAllMocks());

const ENTITIES = { solar: "sensor.s", grid: "sensor.g", house: "sensor.h", battery: "sensor.b" };

function config(extra: Record<string, unknown> = {}) {
  return normalizeConfig({ type: "custom:enerlens-card", entities: ENTITIES, ...extra });
}

function entity(id: string, state: string, attributes: HassEntity["attributes"] = {}): HassEntity {
  return { entity_id: id, state, attributes, last_changed: "", last_updated: "" };
}

/** One locale object per language, as HA keeps it - a new one means "re-render". */
const LOCALES = new Map<string, HomeAssistant["locale"]>();

function hass(
  language = "de",
  states: Record<string, HassEntity> = {},
  extra: Partial<HomeAssistant> = {},
): HomeAssistant {
  if (!LOCALES.has(language)) LOCALES.set(language, { language, number_format: "language" });
  return {
    states,
    locale: LOCALES.get(language) as HomeAssistant["locale"],
    language,
    callWS: async () => ({}) as never,
    ...extra,
  } as HomeAssistant;
}

describe("nodes config (REQ Z-1 to Z-6, section 3)", () => {
  it("defaults: names and state words on, no fields", () => {
    const c = config();
    for (const key of ["solar", "grid", "house", "battery"] as const) {
      expect(c.nodes[key].showName).toBe(true);
      expect(c.nodes[key].showState).toBe(true);
      expect(c.nodes[key].inside).toBeUndefined();
      expect(c.nodes[key].label).toBeUndefined();
    }
  });

  it("does not call nodes an unknown option", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    config({ nodes: { solar: { show_name: false } } });
    expect(warn).not.toHaveBeenCalled();
  });

  it("reads both fields with every setting", () => {
    const c = config({
      nodes: {
        solar: {
          show_name: false,
          inside: {
            entity: "sensor.today",
            position: "below",
            decimals: 1,
            size: 80,
            weight: "bold",
          },
          label: {
            entity: "sensor.forecast",
            prefix: "Prognose",
            decimals: "sig3",
            size: 120,
            weight: "medium",
          },
        },
        grid: { show_state: false },
      },
    });
    expect(c.nodes.solar.showName).toBe(false);
    expect(c.nodes.solar.inside).toEqual({
      entity: "sensor.today",
      position: "below",
      decimals: 1,
      size: 80,
      weight: "bold",
    });
    expect(c.nodes.solar.label).toEqual({
      entity: "sensor.forecast",
      prefix: "Prognose",
      decimals: "sig3",
      size: 120,
      weight: "medium",
    });
    expect(c.nodes.grid.showState).toBe(false);
  });

  it("fills defaults for a field that only names its entity", () => {
    const c = config({
      nodes: { house: { inside: { entity: "sensor.x" }, label: { entity: "sensor.y" } } },
    });
    expect(c.nodes.house.inside).toEqual({
      entity: "sensor.x",
      position: "above",
      decimals: "ha",
      size: 100,
      weight: "normal",
    });
    expect(c.nodes.house.label).toEqual({
      entity: "sensor.y",
      prefix: undefined,
      decimals: "ha",
      size: 100,
      weight: "normal",
    });
  });

  it("takes decimals as a number or as text, as the editor and YAML write them", () => {
    expect(
      config({ nodes: { solar: { label: { entity: "sensor.y", decimals: "2" } } } }).nodes.solar
        .label?.decimals,
    ).toBe(2);
    expect(
      config({ nodes: { solar: { label: { entity: "sensor.y", decimals: 0 } } } }).nodes.solar.label
        ?.decimals,
    ).toBe(0);
  });

  it("treats cleared values as not set (REQ E-1)", () => {
    const c = config({
      nodes: {
        grid: {
          show_name: null,
          show_state: "",
          label: { entity: "sensor.y", prefix: "", decimals: "", size: null, weight: "" },
          inside: null,
        },
      },
    });
    expect(c.nodes.grid.showName).toBe(true);
    expect(c.nodes.grid.showState).toBe(true);
    expect(c.nodes.grid.inside).toBeUndefined();
    expect(c.nodes.grid.label).toEqual({
      entity: "sensor.y",
      prefix: undefined,
      decimals: "ha",
      size: 100,
      weight: "normal",
    });
  });

  it("drops a field without an entity with a warning (REQ E-1)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const c = config({
      nodes: { house: { label: { entity: "", prefix: "Autarkie" }, inside: { size: 80 } } },
    });
    expect(c.nodes.house.label).toBeUndefined();
    expect(c.nodes.house.inside).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("ignores a field inside the battery and a state word where there is none", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const c = config({
      nodes: {
        battery: { inside: { entity: "sensor.x" } },
        solar: { show_state: false },
        house: { show_state: false },
      },
    });
    expect(c.nodes.battery.inside).toBeUndefined();
    expect(c.nodes.solar.showState).toBe(true);
    expect(c.nodes.house.showState).toBe(true);
    expect(warn).toHaveBeenCalledTimes(3);
  });

  it("draws the size to its range with a warning (REQ Z-6)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const c = config({
      nodes: {
        solar: {
          inside: { entity: "sensor.x", size: 10 },
          label: { entity: "sensor.y", size: 400 },
        },
      },
    });
    expect(c.nodes.solar.inside?.size).toBe(60);
    expect(c.nodes.solar.label?.size).toBe(150);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("refuses unknown words for position, decimals and weight", () => {
    for (const field of [
      { position: "left" },
      { decimals: "sig9" },
      { decimals: 5 },
      { weight: "heavy" },
    ]) {
      expect(() =>
        config({ nodes: { solar: { inside: { entity: "sensor.x", ...field } } } }),
      ).toThrow(ConfigError);
    }
  });

  it("warns about an unknown node and unknown keys in a node", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    config({ nodes: { wallbox: {}, solar: { colour: "red" } } });
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("keeps a prefix without the spaces around it, and none when only spaces", () => {
    expect(
      config({ nodes: { house: { label: { entity: "sensor.y", prefix: " Autarkie " } } } }).nodes
        .house.label?.prefix,
    ).toBe("Autarkie");
    expect(
      config({ nodes: { house: { label: { entity: "sensor.y", prefix: "  " } } } }).nodes.house
        .label?.prefix,
    ).toBeUndefined();
  });

  it("colours the fields grey unless told otherwise (REQ Z-6, C-5)", () => {
    const c = config({ colors: { house_label: "#ff0000", solar_inside: "" } });
    expect(c.extraColors.house_label).toBe("#ff0000");
    expect(c.extraColors.solar_inside).toBe("var(--secondary-text-color)");
    expect(c.extraColors.grid_label).toBe("var(--secondary-text-color)");
  });

  it("ignores a colour for the battery's inside field, which does not exist", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const c = config({ colors: { battery_inside: "#ff0000" } });
    expect((c.extraColors as Record<string, string>).battery_inside).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("watches the extra entities apart from the averaged ones (REQ Z-9)", () => {
    const c = config({
      nodes: {
        solar: { inside: { entity: "sensor.today" }, label: { entity: "sensor.today" } },
        house: { label: { entity: "sensor.autarky" } },
      },
    });
    expect(collectExtraIds(c)).toEqual(["sensor.today", "sensor.autarky"]);
    expect(collectEntityIds(c)).not.toContain("sensor.today");
    expect(collectEntityIds(c)).not.toContain("sensor.autarky");
  });

  it("does not watch a battery field when there is no battery", () => {
    const c = normalizeConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.s", grid: "sensor.g" },
      nodes: { battery: { label: { entity: "sensor.rest" } } },
    });
    expect(collectExtraIds(c)).toEqual([]);
  });
});

describe("formatExtra (REQ Z-5)", () => {
  const kwh = (state: string) =>
    entity("sensor.e", state, { unit_of_measurement: "kWh", device_class: "energy" });

  it("shows a dash for a missing or unavailable entity", () => {
    expect(formatExtra(undefined, hass(), "ha")).toBe("—");
    expect(formatExtra(kwh("unavailable"), hass(), 2)).toBe("—");
    expect(formatExtra(kwh("unknown"), hass(), "ha")).toBe("—");
  });

  it("leaves 'ha' to Home Assistant's own formatting", () => {
    const formatEntityState = vi.fn(() => "12,4 kWh");
    expect(formatExtra(kwh("12.389"), hass("de", {}, { formatEntityState }), "ha")).toBe(
      "12,4 kWh",
    );
    expect(formatEntityState).toHaveBeenCalled();
  });

  it("falls back to state and unit without formatEntityState", () => {
    expect(formatExtra(kwh("12.389"), hass(), "ha")).toBe("12.389 kWh");
  });

  it("writes fixed decimals in the profile's number format", () => {
    expect(formatExtra(kwh("12.345"), hass("de"), 2)).toBe("12,35 kWh");
    expect(formatExtra(kwh("12.345"), hass("en"), 1)).toBe("12.3 kWh");
    expect(formatExtra(kwh("12.5"), hass("de"), 0)).toBe("13 kWh");
    expect(formatExtra(kwh("1234.5"), hass("de"), 1)).toBe("1.234,5 kWh");
  });

  it("writes significant digits whatever the unit", () => {
    expect(formatExtra(kwh("1.2345"), hass("de"), "sig3")).toBe("1,23 kWh");
    expect(formatExtra(kwh("12.345"), hass("de"), "sig3")).toBe("12,3 kWh");
    expect(formatExtra(kwh("123.45"), hass("de"), "sig3")).toBe("123 kWh");
    expect(formatExtra(kwh("0.0456"), hass("de"), "sig2")).toBe("0,046 kWh");
  });

  it("writes a vanishingly small value as zero, not as twenty zeros", () => {
    // Intl refuses more than 20 fraction digits on older engines.
    expect(formatExtra(kwh("1e-25"), hass("de"), "sig3")).toBe("0,00 kWh");
  });

  it("never shows a negative zero", () => {
    expect(formatExtra(kwh("-0.001"), hass("de"), 2)).toBe("0,00 kWh");
  });

  it("puts the space before a unit the way Home Assistant does", () => {
    const pct = entity("sensor.p", "82.4", { unit_of_measurement: "%" });
    expect(formatExtra(pct, hass("de"), 0)).toBe("82 %");
    expect(formatExtra(pct, hass("en"), 0)).toBe("82%");
    const deg = entity("sensor.d", "21.04", { unit_of_measurement: "°" });
    expect(formatExtra(deg, hass("de"), 1)).toBe("21,0°");
    const temp = entity("sensor.t", "21.04", { unit_of_measurement: "°C" });
    expect(formatExtra(temp, hass("de"), 1)).toBe("21,0 °C");
  });

  it("writes a numeric state without a unit as the bare number", () => {
    const count = entity("sensor.c", "3.14159", { state_class: "measurement" });
    expect(formatExtra(count, hass("de"), 2)).toBe("3,14");
  });

  it("leaves money, durations, dates and text to Home Assistant", () => {
    const formatEntityState = vi.fn((s: HassEntity) => `HA:${s.state}`);
    const h = hass("de", {}, { formatEntityState });
    expect(
      formatExtra(
        entity("sensor.m", "1.234", { unit_of_measurement: "EUR", device_class: "monetary" }),
        h,
        1,
      ),
    ).toBe("HA:1.234");
    expect(
      formatExtra(
        entity("sensor.d", "125", { unit_of_measurement: "s", device_class: "duration" }),
        h,
        1,
      ),
    ).toBe("HA:125");
    expect(
      formatExtra(
        entity("sensor.ts", "2026-10-17T11:05:00+00:00", { device_class: "timestamp" }),
        h,
        "sig3",
      ),
    ).toBe("HA:2026-10-17T11:05:00+00:00");
    expect(formatExtra(entity("sensor.txt", "charging"), h, 2)).toBe("HA:charging");
  });

  it("writes digits other than 0-9 instead of taking them for zero", () => {
    // Persian digits: a test for "1-9" in the text saw a zero in every value.
    expect(formatExtra(kwh("12.5"), hass("fa"), 1)).toContain("۱۲");
    expect(formatPower(12500, hass("fa"))).toContain("۱۲");
    expect(formatPower(-1, hass("de"), { unit: "kW", decimals: 2, digits: 3 })).toBe("0,00 kW");
  });

  it("takes an empty unit and an empty state class for none, as HA does", () => {
    const formatEntityState = vi.fn((s: HassEntity) => `HA:${s.state}`);
    const h = hass("de", {}, { formatEntityState });
    expect(formatExtra(entity("sensor.x", "1.5", { unit_of_measurement: "" }), h, 2)).toBe(
      "HA:1.5",
    );
    expect(formatExtra(entity("sensor.x", "1.5", { state_class: null }), h, 2)).toBe("HA:1.5");
  });

  it("does not treat a number without unit or state class as numeric", () => {
    const formatEntityState = vi.fn((s: HassEntity) => `HA:${s.state}`);
    expect(
      formatExtra(entity("sensor.code", "1.5"), hass("de", {}, { formatEntityState }), 2),
    ).toBe("HA:1.5");
  });
});

// ---------------------------------------------------------------------------
// In the card (REQ Z-2 to Z-4, Z-9)
// ---------------------------------------------------------------------------

type Card = HTMLElement & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
};

const W = (id: string, w: number) =>
  entity(id, String(w), { unit_of_measurement: "W", device_class: "power" });
const BASE_STATES: Record<string, HassEntity> = {
  "sensor.s": W("sensor.s", 6000),
  "sensor.g": W("sensor.g", -800),
  "sensor.h": W("sensor.h", 3200),
  "sensor.b": W("sensor.b", -2000),
  "sensor.today": entity("sensor.today", "12.389", {
    unit_of_measurement: "kWh",
    device_class: "energy",
  }),
  "sensor.autarky": entity("sensor.autarky", "82", { unit_of_measurement: "%" }),
};

describe("extra values in the card", () => {
  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  async function mount(
    nodes: Record<string, unknown>,
    extra: Record<string, unknown> = {},
    states = BASE_STATES,
  ) {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig({ type: "custom:enerlens-card", entities: ENTITIES, nodes, ...extra });
    el.hass = hass("de", { ...states });
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }
  const node = (el: Card, key: string) =>
    el.shadowRoot?.querySelector(`.node.${key}`) as HTMLElement;
  const childClasses = (parent: Element) =>
    [...parent.children].map((c) => c.className.split(" ")[0]);

  it("puts the inside field above the icon by default (REQ Z-2)", async () => {
    const el = await mount({ solar: { inside: { entity: "sensor.today", decimals: 1 } } });
    const solar = node(el, "solar");
    const field = solar.querySelector(".extra-inside");
    expect(field?.textContent?.trim()).toBe("12,4 kWh");
    const order = [...solar.children].filter((c) => c.matches(".extra-inside, ha-icon, .value"));
    expect(order.map((c) => (c.matches("ha-icon") ? "icon" : c.className.split(" ")[0]))).toEqual([
      "extra-inside",
      "icon",
      "value",
    ]);
    el.remove();
  });

  it("puts it under the value on request, and never into the battery", async () => {
    const el = await mount({
      house: { inside: { entity: "sensor.today", position: "below", decimals: 1 } },
      battery: { inside: { entity: "sensor.today" } },
    });
    const house = node(el, "house");
    const order = [...house.children].filter((c) => c.matches(".extra-inside, ha-icon, .value"));
    expect(order.map((c) => (c.matches("ha-icon") ? "icon" : c.className.split(" ")[0]))).toEqual([
      "icon",
      "value",
      "extra-inside",
    ]);
    expect(node(el, "battery").querySelector(".extra-inside")).toBeNull();
    el.remove();
  });

  it("is no node value: the outage colour and the measuring tools leave it alone", async () => {
    const el = await mount({ solar: { inside: { entity: "sensor.today" } } });
    expect(node(el, "solar").querySelector(".extra-inside")?.classList.contains("value")).toBe(
      false,
    );
    el.remove();
  });

  it("writes prefix and value into the label, next to the circle (REQ Z-3)", async () => {
    const el = await mount({
      house: { label: { entity: "sensor.autarky", prefix: "Autarkie" } },
      solar: { label: { entity: "sensor.today", decimals: 1 } },
    });
    const houseLabel = node(el, "house").querySelector(".label") as HTMLElement;
    const field = houseLabel.querySelector(".extra-label") as HTMLElement;
    expect(field.querySelector(".extra-prefix")?.textContent).toBe("Autarkie");
    expect(field.querySelector(".extra-value")?.textContent).toBe("82 %");
    expect(field.textContent?.replace(/\s+/g, " ").trim()).toBe("Autarkie 82 %");
    // Below the node the line next to the circle is the first; above PV the last.
    expect(childClasses(houseLabel)[0]).toBe("extra-label");
    expect(childClasses(houseLabel).at(-1)).toBe("label-name");
    const solarLabel = node(el, "solar").querySelector(".label") as HTMLElement;
    expect(childClasses(solarLabel).at(-1)).toBe("extra-label");
    expect(childClasses(solarLabel)[0]).toBe("label-name");
    el.remove();
  });

  it("keeps the prefix and shows a dash when the entity is unavailable (REQ Z-5)", async () => {
    const el = await mount(
      { house: { label: { entity: "sensor.autarky", prefix: "Autarkie" } } },
      {},
      { ...BASE_STATES, "sensor.autarky": entity("sensor.autarky", "unavailable") },
    );
    const field = node(el, "house").querySelector(".extra-label");
    expect(field?.textContent?.replace(/\s+/g, " ").trim()).toBe("Autarkie —");
    el.remove();
  });

  it("styles each field on its own (REQ Z-6)", async () => {
    const el = await mount(
      {
        solar: {
          inside: { entity: "sensor.today", size: 80, weight: "bold" },
          label: { entity: "sensor.today", size: 120, weight: "medium" },
        },
      },
      { colors: { solar_inside: "#ff0000" } },
    );
    const inside = node(el, "solar").querySelector(".extra-inside") as HTMLElement;
    const label = node(el, "solar").querySelector(".extra-label") as HTMLElement;
    expect(inside.getAttribute("style")).toContain("#ff0000");
    expect(inside.getAttribute("style")).toContain("0.8");
    expect(inside.getAttribute("style")).toContain("700");
    expect(label.getAttribute("style")).toContain("var(--secondary-text-color)");
    expect(label.getAttribute("style")).toContain("1.2");
    expect(label.getAttribute("style")).toContain("500");
    el.remove();
  });

  it("hides the name and the state word on request (REQ Z-4)", async () => {
    const el = await mount({ solar: { show_name: false }, grid: { show_state: false } });
    // Nothing left to show: no label block at all (REQ Z-4).
    expect(node(el, "solar").querySelector(".label")).toBeNull();
    const grid = node(el, "grid").querySelector(".label")?.textContent ?? "";
    expect(grid).toContain("Netz");
    expect(grid).not.toContain("Einspeisung");
    el.remove();
  });

  it("keeps the full name and state for screen readers when hidden (REQ Z-4, N-6)", async () => {
    const el = await mount({ grid: { show_name: false, show_state: false } });
    const button = node(el, "grid").querySelector("button.hit") as HTMLElement;
    expect(button.getAttribute("aria-label")).toContain("Netz · Einspeisung");
    el.remove();
  });

  it("keeps 'berechnet' on a derived node without its name (REQ A-3, Z-4)", async () => {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.s", grid: "sensor.g", battery: "sensor.b" },
      nodes: { house: { show_name: false } },
    });
    el.hass = hass("de", { ...BASE_STATES });
    document.body.appendChild(el);
    await el.updateComplete;
    const text = node(el, "house").querySelector(".label")?.textContent ?? "";
    expect(text).not.toContain("Haus");
    expect(text).toContain("berechnet");
    expect(text).not.toContain("·");
    el.remove();
  });

  it("follows a change of the extra entity alone (REQ Z-9, T-3)", async () => {
    const el = await mount({ house: { label: { entity: "sensor.autarky" } } });
    el.hass = hass("de", {
      ...BASE_STATES,
      "sensor.autarky": entity("sensor.autarky", "64", { unit_of_measurement: "%" }),
    });
    await el.updateComplete;
    expect(node(el, "house").querySelector(".extra-value")?.textContent).toBe("64 %");
    el.remove();
  });

  it("follows a new display precision of an extra entity (REQ Z-9)", async () => {
    const el = await mount({ solar: { label: { entity: "sensor.today" } } });
    const states = { ...BASE_STATES };
    const formatEntityState = (s: HassEntity) => (s.state === "12.389" ? "12 kWh" : s.state);
    el.hass = hass("de", states, {
      formatEntityState,
      entities: { "sensor.today": { display_precision: 0 } },
    });
    await el.updateComplete;
    expect(node(el, "solar").querySelector(".extra-value")?.textContent).toBe("12 kWh");
    el.remove();
  });

  it("keeps the grid's name and the field's own colour during an outage (REQ NS-4, Z-4, Z-6)", async () => {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { ...ENTITIES, grid_status: { entity: "sensor.gs", outage: ["not_detected"] } },
      nodes: { grid: { show_name: false, label: { entity: "sensor.autarky" } } },
      colors: { grid_label: "#123456" },
    });
    el.hass = hass("de", { ...BASE_STATES, "sensor.gs": entity("sensor.gs", "not_detected") });
    document.body.appendChild(el);
    await el.updateComplete;
    const grid = node(el, "grid");
    expect(grid.classList.contains("outage")).toBe(true);
    expect(grid.querySelector(".label-name")?.textContent).toBe("Netz");
    expect(grid.querySelector(".extra-label")?.getAttribute("style")).toContain("#123456");
    el.remove();
  });

  it("draws the labels as before without a nodes block", async () => {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.s", grid: "sensor.g", battery: "sensor.b" },
    });
    el.hass = hass("de", { ...BASE_STATES });
    document.body.appendChild(el);
    await el.updateComplete;
    const lines = (key: string) =>
      [...(node(el, key).querySelector(".label")?.children ?? [])].map((c) => c.textContent);
    expect(lines("solar")).toEqual(["PV"]);
    expect(lines("grid")).toEqual(["Netz", "Einspeisung"]);
    expect(lines("house")).toEqual(["Haus", "· berechnet"]);
    expect(lines("battery")).toEqual(["Batterie", "lädt"]);
    expect(el.shadowRoot?.querySelector(".extra")).toBeNull();
    el.remove();
  });
});

// ---------------------------------------------------------------------------
// Room and tap targets (REQ Z-7, Z-8)
// ---------------------------------------------------------------------------

describe("room and tap targets for extra values", () => {
  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  async function mount(raw: Record<string, unknown>) {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig({ type: "custom:enerlens-card", entities: ENTITIES, ...raw });
    el.hass = hass("de", { ...BASE_STATES });
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }
  const padding = (el: Card) => {
    const style = el.shadowRoot?.querySelector(".body")?.getAttribute("style") ?? "";
    const read = (name: string) => Number(new RegExp(`${name}:\\s*([\\d.-]+)px`).exec(style)?.[1]);
    return {
      top: read("--el-pad-top"),
      bottom: read("--el-pad-bottom"),
      listTop: read("--el-list-mt"),
      listBottom: read("--el-list-mb"),
    };
  };
  const node = (el: Card, key: string) =>
    el.shadowRoot?.querySelector(`.node.${key}`) as HTMLElement;
  const opened = (el: Card) => {
    const ids: string[] = [];
    el.addEventListener("hass-more-info", (ev) => ids.push((ev as CustomEvent).detail.entityId));
    return ids;
  };

  it("keeps today's room without a nodes block (REQ Z-8)", async () => {
    const el = await mount({});
    expect(padding(el)).toEqual({ top: 26, bottom: 28, listTop: 0, listBottom: 0 });
    el.remove();
  });

  it("makes room above PV and below the battery for their fields (REQ Z-8)", async () => {
    const el = await mount({
      nodes: {
        solar: { label: { entity: "sensor.today" } },
        battery: { label: { entity: "sensor.autarky", size: 150 } },
      },
    });
    // One line of 15 px plus a field of at least 24 px tap height; at 150 % the
    // field is 18 px type at line height 1.25, still under 24.
    expect(padding(el)).toMatchObject({ top: 26 + 24, bottom: 28 + 24 });
    el.remove();
  });

  it("gives the room back when name and state word are hidden (REQ Z-4, Z-8)", async () => {
    const el = await mount({
      nodes: { solar: { show_name: false }, battery: { show_name: false, show_state: false } },
    });
    expect(padding(el)).toMatchObject({ top: 11, bottom: 8 });
    el.remove();
  });

  it("keeps 8 px between a field that is the outermost line and its neighbours (REQ Z-7, I-3)", async () => {
    // Without name and state word the field is the line next to the mode chips
    // above PV, and next to the list below the battery - both of them targets.
    const el = await mount({
      nodes: {
        solar: { show_name: false, label: { entity: "sensor.today" } },
        battery: { show_name: false, show_state: false, label: { entity: "sensor.today" } },
      },
    });
    expect(padding(el)).toMatchObject({ top: 26 + 24 - 15 + 8, bottom: 28 + 24 - 30 + 8 });
    el.remove();
  });

  it("reserves the 'berechnet' line of a derived PV or battery (REQ A-3, Z-8)", async () => {
    for (const [entities, expected] of [
      [
        { solar: "derived", grid: "sensor.g", house: "sensor.h", battery: "sensor.b" },
        { top: 41, bottom: 28 },
      ],
      [
        { solar: "sensor.s", grid: "sensor.g", house: "sensor.h", battery: "derived" },
        { top: 26, bottom: 43 },
      ],
    ] as const) {
      const el = document.createElement("enerlens-card") as Card;
      el.setConfig({ type: "custom:enerlens-card", entities });
      el.hass = hass("de", { ...BASE_STATES });
      document.body.appendChild(el);
      await el.updateComplete;
      expect(padding(el)).toMatchObject(expected);
      el.remove();
    }
  });

  it("keeps the list beside the cross level with the house (REQ L-1, Z-8)", async () => {
    // The list centres on the cross's box, the house sits at the centre of the
    // plot: more room above than below moves the plot down by half the
    // difference, and the list has to follow.
    const el = await mount({ nodes: { solar: { label: { entity: "sensor.today" } } } });
    expect(padding(el)).toMatchObject({ listTop: 24, listBottom: 0 });
    el.remove();
    const below = await mount({ nodes: { battery: { label: { entity: "sensor.today" } } } });
    expect(padding(below)).toMatchObject({ listTop: 0, listBottom: 24 });
    below.remove();
  });

  it("tells the stylesheet when there is no battery to leave room for (REQ Z-3, K-10)", async () => {
    // Without a battery circle the labels under grid and house may reach to the
    // middle between them.
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.s", grid: "sensor.g", house: "sensor.h" },
    });
    el.hass = hass("de", { ...BASE_STATES });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".cross")?.classList.contains("no-battery")).toBe(true);
    el.remove();
    const withBattery = await mount({});
    expect(withBattery.shadowRoot?.querySelector(".cross")?.classList.contains("no-battery")).toBe(
      false,
    );
    withBattery.remove();
  });

  it("does not move the bottom without a battery (REQ K-10)", async () => {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.s", grid: "sensor.g", house: "sensor.h" },
      nodes: { battery: { label: { entity: "sensor.autarky" } } },
    });
    el.hass = hass("de", { ...BASE_STATES });
    document.body.appendChild(el);
    await el.updateComplete;
    expect(padding(el).bottom).toBe(28);
    el.remove();
  });

  it("splits a node with a field above the icon into two targets (REQ Z-7)", async () => {
    const el = await mount({ nodes: { solar: { inside: { entity: "sensor.today" } } } });
    const solar = node(el, "solar");
    const upper = solar.querySelector("button.hit.upper") as HTMLButtonElement;
    const lower = solar.querySelector("button.hit.lower") as HTMLButtonElement;
    expect(upper && lower, "two targets").toBeTruthy();
    expect(upper.getAttribute("aria-label")).toBe("PV 12.389 kWh");
    const ids = opened(el);
    const windows: string[] = [];
    el.addEventListener("show-dialog", (ev) =>
      windows.push((ev as CustomEvent).detail.dialogParams.node),
    );
    upper.click();
    lower.click();
    // The field its entity, the node its window (Z-7, DF-20).
    expect(ids).toEqual(["sensor.today"]);
    expect(windows).toEqual(["solar"]);
    el.remove();
  });

  it("keeps one target for a field under the value (REQ Z-7)", async () => {
    const el = await mount({
      nodes: { solar: { inside: { entity: "sensor.today", position: "below" } } },
    });
    expect(node(el, "solar").querySelectorAll("button.hit").length).toBe(1);
    el.remove();
  });

  it("lets only the field open on a derived node (REQ Z-7, I-4)", async () => {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.s", grid: "sensor.g", battery: "sensor.b" },
      nodes: { house: { inside: { entity: "sensor.autarky" } } },
    });
    el.hass = hass("de", { ...BASE_STATES });
    document.body.appendChild(el);
    await el.updateComplete;
    const buttons = [...node(el, "house").querySelectorAll("button.hit")] as HTMLButtonElement[];
    expect(buttons.length).toBe(2);
    expect(buttons[1].disabled, "the derived half").toBe(true);
    const ids = opened(el);
    for (const b of buttons) if (!b.disabled) b.click();
    expect(ids).toEqual(["sensor.autarky"]);
    el.remove();
  });

  it("makes the label field a target of its own (REQ Z-7)", async () => {
    const el = await mount({
      nodes: { house: { label: { entity: "sensor.autarky", prefix: "Autarkie" } } },
    });
    const field = node(el, "house").querySelector(".extra-label") as HTMLElement;
    expect(field.tagName).toBe("BUTTON");
    expect(field.getAttribute("aria-label")).toBe("Autarkie 82 %");
    const ids = opened(el);
    field.click();
    expect(ids).toEqual(["sensor.autarky"]);
    el.remove();
  });

  it("stops the node's target 8 px short of the label field (REQ Z-7, I-3)", async () => {
    const el = await mount({
      nodes: {
        house: { label: { entity: "sensor.autarky" } },
        solar: { label: { entity: "sensor.today" } },
        battery: { label: { entity: "sensor.autarky" } },
      },
    });
    // The field's box starts 10 px beyond the circle, the node's ends 2 px beyond it.
    const house = node(el, "house").querySelector("button.hit") as HTMLElement;
    expect(house.getAttribute("style")).toContain("bottom:-2px");
    expect(house.getAttribute("style")).toContain("top:-22px");
    const solar = node(el, "solar").querySelector("button.hit") as HTMLElement;
    expect(solar.getAttribute("style")).toContain("top:-2px");
    const battery = node(el, "battery").querySelector("button.hit:not(.upper)") as HTMLElement;
    expect(battery.getAttribute("style")).toContain("bottom:-2px");
    // Without a field the targets reach 22 px beyond the circle as before.
    const grid = node(el, "grid").querySelector("button.hit") as HTMLElement;
    expect(grid.getAttribute("style")).toContain("bottom:-22px");
    el.remove();
  });

  it("lets the upper half win where PV's two halves meet (REQ Z-7, I-3)", async () => {
    // With a label field above PV the upper half grows past the middle to keep
    // its 44 px; the lower half comes later in the document and would take
    // that overlap back.
    const el = await mount({
      nodes: { solar: { inside: { entity: "sensor.today" }, label: { entity: "sensor.today" } } },
    });
    const upper = node(el, "solar").querySelector("button.hit.upper") as HTMLElement;
    expect(upper.getAttribute("style")).toContain("z-index:3");
    el.remove();
  });

  it("tabs through the battery from top to bottom (REQ I-5)", async () => {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { ...ENTITIES, battery_soc: "sensor.autarky" },
      nodes: { battery: { label: { entity: "sensor.today" } } },
    });
    el.hass = hass("de", { ...BASE_STATES });
    document.body.appendChild(el);
    await el.updateComplete;
    const order = [...node(el, "battery").querySelectorAll("button")].map((b) =>
      b.className.split(" ").slice(0, 2).join(" "),
    );
    // One target for the node, the charge in its window (I-2, DF-20), then the field.
    expect(order).toEqual(["hit", "extra-label extra"]);
    el.remove();
  });
});
