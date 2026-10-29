// @vitest-environment happy-dom
/**
 * Extra values of a consumer - ring, bars, fill (REQ L-20): config, the
 * value column decided on the tick, drawing, tooltips, energy mode.
 */
import { render } from "lit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChargeTracker } from "../src/charge";
import { normalizeConfig } from "../src/config";
import { buildBreakdown, refreshBreakdownValues } from "../src/consumers";
import { buildModel } from "../src/model";
import { fractionOf, idleIndicator, renderList } from "../src/render/list";
import type { HomeAssistant, IndicatorReading, ListEntry, RawConfig } from "../src/types";

afterEach(() => vi.restoreAllMocks());

const ENTITIES = { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" };
const UNITS: Record<string, string> = { "sensor.ww": "°C", "sensor.car": "%", "sensor.tank": "%" };

function hassWith(states: Record<string, string>): HomeAssistant {
  const all: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(states)) {
    const unit = UNITS[id] ?? (id.startsWith("sensor.") ? "W" : undefined);
    all[id] = {
      entity_id: id,
      state,
      attributes: unit && state !== "unavailable" ? { unit_of_measurement: unit } : {},
      last_changed: "2026-10-29T10:00:00Z",
      last_updated: "2026-10-29T10:00:00Z",
    };
  }
  return {
    states: all,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  } as HomeAssistant;
}

const config = (consumers: unknown[], extra: Record<string, unknown> = {}) =>
  normalizeConfig({
    type: "custom:enerlens-card",
    entities: ENTITIES,
    consumers,
    list: { enabled: true },
    ...extra,
  } as RawConfig);

const PUMP = {
  entity: "sensor.pump",
  name: "Wärmepumpe",
  min_w: 40,
  show: "always",
  indicators: {
    bar_top: { entity: "sensor.ww", min: 40, max: 60, label: "Warmwasser" },
    idle_value: "bar_top",
  },
};

/** The chain the card runs, over successive moments. */
function rows(cfg: ReturnType<typeof config>, moments: Record<string, string>[]) {
  const tracker = new ChargeTracker();
  let hass = hassWith({});
  for (const m of moments) {
    hass = hassWith({ "sensor.solar": "0", "sensor.grid": "500", "sensor.house": "500", ...m });
    tracker.observe(hass, cfg.consumers);
  }
  const model = buildModel(hass, cfg, (e) => tracker.state(hass, e));
  return { hass, breakdown: buildBreakdown(model, cfg), model, tracker };
}

function draw(entry: ListEntry, cfg: ReturnType<typeof config>, hass: HomeAssistant) {
  const host = document.createElement("div");
  render(renderList({ entries: [entry], segments: [] }, cfg, hass, vi.fn(), false), host);
  return host;
}

describe("indicators in the config (REQ L-20)", () => {
  it("reads the four places with their defaults, idle_value and in_energy", () => {
    const c = config([
      {
        entity: "sensor.pump",
        indicators: {
          ring: { entity: "sensor.a" },
          bar_top: { entity: "sensor.b", min: 40, max: 60, label: "WW", color: "#e53935" },
          bar_bottom: { entity: "sensor.c" },
          fill: { entity: "sensor.d", color: "#000" },
          idle_value: "bar_top",
          in_energy: true,
        },
      },
    ]).consumers[0].indicators;
    expect(c?.slots.ring).toEqual({
      entity: "sensor.a",
      min: 0,
      max: 100,
      label: undefined,
      color: undefined,
    });
    expect(c?.slots.bar_top).toMatchObject({ min: 40, max: 60, label: "WW", color: "#e53935" });
    // The fill is the consumer's own mark and keeps its colour.
    expect(c?.slots.fill?.color).toBeUndefined();
    expect(c?.idleValue).toBe("bar_top");
    expect(c?.inEnergy).toBe(true);
  });

  it("drops a place without entity and an idle_value that names no place, with a warning (E-1)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const c = config([
      {
        entity: "sensor.pump",
        indicators: { ring: { label: "x" }, bar_top: { entity: "sensor.b" }, idle_value: "fill" },
      },
    ]).consumers[0].indicators;
    expect(c?.slots.ring).toBeUndefined();
    expect(c?.idleValue).toBe("power");
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("takes min > max as written - it turns up while one types", () => {
    const c = config([
      { entity: "sensor.p", indicators: { bar_top: { entity: "sensor.b", min: 40, max: 6 } } },
    ]);
    expect(c.consumers[0].indicators?.slots.bar_top).toMatchObject({ min: 40, max: 6 });
  });

  it("lets indicators win over the old charge, with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const c = config([
      {
        entity: "sensor.p",
        charge: { soc: "sensor.car" },
        indicators: { fill: { entity: "sensor.tank" } },
      },
    ]).consumers[0].indicators;
    expect(Object.keys(c?.slots ?? {})).toEqual(["fill"]);
    expect(warn).toHaveBeenCalled();
  });
});

