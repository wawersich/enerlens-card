import { afterEach, describe, expect, it, vi } from "vitest";
import { SOLAR_PALETTE, collectEntityIds, normalizeConfig } from "../src/config";
import { buildModel, buildModelFrom } from "../src/model";
import type { HassEntity, HomeAssistant, RawConfig } from "../src/types";

vi.mock("../src/localize", () => ({
  localize: (key: string) => key,
}));

/*
 * Several PV sources (REQ 2.17, PV-1 to PV-3): `entities.solar` as a list,
 * the PV the sum of its sources, a failed source marked, sources outside the
 * measured house value added to it.
 */

const TIME = "2026-10-24T12:00:00+02:00";

function entity(id: string, state: string): HassEntity {
  return {
    entity_id: id,
    state,
    attributes: { unit_of_measurement: "W" },
    last_changed: TIME,
    last_updated: TIME,
  };
}

function hassOf(states: Record<string, string>): HomeAssistant {
  return {
    states: Object.fromEntries(Object.entries(states).map(([id, s]) => [id, entity(id, s)])),
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: () => Promise.reject(new Error("not used")),
  };
}

function raw(solar: unknown, extra: Record<string, unknown> = {}): RawConfig {
  return {
    type: "custom:enerlens-card",
    entities: { solar, grid: "sensor.grid", house: "sensor.house" },
    ...extra,
  } as RawConfig;
}

const ROOF = { entity: "sensor.roof", name: "Dach", kwp: 9.8 };
const BALCONY = { entity: "sensor.balcony", name: "Balkon", kwp: 0.8, icon: "mdi:balcony" };

afterEach(() => vi.restoreAllMocks());

describe("PV-1: entities.solar as a list", () => {
  it("one entity stays exactly what it was", () => {
    const config = normalizeConfig(raw("sensor.pv"));
    expect(config.sources.solar).toEqual({ kind: "single", entity: "sensor.pv", invert: false });
    expect(config.solarSources).toEqual([]);
  });

  it("a list makes the PV the sum of its sources", () => {
    const config = normalizeConfig(raw([ROOF, BALCONY]));
    expect(config.sources.solar).toEqual({ kind: "sum" });
    expect(config.solarSources).toEqual([
      {
        key: "sensor.roof",
        entity: "sensor.roof",
        name: "Dach",
        kwp: 9.8,
        icon: undefined,
        color: SOLAR_PALETTE[0],
        invert: false,
        excluded: false,
      },
      {
        key: "sensor.balcony",
        entity: "sensor.balcony",
        name: "Balkon",
        kwp: 0.8,
        icon: "mdi:balcony",
        color: SOLAR_PALETTE[1],
        invert: false,
        excluded: false,
      },
    ]);
  });

  it("orange tones by default, six of them, repeating (PV-10)", () => {
    expect(SOLAR_PALETTE).toHaveLength(6);
    const list = Array.from({ length: 7 }, (_, i) => ({ entity: `sensor.pv${i}` }));
    const config = normalizeConfig(raw(list));
    expect(config.solarSources[6].color).toBe(SOLAR_PALETTE[0]);
    const own = normalizeConfig(raw([{ entity: "sensor.a", color: "#123456" }]));
    expect(own.solarSources[0].color).toBe("#123456");
  });

  it("an entity string inside the list is a source too", () => {
    const config = normalizeConfig(raw(["sensor.a", { entity: "sensor.b" }]));
    expect(config.solarSources.map((s) => s.entity)).toEqual(["sensor.a", "sensor.b"]);
  });

  it("a row without an entity is skipped with a warning, never an error card (E-1)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const config = normalizeConfig(raw([ROOF, { name: "leer" }, { entity: "" }]));
    expect(config.solarSources.map((s) => s.entity)).toEqual(["sensor.roof"]);
    expect(warn).toHaveBeenCalled();
  });

  it("a source picked twice: the second is skipped with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const config = normalizeConfig(raw([ROOF, { entity: "sensor.roof", name: "noch mal" }]));
    expect(config.solarSources).toHaveLength(1);
    expect(config.solarSources[0].name).toBe("Dach");
    expect(warn).toHaveBeenCalled();
  });

  it("an empty list is no PV: the card says what is missing", () => {
    expect(() => normalizeConfig(raw([]))).toThrow("error.config.missing_entities");
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(() => normalizeConfig(raw([{ entity: "" }]))).toThrow("error.config.missing_entities");
  });

  it("derived exists only in the single form", () => {
    expect(() => normalizeConfig(raw(["derived"]))).toThrow("error.config.mixed_form");
  });

  it("invert per source", () => {
    const config = normalizeConfig(raw([{ entity: "sensor.a", invert: true }]));
    expect(config.solarSources[0].invert).toBe(true);
  });

  it("kwp between 0.01 and 10 000, drawn to the limit with a warning (E-1)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const config = normalizeConfig(
      raw([
        { entity: "sensor.a", kwp: 0 },
        { entity: "sensor.b", kwp: 20000 },
        { entity: "sensor.c", kwp: 0.4 },
        { entity: "sensor.d", kwp: null },
      ]),
    );
    expect(config.solarSources.map((s) => s.kwp)).toEqual([0.01, 10000, 0.4, undefined]);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("house: excluded marks a source outside the measured house value (PV-3)", () => {
    const config = normalizeConfig(raw([ROOF, { ...BALCONY, house: "excluded" }]));
    expect(config.solarSources.map((s) => s.excluded)).toEqual([false, true]);
  });

  it("any other house value is ignored with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const config = normalizeConfig(raw([{ ...ROOF, house: "included" }]));
    expect(config.solarSources[0].excluded).toBe(false);
    expect(warn).toHaveBeenCalled();
  });

  it("ring.solar on and list.solar off by default (PV-4, PV-7)", () => {
    const config = normalizeConfig(raw([ROOF, BALCONY]));
    expect(config.ring.solar).toBe(true);
    expect(config.list.solar).toBe(false);
    const set = normalizeConfig(
      raw([ROOF, BALCONY], { ring: { solar: false }, list: { solar: true } }),
    );
    expect(set.ring.solar).toBe(false);
    expect(set.list.solar).toBe(true);
  });

  it("every source is an entity the card watches (T-3)", () => {
    const config = normalizeConfig(raw([ROOF, BALCONY]));
    expect(collectEntityIds(config)).toEqual(
      expect.arrayContaining(["sensor.roof", "sensor.balcony"]),
    );
  });
});

