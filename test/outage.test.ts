// @vitest-environment happy-dom
/**
 * Grid outage from a status entity (REQ NS-1 to NS-7).
 *
 * The interesting property is not the drawing but the latch: an outage often
 * takes the connection with it, so silence must never read as "the grid is
 * back". These tests walk the sequence that a real outage produces.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { collectEntityIds, normalizeConfig } from "../src/config";
import { buildModel } from "../src/model";
import { applyStatus, classifyStatus, fetchLastKnownStatus } from "../src/outage";
import { buildNodeViews } from "../src/render/cross";
import type { GridStatusSpec, HomeAssistant } from "../src/types";

const SPEC: GridStatusSpec = { entity: "sensor.status", outage: ["not_detected"], ok: ["ok"] };

function hassWith(values: Record<string, string>, options?: string[]): HomeAssistant {
  const states: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(values)) {
    states[id] = {
      entity_id: id,
      state,
      attributes: id.includes("status")
        ? { options }
        : { unit_of_measurement: "W", device_class: "power" },
      last_changed: "",
      last_updated: "",
    } as HomeAssistant["states"][string];
  }
  return {
    states,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  } as HomeAssistant;
}

describe("the latch (REQ NS-3)", () => {
  it("switches on, off, and holds everything else", () => {
    expect(applyStatus(undefined, "not_detected", SPEC)).toBe(true);
    expect(applyStatus(true, "ok", SPEC)).toBe(false);
    expect(applyStatus(true, "unavailable", SPEC)).toBe(true);
    expect(applyStatus(false, "unavailable", SPEC)).toBe(false);
    expect(applyStatus(undefined, "unavailable", SPEC)).toBeUndefined();
  });

  it("keeps the outage through the connection loss that follows it", () => {
    // The sequence of a real outage: reported, then the integration falls
    // silent, then it gives up entirely. The outage must stand until an "ok".
    let state = applyStatus(undefined, "ok", SPEC);
    state = applyStatus(state, "not_detected", SPEC);
    expect(state).toBe(true);
    state = applyStatus(state, "unknown", SPEC);
    state = applyStatus(state, "unavailable", SPEC);
    expect(state, "outage lost while nothing was reported").toBe(true);
    state = applyStatus(state, "ok", SPEC);
    expect(state).toBe(false);
  });

  it("ignores case and stray spaces, because integrations differ", () => {
    expect(applyStatus(false, " NOT_DETECTED ", SPEC)).toBe(true);
    expect(applyStatus(true, "Ok", SPEC)).toBe(false);
  });

  it("holds on a state nobody listed", () => {
    expect(classifyStatus("initialising", SPEC)).toBe("hold");
  });

  it("derives the ok states from the entity's own options", () => {
    const spec: GridStatusSpec = { entity: "sensor.status", outage: ["not_detected"], ok: [] };
    expect(applyStatus(true, "ok", spec, ["ok", "not_detected"])).toBe(false);
    // Not an option at all: no claim either way.
    expect(applyStatus(true, "booting", spec, ["ok", "not_detected"])).toBe(true);
  });

  it("without options, any other real state ends the outage", () => {
    const spec: GridStatusSpec = { entity: "sensor.status", outage: ["off"], ok: [] };
    expect(applyStatus(true, "on", spec)).toBe(false);
    expect(applyStatus(true, "unavailable", spec)).toBe(true);
  });
});

describe("configuration (REQ NS-1)", () => {
  const base = {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.s", grid: "sensor.g", house: "sensor.h" },
  };

  beforeEach(() => vi.restoreAllMocks());

  it("takes entity plus both state lists, lower-cased and de-duplicated", () => {
    const config = normalizeConfig({
      ...base,
      entities: {
        ...base.entities,
        grid_status: {
          entity: "sensor.status",
          outage: ["Not_Detected", "not_detected", "Island"],
          ok: ["OK"],
        },
      },
    });
    expect(config.gridStatus).toEqual({
      entity: "sensor.status",
      outage: ["not_detected", "island"],
      ok: ["ok"],
    });
  });

  it("ignores a bare entity id and says so - nothing may fail silently", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const config = normalizeConfig({
      ...base,
      entities: { ...base.entities, grid_status: "sensor.status" },
    });
    expect(config.gridStatus).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("ignores a block without outage states", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const config = normalizeConfig({
      ...base,
      entities: { ...base.entities, grid_status: { entity: "sensor.status", ok: ["ok"] } },
    });
    expect(config.gridStatus).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
  });

  it("watches the status entity, so a change reaches the card (REQ T-3)", () => {
    const config = normalizeConfig({
      ...base,
      entities: {
        ...base.entities,
        grid_status: { entity: "sensor.status", outage: ["not_detected"] },
      },
    });
    expect(collectEntityIds(config)).toContain("sensor.status");
  });
});

describe("the grid node during an outage (REQ NS-4)", () => {
  const config = normalizeConfig({
    type: "custom:enerlens-card",
    entities: {
      solar: "sensor.s",
      grid: "sensor.g",
      house: "sensor.h",
      grid_status: { entity: "sensor.status", outage: ["not_detected"], ok: ["ok"] },
    },
  });

  function gridNode(outage: boolean) {
    const hass = hassWith({
      "sensor.s": "0",
      "sensor.g": "-4",
      "sensor.h": "500",
      "sensor.status": outage ? "not_detected" : "ok",
    });
    return buildNodeViews(buildModel(hass, config), config, hass, outage).find(
      (v) => v.key === "grid",
    );
  }

  it("says the word instead of a figure", () => {
    const grid = gridNode(true);
    expect(grid?.value).toBe("kein Netz");
    expect(grid?.outage).toBe(true);
    expect(grid?.label, "no state word next to a severed grid").toBe("Netz");
  });

  it("opens the status entity, which is the one that says since when", () => {
    expect(gridNode(true)?.entity).toBe("sensor.status");
    expect(gridNode(false)?.entity).toBe("sensor.g");
  });

  it("draws normally while the grid is there", () => {
    const grid = gridNode(false);
    expect(grid?.value).toBe("0,00 kW");
    expect(grid?.outage).toBe(false);
  });
});

describe("starting point from the recorder (REQ NS-6)", () => {
  it("takes the newest state that carries information", async () => {
    const hass = hassWith({ "sensor.status": "unavailable" });
    hass.callWS = (async () => ({
      "sensor.status": [
        { s: "ok", lu: 1000 },
        { s: "not_detected", lu: 2000 },
        { s: "unavailable", lu: 3000 },
        { s: "unknown", lu: 4000 },
      ],
    })) as HomeAssistant["callWS"];
    expect(await fetchLastKnownStatus(hass, "sensor.status")).toBe("not_detected");
  });

  it("returns nothing when the window holds no real state", async () => {
    const hass = hassWith({ "sensor.status": "unavailable" });
    hass.callWS = (async () => ({
      "sensor.status": [{ s: "unavailable", lu: 1 }],
    })) as HomeAssistant["callWS"];
    expect(await fetchLastKnownStatus(hass, "sensor.status")).toBeUndefined();
  });
});
