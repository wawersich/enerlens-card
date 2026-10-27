// @vitest-environment happy-dom
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import type { HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";

/*
 * Several PV sources on the card (REQ 2.17): the sum at the PV node, the ring
 * and its scale, the quick button, the partial sum, the corrected house.
 */

beforeAll(fakeMotion);

function fakeHass(states: Record<string, string>): HomeAssistant {
  const entities: HomeAssistant["states"] = {};
  for (const [id, state] of Object.entries(states)) {
    entities[id] = {
      entity_id: id,
      state,
      attributes: { unit_of_measurement: "W" },
      last_changed: "2026-10-24T10:00:00+00:00",
      last_updated: "2026-10-24T10:00:00+00:00",
    };
  }
  return {
    states: entities,
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  };
}

const SOURCES = [
  { entity: "sensor.roof", name: "Dach", kwp: 8 },
  { entity: "sensor.balcony", name: "Balkon", kwp: 2 },
];

const STATES = {
  "sensor.roof": "3000",
  "sensor.balcony": "1000",
  "sensor.grid": "-500",
  "sensor.house": "3500",
};

type Card = HTMLElement & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  shadowRoot: ShadowRoot | null;
};

async function mount(
  extra: Record<string, unknown> = {},
  states: Record<string, string> = STATES,
): Promise<Card> {
  const el = document.createElement("enerlens-card") as Card;
  el.setConfig({
    type: "custom:enerlens-card",
    entities: { solar: SOURCES, grid: "sensor.grid", house: "sensor.house" },
    ...extra,
  });
  el.hass = fakeHass(states);
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

const segments = (el: Card) =>
  [...(el.shadowRoot?.querySelectorAll(".node.solar svg.ring circle.ring-seg") ?? [])].map(
    (c) => (c as SVGElement).dataset.key,
  );

describe("PV ring and scale on the card (PV-4 to PV-6)", () => {
  it("shows the sum at the PV node and a ring of the sources in its place of the border", async () => {
    const el = await mount();
    const node = el.shadowRoot?.querySelector(".node.solar") as HTMLElement;
    expect(node.textContent).toContain("4,00 kW");
    expect(node.classList.contains("has-ring")).toBe(true);
    expect(node.style.borderColor).toBe("transparent");
    expect(segments(el).sort()).toEqual(["sensor.balcony", "sensor.roof"]);
  });

  it("the house ring stays the house's own - no PV segment in it", async () => {
    const el = await mount();
    expect(el.shadowRoot?.querySelector(".node.house circle[data-key='sensor.roof']")).toBeNull();
  });

  it("the PV node opens the detail window: no one entity stands behind the sum (PV-10, DF-13)", async () => {
    const el = await mount();
    const seen: { more: string[]; nodes: string[] } = { more: [], nodes: [] };
    el.addEventListener("hass-more-info", (ev) =>
      seen.more.push((ev as CustomEvent).detail.entityId),
    );
    el.addEventListener("show-dialog", (ev) =>
      seen.nodes.push((ev as CustomEvent).detail.dialogParams.node),
    );
    (el.shadowRoot?.querySelector(".node.solar .hit") as HTMLButtonElement).click();
    expect(seen).toEqual({ more: [], nodes: ["solar"] });
  });

  it("a quick button steps 100 % -> % kWp, and % kWp adds the free grey part", async () => {
    const el = await mount();
    const chip = el.shadowRoot?.querySelector(".pv-scale-chip") as HTMLButtonElement;
    expect(chip).toBeTruthy();
    expect(chip.querySelector(".mode-label.active")?.textContent).toBe("100 %");
    expect(segments(el)).not.toContain("__pv_free__");
    chip.click();
    await el.updateComplete;
    expect(chip.querySelector(".mode-label.active")?.textContent).toBe("% kWp");
    expect(segments(el)).toContain("__pv_free__");
  });

  it("the quick buttons stand in order: smoothing, power/energy, PV scale, list scope", async () => {
    const el = await mount({
      consumers: [{ entity: "sensor.heat" }],
      view: { energy_periods: ["power", "today"] },
    });
    const controls = el.shadowRoot?.querySelector(".header .controls") as HTMLElement;
    const order = [...controls.children].map((c) =>
      c.classList.contains("pv-scale-chip")
        ? "pv"
        : c.classList.contains("energy-chip")
          ? "energy"
          : c.classList.contains("filter-toggle")
            ? "scope"
            : "smoothing",
    );
    expect(order).toEqual(["smoothing", "energy", "pv", "scope"]);
  });

  it("no button with one scale; a fixed scale is not named in the header (PV-6)", async () => {
    const el = await mount({ view: { pv_scales: ["peak"] } });
    expect(el.shadowRoot?.querySelector(".pv-scale-chip")).toBeNull();
    expect(el.shadowRoot?.querySelector(".header")?.textContent ?? "").not.toContain("kWp");
    expect(segments(el)).toContain("__pv_free__");
  });

  it("remembers the scale per card (V-12)", async () => {
    const first = await mount({ memory_id: "pv1" });
    (first.shadowRoot?.querySelector(".pv-scale-chip") as HTMLButtonElement).click();
    await first.updateComplete;
    first.remove();
    const again = await mount({ memory_id: "pv1" });
    expect(again.shadowRoot?.querySelector(".pv-scale-chip .mode-label.active")?.textContent).toBe(
      "% kWp",
    );
  });

  it("ring.solar: false - no ring, no button, the border as before", async () => {
    const el = await mount({ ring: { solar: false } });
    expect(segments(el)).toEqual([]);
    expect(el.shadowRoot?.querySelector(".pv-scale-chip")).toBeNull();
  });
});

describe("partial sum and corrected house (PV-2, PV-3)", () => {
  it("a corrected house says 'calculated' and still opens its entity", async () => {
    const el = await mount({
      entities: {
        solar: [SOURCES[0], { ...SOURCES[1], house: "excluded" }],
        grid: "sensor.grid",
        house: "sensor.house",
      },
    });
    const house = el.shadowRoot?.querySelector(".node.house") as HTMLElement;
    expect(house.textContent).toContain("berechnet");
    expect(house.textContent).toContain("4,50 kW");
    expect(house.querySelector(".hit:not([disabled])")).toBeTruthy();
  });

  it("a source gone while delivering: the PV value amber, named in its tooltip", async () => {
    const el = await mount();
    el.hass = fakeHass({ ...STATES, "sensor.balcony": "unavailable" });
    await el.updateComplete;
    const value = el.shadowRoot?.querySelector(".node.solar .value") as HTMLElement;
    expect(value.classList.contains("warn2")).toBe(true);
    expect(value.title).toContain("Balkon");
  });

  it("a source quiet before it went (night): no mark", async () => {
    const el = await mount({}, { ...STATES, "sensor.balcony": "2" });
    el.hass = fakeHass({ ...STATES, "sensor.balcony": "unavailable" });
    await el.updateComplete;
    const value = el.shadowRoot?.querySelector(".node.solar .value") as HTMLElement;
    expect(value.classList.contains("warn2")).toBe(false);
  });
});

describe("PV rows on the card (PV-7, PV-8)", () => {
  const pvKeys = (el: Card) =>
    [...(el.shadowRoot?.querySelectorAll(".pv-rows .row") ?? [])].map(
      (r) => (r as HTMLElement).dataset.key,
    );

  it("off by default: existing boards look as before", async () => {
    const el = await mount({ consumers: [{ entity: "sensor.heat" }] });
    expect(el.shadowRoot?.querySelector(".pv-rows")).toBeNull();
  });

  it("list.solar: the sources above the consumers, sorted by power", async () => {
    const el = await mount(
      { consumers: [{ entity: "sensor.heat" }], list: { solar: true } },
      {
        ...STATES,
        "sensor.heat": "800",
      },
    );
    expect(pvKeys(el)).toEqual(["sensor.roof", "sensor.balcony"]);
    const list = el.shadowRoot?.querySelector(".list") as HTMLElement;
    const blocks = [...list.children].map((c) => c.className);
    expect(blocks.indexOf("pv-rows")).toBeLessThan(blocks.indexOf("rows"));
  });

  it("without consumers too, list.enabled aside (PV-7)", async () => {
    const el = await mount({ list: { solar: true } });
    expect(pvKeys(el)).toEqual(["sensor.roof", "sensor.balcony"]);
    expect(el.shadowRoot?.querySelector(".rows")).toBeNull();
    expect(el.shadowRoot?.querySelector(".body.no-list")).toBeNull();
  });

  it("a quiet source only with the filter lifted (PV-8)", async () => {
    const el = await mount({ list: { solar: true } }, { ...STATES, "sensor.balcony": "3" });
    expect(pvKeys(el)).toEqual(["sensor.roof"]);
  });

  it("a row opens its source", async () => {
    const el = await mount({ list: { solar: true } });
    let opened = "";
    el.addEventListener("hass-more-info", (e) => {
      opened = (e as CustomEvent).detail.entityId;
    });
    (el.shadowRoot?.querySelector(".pv-rows .row .row-hit") as HTMLButtonElement).click();
    expect(opened).toBe("sensor.roof");
  });
});

describe("square, solar left: the PV rows left of the drawing (REQ AN-3)", () => {
  const CONSUMERS = [{ entity: "sensor.house", name: "Rest" }];
  const order = (el: Card) =>
    [...(el.shadowRoot?.querySelector(".body")?.children ?? [])]
      .map((c) => ["pv-side", "cross", "list"].find((k) => c.classList.contains(k)))
      .filter(Boolean);

  it("beside the drawing: PV rows on the left, the consumers on the right", async () => {
    const el = await mount({ layout: "square_left", list: { solar: true }, consumers: CONSUMERS });
    expect(order(el)).toEqual(["pv-side", "cross", "list"]);
    const root = el.shadowRoot as ShadowRoot;
    expect(root.querySelectorAll(".pv-side .pv-rows .row")).toHaveLength(2);
    expect(root.querySelector(".list:not(.pv-side) .pv-rows")).toBeNull();
  });

  it("the other arrangements keep both lists on the right", async () => {
    for (const layout of ["cross", "square_right", "triangle", "triangle_battery"]) {
      const el = await mount({ layout, list: { solar: true }, consumers: CONSUMERS });
      expect(el.shadowRoot?.querySelector(".pv-side")).toBeNull();
      expect(el.shadowRoot?.querySelectorAll(".list .pv-rows .row")).toHaveLength(2);
      el.remove();
    }
  });

  it("battery centre: the battery's label on its ground, not the house's; the triangle's width cap (AN-1, AN-5)", async () => {
    const el = await mount(
      {
        layout: "triangle_battery",
        entities: {
          solar: SOURCES,
          grid: "sensor.grid",
          house: "sensor.house",
          battery: "sensor.battery",
        },
      },
      { ...STATES, "sensor.battery": "-300" },
    );
    const root = el.shadowRoot as ShadowRoot;
    expect(root.querySelector(".node.battery")?.classList.contains("label-ground")).toBe(true);
    expect(root.querySelector(".node.house")?.classList.contains("label-ground")).toBe(false);
    expect(root.querySelector(".body")?.classList.contains("layout-triangle-battery")).toBe(true);
    el.remove();
  });

  it("too narrow: both lists below, PV rows above the consumers", async () => {
    const el = await mount({ layout: "square_left", list: { solar: true }, consumers: CONSUMERS });
    (el as unknown as { _stacked: boolean })._stacked = true;
    (el as unknown as { requestUpdate(): void }).requestUpdate();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector(".pv-side")).toBeNull();
    const list = el.shadowRoot?.querySelector(".list.stacked") as HTMLElement;
    expect(list.firstElementChild?.classList.contains("pv-rows")).toBe(true);
    // Below means below: the consumers may not climb back beside the drawing.
    expect(el.shadowRoot?.querySelector(".body")?.classList.contains("force-below")).toBe(true);
  });

  it("only PV rows, no consumer list: still on the left", async () => {
    const el = await mount({ layout: "square_left", list: { solar: true, enabled: false } });
    expect(order(el)).toEqual(["pv-side", "cross"]);
  });
});
