// @vitest-environment happy-dom
/**
 * The detail window in the power view and the state of charge below it
 * (REQ DF-4, DF-5, DF-9): five-minute means with their band, export and
 * charging mirrored below zero, and a min-max band where the history no longer
 * reaches. Invented figures (N-9).
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { DETAIL_NAME } from "../src/const";
import type { HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";

const H = 3_600_000;
const NOW = Date.parse("2026-10-19T12:30:00Z");
const MIDNIGHT = Date.parse("2026-10-19T00:00:00Z");

const CONFIG = {
  type: "custom:enerlens-card",
  entities: {
    solar: "sensor.solar",
    grid: { import: "sensor.import", export: "sensor.export" },
    battery: { discharge: "sensor.out", charge: "sensor.in" },
    battery_soc: "sensor.soc",
    house: "sensor.house",
  },
  view: { energy_periods: ["power", "today"] },
};

const STATES: Record<string, [string, string]> = {
  "sensor.solar": ["300", "W"],
  // In kW: the window draws watts, as the card reads them (K-8).
  "sensor.import": ["0.5", "kW"],
  "sensor.export": ["100", "W"],
  "sensor.out": ["0", "W"],
  "sensor.in": ["200", "W"],
  "sensor.soc": ["72", "%"],
  "sensor.house": ["400", "W"],
};

/** What the recorder keeps: power from 06:00, the state of charge from 10:00 only. */
const HISTORY: Record<string, [number, string][]> = {
  "sensor.import": [
    [MIDNIGHT + 6 * H, "0.8"],
    [MIDNIGHT + 9 * H, "0"],
  ],
  "sensor.export": [
    [MIDNIGHT + 6 * H, "0"],
    [MIDNIGHT + 10 * H, "1500"],
  ],
  "sensor.out": [[MIDNIGHT + 6 * H, "0"]],
  "sensor.in": [[MIDNIGHT + 6 * H, "900"]],
  "sensor.soc": [
    [MIDNIGHT + 10 * H, "40"],
    [MIDNIGHT + 11 * H, "unavailable"],
    [MIDNIGHT + 12 * H, "70"],
  ],
};

/** Five-minute statistics in watts: start, mean, min, max. */
const FIVE: Record<string, [number, number, number, number][]> = {
  "sensor.import": [
    [MIDNIGHT + 6 * H, 800, 600, 2400],
    [MIDNIGHT + 6 * H + 300_000, 0, 0, 0],
  ],
  "sensor.export": [
    [MIDNIGHT + 6 * H, 0, 0, 0],
    [MIDNIGHT + 10 * H, 1500, 200, 4000],
  ],
};

let asked: Record<string, unknown>[] = [];

function fakeHass(): HomeAssistant {
  const states: HomeAssistant["states"] = {};
  for (const [id, [state, unit]] of Object.entries(STATES)) {
    states[id] = {
      entity_id: id,
      state,
      attributes: { unit_of_measurement: unit },
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
      if (msg.type === "history/history_during_period") {
        const out: Record<string, { s: string; lu: number }[]> = {};
        for (const id of msg.entity_ids as string[]) {
          out[id] = (HISTORY[id] ?? []).map(([t, s]) => ({ s, lu: t / 1000 }));
        }
        return out as never;
      }
      if (msg.type === "recorder/statistics_during_period" && msg.period === "5minute") {
        // Watts whatever the sensor's unit: the recorder converts (units: power W).
        expect(msg.units).toEqual({ power: "W" });
        const out: Record<string, { start: number; mean: number; min: number; max: number }[]> = {};
        for (const id of msg.statistic_ids as string[]) {
          const rows = FIVE[id];
          if (rows) out[id] = rows.map(([start, mean, min, max]) => ({ start, mean, min, max }));
        }
        return out as never;
      }
      if (msg.type === "recorder/statistics_during_period" && msg.period === "hour") {
        const ids = msg.statistic_ids as string[];
        if (!ids.includes("sensor.soc") || ids.length > 1) return {} as never;
        const from = Date.parse(String(msg.start_time));
        const to = Date.parse(String(msg.end_time));
        const rows = [];
        for (let t = from; t < to; t += H) rows.push({ start: t, min: 20, max: 30 });
        return { "sensor.soc": rows } as never;
      }
      return {} as never;
    },
  };
}

