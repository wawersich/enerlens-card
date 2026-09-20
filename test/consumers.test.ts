import { describe, expect, it } from "vitest";
import { buildBreakdown, refreshBreakdownValues } from "../src/consumers";
import type { Config, ConsumerReading, Model, Reading } from "../src/types";
import { REST_KEY } from "../src/types";

// Test data is built by hand: config.ts and model.ts are implemented in
// parallel and only their types are imported here.

const unavailable: Reading = { available: false, derived: false };

function reading(w: number): Reading {
  return { available: true, w, derived: false };
}

/** `w === null` marks an unavailable consumer (REQ L-3, A-6). */
function consumer(name: string, w: number | null, minW?: number): ConsumerReading {
  return {
    key: `sensor.${name}`,
    entity: `sensor.${name}`,
    name,
    color: `color-${name}`,
    minW,
    reading: w === null ? unavailable : reading(w),
  };
}

function model(house: Reading, consumers: ConsumerReading[]): Model {
  return {
    solar: unavailable,
    grid: { available: false, derived: false },
    battery: null,
    soc: unavailable,
    house,
    consumers,
  };
}

function config(
  over: {
    minConsumerW?: number;
    maxConsumers?: number;
    restLabel?: string;
    flowMinW?: number;
  } = {},
) {
  const cfg: Config = {
    sources: {
      solar: { kind: "absent" },
      grid: { kind: "absent" },
      battery: { kind: "absent" },
      house: { kind: "absent" },
    },
    consumers: [],
    minConsumerW: over.minConsumerW ?? 10,
    maxConsumers: over.maxConsumers ?? Number.POSITIVE_INFINITY,
    updateIntervalS: 5,
    list: { enabled: true, restLabel: over.restLabel, alwaysBelow: false },
    ring: { enabled: true },
    view: {
      defaultMode: "current",
      avgShortMinutes: 5,
      avgLongMinutes: 15,
      showSelector: true,
      remember: true,
    },
    flow: {
      minW: over.flowMinW ?? 10,
      slowBelowW: 500,
      fullSpeedW: 2000,
      moreDotsAboveW: 2000,
      maxDotsAtW: 6000,
      maxDots: 5,
      slowS: 5,
      fastS: 1.8,
      animation: "auto",
      inactiveLines: "show" as const,
      design: "none",
    },
    appearance: "auto" as const,
    colors: {
      solar: "solar",
      house: "house",
      grid_import: "grid_import",
      grid_export: "grid_export",
      battery_charge: "battery_charge",
      battery_discharge: "battery_discharge",
      rest: "rest-color",
      socStops: [
        { at: 0, color: "#e53935" },
        { at: 100, color: "#43a047" },
      ],
      consumerPalette: ["#7e57c2"],
    },
    icons: {},
    power: { unit: "kW", decimals: 2, digits: 3 },
  };
  return cfg;
}

const keys = (b: { entries: { key: string }[] }) => b.entries.map((e) => e.key);

