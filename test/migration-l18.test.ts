/**
 * Configurations written for 1.2.0 keep doing what they did (REQ L-18,
 * "Alte Form"): YAML -> config -> trackers -> model -> list and value column,
 * the whole chain the card runs. What changes on purpose - the limit (L-4)
 * and the energy mode - is stated here as such, so it never slips by.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChargeTracker } from "../src/charge";
import { normalizeConfig } from "../src/config";
import { buildBreakdown } from "../src/consumers";
import { HoldTracker } from "../src/hold";
import { buildModel } from "../src/model";
import { showsCharge } from "../src/render/list";
import type { HomeAssistant, RawConfig } from "../src/types";

afterEach(() => vi.restoreAllMocks());

const ENTITIES = { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" };

/** Power sensors carry W, the car %, everything else no unit. */
function hassWith(states: Record<string, string>): HomeAssistant {
  const all: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(states)) {
    const unit =
      id === "sensor.car"
        ? "%"
        : id.startsWith("sensor.") && !id.includes("status")
          ? "W"
          : undefined;
    all[id] = {
      entity_id: id,
      state,
      attributes: unit ? { unit_of_measurement: unit } : {},
      last_changed: "2026-10-27T10:00:00Z",
      last_updated: "2026-10-27T10:00:00Z",
    };
  }
  return {
    states: all,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  } as HomeAssistant;
}

const BASE_STATES = { "sensor.solar": "0", "sensor.grid": "1300", "sensor.house": "1300" };

/**
 * Runs the card's chain over one or more successive moments (the trackers
 * remember across them) and returns what the list shows at the last one:
 * the rows in order, and the value column of each.
 */
function show(
  raw: Partial<RawConfig>,
  moments: Array<Record<string, string>>,
  { energy = false } = {},
) {
  const config = normalizeConfig({
    type: "custom:enerlens-card",
    entities: ENTITIES,
    ...raw,
  } as RawConfig);
  const holds = new HoldTracker();
  const charges = new ChargeTracker();
  let hass = hassWith(BASE_STATES);
  for (const moment of moments) {
    hass = hassWith({ ...BASE_STATES, ...moment });
    holds.observe(hass, config.consumers);
    charges.observe(hass, config.consumers);
  }
  const model = buildModel(
    hass,
    config,
    (charge) => charges.state(hass, charge),
    undefined,
    (consumer) => holds.held(consumer, energy),
  );
  const entries = buildBreakdown(model, config).entries.filter((e) => !e.isRest);
  return {
    rows: entries.map((e) => e.name),
    value: Object.fromEntries(
      entries.map((e) => [
        e.name,
        showsCharge(e, config) ? `${e.charge?.soc} %` : e.powerUnknown ? "—" : `${e.w} W`,
      ]),
    ),
  };
}

const pump = { entity: "sensor.pump", name: "Pump" };

describe("1.2.0: a wallbox with show: plugged and an on/off cable", () => {
  const raw = {
    consumers: [
      pump,
      {
        entity: "sensor.wallbox",
        name: "Wallbox",
        charge: { soc: "sensor.car", show: "plugged", plugged: "binary_sensor.plug" },
      },
    ],
  } as Partial<RawConfig>;
  const at = (plug: string, wallbox = "0") => ({
    "sensor.pump": "1200",
    "sensor.wallbox": wallbox,
    "sensor.car": "80",
    "binary_sensor.plug": plug,
  });

  it("lists the full car at 0 W with its charge in the value column", () => {
    const { rows, value } = show(raw, [at("on")]);
    expect(rows).toEqual(["Pump", "Wallbox"]);
    expect(value.Wallbox).toBe("80 %");
  });

  it("shows the power while it charges", () => {
    expect(show(raw, [at("on", "7400")]).value.Wallbox).toBe("7400 W");
  });

  it("lets the row go when the cable is pulled", () => {
    expect(show(raw, [at("off")]).rows).toEqual(["Pump"]);
  });

  it("keeps the row while the cable sensor is briefly unavailable", () => {
    expect(show(raw, [at("on"), at("unavailable")]).rows).toEqual(["Pump", "Wallbox"]);
  });

  it("does not hold before the cable ever answered", () => {
    expect(show(raw, [at("unknown")]).rows).toEqual(["Pump"]);
  });
});

describe("1.2.0: a wallbox with a status sensor and unplugged states", () => {
  const raw = {
    consumers: [
      pump,
      {
        entity: "sensor.wallbox",
        name: "Wallbox",
        charge: {
          soc: "sensor.car",
          show: "plugged",
          plugged: "sensor.box_status",
          unplugged: ["none", "available"],
        },
      },
    ],
  } as Partial<RawConfig>;
  const at = (status: string) => ({
    "sensor.pump": "1200",
    "sensor.wallbox": "0",
    "sensor.car": "80",
    "sensor.box_status": status,
  });

  it.each([
    ["charging", true],
    ["finishing", true],
    ["available", false],
    ["Available", false],
    ["none", false],
  ])("status %s: listed %s", (status, listed) => {
    expect(show(raw, [at(status)]).rows.includes("Wallbox")).toBe(listed);
  });
});

