// @vitest-environment happy-dom
/**
 * The drawing's scale is the card's own (K-12, K-16): measured in the card's
 * CSS pixels, not on screen. Under a scaled ancestor - a dialog opening,
 * card-mod - the screen box is smaller than the card's layout; taken from
 * there, the circles came out too small while the lines still ran to where
 * the circles should be, and a gap opened between line and circle.
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { sizeFactors } from "../src/render/sizing";
import type { HomeAssistant } from "../src/types";
import { fakeMotion } from "./motion";

beforeAll(fakeMotion);

afterEach(() => vi.restoreAllMocks());

type Card = HTMLElement & {
  setConfig: (c: unknown) => void;
  hass: HomeAssistant;
  updateComplete: Promise<unknown>;
  _measure: () => boolean;
  _plotScale: number;
  requestUpdate: () => void;
};

const W = (id: string, w: number) => ({
  entity_id: id,
  state: String(w),
  attributes: { unit_of_measurement: "W" },
  last_changed: "",
  last_updated: "",
});

async function mount(): Promise<Card> {
  const el = document.createElement("enerlens-card") as Card;
  el.setConfig({
    type: "custom:enerlens-card",
    entities: { solar: "sensor.s", grid: "sensor.g", house: "sensor.h", battery: "sensor.b" },
  });
  el.hass = {
    states: {
      "sensor.s": W("sensor.s", 3000),
      "sensor.g": W("sensor.g", 500),
      "sensor.h": W("sensor.h", 2500),
      "sensor.b": W("sensor.b", -1000),
    },
    locale: { language: "de", number_format: "language" },
    language: "de",
    callWS: async () => ({}) as never,
  } as unknown as HomeAssistant;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** The plot: `screen` px wide on screen, its CSS width as `css` says. */
function measureAs(el: Card, screen: number, css: string): void {
  const plot = el.shadowRoot?.querySelector(".plot") as HTMLElement;
  vi.spyOn(plot, "getBoundingClientRect").mockReturnValue({
    width: screen,
    height: screen,
    left: 0,
    top: 0,
    right: screen,
    bottom: screen,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
  const real = window.getComputedStyle.bind(window);
  vi.spyOn(window, "getComputedStyle").mockImplementation((target, pseudo) => {
    const style = real(target, pseudo);
    if (target !== plot) return style;
    return new Proxy(style, { get: (s, key) => (key === "width" ? css : Reflect.get(s, key)) });
  });
}

describe("the drawing's scale", () => {
  beforeAll(async () => {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    await import("../src/enerlens-card");
  });

  it("comes from the card's own width, not the scaled screen box (K-16)", async () => {
    const el = await mount();
    // 400 px wide in the card, drawn at 80 % on screen.
    measureAs(el, 320, "400px");
    try {
      el._measure();
      expect(el._plotScale).toBeCloseTo(1);
      expect(el.style.getPropertyValue("--el-scale")).toBe("1");
      // A render measures the same way, and sizes the lines from it.
      el.requestUpdate();
      await el.updateComplete;
      expect(el._plotScale).toBeCloseTo(1);
      expect(el.style.getPropertyValue("--el-line-k")).toBe(
        sizeFactors(1, { dotSize: 100, lineWidth: 100 }).line.toFixed(4),
      );
    } finally {
      el.remove();
    }
  });

  it("without a layout width (hidden, no layout) the screen box stands in", async () => {
    const el = await mount();
    measureAs(el, 200, "auto");
    try {
      el._measure();
      expect(el._plotScale).toBeCloseTo(0.5);
    } finally {
      el.remove();
    }
  });
});
