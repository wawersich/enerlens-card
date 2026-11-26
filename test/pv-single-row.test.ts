// @vitest-environment happy-dom
/**
 * A PV row with one source and "always show all PV sources" (REQ PV-11).
 *
 * One source: with the PV list on its row is always there - at night, below
 * the threshold, with the filter on - and shows what the PV node shows: 0 W,
 * or "—" when it is unavailable. In the list form and in the plain-entity
 * form alike; a derived PV has none. Several sources: `list.solar_always`
 * keeps every source, at 0 W too, whatever the list scope.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { SOLAR_PALETTE, normalizeConfig } from "../src/config";
import { planOf } from "../src/detail-dialog";
import { buildModel } from "../src/model";
import { buildSolarRows, refreshSolarRows } from "../src/solar";
import type { HassEntity, HomeAssistant, RawConfig } from "../src/types";
import { fakeMotion } from "./motion";

beforeAll(fakeMotion);
afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
  localStorage.clear();
});

function entity(id: string, state: string): HassEntity {
  return {
    entity_id: id,
    state,
    attributes: {
      unit_of_measurement: "W",
      device_class: "power",
      friendly_name: id === "sensor.pv" ? "Wechselrichter" : undefined,
    },
    last_changed: "2026-11-20T10:00:00+00:00",
    last_updated: "2026-11-20T10:00:00+00:00",
  };
}

function hassOf(states: Record<string, string>): HomeAssistant {
  return {
    states: Object.fromEntries(Object.entries(states).map(([id, s]) => [id, entity(id, s)])),
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: vi.fn(async () => ({})) as never,
  } as HomeAssistant;
}

function raw(solar: unknown, extra: Record<string, unknown> = {}): RawConfig {
  return {
    type: "custom:enerlens-card",
    entities: { solar, grid: "sensor.grid", house: "sensor.house" },
    ...extra,
  } as RawConfig;
}

const ROOF = { entity: "sensor.roof", name: "Dach" };
const BALCONY = { entity: "sensor.balcony", name: "Balkon" };
const SHED = { entity: "sensor.shed", name: "Schuppen" };
const BASE = { "sensor.grid": "0", "sensor.house": "1000" };
const rowsOf = (
  cfg: RawConfig,
  states: Record<string, string>,
  showAll = false,
  last?: Map<string, number>,
) => {
  const config = normalizeConfig(cfg);
  return buildSolarRows(buildModel(hassOf(states), config, undefined, last), config, showAll);
};

describe("PV-11: the YAML key", () => {
  it("list.solar_always is off by default, on when written", () => {
    expect(normalizeConfig(raw([ROOF, BALCONY])).list.solarAlways).toBe(false);
    expect(
      normalizeConfig(raw([ROOF, BALCONY], { list: { solar: true, solar_always: true } })).list
        .solarAlways,
    ).toBe(true);
  });

  it("an empty value is the default, never an error card (E-1)", () => {
    expect(normalizeConfig(raw([ROOF], { list: { solar_always: "" } })).list.solarAlways).toBe(
      false,
    );
  });

  it("is a known key: no warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    normalizeConfig(raw([ROOF, BALCONY], { list: { solar: true, solar_always: true } }));
    expect(warn.mock.calls.flat().join(" ")).not.toContain("solar_always");
  });
});

describe("PV-11: one source always has its row", () => {
  it("a list of one: its row at 0 W, with the filter on", () => {
    const rows = rowsOf(raw([ROOF], { list: { solar: true } }), { ...BASE, "sensor.roof": "0" });
    expect(rows.map((r) => [r.key, r.w, r.powerUnknown])).toEqual([["sensor.roof", 0, undefined]]);
  });

  it("a list of one below min_consumer_w: still there", () => {
    const rows = rowsOf(raw([ROOF], { list: { solar: true } }), { ...BASE, "sensor.roof": "4" });
    expect(rows.map((r) => r.w)).toEqual([4]);
  });

  it("the plain-entity form: one row, named like the entity, a dot in the first orange", () => {
    const rows = rowsOf(raw("sensor.pv", { list: { solar: true } }), {
      ...BASE,
      "sensor.pv": "1500",
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      key: "sensor.pv",
      entity: "sensor.pv",
      name: "Wechselrichter",
      w: 1500,
      color: SOLAR_PALETTE[0],
      isRest: false,
    });
    expect(rows[0].icon).toBeUndefined();
  });

  it("the plain-entity form inverted: the row shows the node's sign", () => {
    const rows = rowsOf(raw({ entity: "sensor.pv", invert: true }, { list: { solar: true } }), {
      ...BASE,
      "sensor.pv": "-1500",
    });
    expect(rows.map((r) => r.w)).toEqual([1500]);
  });

  it("the plain-entity form unavailable: the row stays with no figure, like the node", () => {
    const rows = rowsOf(raw("sensor.pv", { list: { solar: true } }), {
      ...BASE,
      "sensor.pv": "unavailable",
    });
    expect(rows.map((r) => [r.key, r.powerUnknown])).toEqual([["sensor.pv", true]]);
  });

  it("a list of one off for the night (quiet before): 0 W, as the node reads it (PV-2)", () => {
    const rows = rowsOf(
      raw([ROOF], { list: { solar: true } }),
      { ...BASE, "sensor.roof": "unavailable" },
      false,
      new Map([["sensor.roof", 2]]),
    );
    expect(rows.map((r) => [r.w, r.powerUnknown])).toEqual([[0, undefined]]);
  });

  it("a list of one gone while delivering: the row stays with no figure", () => {
    const rows = rowsOf(
      raw([ROOF], { list: { solar: true } }),
      { ...BASE, "sensor.roof": "unavailable" },
      false,
      new Map([["sensor.roof", 2500]]),
    );
    expect(rows.map((r) => r.powerUnknown)).toEqual([true]);
  });

  it("a derived PV has no row: no entity behind it", () => {
    const config = normalizeConfig({
      type: "custom:enerlens-card",
      entities: {
        solar: "derived",
        grid: "sensor.grid",
        house: "sensor.house",
        battery: "sensor.bat",
      },
      list: { solar: true },
    } as RawConfig);
    const model = buildModel(hassOf({ ...BASE, "sensor.bat": "0" }), config);
    expect(buildSolarRows(model, config, true)).toEqual([]);
  });

  it("one source between ticks: gone reads '—', back reads its value (L-7)", () => {
    const config = normalizeConfig(raw("sensor.pv", { list: { solar: true } }));
    const rows = buildSolarRows(
      buildModel(hassOf({ ...BASE, "sensor.pv": "1500" }), config),
      config,
      false,
    );
    const gone = refreshSolarRows(
      rows,
      buildModel(hassOf({ ...BASE, "sensor.pv": "unavailable" }), config),
    );
    expect(gone.map((r) => r.powerUnknown)).toEqual([true]);
    const back = refreshSolarRows(
      gone,
      buildModel(hassOf({ ...BASE, "sensor.pv": "900" }), config),
    );
    expect(back.map((r) => [r.w, r.powerUnknown])).toEqual([[900, undefined]]);
  });

  it("the plain-entity row follows the live value between ticks (L-7)", () => {
    const config = normalizeConfig(raw("sensor.pv", { list: { solar: true } }));
    const rows = buildSolarRows(
      buildModel(hassOf({ ...BASE, "sensor.pv": "1500" }), config),
      config,
      false,
    );
    const live = buildModel(hassOf({ ...BASE, "sensor.pv": "1700" }), config);
    expect(refreshSolarRows(rows, live).map((r) => r.w)).toEqual([1700]);
  });
});

describe("PV-11: several sources with list.solar_always", () => {
  const always = (extra: Record<string, unknown> = {}) =>
    raw([ROOF, BALCONY, SHED], { list: { solar: true, solar_always: true }, ...extra });
  const states = { ...BASE, "sensor.roof": "3000", "sensor.balcony": "0", "sensor.shed": "4" };

  it("every source, at 0 W too, with the filter on", () => {
    expect(rowsOf(always(), states).map((r) => [r.key, r.w])).toEqual([
      ["sensor.roof", 3000],
      ["sensor.shed", 4],
      ["sensor.balcony", 0],
    ]);
  });

  it("without it the list scope decides, as before (PV-8)", () => {
    const off = raw([ROOF, BALCONY, SHED], { list: { solar: true } });
    expect(rowsOf(off, states).map((r) => r.key)).toEqual(["sensor.roof"]);
  });

  it("a source off for the night, or never seen, stands at 0 W; one gone while delivering is left out (PV-2)", () => {
    const rows = rowsOf(
      always(),
      {
        ...BASE,
        "sensor.roof": "unavailable",
        "sensor.balcony": "unavailable",
        "sensor.shed": "unavailable",
      },
      false,
      new Map([
        ["sensor.roof", 1],
        ["sensor.balcony", 2500],
      ]),
    );
    expect(rows.map((r) => [r.key, r.w, r.powerUnknown])).toEqual([
      ["sensor.roof", 0, undefined],
      ["sensor.shed", 0, undefined],
    ]);
  });

  it("in a period a gone source is left out: the period has its own gap rules (EM-10)", () => {
    const config = {
      ...normalizeConfig(always()),
      energy: { roles: {}, consumers: {}, rest: { tier: 0, note: "" } },
    };
    const model = buildModel(
      hassOf({ ...states, "sensor.balcony": "unavailable" }),
      config as never,
      undefined,
      new Map([["sensor.balcony", 1]]),
    );
    expect(buildSolarRows(model, config as never, false).map((r) => r.key)).not.toContain(
      "sensor.balcony",
    );
  });

  it("between ticks: one going for the night reads 0 W, one gone while delivering keeps its figure (L-7)", () => {
    const config = normalizeConfig(always());
    const rows = buildSolarRows(
      buildModel(hassOf({ ...states, "sensor.balcony": "800" }), config),
      config,
      false,
    );
    const later = buildModel(
      hassOf({ ...states, "sensor.roof": "unavailable", "sensor.balcony": "unavailable" }),
      config,
      undefined,
      new Map([
        ["sensor.roof", 3000],
        ["sensor.balcony", 5],
      ]),
    );
    const live = refreshSolarRows(rows, later);
    expect(live.find((r) => r.key === "sensor.roof")?.w).toBe(3000);
    expect(live.find((r) => r.key === "sensor.balcony")?.w).toBe(0);
  });

  it("does nothing without the PV list", () => {
    const config = normalizeConfig(raw([ROOF, BALCONY], { list: { solar_always: true } }));
    expect(config.list.solar).toBe(false);
  });
});

describe("PV-11: the row's window (DF-19, DF-20)", () => {
  it("the plain-entity row opens the entity's own series, inverted as configured", () => {
    const config = normalizeConfig(
      raw({ entity: "sensor.pv", invert: true }, { list: { solar: true } }),
    );
    const plan = planOf("source:sensor.pv", config, hassOf({ ...BASE, "sensor.pv": "-10" }));
    expect(plan.series.map((s) => [s.entity, s.invert, s.role])).toEqual([
      ["sensor.pv", true, "solar"],
    ]);
    expect(plan.title).toBe("Wechselrichter");
  });

  it("the plain-entity row's window takes the PV role: its kWh bars and mark in a period", () => {
    const config = normalizeConfig(raw("sensor.pv", { list: { solar: true } }));
    const plan = planOf("source:sensor.pv", config);
    expect(plan.series[0].roles).toEqual(["solar"]);
  });

  it("a source of a list keeps its own series, no PV role (DF-19)", () => {
    const config = normalizeConfig(raw([ROOF, BALCONY], { list: { solar: true } }));
    expect(planOf("source:sensor.roof", config).series[0].roles).toBeUndefined();
  });
});

describe("PV-11 on the card", () => {
  type Card = HTMLElement & {
    setConfig: (c: unknown) => void;
    hass: HomeAssistant;
    updateComplete: Promise<unknown>;
  };

  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver ??= class {
      observe() {}
      disconnect() {}
    };
    (globalThis as unknown as Record<string, unknown>).IntersectionObserver ??= class {
      constructor(cb: (e: { isIntersecting: boolean }[]) => void) {
        setTimeout(() => cb([{ isIntersecting: true }]), 0);
      }
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  async function mount(
    cfg: RawConfig,
    states: Record<string, string>,
  ): Promise<[Card, HomeAssistant]> {
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig(cfg);
    const hass = hassOf(states);
    el.hass = hass;
    document.body.appendChild(el);
    for (let i = 0; i < 3; i++) {
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));
    }
    return [el, hass];
  }
  const pvKeys = (el: Card) =>
    [...(el.shadowRoot?.querySelectorAll(".pv-rows .row") ?? [])].map(
      (r) => (r as HTMLElement).dataset.key,
    );

  it("one entity and the PV list on: one PV row at night", async () => {
    const [el] = await mount(raw("sensor.pv", { list: { solar: true } }), {
      ...BASE,
      "sensor.pv": "0",
    });
    expect(pvKeys(el)).toEqual(["sensor.pv"]);
  });

  it("one entity and the PV list off: no row, as before", async () => {
    const [el] = await mount(raw("sensor.pv"), { ...BASE, "sensor.pv": "1500" });
    expect(el.shadowRoot?.querySelector(".pv-rows")).toBeNull();
  });

  it("the row opens the window of its source", async () => {
    const [el] = await mount(raw("sensor.pv", { list: { solar: true } }), {
      ...BASE,
      "sensor.pv": "1500",
    });
    let opened: { node?: string } = {};
    el.addEventListener("show-dialog", (e) => {
      opened = (e as CustomEvent).detail.dialogParams;
    });
    (el.shadowRoot?.querySelector(".pv-rows .row .row-hit") as HTMLButtonElement).click();
    expect(opened.node).toBe("source:sensor.pv");
  });

  it("square, solar left: the one row left of the drawing (AN-3)", async () => {
    const [el] = await mount(
      raw("sensor.pv", {
        layout: "square_left",
        list: { solar: true },
        consumers: [{ entity: "sensor.house", name: "Rest" }],
      }),
      { ...BASE, "sensor.pv": "0" },
    );
    expect(el.shadowRoot?.querySelector(".pv-side")).not.toBeNull();
  });

  // Without the energy mode, so its statistics check asks nothing on its own.
  const asked = async (history: boolean) => {
    const [, hass] = await mount(
      raw("sensor.pv", {
        view: { energy_periods: ["power"] },
        list: { solar: true, history: { solar: history } },
      }),
      { ...BASE, "sensor.pv": "1500" },
    );
    return (hass.callWS as unknown as ReturnType<typeof vi.fn>).mock.calls
      .map(([m]) => m as { type: string; statistic_ids?: string[] })
      .filter((m) => m.type === "recorder/get_statistics_metadata")
      .flatMap((m) => m.statistic_ids ?? []);
  };

  it("the history line for the one entity asks HA for its data (LZ-18)", async () => {
    expect(await asked(true)).toContain("sensor.pv");
  });

  it("without the PV rows' history line, nothing is asked for it", async () => {
    expect(await asked(false)).not.toContain("sensor.pv");
  });

  it("solar_always without the PV list: no PV rows", async () => {
    const [el] = await mount(raw([ROOF, BALCONY], { list: { solar_always: true } }), {
      ...BASE,
      "sensor.roof": "3000",
      "sensor.balcony": "0",
    });
    expect(el.shadowRoot?.querySelector(".pv-rows")).toBeNull();
  });
});
