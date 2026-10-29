// @vitest-environment happy-dom
/**
 * A consumer's state of charge - an EV at its wallbox (REQ L-15): config,
 * last known value, selection, and the row it ends up in. The plug became a
 * condition of REQ L-18 (consumer-hold.test.ts); here only its old spelling.
 */
import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import { ChargeTracker, indicatorValue } from "../src/charge";
import { collectChargeIds, normalizeConfig } from "../src/config";
import { buildBreakdown } from "../src/consumers";
import { idleIndicator, renderList } from "../src/render/list";
import type {
  ConsumerReading,
  HomeAssistant,
  ListEntry,
  Model,
  RawConfig,
  RowIndicators,
} from "../src/types";

const ENTITIES = { solar: "sensor.s", grid: "sensor.g", house: "sensor.h" };

function raw(charge: unknown): RawConfig {
  return {
    type: "custom:enerlens-card",
    entities: ENTITIES,
    consumers: [{ entity: "sensor.wallbox", name: "Wallbox", charge }],
  } as RawConfig;
}

function state(entity_id: string, value: string, lastChanged = "2026-10-04T10:00:00Z") {
  return {
    entity_id,
    state: value,
    attributes: {},
    last_changed: lastChanged,
    last_updated: lastChanged,
  };
}

function hassWith(states: Record<string, string>, callWS?: (msg: unknown) => Promise<unknown>) {
  const all: HomeAssistant["states"] = {};
  for (const [id, v] of Object.entries(states)) all[id] = state(id, v);
  return {
    states: all,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: (callWS ?? (async () => ({}))) as HomeAssistant["callWS"],
  } as HomeAssistant;
}

