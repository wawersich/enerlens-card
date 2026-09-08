import { afterEach, describe, expect, it, vi } from "vitest";
import { POWER_UNITS, buildModel, buildModelFrom } from "../src/model";
import type {
  Config,
  HassEntity,
  HomeAssistant,
  NormalizedConsumer,
  Reading,
  Signed,
  SourceSpec,
} from "../src/types";

// ---------------------------------------------------------------------------
// Stubs - only the fields the model touches
// ---------------------------------------------------------------------------

const TIME = "2026-09-05T12:00:00+02:00";

function entity(
  entity_id: string,
  state: string,
  attributes: HassEntity["attributes"] = { unit_of_measurement: "W" },
): HassEntity {
  return { entity_id, state, attributes, last_changed: TIME, last_updated: TIME };
}

function hassOf(...entities: HassEntity[]): HomeAssistant {
  return {
    states: Object.fromEntries(entities.map((e) => [e.entity_id, e])),
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: () => Promise.reject(new Error("not used in these tests")),
  };
}

function single(entity: string, invert = false): SourceSpec {
  return { kind: "single", entity, invert };
}

function configOf(
  sources: Partial<Config["sources"]>,
  consumers: NormalizedConsumer[] = [],
): Config {
  return {
    sources: {
      solar: single("sensor.solar"),
      grid: single("sensor.grid"),
      battery: { kind: "absent" },
      house: single("sensor.house"),
      ...sources,
    },
    consumers,
    minConsumerW: 10,
    maxConsumers: Number.POSITIVE_INFINITY,
    updateIntervalS: 5,
    list: { enabled: true },
    ring: { enabled: true },
    view: {
      defaultMode: "current",
      avgShortMinutes: 5,
      avgLongMinutes: 15,
      showSelector: true,
      remember: true,
    },
    flow: {
      minW: 10,
      slowBelowW: 500,
      fullSpeedW: 2000,
      moreDotsAboveW: 2000,
      maxDotsAtW: 6000,
      maxDots: 5,
      slowS: 5,
      fastS: 1.8,
      animation: "auto",
      inactiveLines: "show" as const,
    },
    colors: {
      solar: "#ff9800",
      house: "#03a9f4",
      grid_import: "#488fc2",
      grid_export: "#8353d1",
      battery_charge: "#f06292",
      battery_discharge: "#4db6ac",
      rest: "#9e9e9e",
      socStops: [
        { at: 0, color: "#e53935" },
        { at: 100, color: "#43a047" },
      ],
      consumerPalette: ["#7e57c2"],
    },
    icons: {},
  };
}

/** Narrowing helpers - the tests assert availability first, then the numbers. */
function available(reading: Reading): Extract<Reading, { available: true }> {
  expect(reading.available).toBe(true);
  return reading as Extract<Reading, { available: true }>;
}

function signed(value: Signed | null): Extract<Signed, { available: true }> {
  expect(value).not.toBeNull();
  expect(value?.available).toBe(true);
  return value as Extract<Signed, { available: true }>;
}

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// 4.1 Normalization (REQ K-8, K-9)
// ---------------------------------------------------------------------------

