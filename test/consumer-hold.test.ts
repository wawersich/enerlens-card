/**
 * Position and visibility of a consumer row (REQ L-18, L-4 changed 29.10.2026,
 * issue #6): pinned at the top or bottom, held by `show: always` or by a
 * condition, and the old `charge.show` mapped onto both.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeConfig } from "../src/config";
import { buildBreakdown } from "../src/consumers";
import { HoldTracker, conditionVerdict } from "../src/hold";
import type {
  ConsumerReading,
  HomeAssistant,
  Model,
  NormalizedHold,
  RawConfig,
  Reading,
} from "../src/types";
import { REST_KEY } from "../src/types";

const ENTITIES = { solar: "sensor.s", grid: "sensor.g", house: "sensor.h" };

function raw(consumers: unknown[], extra: Record<string, unknown> = {}): RawConfig {
  return { type: "custom:enerlens-card", entities: ENTITIES, consumers, ...extra } as RawConfig;
}

/** The single consumer of a one-consumer config, normalized. */
function one(entry: Record<string, unknown>) {
  return normalizeConfig(raw([{ entity: "sensor.wallbox", ...entry }])).consumers[0];
}

function hassWith(states: Record<string, string>): HomeAssistant {
  const all: HomeAssistant["states"] = {};
  for (const [id, v] of Object.entries(states)) {
    all[id] = { entity_id: id, state: v, attributes: {}, last_changed: "", last_updated: "" };
  }
  return { states: all } as HomeAssistant;
}

afterEach(() => vi.restoreAllMocks());

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

describe("position and show in the config (REQ L-18)", () => {
  it("reads top and bottom, and nothing means by power", () => {
    expect(one({ position: "top" }).position).toBe("top");
    expect(one({ position: "bottom" }).position).toBe("bottom");
    expect(one({}).position).toBeUndefined();
    expect(one({}).hold).toBeUndefined();
  });

  it("rejects an unknown position, show or operator like any enum", () => {
    expect(() => one({ position: "middle" })).toThrow();
    expect(() => one({ show: "sometimes" })).toThrow();
    expect(() =>
      one({ show: "condition", condition: { entity: "sensor.x", operator: "~", value: 1 } }),
    ).toThrow();
  });

  it("reads show always", () => {
    expect(one({ show: "always" }).hold).toEqual({ kind: "always" });
  });

  it("reads a condition with a list, lower-cased, YAML true/false as on/off", () => {
    const hold = one({
      show: "condition",
      condition: { entity: "sensor.box", operator: "!=", value: ["None", "Available", true] },
    }).hold;
    expect(hold).toEqual({
      kind: "condition",
      entity: "sensor.box",
      operator: "!=",
      values: ["none", "available", "on"],
    });
  });

  it("takes a single value for = as a list of one", () => {
    const hold = one({
      show: "condition",
      condition: { entity: "binary_sensor.plug", operator: "=", value: false },
    }).hold;
    expect(hold).toMatchObject({ operator: "=", values: ["off"] });
  });

  it("reads one number for a comparison", () => {
    const hold = one({
      show: "condition",
      condition: { entity: "sensor.voltage", operator: ">", value: 10.5 },
    }).hold;
    expect(hold).toEqual({
      kind: "condition",
      entity: "sensor.voltage",
      operator: ">",
      limit: 10.5,
    });
  });

  it("never fails on a list or text for a comparison: never met, with a warning (E-1, rule 7)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    for (const value of [[1, 2], "abc"]) {
      const hold = one({
        show: "condition",
        condition: { entity: "sensor.voltage", operator: ">=", value },
      }).hold;
      expect(hold).toMatchObject({ kind: "condition", invalid: true });
    }
    expect(warn).toHaveBeenCalled();
  });

  it("treats a condition without entity, operator or value as the standard (E-1)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(one({ show: "condition" }).hold).toBeUndefined();
    expect(
      one({ show: "condition", condition: { operator: "=", value: "on" } }).hold,
    ).toBeUndefined();
    expect(
      one({ show: "condition", condition: { entity: "sensor.x", value: "on" } }).hold,
    ).toBeUndefined();
    // "!= nothing" would always be met and jump the row into the list mid-typing.
    expect(
      one({ show: "condition", condition: { entity: "sensor.x", operator: "!=" } }).hold,
    ).toBeUndefined();
    expect(
      one({ show: "condition", condition: { entity: "sensor.x", operator: "!=", value: [] } }).hold,
    ).toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });
});

