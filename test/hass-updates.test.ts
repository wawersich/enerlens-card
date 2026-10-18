// @vitest-environment happy-dom
/**
 * The card draws again when something it shows has changed, not on every
 * state change anywhere in Home Assistant (REQ T-3, EL-I1).
 *
 * Home Assistant hands every card a new hass object whenever any entity
 * changes - on a large installation several times a second. Each one used to
 * render the card in full and restart the fan's frame loop; in an average
 * view it moved the means, because they are taken against the clock.
 */
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { HassEntity, HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";

beforeAll(fakeMotion);

type Card = HTMLElement & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  isUpdatePending: boolean;
};

const state = (id: string, value: string, unit = "W"): HassEntity => ({
  entity_id: id,
  state: value,
  attributes: { unit_of_measurement: unit },
  last_changed: "2026-10-18T10:00:00+00:00",
  last_updated: "2026-10-18T10:00:00+00:00",
});

const STATES: Record<string, HassEntity> = {
  "sensor.solar": state("sensor.solar", "3200"),
  "sensor.grid": state("sensor.grid", "450"),
  "sensor.house": state("sensor.house", "2900"),
  "sensor.pump": state("sensor.pump", "700"),
  "sensor.car": state("sensor.car", "64", "%"),
  "sensor.today": state("sensor.today", "12.4", "kWh"),
  "binary_sensor.plug": state("binary_sensor.plug", "on", ""),
  "sensor.status": state("sensor.status", "ok", ""),
  "sensor.elsewhere": state("sensor.elsewhere", "21.5", "°C"),
};

const CONFIG = {
  type: "custom:enerlens-card",
  entities: {
    solar: "sensor.solar",
    grid: "sensor.grid",
    house: "sensor.house",
    grid_status: { entity: "sensor.status", outage: ["off"] },
  },
  consumers: [
    {
      entity: "sensor.pump",
      name: "Pump",
      charge: { soc: "sensor.car", plugged: "binary_sensor.plug" },
    },
  ],
  nodes: { solar: { label: { entity: "sensor.today" } } },
};

const format = (s: HassEntity) => s.state;

function baseHass(): HomeAssistant {
  return {
    states: { ...STATES },
    locale: { language: "de", number_format: "language" },
    language: "de",
    entities: {
      "sensor.today": { display_precision: 1 },
      "sensor.elsewhere": { display_precision: 1 },
    },
    formatEntityState: format,
    callWS: async () => ({}) as never,
    connected: true,
    themes: { darkMode: false, theme: "default" },
  } as HomeAssistant;
}

describe("enerlens-card - draws again only for what it shows (REQ T-3, EL-I1)", () => {
  let el: Card;
  let hass: HomeAssistant;

  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  afterEach(() => el?.remove());

  async function mount() {
    el = document.createElement("enerlens-card") as Card;
    el.setConfig(CONFIG);
    hass = baseHass();
    el.hass = hass;
    document.body.appendChild(el);
    // The first render measures and asks for one more, and the outage and
    // charge lookups answer later; wait until all of it is quiet.
    for (let i = 0; i < 3; i++) {
      while (!(await el.updateComplete));
      await new Promise((r) => setTimeout(r, 0));
    }
    expect(el.isUpdatePending).toBe(false);
  }

  /** Hands over the next hass, as Home Assistant does, and says whether a render follows. */
  function next(change: (h: HomeAssistant) => HomeAssistant): boolean {
    hass = change({ ...hass });
    el.hass = hass;
    return el.isUpdatePending;
  }

  const withState = (h: HomeAssistant, id: string, value: string) => ({
    ...h,
    states: { ...h.states, [id]: { ...h.states[id], state: value } },
  });

  it("does not draw again when only an entity it does not show changed", async () => {
    await mount();
    expect(next((h) => withState(h, "sensor.elsewhere", "21.6"))).toBe(false);
  });

  it("does not draw again when only another entity's precision changed", async () => {
    await mount();
    expect(
      next((h) => ({
        ...h,
        entities: { ...h.entities, "sensor.elsewhere": { display_precision: 3 } },
      })),
    ).toBe(false);
  });

  it("does not draw again for a new hass with nothing changed at all", async () => {
    await mount();
    expect(next((h) => h)).toBe(false);
  });

  it("draws again when a placeholder sensor turns up and the example ends (E-5)", async () => {
    el = document.createElement("enerlens-card") as Card;
    el.setConfig({
      type: "custom:enerlens-card",
      entities: { solar: "sensor.solar_power", grid: "sensor.grid_power" },
    });
    hass = { ...baseHass(), entities: {} };
    el.hass = hass;
    document.body.appendChild(el);
    for (let i = 0; i < 3; i++) {
      while (!(await el.updateComplete));
      await new Promise((r) => setTimeout(r, 0));
    }
    expect(el.shadowRoot?.textContent).toMatch(/Beispielwerte/);
    // Registered, without a state yet - the states the card reads stay the same.
    expect(next((h) => ({ ...h, entities: { "sensor.solar_power": {} } }))).toBe(true);
  });

  it.each([
    ["a power entity", (h: HomeAssistant) => withState(h, "sensor.grid", "500")],
    ["a consumer", (h: HomeAssistant) => withState(h, "sensor.pump", "800")],
    ["a state of charge", (h: HomeAssistant) => withState(h, "sensor.car", "65")],
    ["a plug", (h: HomeAssistant) => withState(h, "binary_sensor.plug", "off")],
    ["the grid status", (h: HomeAssistant) => withState(h, "sensor.status", "off")],
    ["an extra value", (h: HomeAssistant) => withState(h, "sensor.today", "12.5")],
    ["the language", (h: HomeAssistant) => ({ ...h, language: "en" })],
    [
      "the number format",
      (h: HomeAssistant) => ({
        ...h,
        locale: { ...h.locale, number_format: "comma_decimal" as const },
      }),
    ],
    [
      "Home Assistant's formatter",
      (h: HomeAssistant) => ({ ...h, formatEntityState: format.bind(null) }),
    ],
    [
      "a display precision",
      (h: HomeAssistant) => ({ ...h, entities: { "sensor.today": { display_precision: 2 } } }),
    ],
    ["the theme", (h: HomeAssistant) => ({ ...h, themes: { darkMode: true, theme: "default" } })],
    ["the connection", (h: HomeAssistant) => ({ ...h, connected: false })],
  ])("draws again when %s changed", async (_what, change) => {
    await mount();
    expect(next(change)).toBe(true);
  });
});
