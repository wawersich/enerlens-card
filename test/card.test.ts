// @vitest-environment happy-dom
/**
 * Renders the actual custom element. This is the layer where a broken template
 * or a missing update trigger shows up - unit tests on the modules cannot see it.
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { HomeAssistant } from "../src/types";

function fakeHass(states: Record<string, string>): HomeAssistant {
  const entities: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(states)) {
    entities[id] = {
      entity_id: id,
      state,
      attributes: { unit_of_measurement: id.includes("soc") ? "%" : "W" },
      last_changed: "2026-09-06T20:00:00+00:00",
      last_updated: "2026-09-06T20:00:00+00:00",
    };
  }
  return {
    states: entities,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  };
}

const CONFIG = {
  type: "custom:enerlens-card",
  title: "Test",
  entities: {
    solar: "sensor.solar",
    grid: "sensor.grid",
    battery: { discharge: "sensor.bat_out", charge: "sensor.bat_in" },
    battery_soc: "sensor.soc",
    house: "sensor.house",
  },
};

const STATES = {
  "sensor.solar": "9330",
  "sensor.grid": "-3930",
  "sensor.bat_out": "0",
  "sensor.bat_in": "1600",
  "sensor.soc": "72",
  "sensor.house": "3800",
};

describe("enerlens-card element", () => {
  beforeAll(async () => {
    // happy-dom has no ResizeObserver; the card uses it only for the scale factor.
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  async function mount() {
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      updateComplete: Promise<unknown>;
      shadowRoot: ShadowRoot | null;
    };
    el.setConfig(CONFIG);
    el.hass = fakeHass(STATES);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it("registers the element", () => {
    expect(customElements.get("enerlens-card")).toBeTruthy();
  });

  it("renders the cross with four nodes", async () => {
    const el = await mount();
    const root = el.shadowRoot;
    expect(root, "no shadow root").toBeTruthy();
    expect(root?.querySelector(".cross"), "no .cross container").toBeTruthy();
    expect(root?.querySelectorAll(".node").length, "wrong number of nodes").toBe(4);
  });

  it("shows the measured values (REQ K-7)", async () => {
    const el = await mount();
    const text = el.shadowRoot?.textContent ?? "";
    expect(text).toContain("9,33 kW");
    expect(text).toContain("3,93 kW");
    expect(text).toContain("3,80 kW");
    expect(text).toContain("1,60 kW");
  });

  it("labels grid export and battery charging (REQ K-2, K-4)", async () => {
    const el = await mount();
    const text = el.shadowRoot?.textContent ?? "";
    expect(text).toContain("Einspeisung");
    expect(text).toContain("lädt");
  });

  it("re-renders when hass changes", async () => {
    const el = await mount();
    el.hass = fakeHass({ ...STATES, "sensor.solar": "1234" });
    await el.updateComplete;
    expect(el.shadowRoot?.textContent ?? "").toContain("1,23 kW");
  });
});