type Card = HTMLElement & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
};
type Dialog = HTMLElement & {
  showDialog: (p: unknown) => Promise<void>;
  updateComplete: Promise<unknown>;
};
type Point = [number, number | null] | { value: [number, number] };
type Series = {
  name: string;
  type: string;
  data: Point[];
  stack?: string;
  itemStyle?: { color?: string };
};
type Chart = HTMLElement & {
  data: Series[];
  options: { xAxis: { min: number; max: number } };
};

async function settle(el: { updateComplete: Promise<unknown> }) {
  for (let i = 0; i < 8; i++) {
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
  }
}

async function mount() {
  const el = document.createElement("enerlens-card") as Card;
  el.setConfig(CONFIG);
  el.hass = fakeHass();
  document.body.appendChild(el);
  await settle(el);
  return el;
}

async function open(el: Card, key: string, index = 0) {
  let params: unknown;
  el.addEventListener("show-dialog", (ev) => {
    params = (ev as CustomEvent).detail.dialogParams;
  });
  el.shadowRoot?.querySelectorAll<HTMLElement>(`.node.${key} .hit`)[index]?.click();
  const dialog = document.createElement(DETAIL_NAME) as Dialog;
  document.body.appendChild(dialog);
  await dialog.showDialog(params);
  await settle(dialog);
  return dialog;
}

const text = (e?: Element | null) => (e?.textContent ?? "").replace(/\s+/g, " ").trim();
const chips = (d: Dialog) => [
  ...(d.shadowRoot?.querySelectorAll<HTMLElement>("[role=radio]") ?? []),
];
const chart = (d: Dialog, kind: string) => d.shadowRoot?.querySelector<Chart>(`.chart.${kind}`);
const values = (s: Series) =>
  s.data.map((p) => (Array.isArray(p) ? p[1] : p.value[1])).filter((v) => v !== null) as number[];