const BOTH = {
  "sensor.roof": "3000",
  "sensor.balcony": "400",
  "sensor.grid": "0",
  "sensor.house": "2000",
};

describe("PV-2: the sum of the sources", () => {
  const config = () => normalizeConfig(raw([ROOF, BALCONY]));

  it("adds the sources; the PV node has no entity of its own", () => {
    const model = buildModel(hassOf(BOTH), config());
    expect(model.solar).toMatchObject({ available: true, w: 3400, derived: false });
    expect(model.solar.entity).toBeUndefined();
    expect(model.solarSources.map((s) => s.reading)).toEqual([
      { available: true, w: 3000, entity: "sensor.roof", derived: false },
      { available: true, w: 400, entity: "sensor.balcony", derived: false },
    ]);
  });

  it("averaged (V-4) or over a period (EM-4): the sum of the sources' means", () => {
    const means: Record<string, number> = { "sensor.roof": 2500, "sensor.balcony": 300 };
    const model = buildModelFrom(hassOf(BOTH), config(), (id) => means[id] ?? 0);
    expect(model.solar).toMatchObject({ available: true, w: 2800 });
    expect(model.solarSources.map((s) => (s.reading.available ? s.reading.w : null))).toEqual([
      2500, 300,
    ]);
  });

  it("a negative source counts as it is - measured values are never touched (G-1)", () => {
    const model = buildModel(hassOf({ ...BOTH, "sensor.balcony": "-5" }), config());
    expect(model.solar).toMatchObject({ available: true, w: 2995 });
  });

  it("a source quiet before it went away counts as 0, silently (night rule)", () => {
    const last = new Map([["sensor.balcony", 3]]);
    const model = buildModel(
      hassOf({ ...BOTH, "sensor.balcony": "unavailable" }),
      config(),
      undefined,
      last,
    );
    expect(model.solar).toMatchObject({ available: true, w: 3000 });
    expect(model.solar.missing).toBeUndefined();
  });

  it("a source never seen counts as 0, silently - a reload at night is no fault", () => {
    const model = buildModel(hassOf({ ...BOTH, "sensor.balcony": "unavailable" }), config());
    expect(model.solar.missing).toBeUndefined();
  });

  it("a source that was delivering and went away: partial sum, named (PV-2)", () => {
    const last = new Map([["sensor.balcony", 380]]);
    const model = buildModel(
      hassOf({ ...BOTH, "sensor.balcony": "unavailable" }),
      config(),
      undefined,
      last,
    );
    expect(model.solar).toMatchObject({ available: true, w: 3000, missing: ["Balkon"] });
  });

  it("all sources gone: the PV is unavailable (K-9)", () => {
    const last = new Map([
      ["sensor.roof", 3000],
      ["sensor.balcony", 380],
    ]);
    const model = buildModel(
      hassOf({ ...BOTH, "sensor.roof": "unavailable", "sensor.balcony": "unknown" }),
      config(),
      undefined,
      last,
    );
    expect(model.solar.available).toBe(false);
  });

  it("a derived house built on a partial sum carries the same mark", () => {
    const derivedHouse = normalizeConfig({
      type: "custom:enerlens-card",
      entities: { solar: [ROOF, BALCONY], grid: "sensor.grid" },
    } as RawConfig);
    const last = new Map([["sensor.balcony", 380]]);
    const model = buildModel(
      hassOf({ "sensor.roof": "3000", "sensor.balcony": "unavailable", "sensor.grid": "500" }),
      derivedHouse,
      undefined,
      last,
    );
    expect(model.house).toMatchObject({
      available: true,
      w: 3500,
      derived: true,
      missing: ["Balkon"],
    });
  });
});

