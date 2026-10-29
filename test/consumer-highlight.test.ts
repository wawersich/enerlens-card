// @vitest-environment happy-dom
/**
 * A consumer row can be highlighted: bold, a band in its colour, or both
 * (REQ L-19). Two switches, nothing else - no extra room in the row.
 */
import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import { normalizeConfig } from "../src/config";
import { buildBreakdown, refreshBreakdownValues } from "../src/consumers";
import { buildModel } from "../src/model";
import { renderList } from "../src/render/list";
import type { HomeAssistant, ListEntry, RawConfig } from "../src/types";

const ENTITIES = { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" };

function config(consumers: unknown[]) {
  return normalizeConfig({
    type: "custom:enerlens-card",
    entities: ENTITIES,
    consumers,
    list: { enabled: true },
  } as RawConfig);
}

function hassWith(states: Record<string, string>): HomeAssistant {
  const all: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(states)) {
    all[id] = {
      entity_id: id,
      state,
      attributes: { unit_of_measurement: "W" },
      last_changed: "",
      last_updated: "",
    };
  }
  return {
    states: all,
    locale: { language: "de", number_format: "language" },
    language: "de",
  } as HomeAssistant;
}

describe("highlight in the config (REQ L-19)", () => {
  it("reads bold and band, and nothing set means no highlight", () => {
    const c = config([
      { entity: "sensor.a", highlight: { bold: true, band: true } },
      { entity: "sensor.b", highlight: { band: true } },
      { entity: "sensor.c", highlight: { bold: false, band: false } },
      { entity: "sensor.d" },
    ]).consumers;
    expect(c.map((x) => x.highlight)).toEqual([
      { bold: true, band: true },
      { bold: false, band: true },
      undefined,
      undefined,
    ]);
    expect(config([{ entity: "sensor.a", highlight: {} }]).consumers[0].highlight).toBeUndefined();
    expect(
      config([{ entity: "sensor.a", highlight: null }]).consumers[0].highlight,
    ).toBeUndefined();
  });

  it("rejects a highlight that is no block, or a switch that is no boolean", () => {
    expect(() => config([{ entity: "sensor.a", highlight: "bold" }])).toThrow();
    expect(() => config([{ entity: "sensor.a", highlight: { bold: "yes" } }])).toThrow();
  });
});

describe("the highlighted row (REQ L-19)", () => {
  it("carries the highlight from the config into the list entry", () => {
    const c = config([
      { entity: "sensor.wallbox", highlight: { band: true } },
      { entity: "sensor.oven" },
    ]);
    const hass = hassWith({
      "sensor.solar": "0",
      "sensor.grid": "3000",
      "sensor.house": "3000",
      "sensor.wallbox": "2000",
      "sensor.oven": "1000",
    });
    const entries = buildBreakdown(buildModel(hass, c), c).entries;
    expect(entries.find((e) => e.key === "sensor.wallbox")?.highlight).toEqual({
      bold: false,
      band: true,
    });
    expect(entries.find((e) => e.key === "sensor.oven")?.highlight).toBeUndefined();
  });

  it("keeps the highlight between ticks (L-7) and on a row without statistics (EM-12)", () => {
    const c = config([{ entity: "sensor.wallbox", highlight: { bold: true } }]);
    const hass = (w: string) =>
      hassWith({ "sensor.solar": "0", "sensor.grid": w, "sensor.house": w, "sensor.wallbox": w });
    const first = buildBreakdown(buildModel(hass("2000"), c), c);
    const later = refreshBreakdownValues(first, buildModel(hass("1500"), c), c);
    expect(later.entries.find((e) => e.key === "sensor.wallbox")?.highlight).toEqual({
      bold: true,
      band: false,
    });
    const energy = {
      ...c,
      energy: {
        roles: {},
        consumers: { "sensor.wallbox": { tier: 0 as const, note: "" } },
        rest: { tier: 0 as const, note: "" },
      },
    };
    const gone = buildBreakdown(buildModel(hassWith({}), energy), energy);
    expect(gone.entries.find((e) => e.key === "sensor.wallbox")?.highlight).toEqual({
      bold: true,
      band: false,
    });
  });

  it("marks the row bold and banded, the band in the row's colour", () => {
    const c = config([]);
    const entry: ListEntry = {
      key: "sensor.wallbox",
      name: "Wallbox",
      w: 2000,
      color: "#43a047",
      entity: "sensor.wallbox",
      threshold: 10,
      isRest: false,
      highlight: { bold: true, band: true },
    };
    const host = document.createElement("div");
    render(renderList({ entries: [entry], segments: [] }, c, hassWith({}), vi.fn(), false), host);
    const row = host.querySelector(".row") as HTMLElement;
    expect(row.classList.contains("bold")).toBe(true);
    expect(row.classList.contains("band")).toBe(true);
    expect(row.style.getPropertyValue("--el-row-color")).toBe("#43a047");
  });

  it("sets no row colour for bold alone", () => {
    const c = config([]);
    const host = document.createElement("div");
    const entry: ListEntry = {
      key: "sensor.pump",
      name: "Pumpe",
      w: 300,
      color: "#8d6e63",
      entity: "sensor.pump",
      threshold: 10,
      isRest: false,
      highlight: { bold: true, band: false },
    };
    render(renderList({ entries: [entry], segments: [] }, c, hassWith({}), vi.fn(), false), host);
    const row = host.querySelector(".row") as HTMLElement;
    expect(row.classList.contains("bold")).toBe(true);
    expect(row.classList.contains("band")).toBe(false);
    expect(row.style.getPropertyValue("--el-row-color")).toBe("");
  });

  it("leaves a row without highlight as it was", () => {
    const c = config([]);
    const host = document.createElement("div");
    const entry: ListEntry = {
      key: "sensor.oven",
      name: "Herd",
      w: 1000,
      color: "#f4511e",
      entity: "sensor.oven",
      threshold: 10,
      isRest: false,
    };
    render(renderList({ entries: [entry], segments: [] }, c, hassWith({}), vi.fn(), false), host);
    const row = host.querySelector(".row") as HTMLElement;
    expect(row.classList.contains("bold") || row.classList.contains("band")).toBe(false);
  });
});