describe("buildBreakdown - filter (REQ L-3, 4.4 step 1)", () => {
  it("drops consumers below minConsumerW and keeps the boundary value", () => {
    const b = buildBreakdown(
      model(unavailable, [consumer("a", 9), consumer("b", 10), consumer("c", 11)]),
      config({ minConsumerW: 10 }),
    );
    expect(keys(b)).toEqual(["sensor.c", "sensor.b"]);
  });

  it("lets a consumer's own threshold override the global one (REQ L-3)", () => {
    // A heat pump idling at 25 W passes the global 10 W but not its own 50 W;
    // a fridge with its own 5 W threshold shows at 8 W although 8 < 10.
    const m = model(reading(1000), [
      consumer("heatpump", 25, 50),
      consumer("fridge", 8, 5),
      consumer("tv", 25),
    ]);
    const names = buildBreakdown(m, config()).entries.map((e) => e.name);
    expect(names).not.toContain("heatpump");
    expect(names).toContain("fridge");
    expect(names).toContain("tv");
  });

  it("lists everything available when the filter is lifted (REQ L-12)", () => {
    const m = model(reading(1000), [
      consumer("heatpump", 25, 50),
      consumer("idle", 0),
      consumer("gone", null),
      consumer("tv", 300),
    ]);
    const all = buildBreakdown(m, config({ maxConsumers: 1 }), true);
    const names = all.entries.map((e) => e.name);
    // Threshold and limit are lifted, availability is not (REQ A-6).
    // The rest (1000 - 325 = 675 W) sorts to the top like any other entry.
    expect(names).toEqual(["", "tv", "heatpump", "idle"]);
    expect(all.entries[0].isRest).toBe(true);
    expect(all.entries[0].w).toBe(675);
    // Segments follow the lines, not the filter (REQ R-2): the heat pump at
    // 25 W is above flow.min_w and gets one, "idle" at 0 W is drawn grey and
    // does not.
    expect(all.segments.map((s) => s.key)).toEqual([REST_KEY, "sensor.tv", "sensor.heatpump"]);
  });

  it("drops unavailable consumers", () => {
    const b = buildBreakdown(
      model(unavailable, [consumer("a", null), consumer("b", 100)]),
      config(),
    );
    expect(keys(b)).toEqual(["sensor.b"]);
  });
});

describe("buildBreakdown - limit (REQ L-4, 4.4 step 2)", () => {
  it("keeps only the strongest maxConsumers", () => {
    const b = buildBreakdown(
      model(unavailable, [
        consumer("small", 50),
        consumer("big", 900),
        consumer("mid", 300),
        consumer("tiny", 20),
      ]),
      config({ maxConsumers: 2 }),
    );
    expect(keys(b)).toEqual(["sensor.big", "sensor.mid"]);
  });

  it("keeps everything when maxConsumers exceeds the number of consumers", () => {
    const b = buildBreakdown(
      model(unavailable, [consumer("a", 100), consumer("b", 200)]),
      config({ maxConsumers: 99 }),
    );
    expect(keys(b)).toEqual(["sensor.b", "sensor.a"]);
  });

  it("counts only real consumers, the rest comes on top (REQ L-4)", () => {
    const b = buildBreakdown(
      model(reading(1000), [consumer("a", 400), consumer("b", 300), consumer("c", 200)]),
      config({ maxConsumers: 2 }),
    );
    // Shown: a 400, b 300. Rest = 1000 - 700 = 300, so three entries.
    expect(keys(b)).toEqual(["sensor.a", "sensor.b", REST_KEY]);
  });
});