beforeAll(async () => {
  fakeMotion();
  (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  if (!customElements.get("ha-chart-base")) {
    customElements.define(
      "ha-chart-base",
      class extends HTMLElement {
        data: unknown;
        options: unknown;
        hass: unknown;
        height: unknown;
      },
    );
  }
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  await import("../src/enerlens-card");
});
afterAll(() => vi.useRealTimers());
describe("the detail window in the power view (REQ DF-4)", () => {
  afterEach(() => {
    asked = [];
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("offers today, 24 h, 48 h and 7 days, starting on 24 h like HA's history", async () => {
    const el = await mount();
    const d = await open(el, "grid");
    expect(chips(d).map((c) => text(c))).toEqual(["Heute", "24 h", "48 h", "7 Tage"]);
    expect(chips(d).map((c) => c.getAttribute("aria-checked"))).toEqual([
      "false",
      "true",
      "false",
      "false",
    ]);
    expect(chart(d, "power")?.options.xAxis.min).toBe(NOW - 24 * H);
    expect(chart(d, "power")?.options.xAxis.max).toBe(NOW);
    // Today: the whole day from midnight, the hours to come empty.
    chips(d)[0].click();
    await settle(d);
    expect(chart(d, "power")?.options.xAxis.min).toBe(MIDNIGHT);
    expect(chart(d, "power")?.options.xAxis.max).toBe(MIDNIGHT + 24 * H);
  });

  it("draws the five-minute means with the band of readings around them, export below zero (DF-4)", async () => {
    const el = await mount();
    const d = await open(el, "grid");
    const c = chart(d, "power");
    expect(c, "HA's chart element").toBeTruthy();
    const named = (name: string) => c?.data.find((s) => s.name === name) as Series;
    expect(values(named("Bezug"))).toEqual([800, 0]);
    expect(values(named("Einspeisung"))).toEqual([0, -1500]);
    // The band: lower edge, then its span, stacked. Mirrored, the lower edge
    // is the largest reading.
    expect(values(named("import-low"))).toEqual([600, 0]);
    expect(values(named("import-span"))).toEqual([1800, 0]);
    expect(values(named("export-low"))).toEqual([0, -4000]);
    expect(values(named("export-span"))).toEqual([0, 3800]);
    expect(named("Bezug").itemStyle?.color).toBe("#488fc2");
    expect(text(d.shadowRoot?.querySelector(".note"))).toBe(
      "5-Minuten-Mittel · Fläche: kleinster bis größter Wert",
    );
    expect(chart(d, "soc"), "no state of charge at the grid").toBeFalsy();
  });

  it("switches to 48 h and leaves the card as it was", async () => {
    const el = await mount();
    const d = await open(el, "grid");
    const before = chart(d, "power");
    chips(d)[2].click();
    await settle(d);
    const c = chart(d, "power");
    // A new element: the old one would morph its points into the new ones (DF-10).
    expect(c).not.toBe(before);
    expect(c?.options.xAxis.min).toBe(NOW - 48 * H);
    expect(c?.options.xAxis.max).toBe(NOW);
    expect(text(el.shadowRoot?.querySelector(".energy-chip .mode-label.active"))).toBe("kW");
  });

  it("names both sides as buttons that open their more-info (DF-9)", async () => {
    const el = await mount();
    const d = await open(el, "grid");
    const seen: string[] = [];
    d.addEventListener("hass-more-info", (ev) => seen.push((ev as CustomEvent).detail.entityId));
    const buttons = [...(d.shadowRoot?.querySelectorAll<HTMLElement>("button.sum") ?? [])];
    expect(buttons.map((b) => text(b))).toEqual(["→ Bezug", "← Einspeisung"]);
    for (const b of buttons) b.click();
    expect(seen).toEqual(["sensor.import", "sensor.export"]);
  });
});

describe("the state of charge below (REQ DF-5)", () => {
  afterEach(() => {
    asked = [];
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("shows the measured states, a gap where one was unavailable", async () => {
    const el = await mount();
    const d = await open(el, "battery");
    const c = chart(d, "soc");
    expect(c, "a chart of its own").toBeTruthy();
    const line = c?.data.find((s) => s.name === "Ladestand");
    expect(line?.data).toContainEqual([MIDNIGHT + 10 * H, 40]);
    expect(line?.data).toContainEqual([MIDNIGHT + 11 * H, null]);
    expect(line?.data.at(-1)).toEqual([NOW, 70]);
    // Same axis as the power chart above.
    expect(c?.options.xAxis.min).toBe(NOW - 24 * H);
    expect(c?.options.xAxis.max).toBe(NOW);
  });

  it("fills the time before the history with a band of hourly min and max, never a mean", async () => {
    const el = await mount();
    const d = await open(el, "battery");
    const band = chart(d, "soc")?.data.filter((s) => s.stack === "band") ?? [];
    expect(band).toHaveLength(2);
    const [low, span] = band;
    // Every hour from 24 h back up to the first state at 10:00.
    const hours = Math.ceil((MIDNIGHT + 10 * H - (NOW - 24 * H)) / H);
    expect(values(low)).toEqual(Array(hours).fill(20));
    expect(values(span)).toEqual(Array(hours).fill(10));
    const stats = asked.find(
      (m) =>
        m.type === "recorder/statistics_during_period" &&
        (m.statistic_ids as string[]).includes("sensor.soc"),
    );
    expect(stats?.types).toEqual(["min", "max"]);
    expect(Date.parse(String(stats?.end_time))).toBe(MIDNIGHT + 10 * H);
  });

  it("opens the state of charge's more-info from its name (DF-9)", async () => {
    const el = await mount();
    const d = await open(el, "battery");
    const seen: string[] = [];
    d.addEventListener("hass-more-info", (ev) => seen.push((ev as CustomEvent).detail.entityId));
    d.shadowRoot?.querySelector<HTMLElement>("button.soc-name")?.click();
    expect(seen).toEqual(["sensor.soc"]);
  });

  it("follows the bars' axis in a period, half a bar wider on each side", async () => {
    const el = await mount();
    el.shadowRoot?.querySelector<HTMLElement>(".energy-chip")?.click();
    await settle(el);
    const d = await open(el, "battery");
    const c = chart(d, "soc");
    expect(c?.options.xAxis.min).toBe(MIDNIGHT - H / 2);
    expect(c?.options.xAxis.max).toBe(MIDNIGHT + 24 * H + H / 2);
  });
});
