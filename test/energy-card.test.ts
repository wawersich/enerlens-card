// @vitest-environment happy-dom
/**
 * The energy mode on the real element (REQ 2.15): the chip, the figures at
 * the nodes, what disappears and what is never fetched. Invented figures (N-9).
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { PATHS } from "../src/render/geometry";
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
  view: { energy_periods: ["power", "today", "month"] },
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
  // Consumers: one with statistics, one without.
  "sensor.heat": "700",
  "sensor.nostat": "50",
  // A grid status that reports an outage, for the one test that names it.
  "sensor.grid_state": "off",
  "sensor.gridnet": "0",
  "sensor.batnet": "-200",
  "sensor.gridinv": "0",
  "sensor.gridout": "0",
  "sensor.gridswing": "0",
};

/** Hourly means of the day: 2 kW sun, 0.5 kW bought, 1 kW into the battery.
 *  A function gives a mean per hour (its start in ms). */
const MEANS: Record<string, number | ((t: number) => number)> = {
  "sensor.solar": 2000,
  "sensor.import": 500,
  "sensor.export": 0,
  "sensor.out": 0,
  "sensor.in": 1000,
  "sensor.house": 1500,
  "sensor.heat": 600,
  // Signed sensors: the grid net import, the battery net charging.
  "sensor.gridnet": 500,
  "sensor.batnet": -1000,
  // Reported the other way round (invert: true), and a net exporter.
  "sensor.gridinv": -500,
  "sensor.gridout": -300,
  // Buys and sells a kilowatt in turns: a balance of nothing.
  "sensor.gridswing": (t: number) => ((t / H) % 2 === 0 ? 1000 : -1000),
};

type Card = HTMLElement & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  preview?: boolean;
};

