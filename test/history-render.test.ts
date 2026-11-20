// @vitest-environment happy-dom
/**
 * The history line in the rows (REQ LZ-18): next to the power or below the
 * row, its room kept while nothing is there and in a period, and a preview
 * fetches once only (issue #17).
 */
import { render } from "lit";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ChargeTracker } from "../src/charge";
import { normalizeConfig } from "../src/config";
import { buildBreakdown } from "../src/consumers";
import { shapeLine } from "../src/history-line";
import { buildModel } from "../src/model";
import { type HistoryRender, renderList } from "../src/render/list";
import type { HomeAssistant, RawConfig } from "../src/types";
import { fakeMotion } from "./motion";

beforeAll(fakeMotion);
afterEach(() => vi.restoreAllMocks());

function hassWith(states: Record<string, string>): HomeAssistant {
  const all: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(states)) {
    all[id] = {
      entity_id: id,
      state,
      attributes: { unit_of_measurement: "W", device_class: "power" },
      last_changed: "",
      last_updated: "",
    };
  }
  return {
    states: all,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: vi.fn(async () => ({})) as never,
  } as HomeAssistant;
}

const LIVE = {
  "sensor.solar": "0",
  "sensor.grid": "3000",
  "sensor.house": "3000",
  "sensor.pump": "600",
};
const RAW = {
  type: "custom:enerlens-card",
  entities: { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" },
  consumers: [{ entity: "sensor.pump", name: "Pumpe" }],
  list: { history: { consumers: true } },
} as RawConfig;

const SHAPE = {
  shape: shapeLine([0, 300, 600, 100], 10),
  tip: "12 h · max. 0,60 kW (5-Min-Mittel)",
};

function draw(
  place: "inline" | "below",
  withShape = true,
  extra: Partial<RawConfig> = {},
  energy = false,
) {
  const cfg = normalizeConfig({ ...RAW, ...extra } as RawConfig);
  // A period on the card, as far as the list reads it (EM).
  if (energy) (cfg as unknown as { energy: unknown }).energy = { consumers: {}, rest: undefined };
  const hass = hassWith(LIVE);
  const model = buildModel(hass, cfg, (e) => new ChargeTracker().state(hass, e));
  const history: HistoryRender = {
    place,
    consumers: true,
    solar: false,
    shape: () => (withShape ? SHAPE : undefined),
  };
  const host = document.createElement("div");
  render(
    renderList(buildBreakdown(model, cfg), cfg, hass, vi.fn(), false, [], false, history),
    host,
  );
  return host;
}

describe("the history line in a row (LZ-18)", () => {
  it("next to the power: in the value's cell, before the number, with its tooltip", () => {
    const row = draw("inline").querySelector(".row") as HTMLElement;
    const line = row.querySelector(".row-value > .hline.inline");
    expect(line).not.toBeNull();
    expect(line?.getAttribute("title")).toContain("5-Min-Mittel");
    expect(line?.querySelector("polyline")).not.toBeNull();
    expect(row.classList.contains("hline-below")).toBe(false);
  });

  it("below the row: a strip of the row itself, the row marked for its room", () => {
    const row = draw("below").querySelector(".row") as HTMLElement;
    const line = row.querySelector(".hline.below");
    expect(line?.parentElement).toBe(row);
    expect(row.classList.contains("hline-below")).toBe(true);
  });

  it("nothing loaded yet: the room is there, empty", () => {
    const line = draw("inline", false).querySelector(".hline");
    expect(line).not.toBeNull();
    expect(line?.querySelector("polyline")).toBeNull();
  });

  it("in a period: no line, its room stays (LZ-18, as LZ-5)", () => {
    const inline = draw("inline", true, {}, true).querySelector(".hline");
    expect(inline).not.toBeNull();
    expect(inline?.querySelector("polyline")).toBeNull();
    const row = draw("below", true, {}, true).querySelector(".row") as HTMLElement;
    expect(row.classList.contains("hline-below")).toBe(true);
    expect(row.querySelector(".hline polyline")).toBeNull();
  });

  it("the rest gets its line too (L-21)", () => {
    const rows = draw("inline").querySelectorAll(".row");
    const rest = [...rows].find((r) => r.classList.contains("rest"));
    expect(rest?.querySelector(".hline polyline")).not.toBeNull();
  });
});

describe("the card fetches only where it may (LZ-18, issue #17, E-5)", () => {
  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    (globalThis as unknown as Record<string, unknown>).IntersectionObserver = class {
      constructor(cb: (e: { isIntersecting: boolean }[]) => void) {
        setTimeout(() => cb([{ isIntersecting: true }]), 0);
      }
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  async function mount(raw: RawConfig, preview = false) {
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      preview?: boolean;
      updateComplete: Promise<unknown>;
    };
    el.setConfig(raw);
    const hass = hassWith(LIVE);
    if (preview) el.preview = true;
    el.hass = hass;
    document.body.appendChild(el);
    for (let i = 0; i < 3; i++) {
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 0));
    }
    const sent = (hass.callWS as unknown as ReturnType<typeof vi.fn>).mock.calls.map(([m]) => m);
    const calls = sent.map((m) => (m as { type: string }).type);
    el.remove();
    return calls;
  }

  it("with the line on, it asks HA for the line's data", async () => {
    const calls = await mount(RAW);
    expect(calls).toContain("recorder/get_statistics_metadata");
  });

  it("with the line off, it asks nothing for it", async () => {
    const calls = await mount({ ...RAW, list: {} } as RawConfig);
    expect(calls).not.toContain("recorder/get_statistics_metadata");
  });

  /**
   * A card that stays mounted: changes and a clock moved on, then the
   * requests for the line's data counted (those name the line's entities).
   */
  async function live(preview: boolean) {
    const el = document.createElement("enerlens-card") as HTMLElement & {
      setConfig: (c: unknown) => void;
      hass: HomeAssistant;
      preview?: boolean;
      updateComplete: Promise<unknown>;
    };
    let clock = Date.now();
    vi.spyOn(Date, "now").mockImplementation(() => clock);
    el.setConfig(RAW);
    const hass = hassWith(LIVE);
    if (preview) el.preview = true;
    el.hass = hass;
    document.body.appendChild(el);
    const settle = async () => {
      for (let i = 0; i < 3; i++) {
        await el.updateComplete;
        await new Promise((r) => setTimeout(r, 0));
      }
    };
    await settle();
    const statsCalls = () =>
      (hass.callWS as unknown as ReturnType<typeof vi.fn>).mock.calls.filter(
        ([m]) => (m as { type: string }).type === "recorder/statistics_during_period",
      ).length +
      (hass.callWS as unknown as ReturnType<typeof vi.fn>).mock.calls.filter(
        ([m]) => (m as { type: string }).type === "history/history_during_period",
      ).length;
    const first = statsCalls();
    return {
      first,
      /** A change in the editor, then six minutes on and another update. */
      async later(raw: RawConfig = RAW) {
        el.setConfig(raw);
        await settle();
        clock += 6 * 60_000;
        // A new reading, so the card draws (and asks, where due).
        const pump = hass.states["sensor.pump"];
        el.hass = {
          ...hass,
          states: { ...hass.states, "sensor.pump": { ...pump, state: "650" } },
        } as HomeAssistant;
        await settle();
        const n = statsCalls();
        el.remove();
        return n;
      },
    };
  }

  it("in a preview it asks once, not again on a change or after five minutes (issue #17)", async () => {
    const card = await live(true);
    expect(card.first).toBeGreaterThan(0);
    expect(await card.later()).toBe(card.first);
  });

  it("on a dashboard it asks again once five minutes have passed", async () => {
    const card = await live(false);
    expect(await card.later()).toBeGreaterThan(card.first);
  });

  it("a half-typed entity added in the editor asks nothing new", async () => {
    const card = await live(true);
    const typing = {
      ...RAW,
      consumers: [...(RAW.consumers ?? []), { entity: "sensor.pu", name: "Neu" }],
    } as RawConfig;
    expect(await card.later(typing)).toBe(card.first);
  });
});