describe("buildBreakdown - rest (REQ L-5, 4.4 step 3)", () => {
  it("creates a rest entry from house minus the shown consumers", () => {
    const b = buildBreakdown(
      model(reading(2340), [
        consumer("dryer", 1475),
        consumer("fridge", 230),
        consumer("storage", 128),
        consumer("washer", 74),
        consumer("dishwasher", 53),
        consumer("heatpump", 25),
        consumer("ac", 1),
      ]),
      config({ minConsumerW: 10, maxConsumers: 4, restLabel: "Rest" }),
    );
    // 2340 - (1475 + 230 + 128 + 74) = 433, sorted below the dryer.
    expect(keys(b)).toEqual([
      "sensor.dryer",
      REST_KEY,
      "sensor.fridge",
      "sensor.storage",
      "sensor.washer",
    ]);
    const rest = b.entries[1];
    expect(rest.w).toBe(433);
    expect(rest.isRest).toBe(true);
    expect(rest.entity).toBeUndefined();
    expect(rest.color).toBe("rest-color");
    expect(rest.name).toBe("Rest");
  });

  it("drops the rest when the shown consumers exceed the house value", () => {
    const b = buildBreakdown(
      model(reading(3020), [
        consumer("washer", 2149),
        consumer("dryer", 1525),
        consumer("fridge", 173),
        consumer("storage", 132),
        consumer("heatpump", 25),
        consumer("ac", 1),
      ]),
      config({ minConsumerW: 10, maxConsumers: 4 }),
    );
    expect(keys(b)).toEqual(["sensor.washer", "sensor.dryer", "sensor.fridge", "sensor.storage"]);
    expect(b.entries.some((e) => e.isRest)).toBe(false);
  });

  it("drops the rest when it falls below minConsumerW without going negative", () => {
    const b = buildBreakdown(
      model(reading(1005), [consumer("a", 1000)]),
      config({ minConsumerW: 10 }),
    );
    expect(keys(b)).toEqual(["sensor.a"]);
  });

  it("keeps a rest that sits exactly on minConsumerW", () => {
    const b = buildBreakdown(
      model(reading(1010), [consumer("a", 1000)]),
      config({ minConsumerW: 10 }),
    );
    expect(keys(b)).toEqual(["sensor.a", REST_KEY]);
    expect(b.entries[1].w).toBe(10);
  });

  it("drops the rest when the house value is unavailable (REQ L-5, R-3)", () => {
    const b = buildBreakdown(
      model(unavailable, [consumer("a", 1000), consumer("b", 500)]),
      config(),
    );
    expect(b.entries.some((e) => e.isRest)).toBe(false);
    expect(keys(b)).toEqual(["sensor.a", "sensor.b"]);
  });

  it("leaves the rest name empty when restLabel is unset (localized later)", () => {
    const b = buildBreakdown(model(reading(1000), [consumer("a", 400)]), config());
    expect(b.entries.find((e) => e.isRest)?.name).toBe("");
  });

  it("is the only entry when no consumer passes the filter", () => {
    const b = buildBreakdown(
      model(reading(800), [consumer("a", 3)]),
      config({ minConsumerW: 10, restLabel: "Other" }),
    );
    expect(keys(b)).toEqual([REST_KEY]);
    expect(b.entries[0].w).toBe(800);
    expect(b.segments[0].share).toBe(1);
  });
});

describe("buildBreakdown - sorting (REQ L-6, 4.4 step 4)", () => {
  it("sorts descending with the rest in its place", () => {
    const b = buildBreakdown(
      model(reading(1200), [
        consumer("fridge", 232),
        consumer("dryer", 211),
        consumer("storage", 134),
        consumer("washer", 105),
        consumer("dishwasher", 53),
        consumer("heatpump", 25),
        consumer("ac", 1),
      ]),
      config({ minConsumerW: 10, maxConsumers: 4 }),
    );
    // Rest = 1200 - 682 = 518 -> the biggest item, so it leads the list.
    expect(keys(b)).toEqual([
      REST_KEY,
      "sensor.fridge",
      "sensor.dryer",
      "sensor.storage",
      "sensor.washer",
    ]);
    expect(b.entries[0].w).toBe(518);
  });

  it("keeps the configured order for consumers of equal power", () => {
    const b = buildBreakdown(
      model(unavailable, [consumer("first", 100), consumer("second", 100)]),
      config(),
    );
    expect(keys(b)).toEqual(["sensor.first", "sensor.second"]);
  });
});

