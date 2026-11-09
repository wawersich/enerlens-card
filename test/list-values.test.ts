// @vitest-environment happy-dom
/**
 * Extra values in the list (REQ 2.21, LZ-1 to LZ-7, LZ-12, LZ-14): config,
 * the value lines below name and power, tooltips, the screen reader, the
 * energy mode - and rows without values exactly as before.
 */
import { render } from "lit";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChargeTracker } from "../src/charge";
import { collectExtraIds, normalizeConfig } from "../src/config";
import { buildBreakdown } from "../src/consumers";
import { planOf } from "../src/detail-dialog";
import { buildModel } from "../src/model";
import { renderList } from "../src/render/list";
import type { HomeAssistant, RawConfig } from "../src/types";

afterEach(() => vi.restoreAllMocks());

const ENTITIES = { solar: "sensor.solar", grid: "sensor.grid", house: "sensor.house" };
const UNITS: Record<string, string> = {
  "sensor.ww": "°C",
  "sensor.car": "%",
  "sensor.today": "kWh",
  // A text state: no unit.
  "sensor.program": "",
};

function hassWith(states: Record<string, string>): HomeAssistant {
  const all: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(states)) {
    const unit = id in UNITS ? UNITS[id] : id.startsWith("sensor.") ? "W" : undefined;
    all[id] = {
      entity_id: id,
      state,
      attributes: {
        ...(unit && state !== "unavailable" ? { unit_of_measurement: unit } : {}),
        friendly_name: id === "sensor.program" ? "Programm" : undefined,
      },
      last_changed: "2026-11-08T10:00:00Z",
      last_updated: "2026-11-08T10:00:00Z",
    };
  }
  return {
    states: all,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  } as HomeAssistant;
}

const config = (consumers: unknown[], extra: Record<string, unknown> = {}) =>
  normalizeConfig({
    type: "custom:enerlens-card",
    entities: ENTITIES,
    consumers,
    list: { enabled: true },
    ...extra,
  } as RawConfig);

const LIVE = {
  "sensor.solar": "0",
  "sensor.grid": "3000",
  "sensor.house": "3000",
  "sensor.wallbox": "2000",
  "sensor.pump": "600",
  "sensor.ww": "52",
  "sensor.car": "78",
  "sensor.today": "12.4",
  "sensor.program": "Spülen",
};

function draw(
  cfg: ReturnType<typeof config>,
  stacked = false,
  states: Record<string, string> = LIVE,
): HTMLElement {
  const tracker = new ChargeTracker();
  const hass = hassWith(states);
  tracker.observe(hass, cfg.consumers);
  const model = buildModel(hass, cfg, (e) => tracker.state(hass, e));
  const host = document.createElement("div");
  render(renderList(buildBreakdown(model, cfg), cfg, hass, vi.fn(), stacked), host);
  return host;
}

/**
 * The markup as the browser gets it: without lit's markers, white space
 * collapsed and class lists sorted - what the layout sees, not how the
 * template is indented.
 */
const markup = (host: HTMLElement) =>
  host.innerHTML
    .replace(/<!--[^>]*-->/g, "")
    .replace(
      /class="([^"]*)"/g,
      (_, c: string) => `class="${c.split(/\s+/).filter(Boolean).sort().join(" ")}"`,
    )
    .replace(/\s+/g, " ")
    .replace(/> </g, "><")
    .replace(/ style=""/g, "")
    .trim();

describe("rows without values stay as they were (LZ-2, LZ-14)", () => {
  // Captured before the values were built: a list without them is the same markup.
  const plain = config(
    [
      {
        entity: "sensor.wallbox",
        name: "Wallbox",
        icon: "mdi:ev-station",
        indicators: { ring: { entity: "sensor.car" }, idle_value: "ring" },
      },
      {
        entity: "sensor.pump",
        name: "Wärmepumpe",
        highlight: { band: true, bold: true },
        indicators: { bar_top: { entity: "sensor.ww", min: 40, max: 60 } },
      },
      { type: "rest", name: "Rest" },
    ],
    { list: { enabled: true, title: "Verbraucher" } },
  );

  it("beside the cross", () => {
    expect(markup(draw(plain))).toMatchSnapshot();
  });

  it("below the cross", () => {
    expect(markup(draw(plain, true))).toMatchSnapshot();
  });
});

