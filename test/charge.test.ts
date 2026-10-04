// @vitest-environment happy-dom
/**
 * A consumer's state of charge - an EV at its wallbox (REQ L-15): config,
 * plugged latch, last known value, selection, and the row it ends up in.
 */
import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import { ChargeTracker, pluggedVerdict, socValue } from "../src/charge";
import { collectChargeIds, normalizeConfig } from "../src/config";
import { buildBreakdown } from "../src/consumers";
import { renderList, showsCharge } from "../src/render/list";
import type {
  ChargeShow,
  ConsumerReading,
  HomeAssistant,
  ListEntry,
  Model,
  RawConfig,
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
    expect(config.consumers[0].charge).toEqual({
      soc: "sensor.car",
      show: "plugged",
      plugged: "sensor.status",
      unplugged: ["available", "none"],
    });
    expect(collectChargeIds(config)).toEqual(["sensor.car", "sensor.status"]);
  });

  it("defaults show to charging and needs nothing else", () => {
    const config = normalizeConfig(raw({ soc: "sensor.car" }));
    expect(config.consumers[0].charge).toEqual({
      soc: "sensor.car",
      show: "charging",
      plugged: undefined,
      unplugged: [],
    });
  });

  it("drops a charge without soc, with a warning, instead of failing (E-1)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const config = normalizeConfig(raw({ show: "always" }));
    expect(config.consumers[0].charge).toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("falls back to charging when show plugged has no plugged entity (E-1)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const config = normalizeConfig(raw({ soc: "sensor.car", show: "plugged" }));
    expect(config.consumers[0].charge?.show).toBe("charging");
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
    expect(config.consumers[0].charge?.unplugged).toEqual([]);
  });

  it("rejects an unknown show value like any enum", () => {
    expect(() => normalizeConfig(raw({ soc: "sensor.car", show: "sometimes" }))).toThrow();
  });
});

describe("plugged and state of charge (REQ L-15)", () => {
  it("reads an on/off entity", () => {
    expect(pluggedVerdict("on", [])).toBe(true);
    expect(pluggedVerdict("off", [])).toBe(false);
  });

  it("reads an enum against its unplugged states, ignoring case", () => {
    expect(pluggedVerdict("charging", ["available", "none"])).toBe(true);
    expect(pluggedVerdict("Available", ["available", "none"])).toBe(false);
  });

  it("has no answer for unavailable or unknown", () => {
    expect(pluggedVerdict("unavailable", [])).toBeUndefined();
    expect(pluggedVerdict("unknown", ["available"])).toBeUndefined();
    expect(pluggedVerdict(undefined, [])).toBeUndefined();
  });

  it("reads a state of charge and clamps it", () => {
    expect(socValue("64.4")).toBe(64.4);
    expect(socValue("104")).toBe(100);
    expect(socValue("unavailable")).toBeUndefined();
    expect(socValue("")).toBeUndefined();
  });

  const charge = {
    soc: "sensor.car",
    show: "plugged" as ChargeShow,
    plugged: "binary_sensor.plug",
    unplugged: [],
  };
  const consumers = [{ key: "sensor.wallbox", entity: "sensor.wallbox", color: "#000", charge }];

  it("keeps the last plugged answer while the entity is unavailable", () => {
    const tracker = new ChargeTracker();
    tracker.observe(hassWith({ "binary_sensor.plug": "on", "sensor.car": "50" }), consumers);
    const later = hassWith({ "binary_sensor.plug": "unavailable", "sensor.car": "50" });
    tracker.observe(later, consumers);
    expect(tracker.state(later, charge).plugged).toBe(true);
  });

  it("keeps the last state of charge grey while the car sleeps", () => {
    const tracker = new ChargeTracker();
    tracker.observe(hassWith({ "sensor.car": "72" }), consumers);
    const asleep = hassWith({ "sensor.car": "unavailable" });
    tracker.observe(asleep, consumers);
    const result = tracker.state(asleep, charge);
    expect(result.soc).toBe(72);
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
    expect(tracker.state(asleep, charge)).toMatchObject({ soc: 63, stale: true, since: 2_000_000 });
    expect(tracker.missing(asleep, consumers)).toEqual([]);
  });
});

function reading(w: number | null) {
  return w === null
    ? { available: false as const, derived: false }
    : { available: true as const, w, derived: false };
}

function wallbox(w: number | null, show: ChargeShow, plugged: boolean, soc = 80): ConsumerReading {
  return {
    key: "sensor.wallbox",
    entity: "sensor.wallbox",
    name: "Wallbox",
    color: "#7e57c2",
    reading: reading(w),
    charge: { entity: "sensor.car", show, plugged, soc, stale: false },
  };
}

