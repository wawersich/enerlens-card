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
  "sensor.roof": ["2900", "W"],
  "sensor.balcony": ["100", "W"],
  "sensor.west": ["-300", "W"],
  "sensor.wallbox": ["3700", "W"],
  "sensor.car": ["55", "%"],
  "sensor.plug": ["150", "W"],
  "sensor.car2": ["40", "%"],
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
  "sensor.car": [[MIDNIGHT + 6 * H, "30"]],
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
  // The house, and a balcony plant past its meter that writes no row at night.
  "sensor.house": [
    [MIDNIGHT + 6 * H, 1000, 900, 1500],
    [MIDNIGHT + 6 * H + 300_000, 2000, 1000, 3000],
  ],
  "sensor.house_inv": [
    [MIDNIGHT + 6 * H, -1000, -1500, -900],
    [MIDNIGHT + 6 * H + 300_000, -2000, -3000, -1000],
  ],
  "sensor.balcony": [[MIDNIGHT + 6 * H, 50, 40, 60]],
  "sensor.wallbox": [
    [MIDNIGHT + 6 * H, 3700, 3600, 3800],
    [MIDNIGHT + 6 * H + 300_000, 1000, 0, 3700],
  ],
  "sensor.roof": [
    [MIDNIGHT + 6 * H, 1000, 900, 1100],
    [MIDNIGHT + 6 * H + 300_000, 2000, 1800, 2200],
  ],
  // Mounted the other way round: negative watts, turned by `invert`.
  "sensor.west": [
    [MIDNIGHT + 6 * H, -300, -350, -250],
    [MIDNIGHT + 6 * H + 300_000, -400, -450, -350],
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

async function mount(config: Record<string, unknown> = CONFIG) {
  const el = document.createElement("enerlens-card") as Card;
  el.setConfig(config);
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

describe("the house window: the node's figure as a history (REQ DF-14, DF-17)", () => {
  afterEach(() => {
    asked = [];
    localStorage.clear();
    document.body.innerHTML = "";
  });
  const SOURCES = [{ entity: "sensor.roof" }, { entity: "sensor.balcony", house: "excluded" }];
  const corrected = (house: unknown = "sensor.house") => ({
    ...CONFIG,
    entities: { ...CONFIG.entities, solar: SOURCES, house },
  });

  it("one area: house sensor plus the PV past its meter, a missing balcony row 0", async () => {
    const el = await mount(corrected());
    const d = await open(el, "house");
    expect(text(d.shadowRoot?.querySelector("#title"))).toBe("Haus");
    const series = chart(d, "power")?.data ?? [];
    expect(series.map((s) => s.name)).toEqual(["Haus · berechnet"]);
    expect(values(series[0])).toEqual([1050, 2000]);
    // The sum's line over the area, no band (DF-13, DF-14).
    expect(series[0].stack).toBeUndefined();
    expect(text(d.shadowRoot?.querySelector(".sums"))).toBe("Haus · berechnet");
    // No entity carries the figure: a label, not a link to the raw sensor (DF-14).
    expect(d.shadowRoot?.querySelector(".sums button")).toBeNull();
  });

  it("a house sensor with invert, as the card turns it", async () => {
    const el = await mount(corrected({ entity: "sensor.house_inv", invert: true }));
    const d = await open(el, "house");
    expect(values(chart(d, "power")?.data[0] as Series)).toEqual([1050, 2000]);
  });
});

describe("the PV window: the sources stacked, their sum on top (REQ DF-13, DF-17)", () => {
  afterEach(() => {
    asked = [];
    localStorage.clear();
    document.body.innerHTML = "";
  });
  const SOURCES = [
    { entity: "sensor.roof", name: "Dach" },
    { entity: "sensor.west", name: "West", invert: true },
    { entity: "sensor.balcony", name: "Balkon" },
  ];

  it("one area per source, stacked, a quiet source 0, the sum as a thin line", async () => {
    const el = await mount({ ...CONFIG, entities: { ...CONFIG.entities, solar: SOURCES } });
    const d = await open(el, "solar");
    expect(text(d.shadowRoot?.querySelector("#title"))).toBe("PV");
    const series = chart(d, "power")?.data ?? [];
    expect(series.map((s) => s.name)).toEqual(["Dach", "West", "Balkon", "PV"]);
    const [roof, west, balcony, sum] = series;
    expect(values(roof)).toEqual([1000, 2000]);
    expect(values(west)).toEqual([300, 400]);
    // The balcony wrote no row at 06:05: 0, as the node counts it.
    expect(values(balcony)).toEqual([50, 0]);
    expect(values(sum)).toEqual([1350, 2400]);
    for (const s of [roof, west, balcony]) expect(s.stack).toBe("pv");
    expect(sum.stack).toBeUndefined();
    // Stacked: no band (DF-13).
    expect(series.some((s) => s.name.endsWith("-span"))).toBe(false);
    const heads = [...(d.shadowRoot?.querySelectorAll(".sums > *") ?? [])].map((x) => text(x));
    expect(heads).toEqual(["PV", "Dach", "West", "Balkon"]);
  });
});

describe("a consumer with a state of charge: power and charge in one window (REQ DF-15)", () => {
  afterEach(() => {
    asked = [];
    localStorage.clear();
    document.body.innerHTML = "";
  });
  const WITH_CAR = {
    ...CONFIG,
    consumers: [
      { entity: "sensor.wallbox", name: "Wallbox", charge: { soc: "sensor.car", show: "always" } },
      // Its power has no statistics: more-info instead of an empty window.
      { entity: "sensor.plug", name: "Plug", charge: { soc: "sensor.car2", show: "always" } },
    ],
  };

  async function openRow(el: Card, key: string) {
    let params: unknown;
    el.addEventListener("show-dialog", (ev) => {
      params = (ev as CustomEvent).detail.dialogParams;
    });
    const row = el.shadowRoot?.querySelector<HTMLElement>(`.row[data-key="${key}"] .row-hit`);
    row?.click();
    const dialog = document.createElement(DETAIL_NAME) as Dialog;
    document.body.appendChild(dialog);
    await dialog.showDialog(params);
    await settle(dialog);
    return dialog;
  }

  it("its name as title, its mean with the band, the charge below", async () => {
    const el = await mount(WITH_CAR);
    const d = await openRow(el, "sensor.wallbox");
    expect(text(d.shadowRoot?.querySelector("#title"))).toBe("Wallbox");
    const series = chart(d, "power")?.data ?? [];
    const mean = series.find((s) => s.name === "Wallbox") as Series;
    expect(values(mean)).toEqual([3700, 1000]);
    expect(series.some((s) => s.name.endsWith("-span"))).toBe(true);
    expect(chart(d, "soc")).toBeTruthy();
    expect(text(d.shadowRoot?.querySelector(".soc-name"))).toBe("Ladestand");
  });

  it("no statistics for its power: more-info of the power, no empty window", async () => {
    const el = await mount(WITH_CAR);
    const more: string[] = [];
    el.addEventListener("hass-more-info", (ev) => more.push((ev as CustomEvent).detail.entityId));
    await openRow(el, "sensor.plug");
    expect(more).toEqual(["sensor.plug"]);
  });
});