const WALLBOX = {
  entity: "sensor.wallbox",
  name: "Wallbox",
  indicators: {
    values: [
      { entity: "sensor.today", prefix: " heute ", decimals: 1 },
      { entity: "sensor.car", prefix: "Auto" },
      { entity: "sensor.program" },
    ],
  },
};

describe("values in the config (LZ-1)", () => {
  it("reads entity, prefix and decimals; a block with values alone is extras", () => {
    const c = config([WALLBOX]);
    const extras = c.consumers[0].indicators;
    expect(extras?.slots).toEqual({});
    expect(extras?.inEnergy).toBe(true);
    expect(extras?.values).toEqual([
      { entity: "sensor.today", prefix: "heute", decimals: 1 },
      { entity: "sensor.car", prefix: "Auto", decimals: "ha" },
      { entity: "sensor.program", prefix: undefined, decimals: "ha" },
    ]);
  });

  it("takes a value without entity as a placeholder; skips what is no object or no list (LZ-15)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const c = config([
      { entity: "sensor.a", indicators: { values: [{}, "text", { entity: "sensor.today" }] } },
      { entity: "sensor.b", indicators: { values: "sensor.today" } },
      { entity: "sensor.c", indicators: { values: [] } },
    ]);
    expect(c.consumers[0].indicators?.values).toEqual([
      { entity: "", prefix: undefined, decimals: "ha" },
      { entity: "sensor.today", prefix: undefined, decimals: "ha" },
    ]);
    expect(c.consumers[1].indicators).toBeUndefined();
    expect(c.consumers[2].indicators).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("joins the old charge with values: the ring stays, no word about both (LZ-1, N-12)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const c = config([
      {
        entity: "sensor.wallbox",
        charge: { soc: "sensor.car" },
        indicators: { values: [{ entity: "sensor.today" }] },
      },
    ]);
    const extras = c.consumers[0].indicators;
    expect(extras?.slots.ring?.entity).toBe("sensor.car");
    expect(extras?.idleValue).toBe("ring");
    expect(extras?.inEnergy).toBe(true);
    expect(extras?.values).toEqual([{ entity: "sensor.today", prefix: undefined, decimals: "ha" }]);
    expect(warn).not.toHaveBeenCalled();
  });

  it("keeps the old ring next to an empty or broken value list, and its idle value (review)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (const values of [[], [{}]]) {
      const c = config([
        { entity: "sensor.wallbox", charge: { soc: "sensor.car" }, indicators: { values } },
      ]);
      expect(c.consumers[0].indicators?.slots.ring?.entity).toBe("sensor.car");
    }
    const idle = config([
      {
        entity: "sensor.wallbox",
        charge: { soc: "sensor.car" },
        indicators: { values: [{ entity: "sensor.today" }], idle_value: "power" },
      },
    ]);
    expect(idle.consumers[0].indicators?.idleValue).toBe("power");
    const said = warn.mock.calls.map((c) => String(c[0]));
    expect(said.some((t) => t.includes("idle_value") || t.includes("beide"))).toBe(false);
  });

  it("takes the rest's values too, and watches every value's entity (LZ-6)", () => {
    const c = config([
      WALLBOX,
      { type: "rest", indicators: { values: [{ entity: "sensor.ww", prefix: "Außen" }] } },
    ]);
    expect(c.rest?.indicators?.values?.[0].entity).toBe("sensor.ww");
    expect(collectExtraIds(c)).toEqual(
      expect.arrayContaining(["sensor.today", "sensor.car", "sensor.program", "sensor.ww"]),
    );
  });
});