describe("the old charge.show maps onto show and condition (REQ L-18)", () => {
  it("maps charging to the standard", () => {
    expect(one({ charge: { soc: "sensor.soc", show: "charging" } }).hold).toBeUndefined();
    expect(one({ charge: { soc: "sensor.soc" } }).hold).toBeUndefined();
  });

  it("maps always to show always", () => {
    expect(one({ charge: { soc: "sensor.soc", show: "always" } }).hold).toEqual({
      kind: "always",
    });
  });

  it("maps plugged with unplugged states to a != condition", () => {
    const hold = one({
      charge: {
        soc: "sensor.soc",
        show: "plugged",
        plugged: "sensor.box_status",
        unplugged: ["None", "available"],
      },
    }).hold;
    expect(hold).toEqual({
      kind: "condition",
      entity: "sensor.box_status",
      operator: "!=",
      values: ["none", "available"],
    });
  });

  it("maps plugged without unplugged states to = on", () => {
    const hold = one({
      charge: { soc: "sensor.soc", show: "plugged", plugged: "binary_sensor.plug" },
    }).hold;
    expect(hold).toEqual({
      kind: "condition",
      entity: "binary_sensor.plug",
      operator: "=",
      values: ["on"],
    });
  });

  it("ignores unplugged states of an on/off plug, as before", () => {
    const hold = one({
      charge: {
        soc: "sensor.soc",
        show: "plugged",
        plugged: "binary_sensor.plug",
        unplugged: ["off"],
      },
    }).hold;
    expect(hold).toMatchObject({ operator: "=", values: ["on"] });
  });

  it("drops the whole charge without soc, its show too, as before", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(one({ charge: { show: "always" } }).hold).toBeUndefined();
  });

  it("does not read old keys written wrongly once the new show is set", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const c = one({
      show: "always",
      charge: { soc: "sensor.soc", show: "sometimes", unplugged: [1] },
    });
    expect(c.hold).toEqual({ kind: "always" });
    expect(c.indicators?.slots.ring).toMatchObject({ entity: "sensor.soc", min: 0, max: 100 });
  });

  it("lets the new form win over the old one, with a warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const c = one({
      show: "always",
      charge: { soc: "sensor.soc", show: "plugged", plugged: "binary_sensor.plug" },
    });
    expect(c.hold).toEqual({ kind: "always" });
    expect(warn).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// The condition
// ---------------------------------------------------------------------------

type Condition = Extract<NormalizedHold, { kind: "condition" }>;
const cond = (over: Partial<Condition>) =>
  ({ kind: "condition", entity: "sensor.x", operator: "=", ...over }) as Condition;

describe("a condition against a state (REQ L-18)", () => {
  it("is one of / none of the values, ignoring case", () => {
    expect(conditionVerdict("Charging", cond({ operator: "=", values: ["charging", "x"] }))).toBe(
      true,
    );
    expect(conditionVerdict("idle", cond({ operator: "=", values: ["charging"] }))).toBe(false);
    expect(conditionVerdict("Available", cond({ operator: "!=", values: ["available"] }))).toBe(
      false,
    );
    expect(conditionVerdict("preparing", cond({ operator: "!=", values: ["available"] }))).toBe(
      true,
    );
  });

  it("compares numbers as numbers when both sides are numbers", () => {
    expect(conditionVerdict("10.50", cond({ operator: "=", values: ["10.5"] }))).toBe(true);
    expect(conditionVerdict("2", cond({ operator: "!=", values: ["2", "3"] }))).toBe(false);
    // Only plain decimals are numbers; "0x10" is no 16.
    expect(conditionVerdict("0x10", cond({ operator: "=", values: ["16"] }))).toBe(false);
  });

  it("compares one number for < > <= >=", () => {
    expect(conditionVerdict("10.6", cond({ operator: ">", limit: 10.5 }))).toBe(true);
    expect(conditionVerdict("10.5", cond({ operator: ">", limit: 10.5 }))).toBe(false);
    expect(conditionVerdict("10.5", cond({ operator: ">=", limit: 10.5 }))).toBe(true);
    expect(conditionVerdict("3", cond({ operator: "<", limit: 4 }))).toBe(true);
    expect(conditionVerdict("4", cond({ operator: "<=", limit: 4 }))).toBe(true);
  });

  it("is not met when a comparison meets a state that is no number", () => {
    expect(conditionVerdict("charging", cond({ operator: ">", limit: 1 }))).toBe(false);
  });

  it("is never met when it was written wrongly", () => {
    expect(conditionVerdict("5", cond({ operator: ">", invalid: true }))).toBe(false);
  });

  it("has no answer for unavailable, unknown or an empty state", () => {
    for (const s of ["unavailable", "unknown", "", undefined]) {
      expect(conditionVerdict(s, cond({ operator: "!=", values: ["available"] }))).toBe(undefined);
    }
  });
});

