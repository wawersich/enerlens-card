import { describe, expect, it, vi } from "vitest";
import { SolarMemory } from "../src/solar-memory";
import type { HassEntity, HomeAssistant, NormalizedSolarSource } from "../src/types";

/*
 * The last value of each PV source (REQ PV-2): live while the card runs, and
 * once from the recorder for a source that was already gone when it opened.
 */

function entity(id: string, state: string, unit = "W"): HassEntity {
  return {
    entity_id: id,
    state,
    attributes: { unit_of_measurement: unit },
    last_changed: "",
    last_updated: "",
  };
}

function hassOf(entities: HassEntity[], callWS = vi.fn()): HomeAssistant {
  return {
    states: Object.fromEntries(entities.map((e) => [e.entity_id, e])),
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS,
  };
}

function source(entity: string, invert = false): NormalizedSolarSource {
  return { key: entity, entity, color: "#f80", invert, excluded: false };
}

const SOURCES = [source("sensor.roof"), source("sensor.balcony")];

describe("SolarMemory", () => {
  it("remembers every available value, in W and with its sign", () => {
    const memory = new SolarMemory();
    memory.observe(hassOf([entity("sensor.roof", "2.5", "kW"), entity("sensor.balcony", "-300")]), [
      source("sensor.roof"),
      source("sensor.balcony", true),
    ]);
    expect(memory.values.get("sensor.roof")).toBe(2500);
    expect(memory.values.get("sensor.balcony")).toBe(300);
  });

  it("keeps the last value while a source is gone", () => {
    const memory = new SolarMemory();
    memory.observe(hassOf([entity("sensor.roof", "800"), entity("sensor.balcony", "4")]), SOURCES);
    memory.observe(
      hassOf([entity("sensor.roof", "unavailable"), entity("sensor.balcony", "unknown")]),
      SOURCES,
    );
    expect(memory.values.get("sensor.roof")).toBe(800);
    expect(memory.values.get("sensor.balcony")).toBe(4);
  });

  it("names the sources gone at opening, once", () => {
    const memory = new SolarMemory();
    const hass = hassOf([entity("sensor.roof", "800"), entity("sensor.balcony", "unavailable")]);
    memory.observe(hass, SOURCES);
    expect(memory.missing(hass, SOURCES)).toEqual(["sensor.balcony"]);
  });

  it("takes the newest number from the recorder, in the entity's unit", async () => {
    const callWS = vi.fn().mockResolvedValue({
      "sensor.balcony": [
        { s: "0.31", lu: 100 },
        { s: "0.38", lu: 200 },
        { s: "unavailable", lu: 300 },
      ],
    });
    const hass = hassOf([entity("sensor.balcony", "unavailable", "kW")], callWS);
    const memory = new SolarMemory();
    await memory.prefill(hass, SOURCES, ["sensor.balcony"]);
    expect(memory.values.get("sensor.balcony")).toBe(380);
    expect(callWS).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "history/history_during_period",
        entity_ids: ["sensor.balcony"],
      }),
    );
    // Asked once: not named again, whatever the recorder said.
    expect(memory.missing(hass, SOURCES)).not.toContain("sensor.balcony");
  });

  it("a failing recorder leaves nothing remembered, and is not asked again", async () => {
    const callWS = vi.fn().mockRejectedValue(new Error("down"));
    const hass = hassOf([entity("sensor.balcony", "unavailable")], callWS);
    const memory = new SolarMemory();
    await expect(memory.prefill(hass, SOURCES, ["sensor.balcony"])).rejects.toThrow();
    expect(memory.values.has("sensor.balcony")).toBe(false);
    expect(memory.missing(hass, SOURCES)).not.toContain("sensor.balcony");
  });
});