describe("normalization (REQ 4.1, K-8)", () => {
  it.each(Object.entries(POWER_UNITS))("scales %s by its SI factor", (unit, factor) => {
    const hass = hassOf(entity("sensor.solar", "2", { unit_of_measurement: unit }));
    const model = buildModel(hass, configOf({ house: { kind: "derived" } }));
    expect(available(model.solar).w).toBeCloseTo(2 * factor, 9);
  });

  it("treats mW as milli and MW as mega (case-sensitive)", () => {
    const milli = buildModel(
      hassOf(entity("sensor.solar", "1000", { unit_of_measurement: "mW" })),
      configOf({ house: { kind: "derived" } }),
    );
    const mega = buildModel(
      hassOf(entity("sensor.solar", "1000", { unit_of_measurement: "MW" })),
      configOf({ house: { kind: "derived" } }),
    );
    expect(available(milli.solar).w).toBe(1);
    expect(available(mega.solar).w).toBe(1e9);
  });

  it("assumes W and warns once when only device_class: power is set", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const hass = hassOf(entity("sensor.no_unit_pv", "1234", { device_class: "power" }));
    const config = configOf({
      solar: single("sensor.no_unit_pv"),
      house: { kind: "derived" },
    });

    expect(available(buildModel(hass, config).solar).w).toBe(1234);
    expect(warn).toHaveBeenCalledTimes(1);

    buildModel(hass, config);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("is unavailable without unit and without device_class: power", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const hass = hassOf(entity("sensor.bare_pv", "1234", {}));
    const model = buildModel(hass, configOf({ solar: single("sensor.bare_pv") }));
    expect(model.solar.available).toBe(false);
    expect(model.solar.entity).toBe("sensor.bare_pv");
  });

  it("is unavailable for a unit that is not a power unit", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const hass = hassOf(entity("sensor.energy_pv", "5", { unit_of_measurement: "kWh" }));
    const model = buildModel(hass, configOf({ solar: single("sensor.energy_pv") }));
    expect(model.solar.available).toBe(false);
  });

  it.each(["unavailable", "unknown", "abc", ""])(
    "is unavailable for the state %o (REQ K-9)",
    (state) => {
      const hass = hassOf(entity("sensor.solar", state));
      const model = buildModel(hass, configOf({}));
      expect(model.solar.available).toBe(false);
    },
  );

  it("is unavailable when the entity is missing entirely", () => {
    const model = buildModel(hassOf(), configOf({}));
    expect(model.solar.available).toBe(false);
    expect(model.grid.available).toBe(false);
    expect(model.house.available).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4.2 Signs (REQ E-2)
// ---------------------------------------------------------------------------

describe("signs (REQ 4.2, E-2)", () => {
  it("splits a positive grid value into import", () => {
    const hass = hassOf(entity("sensor.grid", "420"));
    const grid = signed(buildModel(hass, configOf({})).grid);
    expect(grid).toMatchObject({ positive: 420, negative: 0, net: 420, derived: false });
    expect(grid.entityPositive).toBe("sensor.grid");
    expect(grid.entityNegative).toBe("sensor.grid");
  });

  it("splits a negative grid value into export", () => {
    const hass = hassOf(entity("sensor.grid", "-3930"));
    const grid = signed(buildModel(hass, configOf({})).grid);
    expect(grid).toMatchObject({ positive: 0, negative: 3930, net: -3930 });
  });

  it("reads a positive battery value as discharging (REQ E-2)", () => {
    const hass = hassOf(entity("sensor.battery", "1100"));
    const battery = signed(
      buildModel(hass, configOf({ battery: single("sensor.battery") })).battery,
    );
    expect(battery).toMatchObject({ positive: 1100, negative: 0, net: 1100 });
  });

  it("reads a negative battery value as charging (REQ E-2)", () => {
    const hass = hassOf(entity("sensor.battery", "-1600"));
    const battery = signed(
      buildModel(hass, configOf({ battery: single("sensor.battery") })).battery,
    );
    expect(battery).toMatchObject({ positive: 0, negative: 1600, net: -1600 });
  });

  it("applies invert before splitting", () => {
    const hass = hassOf(entity("sensor.grid", "420"));
    const grid = signed(buildModel(hass, configOf({ grid: single("sensor.grid", true) })).grid);
    expect(grid).toMatchObject({ positive: 0, negative: 420, net: -420 });
  });

  it("never yields negative zero for the net", () => {
    const hass = hassOf(entity("sensor.grid", "-0"));
    const grid = signed(buildModel(hass, configOf({})).grid);
    expect(Object.is(grid.net, -0)).toBe(false);
    expect(grid.net).toBe(0);
  });

  it("clamps negative halves of a split source to 0", () => {
    const hass = hassOf(entity("sensor.import", "-5"), entity("sensor.export", "300"));
    const grid = signed(
      buildModel(
        hass,
        configOf({ grid: { kind: "split", positive: "sensor.import", negative: "sensor.export" } }),
      ).grid,
    );
    expect(grid).toMatchObject({ positive: 0, negative: 300, net: -300 });
  });

  it("nets both halves when import and export report at the same time (REQ G-1)", () => {
    const hass = hassOf(entity("sensor.import", "500"), entity("sensor.export", "200"));
    const grid = signed(
      buildModel(
        hass,
        configOf({ grid: { kind: "split", positive: "sensor.import", negative: "sensor.export" } }),
      ).grid,
    );
    // Both magnitudes are kept as measured; only the net is derived from them.
    expect(grid).toMatchObject({ positive: 500, negative: 200, net: 300 });
    expect(grid.entityPositive).toBe("sensor.import");
    expect(grid.entityNegative).toBe("sensor.export");
  });

  it("is unavailable when one half of a split source is unavailable", () => {
    const hass = hassOf(entity("sensor.import", "500"), entity("sensor.export", "unavailable"));
    const model = buildModel(
      hass,
      configOf({ grid: { kind: "split", positive: "sensor.import", negative: "sensor.export" } }),
    );
    expect(model.grid.available).toBe(false);
    expect(model.grid.entityNegative).toBe("sensor.export");
  });

  it("splits a discharge/charge pair for the battery", () => {
    const hass = hassOf(entity("sensor.discharge", "0"), entity("sensor.charge", "1600"));
    const battery = signed(
      buildModel(
        hass,
        configOf({
          battery: { kind: "split", positive: "sensor.discharge", negative: "sensor.charge" },
        }),
      ).battery,
    );
    expect(battery).toMatchObject({ positive: 0, negative: 1600, net: -1600 });
  });
});

// ---------------------------------------------------------------------------
// 4.3 / A-2 Derivation
// ---------------------------------------------------------------------------

describe("derivation (REQ 4.3, A-2)", () => {
  it("derives house = pv + grid + battery", () => {
    const hass = hassOf(
      entity("sensor.solar", "9330"),
      entity("sensor.grid", "-3930"),
      entity("sensor.battery", "-1600"),
    );
    const model = buildModel(
      hass,
      configOf({ battery: single("sensor.battery"), house: { kind: "derived" } }),
    );
    expect(available(model.house).w).toBe(3800);
    expect(model.house.derived).toBe(true);
    expect(model.house.entity).toBeUndefined();
    // The inputs stay untouched (REQ A-3, G-1).
    expect(available(model.solar).w).toBe(9330);
    expect(signed(model.grid).net).toBe(-3930);
  });

  it("clamps a negative derived house value to 0 (ENT-4)", () => {
    const hass = hassOf(entity("sensor.solar", "0"), entity("sensor.grid", "-500"));
    const model = buildModel(hass, configOf({ house: { kind: "derived" } }));
    expect(available(model.house).w).toBe(0);
  });

  it("derives pv = house - grid - battery", () => {
    const hass = hassOf(
      entity("sensor.house", "3800"),
      entity("sensor.grid", "-3930"),
      entity("sensor.battery", "-1600"),
    );
    const model = buildModel(
      hass,
      configOf({ solar: { kind: "derived" }, battery: single("sensor.battery") }),
    );
    expect(available(model.solar).w).toBe(9330);
    expect(model.solar.derived).toBe(true);
  });

  it("clamps a negative derived pv value to 0 (ENT-4)", () => {
    const hass = hassOf(entity("sensor.house", "100"), entity("sensor.grid", "900"));
    const model = buildModel(hass, configOf({ solar: { kind: "derived" } }));
    expect(available(model.solar).w).toBe(0);
  });

  it("derives the grid net with the sign of REQ E-2 (export)", () => {
    const hass = hassOf(
      entity("sensor.house", "3800"),
      entity("sensor.solar", "9330"),
      entity("sensor.battery", "-1600"),
    );
    const grid = signed(
      buildModel(hass, configOf({ grid: { kind: "derived" }, battery: single("sensor.battery") }))
        .grid,
    );
    expect(grid).toMatchObject({ positive: 0, negative: 3930, net: -3930, derived: true });
    expect(grid.entityPositive).toBeUndefined();
  });

  it("derives the grid net with the sign of REQ E-2 (import)", () => {
    const hass = hassOf(entity("sensor.house", "1520"), entity("sensor.solar", "0"));
    const grid = signed(buildModel(hass, configOf({ grid: { kind: "derived" } })).grid);
    expect(grid).toMatchObject({ positive: 1520, negative: 0, net: 1520 });
  });

  // Acceptance checklist, REQ section 5.2: night scenario.
  it("derives a discharging battery at night (PV 0, grid +420, house 1520)", () => {
    const hass = hassOf(
      entity("sensor.solar", "0"),
      entity("sensor.grid", "420"),
      entity("sensor.house", "1520"),
    );
    const battery = signed(buildModel(hass, configOf({ battery: { kind: "derived" } })).battery);
    expect(battery.positive).toBe(1100);
    expect(battery.negative).toBe(0);
    expect(battery.net).toBe(1100);
    expect(battery.derived).toBe(true);
  });

  // Acceptance checklist, REQ section 5.2: counter-check with the day scenario.
  it("derives a charging battery by day (PV 9330, grid -3930, house 3800)", () => {
    const hass = hassOf(
      entity("sensor.solar", "9330"),
      entity("sensor.grid", "-3930"),
      entity("sensor.house", "3800"),
    );
    const battery = signed(buildModel(hass, configOf({ battery: { kind: "derived" } })).battery);
    expect(battery.negative).toBe(1600);
    expect(battery.positive).toBe(0);
    expect(battery.net).toBe(-1600);
  });

  it.each([["sensor.solar"], ["sensor.grid"], ["sensor.house"]])(
    "is unavailable when the input %s is unavailable (REQ A-4)",
    (missing) => {
      const states = [
        entity("sensor.solar", "0"),
        entity("sensor.grid", "420"),
        entity("sensor.house", "1520"),
      ].map((e) => (e.entity_id === missing ? entity(e.entity_id, "unavailable") : e));
      const model = buildModel(hassOf(...states), configOf({ battery: { kind: "derived" } }));
      expect(model.battery?.available).toBe(false);
      expect(model.battery?.derived).toBe(true);
    },
  );

  it("derives the house value when no house source is configured (REQ A-1)", () => {
    const hass = hassOf(entity("sensor.solar", "1000"), entity("sensor.grid", "500"));
    const model = buildModel(hass, configOf({ house: { kind: "absent" } }));
    expect(available(model.house).w).toBe(1500);
    expect(model.house.derived).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Battery and state of charge (REQ A-5, V-5)
// ---------------------------------------------------------------------------

describe("battery (REQ A-5)", () => {
  it("has no battery node and counts 0 W in the balance when absent", () => {
    const hass = hassOf(entity("sensor.solar", "1000"), entity("sensor.grid", "500"));
    const model = buildModel(hass, configOf({ house: { kind: "derived" } }));
    expect(model.battery).toBeNull();
    expect(available(model.house).w).toBe(1500);
  });

  it("leaves the state of charge unavailable without a soc entity", () => {
    const hass = hassOf(entity("sensor.battery", "100"));
    const model = buildModel(hass, configOf({ battery: single("sensor.battery") }));
    expect(model.soc.available).toBe(false);
    expect(model.soc.entity).toBeUndefined();
  });

  it("reads the state of charge as a percentage", () => {
    const hass = hassOf(
      entity("sensor.battery", "100"),
      entity("sensor.soc", "72", { unit_of_measurement: "%", device_class: "battery" }),
    );
    const model = buildModel(
      hass,
      configOf({ battery: single("sensor.battery"), batterySoc: "sensor.soc" }),
    );
    expect(available(model.soc).w).toBe(72);
    expect(model.soc.derived).toBe(false);
  });

  it("marks an unavailable state of charge as unavailable", () => {
    const hass = hassOf(entity("sensor.soc", "unknown", { unit_of_measurement: "%" }));
    const model = buildModel(hass, configOf({ batterySoc: "sensor.soc" }));
    expect(model.soc.available).toBe(false);
    expect(model.soc.entity).toBe("sensor.soc");
  });
});

// ---------------------------------------------------------------------------
// Consumers (REQ A-6)
// ---------------------------------------------------------------------------

describe("consumers (REQ A-6)", () => {
  const consumer = (over: Partial<NormalizedConsumer> = {}): NormalizedConsumer => ({
    key: "sensor.dryer",
    entity: "sensor.dryer",
    color: "#7e57c2",
    ...over,
  });

  it("prefers the configured name", () => {
    const hass = hassOf(
      entity("sensor.dryer", "1475", { unit_of_measurement: "W", friendly_name: "Dryer plug" }),
    );
    const model = buildModel(hass, configOf({}, [consumer({ name: "Dryer" })]));
    expect(model.consumers[0]).toMatchObject({ name: "Dryer", color: "#7e57c2" });
    expect(available(model.consumers[0].reading).w).toBe(1475);
    expect(model.consumers[0].reading.derived).toBe(false);
  });

  it("falls back to friendly_name, then to the entity id", () => {
    const hass = hassOf(
      entity("sensor.dryer", "1475", { unit_of_measurement: "W", friendly_name: "Dryer plug" }),
      entity("sensor.fridge", "230"),
    );
    const model = buildModel(
      hass,
      configOf({}, [consumer(), consumer({ key: "sensor.fridge", entity: "sensor.fridge" })]),
    );
    expect(model.consumers[0].name).toBe("Dryer plug");
    expect(model.consumers[1].name).toBe("sensor.fridge");
  });

  it("normalizes consumer units like every other value", () => {
    const hass = hassOf(entity("sensor.dryer", "1.475", { unit_of_measurement: "kW" }));
    const model = buildModel(hass, configOf({}, [consumer()]));
    expect(available(model.consumers[0].reading).w).toBeCloseTo(1475, 9);
  });

  it("keeps an unavailable consumer in the list, marked unavailable", () => {
    const hass = hassOf(entity("sensor.dryer", "unavailable"));
    const model = buildModel(hass, configOf({}, [consumer({ name: "Dryer" })]));
    expect(model.consumers).toHaveLength(1);
    expect(model.consumers[0].reading.available).toBe(false);
    expect(model.consumers[0].reading.derived).toBe(false);
  });

  it("is an empty list without configured consumers", () => {
    expect(buildModel(hassOf(), configOf({})).consumers).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// buildModelFrom (REQ V-4, V-5, N-5)
// ---------------------------------------------------------------------------

describe("buildModelFrom (REQ V-4)", () => {
  it("takes watts from valueOf and ignores the live state and its unit", () => {
    const hass = hassOf(
      entity("sensor.solar", "5", { unit_of_measurement: "kW" }),
      entity("sensor.grid", "5", { unit_of_measurement: "kW" }),
      entity("sensor.dryer", "5", { unit_of_measurement: "kW" }),
    );
    const means: Record<string, number> = {
      "sensor.solar": 1234,
      "sensor.grid": -500,
      "sensor.dryer": 77,
    };
    const model = buildModelFrom(
      hass,
      configOf({ house: { kind: "derived" } }, [
        { key: "sensor.dryer", entity: "sensor.dryer", color: "#7e57c2" },
      ]),
      (id) => means[id] ?? null,
    );
    expect(available(model.solar).w).toBe(1234);
    expect(signed(model.grid).net).toBe(-500);
    expect(available(model.house).w).toBe(734);
    expect(available(model.consumers[0].reading).w).toBe(77);
  });

  it("reads the state of charge live, never through valueOf (REQ V-5)", () => {
    const hass = hassOf(
      entity("sensor.battery", "0"),
      entity("sensor.soc", "72", { unit_of_measurement: "%" }),
    );
    const model = buildModelFrom(
      hass,
      configOf({ battery: single("sensor.battery"), batterySoc: "sensor.soc" }),
      () => 9999,
    );
    expect(available(model.soc).w).toBe(72);
  });

  it("treats null, NaN and a throwing valueOf as unavailable (REQ N-5)", () => {
    const hass = hassOf(entity("sensor.solar", "1"), entity("sensor.grid", "1"));
    const nulls = buildModelFrom(hass, configOf({}), () => null);
    expect(nulls.solar.available).toBe(false);

    const nan = buildModelFrom(hass, configOf({}), () => Number.NaN);
    expect(nan.solar.available).toBe(false);

    const thrower = buildModelFrom(hass, configOf({}), () => {
      throw new Error("recorder gone");
    });
    expect(thrower.solar.available).toBe(false);
    expect(thrower.grid.available).toBe(false);
  });

  it("never throws on an empty state machine", () => {
    const empty = hassOf();
    expect(() => buildModel(empty, configOf({ house: { kind: "derived" } }))).not.toThrow();
    const model = buildModel(empty, configOf({ house: { kind: "derived" } }));
    expect(model.house.available).toBe(false);
    expect(model.consumers).toEqual([]);
  });
});