describe("how far a place fills (REQ L-20)", () => {
  const ind = (value: number | undefined, min = 0, max = 100) =>
    ({ entity: "e", min, max, value, stale: false }) as IndicatorReading;
  it("scales within min..max and holds the drawing to 0..1, never the figure", () => {
    expect(fractionOf(ind(52, 40, 60))).toBeCloseTo(0.6);
    expect(fractionOf(ind(70, 40, 60))).toBe(1);
    expect(fractionOf(ind(30, 40, 60))).toBe(0);
    expect(fractionOf(ind(undefined))).toBeUndefined();
  });
  it("runs a reversed scale the other way, and min = max is empty below and full from it", () => {
    expect(fractionOf(ind(50, 60, 40))).toBeCloseTo(0.5);
    expect(fractionOf(ind(55, 60, 40))).toBeCloseTo(0.25);
    expect(fractionOf(ind(49, 50, 50))).toBe(0);
    expect(fractionOf(ind(50, 50, 50))).toBe(1);
  });
});

describe("the value column (REQ L-20)", () => {
  const c = config([PUMP]);

  it("shows the extra value below the row's own threshold, the power from it on", () => {
    const standby = rows(c, [{ "sensor.pump": "25", "sensor.ww": "52" }]);
    const row = standby.breakdown.entries.find((e) => e.key === "sensor.pump") as ListEntry;
    expect(row.idle).toBe(true);
    expect(draw(row, c, standby.hass).querySelector(".row-value")?.textContent?.trim()).toBe(
      "52 °C",
    );
    const running = rows(c, [{ "sensor.pump": "1800", "sensor.ww": "52" }]);
    const busy = running.breakdown.entries.find((e) => e.key === "sensor.pump") as ListEntry;
    expect(busy.idle).toBeUndefined();
    expect(draw(busy, c, running.hass).querySelector(".row-value")?.textContent).toContain("kW");
  });

  it("switches on the tick only, not with every reading (L-7)", () => {
    const first = rows(c, [{ "sensor.pump": "25", "sensor.ww": "52" }]);
    const later = rows(c, [{ "sensor.pump": "1800", "sensor.ww": "53" }]);
    const kept = refreshBreakdownValues(first.breakdown, later.model, c);
    const row = kept.entries.find((e) => e.key === "sensor.pump") as ListEntry;
    expect(row.idle).toBe(true);
    // The value itself is live.
    expect(idleIndicator(row, c)?.value).toBe(53);
  });

  it("shows the power when the chosen place has no number", () => {
    const { breakdown, hass } = rows(c, [{ "sensor.pump": "25", "sensor.ww": "unknown" }]);
    const row = breakdown.entries.find((e) => e.key === "sensor.pump") as ListEntry;
    expect(idleIndicator(row, c)).toBeUndefined();
    expect(draw(row, c, hass).querySelector(".row-value")?.textContent).toContain("W");
  });

  it("keeps the unit of a stale value and greys it (review 29.10.2026)", () => {
    const { breakdown, hass } = rows(c, [
      { "sensor.pump": "25", "sensor.ww": "52" },
      { "sensor.pump": "25", "sensor.ww": "unavailable" },
    ]);
    const row = breakdown.entries.find((e) => e.key === "sensor.pump") as ListEntry;
    const host = draw(row, c, hass);
    expect(host.querySelector(".row-value")?.textContent?.trim()).toBe("52 °C");
    expect(host.querySelector(".row")?.classList.contains("stale")).toBe(true);
    expect(host.querySelector(".bar.top")?.classList.contains("stale")).toBe(true);
  });

  it("shows a value in % in whole numbers, as the state of charge always was", () => {
    const held = config([
      {
        entity: "sensor.wb",
        show: "always",
        indicators: { ring: { entity: "sensor.car" }, idle_value: "ring" },
      },
    ]);
    const h = rows(held, [{ "sensor.wb": "0", "sensor.car": "64.4" }]);
    const r = h.breakdown.entries.find((e) => e.key === "sensor.wb") as ListEntry;
    expect(draw(r, held, h.hass).querySelector(".row-value")?.textContent?.trim()).toBe("64 %");
  });
});