describe("PV-3: sources outside the measured house value", () => {
  const config = () => normalizeConfig(raw([ROOF, { ...BALCONY, house: "excluded" }]));

  it("adds them to the measured house and marks it corrected, still its own entity", () => {
    const model = buildModel(hassOf(BOTH), config());
    expect(model.house).toMatchObject({
      available: true,
      w: 2400,
      entity: "sensor.house",
      derived: false,
      corrected: true,
    });
  });

  it("an unavailable excluded source adds 0", () => {
    const model = buildModel(hassOf({ ...BOTH, "sensor.balcony": "unavailable" }), config());
    expect(model.house).toMatchObject({ available: true, w: 2000, corrected: true });
  });

  it("no measured house, no corrected one (A-4)", () => {
    const model = buildModel(hassOf({ ...BOTH, "sensor.house": "unavailable" }), config());
    expect(model.house.available).toBe(false);
  });

  it("a derived house already holds every source - nothing to add", () => {
    const derivedHouse = normalizeConfig({
      type: "custom:enerlens-card",
      entities: { solar: [ROOF, { ...BALCONY, house: "excluded" }], grid: "sensor.grid" },
    } as RawConfig);
    const model = buildModel(
      hassOf({ "sensor.roof": "3000", "sensor.balcony": "400", "sensor.grid": "500" }),
      derivedHouse,
    );
    expect(model.house).toMatchObject({ available: true, w: 3900, derived: true });
    expect(model.house.corrected).toBeUndefined();
  });

  it("a derived grid works from the corrected house", () => {
    const derivedGrid = normalizeConfig({
      type: "custom:enerlens-card",
      entities: {
        solar: [ROOF, { ...BALCONY, house: "excluded" }],
        grid: "derived",
        house: "sensor.house",
      },
    } as RawConfig);
    const model = buildModel(
      hassOf({ "sensor.roof": "3000", "sensor.balcony": "400", "sensor.house": "2000" }),
      derivedGrid,
    );
    // Corrected house 2400 - PV 3400 = -1000: export.
    expect(model.grid).toMatchObject({ available: true, net: -1000, negative: 1000 });
  });

  it("without the field nothing changes", () => {
    const model = buildModel(hassOf(BOTH), normalizeConfig(raw([ROOF, BALCONY])));
    expect(model.house).toMatchObject({ available: true, w: 2000 });
    expect(model.house.corrected).toBeUndefined();
  });
});