describe("charge config (REQ L-15)", () => {
  it("reads soc, show, plugged and lower-cases the unplugged states", () => {
    const config = normalizeConfig(
      raw({
        soc: "sensor.car",
        show: "plugged",
        plugged: "sensor.status",
        unplugged: ["Available", "none"],
      }),
    );
    // The old charge is a ring with 0-100 % (REQ L-20).
    expect(config.consumers[0].indicators).toEqual({
      slots: { ring: { entity: "sensor.car", min: 0, max: 100, percent: true } },
      idleValue: "ring",
      inEnergy: true,
    });
    // show/plugged/unplugged are the old spelling of a condition (REQ L-18).
    expect(config.consumers[0].hold).toEqual({
      kind: "condition",
      entity: "sensor.status",
      operator: "!=",
      values: ["available", "none"],
    });
    expect(collectChargeIds(config)).toEqual(["sensor.car", "sensor.status"]);
  });

  it("reads an own label for the charge, e.g. a printer's progress (issue #31)", () => {
    const config = normalizeConfig(raw({ soc: "sensor.printer", label: "Druckfortschritt" }));
    expect(config.consumers[0].indicators?.slots.ring?.label).toBe("Druckfortschritt");
    expect(
      normalizeConfig(raw({ soc: "sensor.car" })).consumers[0].indicators?.slots.ring?.label,
    ).toBeUndefined();
  });

  it("defaults show to charging and needs nothing else", () => {
    const config = normalizeConfig(raw({ soc: "sensor.car" }));
    expect(config.consumers[0].indicators).toEqual({
      slots: { ring: { entity: "sensor.car", min: 0, max: 100, percent: true } },
      idleValue: "ring",
      inEnergy: true,
    });
    expect(config.consumers[0].hold).toBeUndefined();
  });

  it("drops a charge without soc, with a warning, instead of failing (E-1)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const config = normalizeConfig(raw({ show: "always" }));
    expect(config.consumers[0].indicators).toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("falls back to charging when show plugged has no plugged entity (E-1)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const config = normalizeConfig(raw({ soc: "sensor.car", show: "plugged" }));
    expect(config.consumers[0].hold).toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("ignores unplugged states for an on/off plug (review 04.10.2026)", () => {
    const config = normalizeConfig(
      raw({
        soc: "sensor.car",
        show: "plugged",
        plugged: "binary_sensor.plug",
        unplugged: ["none"],
      }),
    );
    expect(config.consumers[0].hold).toMatchObject({ operator: "=", values: ["on"] });
  });

  it("rejects an unknown show value like any enum", () => {
    expect(() => normalizeConfig(raw({ soc: "sensor.car", show: "sometimes" }))).toThrow();
  });
});

describe("state of charge (REQ L-15)", () => {
  it("reads a number and never limits it - only the drawing is (rule 8)", () => {
    expect(indicatorValue("64.4")).toBe(64.4);
    expect(indicatorValue("104")).toBe(104);
    expect(indicatorValue("unavailable")).toBeUndefined();
    expect(indicatorValue("")).toBeUndefined();
  });

  const consumers = [
    {
      key: "sensor.wallbox",
      entity: "sensor.wallbox",
      color: "#000",
      indicators: {
        slots: { ring: { entity: "sensor.car", min: 0, max: 100 } },
        idleValue: "ring" as const,
        inEnergy: true,
      },
    },
  ];

  it("keeps the last state of charge grey while the car sleeps", () => {
    const tracker = new ChargeTracker();
    tracker.observe(hassWith({ "sensor.car": "72" }), consumers);
    const asleep = hassWith({ "sensor.car": "unavailable" });
    tracker.observe(asleep, consumers);
    const result = tracker.state(asleep, "sensor.car");
    expect(result.value).toBe(72);
    expect(result.stale).toBe(true);
    expect(result.since).toBe(Date.parse("2026-10-04T10:00:00Z"));
  });

  it("asks the recorder once for a value it has never seen, and takes the newest", async () => {
    const tracker = new ChargeTracker();
    const asleep = hassWith({ "sensor.car": "unavailable" });
    expect(tracker.missing(asleep, consumers)).toEqual(["sensor.car"]);
    const callWS = vi.fn(async () => ({
      "sensor.car": [
        { s: "61", lu: 1000 },
        { s: "63", lu: 2000 },
        { s: "unavailable", lu: 3000 },
      ],
    }));
    await tracker.prefill(hassWith({ "sensor.car": "unavailable" }, callWS), ["sensor.car"]);
    expect(callWS).toHaveBeenCalledTimes(1);
    expect(tracker.state(asleep, "sensor.car")).toMatchObject({
      value: 63,
      stale: true,
      since: 2_000_000,
    });
    expect(tracker.missing(asleep, consumers)).toEqual([]);
  });
});

function reading(w: number | null) {
  return w === null
    ? { available: false as const, derived: false }
    : { available: true as const, w, derived: false };
}

/** The old charge as a row carries it: a ring with 0-100 % (REQ L-20). */
function ring(
  value: number | undefined,
  stale: boolean,
  extra: { since?: number; label?: string; entity?: string } = {},
): RowIndicators {
  return {
    slots: {
      ring: {
        entity: extra.entity ?? "sensor.car",
        min: 0,
        max: 100,
        percent: true,
        value,
        stale,
        since: extra.since,
        label: extra.label,
      },
    },
    idleValue: "ring",
    inEnergy: true,
  };
}

function wallbox(w: number | null, held: boolean, soc = 80): ConsumerReading {
  return {
    key: "sensor.wallbox",
    entity: "sensor.wallbox",
    name: "Wallbox",
    color: "#7e57c2",
    reading: reading(w),
    indicators: ring(soc, false),
    held,
  };
}

function model(consumers: ConsumerReading[]): Model {
  return {
    solar: { available: false, derived: false },
    solarSources: [],
    grid: { available: false, derived: false },
    battery: null,
    soc: { available: false, derived: false },
    house: { available: false, derived: false },
    consumers,
  };
}

const other = (w: number): ConsumerReading => ({
  key: "sensor.pump",
  entity: "sensor.pump",
  name: "Pump",
  color: "#26a69a",
  reading: reading(w),
});

describe("which rows a charge keeps in the list (REQ L-15)", () => {
  const config = normalizeConfig({
    type: "custom:enerlens-card",
    entities: ENTITIES,
    max_consumers: 1,
  } as RawConfig);

  it("keeps a plugged-in car at 0 W outside the threshold; it takes a place of the limit", () => {
    // Since 29.10.2026 held rows count to max_consumers (REQ L-4): the limit
    // bounds the height of the card.
    const b = buildBreakdown(model([other(2000), wallbox(0, true)]), config);
    expect(b.entries.map((e) => e.key)).toEqual(["sensor.wallbox"]);
    // Nothing flows, so it gets no ring segment (R-2).
    expect(b.segments).toEqual([]);
  });

  it("lets an unplugged car go like any consumer", () => {
    const b = buildBreakdown(model([other(2000), wallbox(0, false)]), config);
    expect(b.entries.map((e) => e.key)).toEqual(["sensor.pump"]);
  });

  it("follows the normal filter with show charging", () => {
    const b = buildBreakdown(model([other(2000), wallbox(0, false)]), config);
    expect(b.entries.map((e) => e.key)).toEqual(["sensor.pump"]);
  });

  it("always keeps a held row, even with the power unavailable", () => {
    const b = buildBreakdown(model([other(2000), wallbox(null, true)]), config);
    expect(b.entries.map((e) => e.key)).toEqual(["sensor.wallbox"]);
    expect(b.entries[0].w).toBe(0);
  });
});

describe("the row with a state of charge (REQ L-15)", () => {
  const config = normalizeConfig({
    type: "custom:enerlens-card",
    entities: ENTITIES,
    list: { enabled: true },
  } as RawConfig);
  const hass = hassWith({});

  function draw(entry: ListEntry, onEntry = vi.fn()) {
    const host = document.createElement("div");
    const result = renderList({ entries: [entry], segments: [] }, config, hass, onEntry, false);
    render(result, host);
    return { host, onEntry };
  }

  const base: ListEntry = {
    key: "sensor.wallbox",
    name: "Wallbox",
    w: 10740,
    color: "#7e57c2",
    entity: "sensor.wallbox",
    icon: "mdi:ev-station",
    threshold: 10,
    isRest: false,
    indicators: ring(64, false),
  };

  it("shows the power while charging and the charge on the ring", () => {
    const { host } = draw(base);
    expect(host.querySelector(".row-value")?.textContent).toContain("kW");
    const fill = host.querySelector(".charge-ring .fill");
    // In the SVG namespace, or the browser draws nothing.
    expect(fill?.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(host.querySelector(".swatch")?.getAttribute("title")).toBe("Ladestand 64 %");
  });

  it("shows the charge in the value column when nothing flows", () => {
    // Whether it does is decided on the tick (REQ L-20): `idle`.
    const entry = { ...base, w: 0, idle: true, indicators: ring(80, false) };
    expect(idleIndicator(entry, config)).toBeTruthy();
    const { host } = draw(entry);
    expect(host.querySelector(".row-value")?.textContent?.trim()).toBe("80 %");
  });

  it("opens the detail window from the row and from its mark, with one tab stop (L-20)", () => {
    const { host, onEntry } = draw({ ...base, w: 0, idle: true });
    for (const sel of [".swatch", ".row-hit"]) {
      (host.querySelector(sel) as HTMLElement).click();
    }
    // The power entity stays the way out, when the window cannot open (DF-7).
    expect(onEntry.mock.calls.map((c) => [c[0], c[2]])).toEqual([
      ["sensor.wallbox", "consumer:sensor.wallbox"],
      ["sensor.wallbox", "consumer:sensor.wallbox"],
    ]);
    // The mark is no button of its own any more; the row's name says everything.
    expect(host.querySelectorAll("button")).toHaveLength(1);
    expect(host.querySelector(".row-hit")?.getAttribute("aria-label")).toContain("Ladestand 64 %");
  });

  it("a row without a charge opens the window too (DF-19)", () => {
    const { host, onEntry } = draw({ ...base, indicators: undefined });
    (host.querySelector(".row-hit") as HTMLButtonElement).click();
    expect(onEntry.mock.calls.map((c) => [c[0], c[2]])).toEqual([
      ["sensor.wallbox", "consumer:sensor.wallbox"],
    ]);
  });

  it("a PV row opens its source's window (DF-19)", () => {
    const onEntry = vi.fn();
    const host = document.createElement("div");
    const source = {
      ...base,
      key: "sensor.roof",
      entity: "sensor.roof",
      name: "Dach",
      indicators: undefined,
    };
    render(
      renderList({ entries: [], segments: [] }, config, hass, onEntry, false, [source], false),
      host,
    );
    (host.querySelector(".row.pv .row-hit") as HTMLButtonElement).click();
    expect(onEntry.mock.calls.map((c) => [c[0], c[2]])).toEqual([
      ["sensor.roof", "source:sensor.roof"],
    ]);
  });

  it("names the charge by its own label where one is set (issue #31)", () => {
    const { host } = draw({
      ...base,
      indicators: ring(87, false, { entity: "sensor.printer", label: "Druckfortschritt" }),
    });
    expect(host.querySelector(".swatch")?.getAttribute("title")).toBe("Druckfortschritt 87 %");
    const unknown = draw({
      ...base,
      indicators: ring(undefined, false, { entity: "sensor.p", label: "Druck" }),
    });
    expect(unknown.host.querySelector(".swatch")?.getAttribute("title")).toBe("Druck unbekannt");
  });

  it("greys a last known value and says how old it is", () => {
    const today = new Date();
    const since = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 5).getTime();
    const { host } = draw({ ...base, w: 0, idle: true, indicators: ring(72, true, { since }) });
    expect(host.querySelector(".row")?.classList.contains("stale")).toBe(true);
    expect(host.querySelector(".charge-ring")?.classList.contains("stale")).toBe(true);
    expect(host.querySelector(".swatch")?.getAttribute("title")).toBe(
      "Ladestand 72 % · Stand 14:05",
    );
  });

  it("shows the power and an empty ring without any value", () => {
    const { host } = draw({ ...base, w: 0, idle: true, indicators: ring(undefined, false) });
    expect(host.querySelector(".charge-ring .fill")).toBeNull();
    expect(host.querySelector(".row-value")?.textContent).toContain("kW");
    expect(host.querySelector(".swatch")?.getAttribute("title")).toBe("Ladestand unbekannt");
  });

  it("shows no figure for a power that is unavailable (rule 8)", () => {
    const { host } = draw({
      ...base,
      w: 0,
      idle: true,
      powerUnknown: true,
      indicators: ring(undefined, false),
    });
    expect(host.querySelector(".row-value")?.textContent?.trim()).toBe("—");
  });

  it("greys only a charge, never a live power next to a stale one", () => {
    const since = Date.now();
    const { host } = draw({ ...base, indicators: ring(72, true, { since }) });
    expect(host.querySelector(".row-value")?.classList.contains("soc")).toBe(false);
    const idle = draw({ ...base, w: 0, idle: true, indicators: ring(72, true, { since }) });
    expect(idle.host.querySelector(".row-value")?.classList.contains("soc")).toBe(true);
  });

  it("dates a value that is not from today", () => {
    const since = new Date(2026, 9, 1, 14, 5).getTime();
    const { host } = draw({ ...base, w: 0, indicators: ring(72, true, { since }) });
    expect(host.querySelector(".swatch")?.getAttribute("title")).toBe(
      "Ladestand 72 % · Stand 1.10. 14:05",
    );
  });

  it("leaves a row without charge as it was", () => {
    const { host } = draw({ ...base, indicators: undefined });
    expect(host.querySelector("ha-icon.swatch.icon")).toBeTruthy();
    expect(host.querySelector(".charge-ring, .soc-hit")).toBeNull();
  });
});
