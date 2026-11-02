// @vitest-environment happy-dom
/**
 * The detail window in the power view and the state of charge below it
 * (REQ DF-4, DF-5, DF-9): five-minute means with their band, export and
 * charging mirrored below zero, and a min-max band where the history no longer
 * reaches. Invented figures (N-9).
 */
import { render } from "lit";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { DETAIL_NAME } from "../src/const";
import type { HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";

const H = 3_600_000;
const MIN = 60_000;
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
  "sensor.house2": ["2000", "W"],
  "sensor.c1": ["400", "W"],
  "sensor.c2": ["5", "W"],
  "sensor.gridnet": ["500", "W"],
  "sensor.batnet": ["-800", "W"],
  "sensor.pump": ["3.1", "kW"],
  "sensor.imp2": ["0", "W"],
  "sensor.exp2": ["800", "W"],
  "sensor.pv1": ["1200", "W"],
  "sensor.pv2": ["500", "W"],
  "sensor.pv3": ["50", "W"],
  "sensor.c3": ["3000", "W"],
  "sensor.fast": ["100", "W"],
  "sensor.bout": ["300", "W"],
  "sensor.bin": ["0", "W"],
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
  // The live end (DF-22): in kW, switched up after HA's last five minutes.
  "sensor.pump": [
    [MIDNIGHT + 12 * H, "0.6"],
    [NOW - 6 * MIN, "2"],
    [NOW - 3 * MIN, "3.1"],
  ],
  "sensor.imp2": [
    [MIDNIGHT + 12 * H, "500"],
    [NOW - 2 * MIN, "0"],
  ],
  "sensor.exp2": [[NOW - 2 * MIN, "800"]],
  "sensor.bout": [[NOW - 20 * MIN, "300"]],
  "sensor.bin": [[NOW - 20 * MIN, "0"]],
  // pv2 has means but no readings; pv3 readings but no statistics.
  "sensor.pv1": [
    [NOW - 20 * MIN, "1000"],
    [NOW - MIN, "1200"],
  ],
  "sensor.pv3": [[NOW - 20 * MIN, "50"]],
  // Small in its means, a moment's spike in the readings.
  "sensor.c3": [
    [NOW - 20 * MIN, "10"],
    [NOW - 2 * MIN, "3000"],
  ],
  // A reading every second.
  "sensor.fast": Array.from({ length: 240 }, (_, i): [number, string] => [
    NOW - 4 * MIN + i * 1000,
    String(100 + i),
  ]),
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
  // Signed: import / discharge above zero, export / charge below.
  "sensor.gridnet": [
    [MIDNIGHT + 6 * H, 500, 400, 600],
    [MIDNIGHT + 6 * H + 300_000, -300, -400, -200],
  ],
  "sensor.batnet": [
    [MIDNIGHT + 6 * H, -800, -900, -700],
    [MIDNIGHT + 6 * H + 300_000, 400, 300, 500],
  ],
  "sensor.house2": [
    [MIDNIGHT + 6 * H, 1000, 900, 1100],
    [MIDNIGHT + 6 * H + 300_000, 2000, 1900, 2100],
  ],
  "sensor.c1": [
    [MIDNIGHT + 6 * H, 400, 400, 400],
    [MIDNIGHT + 6 * H + 300_000, 600, 600, 600],
  ],
  // Below the threshold, so in the rest: never taken off it.
  "sensor.c2": [
    [MIDNIGHT + 6 * H, 100, 100, 100],
    [MIDNIGHT + 6 * H + 300_000, 100, 100, 100],
  ],
  "sensor.wallbox": [
    [MIDNIGHT + 6 * H, 3700, 3600, 3800],
    [MIDNIGHT + 6 * H + 300_000, 1000, 0, 3700],
  ],
  // Ran yesterday only: in 48 h, not in 24 h (DF-21).
  "sensor.dryer": [[NOW - 30 * H, 2000, 1900, 2100]],
  // Below a watt, then no row: on the log axis' floor, then a gap (DF-21).
  "sensor.idle": [[MIDNIGHT + 6 * H, 0.4, 0.3, 0.5]],
  // HA's last five minutes end at 12:25, five minutes before now (DF-22).
  "sensor.pump": [
    [NOW - 15 * MIN, 600, 590, 610],
    [NOW - 10 * MIN, 650, 600, 700],
  ],
  "sensor.imp2": [
    [NOW - 15 * MIN, 500, 450, 550],
    [NOW - 10 * MIN, 500, 450, 550],
  ],
  "sensor.exp2": [[NOW - 10 * MIN, 0, 0, 0]],
  "sensor.pv1": [[NOW - 10 * MIN, 1000, 900, 1100]],
  "sensor.pv2": [[NOW - 10 * MIN, 500, 400, 600]],
  "sensor.c3": [[NOW - 10 * MIN, 10, 10, 10]],
  "sensor.fast": [[NOW - 10 * MIN, 100, 100, 100]],
  "sensor.bout": [[NOW - 10 * MIN, 300, 250, 350]],
  "sensor.bin": [[NOW - 10 * MIN, 0, 0, 0]],
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
        const from = Date.parse(String(msg.start_time));
        for (const id of msg.statistic_ids as string[]) {
          const rows = FIVE[id]?.filter(([start]) => start >= from);
          if (rows?.length)
            out[id] = rows.map(([start, mean, min, max]) => ({ start, mean, min, max }));
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
type Zoom = { start?: number; end?: number; startValue?: number; endValue?: number };
type Chart = HTMLElement & {
  data: Series[];
  options: { xAxis: { min: number; max: number } };
  window: Zoom;
  asked: Zoom[];
  limit?: [number, number];
  lateEcho: boolean;
  chart: { dispatchAction: (a: Zoom & { type: string }) => void };
  zoom: (start: number, end: number) => void;
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

async function open(el: Card, key: string, index = 0, upper = false) {
  let params: unknown;
  el.addEventListener("show-dialog", (ev) => {
    params = (ev as CustomEvent).detail.dialogParams;
  });
  // The node's own target; the half above it (the battery's charge) on request.
  el.shadowRoot
    ?.querySelectorAll<HTMLElement>(`.node.${key} .hit${upper ? ".upper" : ":not(.upper)"}`)
    [index]?.click();
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
        /** The zoom window as HA's chart keeps it, and what was asked of it. */
        window: Zoom = { start: 0, end: 100 };
        asked: Zoom[] = [];
        /** Its axis, where ECharts cuts a window off (energy mode: half a bar narrower). */
        limit?: [number, number];
        /** Announce the window a moment later instead of at once. */
        lateEcho = false;
        // Like HA's chart: every change of the window is announced, also one
        // set from outside ("silent" does not stop it).
        private _set(w: Zoom) {
          const [lo, hi] = this.limit ?? [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
          const cut = { ...w };
          if (cut.startValue !== undefined)
            cut.startValue = Math.min(hi, Math.max(lo, cut.startValue));
          if (cut.endValue !== undefined) cut.endValue = Math.min(hi, Math.max(lo, cut.endValue));
          this.window = cut;
          this.asked.push(w);
          const announce = () =>
            this.dispatchEvent(
              new CustomEvent("chart-zoom", {
                detail: { start: cut.start ?? 0, end: cut.end ?? 100 },
                bubbles: true,
                composed: true,
              }),
            );
          if (this.lateEcho) setTimeout(announce, 0);
          else announce();
        }
        chart = {
          getOption: () => ({ dataZoom: [this.window] }),
          dispatchAction: (a: Zoom & { type: string }) => {
            const { type: _, ...w } = a;
            this._set(w);
          },
        };
        zoom(start: number, end: number) {
          this._set({ start, end });
        }
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

  it("starts on the range picked last on this card (DF-4, 02.11.2026)", async () => {
    const el = await mount();
    const d = await open(el, "grid");
    chips(d)[2].click();
    await settle(d);
    expect(localStorage.getItem("enerlens-detail-range")).toBe("48h");
    d.remove();
    // One value for all the card's windows: the house opens on 48 h too.
    const again = await open(el, "house");
    expect(chips(again).map((c) => c.getAttribute("aria-checked"))).toEqual([
      "false",
      "false",
      "true",
      "false",
    ]);
    expect(chart(again, "power")?.options.xAxis.min).toBe(NOW - 48 * H);
  });

  it("keeps the range per card with a memory_id", async () => {
    const el = await mount({ ...CONFIG, memory_id: "abc12345" });
    const d = await open(el, "grid");
    chips(d)[0].click();
    await settle(d);
    expect(localStorage.getItem("enerlens-detail-range")).toBeNull();
    const keys = Object.keys(localStorage).filter((k) => k.endsWith(":detail-range"));
    expect(keys).toHaveLength(1);
    expect(keys[0]).toContain("abc12345");
    expect(localStorage.getItem(keys[0])).toBe("today");
  });

  it("starts on 24 h with view.remember: false and stores nothing", async () => {
    localStorage.setItem("enerlens-detail-range", "7d");
    const el = await mount({ ...CONFIG, view: { ...CONFIG.view, remember: false } });
    const d = await open(el, "grid");
    expect(chips(d)[1].getAttribute("aria-checked")).toBe("true");
    chips(d)[2].click();
    await settle(d);
    expect(localStorage.getItem("enerlens-detail-range")).toBe("7d");
  });

  it("ignores a stored value it does not know", async () => {
    localStorage.setItem("enerlens-detail-range", "3d");
    const el = await mount();
    const d = await open(el, "grid");
    expect(chips(d)[1].getAttribute("aria-checked")).toBe("true");
  });

  it("reads the range back from the card's own key with a memory_id", async () => {
    const el = await mount({ ...CONFIG, memory_id: "abc12345" });
    chips(await open(el, "grid"))[0].click();
    await settle(el);
    document.querySelector(DETAIL_NAME)?.remove();
    const again = await open(el, "grid");
    expect(chips(again)[0].getAttribute("aria-checked")).toBe("true");
    // A card without the id keeps its own value.
    const other = await mount();
    expect(chips(await open(other, "grid"))[1].getAttribute("aria-checked")).toBe("true");
  });

  /** HA refuses five-minute figures reaching further back than 30 hours. */
  function refuseLongRanges(el: Card) {
    const hass = fakeHass();
    const ask = hass.callWS;
    el.hass = {
      ...hass,
      callWS: (async (msg: Record<string, unknown>) => {
        if (msg.period === "5minute" && Date.parse(String(msg.start_time)) < NOW - 30 * H) {
          throw new Error("timeout");
        }
        return ask(msg as never);
      }) as HomeAssistant["callWS"],
    };
  }

  it("keeps no range whose figures failed (DF-4, review)", async () => {
    const el = await mount();
    refuseLongRanges(el);
    const d = await open(el, "grid");
    chips(d)[2].click();
    await settle(d);
    // Back on what is shown, and not the next start.
    expect(chips(d)[1].getAttribute("aria-checked")).toBe("true");
    expect(localStorage.getItem("enerlens-detail-range")).toBeNull();
    chips(d)[0].click();
    await settle(d);
    expect(localStorage.getItem("enerlens-detail-range")).toBe("today");
  });

  it("opens on 24 h when the remembered range brings nothing, not on more-info", async () => {
    localStorage.setItem("enerlens-detail-range", "7d");
    const el = await mount();
    refuseLongRanges(el);
    const d = await open(el, "grid");
    expect(chips(d)[1].getAttribute("aria-checked")).toBe("true");
    expect(chart(d, "power")?.options.xAxis.min).toBe(NOW - 24 * H);
  });

  it("leaves the energy mode as it was: the card's period, nothing stored", async () => {
    localStorage.setItem("enerlens-detail-range", "48h");
    const el = await mount({ ...CONFIG, view: { ...CONFIG.view, default_energy: "today" } });
    const d = await open(el, "grid");
    expect(chips(d).map((c) => text(c))).not.toContain("48 h");
    expect(localStorage.getItem("enerlens-detail-range")).toBe("48h");
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
    // Held every five minutes between two readings, so the tooltip finds the
    // state at any time (Markus 02.11.2026); none in a gap.
    expect(line?.data).toContainEqual([MIDNIGHT + 10 * H + 5 * MIN, 40]);
    // Held right up to the gap, not one step short (review).
    expect(line?.data).toContainEqual([MIDNIGHT + 11 * H, 40]);
    expect(line?.data).toContainEqual([MIDNIGHT + 12 * H + 25 * MIN, 70]);
    expect(
      (line?.data as [number, number | null][]).some(
        (p) => p[0] > MIDNIGHT + 11 * H && p[0] < MIDNIGHT + 12 * H,
      ),
    ).toBe(false);
    // Same axis as the power chart above.
    expect(c?.options.xAxis.min).toBe(NOW - 24 * H);
    expect(c?.options.xAxis.max).toBe(NOW);
  });

  it("zooms with the power chart, and back: the curves stay one below the other", async () => {
    const el = await mount();
    const d = await open(el, "battery");
    const power = chart(d, "power") as Chart;
    const soc = chart(d, "soc") as Chart;
    // The user zooms the power chart: the same times, not the same percent.
    const from = NOW - 6 * H;
    power.chart.dispatchAction({
      type: "dataZoom",
      start: 75,
      end: 100,
      startValue: from,
      endValue: NOW,
    });
    expect(soc.window).toMatchObject({ startValue: from, endValue: NOW });
    // At once, not animated: it would trail the zoomed chart.
    expect(soc.window).toMatchObject({ animation: { duration: 0 } });
    // Each chart is set once; the echo of the one set from outside ends there.
    expect(soc.asked).toHaveLength(1);
    expect(power.asked).toHaveLength(1);
    // And the other way round, then back to the whole period.
    soc.chart.dispatchAction({
      type: "dataZoom",
      start: 50,
      end: 75,
      startValue: NOW - 12 * H,
      endValue: from,
    });
    expect(power.window).toMatchObject({ startValue: NOW - 12 * H, endValue: from });
    power.zoom(0, 100);
    expect(soc.window).toMatchObject({ start: 0, end: 100, animation: { duration: 0 } });
  });

  it("a tap on the charge puts it first and large, the power small below (REQ I-2)", async () => {
    const el = await mount();
    const order = (d: Dialog) =>
      [...(d.shadowRoot?.querySelectorAll<Chart & { height?: string }>(".chart") ?? [])].map(
        (c) => `${c.classList.contains("power") ? "power" : "soc"} ${c.height}`,
      );
    const byPower = await open(el, "battery");
    expect(order(byPower)).toEqual(["power 300px", "soc 160px"]);
    const byCharge = await open(el, "battery", 0, true);
    expect(order(byCharge)).toEqual(["soc 300px", "power 160px"]);
    // Large, it is read closely: steps of 10 %, small 0 · 25 · 50 · 75 · 100.
    const interval = (d: Dialog) =>
      (chart(d, "soc")?.options as unknown as { yAxis: { interval?: number } }).yAxis.interval;
    expect(interval(byCharge)).toBe(10);
    expect(interval(byPower)).toBe(25);
    // Its name stays the way to its more-info, above it (DF-9).
    const first = byCharge.shadowRoot?.querySelector(".charts > *");
    expect(first?.classList.contains("soc-name")).toBe(true);
  });

  it("the charge first but not to be had: the power alone and large (REQ I-2)", async () => {
    const el = await mount();
    const real = el.hass.callWS;
    el.hass = {
      ...el.hass,
      callWS: async (msg: Record<string, unknown>) => {
        const ids = [
          ...((msg.entity_ids as string[]) ?? []),
          ...((msg.statistic_ids as string[]) ?? []),
        ];
        // The window's hourly charge fails; the card's own calls go through.
        if (ids.includes("sensor.soc") && msg.period === "hour") throw new Error("recorder away");
        return real(msg as never);
      },
    } as HomeAssistant;
    await settle(el);
    const d = await open(el, "battery", 0, true);
    const charts = [
      ...(d.shadowRoot?.querySelectorAll<Chart & { height?: string }>(".chart") ?? []),
    ];
    expect(
      charts.map((c) => `${c.classList.contains("power") ? "power" : "soc"} ${c.height}`),
    ).toEqual(["power 300px"]);
    expect(d.shadowRoot?.querySelector(".loading")).toBeNull();
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
    expect(series.map((s) => s.name)).toEqual(["Haus"]);
    expect(values(series[0])).toEqual([1050, 2000]);
    // The sum's line over the area, no band (DF-13, DF-14).
    expect(series[0].stack).toBeUndefined();
    expect(text(d.shadowRoot?.querySelector(".sums"))).toBe("Haus");
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

  describe("zoom with two values below (DF-5)", () => {
    const TWO = {
      ...CONFIG,
      consumers: [
        {
          entity: "sensor.wallbox",
          name: "Wallbox",
          indicators: { ring: { entity: "sensor.car" }, bar_top: { entity: "sensor.soc" } },
        },
      ],
    };
    const charts = (d: Dialog) => [
      ...(d.shadowRoot?.querySelectorAll<Chart>(".chart.power, .chart.soc") ?? []),
    ];

    it("a chart that cuts the window off does not move the one being zoomed", async () => {
      const el = await mount(TWO);
      const d = await openRow(el, "sensor.wallbox");
      const [power, first, second] = charts(d);
      expect(second, "two values below the power").toBeTruthy();
      // As in the energy mode: the power axis half a bar narrower.
      power.limit = [NOW - 20 * H, NOW];
      first.chart.dispatchAction({
        type: "dataZoom",
        start: 0,
        end: 50,
        startValue: NOW - 24 * H,
        endValue: NOW - 12 * H,
      });
      expect(power.window).toMatchObject({ startValue: NOW - 20 * H, endValue: NOW - 12 * H });
      expect(second.window).toMatchObject({ startValue: NOW - 24 * H, endValue: NOW - 12 * H });
      // The power chart's echo (cut off, so different) is not passed back.
      expect(first.asked).toHaveLength(1);
      expect(first.window).toMatchObject({ startValue: NOW - 24 * H });
    });

    it("an echo that comes late ends at the charts already there", async () => {
      const el = await mount(TWO);
      const d = await openRow(el, "sensor.wallbox");
      const all = charts(d);
      for (const c of all) c.lateEcho = true;
      const [power] = all;
      power.chart.dispatchAction({
        type: "dataZoom",
        start: 75,
        end: 100,
        startValue: NOW - 6 * H,
        endValue: NOW,
      });
      for (let i = 0; i < 6; i++) await new Promise((r) => setTimeout(r, 0));
      expect(all.map((c) => c.asked.length)).toEqual([1, 1, 1]);
      for (const c of all)
        expect(c.window).toMatchObject({ startValue: NOW - 6 * H, endValue: NOW });
    });
  });

  it("the charge chart under its own label (issue #31)", async () => {
    const el = await mount({
      ...CONFIG,
      consumers: [
        {
          entity: "sensor.wallbox",
          name: "Drucker",
          charge: { soc: "sensor.car", show: "always", label: "Druckfortschritt" },
        },
      ],
    });
    const d = await openRow(el, "sensor.wallbox");
    expect(text(d.shadowRoot?.querySelector(".soc-name"))).toBe("Druckfortschritt");
  });

  it("no statistics for its power: more-info of the power, no empty window", async () => {
    const el = await mount(WITH_CAR);
    const more: string[] = [];
    el.addEventListener("hass-more-info", (ev) => more.push((ev as CustomEvent).detail.entityId));
    await openRow(el, "sensor.plug");
    expect(more).toEqual(["sensor.plug"]);
  });
});

describe("the rest: the house minus the consumers shown, as its row (REQ DF-18)", () => {
  afterEach(() => {
    asked = [];
    localStorage.clear();
    document.body.innerHTML = "";
  });
  const WITH_REST = {
    ...CONFIG,
    entities: { ...CONFIG.entities, house: "sensor.house2" },
    consumers: [
      { entity: "sensor.c1", name: "Eins" },
      { entity: "sensor.c2", name: "Klein" },
    ],
  };

  it("one line: house minus the shown consumer only, the label without a link", async () => {
    const el = await mount(WITH_REST);
    let params: unknown;
    el.addEventListener("show-dialog", (ev) => {
      params = (ev as CustomEvent).detail.dialogParams;
    });
    el.shadowRoot?.querySelector<HTMLElement>(".row.rest .row-hit")?.click();
    expect((params as { node: string }).node).toBe("rest");
    const d = document.createElement(DETAIL_NAME) as Dialog;
    document.body.appendChild(d);
    await d.showDialog(params);
    await settle(d);
    expect(text(d.shadowRoot?.querySelector("#title"))).toBe("Rest");
    const series = chart(d, "power")?.data ?? [];
    expect(series.map((s) => s.name)).toEqual(["Rest"]);
    expect(values(series[0])).toEqual([600, 1400]);
    expect(d.shadowRoot?.querySelector(".sums button")).toBeNull();
  });

  it("no rest window with a derived house: the row stays without a target", async () => {
    const el = await mount({ ...WITH_REST, entities: { ...WITH_REST.entities, house: "derived" } });
    expect(el.shadowRoot?.querySelector(".row.rest .row-hit")).toBeNull();
  });
});

describe("every row opens its window (REQ DF-19)", () => {
  afterEach(() => {
    asked = [];
    localStorage.clear();
    document.body.innerHTML = "";
  });

  async function openRow(el: Card, selector: string) {
    let params: unknown;
    el.addEventListener("show-dialog", (ev) => {
      params = (ev as CustomEvent).detail.dialogParams;
    });
    el.shadowRoot?.querySelector<HTMLElement>(selector)?.click();
    const dialog = document.createElement(DETAIL_NAME) as Dialog;
    document.body.appendChild(dialog);
    await dialog.showDialog(params);
    await settle(dialog);
    return dialog;
  }

  it("a consumer without a charge: its mean and band, no charge below", async () => {
    const el = await mount({
      ...CONFIG,
      entities: { ...CONFIG.entities, house: "sensor.house2" },
      consumers: [{ entity: "sensor.c1", name: "Eins" }],
    });
    const d = await openRow(el, '.row[data-key="sensor.c1"] .row-hit');
    expect(text(d.shadowRoot?.querySelector("#title"))).toBe("Eins");
    const mean = (chart(d, "power")?.data ?? []).find((s) => s.name === "Eins") as Series;
    expect(values(mean)).toEqual([400, 600]);
    expect(chart(d, "soc")).toBeFalsy();
  });

  it("a PV source, turned by its invert as the node turns it", async () => {
    const el = await mount({
      ...CONFIG,
      entities: {
        ...CONFIG.entities,
        solar: [
          { entity: "sensor.roof", name: "Dach" },
          { entity: "sensor.west", name: "West", invert: true },
        ],
      },
      list: { solar: true },
    });
    const d = await openRow(el, '.row.pv[data-key="sensor.west"] .row-hit');
    expect(text(d.shadowRoot?.querySelector("#title"))).toBe("West");
    const series = chart(d, "power")?.data ?? [];
    const mean = series.find((s) => s.name === "West") as Series;
    expect(values(mean)).toEqual([300, 400]);
    // The band turned too: the largest reading becomes the smallest.
    expect(values(series.find((s) => s.name === "solar-low") as Series)).toEqual([250, 350]);
    expect(values(series.find((s) => s.name === "solar-span") as Series)).toEqual([100, 100]);
  });
});

describe("every node opens its window, one entity or not (REQ DF-20)", () => {
  afterEach(() => {
    asked = [];
    localStorage.clear();
    document.body.innerHTML = "";
  });
  const mean = (d: Dialog, name: string) =>
    values((chart(d, "power")?.data ?? []).find((s) => s.name === name) as Series);

  it("a house that is its sensor: one series with its band", async () => {
    const el = await mount();
    const d = await open(el, "house");
    expect(text(d.shadowRoot?.querySelector("#title"))).toBe("Haus");
    expect(mean(d, "Haus")).toEqual([1000, 2000]);
    expect((chart(d, "power")?.data ?? []).some((s) => s.name.endsWith("-span"))).toBe(true);
  });

  it("a grid with one signed sensor: in its sign, export below zero", async () => {
    const el = await mount({ ...CONFIG, entities: { ...CONFIG.entities, grid: "sensor.gridnet" } });
    const d = await open(el, "grid");
    expect(text(d.shadowRoot?.querySelector("#title"))).toBe("Netz");
    expect(mean(d, "Netz")).toEqual([500, -300]);
  });

  it("a battery with one signed sensor: one target, discharge above, the charge below", async () => {
    const el = await mount({
      ...CONFIG,
      entities: { ...CONFIG.entities, battery: "sensor.batnet" },
    });
    expect(el.shadowRoot?.querySelectorAll(".node.battery .hit")).toHaveLength(2);
    const d = await open(el, "battery");
    expect(mean(d, "Batterie")).toEqual([-800, 400]);
    expect(chart(d, "soc")).toBeTruthy();
  });
});

describe("the house with its consumers (REQ DF-21)", () => {
  afterEach(() => {
    asked = [];
    localStorage.clear();
    document.body.innerHTML = "";
  });
  const WITH = {
    ...CONFIG,
    consumers: [
      { entity: "sensor.c1", name: "Herd" },
      // Ran, but never up to its own threshold: not picked.
      { entity: "sensor.c2", name: "Lampe", min_w: 200 },
      // No statistics at all: not picked.
      { entity: "sensor.plug", name: "Stecker" },
      { entity: "sensor.dryer", name: "Trockner" },
      { entity: "sensor.idle", name: "Standby" },
    ],
  };
  type Axis = {
    type?: string;
    min?: number | ((v: { min: number; max: number }) => number);
    axisLabel?: { formatter?: (v: number) => string };
  };
  const toggle = (d: Dialog, key: string) =>
    d.shadowRoot?.querySelector<HTMLElement>(`button.toggle[data-toggle="${key}"]`);
  const pick = (d: Dialog, key: string) =>
    d.shadowRoot?.querySelector<HTMLElement>(`.picks button[data-key="${key}"]`);
  const names = (d: Dialog) => (chart(d, "power")?.data ?? []).map((s) => s.name);
  const series = (d: Dialog, name: string) =>
    chart(d, "power")?.data.find((s) => s.name === name) as Series & {
      areaStyle?: unknown;
      lineStyle?: { width?: number };
    };
  const yAxis = (d: Dialog) => (chart(d, "power")?.options as unknown as { yAxis: Axis }).yAxis;

  it("opens as before, the consumers one tap away", async () => {
    const el = await mount(WITH);
    const d = await open(el, "house");
    expect(toggle(d, "consumers")?.getAttribute("aria-pressed")).toBe("false");
    expect(toggle(d, "log"), "log only with the consumers").toBeFalsy();
    expect(pick(d, "sensor.c1")).toBeFalsy();
    expect(names(d)).toContain("Haus");
    expect(names(d)).not.toContain("Herd");
  });

  it("each consumer a line of its own, not stacked; picked is who ran; the rest as its row", async () => {
    const el = await mount(WITH);
    const d = await open(el, "house");
    toggle(d, "consumers")?.click();
    await settle(d);
    expect(toggle(d, "consumers")?.getAttribute("aria-pressed")).toBe("true");
    const ids = asked
      .filter((m) => m.period === "5minute")
      .flatMap((m) => m.statistic_ids as string[]);
    expect(ids).toEqual(expect.arrayContaining(["sensor.c1", "sensor.c2", "sensor.plug"]));
    expect(pick(d, "sensor.c1")?.getAttribute("aria-pressed")).toBe("true");
    expect(pick(d, "sensor.c2")?.getAttribute("aria-pressed")).toBe("false");
    expect(pick(d, "sensor.plug")?.getAttribute("aria-pressed")).toBe("false");
    expect(pick(d, "rest")?.getAttribute("aria-pressed")).toBe("true");
    expect(names(d)).toEqual(expect.arrayContaining(["Haus", "Herd", "Rest"]));
    expect(names(d)).not.toContain("Lampe");
    const herd = series(d, "Herd");
    expect(values(herd)).toEqual([400, 600]);
    expect(herd.stack).toBeUndefined();
    expect(herd.areaStyle).toBeUndefined();
    // The house the strongest line, without its band among the consumers.
    expect(series(d, "Haus").lineStyle?.width).toBeGreaterThan(herd.lineStyle?.width ?? 0);
    expect(names(d).some((n) => n.endsWith("-span"))).toBe(false);
    // The rest: the house minus what the list shows (DF-18).
    const state = (el as unknown as { detailState: () => { shown: string[] } }).detailState();
    const minus = (k: number) =>
      state.shown.reduce((sum, id) => sum + (FIVE[id]?.[k]?.[1] ?? 0), 0);
    expect(values(series(d, "Rest"))).toEqual([1000 - minus(0), 2000 - minus(1)]);
  });

  it("picks by hand, all and none; a period rebuilds the picks until one picks by hand", async () => {
    const el = await mount(WITH);
    const d = await open(el, "house");
    toggle(d, "consumers")?.click();
    await settle(d);
    pick(d, "sensor.c2")?.click();
    await settle(d);
    expect(names(d)).toContain("Lampe");
    d.shadowRoot?.querySelector<HTMLElement>(".picks button.none")?.click();
    await settle(d);
    expect(names(d)).toEqual(["Haus"]);
    d.shadowRoot?.querySelector<HTMLElement>(".picks button.all")?.click();
    await settle(d);
    expect(names(d)).toEqual(expect.arrayContaining(["Haus", "Herd", "Lampe", "Stecker", "Rest"]));
    // Picked by hand: another period keeps them.
    chips(d)[2].click();
    await settle(d);
    expect(pick(d, "sensor.c2")?.getAttribute("aria-pressed")).toBe("true");
  });

  it("a period rebuilds the picks while nobody picked", async () => {
    const el = await mount(WITH);
    const d = await open(el, "house");
    toggle(d, "consumers")?.click();
    await settle(d);
    // The dryer ran yesterday: not in 24 h, picked in 48 h.
    expect(pick(d, "sensor.dryer")?.getAttribute("aria-pressed")).toBe("false");
    chips(d)[2].click();
    await settle(d);
    expect(pick(d, "sensor.dryer")?.getAttribute("aria-pressed")).toBe("true");
    expect(pick(d, "sensor.c1")?.getAttribute("aria-pressed")).toBe("true");
    expect(pick(d, "sensor.c2")?.getAttribute("aria-pressed")).toBe("false");
  });

  it("the tooltip: the house in bold, then the picked ones by size, as measured", async () => {
    const el = await mount(WITH);
    const d = await open(el, "house");
    toggle(d, "consumers")?.click();
    await settle(d);
    const tip = (
      chart(d, "power")?.options as unknown as {
        tooltip: { formatter: (p: unknown) => unknown };
      }
    ).tooltip.formatter([{ value: [MIDNIGHT + 6 * H, 0], axisValueLabel: "06:00" }]);
    const box = document.createElement("div");
    render(tip as never, box);
    const lines = box.innerHTML.replace(/<!--[^>]*-->/g, "").split("<br>");
    expect(lines[1]).toMatch(/^<b>Haus: /);
    const names = lines.slice(2).map((l) => l.split(":")[0]);
    // By size: the rest (1000 W less the shown 400 W) before the stove's 400 W.
    expect(names.slice(0, 2)).toEqual(["Rest", "Herd"]);
  });

  it("log: from 1 W, that line called 0 W, anything below on it", async () => {
    const el = await mount(WITH);
    const d = await open(el, "house");
    toggle(d, "consumers")?.click();
    await settle(d);
    expect(yAxis(d).type ?? "value").toBe("value");
    // Linear: down only to the lowest reading, not a rounded -1000 W.
    const min = yAxis(d).min as (v: { min: number; max: number }) => number;
    expect(min({ min: -9, max: 2000 })).toBe(-9);
    expect(min({ min: 5, max: 2000 })).toBe(0);
    toggle(d, "log")?.click();
    await settle(d);
    expect(toggle(d, "log")?.getAttribute("aria-pressed")).toBe("true");
    expect(yAxis(d).type).toBe("log");
    expect(yAxis(d).min).toBe(1);
    // Written as the card writes power, "0 W" or "0,00 kW" by the unit setting.
    expect(yAxis(d).axisLabel?.formatter?.(1)).toMatch(/^0(,0+)? k?W$/);
    d.shadowRoot?.querySelector<HTMLElement>(".picks button.all")?.click();
    await settle(d);
    // Nothing below 1 W is drawn below the axis.
    for (const s of chart(d, "power")?.data ?? []) {
      for (const v of values(s)) expect(v).toBeGreaterThanOrEqual(1);
    }
    // 0.4 W lies on the floor; where it has no row, a gap stays a gap.
    const idle = series(d, "Standby").data.map((p) => (Array.isArray(p) ? p : p.value));
    expect(idle).toContainEqual([MIDNIGHT + 6 * H, 1]);
    expect(idle).toContainEqual([MIDNIGHT + 6 * H + 300_000, null]);
  });

  it("a mouse on a pick lifts its line; a finger or the chart itself fades nothing", async () => {
    const el = await mount(WITH);
    const d = await open(el, "house");
    toggle(d, "consumers")?.click();
    await settle(d);
    type Styled = Series & { lineStyle?: { opacity?: number }; emphasis?: { disabled?: boolean } };
    const opacity = (name: string) => (series(d, name) as Styled).lineStyle?.opacity;
    // ECharts' own emphasis is off: a finger over the chart only shows the tooltip.
    for (const s of chart(d, "power")?.data ?? []) {
      expect((s as Styled).emphasis?.disabled).toBe(true);
    }
    const herd = pick(d, "sensor.c1") as HTMLElement;
    herd.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "touch" }));
    await settle(d);
    expect(opacity("Rest")).toBe(1);
    herd.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
    await settle(d);
    expect(opacity("Rest")).toBeLessThan(1);
    expect(opacity("Herd")).toBe(1);
    herd.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
    await settle(d);
    expect(opacity("Rest")).toBe(1);
  });

  it("pointing at a line that is not drawn fades nothing", async () => {
    const el = await mount(WITH);
    const d = await open(el, "house");
    toggle(d, "consumers")?.click();
    await settle(d);
    pick(d, "sensor.c2")?.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
    await settle(d);
    const opacity = (name: string) =>
      (series(d, name) as Series & { lineStyle?: { opacity?: number } }).lineStyle?.opacity;
    expect(opacity("Haus")).toBe(1);
    expect(opacity("Herd")).toBe(1);
  });

  it("says mean only, no band, among the consumers", async () => {
    const el = await mount(WITH);
    const d = await open(el, "house");
    expect(text(d.shadowRoot?.querySelector(".note"))).toMatch(/Fläche/);
    toggle(d, "consumers")?.click();
    await settle(d);
    expect(text(d.shadowRoot?.querySelector(".note"))).not.toMatch(/Fläche/);
  });

  it("a corrected house: its line and the rest with the PV past its meter (PV-3, DF-18)", async () => {
    const el = await mount({
      ...WITH,
      entities: {
        ...CONFIG.entities,
        solar: [
          { entity: "sensor.roof", name: "Dach" },
          { entity: "sensor.balcony", name: "Balkon", house: "excluded" },
        ],
      },
    });
    const d = await open(el, "house");
    toggle(d, "consumers")?.click();
    await settle(d);
    // 1000 + 50 W at 06:00; the balcony wrote no row at 06:05: 0.
    expect(values(series(d, "Haus"))).toEqual([1050, 2000]);
    const state = (el as unknown as { detailState: () => { shown: string[] } }).detailState();
    const minus = (k: number) =>
      state.shown.reduce((sum, id) => sum + (FIVE[id]?.[k]?.[1] ?? 0), 0);
    expect(values(series(d, "Rest"))).toEqual([1050 - minus(0), 2000 - minus(1)]);
  });

  it("not in the energy view, not at the grid", async () => {
    const el = await mount(WITH);
    const g = await open(el, "grid");
    expect(toggle(g, "consumers")).toBeFalsy();
  });
});

describe("the live end: readings after HA's last five minutes (REQ DF-22)", () => {
  afterEach(() => {
    asked = [];
    localStorage.clear();
    document.body.innerHTML = "";
  });
  const PUMP = { ...CONFIG, consumers: [{ entity: "sensor.pump", name: "Pumpe" }] };
  const T = (s: Series) => s.data.map((p) => (Array.isArray(p) ? p[0] : p.value[0]));
  const Y = (s: Series) => s.data.map((p) => (Array.isArray(p) ? p[1] : p.value[1]));

  async function openRow(el: Card, key: string) {
    let params: unknown;
    el.addEventListener("show-dialog", (ev) => {
      params = (ev as CustomEvent).detail.dialogParams;
    });
    el.shadowRoot?.querySelector<HTMLElement>(`.row[data-key="${key}"] .row-hit`)?.click();
    const dialog = document.createElement(DETAIL_NAME) as Dialog;
    document.body.appendChild(dialog);
    await dialog.showDialog(params);
    await settle(dialog);
    return dialog;
  }

  it("goes on from the last five minutes with the readings, in watts, up to now", async () => {
    const el = await mount(PUMP);
    const d = await openRow(el, "sensor.pump");
    const series = chart(d, "power")?.data ?? [];
    const mean = series.find((s) => s.name === "Pumpe") as Series;
    // The means, then from 12:25 each reading held until the next, then now.
    expect(T(mean)).toEqual([NOW - 15 * MIN, NOW - 10 * MIN, NOW - 5 * MIN, NOW - 3 * MIN, NOW]);
    expect(Y(mean)).toEqual([600, 650, 2000, 3100, 3100]);
    // No band where there is no smallest and largest reading.
    const span = series.find((s) => s.name.endsWith("-span")) as Series;
    expect(Y(span).slice(2)).toEqual([null, null, null]);
    expect(asked.filter((m) => m.type === "history/history_during_period")).toHaveLength(1);
  });

  it("names a reading as such in the tooltip, a mean as before", async () => {
    const el = await mount(PUMP);
    const d = await openRow(el, "sensor.pump");
    const c = chart(d, "power");
    const tip = (c?.options as unknown as { tooltip: { formatter: (p: unknown) => unknown } })
      .tooltip.formatter;
    const at = (t: number) => {
      const box = document.createElement("div");
      const points = (c?.data ?? []).map((s) => ({
        seriesName: s.name,
        value: (s.data as [number, number | null][]).find((p) => p[0] === t) ?? [t, null],
        axisValueLabel: "T",
      }));
      render(tip(points) as never, box);
      return text(box);
    };
    expect(at(NOW - 3 * MIN)).toBe("T · MesswertPumpe: 3,10 kW");
    expect(at(NOW - 10 * MIN)).toBe("TPumpe: 0,65 kW (0,60 kW – 0,70 kW)");
    expect(at(NOW - 10 * MIN)).not.toContain("Messwert");
  });

  it("lines a mirrored pair up on common moments, an unknown reading a gap", async () => {
    const el = await mount({
      ...CONFIG,
      entities: { ...CONFIG.entities, grid: { import: "sensor.imp2", export: "sensor.exp2" } },
    });
    const d = await open(el, "grid");
    const series = chart(d, "power")?.data ?? [];
    const imp = series.find((s) => s.name === "Bezug") as Series;
    const exp = series.find((s) => s.name === "Einspeisung") as Series;
    expect(T(imp).slice(-3)).toEqual([NOW - 5 * MIN, NOW - 2 * MIN, NOW]);
    expect(T(exp).slice(-3)).toEqual([NOW - 5 * MIN, NOW - 2 * MIN, NOW]);
    expect(Y(imp).slice(-3)).toEqual([500, 0, 0]);
    expect(Y(exp).slice(-3)).toEqual([null, -800, -800]);
  });

  it("not when HA's last five minutes lie further back: a quiet sensor, not a lag", async () => {
    const el = await mount();
    const d = await open(el, "grid");
    const imp = (chart(d, "power")?.data ?? []).find((s) => s.name === "Bezug") as Series;
    expect(values(imp)).toEqual([800, 0]);
  });

  it("the means alone when the history fails", async () => {
    const el = await mount(PUMP);
    const hass = fakeHass();
    const ask = hass.callWS;
    el.hass = {
      ...hass,
      callWS: (async (msg: Record<string, unknown>) => {
        if (msg.type === "history/history_during_period") throw new Error("recorder away");
        return ask(msg as never);
      }) as HomeAssistant["callWS"],
    };
    const d = await openRow(el, "sensor.pump");
    const mean = (chart(d, "power")?.data ?? []).find((s) => s.name === "Pumpe") as Series;
    expect(Y(mean)).toEqual([600, 650]);
  });

  it("stacks the readings; a source without one a gap, never a made-up 0 (review)", async () => {
    const el = await mount({
      ...CONFIG,
      entities: {
        ...CONFIG.entities,
        solar: [
          { entity: "sensor.pv1", name: "Dach" },
          { entity: "sensor.pv2", name: "Garage" },
          { entity: "sensor.pv3", name: "Balkon" },
        ],
      },
    });
    const d = await open(el, "solar");
    const series = chart(d, "power")?.data ?? [];
    const of = (name: string) => series.find((s) => s.name === name) as Series;
    expect(T(of("Dach")).slice(-3)).toEqual([NOW - 5 * MIN, NOW - MIN, NOW]);
    expect(Y(of("Dach")).slice(-3)).toEqual([1000, 1200, 1200]);
    // Means, but no reading: a gap, and so is the sum.
    expect(Y(of("Garage"))).toEqual([500, null, null, null]);
    // No statistics, so no live end: 0 as a quiet source, as before.
    expect(Y(of("Balkon"))).toEqual([0, 0, 0, 0]);
    expect(
      Y(
        series.find(
          (s) => s.name !== "Dach" && s.name !== "Garage" && s.name !== "Balkon",
        ) as Series,
      ),
    ).toEqual([1500, null, null, null]);
    const tip = (
      chart(d, "power")?.options as unknown as {
        tooltip: { formatter: (p: unknown) => unknown };
      }
    ).tooltip.formatter;
    const box = document.createElement("div");
    render(
      tip([
        { seriesName: "Dach", value: [NOW - MIN, 1200], axisValue: NOW - MIN, axisValueLabel: "T" },
      ]) as never,
      box,
    );
    expect(text(box)).toContain("Messwert");
  });

  it("gives a sensor without statistics no live end of its own", async () => {
    const el = await mount({
      ...CONFIG,
      consumers: [
        { entity: "sensor.pump", name: "Pumpe" },
        { entity: "sensor.pv3", name: "Ohne" },
      ],
    });
    const d = await open(el, "house");
    d.shadowRoot?.querySelector<HTMLElement>('button.toggle[data-toggle="consumers"]')?.click();
    await settle(d);
    const pump = (chart(d, "power")?.data ?? []).find((s) => s.name === "Pumpe") as Series;
    expect(Y(pump).at(-1)).toBe(3100);
    const lines = (d as unknown as { _lines: { id: string }[] })._lines.map((l) => l.id);
    expect(lines).toContain("sensor.pv3");
    const ohne = (chart(d, "power")?.data ?? []).find((s) => s.name === "Ohne") as
      | Series
      | undefined;
    expect(ohne ? values(ohne) : []).toEqual([]);
  });

  it("picks a consumer by its means, not by a moment's reading (review)", async () => {
    const el = await mount({
      ...CONFIG,
      consumers: [{ entity: "sensor.c3", name: "Kurz", min_w: 100 }],
    });
    const d = await open(el, "house");
    d.shadowRoot?.querySelector<HTMLElement>('button.toggle[data-toggle="consumers"]')?.click();
    await settle(d);
    expect(
      d.shadowRoot
        ?.querySelector('.picks button[data-key="sensor.c3"]')
        ?.getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("thins a sensor read every second to one moment per ten seconds", async () => {
    const el = await mount({ ...CONFIG, consumers: [{ entity: "sensor.fast", name: "Schnell" }] });
    const d = await openRow(el, "sensor.fast");
    const mean = (chart(d, "power")?.data ?? []).find((s) => s.name === "Schnell") as Series;
    const tail = T(mean).filter((t) => t >= NOW - 5 * MIN);
    expect(tail.length).toBeLessThanOrEqual(4 * 6 + 2);
    expect(tail.at(-1)).toBe(NOW);
    // Each one a reading as measured: the last one, 339 W, up to now.
    expect(Y(mean).at(-1)).toBe(339);
  });

  it("grows while open: each new state on the end, at most every ten seconds", async () => {
    const el = await mount(PUMP);
    const d = (await openRow(el, "sensor.pump")) as Dialog & { hass?: HomeAssistant };
    const hassWith = (pump: string) => {
      const hass = fakeHass();
      hass.states["sensor.pump"] = { ...hass.states["sensor.pump"], state: pump };
      return hass;
    };
    const pump = () => (chart(d, "power")?.data ?? []).find((s) => s.name === "Pumpe") as Series;
    try {
      vi.setSystemTime(NOW + 11_000);
      d.hass = hassWith("4");
      await settle(d);
      expect(T(pump()).at(-1)).toBe(NOW + 11_000);
      expect(Y(pump()).at(-1)).toBe(4000);
      // The axis along up to now.
      expect(chart(d, "power")?.options.xAxis.max).toBe(NOW + 11_000);
      // Not again within ten seconds.
      vi.setSystemTime(NOW + 15_000);
      d.hass = hassWith("5");
      await settle(d);
      expect(Y(pump()).at(-1)).toBe(4000);
      vi.setSystemTime(NOW + 22_000);
      d.hass = hassWith("unavailable");
      await settle(d);
      expect(T(pump()).at(-1)).toBe(NOW + 22_000);
      expect(Y(pump()).at(-1)).toBeNull();
    } finally {
      vi.setSystemTime(NOW);
    }
  });

  it("does not grow without a live end", async () => {
    const el = await mount();
    const d = (await open(el, "grid")) as Dialog & { hass?: HomeAssistant };
    const before = (chart(d, "power")?.data ?? []).map((s) => s.data.length);
    try {
      vi.setSystemTime(NOW + 60_000);
      d.hass = fakeHass();
      await settle(d);
      expect((chart(d, "power")?.data ?? []).map((s) => s.data.length)).toEqual(before);
    } finally {
      vi.setSystemTime(NOW);
    }
  });

  it("puts a change at the time HA took it, and holds it up to now (review)", async () => {
    const el = await mount(PUMP);
    const d = (await openRow(el, "sensor.pump")) as Dialog & { hass?: HomeAssistant };
    const pump = () => (chart(d, "power")?.data ?? []).find((s) => s.name === "Pumpe") as Series;
    try {
      vi.setSystemTime(NOW + 11_000);
      const hass = fakeHass();
      hass.states["sensor.pump"] = {
        ...hass.states["sensor.pump"],
        state: "4",
        last_updated: new Date(NOW + 5_000).toISOString(),
      };
      d.hass = hass;
      await settle(d);
      // The old "now" gave way: the change at 12:30:05, held up to 12:30:11.
      expect(T(pump()).slice(-3)).toEqual([NOW - 3 * MIN, NOW + 5_000, NOW + 11_000]);
      expect(Y(pump()).slice(-3)).toEqual([3100, 4000, 4000]);
    } finally {
      vi.setSystemTime(NOW);
    }
  });

  it("keeps today's axis at midnight while it grows", async () => {
    localStorage.setItem("enerlens-detail-range", "today");
    const el = await mount(PUMP);
    const d = (await openRow(el, "sensor.pump")) as Dialog & { hass?: HomeAssistant };
    try {
      vi.setSystemTime(NOW + 11_000);
      d.hass = fakeHass();
      await settle(d);
      expect(chart(d, "power")?.options.xAxis.max).toBe(MIDNIGHT + 24 * H);
    } finally {
      vi.setSystemTime(NOW);
    }
  });

  it("grows the state of charge below with the power, a new reading in its place", async () => {
    const el = await mount({
      ...CONFIG,
      entities: { ...CONFIG.entities, battery: { discharge: "sensor.bout", charge: "sensor.bin" } },
    });
    const d = (await open(el, "battery")) as Dialog & { hass?: HomeAssistant };
    const soc = () => chart(d, "soc")?.data.find((s) => s.name === "Ladestand") as Series;
    try {
      vi.setSystemTime(NOW + 6 * MIN);
      const hass = fakeHass();
      hass.states["sensor.soc"] = {
        ...hass.states["sensor.soc"],
        state: "71",
        last_updated: new Date(NOW + 2 * MIN).toISOString(),
      };
      d.hass = hass;
      await settle(d);
      const data = soc().data as [number, number | null][];
      // 70 held up to the new reading, 71 from then on, up to now.
      expect(data.filter((p) => p[0] >= NOW)).toEqual([
        [NOW, 70],
        [NOW + 2 * MIN, 71],
        [NOW + 5 * MIN, 71],
        [NOW + 6 * MIN, 71],
      ]);
      expect(chart(d, "soc")?.options.xAxis.max).toBe(NOW + 6 * MIN);
      // Ticks off the grid leave no trail of held points behind (review).
      for (const later of [6 * MIN + 17_000, 6 * MIN + 31_000, 6 * MIN + 45_000]) {
        vi.setSystemTime(NOW + later);
        d.hass = { ...hass };
        await settle(d);
      }
      expect((soc().data as [number, number | null][]).filter((p) => p[0] > NOW + 5 * MIN)).toEqual(
        [[NOW + 6 * MIN + 45_000, 71]],
      );
    } finally {
      vi.setSystemTime(NOW);
    }
  });
});
