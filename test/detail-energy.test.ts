// @vitest-environment happy-dom
/**
 * The detail window in a period (REQ DF-3, DF-6, DF-7, DF-9): chips, totals
 * that are the card's own, bars mirrored below zero, and the way back to
 * more-info when Home Assistant's chart element does not come. Invented
 * figures (N-9).
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { DETAIL_NAME } from "../src/const";
import { detailSetup } from "../src/detail-dialog";
import type { HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";

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
  view: { energy_periods: ["power", "today", "month"] },
};

const STATES: Record<string, string> = {
  "sensor.solar": "300",
  "sensor.import": "0",
  "sensor.export": "100",
  "sensor.out": "0",
  "sensor.in": "200",
  "sensor.soc": "72",
  "sensor.house": "0",
};

/** Mornings bought, afternoons sold: both directions on one day. */
const MEANS: Record<string, (t: number) => number> = {
  "sensor.solar": (t) => (new Date(t).getUTCHours() >= 8 ? 3000 : 0),
  "sensor.import": (t) => (new Date(t).getUTCHours() < 8 ? 500 : 0),
  "sensor.export": (t) => (new Date(t).getUTCHours() >= 8 ? 1000 : 0),
  "sensor.out": () => 0,
  "sensor.in": (t) => (new Date(t).getUTCHours() >= 8 ? 1000 : 0),
  "sensor.house": () => 500,
};

/** A month's request waits for this, or fails while `failMonth` is set. */
let holdMonth: Promise<void> | undefined;
let failMonth = false;
/** Means to use instead of MEANS in one test. */
let override: Record<string, (t: number) => number> = {};
const MONTH_START = Date.parse("2026-10-10T00:00:00Z");

