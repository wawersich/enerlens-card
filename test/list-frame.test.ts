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
