import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeConfig } from "../src/config";
import { buildModel } from "../src/model";
import { FREE_KEY, buildSolarRows, solarSegments } from "../src/solar";
import type { HassEntity, HomeAssistant, RawConfig } from "../src/types";

vi.mock("../src/localize", () => ({
  localize: (key: string) => key,
}));

/*
 * The PV ring and its scales (REQ PV-4 to PV-6) and the PV rows (PV-7, PV-8).
 */

function entity(id: string, state: string): HassEntity {
  return {
    entity_id: id,
    state,
    attributes: { unit_of_measurement: "W" },
    last_changed: "",
    last_updated: "",
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

const ROOF = { entity: "sensor.roof", name: "Dach", kwp: 8 };
const BALCONY = { entity: "sensor.balcony", name: "Balkon", kwp: 2 };
const SHED = { entity: "sensor.shed", name: "Schuppen" };

afterEach(() => vi.restoreAllMocks());

describe("PV-6: which scales the quick button offers", () => {
  it("both, starting with 100 %, when every source has its peak", () => {
    const config = normalizeConfig(raw([ROOF, BALCONY]));
    expect(config.view.pvScales).toEqual(["share", "peak"]);
    expect(config.view.defaultPvScale).toBe("share");
  });

  it("only 100 % when a peak is missing", () => {
    expect(normalizeConfig(raw([ROOF, SHED])).view.pvScales).toEqual(["share"]);
  });

  it("only % kWp for one source with its peak - a ring always full says nothing", () => {
    expect(normalizeConfig(raw([ROOF])).view.pvScales).toEqual(["peak"]);
  });

  it("none for one source without a peak, for one entity, or with the ring off", () => {
    expect(normalizeConfig(raw([SHED])).view.pvScales).toEqual([]);
    expect(normalizeConfig(raw("sensor.pv")).view.pvScales).toEqual([]);
    expect(normalizeConfig(raw([ROOF, BALCONY], { ring: { solar: false } })).view.pvScales).toEqual(
      [],
    );
  });

  it("the configured ones, in the fixed order, with their start value", () => {
    const config = normalizeConfig(
      raw([ROOF, BALCONY], { view: { pv_scales: ["peak"], default_pv_scale: "peak" } }),
    );
    expect(config.view.pvScales).toEqual(["peak"]);
    expect(config.view.defaultPvScale).toBe("peak");
    const both = normalizeConfig(
      raw([ROOF, BALCONY], { view: { pv_scales: ["peak", "share"], default_pv_scale: "peak" } }),
    );
    expect(both.view.pvScales).toEqual(["share", "peak"]);
    expect(both.view.defaultPvScale).toBe("peak");
  });

  it("% kWp asked for without every peak: 100 % with a warning, never an error card", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const config = normalizeConfig(raw([ROOF, SHED], { view: { pv_scales: ["peak"] } }));
    expect(config.view.pvScales).toEqual(["share"]);
    expect(warn).toHaveBeenCalled();
  });

  it("show_selector: false fixes it on its start value (QB-7)", () => {
    const config = normalizeConfig(
      raw([ROOF, BALCONY], { view: { show_selector: false, default_pv_scale: "peak" } }),
    );
    expect(config.view.pvScales).toEqual(["peak"]);
  });
});

const STATES = {
  "sensor.roof": "3000",
  "sensor.balcony": "1000",
  "sensor.grid": "0",
  "sensor.house": "4000",
};

describe("PV-5: the ring's segments", () => {
  it("100 %: each source its share of the sum, the ring full", () => {
    const config = normalizeConfig(raw([ROOF, BALCONY]));
    const segments = solarSegments(buildModel(hassOf(STATES), config), config, "share");
    expect(segments.map((s) => [s.key, s.share])).toEqual([
      ["sensor.roof", 0.75],
      ["sensor.balcony", 0.25],
    ]);
  });

  it("% kWp: each source against the peak of all, the rest a free grey part", () => {
    const config = normalizeConfig(raw([ROOF, BALCONY]));
    const segments = solarSegments(buildModel(hassOf(STATES), config), config, "peak");
    expect(segments.map((s) => [s.key, s.share])).toEqual([
      ["sensor.roof", 0.3],
      ["sensor.balcony", 0.1],
      [FREE_KEY, 0.6],
    ]);
    expect(segments[2].isRest).toBe(true);
  });

  it("% kWp above the peak (bright haze) is squeezed onto the full ring", () => {
    const config = normalizeConfig(raw([ROOF, BALCONY]));
    const model = buildModel(
      hassOf({ ...STATES, "sensor.roof": "9000", "sensor.balcony": "3000" }),
      config,
    );
    const segments = solarSegments(model, config, "peak");
    expect(segments.map((s) => [s.key, s.share])).toEqual([
      ["sensor.roof", 0.75],
      ["sensor.balcony", 0.25],
    ]);
  });

  it("only sources that carry something, like the house (R-2, carries)", () => {
    const config = normalizeConfig(
      raw([ROOF, BALCONY], { min_consumer_w: 10, flow: { min_w: 20 } }),
    );
    const quiet = buildModel(hassOf({ ...STATES, "sensor.balcony": "5" }), config);
    expect(solarSegments(quiet, config, "share").map((s) => s.key)).toEqual(["sensor.roof"]);
    const listed = buildModel(hassOf({ ...STATES, "sensor.balcony": "15" }), config);
    expect(solarSegments(listed, config, "share").map((s) => s.key)).toEqual([
      "sensor.roof",
      "sensor.balcony",
    ]);
  });

  it("a negative source gets no segment; the shares count the positive ones (PV-2)", () => {
    const config = normalizeConfig(raw([ROOF, BALCONY]));
    const model = buildModel(hassOf({ ...STATES, "sensor.balcony": "-30" }), config);
    expect(solarSegments(model, config, "share").map((s) => [s.key, s.share])).toEqual([
      ["sensor.roof", 1],
    ]);
  });

  it("nothing at night: no segments at all", () => {
    const config = normalizeConfig(raw([ROOF, BALCONY]));
    const model = buildModel(
      hassOf({ ...STATES, "sensor.roof": "0", "sensor.balcony": "0" }),
      config,
    );
    expect(solarSegments(model, config, "share")).toEqual([]);
    expect(solarSegments(model, config, "peak").map((s) => [s.key, s.share])).toEqual([
      [FREE_KEY, 1],
    ]);
  });

  it("follows a given order - the rows' order from the last tick (L-7)", () => {
    const config = normalizeConfig(raw([ROOF, BALCONY]));
    const segments = solarSegments(buildModel(hassOf(STATES), config), config, "share", [
      "sensor.balcony",
      "sensor.roof",
    ]);
    expect(segments.map((s) => s.key)).toEqual(["sensor.balcony", "sensor.roof"]);
  });
});

describe("PV-7, PV-8: the PV rows", () => {
  const config = () =>
    normalizeConfig(raw([ROOF, BALCONY, { entity: "sensor.shed", name: "Schuppen" }]));
  const states = { ...STATES, "sensor.shed": "4" };

  it("sorted by power, the quiet ones filtered out, no rest", () => {
    const rows = buildSolarRows(buildModel(hassOf(states), config()), config(), false);
    expect(rows.map((r) => [r.key, r.w])).toEqual([
      ["sensor.roof", 3000],
      ["sensor.balcony", 1000],
    ]);
    expect(rows.some((r) => r.isRest)).toBe(false);
  });

  it("all of them with the filter lifted, even at 0 W", () => {
    const rows = buildSolarRows(
      buildModel(hassOf({ ...states, "sensor.shed": "0" }), config()),
      config(),
      true,
    );
    expect(rows.map((r) => r.key)).toEqual(["sensor.roof", "sensor.balcony", "sensor.shed"]);
  });

  it("an unavailable source is left out in both scopes (L-3, L-12)", () => {
    const model = buildModel(hassOf({ ...states, "sensor.balcony": "unavailable" }), config());
    expect(buildSolarRows(model, config(), true).map((r) => r.key)).toEqual([
      "sensor.roof",
      "sensor.shed",
    ]);
  });

  it("none for a single source - its row would repeat the node", () => {
    const one = normalizeConfig(raw([ROOF]));
    expect(buildSolarRows(buildModel(hassOf(STATES), one), one, true)).toEqual([]);
  });
});
