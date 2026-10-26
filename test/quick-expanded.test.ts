// @vitest-environment happy-dom
/**
 * Quick buttons shown with all their values (REQ QB-9 to QB-14, issue #21):
 * the style for all of them, and per quick button "expand" - every value its
 * own button, a tap picks it directly.
 */
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { normalizeConfig } from "../src/config";
import type { HomeAssistant, RawConfig } from "../src/types";
import { fakeMotion } from "./motion";

beforeAll(fakeMotion);

function fakeHass(states: Record<string, string>): HomeAssistant {
  const entities: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(states)) {
    entities[id] = {
      entity_id: id,
      state,
      attributes: { unit_of_measurement: "W" },
      last_changed: "2026-10-25T10:00:00+00:00",
      last_updated: "2026-10-25T10:00:00+00:00",
    };
  }
  return {
    states: entities,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  };
}

const BASE = {
  type: "custom:enerlens-card",
  entities: {
    solar: [
      { entity: "sensor.roof", kwp: 8 },
      { entity: "sensor.balcony", kwp: 2 },
    ],
    grid: "sensor.grid",
    house: "sensor.house",
  },
  consumers: [{ entity: "sensor.heat" }],
  view: { energy_periods: ["power"] },
};
const STATES = {
  "sensor.roof": "3000",
  "sensor.balcony": "1000",
  "sensor.grid": "-500",
  "sensor.house": "3500",
  "sensor.heat": "800",
};

type Card = HTMLElement & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  shadowRoot: ShadowRoot | null;
};