describe("1.2.0: the other spellings", () => {
  it("show: always keeps the row, and shows the charge when the power is gone", () => {
    const { rows, value } = show(
      {
        consumers: [
          pump,
          {
            entity: "sensor.wallbox",
            name: "Wallbox",
            charge: { soc: "sensor.car", show: "always" },
          },
        ],
      } as Partial<RawConfig>,
      [{ "sensor.pump": "1200", "sensor.wallbox": "unavailable", "sensor.car": "64" }],
    );
    expect(rows).toEqual(["Pump", "Wallbox"]);
    expect(value.Wallbox).toBe("64 %");
  });

  it("a charge without show follows the power, as it always did", () => {
    const raw = {
      consumers: [
        pump,
        { entity: "sensor.wallbox", name: "Wallbox", charge: { soc: "sensor.car" } },
      ],
    } as Partial<RawConfig>;
    const idle = { "sensor.pump": "1200", "sensor.wallbox": "0", "sensor.car": "80" };
    expect(show(raw, [idle]).rows).toEqual(["Pump"]);
    expect(show(raw, [{ ...idle, "sensor.wallbox": "7400" }]).rows).toEqual(["Wallbox", "Pump"]);
  });

  it("an on/off cable ignores unplugged states, as before", () => {
    const raw = {
      consumers: [
        pump,
        {
          entity: "sensor.wallbox",
          name: "Wallbox",
          charge: {
            soc: "sensor.car",
            show: "plugged",
            plugged: "binary_sensor.plug",
            unplugged: ["off"],
          },
        },
      ],
    } as Partial<RawConfig>;
    const states = { "sensor.pump": "1200", "sensor.wallbox": "0", "sensor.car": "80" };
    expect(show(raw, [{ ...states, "binary_sensor.plug": "off" }]).rows).toEqual(["Pump"]);
    expect(show(raw, [{ ...states, "binary_sensor.plug": "on" }]).rows).toEqual([
      "Pump",
      "Wallbox",
    ]);
  });

  it("show: plugged without a cable warns and follows the power", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { rows } = show(
      {
        consumers: [
          pump,
          {
            entity: "sensor.wallbox",
            name: "Wallbox",
            charge: { soc: "sensor.car", show: "plugged" },
          },
        ],
      } as Partial<RawConfig>,
      [{ "sensor.pump": "1200", "sensor.wallbox": "0", "sensor.car": "80" }],
    );
    expect(rows).toEqual(["Pump"]);
    expect(warn).toHaveBeenCalled();
  });

  it("keeps the own label of the charge (issue #31)", () => {
    const config = normalizeConfig({
      type: "custom:enerlens-card",
      entities: ENTITIES,
      consumers: [
        { entity: "sensor.printer", charge: { soc: "sensor.job", label: "Druck", show: "always" } },
      ],
    } as RawConfig);
    expect(config.consumers[0].charge).toEqual({ soc: "sensor.job", label: "Druck" });
    expect(config.consumers[0].hold).toEqual({ kind: "always" });
  });
});

describe("what changes on purpose (CHANGELOG, Changed)", () => {
  const raw = {
    max_consumers: 1,
    consumers: [
      pump,
      {
        entity: "sensor.wallbox",
        name: "Wallbox",
        charge: { soc: "sensor.car", show: "plugged", plugged: "binary_sensor.plug" },
      },
    ],
  } as Partial<RawConfig>;
  const plugged = {
    "sensor.pump": "1200",
    "sensor.wallbox": "0",
    "sensor.car": "80",
    "binary_sensor.plug": "on",
  };

  it("a plugged-in wallbox now takes a place of max_consumers (1.2.0: Pump and Wallbox)", () => {
    expect(show(raw, [plugged]).rows).toEqual(["Wallbox"]);
  });

  it("raising max_consumers by one brings the old rows back", () => {
    expect(show({ ...raw, max_consumers: 2 }, [plugged]).rows).toEqual(["Pump", "Wallbox"]);
  });

  it("the energy mode no longer holds a row by the plug (1.2.0 did)", () => {
    const { rows } = show({ ...raw, max_consumers: undefined }, [plugged], { energy: true });
    expect(rows).toEqual(["Pump"]);
  });

  it("show: always still holds in the energy mode", () => {
    const { rows } = show(
      {
        consumers: [
          pump,
          {
            entity: "sensor.wallbox",
            name: "Wallbox",
            charge: { soc: "sensor.car", show: "always" },
          },
        ],
      } as Partial<RawConfig>,
      [{ "sensor.pump": "1200", "sensor.wallbox": "0", "sensor.car": "80" }],
      { energy: true },
    );
    expect(rows).toEqual(["Pump", "Wallbox"]);
  });
});