function model(consumers: ConsumerReading[]): Model {
  return {
    solar: { available: false, derived: false },
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

  it("keeps a plugged-in car at 0 W, outside threshold and limit", () => {
    const b = buildBreakdown(model([other(2000), wallbox(0, "plugged", true)]), config);
    expect(b.entries.map((e) => e.key)).toEqual(["sensor.pump", "sensor.wallbox"]);
    // Nothing flows, so it gets no ring segment (R-2).
    expect(b.segments.map((s) => s.key)).toEqual(["sensor.pump"]);
  });

  it("lets an unplugged car go like any consumer", () => {
    const b = buildBreakdown(model([other(2000), wallbox(0, "plugged", false)]), config);
    expect(b.entries.map((e) => e.key)).toEqual(["sensor.pump"]);
  });

  it("follows the normal filter with show charging", () => {
    const b = buildBreakdown(model([other(2000), wallbox(0, "charging", true)]), config);
    expect(b.entries.map((e) => e.key)).toEqual(["sensor.pump"]);
  });

  it("always keeps the row with show always, even with the power unavailable", () => {
    const b = buildBreakdown(model([other(2000), wallbox(null, "always", false)]), config);
    expect(b.entries.map((e) => e.key)).toEqual(["sensor.pump", "sensor.wallbox"]);
    expect(b.entries[1].w).toBe(0);
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
    charge: { entity: "sensor.car", soc: 64, stale: false },
  };

  it("shows the power while charging and the charge on the ring", () => {
    const { host } = draw(base);
    expect(host.querySelector(".row-value")?.textContent).toContain("kW");
    const fill = host.querySelector(".charge-ring .fill");
    // In the SVG namespace, or the browser draws nothing.
    expect(fill?.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(host.querySelector(".soc-hit.mark")?.getAttribute("title")).toBe("Ladestand 64 %");
    expect(host.querySelector(".soc-hit.value")).toBeNull();
  });

  it("shows the charge in the value column when nothing flows", () => {
    const entry = { ...base, w: 0, charge: { entity: "sensor.car", soc: 80, stale: false } };
    expect(showsCharge(entry, config)).toBe(true);
    const { host } = draw(entry);
    expect(host.querySelector(".row-value")?.textContent?.trim()).toBe("80 %");
    expect(host.querySelector(".soc-hit.value")).toBeTruthy();
  });

  it("opens the charge from the mark and the power from the row", () => {
    const { host, onEntry } = draw(base);
    (host.querySelector(".soc-hit.mark") as HTMLButtonElement).click();
    (host.querySelector(".row-hit") as HTMLButtonElement).click();
    expect(onEntry.mock.calls.map((c) => c[0])).toEqual(["sensor.car", "sensor.wallbox"]);
  });

  it("greys a last known value and says how old it is", () => {
    const today = new Date();
    const since = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 5).getTime();
    const { host } = draw({
      ...base,
      w: 0,
      charge: { entity: "sensor.car", soc: 72, stale: true, since },
    });
    expect(host.querySelector(".row")?.classList.contains("stale")).toBe(true);
    expect(host.querySelector(".soc-hit.mark")?.getAttribute("title")).toBe(
      "Ladestand 72 % · Stand 14:05",
    );
  });

  it("shows the power and an empty ring without any value", () => {
    const { host } = draw({ ...base, w: 0, charge: { entity: "sensor.car", stale: false } });
    expect(host.querySelector(".charge-ring .fill")).toBeNull();
    expect(host.querySelector(".row-value")?.textContent).toContain("kW");
    expect(host.querySelector(".soc-hit.mark")?.getAttribute("title")).toBe("Ladestand unbekannt");
  });

  it("shows no figure for a power that is unavailable (rule 8)", () => {
    const { host } = draw({
      ...base,
      w: 0,
      powerUnknown: true,
      charge: { entity: "sensor.car", stale: false },
    });
    expect(host.querySelector(".row-value")?.textContent?.trim()).toBe("—");
  });

  it("greys only a charge, never a live power next to a stale one", () => {
    const since = Date.now();
    const { host } = draw({
      ...base,
      charge: { entity: "sensor.car", soc: 72, stale: true, since },
    });
    expect(host.querySelector(".row-value")?.classList.contains("soc")).toBe(false);
    const idle = draw({
      ...base,
      w: 0,
      charge: { entity: "sensor.car", soc: 72, stale: true, since },
    });
    expect(idle.host.querySelector(".row-value")?.classList.contains("soc")).toBe(true);
  });

  it("dates a value that is not from today", () => {
    const since = new Date(2026, 9, 1, 14, 5).getTime();
    const { host } = draw({
      ...base,
      w: 0,
      charge: { entity: "sensor.car", soc: 72, stale: true, since },
    });
    expect(host.querySelector(".soc-hit.mark")?.getAttribute("title")).toBe(
      "Ladestand 72 % · Stand 1.10. 14:05",
    );
  });

  it("leaves a row without charge as it was", () => {
    const { host } = draw({ ...base, charge: undefined });
    expect(host.querySelector("ha-icon.swatch.icon")).toBeTruthy();
    expect(host.querySelector(".charge-ring, .soc-hit")).toBeNull();
  });
});