describe("buildBreakdown - ring (REQ R-2, R-3, 4.4 step 5)", () => {
  it("mirrors the entries in the same order", () => {
    const b = buildBreakdown(
      model(reading(1000), [consumer("a", 400), consumer("b", 200)]),
      config(),
    );
    expect(b.segments.map((s) => s.key)).toEqual(keys(b));
    expect(b.segments.map((s) => s.color)).toEqual(b.entries.map((e) => e.color));
    expect(b.segments.map((s) => s.isRest)).toEqual(b.entries.map((e) => e.isRest));
    expect(b.segments.map((s) => s.entity)).toEqual(b.entries.map((e) => e.entity));
  });

  it("shares sum to 1 with a rest entry", () => {
    const b = buildBreakdown(
      model(reading(2340), [
        consumer("dryer", 1475),
        consumer("fridge", 230),
        consumer("storage", 128),
        consumer("washer", 74),
      ]),
      config({ minConsumerW: 10, maxConsumers: 4 }),
    );
    expect(b.segments.reduce((s, seg) => s + seg.share, 0)).toBeCloseTo(1, 10);
    // Rest 433 of 2340.
    expect(b.segments[1].share).toBeCloseTo(433 / 2340, 10);
  });

  it("scales to 100 % without a rest (REQ R-3)", () => {
    const b = buildBreakdown(
      model(reading(3020), [consumer("washer", 2149), consumer("dryer", 1525)]),
      config(),
    );
    expect(b.entries.some((e) => e.isRest)).toBe(false);
    expect(b.segments.reduce((s, seg) => s + seg.share, 0)).toBeCloseTo(1, 10);
    expect(b.segments[0].share).toBeCloseTo(2149 / 3674, 10);
  });

  it("scales to 100 % when the house value is unavailable (REQ R-3)", () => {
    const b = buildBreakdown(
      model(unavailable, [consumer("a", 300), consumer("b", 100)]),
      config(),
    );
    expect(b.segments.map((s) => s.share)).toEqual([0.75, 0.25]);
  });
});

describe("buildBreakdown - edge cases", () => {
  it("returns two empty arrays without any entry", () => {
    expect(buildBreakdown(model(unavailable, []), config())).toEqual({
      entries: [],
      segments: [],
    });
  });

  it("returns empty arrays when everything is filtered out and there is no rest", () => {
    const b = buildBreakdown(model(reading(5), [consumer("a", 2)]), config({ minConsumerW: 10 }));
    expect(b.entries).toEqual([]);
    expect(b.segments).toEqual([]);
  });

  it("survives an all-zero breakdown with minConsumerW 0", () => {
    const b = buildBreakdown(
      model(reading(0), [consumer("a", 0)]),
      config({ minConsumerW: 0, restLabel: "Rest" }),
    );
    expect(b.entries).toHaveLength(2);
    expect(b.segments.every((s) => s.share === 0)).toBe(true);
  });

  it("carries name, colour and entity of each consumer", () => {
    const b = buildBreakdown(model(unavailable, [consumer("dryer", 500)]), config());
    expect(b.entries[0]).toEqual({
      key: "sensor.dryer",
      entity: "sensor.dryer",
      name: "dryer",
      color: "color-dryer",
      w: 500,
      isRest: false,
    });
  });
});

describe("refreshBreakdownValues (REQ L-7)", () => {
  it("keeps order and selection while updating the figures", () => {
    const cfg = config({ minConsumerW: 10 });
    const tick = model(reading(1000), [consumer("a", 600), consumer("b", 300)]);
    const breakdown = buildBreakdown(tick, cfg);
    expect(breakdown.entries.map((e) => e.key)).toEqual(["sensor.a", "sensor.b", REST_KEY]);

    // B overtakes A, but the order must hold until the next tick.
    const live = model(reading(1000), [consumer("a", 100), consumer("b", 800)]);
    const refreshed = refreshBreakdownValues(breakdown, live, cfg);
    expect(refreshed.entries.map((e) => e.key)).toEqual(["sensor.a", "sensor.b", REST_KEY]);
    expect(refreshed.entries[0].w).toBe(100);
    expect(refreshed.entries[1].w).toBe(800);
    // The rest still absorbs whatever the shown consumers leave over.
    expect(refreshed.entries[2].w).toBe(100);
    expect(refreshed.segments.reduce((sum, seg) => sum + seg.share, 0)).toBeCloseTo(1, 6);
  });

  it("keeps a consumer visible until the next tick even below the threshold", () => {
    const cfg = config({ minConsumerW: 10 });
    const breakdown = buildBreakdown(model(reading(500), [consumer("a", 200)]), cfg);
    const refreshed = refreshBreakdownValues(
      breakdown,
      model(reading(500), [consumer("a", 2)]),
      cfg,
    );
    expect(
      refreshed.entries.some((e) => e.key === "sensor.a"),
      "row vanished mid-tick",
    ).toBe(true);
    expect(refreshed.entries.find((e) => e.key === "sensor.a")?.w).toBe(2);
  });
});