function fakeHass(): HomeAssistant {
  const states: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(STATES)) {
    states[id] = {
      entity_id: id,
      state,
      attributes: { unit_of_measurement: id.includes("soc") ? "%" : "W" },
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
      if (msg.type === "recorder/get_statistics_metadata") {
        return (msg.statistic_ids as string[])
          .filter((id) => MEANS[id])
          .map((id) => ({ statistic_id: id, has_mean: true, unit_class: "power" })) as never;
      }
      if (msg.type !== "recorder/statistics_during_period" || msg.period !== "hour") {
        return {} as never;
      }
      const start = Date.parse(String(msg.start_time));
      if (start < MONTH_START) {
        if (holdMonth) await holdMonth;
        if (failMonth) throw new Error("recorder busy");
      }
      const out: Record<string, { start: number; mean: number }[]> = {};
      for (const id of msg.statistic_ids as string[]) {
        const mean = override[id] ?? MEANS[id];
        if (!mean) continue;
        out[id] = [];
        for (let t = start; t + H <= Math.floor(Date.now() / H) * H; t += H) {
          out[id].push({ start: t, mean: mean(t) });
        }
      }
      return out as never;
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
  closeDialog: () => boolean;
  updateComplete: Promise<unknown>;
};
/** What the stand-in for HA's chart element was given. */
type Chart = HTMLElement & {
  data: { name: string; data: [number, number | null][]; itemStyle?: { color?: string } }[];
  options: { xAxis: { min: number; max: number } };
};

async function settle(el: { updateComplete: Promise<unknown> }) {
  for (let i = 0; i < 6; i++) {
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

const cardChip = (el: Card) => el.shadowRoot?.querySelector<HTMLElement>(".energy-chip");
const cardLabel = (el: Card) =>
  cardChip(el)?.querySelector(".mode-label.active")?.textContent?.trim();
const text = (e?: Element | null) => (e?.textContent ?? "").replace(/\s+/g, " ").trim();

/** Taps a node's target and opens the window the card asked for. */
async function open(el: Card, key: string, index = 0) {
  let params: unknown;
  el.addEventListener("show-dialog", (ev) => {
    params = (ev as CustomEvent).detail.dialogParams;
  });
  const hits = el.shadowRoot?.querySelectorAll<HTMLElement>(`.node.${key} .hit`);
  hits?.[index]?.click();
  const dialog = document.createElement(DETAIL_NAME) as Dialog;
  document.body.appendChild(dialog);
  await dialog.showDialog(params);
  await settle(dialog);
  return dialog;
}

const chips = (d: Dialog) => [
  ...(d.shadowRoot?.querySelectorAll<HTMLElement>("[role=radio]") ?? []),
];
const chart = (d: Dialog) => d.shadowRoot?.querySelector<Chart>(".chart.energy");

describe("the detail window in a period (REQ DF-3)", () => {
  beforeAll(async () => {
    fakeMotion();
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    // A stand-in for HA's chart element: it keeps what it was given.
    customElements.define(
      "ha-chart-base",
      class extends HTMLElement {
        data: unknown;
        options: unknown;
        hass: unknown;
        height: unknown;
      },
    );
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    await import("../src/enerlens-card");
  });
  afterAll(() => vi.useRealTimers());
  afterEach(() => {
    holdMonth = undefined;
    failMonth = false;
    override = {};
    detailSetup.chartTag = "ha-chart-base";
    detailSetup.chartWaitMs = 5000;
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("offers the card's periods without kW and starts on the card's", async () => {
    const el = await mount();
    cardChip(el)?.click();
    await settle(el);
    expect(cardLabel(el)).toBe("Heute");
    const d = await open(el, "grid");
    expect(chips(d).map((c) => text(c))).toEqual(["Heute", "Monat"]);
    expect(chips(d).map((c) => c.getAttribute("aria-checked"))).toEqual(["true", "false"]);
  });

  it("totals the card's own figures (DF-3)", async () => {
    const el = await mount();
    cardChip(el)?.click();
    await settle(el);
    const figures = [...(el.shadowRoot?.querySelectorAll(".node.grid .figure") ?? [])].map((f) =>
      text(f),
    );
    const d = await open(el, "grid");
    const sums = [...(d.shadowRoot?.querySelectorAll(".sum") ?? [])].map((s) => text(s));
    // 8 hours bought at 0.5 kW, 4 sold at 1 kW - up to the last full hour.
    expect(sums[0]).toContain("4,0 kWh");
    expect(sums[1]).toContain("4,0 kWh");
    for (const [i, sum] of sums.entries()) {
      expect(figures[i]).toContain(sum.match(/[\d,]+ kWh/)?.[0]);
    }
  });

  it("draws import up and export mirrored below zero, in the card's colours (DF-3, DF-6)", async () => {
    const el = await mount();
    cardChip(el)?.click();
    await settle(el);
    const d = await open(el, "grid");
    const c = chart(d);
    expect(c, "HA's chart element").toBeTruthy();
    const [up, down] = c?.data ?? [];
    expect(up.name).toBe("Bezug");
    expect(down.name).toBe("Einspeisung");
    const values = (s: typeof up) => s.data.map(([, v]) => v).filter((v) => v !== null) as number[];
    expect(values(up).every((v) => v >= 0)).toBe(true);
    expect(values(down).every((v) => v <= 0)).toBe(true);
    expect(values(up).reduce((a, b) => a + b, 0)).toBeCloseTo(4, 6);
    expect(values(down).reduce((a, b) => a + b, 0)).toBeCloseTo(-4, 6);
    expect(up.itemStyle?.color).toBe("#488fc2");
    expect(down.itemStyle?.color).toBe("#8353d1");
    // The whole day on the axis, the hours to come empty.
    expect(c?.options.xAxis.min).toBe(Date.parse("2026-10-19T00:00:00Z"));
    expect(c?.options.xAxis.max).toBe(Date.parse("2026-10-20T00:00:00Z"));
  });

  it("switches its own period, never the card's (DF-3)", async () => {
    const el = await mount();
    cardChip(el)?.click();
    await settle(el);
    const d = await open(el, "battery", 1);
    chips(d)[1].click();
    await settle(d);
    expect(chips(d).map((c) => c.getAttribute("aria-checked"))).toEqual(["false", "true"]);
    expect(cardLabel(el)).toBe("Heute");
    const [up, down] = chart(d)?.data ?? [];
    expect(up.name).toBe("Entladen");
    expect(down.name).toBe("Laden");
  });

  it("opens an entity's more-info from its total (DF-9)", async () => {
    const el = await mount();
    cardChip(el)?.click();
    await settle(el);
    const d = await open(el, "grid");
    const seen: string[] = [];
    d.addEventListener("hass-more-info", (ev) => seen.push((ev as CustomEvent).detail.entityId));
    for (const button of d.shadowRoot?.querySelectorAll<HTMLElement>("button.sum") ?? []) {
      button.click();
    }
    expect(seen).toEqual(["sensor.import", "sensor.export"]);
  });

  it("shows the period tapped last, however slow the one before (DF-10)", async () => {
    const el = await mount();
    cardChip(el)?.click();
    await settle(el);
    const d = await open(el, "grid");
    let release = () => {};
    holdMonth = new Promise((r) => {
      release = r;
    });
    chips(d)[1].click();
    await settle(d);
    // Dimmed while it loads, totals included, the chip already on Monat.
    expect(d.shadowRoot?.querySelector(".sums")?.classList.contains("busy")).toBe(true);
    chips(d)[0].click();
    await settle(d);
    release();
    await settle(d);
    expect(chips(d).map((c) => c.getAttribute("aria-checked"))).toEqual(["true", "false"]);
    expect(chart(d)?.options.xAxis.min).toBe(Date.parse("2026-10-19T00:00:00Z"));
    expect(d.shadowRoot?.querySelector(".sums")?.classList.contains("busy")).toBe(false);
  });

  it("goes back to the period it shows when another one fails (DF-3)", async () => {
    const el = await mount();
    cardChip(el)?.click();
    await settle(el);
    const d = await open(el, "grid");
    const sums = () => [...(d.shadowRoot?.querySelectorAll(".sum") ?? [])].map((x) => text(x));
    const before = sums();
    failMonth = true;
    chips(d)[1].click();
    await settle(d);
    expect(chips(d).map((c) => c.getAttribute("aria-checked"))).toEqual(["true", "false"]);
    expect(sums()).toEqual(before);
  });

  it("moves through the periods by keyboard, one tab stop (DF-9, QB-14)", async () => {
    const el = await mount();
    cardChip(el)?.click();
    await settle(el);
    const d = await open(el, "grid");
    expect(chips(d).map((c) => c.tabIndex)).toEqual([0, -1]);
    chips(d)[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await settle(d);
    expect(chips(d).map((c) => c.getAttribute("aria-checked"))).toEqual(["false", "true"]);
    expect(chips(d).map((c) => c.tabIndex)).toEqual([-1, 0]);
    chips(d)[1].dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    await settle(d);
    expect(chips(d).map((c) => c.getAttribute("aria-checked"))).toEqual(["true", "false"]);
  });

  it("never shows a period's energy below zero, as the node does not", async () => {
    override = { "sensor.export": () => -300 };
    const el = await mount();
    cardChip(el)?.click();
    await settle(el);
    const d = await open(el, "grid");
    const sums = [...(d.shadowRoot?.querySelectorAll(".sum") ?? [])].map((x) => text(x));
    expect(sums[1]).toContain("0,0 kWh");
    const down = chart(d)?.data[1];
    const values = (down?.data ?? []).map((p) => (Array.isArray(p) ? p[1] : null));
    expect(values.every((v) => v === null || v <= 0)).toBe(true);
  });

  it("draws the same figures again in another theme (DF-6)", async () => {
    const el = await mount();
    cardChip(el)?.click();
    await settle(el);
    const d = (await open(el, "grid")) as Dialog & { hass?: HomeAssistant };
    const hass = fakeHass();
    d.hass = { ...hass, themes: { darkMode: false } };
    await settle(d);
    const before = chart(d)?.data;
    d.hass = { ...hass, themes: { darkMode: true } };
    await settle(d);
    expect(chart(d)?.data, "drawn again").not.toBe(before);
    expect(chart(d)?.data).toEqual(before);
  });

  it("opens more-info instead when HA's chart element never comes (DF-7)", async () => {
    detailSetup.chartTag = "ha-chart-missing";
    detailSetup.chartWaitMs = 20;
    const el = await mount();
    cardChip(el)?.click();
    await settle(el);
    const seen: string[] = [];
    const order: string[] = [];
    el.addEventListener("hass-more-info", (ev) => {
      seen.push((ev as CustomEvent).detail.entityId);
      order.push("more-info");
    });
    let closed = false;
    document.body.addEventListener("dialog-closed", () => {
      closed = true;
      order.push("closed");
    });
    await open(el, "grid");
    await new Promise((r) => setTimeout(r, 60));
    expect(closed).toBe(true);
    // Today's figures: the node shows export below, its entity is the fallback.
    expect(seen).toHaveLength(1);
    // Closed first: more-info keeps the focus, it does not go back to the node.
    expect(order).toEqual(["closed", "more-info"]);
  });
});