describe("values in the row (LZ-2, LZ-7)", () => {
  const rowOf = (host: HTMLElement, key = "sensor.wallbox") =>
    host.querySelector(`.row[data-key="${key}"]`) as HTMLElement;

  it("draws them two per line, left under the name, right under the value", () => {
    const row = rowOf(draw(config([WALLBOX])));
    expect(row.classList.contains("with-values")).toBe(true);
    expect(row.style.getPropertyValue("--el-span")).toBe("3");
    const lines = [...row.querySelectorAll(".vline")];
    expect(lines).toHaveLength(2);
    const texts = lines.map((l) =>
      [...l.querySelectorAll(".xv")].map((x) => x.textContent?.replace(/\s+/g, " ").trim()),
    );
    expect(texts).toEqual([["heute 12,4 kWh", "Auto 78 %"], ["Spülen"]]);
    expect(lines[0].querySelector(".xv.left .xv-prefix")?.textContent).toBe("heute");
    expect(lines[0].querySelector(".xv.right")).not.toBeNull();
    expect(lines[1].querySelector(".xv.right")).toBeNull();
  });

  it("names each value in its tooltip and in the row's label", () => {
    const row = rowOf(draw(config([WALLBOX])));
    const tips = [...row.querySelectorAll(".xv")].map((x) => x.getAttribute("title"));
    expect(tips).toEqual(["heute: 12,4 kWh", "Auto: 78 %", "Programm: Spülen"]);
    expect(row.querySelector(".row-hit")?.getAttribute("aria-label")).toBe(
      "Wallbox 2,00 kW, heute 12,4 kWh, Auto 78 %, Programm Spülen",
    );
  });

  it("shows a dash for an unavailable value and keeps the prefix", () => {
    const row = rowOf(draw(config([WALLBOX]), false, { ...LIVE, "sensor.today": "unavailable" }));
    expect(row.querySelector(".xv.left")?.textContent?.replace(/\s+/g, " ").trim()).toBe("heute —");
  });

  it("marks the row with a bar at its bottom, so the bar gets room below the values", () => {
    const row = rowOf(
      draw(
        config([
          {
            ...WALLBOX,
            indicators: { ...WALLBOX.indicators, bar_bottom: { entity: "sensor.car" } },
          },
        ]),
      ),
    );
    expect(row.classList.contains("bar-bottom")).toBe(true);
  });

  it("tells a stacked list that it has values, so power and right values align right", () => {
    const host = draw(config([WALLBOX, { entity: "sensor.pump" }]), true);
    expect(host.querySelector(".list")?.classList.contains("has-values")).toBe(true);
    expect(draw(config([{ entity: "sensor.pump" }]), true).querySelector(".has-values")).toBeNull();
  });
});

describe("placeholders (LZ-15)", () => {
  const rowOf = (host: HTMLElement) => host.querySelector(".row") as HTMLElement;

  it("keeps the place and shows nothing: the value goes under the value column", () => {
    const row = rowOf(
      draw(
        config([
          {
            ...WALLBOX,
            indicators: { values: [{}, { entity: "sensor.today", prefix: "heute", decimals: 1 }] },
          },
        ]),
      ),
    );
    const lines = [...row.querySelectorAll(".vline")];
    expect(lines).toHaveLength(1);
    expect(lines[0].querySelector(".xv.left")).toBeNull();
    expect(lines[0].querySelector(".xv.right")?.textContent?.replace(/\s+/g, " ").trim()).toBe(
      "heute 12,4 kWh",
    );
    expect(row.querySelector(".row-hit")?.getAttribute("aria-label")).toBe(
      "Wallbox 2,00 kW, heute 12,4 kWh",
    );
  });

  it("takes an empty entry as a placeholder and refuses nothing at one (review)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const c = config([
      {
        ...WALLBOX,
        indicators: {
          values: [null, { decimals: "lots" }, { entity: 5 }, { entity: "sensor.car" }],
        },
      },
    ]);
    expect(c.consumers[0].indicators?.values?.map((v) => v.entity)).toEqual([
      "",
      "",
      "",
      "sensor.car",
    ]);
    // Only the entity that is no text is said.
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("counts a line of placeholders for the height, and draws it empty", () => {
    const row = rowOf(draw(config([{ ...WALLBOX, indicators: { values: [{}, {}, {}] } }])));
    expect(row.style.getPropertyValue("--el-span")).toBe("3");
    expect(row.querySelectorAll(".vline")).toHaveLength(2);
    expect(row.querySelectorAll(".xv")).toHaveLength(0);
  });

  it("watches no entity for a placeholder, draws no chart, opens no window of the rest", () => {
    const c = config([{ ...WALLBOX, indicators: { values: [{}, { entity: "sensor.car" }] } }]);
    expect(collectExtraIds(c)).not.toContain("");
    const plan = planOf(`consumer:${c.consumers[0].key}`, c, hassWith(LIVE));
    expect(plan.extras?.map((e) => e.entity)).toEqual(["sensor.car"]);
    const derived = { entities: { solar: "sensor.solar", grid: "sensor.grid" } };
    const rest = config([{ type: "rest", indicators: { values: [{}] } }], derived);
    expect(draw(rest).querySelector(".row.rest .row-hit")).toBeNull();
  });
});