describe("the ring takes the rows whose line carries something (REQ R-2, 12.09.2026)", () => {
  /**
   * The constellation from the screenshot of 12.09.2026, 22:49. The heat pump
   * draws 25 W: below its own min_w of 40, so the filter hides it, but above
   * flow.min_w of 20, so its line is drawn in colour once it is visible.
   */
  const m = model(reading(860), [
    consumer("heatpump", 25, 40),
    consumer("buffer", 206),
    consumer("fridges", 132),
    consumer("ac_buffer", 1),
    consumer("dryer", 0),
    consumer("gone", null),
  ]);
  const cfg = () => config({ minConsumerW: 10, flowMinW: 20 });

  it("gives a segment to every visible row with a coloured line", () => {
    const lifted = buildBreakdown(m, cfg(), true);

    // Rest = 860 - (25 + 206 + 132 + 1 + 0) = 496, sorted to the top.
    expect(lifted.entries.map((e) => e.name)).toEqual([
      "",
      "buffer",
      "fridges",
      "heatpump",
      "ac_buffer",
      "dryer",
    ]);
    // Four coloured lines, four segments. The 1 W and the 0 W rows are drawn
    // grey and get none - that was the whole complaint.
    expect(lifted.segments.map((s) => s.key)).toEqual([
      REST_KEY,
      "sensor.buffer",
      "sensor.fridges",
      "sensor.heatpump",
    ]);
  });

  it("drops the heat pump from both when the filter is on", () => {
    const filtered = buildBreakdown(m, cfg());

    // 25 W is below its own 40 W threshold, so the row is gone ...
    expect(filtered.entries.map((e) => e.name)).toEqual(["", "buffer", "fridges"]);
    // ... and with the row the segment. Rest = 860 - 338 = 522.
    expect(filtered.segments.map((s) => s.key)).toEqual([
      REST_KEY,
      "sensor.buffer",
      "sensor.fridges",
    ]);
    expect(filtered.entries[0].w).toBe(522);
  });

  it("keeps one rest for list and ring", () => {
    const lifted = buildBreakdown(m, cfg(), true);
    const rest = lifted.entries.find((e) => e.isRest);
    expect(rest?.w).toBe(496);
    // The ring reads the same entry - no second rest of its own.
    expect(lifted.segments.find((seg) => seg.isRest)?.share).toBeCloseTo(
      496 / (496 + 206 + 132 + 25),
      10,
    );
  });

  it("counts the threshold itself as carrying (>=)", () => {
    const edge = model(reading(100), [consumer("exact", 20), consumer("under", 19)]);
    const b = buildBreakdown(edge, config({ minConsumerW: 10, flowMinW: 20 }));
    expect(b.entries.map((e) => e.name)).toContain("under");
    expect(b.segments.map((seg) => seg.key)).not.toContain("sensor.under");
    expect(b.segments.map((seg) => seg.key)).toContain("sensor.exact");
  });

  it("loses the segment mid-tick when the line turns grey, but keeps the row", () => {
    const cfgEdge = config({ minConsumerW: 10, flowMinW: 20 });
    const built = buildBreakdown(model(reading(500), [consumer("a", 200)]), cfgEdge);
    expect(built.segments.map((seg) => seg.key)).toContain("sensor.a");

    const fresh = refreshBreakdownValues(built, model(reading(500), [consumer("a", 2)]), cfgEdge);
    // The row stays until the next tick (REQ L-7) ...
    expect(fresh.entries.map((e) => e.key)).toContain("sensor.a");
    // ... but ring and line turn at the same moment.
    expect(fresh.segments.map((seg) => seg.key)).not.toContain("sensor.a");
  });
});
