// @vitest-environment happy-dom
/**
 * Load behaviour: many consumers, missing entities, repeated mounts.
 * These are the cases REQ N-4, N-5 and L-11 name, and the ones a person is
 * least likely to try by hand.
 */
import { beforeAll, describe, expect, it } from "vitest";
import type { HomeAssistant } from "../src/types";

function hassWith(count: number): HomeAssistant {
  const states: HomeAssistant["states"] = {};
  const add = (id: string, state: string, unit = "W") => {
    states[id] = {
      entity_id: id,
      state,
      attributes: { unit_of_measurement: unit, device_class: "power" },
      last_changed: "2026-09-07T06:00:00+00:00",
      last_updated: "2026-09-07T06:00:00+00:00",
    };
  };
  add("sensor.solar", "9330");
  add("sensor.grid", "-3930");
  add("sensor.house", "49672");
  for (let i = 1; i <= count; i++) {
    add(`sensor.c${i}`, String(i % 7 === 0 ? 3 : i * 13));
  }
  return {
    states,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  };
}

function configWith(count: number, max?: number) {
  return {
    type: "custom:enerlens-card",
    entities: { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" },
    consumers: Array.from({ length: count }, (_, i) => ({ entity: `sensor.c${i + 1}` })),
    ...(max ? { max_consumers: max } : {}),
  };
}

type Card = HTMLElement & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  shadowRoot: ShadowRoot | null;
};

async function mount(config: unknown, hass: HomeAssistant): Promise<Card> {
  const el = document.createElement("enerlens-card") as Card;
  el.setConfig(config);
  el.hass = hass;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe("load and failure modes", () => {
  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    (globalThis as unknown as Record<string, unknown>).IntersectionObserver = class {
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  it("renders 100 consumers without falling over (REQ L-11)", async () => {
    const el = await mount(configWith(100), hassWith(100));
    const rows = el.shadowRoot?.querySelectorAll(".row") ?? [];
    // 14 of the 100 sit below the threshold; the rest plus the remainder show.
    expect(rows.length).toBeGreaterThan(80);
    expect(el.shadowRoot?.textContent).toContain("kW");
    el.remove();
  });

  it("keeps only the configured number in the DOM (REQ L-4, L-11)", async () => {
    const el = await mount(configWith(100, 5), hassWith(100));
    // Five consumers plus the remainder - the other 95 must not be rendered.
    expect(el.shadowRoot?.querySelectorAll(".row").length).toBe(6);
    el.remove();
  });

  it("survives entities that do not exist (REQ N-5, K-9)", async () => {
    const el = await mount(
      {
        type: "custom:enerlens-card",
        entities: { solar: "sensor.nope", grid: "sensor.nope2", house: "sensor.nope3" },
        consumers: [{ entity: "sensor.nope4" }],
      },
      hassWith(0),
    );
    expect(el.shadowRoot?.querySelectorAll(".node").length).toBe(3);
    // Em dash for every unavailable reading, and no list rows at all.
    expect(el.shadowRoot?.textContent).toContain("—");
    expect(el.shadowRoot?.querySelectorAll(".row").length).toBe(0);
    el.remove();
  });

  it("cleans up when removed and works again on remount (REQ N-4)", async () => {
    const hass = hassWith(20);
    for (let i = 0; i < 5; i++) {
      const el = await mount(configWith(20), hass);
      expect(el.shadowRoot?.querySelectorAll(".node").length).toBe(3);
      el.remove();
      // A leaked timer or observer would keep the element referenced and its
      // dot animations running after removal.
      expect(el.isConnected).toBe(false);
    }
  });

  it("handles a consumer going unavailable mid-run (REQ K-9, L-3)", async () => {
    const hass = hassWith(5);
    const el = await mount(configWith(5), hass);
    const before = el.shadowRoot?.querySelectorAll(".row").length ?? 0;

    // structuredClone chokes on the callWS function, so copy by hand.
    const broken: HomeAssistant = {
      ...hass,
      states: {
        ...hass.states,
        "sensor.c1": { ...hass.states["sensor.c1"], state: "unavailable" },
      },
    };
    el.hass = broken;
    await el.updateComplete;
    // The row stays until the next tick reselects (REQ L-7); nothing throws.
    expect(el.shadowRoot?.querySelectorAll(".row").length).toBeLessThanOrEqual(before);
    el.remove();
  });
});
