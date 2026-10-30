/**
 * The rest row as a consumer entry `type: rest` (REQ L-21, 30.10.2026):
 * name, icon, colour, own threshold, position, show always, highlight and
 * extra values - and the older keys list.rest_label, icons.rest, colors.rest
 * still read (N-12).
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeConfig } from "../src/config";
import { buildBreakdown, refreshBreakdownValues } from "../src/consumers";
import { planOf } from "../src/detail-dialog";
import type { ConsumerReading, Model, RawConfig, Reading, RowIndicators } from "../src/types";
import { REST_KEY } from "../src/types";

const ENTITIES = { solar: "sensor.s", grid: "sensor.g", house: "sensor.h" };

function raw(consumers: unknown[], extra: Record<string, unknown> = {}): RawConfig {
  return { type: "custom:enerlens-card", entities: ENTITIES, consumers, ...extra } as RawConfig;
}
const cfg = (consumers: unknown[], extra: Record<string, unknown> = {}) =>
  normalizeConfig(raw(consumers, extra));

const unavailable: Reading = { available: false, derived: false };

function row(
  name: string,
  w: number | null,
  over: Partial<Pick<ConsumerReading, "held" | "position">> = {},
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

function model(consumers: ConsumerReading[], house: number | null, rest?: Model["rest"]): Model {
  return {
    solar: unavailable,
    solarSources: [],
    grid: { available: false, derived: false },
    battery: null,
    soc: unavailable,
    house: house === null ? unavailable : { available: true, w: house, derived: false },
    consumers,
    rest,
  };
}

const keys = (b: { entries: { key: string }[] }) =>
  b.entries.map((e) => (e.key === REST_KEY ? "rest" : e.key.replace("sensor.", "")));
const restOf = (b: { entries: { key: string }[] }) =>
  b.entries.find((e) => e.key === REST_KEY) as ReturnType<typeof buildBreakdown>["entries"][0];
const warnings = () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  return () => warn.mock.calls.map((c) => String(c[0])).join("\n");
};

afterEach(() => vi.restoreAllMocks());

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

describe("the rest entry in the config (REQ L-21)", () => {
  it("reads name, icon, colour, threshold, position, show, highlight and extras", () => {
    const c = cfg([
      { entity: "sensor.a" },
      {
        type: "rest",
        name: "Other",
        icon: "mdi:cloud-question",
        color: "#123456",
        min_w: 50,
        position: "bottom",
        show: "always",
        highlight: { band: true },
        indicators: {
          bar_bottom: { entity: "sensor.outside", min: -10, max: 35 },
          in_energy: true,
        },
      },
    ]);
    expect(c.list.restLabel).toBe("Other");
    expect(c.icons.rest).toBe("mdi:cloud-question");
    expect(c.colors.rest).toBe("#123456");
    expect(c.rest).toMatchObject({
      minW: 50,
      position: "bottom",
      always: true,
      highlight: { bold: false, band: true },
      indicators: {
        slots: { bar_bottom: { entity: "sensor.outside", min: -10, max: 35 } },
        idleValue: "power",
        inEnergy: true,
      },
    });
  });

  it("is no consumer of its own", () => {
    const c = cfg([{ entity: "sensor.a" }, { type: "rest" }, { entity: "sensor.b" }]);
    expect(c.consumers.map((x) => x.entity)).toEqual(["sensor.a", "sensor.b"]);
  });

  it("leaves the consumers' default colours where they were (C-4)", () => {
    const without = cfg([{ entity: "sensor.a" }, { entity: "sensor.b" }]);
    const with_ = cfg([{ type: "rest" }, { entity: "sensor.a" }, { entity: "sensor.b" }]);
    expect(with_.consumers.map((x) => x.color)).toEqual(without.consumers.map((x) => x.color));
  });

  it("without an entry, the rest is what the older keys say (N-12)", () => {
    const c = cfg([{ entity: "sensor.a" }], {
      list: { rest_label: "Sonstiges" },
      icons: { rest: "mdi:help" },
      colors: { rest: "#abcdef" },
    });
    expect(c.list.restLabel).toBe("Sonstiges");
    expect(c.icons.rest).toBe("mdi:help");
    expect(c.colors.rest).toBe("#abcdef");
    expect(c.rest).toMatchObject({ always: false });
    expect(c.rest.minW).toBeUndefined();
    expect(c.rest.position).toBeUndefined();
  });

  it("lets the entry win over the older keys, with a warning", () => {
    const said = warnings();
    const c = cfg([{ type: "rest", name: "New", icon: "mdi:new", color: "#000001" }], {
      list: { rest_label: "Old" },
      icons: { rest: "mdi:old" },
      colors: { rest: "#000002" },
    });
    expect([c.list.restLabel, c.icons.rest, c.colors.rest]).toEqual(["New", "mdi:new", "#000001"]);
    expect(said()).toContain("list.rest_label");
    expect(said()).toContain("icons.rest");
    expect(said()).toContain("colors.rest");
  });

  it("keeps an older key the entry does not set", () => {
    const c = cfg([{ type: "rest", min_w: 5 }], { list: { rest_label: "Old" } });
    expect(c.list.restLabel).toBe("Old");
  });

  it("warns about what the rest cannot have, and never refuses (E-1)", () => {
    const said = warnings();
    let c: ReturnType<typeof cfg> | undefined;
    expect(() => {
      c = cfg([
        {
          type: "rest",
          entity: "sensor.x",
          show: "condition",
          condition: { entity: "sensor.y", operator: "=", value: "on" },
          indicators: { ring: { entity: "sensor.z" }, idle_value: "ring" },
        },
      ]);
    }).not.toThrow();
    expect(c?.rest.always).toBe(false);
    expect(c?.rest.indicators?.idleValue).toBe("power");
    expect(c?.consumers).toEqual([]);
    expect(said()).toContain("consumers[0].entity");
    expect(said()).toContain("consumers[0].show");
    expect(said()).toContain("consumers[0].indicators.idle_value");
  });

  it("takes the first rest entry and warns about any further one", () => {
    const said = warnings();
    const c = cfg([
      { type: "rest", name: "One" },
      { type: "rest", name: "Two" },
    ]);
    expect(c.list.restLabel).toBe("One");
    expect(said()).toContain("consumers[1]");
  });

  it("skips an entry of an unknown type with a warning", () => {
    const said = warnings();
    const c = cfg([{ type: "divider" }, { entity: "sensor.a" }]);
    expect(c.consumers.map((x) => x.entity)).toEqual(["sensor.a"]);
    expect(said()).toContain("consumers[0].type");
  });

  it("names no key of the entry as unknown", () => {
    const said = warnings();
    cfg([
      {
        type: "rest",
        name: "x",
        icon: "mdi:x",
        color: "#111111",
        min_w: 1,
        position: "top",
        show: "always",
        highlight: { bold: true },
        indicators: { ring: { entity: "sensor.r" } },
      },
    ]);
    expect(said()).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

describe("the rest row in the list (REQ L-21)", () => {
  it("is listed by its own threshold instead of min_consumer_w", () => {
    const c = cfg([{ entity: "sensor.a" }, { type: "rest", min_w: 200 }]);
    expect(keys(buildBreakdown(model([row("a", 500)], 650), c))).toEqual(["a"]);
    expect(keys(buildBreakdown(model([row("a", 500)], 750), c))).toEqual(["a", "rest"]);
    expect(restOf(buildBreakdown(model([row("a", 500)], 750), c)).threshold).toBe(200);
  });

  it("stands where its entry stands among the pinned rows", () => {
    const c = cfg([
      { entity: "sensor.a", position: "bottom" },
      { type: "rest", position: "bottom" },
      { entity: "sensor.b", position: "bottom" },
      { entity: "sensor.c" },
    ]);
    const m = model(
      [row("a", 100, { position: "bottom" }), row("b", 100, { position: "bottom" }), row("c", 100)],
      1000,
    );
    expect(keys(buildBreakdown(m, c))).toEqual(["c", "a", "rest", "b"]);
  });

  it("goes on top with position top", () => {
    const c = cfg([{ entity: "sensor.a" }, { type: "rest", position: "top" }]);
    expect(keys(buildBreakdown(model([row("a", 900)], 1000), c))).toEqual(["rest", "a"]);
  });

  it("with show always stays below its threshold, with its value", () => {
    const c = cfg([{ entity: "sensor.a" }, { type: "rest", show: "always" }]);
    const b = buildBreakdown(model([row("a", 995)], 1000), c);
    expect(keys(b)).toEqual(["a", "rest"]);
    expect(restOf(b).w).toBe(5);
    expect(restOf(b).powerUnknown).toBeUndefined();
  });

  it("with show always shows a dash for a negative rest, never 0 W (rule 8)", () => {
    const c = cfg([{ entity: "sensor.a" }, { type: "rest", show: "always" }]);
    const b = buildBreakdown(model([row("a", 1200)], 1000), c);
    expect(restOf(b).powerUnknown).toBe(true);
    expect(restOf(b).w).toBe(0);
    // A dash carries nothing: no coloured line, no segment (R-2).
    expect(b.segments.some((s) => s.isRest)).toBe(false);
  });

  it("with show always shows a dash while the house is unavailable", () => {
    const c = cfg([{ entity: "sensor.a" }, { type: "rest", show: "always", min_w: 0 }]);
    const b = buildBreakdown(model([row("a", 100)], null), c);
    expect(restOf(b).powerUnknown).toBe(true);
    expect(b.segments.some((s) => s.isRest)).toBe(false);
  });

  it("held, still takes no place of the limit (L-4)", () => {
    const c = cfg(
      [{ entity: "sensor.a" }, { entity: "sensor.b" }, { type: "rest", show: "always" }],
      { max_consumers: 2 },
    );
    const b = buildBreakdown(model([row("a", 500), row("b", 400)], 905), c);
    expect(keys(b).sort()).toEqual(["a", "b", "rest"]);
  });

  it("keeps its threshold when the filter is lifted (L-12)", () => {
    const c = cfg([{ entity: "sensor.a" }, { type: "rest", min_w: 200 }]);
    expect(keys(buildBreakdown(model([row("a", 500)], 650), c, true))).toEqual(["a"]);
  });

  it("carries highlight and extra values", () => {
    const c = cfg([{ entity: "sensor.a" }, { type: "rest", highlight: { bold: true } }]);
    const extras: RowIndicators = {
      slots: { bar_top: { value: 12, min: 0, max: 40, stale: false } },
      idleValue: "power",
      inEnergy: false,
    } as unknown as RowIndicators;
    const b = buildBreakdown(model([row("a", 100)], 1000, { indicators: extras }), c);
    expect(restOf(b).highlight).toEqual({ bold: true, band: false });
    expect(restOf(b).indicators).toBe(extras);
    expect(restOf(b).idle).toBeUndefined();
  });

  it("refreshes its extra values between ticks and keeps a dash a dash", () => {
    const c = cfg([{ entity: "sensor.a" }, { type: "rest", show: "always" }]);
    const b = buildBreakdown(model([row("a", 1200)], 1000), c);
    const later = { slots: {}, idleValue: "power", inEnergy: false } as unknown as RowIndicators;
    const r = refreshBreakdownValues(b, model([row("a", 1100)], 1000, { indicators: later }), c);
    expect(restOf(r).powerUnknown).toBe(true);
    expect(restOf(r).indicators).toBe(later);
  });

  it("without an entry behaves as before", () => {
    const c = cfg([{ entity: "sensor.a" }], { min_consumer_w: 10 });
    expect(keys(buildBreakdown(model([row("a", 995)], 1000), c))).toEqual(["a"]);
    expect(keys(buildBreakdown(model([row("a", 1200)], 1000), c))).toEqual(["a"]);
    expect(keys(buildBreakdown(model([row("a", 400)], 1000), c))).toEqual(["rest", "a"]);
  });
});

// ---------------------------------------------------------------------------
// Detail window
// ---------------------------------------------------------------------------

describe("the rest's detail window (REQ L-21, DF-18)", () => {
  it("is titled with the rest's name and has a chart per extra value", () => {
    const c = cfg([
      { type: "rest", name: "Other", indicators: { bar_top: { entity: "sensor.outside" } } },
    ]);
    const plan = planOf("rest", c);
    expect(plan.title).toBe("Other");
    expect(plan.extras?.map((e) => e.entity)).toEqual(["sensor.outside"]);
  });

  it("with a calculated house shows only the extra values", () => {
    const c = normalizeConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.s", grid: "sensor.g", house: "derived" },
      consumers: [{ type: "rest", indicators: { bar_top: { entity: "sensor.outside" } } }],
    } as RawConfig);
    const plan = planOf("rest", c);
    expect(plan.series).toEqual([]);
    expect(plan.extras?.map((e) => e.entity)).toEqual(["sensor.outside"]);
  });
});
