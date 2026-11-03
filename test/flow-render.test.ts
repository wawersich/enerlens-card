// @vitest-environment happy-dom
/**
 * Battery -> grid on the card (REQ 4.5, P-1, P-5, P-9; issue #27): it runs on
 * the grid-battery line, which must carry its colour, stay drawn when idle
 * lines are hidden, and lead from the battery to the grid.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import { PATHS, reversePath } from "../src/render/geometry";
import type { HomeAssistant, RawConfig } from "../src/types";

const W = (id: string, w: number) => [
  id,
  {
    entity_id: id,
    state: String(w),
    attributes: { unit_of_measurement: "W", device_class: "power" },
    last_changed: "2026-11-03T10:00:00+00:00",
    last_updated: "2026-11-03T10:00:00+00:00",
  },
];
// Case A: PV covers the house, the battery still discharges 500 W into the grid.
const hass = {
  states: Object.fromEntries([
    W("sensor.solar", 3000),
    W("sensor.house", 3000),
    W("sensor.battery", 500),
    W("sensor.grid", -500),
  ]),
  locale: { language: "de", number_format: "language" as const },
  language: "de",
  callWS: async () => ({}) as never,
} as unknown as HomeAssistant;

const colour = (key: "grid_export" | "grid_import") =>
  normalizeConfig(config()).colors[key].toLowerCase();

const config = (flow: Record<string, unknown> = {}) =>
  ({
    type: "custom:enerlens-card",
    entities: {
      solar: "sensor.solar",
      house: "sensor.house",
      battery: "sensor.battery",
      grid: "sensor.grid",
    },
    flow,
  }) as RawConfig;

type Card = HTMLElement & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
};

async function mount(c: RawConfig): Promise<Card> {
  const el = document.createElement("enerlens-card") as Card;
  el.setConfig(c);
  el.hass = hass;
  document.body.appendChild(el);
  for (let i = 0; i < 4; i++) {
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
  }
  return el;
}

const activeLines = (el: Card) =>
  [...(el.shadowRoot?.querySelectorAll<SVGPathElement>("path.link.active") ?? [])].map((p) => ({
    d: p.getAttribute("d"),
    stroke: p.getAttribute("style") ?? "",
  }));

beforeAll(async () => {
  (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  await import("../src/enerlens-card");
});

describe("battery -> grid on the card (#27)", () => {
  it("colours the grid-battery line in the export colour", async () => {
    const el = await mount(config());
    const lines = activeLines(el);
    expect(lines.map((l) => l.d)).toContain(PATHS.grid_battery);
    expect(lines.map((l) => l.d)).toContain(PATHS.solar_house);
    expect(lines.map((l) => l.d)).not.toContain(PATHS.solar_grid);
    const gridBattery = lines.find((l) => l.d === PATHS.grid_battery);
    expect(gridBattery?.stroke.toLowerCase()).toContain(colour("grid_export"));
    el.remove();
  });

  it("draws case A the old way with battery_task: supply_house (P-14)", async () => {
    const el = await mount({ ...config(), flow: { battery_task: "supply_house" } } as RawConfig);
    const lines = activeLines(el).map((l) => l.d);
    expect(lines).toContain(PATHS.solar_grid);
    expect(lines).toContain(PATHS.battery_house);
    expect(lines).not.toContain(PATHS.grid_battery);
    el.remove();
  });

  it("keeps that line when idle lines are hidden (P-9)", async () => {
    const el = await mount(config({ inactive_lines: "hide" }));
    const drawn = [...(el.shadowRoot?.querySelectorAll("path.link") ?? [])].map((p) =>
      p.getAttribute("d"),
    );
    expect(drawn).toContain(PATHS.grid_battery);
    el.remove();
  });

  it("draws the carrying line on top of the idle ones", async () => {
    const el = await mount(config());
    const links = [...(el.shadowRoot?.querySelectorAll("path.link") ?? [])];
    const firstActive = links.findIndex((p) => p.classList.contains("active"));
    expect(firstActive).toBeGreaterThan(0);
    expect(links.slice(firstActive).every((p) => p.classList.contains("active"))).toBe(true);
    expect(links.at(-1)?.classList.contains("active")).toBe(true);
    el.remove();
  });

  it("wears the colour of the larger flow when both directions run", async () => {
    // Two sensors each: the battery exports 900 W while the grid charges it with 200 W.
    const split = {
      ...hass,
      states: {
        ...hass.states,
        ...Object.fromEntries([
          W("sensor.imp", 200),
          W("sensor.exp", 900),
          W("sensor.dis", 900),
          W("sensor.chg", 200),
          W("sensor.solar", 0),
          W("sensor.house", 0),
        ]),
      },
    } as unknown as HomeAssistant;
    const el = document.createElement("enerlens-card") as Card;
    el.setConfig({
      type: "custom:enerlens-card",
      entities: {
        solar: "sensor.solar",
        house: "sensor.house",
        grid: { import: "sensor.imp", export: "sensor.exp" },
        battery: { discharge: "sensor.dis", charge: "sensor.chg" },
      },
    });
    el.hass = split;
    document.body.appendChild(el);
    for (let i = 0; i < 4; i++) {
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));
    }
    const line = activeLines(el).find((l) => l.d === PATHS.grid_battery);
    expect(line?.stroke.toLowerCase()).toContain(colour("grid_export"));
    el.remove();
  });

  it("leads its dots from the battery to the grid", () => {
    // The dots run along the path from its start (P-1).
    expect(PATHS.battery_grid).toBe(reversePath(PATHS.grid_battery));
    expect(PATHS.battery_grid.startsWith("M200,")).toBe(true);
  });
});