describe("the hold over time (REQ L-18)", () => {
  const config = normalizeConfig(
    raw([
      {
        entity: "sensor.wallbox",
        show: "condition",
        condition: { entity: "binary_sensor.plug", operator: "=", value: "on" },
      },
      { entity: "sensor.pump", show: "always" },
      { entity: "sensor.oven" },
    ]),
  );
  const [wallbox, pump, oven] = config.consumers;

  it("holds by the live answer, and keeps the last answer while the entity is unavailable", () => {
    const t = new HoldTracker();
    t.observe(hassWith({ "binary_sensor.plug": "on" }), config.consumers);
    expect(t.held(wallbox, false)).toBe(true);
    t.observe(hassWith({ "binary_sensor.plug": "unavailable" }), config.consumers);
    expect(t.held(wallbox, false)).toBe(true);
    t.observe(hassWith({ "binary_sensor.plug": "off" }), config.consumers);
    expect(t.held(wallbox, false)).toBe(false);
  });

  it("forgets the answer when the condition itself changes (review 29.10.2026)", () => {
    const t = new HoldTracker();
    t.observe(hassWith({ "binary_sensor.plug": "on" }), config.consumers);
    expect(t.held(wallbox, false)).toBe(true);
    const changed = normalizeConfig(
      raw([
        {
          entity: "sensor.wallbox",
          show: "condition",
          condition: { entity: "sensor.box", operator: "!=", value: "available" },
        },
      ]),
    ).consumers;
    t.observe(hassWith({ "sensor.box": "unavailable" }), changed);
    expect(t.held(changed[0], false)).toBe(false);
  });

  it("does not hold without any answer yet", () => {
    const t = new HoldTracker();
    t.observe(hassWith({ "binary_sensor.plug": "unknown" }), config.consumers);
    expect(t.held(wallbox, false)).toBe(false);
  });

  it("holds always, and nothing without a hold", () => {
    const t = new HoldTracker();
    expect(t.held(pump, false)).toBe(true);
    expect(t.held(oven, false)).toBe(false);
  });

  it("does not evaluate a condition in the energy mode, but keeps always", () => {
    const t = new HoldTracker();
    t.observe(hassWith({ "binary_sensor.plug": "on" }), config.consumers);
    expect(t.held(wallbox, true)).toBe(false);
    expect(t.held(pump, true)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Selection and order
// ---------------------------------------------------------------------------

const unavailable: Reading = { available: false, derived: false };

function row(
  name: string,
  w: number | null,
  over: Partial<Pick<ConsumerReading, "held" | "position" | "minW">> = {},
): ConsumerReading {
  return {
    key: `sensor.${name}`,
    entity: `sensor.${name}`,
    name,
    color: `color-${name}`,
    reading: w === null ? unavailable : { available: true, w, derived: false },
    ...over,
  };
}

function model(consumers: ConsumerReading[], house: number | null = null): Model {
  return {
    solar: unavailable,
    solarSources: [],
    grid: { available: false, derived: false },
    battery: null,
    soc: unavailable,
    house: house === null ? unavailable : { available: true, w: house, derived: false },
    consumers,
  };
}

const cfg = (extra: Record<string, unknown> = {}) => normalizeConfig(raw([], extra));
const keys = (b: { entries: { key: string }[] }) =>
  b.entries.map((e) => e.key.replace("sensor.", ""));

describe("held rows and the limit (REQ L-4 changed 29.10.2026, L-18)", () => {
  it("keeps a held row at 0 W, and it takes a place of the limit", () => {
    const b = buildBreakdown(
      model([row("oven", 2000), row("dryer", 1000), row("wallbox", 0, { held: true })]),
      cfg({ max_consumers: 2 }),
    );
    expect(keys(b)).toEqual(["oven", "wallbox"]);
  });

  it("gives the held rows their places first, then the strongest", () => {
    const b = buildBreakdown(
      model([
        row("oven", 2000),
        row("dryer", 1000),
        row("pump", 300, { held: true }),
        row("wallbox", 0, { held: true }),
      ]),
      cfg({ max_consumers: 3 }),
    );
    expect(keys(b)).toEqual(["oven", "pump", "wallbox"]);
  });

  it("shows every held row even beyond the limit, and nothing else", () => {
    const b = buildBreakdown(
      model([
        row("oven", 2000),
        row("pump", 300, { held: true }),
        row("wallbox", 0, { held: true }),
        row("printer", 50, { held: true }),
      ]),
      cfg({ max_consumers: 2 }),
    );
    expect(keys(b)).toEqual(["pump", "printer", "wallbox"]);
  });

  it("keeps a held row with its power unavailable, at 0 W for sort and rest", () => {
    const b = buildBreakdown(
      model([row("oven", 2000), row("wallbox", null, { held: true })], 2500),
      cfg(),
    );
    expect(keys(b)).toEqual(["oven", REST_KEY, "wallbox"]);
    const wallbox = b.entries.find((e) => e.key === "sensor.wallbox");
    expect(wallbox?.powerUnknown).toBe(true);
    expect(b.entries.find((e) => e.isRest)?.w).toBe(500);
  });

  it("selects a pinned row without hold like any other: threshold and limit apply", () => {
    const pinnedLow = buildBreakdown(
      model([row("oven", 2000), row("pump", 5, { position: "top" })]),
      cfg(),
    );
    expect(keys(pinnedLow)).toEqual(["oven"]);
    const pushedOut = buildBreakdown(
      model([row("oven", 2000), row("dryer", 1000), row("pump", 800, { position: "top" })]),
      cfg({ max_consumers: 2 }),
    );
    expect(keys(pushedOut)).toEqual(["oven", "dryer"]);
  });
});

describe("pinned rows and the order of the list (REQ L-18)", () => {
  it("puts top rows first and bottom rows last, the rest stays in the sorted block", () => {
    const b = buildBreakdown(
      model(
        [
          row("washer", 0, { position: "bottom", held: true }),
          row("oven", 2000),
          row("wallbox", 7000, { position: "top" }),
          row("fridge", 80),
        ],
        9500,
      ),
      cfg(),
    );
    expect(keys(b)).toEqual(["wallbox", "oven", REST_KEY, "fridge", "washer"]);
  });

  it("orders several pinned rows by the configuration, not by power", () => {
    const b = buildBreakdown(
      model([
        row("pump", 300, { position: "top", held: true }),
        row("oven", 2000),
        row("wallbox", 7000, { position: "top", held: true }),
        row("dryer", 900, { position: "bottom", held: true }),
        row("washer", 1500, { position: "bottom", held: true }),
      ]),
      cfg(),
    );
    expect(keys(b)).toEqual(["pump", "wallbox", "oven", "dryer", "washer"]);
  });

  it("keeps a pinned consumer without statistics at its place, the others after bottom (EM-12)", () => {
    const energy = normalizeConfig(raw([], {}));
    energy.energy = {
      consumers: {
        "sensor.pump": { tier: 0, note: "" },
        "sensor.sauna": { tier: 0, note: "" },
      },
    } as unknown as typeof energy.energy;
    const b = buildBreakdown(
      model([
        row("oven", 2000),
        row("sauna", null),
        row("pump", null, { position: "top" }),
        row("washer", 500, { position: "bottom" }),
      ]),
      energy,
    );
    expect(keys(b)).toEqual(["pump", "oven", "washer", "sauna"]);
  });

  it("gives the ring the same order as the list (R-2)", () => {
    const b = buildBreakdown(
      model([row("oven", 2000), row("wallbox", 500, { position: "top" })]),
      cfg(),
    );
    expect(b.segments.map((s) => s.key)).toEqual(["sensor.wallbox", "sensor.oven"]);
  });

  it("lifts threshold and limit for every row when the filter is off, positions stay (L-12)", () => {
    const b = buildBreakdown(
      model([
        row("oven", 2000),
        row("dryer", 1000),
        row("pump", 5, { position: "top" }),
        row("washer", 0, { position: "bottom" }),
      ]),
      cfg({ max_consumers: 1 }),
      true,
    );
    expect(keys(b)).toEqual(["pump", "oven", "dryer", "washer"]);
  });
});