describe("drawing and tooltips (REQ L-20)", () => {
  const all = config([
    {
      entity: "sensor.pump",
      name: "Wärmepumpe",
      show: "always",
      indicators: {
        ring: { entity: "sensor.car" },
        bar_top: { entity: "sensor.ww", min: 40, max: 60, label: "Warmwasser", color: "#e53935" },
        bar_bottom: { entity: "sensor.ww", min: 40, max: 60 },
        fill: { entity: "sensor.tank", label: "Puffer" },
      },
    },
  ]);
  const at = { "sensor.pump": "800", "sensor.ww": "52", "sensor.car": "64", "sensor.tank": "80" };

  it("draws the ring, both bars and the fill, with their own tooltips", () => {
    const { breakdown, hass } = rows(all, [at]);
    const host = draw(
      breakdown.entries.find((e) => e.key === "sensor.pump") as ListEntry,
      all,
      hass,
    );
    expect(host.querySelector(".charge-ring")).toBeTruthy();
    expect(host.querySelector(".swatch.filled")).toBeTruthy();
    expect(host.querySelector(".swatch")?.getAttribute("title")).toBe(
      "Ladestand 64 %\nPuffer 80 %",
    );
    const top = host.querySelector(".bar.top") as HTMLElement;
    expect(top.getAttribute("title")).toBe("Warmwasser 52 °C");
    expect(top.style.getPropertyValue("--bar-color")).toBe("#e53935");
    expect(top.style.getPropertyValue("--bar-fill")).toBe("60.0%");
    // Without a label: the entity's name.
    expect(host.querySelector(".bar.bottom")?.getAttribute("title")).toBe("sensor.ww 52 °C");
  });

  it("has one tab stop whose label names every value", () => {
    const { breakdown, hass } = rows(all, [at]);
    const host = draw(
      breakdown.entries.find((e) => e.key === "sensor.pump") as ListEntry,
      all,
      hass,
    );
    expect(host.querySelectorAll("button")).toHaveLength(1);
    const label = host.querySelector(".row-hit")?.getAttribute("aria-label") ?? "";
    for (const part of ["Wärmepumpe", "Ladestand 64 %", "Warmwasser 52 °C", "Puffer 80 %"]) {
      expect(label).toContain(part);
    }
  });

  it("greys a stale fill only, a fresh ring keeps its colour (review 29.10.2026)", () => {
    const { breakdown, hass } = rows(all, [at, { ...at, "sensor.tank": "unavailable" }]);
    const host = draw(
      breakdown.entries.find((e) => e.key === "sensor.pump") as ListEntry,
      all,
      hass,
    );
    expect(host.querySelector(".swatch.filled")?.classList.contains("stale")).toBe(true);
    const ring = host.querySelector(".charge-ring") as SVGElement;
    expect(ring.classList.contains("stale")).toBe(false);
    // Its own colour on the ring, so the grey of the mark does not reach it.
    expect(ring.getAttribute("style")).toContain("color:");
  });

  it("leaves the indicators out in a period, unless in_energy; then 'now' in the tooltip", () => {
    const energy = { roles: {}, consumers: {}, rest: { tier: 0 as const, note: "" } };
    const off = { ...all, energy };
    const { breakdown, hass } = rows(all, [at]);
    const entry = breakdown.entries.find((e) => e.key === "sensor.pump") as ListEntry;
    const hidden = draw(entry, off, hass);
    expect(hidden.querySelector(".charge-ring, .bar, .swatch.filled")).toBeNull();
    const on = {
      ...entry,
      indicators: { ...(entry.indicators as NonNullable<ListEntry["indicators"]>), inEnergy: true },
    };
    const shown = draw(on, off, hass);
    expect(shown.querySelector(".bar.top")?.getAttribute("title")).toBe("Warmwasser 52 °C · jetzt");
    // The value column keeps the period's figure (EM-5).
    expect(idleIndicator({ ...on, idle: true }, off)).toBeUndefined();
  });

  it("keeps the indicators on a row without statistics in a period (EM-12)", () => {
    const energy = {
      ...all,
      energy: {
        roles: {},
        consumers: { "sensor.pump": { tier: 0 as const, note: "" } },
        rest: { tier: 0 as const, note: "" },
      },
    };
    const { breakdown } = rows(energy, [{ "sensor.ww": "52" }]);
    expect(breakdown.entries.find((e) => e.key === "sensor.pump")?.indicators).toBeTruthy();
  });
});