/** Requests to answer with an error, counted down per statistics call. */
let failing = 0;
/** While set, statistics answers wait for it - a slow recorder. */
let hold: Promise<void> | undefined;
/** While set, the statistics metadata waits for it (QB-8). */
let holdMeta: Promise<void> | undefined;
/** Metadata requests to answer with an error. */
let failingMeta = 0;
/** Sensors HA keeps no statistics for, beyond those without means. */
let statless = new Set<string>();

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
      if (msg.type === "recorder/get_statistics_metadata") {
        if (holdMeta) await holdMeta;
        if (failingMeta > 0) {
          failingMeta--;
          throw new Error("recorder not ready");
        }
        return (msg.statistic_ids as string[])
          .filter((id) => MEANS[id] !== undefined && !statless.has(id))
          .map((id) => ({
            statistic_id: id,
            mean_type: 1,
            has_mean: true,
            has_sum: false,
            unit_class: "power",
            statistics_unit_of_measurement: "W",
          })) as never;
      }
      if (msg.type === "recorder/statistics_during_period" && hold) await hold;
      if (msg.type === "recorder/statistics_during_period" && failing > 0) {
        failing--;
        throw new Error("recorder busy");
      }
      if (msg.type !== "recorder/statistics_during_period" || msg.period !== "hour") {
        return {} as never;
      }
      const start = Date.parse(String(msg.start_time));
      const out: Record<string, { start: number; mean: number }[]> = {};
      for (const id of msg.statistic_ids as string[]) {
        if (MEANS[id] === undefined) continue;
        out[id] = [];
        for (let t = start; t + H <= Math.floor(Date.now() / H) * H; t += H) {
          const mean = MEANS[id];
          out[id].push({ start: t, mean: typeof mean === "function" ? mean(t) : mean });
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
    // A failed test must not leave a slow or broken recorder to the next.
    hold = undefined;
    holdMeta = undefined;
    failingMeta = 0;
    statless = new Set();
    failing = 0;
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("offers one chip left of the filter that steps kW → Heute → Monat → kW (EM-2)", async () => {
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
    expect(seen).toEqual(["Heute", "Monat", "kW"]);
    // View chip, energy chip, filter - the energy chip right next to the filter.
    const controls = [...(el.shadowRoot?.querySelector(".controls")?.children ?? [])];
    expect(controls.map((c) => c.classList.contains("energy-chip") || c.className.trim())).toEqual([
      "mode-chip view-chip",
      true,
      "filter-toggle",
    ]);
  });

  it("names the power view by the configured unit (EM-2)", async () => {
    const chipFor = async (unit?: string) => {
      const { el } = await mount({ ...CONFIG, ...(unit ? { power: { unit } } : {}) });
      return label(el);
    };
    expect(await chipFor()).toBe("kW");
    // Spelt out: a lone "W" next to "Woche" reads like its abbreviation.
    expect(await chipFor("W")).toBe("Watt");
    expect(await chipFor("auto")).toBe("kW");
  });

  it("hides the view chip in a period and remembers the choice (EM-2)", async () => {
    const { el } = await mount();
    await tap(el);
    // Still there, greyed out and inert: averages have no meaning here.
    const view = el.shadowRoot?.querySelector<HTMLButtonElement>(".view-chip");
    // aria-disabled, not disabled: it stays focusable and says why (QB-3).
    expect(view?.getAttribute("aria-disabled")).toBe("true");
    expect(view?.title).toBe("Mittelwerte gibt es nur in der kW-Ansicht");
    view?.click();
    await settle(el);
    expect(view?.querySelector(".mode-label.active")?.textContent?.trim()).toBe("Jetzt");
    expect(localStorage.getItem("enerlens-energy-period")).toBe("today");
    const again = await mount();
    expect(label(again.el)).toBe("Heute");
  });

  it("shows the day's energy at the nodes (EM-4, EM-5)", async () => {
    const { el, asked } = await mount();
    await tap(el);
    expect(asked.filter((m) => m.type === "recorder/statistics_during_period")).toHaveLength(3);
    // Twelve hours since midnight: 24 kWh of sun, 18 kWh in the house.
    expect(text(node(el, "solar")?.querySelector(".value"))).toBe("24,0 kWh");
    expect(text(node(el, "house")?.querySelector(".value"))).toBe("18,0 kWh");
    const figures = (key: string) =>
      [...(node(el, key)?.querySelectorAll(".value.figure") ?? [])].map(
        (f) => `${f.querySelector(".arrow")?.getAttribute("data-arrow")}${text(f)}`,
      );
    expect(figures("grid")).toEqual(["→6,0 kWh", "←0,0 kWh"]);
    // Discharge above, charge below - and no state of charge (EM-5).
    expect(node(el, "battery")?.querySelectorAll(".value")).toHaveLength(2);
    expect(figures("battery")).toEqual(["↑0,0 kWh", "↓12,0 kWh"]);
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
    localStorage.setItem("enerlens-energy-period", "today");
    const { el, asked } = await mount(CONFIG, true);
    expect(label(el)).toBe("kW");
    expect(asked.filter((m) => m.type === "recorder/statistics_during_period")).toHaveLength(0);
    await tap(el);
    expect(label(el)).toBe("Heute");
    expect(asked.filter((m) => m.type === "recorder/statistics_during_period")).toHaveLength(3);
    // A look in the preview is no choice for the dashboard.
    expect(localStorage.getItem("enerlens-energy-period")).toBe("today");
    await tap(el);
    expect(localStorage.getItem("enerlens-energy-period")).toBe("today");
  });

  it("keeps the list while a period is still loading (fan glitch, 20.10.2026)", async () => {
    // The card switched to the period at once and drew it without figures: an
    // empty list, then ten rows gliding in from far below, the fan lines
    // running out of the card ahead of them.
    const { el } = await mount({
      ...CONFIG,
      consumers: [{ entity: "sensor.heat", name: "Heizung" }],
    });
    const rows = () => el.shadowRoot?.querySelectorAll(".row").length ?? 0;
    expect(rows()).toBeGreaterThan(0);
    let release = () => {};
    hold = new Promise<void>((r) => {
      release = r;
    });
    const before = text(node(el, "solar")?.querySelector(".value"));
    await tap(el);
    // The chip answers the tap at once; figures and list wait for the period.
    expect(label(el)).toBe("Heute");
    expect(rows()).toBeGreaterThan(0);
    expect(text(node(el, "solar")?.querySelector(".value"))).toBe(before);
    release();
    hold = undefined;
    await settle(el);
    expect(rows()).toBeGreaterThan(0);
  });

  it("stays on the old picture when a period fails to load, and lets a tap try again", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    failing = 3;
    const { el, asked } = await mount();
    const stats = () => asked.filter((m) => m.type === "recorder/statistics_during_period").length;
    await tap(el);
    expect(stats()).toBe(3);
    // Nothing half-shown: still the power view, with its figures.
    expect(label(el)).toBe("kW");
    expect(text(node(el, "solar")?.querySelector(".value"))).toBe("0,30 kW");
    await tap(el);
    expect(label(el)).toBe("Heute");
    expect(text(node(el, "solar")?.querySelector(".value"))).toBe("24,0 kWh");
    warn.mockRestore();
  });

  it("shows no remembered period empty in the preview while the tapped one loads (EM-14)", async () => {
    localStorage.setItem("enerlens-energy-period", "week");
    const { el, asked } = await mount(
      { ...CONFIG, view: { energy_periods: ["power", "today", "week"] } },
      true,
    );
    const solar = () => text(node(el, "solar")?.querySelector(".value"));
    expect(label(el)).toBe("kW");
    let release = () => {};
    hold = new Promise<void>((r) => {
      release = r;
    });
    await tap(el);
    expect(label(el)).toBe("Heute");
    expect(solar()).toBe("0,30 kW");
    release();
    hold = undefined;
    await settle(el);
    expect(solar()).toBe("24,0 kWh");
    // Only the tapped period was asked for, not the remembered one.
    const periods = asked
      .filter((m) => m.type === "recorder/statistics_during_period" && m.period === "hour")
      .map((m) => m.start_time);
    expect(periods).toHaveLength(1);
  });

  it("does not show a period that was removed while it loaded (EM-2)", async () => {
    const { el } = await mount();
    let release = () => {};
    hold = new Promise<void>((r) => {
      release = r;
    });
    await tap(el);
    el.setConfig({ ...CONFIG, view: { energy_periods: ["power", "month"] } });
    release();
    hold = undefined;
    await settle(el);
    expect(label(el)).toBe("kW");
    expect(localStorage.getItem("enerlens-energy-period")).toBeNull();
  });

  it("tries a failed refresh again after half a minute, keeping the figures meanwhile (EM-4)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { el, asked } = await mount();
    const stats = () => asked.filter((m) => m.type === "recorder/statistics_during_period").length;
    await tap(el);
    expect(stats()).toBe(3);
    failing = 3;
    vi.setSystemTime(NOW + 5 * 60_000 + 1000);
    (el as unknown as { requestUpdate(): void }).requestUpdate();
    await settle(el);
    expect(stats()).toBe(6);
    expect(text(node(el, "solar")?.querySelector(".value"))).toBe("24,0 kWh");
    vi.setSystemTime(NOW + 5 * 60_000 + 32_000);
    (el as unknown as { requestUpdate(): void }).requestUpdate();
    await settle(el);
    expect(stats()).toBe(9);
    vi.setSystemTime(NOW);
    warn.mockRestore();
  });

  it("renews the day at midnight, keeping yesterday's figures only until it is there (EM-1)", async () => {
    const { el, asked } = await mount();
    await tap(el);
    expect(text(node(el, "solar")?.querySelector(".value"))).toBe("24,0 kWh");
    vi.setSystemTime(Date.parse("2026-10-20T01:10:00Z"));
    let release = () => {};
    hold = new Promise<void>((r) => {
      release = r;
    });
    (el as unknown as { requestUpdate(): void }).requestUpdate();
    await settle(el);
    expect(text(node(el, "solar")?.querySelector(".value"))).toBe("24,0 kWh");
    release();
    hold = undefined;
    await settle(el);
    expect(asked.filter((m) => m.type === "recorder/statistics_during_period")).toHaveLength(6);
    // One hour of the new day.
    expect(text(node(el, "solar")?.querySelector(".value"))).toBe("2,0 kWh");
    vi.setSystemTime(NOW);
  });

  it("lists a consumer without statistics last with a dash, the rest in amber (EM-12)", async () => {
    const { el } = await mount({
      ...CONFIG,
      consumers: [
        { entity: "sensor.nostat", name: "Neu" },
        { entity: "sensor.heat", name: "Heizung" },
      ],
    });
    await tap(el);
    const rows = [...(el.shadowRoot?.querySelectorAll(".row") ?? [])];
    expect(rows.map(text)).toEqual(["Rest 10,8 kWh", "Heizung 7,2 kWh", "Neu —"]);
    expect(rows[0].querySelector(".row-value")?.classList.contains("warn2")).toBe(true);
    expect(rows[2].querySelector(".row-value")?.getAttribute("title")).toBe("Keine Statistik");
  });

  it("crosses the grid symbol out in red during an outage and keeps the figures (EM-6)", async () => {
    const { el } = await mount({
      ...CONFIG,
      entities: {
        ...CONFIG.entities,
        grid_status: { entity: "sensor.grid_state", outage: ["off"], ok: ["on"] },
      },
    });
    await tap(el);
    expect(el.shadowRoot?.querySelector(".outage-banner")).not.toBeNull();
    const grid = node(el, "grid");
    expect(grid?.querySelector(".icon-cross")).not.toBeNull();
    expect(grid?.querySelector<HTMLElement>(".icon-cross ha-icon")?.style.color).toBe(
      "var(--el-error)",
    );
    const figures = [...(grid?.querySelectorAll(".value.figure") ?? [])].map(text);
    expect(figures).toEqual(["6,0 kWh", "0,0 kWh"]);
  });

  it("shows the grid's balance and no battery figure for signed sensors (EM-3)", async () => {
    const { el } = await mount({
      ...CONFIG,
      entities: { ...CONFIG.entities, grid: "sensor.gridnet", battery: "sensor.batnet" },
    });
    await tap(el);
    // One figure at the grid: 500 W net import for twelve hours.
    const grid = [...(node(el, "grid")?.querySelectorAll(".value.figure") ?? [])];
    expect(
      grid.map((f) => `${f.querySelector(".arrow")?.getAttribute("data-arrow")}${text(f)}`),
    ).toEqual(["→6,0 kWh"]);
    // No battery figure at all, only its symbol - and nothing flows to or from it.
    expect(node(el, "battery")?.querySelectorAll(".value")).toHaveLength(0);
    const active = [...(el.shadowRoot?.querySelectorAll("path.link.active") ?? [])];
    expect(active.length).toBeGreaterThan(0);
    expect(
      active.filter((p) =>
        ["solar_battery", "grid_battery", "battery_house", "battery_grid"].some(
          (id) => p.getAttribute("d") === PATHS[id as keyof typeof PATHS],
        ),
      ),
    ).toHaveLength(0);
    expect(node(el, "battery")?.querySelector("ha-icon")).not.toBeNull();
    // PV and house as with two sensors.
    expect(text(node(el, "solar")?.querySelector(".value"))).toBe("24,0 kWh");
    expect(text(node(el, "house")?.querySelector(".value"))).toBe("18,0 kWh");
  });

  it("gets the balance's direction right for inverted sensors and net export (EM-3)", async () => {
    const balance = async (grid: unknown) => {
      localStorage.clear();
      const { el } = await mount({ ...CONFIG, entities: { ...CONFIG.entities, grid } });
      await tap(el);
      const figures = [...(node(el, "grid")?.querySelectorAll(".value.figure") ?? [])];
      return figures.map(
        (f) => `${f.querySelector(".arrow")?.getAttribute("data-arrow")}${text(f)}`,
      );
    };
    // -500 W reported, turned: 500 W of import.
    expect(await balance({ entity: "sensor.gridinv", invert: true })).toEqual(["→6,0 kWh"]);
    // -300 W as reported: 300 W of export.
    expect(await balance("sensor.gridout")).toEqual(["←3,6 kWh"]);
  });

  it("lets a signed grid flow as its balance, not as its hourly halves (EM-8)", async () => {
    const { el } = await mount({
      ...CONFIG,
      entities: { ...CONFIG.entities, grid: "sensor.gridswing" },
    });
    await tap(el);
    const grid = [...(node(el, "grid")?.querySelectorAll(".value.figure") ?? [])].map(text);
    expect(grid).toEqual(["0,0 kWh"]);
    // Nothing on the grid's lines, though hour by hour it bought and sold.
    const active = [...(el.shadowRoot?.querySelectorAll("path.link.active") ?? [])].map((p) =>
      p.getAttribute("d"),
    );
    const gridLines = ["solar_grid", "battery_grid", "grid_battery", "grid_house"].map(
      (id) => PATHS[id as keyof typeof PATHS],
    );
    expect(active.filter((d) => gridLines.includes(d as string))).toEqual([]);
  });

  it("draws no flow for a signed grid while a balance value has no statistics", async () => {
    const { el } = await mount({
      ...CONFIG,
      entities: { ...CONFIG.entities, grid: "sensor.gridnet", solar: "sensor.nostat" },
    });
    await tap(el);
    expect(el.shadowRoot?.querySelectorAll("path.link.active")).toHaveLength(0);
  });

  it("keeps a signed battery quiet next to a grid with two sensors (EM-3)", async () => {
    const { el } = await mount({
      ...CONFIG,
      entities: { ...CONFIG.entities, battery: "sensor.batnet" },
    });
    await tap(el);
    const active = [...(el.shadowRoot?.querySelectorAll("path.link.active") ?? [])].map((p) =>
      p.getAttribute("d"),
    );
    expect(active.length).toBeGreaterThan(0);
    const batteryLines = ["solar_battery", "grid_battery", "battery_house", "battery_grid"].map(
      (id) => PATHS[id as keyof typeof PATHS],
    );
    expect(active.filter((d) => batteryLines.includes(d as string))).toEqual([]);
  });

  it("gives a signed battery one target that names no figure (EM-3)", async () => {
    const { el } = await mount({
      ...CONFIG,
      entities: { ...CONFIG.entities, battery: "sensor.batnet" },
    });
    await tap(el);
    const hits = [...(node(el, "battery")?.querySelectorAll<HTMLElement>(".hit") ?? [])];
    expect(hits).toHaveLength(1);
    expect(hits[0].getAttribute("aria-label")).toBe("Batterie");
  });

  it("has no chip with a derived grid (EM-3)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { el } = await mount({
      ...CONFIG,
      entities: { ...CONFIG.entities, grid: "derived" },
    });
    expect(chip(el)).toBeNull();
    warn.mockRestore();
  });
});

