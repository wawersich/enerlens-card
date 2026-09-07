import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CONSUMER_PALETTE } from "../src/colors";
import { collectEntityIds, normalizeConfig } from "../src/config";
import { ConfigError, type RawConfig } from "../src/types";

// localize belongs to another module; the tests assert on keys and placeholders,
// not on translated prose.
vi.mock("../src/localize", () => ({
  localize: (key: string, _hass?: unknown, params?: Record<string, string | number>) =>
    params ? `${key} ${JSON.stringify(params)}` : key,
}));

const ENTITIES = { solar: "sensor.pv", grid: "sensor.grid", house: "sensor.house" };

/** A structurally valid config, optionally patched. */
function cfg(over: Record<string, unknown> = {}): RawConfig {
  return { type: "custom:enerlens-card", entities: { ...ENTITIES }, ...over } as RawConfig;
}

function withEntities(entities: Record<string, unknown>): RawConfig {
  return { type: "custom:enerlens-card", entities } as RawConfig;
}

function expectError(run: () => unknown, key: string, field?: string): ConfigError {
  let caught: unknown;
  try {
    run();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(ConfigError);
  const error = caught as ConfigError;
  expect(error.message).toContain(key);
  if (field !== undefined) expect(error.field).toBe(field);
  return error;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("entities section (E-1)", () => {
  it("rejects a config without entities (E-1)", () => {
    const error = expectError(
      () => normalizeConfig({ type: "custom:enerlens-card" }),
      "error.config.missing_entities",
      "entities",
    );
    expect(error.name).toBe("ConfigError");
  });

  it("rejects entities that is not an object (E-1)", () => {
    expectError(
      () => normalizeConfig({ type: "custom:enerlens-card", entities: "sensor.x" } as RawConfig),
      "error.config.object",
      "entities",
    );
  });

  it("requires solar (G-2, A-1)", () => {
    expectError(
      () => normalizeConfig(withEntities({ grid: "sensor.grid", house: "sensor.house" })),
      "error.config.missing_entities",
      "entities.solar",
    );
  });

  it("requires grid (G-2, A-1)", () => {
    expectError(
      () => normalizeConfig(withEntities({ solar: "sensor.pv", house: "sensor.house" })),
      "error.config.missing_entities",
      "entities.grid",
    );
  });
});

describe("entity reference forms (E-2)", () => {
  it("accepts a plain entity string (E-2)", () => {
    const config = normalizeConfig(cfg());
    expect(config.sources.solar).toEqual({ kind: "single", entity: "sensor.pv", invert: false });
  });

  it("accepts the {entity, invert} form (E-2)", () => {
    const config = normalizeConfig(
      withEntities({ ...ENTITIES, grid: { entity: "sensor.grid", invert: true } }),
    );
    expect(config.sources.grid).toEqual({ kind: "single", entity: "sensor.grid", invert: true });
  });

  it("defaults invert to false when the object omits it (E-2)", () => {
    const config = normalizeConfig(withEntities({ ...ENTITIES, grid: { entity: "sensor.grid" } }));
    expect(config.sources.grid).toEqual({ kind: "single", entity: "sensor.grid", invert: false });
  });

  it("maps grid import/export so that positive is the import entity (E-2)", () => {
    const config = normalizeConfig(
      withEntities({ ...ENTITIES, grid: { import: "sensor.buy", export: "sensor.sell" } }),
    );
    expect(config.sources.grid).toEqual({
      kind: "split",
      positive: "sensor.buy",
      negative: "sensor.sell",
    });
  });

  it("maps battery discharge/charge so that positive is the discharge entity (E-2)", () => {
    const config = normalizeConfig(
      cfg({
        entities: { ...ENTITIES, battery: { discharge: "sensor.out", charge: "sensor.in" } },
      }),
    );
    expect(config.sources.battery).toEqual({
      kind: "split",
      positive: "sensor.out",
      negative: "sensor.in",
    });
  });

  it("accepts the keyword derived (A-1)", () => {
    const config = normalizeConfig(withEntities({ ...ENTITIES, solar: "derived" }));
    expect(config.sources.solar).toEqual({ kind: "derived" });
  });

  it("treats a missing battery as absent, not derived (A-5)", () => {
    const config = normalizeConfig(cfg());
    expect(config.sources.battery).toEqual({ kind: "absent" });
  });

  it("rejects a mixture of the single and split form (E-1, schema rules)", () => {
    expectError(
      () =>
        normalizeConfig(
          withEntities({ ...ENTITIES, grid: { entity: "sensor.grid", import: "sensor.buy" } }),
        ),
      "error.config.mixed_form",
      "entities.grid",
    );
  });

  it("rejects a half split form (E-1)", () => {
    expectError(
      () => normalizeConfig(withEntities({ ...ENTITIES, grid: { import: "sensor.buy" } })),
      "error.config.mixed_form",
      "entities.grid",
    );
  });

  it("rejects unknown keys inside an entity reference (E-1)", () => {
    expectError(
      () =>
        normalizeConfig(
          withEntities({ ...ENTITIES, grid: { entity: "sensor.grid", inverted: true } }),
        ),
      "error.config.mixed_form",
      "entities.grid",
    );
  });

  it("rejects a non-boolean invert (E-1)", () => {
    expectError(
      () =>
        normalizeConfig(withEntities({ ...ENTITIES, grid: { entity: "sensor.grid", invert: 1 } })),
      "error.config.boolean",
      "entities.grid.invert",
    );
  });

  it("rejects the split form for solar, which has no defined key pair (E-2)", () => {
    expectError(
      () => normalizeConfig(withEntities({ ...ENTITIES, solar: { import: "a", export: "b" } })),
      "error.config.mixed_form",
      "entities.solar",
    );
  });

  it("rejects an empty entity string (E-1)", () => {
    expectError(
      () => normalizeConfig(withEntities({ ...ENTITIES, solar: "" })),
      "error.config.mixed_form",
      "entities.solar",
    );
  });

  it("rejects a value that is neither string nor object (E-1)", () => {
    expectError(
      () => normalizeConfig(withEntities({ ...ENTITIES, solar: 42 })),
      "error.config.mixed_form",
      "entities.solar",
    );
  });
});

describe("exactly one derived quantity (A-1)", () => {
  it("derives a missing house silently (A-1)", () => {
    const config = normalizeConfig(withEntities({ solar: "sensor.pv", grid: "sensor.grid" }));
    expect(config.sources.house).toEqual({ kind: "derived" });
  });

  it("allows a derived solar next to a measured house (A-1)", () => {
    const config = normalizeConfig(withEntities({ ...ENTITIES, solar: "derived" }));
    expect(config.sources.solar).toEqual({ kind: "derived" });
    expect(config.sources.house).toEqual({ kind: "single", entity: "sensor.house", invert: false });
  });

  it("rejects two derived quantities (A-1)", () => {
    const error = expectError(
      () => normalizeConfig(withEntities({ solar: "derived", grid: "sensor.grid" })),
      "error.config.two_derived",
      "entities.house",
    );
    expect(error.message).toContain("entities.house");
  });

  it("rejects derived grid together with derived battery (A-1)", () => {
    expectError(
      () =>
        normalizeConfig(
          withEntities({
            solar: "sensor.pv",
            grid: "derived",
            battery: "derived",
            house: "sensor.house",
          }),
        ),
      "error.config.two_derived",
      "entities.battery",
    );
  });

  it("does not count an absent battery as derived (A-5)", () => {
    const config = normalizeConfig(
      withEntities({ solar: "derived", ...{ grid: "sensor.grid" }, house: "sensor.house" }),
    );
    expect(config.sources.battery).toEqual({ kind: "absent" });
    expect(config.sources.solar).toEqual({ kind: "derived" });
  });

  it("accepts all four quantities measured, with nothing derived (A-1)", () => {
    const config = normalizeConfig(withEntities({ ...ENTITIES, battery: "sensor.bat" }));
    expect(config.sources.battery).toEqual({ kind: "single", entity: "sensor.bat", invert: false });
    expect(config.sources.house).toEqual({ kind: "single", entity: "sensor.house", invert: false });
  });
});

describe("battery_soc (schema rules, A-5)", () => {
  it("accepts battery_soc together with a battery", () => {
    const config = normalizeConfig(
      withEntities({ ...ENTITIES, battery: "sensor.bat", battery_soc: "sensor.soc" }),
    );
    expect(config.sources.batterySoc).toBe("sensor.soc");
  });

  it("accepts battery_soc with a derived battery (A-1)", () => {
    const config = normalizeConfig(
      withEntities({
        solar: "sensor.pv",
        grid: "sensor.grid",
        house: "sensor.house",
        battery: "derived",
        battery_soc: "sensor.soc",
      }),
    );
    expect(config.sources.batterySoc).toBe("sensor.soc");
  });

  it("rejects battery_soc without a battery (schema rules)", () => {
    expectError(
      () => normalizeConfig(withEntities({ ...ENTITIES, battery_soc: "sensor.soc" })),
      "error.config.soc_without_battery",
      "entities.battery_soc",
    );
  });

  it("rejects a non-string battery_soc (E-1)", () => {
    expectError(
      () => normalizeConfig(withEntities({ ...ENTITIES, battery: "sensor.bat", battery_soc: 5 })),
      "error.config.string",
      "entities.battery_soc",
    );
  });

  it("leaves batterySoc undefined when not configured (A-5)", () => {
    expect(normalizeConfig(cfg()).sources.batterySoc).toBeUndefined();
  });
});

describe("consumers (C-4, L-4)", () => {
  it("reads an own threshold and rejects a negative one (REQ L-3)", () => {
    const config = normalizeConfig(
      cfg({ consumers: [{ entity: "sensor.a", min_w: 50 }, { entity: "sensor.b" }] }),
    );
    expect(config.consumers[0].minW).toBe(50);
    expect(config.consumers[1].minW).toBeUndefined();
    const withIcon = normalizeConfig(
      cfg({ consumers: [{ entity: "sensor.a", icon: "mdi:heat-pump" }] }),
    );
    expect(withIcon.consumers[0].icon).toBe("mdi:heat-pump");
    expect(() =>
      normalizeConfig(cfg({ consumers: [{ entity: "sensor.a", min_w: -1 }] })),
    ).toThrow();
  });

  it("defaults to an empty list", () => {
    expect(normalizeConfig(cfg()).consumers).toEqual([]);
  });

  it("assigns palette colours by configuration order (C-4)", () => {
    const config = normalizeConfig(
      cfg({ consumers: [{ entity: "sensor.a" }, { entity: "sensor.b" }] }),
    );
    expect(config.consumers[0].color).toBe(DEFAULT_CONSUMER_PALETTE[0]);
    expect(config.consumers[1].color).toBe(DEFAULT_CONSUMER_PALETTE[1]);
  });

  it("lets an explicit colour win over the palette (C-4)", () => {
    const config = normalizeConfig(cfg({ consumers: [{ entity: "sensor.a", color: "#123456" }] }));
    expect(config.consumers[0].color).toBe("#123456");
  });

  it("uses a configured consumer_palette instead of the built-in one (C-4)", () => {
    const config = normalizeConfig(
      cfg({
        consumers: [{ entity: "sensor.a" }, { entity: "sensor.b" }],
        colors: { consumer_palette: ["#111111", "#222222"] },
      }),
    );
    expect(config.consumers.map((c) => c.color)).toEqual(["#111111", "#222222"]);
  });

  it("wraps the palette for more consumers than colours (C-4, L-11)", () => {
    const consumers = Array.from({ length: 12 }, (_, i) => ({ entity: `sensor.c${i}` }));
    const config = normalizeConfig(cfg({ consumers }));
    expect(config.consumers[10].color).toBe(DEFAULT_CONSUMER_PALETTE[0]);
    expect(config.consumers[11].color).toBe(DEFAULT_CONSUMER_PALETTE[1]);
  });

  it("uses the entity id as the stable key (L-8, R-4)", () => {
    const config = normalizeConfig(cfg({ consumers: [{ entity: "sensor.a", name: "Dryer" }] }));
    expect(config.consumers[0]).toMatchObject({
      key: "sensor.a",
      entity: "sensor.a",
      name: "Dryer",
    });
  });

  it("leaves name undefined so friendly_name can win at render time (L-2)", () => {
    const config = normalizeConfig(cfg({ consumers: [{ entity: "sensor.a" }] }));
    expect(config.consumers[0].name).toBeUndefined();
  });

  it("rejects duplicate consumer entities (schema rules)", () => {
    const error = expectError(
      () => normalizeConfig(cfg({ consumers: [{ entity: "sensor.a" }, { entity: "sensor.a" }] })),
      "error.config.duplicate_consumer",
      "consumers[1]",
    );
    expect(error.message).toContain("sensor.a");
  });

  it("rejects a consumer without an entity (schema rules)", () => {
    expectError(
      () => normalizeConfig(cfg({ consumers: [{ name: "no entity" }] })),
      "error.config.consumer_entity",
      "consumers[0]",
    );
  });

  it("rejects consumers that are not a list (E-1)", () => {
    expectError(
      () => normalizeConfig(cfg({ consumers: "sensor.a" })),
      "error.config.list",
      "consumers",
    );
  });

  it("rejects a non-string consumer name (E-1)", () => {
    expectError(
      () => normalizeConfig(cfg({ consumers: [{ entity: "sensor.a", name: 7 }] })),
      "error.config.string",
      "consumers[0].name",
    );
  });
});

describe("list and ring defaults (L-1, R-1)", () => {
  it("keeps list and ring off without consumers (L-1, R-1)", () => {
    const config = normalizeConfig(cfg());
    expect(config.list.enabled).toBe(false);
    expect(config.ring.enabled).toBe(false);
  });

  it("turns list and ring on as soon as consumers exist (L-1, R-1)", () => {
    const config = normalizeConfig(cfg({ consumers: [{ entity: "sensor.a" }] }));
    expect(config.list.enabled).toBe(true);
    expect(config.ring.enabled).toBe(true);
  });

  it("keeps an empty consumers list equivalent to none (L-1)", () => {
    const config = normalizeConfig(cfg({ consumers: [] }));
    expect(config.list.enabled).toBe(false);
    expect(config.ring.enabled).toBe(false);
  });

  it("lets an explicit false win over the consumer default (R-6)", () => {
    const config = normalizeConfig(
      cfg({
        consumers: [{ entity: "sensor.a" }],
        list: { enabled: false },
        ring: { enabled: true },
      }),
    );
    expect(config.list.enabled).toBe(false);
    expect(config.ring.enabled).toBe(true);
  });

  it("lets an explicit true win without consumers (R-6)", () => {
    const config = normalizeConfig(cfg({ list: { enabled: true } }));
    expect(config.list.enabled).toBe(true);
  });

  it("leaves rest_label and title undefined so they can be localized (L-5, L-10)", () => {
    const config = normalizeConfig(cfg());
    expect(config.list.restLabel).toBeUndefined();
    expect(config.list.title).toBeUndefined();
  });

  it("keeps a configured rest_label and title unchanged (L-5, N-7)", () => {
    const config = normalizeConfig(
      cfg({ list: { rest_label: "Sonstiges", title: "Verbraucher" } }),
    );
    expect(config.list.restLabel).toBe("Sonstiges");
    expect(config.list.title).toBe("Verbraucher");
  });

  it("rejects a non-boolean list.enabled (E-1)", () => {
    expectError(
      () => normalizeConfig(cfg({ list: { enabled: "yes" } })),
      "error.config.boolean",
      "list.enabled",
    );
  });

  it("rejects a list that is not an object (E-1)", () => {
    expectError(() => normalizeConfig(cfg({ list: true })), "error.config.object", "list");
  });
});

describe("defaults (section 3)", () => {
  it("fills in every documented default", () => {
    const config = normalizeConfig(cfg());
    expect(config.title).toBeUndefined();
    expect(config.minConsumerW).toBe(10);
    expect(config.maxConsumers).toBe(Number.POSITIVE_INFINITY);
    expect(config.updateIntervalS).toBe(5);
    expect(config.view).toEqual({
      defaultMode: "current",
      avgShortMinutes: 5,
      avgLongMinutes: 15,
      showSelector: true,
      remember: true,
    });
    expect(config.flow).toEqual({
      minW: 10,
      slowBelowW: 500,
      moreDotsAboveW: 2000,
      maxDotsAtW: 6000,
      maxDots: 5,
      slowS: 5,
      fastS: 1.8,
      animation: "auto",
      inactiveLines: "show",
    });
  });

  it("uses the HA energy theme variables as default colours (C-2)", () => {
    const { colors } = normalizeConfig(cfg());
    expect(colors.solar).toBe("var(--energy-solar-color, #ff9800)");
    expect(colors.house).toBe("var(--primary-color)");
    expect(colors.grid_import).toBe("var(--energy-grid-consumption-color, #488fc2)");
    expect(colors.grid_export).toBe("var(--energy-grid-return-color, #8353d1)");
    expect(colors.battery_charge).toBe("var(--energy-battery-in-color, #f06292)");
    expect(colors.battery_discharge).toBe("var(--energy-battery-out-color, #4db6ac)");
    expect(colors.rest).toBe("#7d7d7d");
    expect(colors.consumerPalette).toEqual([...DEFAULT_CONSUMER_PALETTE]);
  });

  it("uses the documented default state-of-charge stops (C-3)", () => {
    expect(normalizeConfig(cfg()).colors.socStops).toEqual([
      { at: 0, color: "#e53935" },
      { at: 50, color: "#fdd835" },
      { at: 100, color: "#43a047" },
    ]);
  });

  it("uses the documented default icons and leaves battery to the SOC (K-4, section 3)", () => {
    const { icons } = normalizeConfig(cfg());
    expect(icons).toEqual({
      solar: "mdi:white-balance-sunny",
      grid: "mdi:transmission-tower",
      house: "mdi:home",
    });
    expect(icons.battery).toBeUndefined();
  });

  it("keeps the title and overridden colours and icons", () => {
    const config = normalizeConfig(
      cfg({
        title: "Energie",
        colors: { solar: "#abcdef" },
        icons: { battery: "mdi:car-battery" },
      }),
    );
    expect(config.title).toBe("Energie");
    expect(config.colors.solar).toBe("#abcdef");
    expect(config.colors.house).toBe("var(--primary-color)");
    expect(config.icons.battery).toBe("mdi:car-battery");
  });

  it("rejects a non-string title (E-1)", () => {
    expectError(() => normalizeConfig(cfg({ title: 5 })), "error.config.string", "title");
  });

  it("rejects a non-string colour (C-1)", () => {
    expectError(
      () => normalizeConfig(cfg({ colors: { rest: 16 } })),
      "error.config.string",
      "colors.rest",
    );
  });
});

describe("numeric ranges (schema rules)", () => {
  it("rejects a negative min_consumer_w", () => {
    const error = expectError(
      () => normalizeConfig(cfg({ min_consumer_w: -1 })),
      "error.config.min",
      "min_consumer_w",
    );
    expect(error.message).toContain('"min":0');
  });

  it("accepts min_consumer_w 0", () => {
    expect(normalizeConfig(cfg({ min_consumer_w: 0 })).minConsumerW).toBe(0);
  });

  it("rejects max_consumers below 1", () => {
    const error = expectError(
      () => normalizeConfig(cfg({ max_consumers: 0 })),
      "error.config.min",
      "max_consumers",
    );
    expect(error.message).toContain('"min":1');
  });

  it("rejects a fractional max_consumers", () => {
    expectError(
      () => normalizeConfig(cfg({ max_consumers: 1.5 })),
      "error.config.integer",
      "max_consumers",
    );
  });

  it("rejects update_interval_s below 1 (T-2)", () => {
    const error = expectError(
      () => normalizeConfig(cfg({ update_interval_s: 0.5 })),
      "error.config.min",
      "update_interval_s",
    );
    expect(error.message).toContain('"min":1');
  });

  it("rejects a non-numeric number field", () => {
    expectError(
      () => normalizeConfig(cfg({ update_interval_s: "5" })),
      "error.config.number",
      "update_interval_s",
    );
  });

  it("rejects NaN", () => {
    expectError(
      () => normalizeConfig(cfg({ min_consumer_w: Number.NaN })),
      "error.config.number",
      "min_consumer_w",
    );
  });

  it("rejects flow.max_dots outside 2..10 (P-3)", () => {
    const low = expectError(
      () => normalizeConfig(cfg({ flow: { max_dots: 1 } })),
      "error.config.range",
      "flow.max_dots",
    );
    expect(low.message).toContain('"min":2');
    expect(low.message).toContain('"max":10');
    expectError(
      () => normalizeConfig(cfg({ flow: { max_dots: 11 } })),
      "error.config.range",
      "flow.max_dots",
    );
  });

  it("rejects a fractional flow.max_dots (P-3)", () => {
    expectError(
      () => normalizeConfig(cfg({ flow: { max_dots: 5.5 } })),
      "error.config.integer",
      "flow.max_dots",
    );
  });

  it("rejects a negative flow.min_w (P-1)", () => {
    expectError(
      () => normalizeConfig(cfg({ flow: { min_w: -1 } })),
      "error.config.min",
      "flow.min_w",
    );
  });

  it("rejects flow.min_w above slow_below_w (P-3)", () => {
    const error = expectError(
      () => normalizeConfig(cfg({ flow: { min_w: 600 } })),
      "error.config.order_le",
      "flow.min_w",
    );
    expect(error.message).toContain("flow.slow_below_w");
  });

  it("accepts flow.min_w exactly equal to slow_below_w (P-3)", () => {
    expect(normalizeConfig(cfg({ flow: { min_w: 500 } })).flow.minW).toBe(500);
  });

  it("rejects slow_below_w >= more_dots_above_w (P-3)", () => {
    expectError(
      () => normalizeConfig(cfg({ flow: { slow_below_w: 2000 } })),
      "error.config.order",
      "flow.slow_below_w",
    );
  });

  it("rejects more_dots_above_w >= max_dots_at_w (P-3)", () => {
    expectError(
      () => normalizeConfig(cfg({ flow: { more_dots_above_w: 6000 } })),
      "error.config.order",
      "flow.more_dots_above_w",
    );
  });

  it("rejects fast_s >= slow_s (P-3)", () => {
    const error = expectError(
      () => normalizeConfig(cfg({ flow: { fast_s: 5 } })),
      "error.config.order",
      "flow.fast_s",
    );
    expect(error.message).toContain("flow.slow_s");
  });

  it("rejects a non-positive duration (P-3)", () => {
    expectError(
      () => normalizeConfig(cfg({ flow: { fast_s: 0 } })),
      "error.config.positive",
      "flow.fast_s",
    );
  });

  it("accepts a consistent set of flow thresholds (P-3)", () => {
    const config = normalizeConfig(
      cfg({
        flow: {
          min_w: 5,
          slow_below_w: 300,
          more_dots_above_w: 1500,
          max_dots_at_w: 5000,
          max_dots: 7,
          slow_s: 4,
          fast_s: 1,
          animation: "off",
        },
      }),
    );
    expect(config.flow).toEqual({
      minW: 5,
      slowBelowW: 300,
      moreDotsAboveW: 1500,
      maxDotsAtW: 5000,
      maxDots: 7,
      slowS: 4,
      fastS: 1,
      animation: "off",
      inactiveLines: "show",
    });
  });

  it("accepts the inactive_lines modes and rejects anything else (P-9)", () => {
    for (const mode of ["show", "dim", "hide"] as const) {
      expect(normalizeConfig(cfg({ flow: { inactive_lines: mode } })).flow.inactiveLines).toBe(
        mode,
      );
    }
    expectError(
      () => normalizeConfig(cfg({ flow: { inactive_lines: "invisible" } })),
      "error.config.enum",
    );
  });

  it("rejects avg_short_minutes >= avg_long_minutes (V-1)", () => {
    const error = expectError(
      () => normalizeConfig(cfg({ view: { avg_short_minutes: 20 } })),
      "error.config.order",
      "view.avg_short_minutes",
    );
    expect(error.message).toContain("view.avg_long_minutes");
  });

  it("rejects avg_short_minutes outside 1..120 (V-1)", () => {
    const error = expectError(
      () => normalizeConfig(cfg({ view: { avg_short_minutes: 0 } })),
      "error.config.range",
      "view.avg_short_minutes",
    );
    expect(error.message).toContain('"max":120');
  });

  it("rejects avg_long_minutes outside 2..240 (V-1)", () => {
    expectError(
      () => normalizeConfig(cfg({ view: { avg_long_minutes: 300 } })),
      "error.config.range",
      "view.avg_long_minutes",
    );
  });

  it("accepts custom averaging windows (V-1)", () => {
    const config = normalizeConfig(cfg({ view: { avg_short_minutes: 3, avg_long_minutes: 60 } }));
    expect(config.view.avgShortMinutes).toBe(3);
    expect(config.view.avgLongMinutes).toBe(60);
  });
});

describe("enumerations (V-2, P-7)", () => {
  it("accepts every view mode (V-2)", () => {
    for (const mode of ["current", "avg_short", "avg_long"] as const) {
      expect(normalizeConfig(cfg({ view: { default_mode: mode } })).view.defaultMode).toBe(mode);
    }
  });

  it("rejects an unknown view mode (V-2)", () => {
    const error = expectError(
      () => normalizeConfig(cfg({ view: { default_mode: "average" } })),
      "error.config.enum",
      "view.default_mode",
    );
    expect(error.message).toContain("current, avg_short, avg_long");
  });

  it("rejects an unknown animation mode (P-7)", () => {
    expectError(
      () => normalizeConfig(cfg({ flow: { animation: "sometimes" } })),
      "error.config.enum",
      "flow.animation",
    );
  });
});

describe("colors.soc_stops (C-3)", () => {
  it("accepts a custom gradient (C-3)", () => {
    const stops = [
      { at: 0, color: "#000000" },
      { at: 20, color: "#888888" },
      { at: 100, color: "#ffffff" },
    ];
    expect(normalizeConfig(cfg({ colors: { soc_stops: stops } })).colors.socStops).toEqual(stops);
  });

  it("accepts two stops with the same at as a hard edge (C-3)", () => {
    const stops = [
      { at: 0, color: "#000000" },
      { at: 50, color: "#111111" },
      { at: 50, color: "#222222" },
      { at: 100, color: "#ffffff" },
    ];
    expect(normalizeConfig(cfg({ colors: { soc_stops: stops } })).colors.socStops).toEqual(stops);
  });

  it("rejects fewer than two stops (C-3)", () => {
    expectError(
      () => normalizeConfig(cfg({ colors: { soc_stops: [{ at: 0, color: "#000000" }] } })),
      "error.config.soc_stops",
      "colors.soc_stops",
    );
  });

  it("rejects stops that are not ascending (C-3)", () => {
    expectError(
      () =>
        normalizeConfig(
          cfg({
            colors: {
              soc_stops: [
                { at: 0, color: "#000000" },
                { at: 80, color: "#888888" },
                { at: 50, color: "#aaaaaa" },
                { at: 100, color: "#ffffff" },
              ],
            },
          }),
        ),
      "error.config.soc_stops",
      "colors.soc_stops",
    );
  });

  it("rejects a first stop other than 0 (C-3)", () => {
    expectError(
      () =>
        normalizeConfig(
          cfg({
            colors: {
              soc_stops: [
                { at: 10, color: "#000000" },
                { at: 100, color: "#ffffff" },
              ],
            },
          }),
        ),
      "error.config.soc_stops",
      "colors.soc_stops",
    );
  });

  it("rejects a last stop other than 100 (C-3)", () => {
    expectError(
      () =>
        normalizeConfig(
          cfg({
            colors: {
              soc_stops: [
                { at: 0, color: "#000000" },
                { at: 90, color: "#ffffff" },
              ],
            },
          }),
        ),
      "error.config.soc_stops",
      "colors.soc_stops",
    );
  });

  it("rejects a malformed stop entry (C-3)", () => {
    expectError(
      () =>
        normalizeConfig(cfg({ colors: { soc_stops: [{ at: 0 }, { at: 100, color: "#ffffff" }] } })),
      "error.config.soc_stop_entry",
      "colors.soc_stops[0]",
    );
  });

  it("rejects soc_stops that are not a list (C-3)", () => {
    expectError(
      () => normalizeConfig(cfg({ colors: { soc_stops: "red" } })),
      "error.config.list",
      "colors.soc_stops",
    );
  });

  it("rejects an empty consumer_palette (C-4)", () => {
    expectError(
      () => normalizeConfig(cfg({ colors: { consumer_palette: [] } })),
      "error.config.non_empty",
      "colors.consumer_palette",
    );
  });
});

describe("unknown keys (E-1)", () => {
  it("warns about an unknown top-level key without throwing (E-1)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(() => normalizeConfig(cfg({ colours: "nope" }))).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("error.config.unknown_key");
    expect(String(warn.mock.calls[0][0])).toContain("colours");
  });

  it("stays quiet about keys Lovelace adds itself (E-1)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    normalizeConfig(cfg({ view_layout: { position: "sidebar" }, grid_options: { columns: 12 } }));
    expect(warn).not.toHaveBeenCalled();
  });

  it("stays quiet about a valid config (E-1)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    normalizeConfig(cfg({ title: "Energie", consumers: [{ entity: "sensor.a" }] }));
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("runtime problems never throw (E-1, K-9)", () => {
  it("accepts entity ids that do not exist, hass or not (E-1)", () => {
    expect(() => normalizeConfig(cfg({ consumers: [{ entity: "sensor.ghost" }] }))).not.toThrow();
    const hass = { states: {}, language: "de" } as never;
    expect(() => normalizeConfig(cfg(), hass)).not.toThrow();
  });
});

describe("collectEntityIds (T-3, V-6)", () => {
  it("collects every configured entity, both sides of a split (T-3)", () => {
    const config = normalizeConfig(
      withEntities({
        solar: "sensor.pv",
        grid: { import: "sensor.buy", export: "sensor.sell" },
        battery: { discharge: "sensor.out", charge: "sensor.in" },
        battery_soc: "sensor.soc",
        house: { entity: "sensor.house", invert: true },
      }),
    );
    const withConsumers = {
      ...config,
      consumers: [{ key: "sensor.a", entity: "sensor.a", color: "#000" }],
    };
    expect(collectEntityIds(withConsumers)).toEqual([
      "sensor.pv",
      "sensor.buy",
      "sensor.sell",
      "sensor.out",
      "sensor.in",
      "sensor.house",
      "sensor.soc",
      "sensor.a",
    ]);
  });

  it("skips derived and absent quantities (A-1, A-5)", () => {
    const config = normalizeConfig(withEntities({ solar: "sensor.pv", grid: "sensor.grid" }));
    expect(collectEntityIds(config)).toEqual(["sensor.pv", "sensor.grid"]);
  });

  it("returns no duplicates (T-3)", () => {
    const config = normalizeConfig(
      cfg({
        entities: { ...ENTITIES, battery: "sensor.pv" },
        consumers: [{ entity: "sensor.house" }, { entity: "sensor.a" }],
      }),
    );
    expect(collectEntityIds(config)).toEqual([
      "sensor.pv",
      "sensor.grid",
      "sensor.house",
      "sensor.a",
    ]);
  });

  it("returns an empty list only when nothing is measured", () => {
    const config = normalizeConfig(withEntities({ solar: "sensor.pv", grid: "sensor.grid" }));
    expect(
      collectEntityIds({
        ...config,
        sources: { ...config.sources, solar: { kind: "derived" }, grid: { kind: "absent" } },
      }),
    ).toEqual([]);
  });
});
