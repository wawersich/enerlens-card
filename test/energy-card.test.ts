// @vitest-environment happy-dom
/**
 * The energy mode on the real element (REQ 2.15): the chip, the figures at
 * the nodes, what disappears and what is never fetched. Invented figures (N-9).
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";

beforeAll(fakeMotion);

const H = 3_600_000;
const NOW = Date.parse("2026-10-19T12:30:00Z");

const CONFIG = {
  type: "custom:enerlens-card",
  entities: {
    solar: "sensor.solar",
    grid: { import: "sensor.import", export: "sensor.export" },
    battery: { discharge: "sensor.out", charge: "sensor.in" },
    battery_soc: "sensor.soc",
    house: "sensor.house",
  },
  nodes: { house: { label: { entity: "sensor.share" } } },
  view: { energy_periods: ["day", "month"] },
};

/** Live readings, quite different from the day's means below. */
const STATES: Record<string, string> = {
  "sensor.solar": "300",
  "sensor.import": "0",
  "sensor.export": "100",
  "sensor.out": "0",
  "sensor.in": "200",
  "sensor.soc": "72",
  "sensor.house": "0",
  "sensor.share": "80",
};

/** Hourly means of the day: 2 kW sun, 0.5 kW bought, 1 kW into the battery. */
const MEANS: Record<string, number> = {
  "sensor.solar": 2000,
  "sensor.import": 500,
  "sensor.export": 0,
  "sensor.out": 0,
  "sensor.in": 1000,
  "sensor.house": 1500,
};

type Card = HTMLElement & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  preview?: boolean;
};

function fakeHass(asked: Record<string, unknown>[]): HomeAssistant {
  const states: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(STATES)) {
    states[id] = {
      entity_id: id,
      state,
      attributes: { unit_of_measurement: id.includes("soc") || id.includes("share") ? "%" : "W" },
      last_changed: "2026-10-19T12:00:00+00:00",
      last_updated: "2026-10-19T12:00:00+00:00",
    };
  }
  return {
    states,
    locale: { language: "de", number_format: "language", time_zone: "server" },
    language: "de",
    config: { time_zone: "UTC" },
    callWS: async (msg: Record<string, unknown>) => {
      asked.push(msg);
      if (msg.type !== "recorder/statistics_during_period" || msg.period !== "hour") {
        return {} as never;
      }
      const start = Date.parse(String(msg.start_time));
      const out: Record<string, { start: number; mean: number }[]> = {};
      for (const id of msg.statistic_ids as string[]) {
        if (MEANS[id] === undefined) continue;
        out[id] = [];
        for (let t = start; t + H <= Math.floor(NOW / H) * H; t += H) {
          out[id].push({ start: t, mean: MEANS[id] });
        }
      }
      return out as never;
    },
  };
}

async function settle(el: Card) {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
  }
}

async function mount(config: Record<string, unknown> = CONFIG, preview = false) {
  const asked: Record<string, unknown>[] = [];
  const el = document.createElement("enerlens-card") as Card;
  el.setConfig(config);
  el.hass = fakeHass(asked);
  if (preview) el.preview = true;
  document.body.appendChild(el);
  await settle(el);
  return { el, asked };
}

const chip = (el: Card) => el.shadowRoot?.querySelector<HTMLElement>(".energy-chip");
const label = (el: Card) => chip(el)?.querySelector(".mode-label.active")?.textContent?.trim();
const node = (el: Card, key: string) => el.shadowRoot?.querySelector<HTMLElement>(`.node.${key}`);
const text = (e?: Element | null) => (e?.textContent ?? "").replace(/\s+/g, " ").trim();
const tap = async (el: Card) => {
  chip(el)?.click();
  await settle(el);
};

describe("energy mode on the card (REQ 2.15)", () => {
  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    await import("../src/enerlens-card");
  });
  afterAll(() => vi.useRealTimers());
  afterEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("offers one chip left of the filter that steps kW → Tag → Monat → kW (EM-2)", async () => {
    const { el } = await mount({
      ...CONFIG,
      consumers: [{ entity: "sensor.house" }],
    });
    expect(label(el)).toBe("kW");
    const seen = [];
    for (let i = 0; i < 3; i++) {
      await tap(el);
      seen.push(label(el));
    }
    expect(seen).toEqual(["Tag", "Monat", "kW"]);
    // View chip, energy chip, filter - the energy chip right next to the filter.
    const controls = [...(el.shadowRoot?.querySelector(".controls")?.children ?? [])];
    expect(controls.map((c) => c.classList.contains("energy-chip") || c.className.trim())).toEqual([
      "mode-chip",
      true,
      "filter-toggle",
    ]);
  });

  it("hides the view chip in a period and remembers the choice (EM-2)", async () => {
    const { el } = await mount();
    await tap(el);
    expect(el.shadowRoot?.querySelectorAll(".mode-chip")).toHaveLength(1);
    expect(localStorage.getItem("enerlens-energy-period")).toBe("day");
    const again = await mount();
    expect(label(again.el)).toBe("Tag");
  });

  it("shows the day's energy at the nodes (EM-4, EM-5)", async () => {
    const { el, asked } = await mount();
    await tap(el);
    expect(asked.filter((m) => m.type === "recorder/statistics_during_period")).toHaveLength(2);
    // Twelve hours since midnight: 24 kWh of sun, 18 kWh in the house.
    expect(text(node(el, "solar")?.querySelector(".value"))).toBe("24,0 kWh");
    expect(text(node(el, "house")?.querySelector(".value"))).toBe("18,0 kWh");
    const grid = [...(node(el, "grid")?.querySelectorAll(".value.figure") ?? [])].map(text);
    expect(grid).toEqual(["→6,0 kWh", "←0,0 kWh"]);
    const battery = [...(node(el, "battery")?.querySelectorAll(".value") ?? [])].map(text);
    // Discharge above, charge below - and no state of charge (EM-5).
    expect(battery).toEqual(["↑0,0 kWh", "↓12,0 kWh"]);
    expect(node(el, "battery")?.querySelector(".fill")).toBeNull();
  });

  it("drops state words and keeps the extra field's room unseen (EM-6)", async () => {
    const { el } = await mount();
    await tap(el);
    expect(text(node(el, "battery")?.querySelector(".label"))).toBe("Batterie");
    const extra = node(el, "house")?.querySelector<HTMLElement>(".extra-label");
    expect(extra?.style.visibility).toBe("hidden");
    expect(extra?.getAttribute("tabindex")).toBe("-1");
  });

  it("asks nothing in the editor preview until the chip is tapped there (EM-14)", async () => {
    localStorage.setItem("enerlens-energy-period", "day");
    const { el, asked } = await mount(CONFIG, true);
    expect(label(el)).toBe("kW");
    expect(asked.filter((m) => m.type === "recorder/statistics_during_period")).toHaveLength(0);
    await tap(el);
    expect(label(el)).toBe("Tag");
    expect(asked.filter((m) => m.type === "recorder/statistics_during_period")).toHaveLength(2);
  });

  it("has no chip without two sensors for the grid (EM-3)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { el } = await mount({
      ...CONFIG,
      entities: { ...CONFIG.entities, grid: "sensor.import" },
    });
    expect(chip(el)).toBeNull();
    warn.mockRestore();
  });
});
