// @vitest-environment happy-dom
/**
 * The frame around the list rows (REQ LZ-8): a switch for the whole card,
 * consumers and the rest, not the PV rows (they come with the PV part).
 */
import { render } from "lit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChargeTracker } from "../src/charge";
import { normalizeConfig } from "../src/config";
import { buildBreakdown } from "../src/consumers";
import { buildModel } from "../src/model";
import { renderList } from "../src/render/list";
import type { HomeAssistant, RawConfig } from "../src/types";

afterEach(() => vi.restoreAllMocks());

function hassWith(states: Record<string, string>): HomeAssistant {
  const all: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(states)) {
    all[id] = {
      entity_id: id,
      state,
      attributes: { unit_of_measurement: "W" },
      last_changed: "",
      last_updated: "",
    };
  }
  return {
    states: all,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  } as HomeAssistant;
}

const LIVE = {
  "sensor.solar": "0",
  "sensor.grid": "3000",
  "sensor.house": "3000",
  "sensor.wallbox": "2000",
  "sensor.pump": "600",
};

function draw(extra: Record<string, unknown>, stacked = false): HTMLElement {
  const cfg = normalizeConfig({
    type: "custom:enerlens-card",
    entities: { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" },
    consumers: [
      { entity: "sensor.wallbox", name: "Wallbox", color: "#5c6bc0" },
      { entity: "sensor.pump", name: "Pumpe" },
    ],
    ...extra,
  } as RawConfig);
  const hass = hassWith(LIVE);
  const tracker = new ChargeTracker();
  const model = buildModel(hass, cfg, (e) => tracker.state(hass, e));
  const host = document.createElement("div");
  render(renderList(buildBreakdown(model, cfg), cfg, hass, vi.fn(), stacked), host);
  return host;
}

describe("list.frame (LZ-8)", () => {
  it("is off by default and reads on", () => {
    const base = {
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar", grid: "sensor.grid" },
    } as RawConfig;
    expect(normalizeConfig(base).list.frame).toBe(false);
    expect(normalizeConfig({ ...base, list: { frame: true } }).list.frame).toBe(true);
  });

  it("draws nothing extra while off", () => {
    const host = draw({});
    expect(host.querySelector(".list")?.classList.contains("framed")).toBe(false);
    expect(host.querySelector(".frame")).toBeNull();
  });

  it("frames every row in its own colour, the rest too", () => {
    const host = draw({ list: { frame: true } });
    expect(host.querySelector(".list")?.classList.contains("framed")).toBe(true);
    const rows = [...host.querySelectorAll(".rows .row")] as HTMLElement[];
    expect(rows.length).toBe(3);
    for (const row of rows) expect(row.querySelector(".frame")).not.toBeNull();
    expect(rows[0].style.getPropertyValue("--el-frame")).toBe("#5c6bc0");
  });

  it("frames below the cross as well", () => {
    const host = draw({ list: { frame: true } }, true);
    expect(host.querySelectorAll(".rows .row .frame").length).toBe(3);
  });
});

describe("list.frame and the PV rows (LZ-8, PV-7)", () => {
  it("leaves the PV rows without a frame for now", () => {
    const cfg = normalizeConfig({
      type: "custom:enerlens-card",
      entities: {
        solar: [{ entity: "sensor.roof" }, { entity: "sensor.west" }],
        grid: "sensor.grid",
        house: "sensor.house",
      },
      consumers: [{ entity: "sensor.wallbox" }],
      list: { frame: true, solar: true },
    } as RawConfig);
    const hass = hassWith({ ...LIVE, "sensor.roof": "800", "sensor.west": "400" });
    const tracker = new ChargeTracker();
    const model = buildModel(hass, cfg, (e) => tracker.state(hass, e));
    const solarRows = buildBreakdown(model, cfg).entries.slice(0, 0);
    const host = document.createElement("div");
    const pv = model.solarSources.map((s) => ({
      key: s.key,
      entity: s.entity,
      name: s.name ?? s.entity,
      color: "#f57c00",
      w: 500,
      isRest: false,
    }));
    render(
      renderList(buildBreakdown(model, cfg), cfg, hass, vi.fn(), false, [
        ...solarRows,
        ...pv,
      ] as never),
      host,
    );
    expect(host.querySelectorAll(".pv-rows .row").length).toBe(2);
    expect(host.querySelector(".pv-rows .frame")).toBeNull();
    expect(host.querySelector(".rows .frame")).not.toBeNull();
  });
});

/** Kept for the per-entry tests: draws with its own consumers. */
function drawWith(
  consumers: Record<string, unknown>[],
  extra: Record<string, unknown> = {},
  stacked = false,
  states: Record<string, string> = LIVE,
): HTMLElement {
  const cfg = normalizeConfig({
    type: "custom:enerlens-card",
    entities: { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" },
    consumers,
    ...extra,
  } as unknown as RawConfig);
  const hass = hassWith(states);
  const tracker = new ChargeTracker();
  const model = buildModel(hass, cfg, (e) => tracker.state(hass, e));
  const host = document.createElement("div");
  render(renderList(buildBreakdown(model, cfg), cfg, hass, vi.fn(), stacked), host);
  return host;
}

const rowOf = (host: HTMLElement, key: string) =>
  host.querySelector(`.rows .row[data-key="${key}"]`) as HTMLElement;

describe("frame per entry (LZ-16)", () => {
  const base = {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.solar", grid: "sensor.grid" },
  };

  it("reads frame on a consumer and on the rest entry, off by default", () => {
    const cfg = normalizeConfig({
      ...base,
      consumers: [
        { entity: "sensor.wallbox", frame: true },
        { entity: "sensor.pump" },
        { type: "rest", frame: true },
      ],
    } as RawConfig);
    expect(cfg.consumers[0].frame).toBe(true);
    expect(cfg.consumers[1].frame ?? false).toBe(false);
    expect(cfg.rest?.frame).toBe(true);
  });

  it("rejects a frame that is not a switch, like every other switch", () => {
    expect(() =>
      normalizeConfig({
        ...base,
        consumers: [{ entity: "sensor.wallbox", frame: "yes" }],
      } as unknown as RawConfig),
    ).toThrow();
  });

  it("frames only the entry that asks for it, the list takes the framed layout", () => {
    const host = drawWith([
      { entity: "sensor.wallbox", name: "Wallbox", color: "#5c6bc0", frame: true },
      { entity: "sensor.pump", name: "Pumpe" },
    ]);
    expect(host.querySelector(".list")?.classList.contains("framed")).toBe(true);
    const wallbox = rowOf(host, "sensor.wallbox");
    expect(wallbox.querySelector(".frame:not(.plain)")).not.toBeNull();
    expect(wallbox.style.getPropertyValue("--el-frame")).toBe("#5c6bc0");
    const pump = rowOf(host, "sensor.pump");
    expect(pump.querySelector(".frame")).toBeNull();
    expect(pump.style.getPropertyValue("--el-frame")).toBe("");
    expect(rowOf(host, "__rest__").querySelector(".frame")).toBeNull();
  });

  it("frames the rest on its own", () => {
    const host = drawWith([
      { entity: "sensor.wallbox" },
      { entity: "sensor.pump" },
      { type: "rest", frame: true },
    ]);
    expect(rowOf(host, "__rest__").querySelector(".frame:not(.plain)")).not.toBeNull();
    expect(rowOf(host, "sensor.wallbox").querySelector(".frame")).toBeNull();
  });

  it("frames every entry while the card's switch is on, whatever the entry says", () => {
    const host = drawWith([{ entity: "sensor.wallbox", frame: false }, { entity: "sensor.pump" }], {
      list: { frame: true },
    });
    expect(host.querySelectorAll(".rows .row .frame:not(.plain)").length).toBe(3);
  });

  it("draws the same rows for the card's switch as for every entry's", () => {
    const strip = (host: HTMLElement) => host.innerHTML.replace(/<!--[\s\S]*?-->/g, "");
    for (const stacked of [false, true]) {
      const global = drawWith(
        [{ entity: "sensor.wallbox" }, { entity: "sensor.pump" }],
        { list: { frame: true } },
        stacked,
      );
      const each = drawWith(
        [
          { entity: "sensor.wallbox", frame: true },
          { entity: "sensor.pump", frame: true },
          { type: "rest", frame: true },
        ],
        {},
        stacked,
      );
      expect(strip(each)).toBe(strip(global));
    }
  });

  it("keeps the framed layout while the framed entry is hidden", () => {
    const host = drawWith(
      [{ entity: "sensor.wallbox", frame: true }, { entity: "sensor.pump" }],
      {},
      false,
      { ...LIVE, "sensor.wallbox": "0", "sensor.house": "1000" },
    );
    expect(rowOf(host, "sensor.wallbox")).toBeNull();
    expect(host.querySelector(".list")?.classList.contains("framed")).toBe(true);
  });

  it("gives a banded entry without frame the frame's shape, without its line", () => {
    const host = drawWith([
      { entity: "sensor.wallbox", frame: true },
      { entity: "sensor.pump", highlight: { band: true } },
    ]);
    const pump = rowOf(host, "sensor.pump");
    expect(pump.querySelector(".frame.plain")).not.toBeNull();
    expect(pump.style.getPropertyValue("--el-frame")).toBe("");
  });

  it("leaves a banded entry as before when no entry is framed", () => {
    const host = drawWith([
      { entity: "sensor.wallbox" },
      { entity: "sensor.pump", highlight: { band: true } },
    ]);
    expect(host.querySelector(".list")?.classList.contains("framed")).toBe(false);
    expect(host.querySelector(".frame")).toBeNull();
  });

  it("does not frame the PV-only list while the consumer list is off", () => {
    const host = drawWith([{ entity: "sensor.wallbox", frame: true }], {
      list: { enabled: false },
    });
    expect(host.querySelector(".framed")).toBeNull();
  });

  it("keeps the frame of an unavailable consumer in the energy mode", () => {
    const cfg = normalizeConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" },
      consumers: [{ entity: "sensor.wallbox", frame: true }, { entity: "sensor.pump" }],
    } as RawConfig);
    cfg.energy = {
      consumers: { "sensor.wallbox": { tier: 0, note: "" } },
    } as unknown as typeof cfg.energy;
    const hass = hassWith({ ...LIVE, "sensor.wallbox": "unavailable" });
    const tracker = new ChargeTracker();
    const model = buildModel(hass, cfg, (e) => tracker.state(hass, e));
    const wallbox = buildBreakdown(model, cfg).entries.find((e) => e.key === "sensor.wallbox");
    expect(wallbox?.powerUnknown).toBe(true);
    expect(wallbox?.frame).toBe(true);
  });
});