async function mount(view: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) {
  const el = document.createElement("enerlens-card") as Card;
  el.setConfig({ ...BASE, ...extra, view: { ...BASE.view, ...view } });
  el.hass = fakeHass(STATES);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

beforeAll(async () => {
  (globalThis as unknown as Record<string, unknown>).ResizeObserver ??= class {
    observe() {}
    disconnect() {}
  };
  await import("../src/enerlens-card");
});

afterEach(() => {
  document.body.innerHTML = "";
  localStorage.clear();
});

const group = (el: Card, name: string) =>
  el.shadowRoot?.querySelector<HTMLElement>(`[role="radiogroup"][data-quick="${name}"]`) ?? null;
const radios = (g: HTMLElement | null) => [
  ...(g?.querySelectorAll<HTMLElement>('[role="radio"]') ?? []),
];
const checked = (g: HTMLElement | null) =>
  radios(g).findIndex((r) => r.getAttribute("aria-checked") === "true");

describe("configuration (QB-9, QB-10, QB-14)", () => {
  const read = (view: Record<string, unknown>) =>
    normalizeConfig({ ...BASE, view } as unknown as RawConfig).view;

  it("defaults: segment buttons, nothing expanded", () => {
    expect(read({})).toMatchObject({ quickStyle: "segment", expanded: [] });
  });

  it("the three styles; an unknown one warns and falls back", () => {
    for (const s of ["segment", "segment_compact", "single"]) {
      expect(read({ quick_style: s }).quickStyle).toBe(s);
    }
    expect(read({ quick_style: "round" }).quickStyle).toBe("segment");
  });

  it("expanded: a list, one text, doubles once, unknown names left out, empty = none", () => {
    expect(read({ expanded: ["modes", "pv_scales"] }).expanded).toEqual(["modes", "pv_scales"]);
    expect(read({ expanded: "energy_periods" }).expanded).toEqual(["energy_periods"]);
    expect(read({ expanded: ["scope", "scope"] }).expanded).toEqual(["scope"]);
    expect(read({ expanded: ["modes", "spin"] }).expanded).toEqual(["modes"]);
    for (const empty of [[], null, ""]) expect(read({ expanded: empty }).expanded).toEqual([]);
  });
});

describe("an expanded quick button on the card (QB-10, QB-13, QB-14)", () => {
  it("is a radio group with every value, the shown one checked", async () => {
    const el = await mount({ expanded: ["modes"] });
    const g = group(el, "modes");
    expect(g).not.toBeNull();
    expect(radios(g)).toHaveLength(3);
    expect(checked(g)).toBe(0);
    // The cycling chip is gone for this quick button.
    expect(el.shadowRoot?.querySelector(".view-chip")).toBeNull();
  });

  it("a tap picks the value directly; a tap on the checked one does nothing", async () => {
    const el = await mount({ expanded: ["modes"] });
    radios(group(el, "modes"))[2].click();
    await el.updateComplete;
    expect(checked(group(el, "modes"))).toBe(2);
    radios(group(el, "modes"))[2].click();
    await el.updateComplete;
    expect(checked(group(el, "modes"))).toBe(2);
  });

  it("arrow keys pick within the group; only the checked one is a tab stop", async () => {
    const el = await mount({ expanded: ["pv_scales"] });
    const g = group(el, "pv_scales");
    expect(radios(g).map((r) => r.tabIndex)).toEqual([0, -1]);
    radios(g)[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await el.updateComplete;
    expect(checked(group(el, "pv_scales"))).toBe(1);
  });

  it("the list scope: two symbols with their names", async () => {
    const el = await mount({ expanded: ["scope"] });
    const g = group(el, "scope");
    expect(radios(g).map((r) => r.getAttribute("aria-label"))).toEqual([
      "Gefiltert",
      "Vollständig",
    ]);
    expect(el.shadowRoot?.querySelector(".filter-toggle")).toBeNull();
    radios(g)[1].click();
    await el.updateComplete;
    expect(checked(group(el, "scope"))).toBe(1);
  });

  it("a quick button with one value stays absent, expanded or not (QB-3)", async () => {
    const el = await mount({ expanded: ["modes"], modes: ["current"] });
    expect(group(el, "modes")).toBeNull();
  });

  it("the group carries the quick button's name", async () => {
    const el = await mount({ expanded: ["modes"] });
    expect(group(el, "modes")?.getAttribute("aria-label")).toBe("Glättung");
  });

  it("the style is a class on the controls; collapsed buttons stay as they were", async () => {
    const el = await mount({ quick_style: "segment_compact" });
    expect(
      el.shadowRoot?.querySelector(".controls")?.classList.contains("qs-segment-compact"),
    ).toBe(true);
    expect(el.shadowRoot?.querySelector(".view-chip")).not.toBeNull();
  });

  it("changing style or expansion keeps the value shown (QB-14)", async () => {
    const el = await mount({ expanded: ["modes"] });
    radios(group(el, "modes"))[1].click();
    await el.updateComplete;
    el.setConfig({ ...BASE, view: { ...BASE.view, expanded: ["modes"], quick_style: "single" } });
    await el.updateComplete;
    expect(checked(group(el, "modes"))).toBe(1);
  });
});

describe("review follow-ups (QB-10, QB-14, V-12)", () => {
  it("the list scope's symbols carry a tooltip as well", async () => {
    const el = await mount({ expanded: ["scope"] });
    expect(radios(group(el, "scope")).map((r) => r.title)).toEqual(["Gefiltert", "Vollständig"]);
  });

  it("each PV scale has its own tooltip", async () => {
    const el = await mount({ expanded: ["pv_scales"] });
    const [share, peak] = radios(group(el, "pv_scales")).map((r) => r.title);
    expect(share).not.toBe("");
    expect(peak).not.toBe("");
    expect(share).not.toBe(peak);
  });

  it("a direct pick is remembered like a tap on the cycling button (V-12)", async () => {
    const first = await mount({ expanded: ["modes"], remember: true });
    radios(group(first, "modes"))[1].click();
    await first.updateComplete;
    first.remove();
    const again = await mount({ expanded: ["modes"], remember: true });
    expect(checked(group(again, "modes"))).toBe(1);
  });
});