describe("values and what they must not change (review)", () => {
  it("keeps the flag of a stacked list while its row with values is out of the list", () => {
    const c = config([{ ...WALLBOX, min_w: 5000 }, { entity: "sensor.pump" }]);
    const host = draw(c, true);
    expect(host.querySelector('.row[data-key="sensor.wallbox"]')).toBeNull();
    expect(host.querySelector(".list")?.classList.contains("has-values")).toBe(true);
  });

  it("keeps the bar's room in a period that hides the bar", () => {
    const energy = { roles: {}, consumers: {}, rest: { tier: 0 as const, note: "" } };
    const c = config([
      {
        ...WALLBOX,
        indicators: {
          ...WALLBOX.indicators,
          bar_bottom: { entity: "sensor.car" },
          in_energy: false,
        },
      },
    ]);
    const row = draw({ ...c, energy }).querySelector(".row") as HTMLElement;
    expect(row.classList.contains("bar-bottom")).toBe(true);
  });

  it("gives the values of a row that takes no tap no tap either", () => {
    const derived = { entities: { solar: "sensor.solar", grid: "sensor.grid" } };
    const c = config(
      [{ type: "rest", indicators: { values: [{ entity: "sensor.program" }] } }],
      derived,
    );
    expect(draw(c).querySelector(".row.rest .xv")?.classList.contains("tappable")).toBe(false);
    expect(
      draw(config([WALLBOX]))
        .querySelector(".xv")
        ?.classList.contains("tappable"),
    ).toBe(true);
  });
});

describe("values in the energy mode (LZ-5)", () => {
  const energy = { roles: {}, consumers: {}, rest: { tier: 0 as const, note: "" } };

  it("keeps them by default, 'now' in each tooltip", () => {
    const row = draw({ ...config([WALLBOX]), energy }).querySelector(".row") as HTMLElement;
    expect(row.classList.contains("values-hidden")).toBe(false);
    expect(row.querySelector(".xv")?.getAttribute("title")).toBe("heute: 12,4 kWh · jetzt");
  });

  it("keeps their room unseen where switched off, and leaves them out of the label", () => {
    const off = config([{ ...WALLBOX, indicators: { ...WALLBOX.indicators, in_energy: false } }]);
    const row = draw({ ...off, energy }).querySelector(".row") as HTMLElement;
    expect(row.classList.contains("values-hidden")).toBe(true);
    expect(row.querySelectorAll(".vline")).toHaveLength(2);
    expect(row.querySelector(".vline")?.getAttribute("aria-hidden")).toBe("true");
    expect(row.querySelector(".row-hit")?.getAttribute("aria-label")).not.toContain("heute");
  });
});

describe("the rest's window with values (LZ-7)", () => {
  it("opens with a calculated house only for a numeric value", () => {
    const derived = { entities: { solar: "sensor.solar", grid: "sensor.grid" } };
    const text = config(
      [{ type: "rest", indicators: { values: [{ entity: "sensor.program" }] } }],
      derived,
    );
    expect(draw(text).querySelector(".row.rest .row-hit")).toBeNull();
    const numeric = config(
      [{ type: "rest", indicators: { values: [{ entity: "sensor.ww" }] } }],
      derived,
    );
    expect(draw(numeric).querySelector(".row.rest .row-hit")).not.toBeNull();
  });
});

describe("values in the detail window (LZ-7)", () => {
  it("draws a chart for each value that is a number, none for words", () => {
    const c = config([WALLBOX]);
    const plan = planOf(`consumer:${c.consumers[0].key}`, c, hassWith(LIVE));
    expect(plan.extras?.map((e) => [e.entity, e.label, e.percent])).toEqual([
      ["sensor.today", "heute", false],
      ["sensor.car", "Auto", true],
    ]);
  });
});