describe("the quick button power/energy (REQ QB-2, QB-3, QB-8)", () => {
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
    hold = undefined;
    holdMeta = undefined;
    failingMeta = 0;
    statless = new Set();
    localStorage.clear();
    document.body.innerHTML = "";
  });

  // A card nobody has told about energy: the default applies (QB-8). Each
  // test has entities of its own, so no answer is shared between them.
  const plain = (house: string) => ({
    ...CONFIG,
    entities: { ...CONFIG.entities, house },
    view: undefined,
  });
  const metaAsks = (asked: Record<string, unknown>[]) =>
    asked.filter((m) => m.type === "recorder/get_statistics_metadata");

  it("offers today, 24 h and week by default once the statistics are there (QB-8)", async () => {
    MEANS["sensor.house_a"] = 1500;
    const { el, asked } = await mount(plain("sensor.house_a"));
    expect(label(el)).toBe("kW");
    const seen = [];
    for (let i = 0; i < 4; i++) {
      await tap(el);
      seen.push(label(el));
    }
    expect(seen).toEqual(["Heute", "24 h", "Woche", "kW"]);
    const [ask] = metaAsks(asked);
    expect(ask.statistic_ids).toEqual(
      expect.arrayContaining([
        "sensor.solar",
        "sensor.import",
        "sensor.export",
        "sensor.out",
        "sensor.in",
        "sensor.house_a",
      ]),
    );
  });

  it("offers no energy by default when a main sensor has no statistics (QB-8)", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    MEANS["sensor.house_b"] = 1500;
    statless = new Set(["sensor.house_b"]);
    const { el } = await mount(plain("sensor.house_b"));
    expect(chip(el)).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("does not let a consumer without statistics stop the default (QB-8, EM-12)", async () => {
    MEANS["sensor.house_c"] = 1500;
    const { el } = await mount({
      ...plain("sensor.house_c"),
      consumers: [{ entity: "sensor.heat" }, { entity: "sensor.nostat" }],
    });
    expect(chip(el)).not.toBeNull();
  });

  it("holds the button's room while it checks and keeps a remembered period (QB-8)", async () => {
    MEANS["sensor.house_d"] = 1500;
    localStorage.setItem("enerlens-energy-period", "week");
    let release = () => {};
    holdMeta = new Promise<void>((r) => {
      release = r;
    });
    const { el } = await mount(plain("sensor.house_d"));
    expect(chip(el)?.classList.contains("waiting")).toBe(true);
    expect(chip(el)?.getAttribute("aria-hidden")).toBe("true");
    // As wide as the button will be: every label it may show is in it.
    const labels = [...(chip(el)?.querySelectorAll(".mode-label") ?? [])].map((l) => text(l));
    expect(labels).toEqual(["kW", "Heute", "24 h", "Woche"]);
    expect(localStorage.getItem("enerlens-energy-period")).toBe("week");
    release();
    holdMeta = undefined;
    await settle(el);
    expect(chip(el)?.classList.contains("waiting")).toBe(false);
    expect(label(el)).toBe("Woche");
  });

  it("asks again half a minute after a failed check (QB-8)", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    MEANS["sensor.house_f"] = 1500;
    failingMeta = 1;
    const { el, asked } = await mount(plain("sensor.house_f"));
    expect(chip(el)).toBeNull();
    vi.setSystemTime(NOW + 31_000);
    el.hass = fakeHass(asked);
    await settle(el);
    vi.setSystemTime(NOW);
    expect(metaAsks(asked)).toHaveLength(2);
    expect(chip(el)).not.toBeNull();
  });

  it("checks one set of sensors once for all cards, and not on every keystroke (QB-8)", async () => {
    MEANS["sensor.house_e"] = 1500;
    const { el, asked } = await mount(plain("sensor.house_e"));
    const second = await mount(plain("sensor.house_e"));
    el.setConfig({ ...plain("sensor.house_e"), title: "Typed" });
    await settle(el);
    expect(metaAsks(asked).length + metaAsks(second.asked).length).toBe(1);
  });

  it("asks nothing when the periods are set, and shows what is missing (QB-8)", async () => {
    const { el, asked } = await mount();
    expect(metaAsks(asked)).toHaveLength(0);
    expect(chip(el)).not.toBeNull();
  });

  it("shows a fixed period with no button and names it in the header (QB-3, QB-5)", async () => {
    const { el, asked } = await mount({
      ...CONFIG,
      consumers: [{ entity: "sensor.heat" }],
      view: { energy_periods: ["today"] },
    });
    expect(chip(el)).toBeNull();
    // Without power there is nothing to average: no smoothing button either.
    expect(el.shadowRoot?.querySelector(".view-chip")).toBeNull();
    // Named as energy: "Heute" alone said little (Markus 21.10.2026).
    expect(text(el.shadowRoot?.querySelector(".mode-note"))).toBe("Energie: Heute");
    expect(
      asked.filter((m) => m.type === "recorder/statistics_during_period").length,
    ).toBeGreaterThan(0);
    expect(text(node(el, "solar")?.querySelector(".value"))).toBe("24,0 kWh");
  });

  it("starts in the configured period and never shows power without it (QB-4, QB-2)", async () => {
    const { el } = await mount({
      ...CONFIG,
      view: { energy_periods: ["today", "month"], default_energy: "month" },
    });
    expect(label(el)).toBe("Monat");
    await tap(el);
    expect(label(el)).toBe("Heute");
    await tap(el);
    expect(label(el)).toBe("Monat");
  });

  it("shows a changed start period at once, whatever was remembered (QB-4)", async () => {
    localStorage.setItem("enerlens-energy-period", "kw");
    const { el } = await mount();
    expect(label(el)).toBe("kW");
    el.setConfig({ ...CONFIG, view: { ...CONFIG.view, default_energy: "month" } });
    await settle(el);
    expect(label(el)).toBe("Monat");
  });

  it("names only the period in the header when the mean is fixed (QB-5)", async () => {
    const { el } = await mount({
      ...CONFIG,
      view: { energy_periods: ["power", "today"], modes: ["avg_long"] },
    });
    expect(text(el.shadowRoot?.querySelector(".mode-note"))).toBe("Ø 15 min");
    await tap(el);
    expect(el.shadowRoot?.querySelector(".mode-note")).toBeNull();
  });
});
